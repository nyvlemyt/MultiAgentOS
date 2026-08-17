import type { Mission } from '@mas/db';

// C1 — statut vérité. Même doctrine que computeProjectHealth (lib/health.ts) :
// calculé AU MOMENT DE LA LECTURE, aucune table, aucun LLM, `now` injecté.
// Stocker ce calcul recréerait exactement le mensonge qu'il corrige.
//
// Le statut en base est un DÉCLARÉ. La vérité se déduit des faits observables.
// Un fait ABSENT (null) ne produit jamais de vérité : il produit 'unknown', qui
// n'est jamais un désync (contrat C12, null ≠ zéro).

export type MissionStatus = Mission['status'];

export type MissionTruth =
  | 'unknown'
  | 'active'
  | 'stalled'
  | 'awaiting_human'
  | 'blocked'
  | 'needs_attention'
  | 'halted_budget';

export interface MissionFacts {
  missionId: string;
  declared: MissionStatus;
  /** null = aucun event pour cette mission → fait ABSENT (pas « inactive »). */
  lastEventAt: Date | null;
  taskCount: number;
  blockedTaskCount: number;
  pendingValidationCount: number;
  /** null = aucun plafond déclaré → fait ABSENT (pas « budget OK »). */
  budgetExceeded: boolean | null;
  /**
   * null = fait ABSENT. La colonne `reports.verdict` arrive avec C3
   * (docs/backlog/contrat-rapport-mission.md) ; jusque-là le collecteur renvoie
   * null en dur. La règle ci-dessous est déjà écrite et testée.
   */
  reportVerdict: 'PASS' | 'NEEDS_WORK' | 'BLOCK' | null;
}

export interface Reconciliation {
  declared: MissionStatus;
  computed: MissionTruth;
  desynced: boolean;
  /** Phrase française expliquant l'écart. null quand il n'y a pas d'écart. */
  reason: string | null;
}

/**
 * Au-delà de ce silence, une mission déclarée en vol est considérée à l'arrêt.
 * 10 min et pas 60 s : les events sortent aux transitions de tâche
 * (packages/agents/src/dispatch.ts:384,690), pas à chaque tick worker — un appel
 * LLM long laisse légitimement la mission muette plusieurs minutes. Un seuil
 * court fabriquerait de faux désyncs sur un worker vivant. La détection rapide
 * reviendra avec le heartbeat dédié (v2).
 */
export const STALE_AFTER_MS = 10 * 60_000;

/** Vérités compatibles avec chaque statut déclaré. Hors de cet ensemble = désync. */
const COMPATIBLE: Record<MissionStatus, ReadonlySet<MissionTruth>> = {
  draft: new Set(['unknown', 'active', 'stalled']),
  clarified: new Set(['unknown', 'active', 'stalled']),
  planned: new Set(['unknown', 'active', 'stalled']),
  dispatched: new Set(['unknown', 'active']),
  executing: new Set(['unknown', 'active']),
  review: new Set(['unknown', 'active', 'awaiting_human']),
  validated: new Set(['unknown', 'active', 'stalled']),
  archived: new Set(['unknown', 'active', 'stalled']),
  blocked: new Set(['unknown', 'stalled', 'blocked', 'awaiting_human', 'halted_budget', 'needs_attention']),
};

function computeTruth(f: MissionFacts, now: Date, staleAfterMs: number): MissionTruth {
  if (f.budgetExceeded === true) return 'halted_budget';
  if (f.reportVerdict === 'BLOCK') return 'blocked';
  if (f.blockedTaskCount > 0) return 'blocked';
  if (f.pendingValidationCount > 0) return 'awaiting_human';
  if (f.reportVerdict === 'NEEDS_WORK') return 'needs_attention';
  if (f.lastEventAt === null) return 'unknown';
  const ageMs = now.getTime() - f.lastEventAt.getTime();
  return ageMs > staleAfterMs ? 'stalled' : 'active';
}

function reasonFor(truth: MissionTruth, f: MissionFacts, now: Date): string {
  switch (truth) {
    case 'halted_budget':
      return `budget de la mission dépassé alors qu'elle est déclarée « ${f.declared} »`;
    case 'blocked':
      return f.reportVerdict === 'BLOCK'
        ? `le dernier rapport de mission porte le verdict BLOCK (déclaré « ${f.declared} »)`
        : `${f.blockedTaskCount} tâche(s) bloquée(s) alors que la mission est déclarée « ${f.declared} »`;
    case 'awaiting_human':
      return `${f.pendingValidationCount} validation(s) en attente alors que la mission est déclarée « ${f.declared} »`;
    case 'needs_attention':
      return `le dernier rapport de mission porte le verdict NEEDS_WORK (déclaré « ${f.declared} »)`;
    case 'stalled': {
      const minutes = f.lastEventAt === null ? 0 : Math.floor((now.getTime() - f.lastEventAt.getTime()) / 60_000);
      return `aucune activité depuis ${minutes} min alors que la mission est déclarée « ${f.declared} »`;
    }
    case 'active':
      return `activité en cours alors que la mission est déclarée « ${f.declared} »`;
    default:
      return '';
  }
}

/**
 * Confronte le statut déclaré aux faits. Fonction PURE : aucune I/O, `now` et le
 * seuil sont injectés — donc entièrement testable sans base.
 */
export function reconcileMissionStatus(
  facts: MissionFacts,
  now: Date,
  staleAfterMs: number = STALE_AFTER_MS,
): Reconciliation {
  const computed = computeTruth(facts, now, staleAfterMs);
  const desynced = !COMPATIBLE[facts.declared].has(computed);
  return {
    declared: facts.declared,
    computed,
    desynced,
    reason: desynced ? reasonFor(computed, facts, now) : null,
  };
}

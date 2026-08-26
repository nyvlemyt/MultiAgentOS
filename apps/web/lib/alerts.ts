import { z } from 'zod';
import type { BudgetPause, PendingValidation } from './autopilot';
import type { MissionTruth, Reconciliation } from './mission-truth';

// C12 — contrat d'alertes du cockpit (docs/backlog/statut-verite-reconciliation.md,
// pattern P15 de docs/audits/otakugo/A2-patterns-cockpit.md).
//
// Contrat P15 : {quoi, pourquoi, action} + route + sévérité, les trois phrases
// obligatoires. Identifiants anglais (convention du dépôt), copie affichée en
// français : quoi = what · pourquoi = why · action = action.
//
// RÈGLE DURE : aucun fait ⇒ aucune alerte. Un constructeur de famille renvoie
// `null` quand la donnée est ABSENTE, jamais une alerte d'absence — null ≠ zéro.

export const AlertSchema = z.object({
  what: z.string().trim().min(1),
  why: z.string().trim().min(1),
  action: z.string().trim().min(1),
  route: z.string().trim().startsWith('/'),
  severity: z.enum(['info', 'warning', 'danger']),
});

export type Alert = z.infer<typeof AlertSchema>;
export type AlertSeverity = Alert['severity'];

/** Seul constructeur légal d'une alerte. Jette si le contrat n'est pas tenu. */
export function makeAlert(input: unknown): Alert {
  const parsed = AlertSchema.safeParse(input);
  if (parsed.success) return parsed.data;
  const detail = parsed.error.issues.map((i) => `${i.path.join('.') || '(racine)'}: ${i.message}`).join(' · ');
  throw new Error(`alerte invalide (contrat C12) — ${detail}`);
}

const WINDOW_LABEL: Record<BudgetPause['window'], string> = {
  day: 'journalier',
  week: 'hebdomadaire',
  month: 'mensuel',
};

/** Seuil d'alerte du budget projet, en pourcentage consommé. */
export const PROJECT_BUDGET_WARN_PCT = 90;

/** Famille 1 — dispatch en pause quota (remplace BudgetPauseBanner). */
export function budgetPauseAlert(pause: BudgetPause | null): Alert | null {
  if (pause === null) return null; // aucun fait ⇒ aucune alerte
  return makeAlert({
    what: `Quota ${WINDOW_LABEL[pause.window]} atteint — le dispatch est en pause.`,
    why: "Aucune tâche ne partira tant que le plafond n'est pas relevé.",
    action: 'Relève le plafond dans Jetons, puis relance la mission.',
    route: '/tokens',
    severity: 'danger',
  });
}

/**
 * Au-delà de cette attente, une validation en pause n'est plus une latence
 * humaine normale (café, réunion) : c'est un oubli, et la mission est gelée sans
 * que personne le sache. Depuis l'option B (`mission-truth.ts` COMPATIBLE), une
 * pause au gate §5 n'est plus un « désynchronisé » — l'âge est donc LE signal, et
 * la famille 2 en est seule propriétaire.
 */
export const VALIDATION_STALE_AFTER_MS = 60 * 60_000;

type PendingWait = Pick<PendingValidation, 'risk' | 'requestedAt'>;

/** Plus longue attente mesurable. `null` = aucun `requestedAt` connu (fait absent). */
function oldestWaitMs(pending: readonly PendingWait[], now: Date): number | null {
  const waits = pending
    .map((p) => p.requestedAt)
    .filter((d): d is Date => d !== null)
    .map((d) => Math.max(0, now.getTime() - d.getTime()));
  return waits.length === 0 ? null : Math.max(...waits);
}

/** « 45 min », « 3 h », « 2 j » — la maille juste suffisante pour décider. */
function waitLabel(ms: number): string {
  const minutes = Math.floor(ms / 60_000);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  return hours < 24 ? `${hours} h` : `${Math.floor(hours / 24)} j`;
}

/** Famille 2 — validations humaines en attente (§5 : le gate ne se contourne pas). */
export function pendingValidationsAlert(
  pending: readonly PendingWait[],
  now: Date = new Date(),
  staleAfterMs: number = VALIDATION_STALE_AFTER_MS,
): Alert | null {
  if (pending.length === 0) return null; // zéro réel : la requête a tourné, rien n'attend
  const blocking = pending.filter((p) => p.risk === 'high' || p.risk === 'blocking').length;
  const oldest = oldestWaitMs(pending, now);
  const stale = oldest !== null && oldest > staleAfterMs;
  // Sous la minute, la durée est du bruit : on tait le libellé, pas le fait.
  const waited = oldest !== null && oldest >= 60_000 ? ` La plus ancienne attend depuis ${waitLabel(oldest)}.` : '';
  return makeAlert({
    what: `${pending.length} validation(s) en attente, dont ${blocking} à risque élevé.${waited}`,
    why: stale
      ? 'La mission est gelée depuis un moment : rien n’avance tant que tu ne tranches pas.'
      : 'Les tâches concernées sont arrêtées tant que tu ne tranches pas.',
    action: 'Ouvre « À traiter » sur le Centre de commande et approuve ou rejette.',
    route: '/',
    severity: blocking > 0 || stale ? 'danger' : 'warning',
  });
}

/**
 * Famille 3 — budget projet. `usedPct === null` = AUCUN plafond déclaré :
 * fait absent, donc aucune alerte (et surtout pas « 0 % consommé »).
 */
export function projectBudgetAlert(usedPct: number | null, route: string): Alert | null {
  if (usedPct === null) return null;
  if (usedPct < PROJECT_BUDGET_WARN_PCT) return null;
  return makeAlert({
    what: `Budget du projet consommé à ${usedPct} %.`,
    why: 'Les prochaines missions seront mises en pause au dépassement (CLAUDE.md §6).',
    action: 'Relève le plafond du projet ou archive les missions terminées.',
    route,
    severity: 'warning',
  });
}

const DESYNC_COPY: Record<Exclude<MissionTruth, 'unknown'>, { why: string; action: string; severity: AlertSeverity }> = {
  active: {
    why: 'La mission tourne alors que le cockpit la dit à l’arrêt.',
    action: 'Ouvre la mission et remets son statut au vrai.',
    severity: 'warning',
  },
  stalled: {
    why: 'Le cockpit affiche un avancement qui n’existe plus (worker arrêté ou tâche perdue).',
    action: 'Relance le worker, ou repasse la mission en « planned » pour la redispatcher.',
    severity: 'warning',
  },
  awaiting_human: {
    why: 'Une décision t’attend sans que le statut le dise — personne n’avance.',
    action: 'Traite la validation en attente sur le Centre de commande.',
    severity: 'danger',
  },
  blocked: {
    why: 'Du travail est bloqué alors que la mission se dit en bonne voie.',
    action: 'Ouvre la mission, débloque la tâche ou passe la mission en « blocked ».',
    severity: 'danger',
  },
  needs_attention: {
    why: 'Le dernier rapport demande une reprise ; le statut ne le reflète pas.',
    action: 'Relis le rapport de mission et relance la boucle de revue.',
    severity: 'warning',
  },
  halted_budget: {
    why: 'La mission a mangé son budget : rien ne repartira tout seul (CLAUDE.md §6).',
    action: 'Relève le budget de la mission ou clôture-la.',
    severity: 'danger',
  },
};

/** Famille 4 — écart entre statut déclaré et faits observés (C1). */
export function missionDesyncAlert(missionId: string, r: Reconciliation): Alert | null {
  if (!r.desynced || r.computed === 'unknown' || r.reason === null) return null;
  const copy = DESYNC_COPY[r.computed];
  return makeAlert({
    what: `Désynchronisé — ${r.reason}.`,
    why: copy.why,
    action: copy.action,
    route: `/missions/${missionId}`,
    severity: copy.severity,
  });
}

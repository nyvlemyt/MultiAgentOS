import { z } from 'zod';
import type { BudgetPause, PendingValidation } from './autopilot';

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

/** Famille 2 — validations humaines en attente (§5 : le gate ne se contourne pas). */
export function pendingValidationsAlert(pending: readonly Pick<PendingValidation, 'risk'>[]): Alert | null {
  if (pending.length === 0) return null; // zéro réel : la requête a tourné, rien n'attend
  const blocking = pending.filter((p) => p.risk === 'high' || p.risk === 'blocking').length;
  return makeAlert({
    what: `${pending.length} validation(s) en attente, dont ${blocking} à risque élevé.`,
    why: 'Les tâches concernées sont arrêtées tant que tu ne tranches pas.',
    action: 'Ouvre « À traiter » sur le Centre de commande et approuve ou rejette.',
    route: '/',
    severity: blocking > 0 ? 'danger' : 'warning',
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

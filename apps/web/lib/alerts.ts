import { z } from 'zod';

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

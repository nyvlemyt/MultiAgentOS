// Mock deliverable reports. When the real LLM/execution engine is wired, these
// come from the agent run (data/outputs/<task>.md + the produced diff). For now
// a deterministic mock so the report UI is real and ready.

export type Deliverable = {
  title: string;
  humanMd: string; // rich, human-facing report (Markdown)
  diff: string; // unified diff produced by the agent
  aiReport: string; // compact machine-facing report for the next agent/LLM
};

const FALLBACK: Deliverable = {
  title: 'Rapport de mission',
  humanMd: `# Ce qui a été fait

**Objectif** : améliorer l'expérience du feed quand il est vide.

## Étapes
- Survey de 5 empty-states best-in-class
- Choix des skills + agents Tier B
- Maquette UX validée
- Composant \`EmptyState\` implémenté
- Revue de sécurité + relecture

## Résultat
Le feed vide affiche maintenant un message clair + un CTA. \`+38\` lignes, \`-4\`.

> Démo — contenu simulé tant que le moteur LLM n'est pas branché.`,
  diff: `--- a/components/Feed.tsx
+++ b/components/Feed.tsx
@@ -12,6 +12,9 @@ export function Feed({ items }) {
-  if (items.length === 0) return null;
+  if (items.length === 0) {
+    return <EmptyState title="Aucun manga ici" cta="Explorer" />;
+  }
   return <ul>{items.map(renderItem)}</ul>;`,
  aiReport: `{"mission":"polish-feed-empty-state","status":"review","filesTouched":["components/Feed.tsx","components/EmptyState.tsx"],"linesAdded":38,"linesRemoved":4,"nextStep":"await human validation before merge","risk":"low"}`,
};

export function mockDeliverable(_missionId: string): Deliverable {
  return FALLBACK;
}

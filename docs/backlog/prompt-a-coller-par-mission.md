# Backlog — prompt à coller par mission (C4)

**Statut** : À FAIRE — noyau lot 1, Phase 9, **après** `contrat-rapport-mission.md` et
`reprise-universelle-next-action.md`. **Source** : `docs/audits/otakugo/A2-patterns-cockpit.md` (P6).
**Décision d'intake** : `implement_now` · T1 — `docs/intake/2026-08-14-cartes-a2-otakugo.md` §3.

## Le problème

MAOS n'a **aucune issue de secours**. Si le worker ou le SDK tombe — ou simplement en autonomie
`manual` — aucune mission n'est exportable : le travail s'arrête. Le cockpit OtakuGO termine chaque
fiche par un prompt autonome (protocole + contexte + garde-fous + définition de « fini ») qui a
réellement lancé ses 34 missions à la main.

## Ce que MAOS a déjà (vérifié 2026-08-14)

- Absent. `apps/web/lib/mission-script.ts`, `manager-script.ts` et `agent-script.ts` sont des
  **mocks de conversation** (réponses déterministes pour l'UI), pas des exporteurs de prompt.
- `apps/web/lib/templates.ts` est de la donnée de projet, sans rapport.

## Le travail

1. **Générer le prompt depuis la même source que le prompt réellement envoyé par le worker** —
   pas depuis un template jumeau. C'est le point qui fait vivre la carte : un exporteur qui a sa
   propre copie du prompt dérive de la réalité en trois sprints et devient un piège.
2. **Deux sorties** : prompt de **lancement** et prompt de **reprise** (consomme la `nextAction` de
   C10). Les deux imposent le contrat de rapport (C3) et injectent les garde-fous §5 pertinents.
3. **Bloc copiable** dans le détail mission de l'UI + lien `vscode://file/` vers le projet.

## Critère de sortie (binaire)

- [ ] Sur 1 mission réelle de test : coller le prompt généré dans une session Claude Code vierge
      (hors MAOS) produit l'exécution de la 1re tâche **et** un rapport au format C3 — vérifié une
      fois, tracé dans le rapport de la carte.
- [ ] Le bloc est présent pour **100 %** des missions `planned+`.
- [ ] Le prompt exporté et le prompt envoyé par le worker proviennent du même builder (test :
      modifier le builder change les deux).
- [ ] 5 checks verts (`pnpm -r test` · lint · build · smoke · Sonar exit 0).

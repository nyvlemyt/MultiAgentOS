# Backlog — reprise universelle (`next_action`) (C10)

**Statut** : À FAIRE — noyau lot 1, Phase 9. **Source** : `docs/audits/otakugo/A2-patterns-cockpit.md` (P13).
**Décision d'intake** : `implement_now` · T1 — `docs/intake/2026-08-14-cartes-a2-otakugo.md` §3.

## Le problème

Une session MAOS qui meurt en cours de tâche ne laisse **aucune consigne de reprise**.
`conversations` / `messages` gardent l'historique — c'est de l'archéologie, pas une instruction.
Le reprenant doit relire pour deviner où il en était, et se trompe.

Le cockpit OtakuGO survit à la mort de session depuis 34 missions : « PROCHAINE ACTION SUR REPRISE »
écrite à **chaque** étape, plus un prompt universel « continue à la première tâche non DONE »,
y compris sous forme lisible par machine.

## Ce que MAOS a déjà (vérifié 2026-08-14)

- `next_action` est **absent du runtime**. Les seules occurrences sont dans
  `packages/skills/library/agent-harness-construction/SKILL.md` — le principe dort déjà dans notre
  arsenal froid (« toute réponse d'outil = `status` + `summary` + `next_actions` + `artifacts` »),
  jamais câblé.
- `packages/agents/src/dispatch-tick.ts` est le point de passage de tout changement d'état de tâche.

## Le travail

1. **Colonne `tasks.nextAction`** (+ migration), écrite par `dispatch-tick.ts` à **chaque**
   changement d'état de tâche.
2. **Règle de fiche worker** : ne jamais terminer un pas sans `nextAction` à jour — la session peut
   mourir n'importe quand.
3. **Bouton « Reprendre »** dans l'UI mission : re-dispatch à la première tâche non `done`, avec la
   `nextAction` en tête de prompt.
4. **Lien explicite avec le contrat de rapport** : la section « Prochaine étape recommandée » du
   rapport de mission lit la `nextAction` de la première tâche non done. Même fait à deux
   granularités → une seule vérité, jamais deux.
5. Appliquer enfin la forme d'observation du skill `agent-harness-construction`
   (`status` + `summary` + `next_actions` + `artifacts`).

## Critère de sortie (binaire)

- [ ] Test d'intégration : tuer le worker en milieu de mission → relancer → la mission **reprend à
      la première tâche non done sans intervention ni perte**.
- [ ] Le prompt de reprise contient la `nextAction`.
- [ ] Aucun changement d'état de tâche ne laisse `nextAction` vide (test sur le tick).
- [ ] 5 checks verts (`pnpm -r test` · lint · build · smoke · Sonar exit 0).

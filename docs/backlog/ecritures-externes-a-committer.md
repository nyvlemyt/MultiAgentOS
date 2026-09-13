# Backlog — écritures externes en attente (C9)

**Statut** : À FAIRE — noyau lot 1, Phase 9. **Source** : `docs/audits/otakugo/A2-patterns-cockpit.md` (P11 + P16).
**Décision d'intake** : `implement_now` · T1 — `docs/intake/2026-08-14-cartes-a2-otakugo.md` §3.

## Le problème

« Jamais de commit automatique » est une doctrine chez MAOS (CLAUDE.md §5), mais elle n'a **aucune
surface**. Quand un agent a produit une modification dans un projet externe, rien ne le montre :
il faut aller voir dans le projet. C'est exactement le filet qui manque sous l'idée de piloter un
projet extérieur depuis le cockpit.

Le cockpit OtakuGO l'a résolu : un bandeau « à committer » plus un message de commit conventionnel
**préparé et jamais exécuté**.

## Ce que MAOS a déjà (vérifié 2026-08-14)

- **Zéro** `git status` dans `apps/` et `packages/` (grep = 0).
- Mais `packages/agents/src/sandbox-diff.ts` — `validateDiffApplies` écrit le diff dans un fichier
  temporaire et lance `git apply --check` dans le dépôt cible : **non mutant**, ne jette jamais.
- Et `packages/agents/src/review-gate.ts` conditionne l'approbation à `diffValid`.
- `reports.diff` stocke déjà le diff produit.

**Conséquence importante** : le modèle MAOS est **diff-first**, pas working-tree-first. La carte ne
doit donc pas construire un lecteur d'arbre de travail, mais exposer ce que MAOS produit déjà.

## Le travail

1. **Panneau « écritures en attente »** du projet actif : liste des diffs validés et non appliqués
   (source `reports.diff` + `validateDiffApplies`), fichier par fichier.
2. **Message de commit conventionnel préparé** — copiable, **jamais exécuté**.
3. **Portique CI** de la famille `scripts/lint-no-sdk-payg.sh` : aucun chemin de code sous `apps/`
   ou `packages/` n'invoque `git commit` / `git push` sur un path de projet externe.
4. **Reprendre P16** : l'identité de la cible (le `path` du projet actif) re-vérifiée **à chaque**
   écriture du worker, pas une fois au démarrage.

## Critère de sortie (binaire)

- [ ] Modifier 2 fichiers d'un projet externe de test via une mission → le panneau les liste avec
      la commande de commit préparée.
- [ ] Portique CI : exit 0 sur le repo, exit 1 sur un fixture qui viole la règle (testé vert → rouge → vert).
- [ ] Aucune exécution de commit par MAOS — absence prouvée par le portique, pas par relecture.
- [ ] 5 checks verts (`pnpm -r test` · lint · build · smoke · Sonar exit 0).

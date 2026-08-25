# Backlog — vérification indépendante ternaire (C11)

**Statut** : À FAIRE — lot 2, Phase 9. **VERROU** : livrée **avant** le premier merge d'un projet
externe exécuté par le worker MAOS.
**Source** : `docs/audits/otakugo/A2-patterns-cockpit.md` (P14, couplage P5↔C11 relevé par le checker A2 F9).
**Décision d'intake** : `adapt_now` · T1 — `docs/intake/2026-08-14-cartes-a2-otakugo.md` §3.
**Dépend de** : `contrat-rapport-mission.md` (le contrôle diff-déclaré lit sa section « Fichiers touchés »).

## Le problème

Nos critiques jugent **sur lecture d'artefacts**. Ils lisent le rapport, le diff, les descriptions
de tâches — et concluent. Personne ne **re-exécute** ce que le rapport affirme. Un rapport qui dit
« les 439 tests passent » est cru sur parole.

Le cockpit OtakuGO exige plus dur avant merge : re-exécution réelle de chaque affirmation, cas
adversariaux fabriqués, et un verdict **ternaire par point** (PROUVÉ / RÉFUTÉ / NON VÉRIFIABLE)
écrit dans un fichier. Preuve que la méthode nous manque : les checkers de notre propre pipeline
d'audit OtakuGO l'ont fait **à la main**, faute d'outil.

## Ce que MAOS a déjà (vérifié 2026-08-14)

- `packages/agents/src/reviewers.ts` — 4 critiques réels (reviewer, sec-reviewer, quality-controller,
  agent-evaluator), chacun chargeant sa fiche Tier A, avec un `COVERAGE_PROMPT` recall-first.
- `packages/agents/src/review-phase.ts` — séquence QC → boucle sec sur high/blocking → reviewer sur
  la dernière tâche → Agent-Evaluator **advisory**.
- `packages/agents/src/review-gate.ts` — approbation conditionnée à `diffValid` (via
  `sandbox-diff.ts`, `git apply --check` non mutant) + exigence d'un test cité.
- `.claude/skills/mas-reviewer/SKILL.md` — verdict **global** {PASS, NEEDS_WORK, BLOCK} et une
  checklist de 6 contrôles, mais **ni ternaire par point, ni re-exécution obligatoire**.

## Le travail

**Ne pas ajouter un 5e critique.** La séquence en compte déjà 4 ; un de plus, c'est du coût sans
signal neuf. On ajoute un **mode** à celui qui existe.

1. **Mode « vérification indépendante »** dans `.claude/skills/mas-reviewer/SKILL.md`, déclenché sur
   missions `risk ≥ medium` ou touchant un projet externe :
   - **Contrôle diff-déclaré d'abord** : `git diff --name-status <base>..<tip>` doit correspondre
     exactement à la section « Fichiers touchés » du rapport C3. Les deux bouts existent déjà.
   - **≥ 5 affirmations re-exécutées**, chacune avec commande **et** extrait de sortie collé.
   - **Verdict ternaire par point** : PROUVÉ / RÉFUTÉ / NON VÉRIFIABLE. Le verdict global reste
     {PASS, NEEDS_WORK, BLOCK} — pas de nouvelle énumération.
   - **≥ 1 cas fabriqué** (défaut planté) pour vérifier que le contrôle détecte vraiment.
   - **Règle comparative** : toute affirmation du type « c'est plus rapide / mieux qu'avant » exige
     de matérialiser la version d'avant (`git show <sha>:fichier`) et d'exécuter **les deux** sur le
     **corpus complet**, jamais un échantillon.
2. **Le vérificateur reste strictement read-only** (doctrine `mas-reviewer` conservée). Un RÉFUTÉ
   borné repart au producteur pour **une** passe de correction puis re-check ; un RÉFUTÉ non borné
   bloque et remonte à Melvyn. Le vérificateur ne corrige jamais lui-même.
3. **Sortie persistée** via `reports` (colonne `verdict` de C3).

## Critère de sortie (binaire)

- [ ] Sur 1 mission réelle : le verdict produit contient le contrôle diff-déclaré + **≥ 5 points
      ternaires** avec commande et extrait chacun + **≥ 1 cas fabriqué**.
- [ ] Toute affirmation comparative du rapport a été testée en exécutant les deux versions.
- [ ] Un point RÉFUTÉ force un verdict ≠ PASS (test).
- [ ] **Zéro fichier de l'objet vérifié modifié par le vérificateur** (test).
- [ ] Le skill passe la relecture CLAUDE.md §12 (sections lifecycle complètes, `summary:` L1 + corps L2).
- [ ] 5 checks verts (`pnpm -r test` · lint · build · smoke · Sonar exit 0).

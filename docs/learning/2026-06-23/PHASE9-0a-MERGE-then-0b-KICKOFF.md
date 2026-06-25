# Phase 9 — Merge 0a (#35 → #36) puis lancement 0b (handoff)

> **But de ce fichier.** Préparer, sans l'exécuter, le prompt à coller dans la session de construction (Claude Code, abonnement, sous-agents) pour : (1) **fusionner les deux lots 0a dans `main`** — #35 *puis* #36, dans cet ordre obligatoire — et (2) **enchaîner sur l'Étape 0b** (vrai pipeline doer/checker). Le **runbook de merge** (§3–§4) est la version détaillée ; le **relay prompt** (§6) est la version compacte, prête à coller, qui fait les deux d'affilée.

---

## 1. État réel (vérifié le 2026-06-23)

- **`main`** est à **#34** (`803ecbb` = `#33`, `b8cc102` = `#34`). **Ni #35 ni #36 ne sont mergés.**
- **PR #35 = `phase/9a-memory`** — **mémoire de base 0a** (pont savoir→mémoire, index FTS persistant, wikilinks Obsidian, note manuelle, `memory_items` tranchée). **12 commits** au-dessus de `main`. Checker-verdict = **PASS**.
- **PR #36 = `phase/9a2-qmd-arsenal`** (branche courante) — **0a renforcée** (QMD derrière `MemoryRetriever`, 3 collections `mas-knowledge`/`mas-memory`/`mas-arsenal`, recherche projet, MCP, harnais d'éval). **DRAFT**, **4 commits** au-dessus de `phase/9a-memory`. Checker-verdict = **PASS** (5 checks verts + Sonar exit 0).

> **Le fait structurant : #36 est empilé sur #35** (sa base est `phase/9a-memory`, **pas** `main`). D'où l'ordre **#35 puis #36** — et la nécessité de **re-cibler la base de #36 sur `main`** une fois #35 fusionné.

## 2. Pré-condition — le working tree est sale (à traiter AVANT tout merge)

`git status` sur `phase/9a2-qmd-arsenal` montre **une modif non commitée de `CLAUDE.md`** : l'ajout du **§14 « Style de communication & rapports »** (la préférence utilisateur). C'est une doctrine **voulue** (elle est déjà active), mais **non commitée** — donc le tree n'est pas propre, et un merge ne doit jamais partir d'un tree sale.

- **Action** : la committer **d'abord**, seule, sur `phase/9a2-qmd-arsenal` → elle entre dans #36.
  Commit : `docs(claude): §14 style de communication (préférence utilisateur)`.
- Puis `git push` sur `origin/phase/9a2-qmd-arsenal` pour que l'origine corresponde avant les merges.
- C'est un changement **docs-only** : Sonar doit rester exit 0 (re-vérifier quand même au point §3.4).

## 3. Runbook de merge #35 → `main`

> Rappel garde-fou (`ROADMAP.md`, règle de branchement) : **fusionner dans `main` exige l'accord explicite de l'utilisateur**. Cet accord est **donné pour ces deux PR précises (#35, #36)** et **rien d'autre** — il **ne couvre pas** la suppression de branche, le force-push, ni aucune autre écriture sur `main` (qui restent gated §5).

1. Se mettre à jour : `git fetch origin`. Vérifier que `origin/phase/9a-memory` est bien le tip de #35.
2. **Re-vérifier les 5 checks** sur le tip de `phase/9a-memory` (le verdict est PASS, mais §7 impose la re-vérif au merge) :
   `pnpm -r test` · `pnpm lint` · `pnpm build` · `pnpm --filter @mas/web smoke`.
3. **Marquer #35 « ready »** puis **merger #35 dans `main`** (via GitHub pour préserver le lien `(#35)` : `gh pr merge 35 --merge`). Pas de fast-forward auto, pas d'auto-merge silencieux.
4. **Sonar post-merge** : après le push sur `main`, **poller jusqu'à ce que l'analyse du sha HEAD de `main` arrive**, puis `scripts/sonar-pr-issues.sh` / gate `projectStatus == OK`. Exit 0 sinon corriger (§7).
5. **NE PAS supprimer `phase/9a-memory`** : c'est encore la base de #36, et la suppression de branche est gated (§5).

## 4. Runbook de merge #36 → `main` (après #35)

1. **Re-cibler la base de #36 sur `main`** : `gh pr edit 36 --base main`. Désormais le diff de #36 vs `main` = les **4 commits QMD** (+ le commit docs §14). (Si GitHub a auto-reciblé #36 en mergeant #35, vérifier simplement que la base affichée est bien `main`.)
2. `git fetch origin`. Comme `phase/9a2-qmd-arsenal` **contient déjà** tout `phase/9a-memory`, le merge dans `main` doit être **propre** (aucun conflit attendu). En cas de conflit, le résoudre au minimum (ne rien réécrire).
3. **Re-vérifier les 5 checks** sur le tip de `phase/9a2-qmd-arsenal` + **Sonar PR #36 exit 0** (post-recible).
4. **Marquer #36 « ready »** puis **merger #36 dans `main`** (`gh pr merge 36 --merge`).
5. **Sonar post-merge** sur le nouveau sha HEAD de `main` → gate OK / exit 0.
6. **NE PAS supprimer les branches** (`phase/9a-memory`, `phase/9a2-qmd-arsenal`) — gated §5, laisser l'utilisateur décider.

## 5. Post-merge (clôture 0a)

- `git checkout main && git pull` → confirmer que `main` contient bien **0a base + 0a renforcée**.
- **Mettre à jour `ROADMAP.md`** : marquer **Étape 0a (base #35 + renforcée #36) ✅ mergée dans `main` le 2026-06-23**.
- (Option) note de clôture courte dans `docs/learning/2026-06-23/`.
- **Puis enchaîner sur 0b** (§6).

## 6. Relay prompt — à coller dans la session de construction

> Reprends **MultiAgentOS**, **Phase 9 · Exploitation & Auto-construction**. Lis d'abord `CLAUDE.md` (surtout §5 actions risquées, §7 « fait = 5 checks + Sonar exit 0 », §11 abonnement-only, §12/§13 savoir & pré-vol), la section **Phase 9** de `ROADMAP.md`, et ce handoff `docs/learning/2026-06-23/PHASE9-0a-MERGE-then-0b-KICKOFF.md`.
>
> **Partie A — Fusionner les deux lots 0a dans `main`, dans l'ordre #35 PUIS #36.** J'autorise explicitement **ces deux merges précis** (et rien d'autre : pas de suppression de branche, pas de force-push — ça reste gated §5).
> 1. **Pré-condition** : `CLAUDE.md` a une modif non commitée (le §14 « Style de communication »). Committe-la seule sur `phase/9a2-qmd-arsenal` (`docs(claude): §14 style de communication`), puis `git push`. Le tree doit être propre avant tout merge.
> 2. **#35** (`phase/9a-memory`, mémoire de base) : re-joue les 5 checks sur son tip, marque la PR « ready », **merge dans `main`** (`gh pr merge 35 --merge`), puis poll Sonar sur le HEAD de `main` jusqu'à gate OK / exit 0. **Ne supprime pas la branche** (#36 en dépend encore).
> 3. **#36** (`phase/9a2-qmd-arsenal`, 0a renforcée — QMD/arsenal) : **re-cible sa base sur `main`** (`gh pr edit 36 --base main`), re-joue les 5 checks + Sonar PR #36 exit 0, marque « ready », **merge dans `main`** (`gh pr merge 36 --merge`), poll Sonar sur le nouveau HEAD de `main`. **Ne supprime aucune branche** (gated §5).
> 4. `git checkout main && git pull`, confirme que `main` contient 0a base + renforcée, puis mets à jour `ROADMAP.md` : **Étape 0a (#35 + #36) ✅ mergée le 2026-06-23**.
>
> **Partie B — Lance l'Étape 0b · Vrai pipeline doer/checker** (sortir du « prompt unique » + gardes mock).
> **Pré-vol (§13)** : intake-audit ciblé 0b + lis `docs/knowledge/prompting-anthropic.md` (surtout 104-110, prompt de revue), `agent-patterns.md` (boucle évaluateur-optimiseur), `production-patterns.md` (boucles bornées / retries), `anthropic-ecosystem.md:164-170`. Méthode : `docs/learning/AUTONOMOUS-PIPELINE.md`.
> **Périmètre 0b (coutures exactes)** :
> - `packages/core/src/llm.ts` : remplacer `mockReviewer` / `mockCodeReviewer` / `mockSecReviewer` / `mockQualityController` / `mockRealityChecker` par une **délégation réelle aux fiches** (`reviewer` / `sec-reviewer` sonnet-4-6, `quality-controller`).
> - `packages/agents/src/dispatch.ts` : **boucle évaluateur-optimiseur** dans `runDelegatedTask` (~513-563) — un verdict `NEEDS_WORK`/`BLOCK` **ré-invoque le producteur** (`delegateWithDiff`) avec les findings injectés, **bornée** par `maxReviewIterations` (2-3) + budget tâche ; **Reality Checker réel** (~501) : calculer diff-applique / tests-cités / diff-couvre-la-demande au lieu de `evidence:false` codé en dur ; `runReviewPhase` (~327-390).
> - **Self-verify producteur** : avant la garde, le doer lance `validateDiffApplies` + lint/test et révise **une fois** (`packages/agents/src/review-gate.ts`, garder le `validateDiffApplies` réel).
> - **Chaînage de prompts** : passer les sorties amont (`last_message`) aux tâches dépendantes (DAG déjà là : `selectRunnableTasks` / `dependsOnJson`, ~318-325 ; manque le passage de contexte).
> **Garde-fous** : §5 (risqué gated), §11 (jamais `@anthropic-ai/sdk`), §12 (consulter `docs/knowledge/` avant tout artefact agent), §8 (Memory Keeper seul scripteur), budgets.
> **Méthode & « fait »** : branche `phase/9b-pipeline`, **doer/checker en sous-agents**, **PR DRAFT** (c'est moi qui merge). « Fait » = **5 checks verts + Sonar exit 0** ; lis `docs/knowledge/sonar-recurring-rules.md` avant d'écrire le code.
> **Critère de sortie 0b** : une tâche s'exécute **producteur → vrai critique → sur NEEDS_WORK, boucle de correction bornée** ; **plus aucun critique mock** dans le chemin runtime ; les tâches dépendantes **reçoivent le contexte amont**.
>
> **Arrête-toi au critère de sortie 0b et demande mon GO explicite avant 0c.** Budget : `standard`, pause + rapport à 80 %.

---

### Annexe — pourquoi cet ordre et ces garde-fous

- **#35 avant #36** : #36 est empilé sur #35. Merger #36 en premier tirerait quand même les 12 commits de #35 (puisqu'ils y sont) mais casserait la traçabilité PR et le lien de base ; l'ordre respecte la pile.
- **Re-cibler #36 sur `main`** : tant que sa base reste `phase/9a-memory`, GitHub calcule son diff contre l'ancienne base. Après merge de #35, on veut un diff propre contre `main` (= les 4 commits QMD).
- **Pas de suppression de branche** : §5 la classe action gated, et supprimer `phase/9a-memory` avant le merge de #36 orphelinerait sa base.
- **Re-vérif Sonar au merge** : §7 — le gate vert ne suffit pas, il faut `scripts/sonar-pr-issues.sh <pr>` **exit 0** (0 issue ouverte, 0 hotspot à revoir) sur le sha effectivement mergé.

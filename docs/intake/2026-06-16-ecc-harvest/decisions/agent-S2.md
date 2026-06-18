# ECC Harvest — décisions agents lot `S2` (Phase C, singletons)

Doer: lot agents-S2 (7 agents singletons). Worktree `maos-ecc` (branche `phase/ecc-harvest`). Méthode: `intake-audit` complet par agent, barre LARGE (Phase C, Tier B library).
Source ECC: `affaan-m/ecc` (MIT). Cible: `packages/agents/library/<name>.md` (format fiche MAOS).
Dedup HARD contre `packages/agents/fiches/` (7 fiches Tier A), `.claude/agents/` (Tier B existants : `engineering-code-reviewer`, `engineering-technical-writer`, `testing-*`), et `packages/skills/library/` (notamment `e2e-testing`, `gan-style-harness`, `documentation-lookup`, `hookify-rules`, `agent-harness-construction`, `code-tour`).
Recadrage transverse (§5/§11) : tout chiffre $/€ → unités de quota d'abonnement ; exec externe / egress tiers (Agent Browser global install, `npx` non-épinglé, `madge`/`jsdoc2md` réseau, MCP Playwright vers hôtes hors allowlist) strippé ou scopé sandbox. ≤7 tools/agent respecté. Sanitize secrets/PII : 7/7 sources clean ; `@anthropic-ai/sdk` absent des sources.

Les 7 agents sont des **exécutants spécialisés** : tier B (callable functions du dispatcher), jamais d'appel Tier A→Tier A (AGENTS.md §11). Les 3 paires/trios (`gan-evaluator`/`gan-generator`, + `gan-planner` dans un autre lot) sont jugés comme arsenal du domaine génération-app/image : gardés car forts dans leur domaine, adossés au skill `gan-style-harness` déjà ingéré (la doctrine vit dans le skill, les rôles concrets dans les fiches).

---

## comment-analyzer
- **décision**: adopt
- **raison**: agent read-only qui audite la *couche commentaires* (exactitude vs implémentation, rot, dette TODO/FIXME/HACK) — angle absent de nos surfaces. Le Reviewer lit les diffs, le Quality Controller le processus ; aucun ne spécialise la véracité des commentaires. Cadre exactement CLAUDE.md §7 (« no comments unless WHY non-obvious »).
- **dedup**: non — pas de dup contre `reviewer`/`quality-controller` (fiches) ni `engineering-code-reviewer` (Tier B) : périmètre commentaire-only, advisory-only.
- **chemin library**: `packages/agents/library/comment-analyzer.md`
- **état**: fiche écrite au format MAOS. tier B, sonnet, 3 tools (Read/Grep/Glob → `fs_write:false`, `shell:false`, `network:false`). Prompt Defense Baseline + Principles (commentaire source) + Process + Red Flags + Verification présents. 0 sdk, 0 secret, ≤7 tools.

## conversation-analyzer
- **décision**: adopt
- **raison**: agent méta read-only qui mine les transcripts pour repérer les misbehaviors récurrents et propose des règles hookify — boucle d'auto-amélioration absente de notre roster. Complète le skill `hookify-rules` (qui *écrit* les règles) en fournissant l'amont (quoi guarder, sur quelle preuve).
- **dedup**: non — `hookify-rules` (skill) rédige la règle ; ici on l'identifie depuis l'historique. Aucun agent existant n'analyse les sessions. Cadrage §5 explicite : hookify = couche warn defense-in-depth, jamais le hard gate.
- **chemin library**: `packages/agents/library/conversation-analyzer.md`
- **état**: fiche écrite. tier B, sonnet, 2 tools (Read/Grep). Advisory-only (`fs_write:false`) — n'écrit jamais settings.json/permissions.json. Prompt Defense Baseline + Principles (source) + Process + Red Flags + Verification présents. 0 sdk, 0 secret, ≤7 tools.

## doc-updater
- **décision**: adapt
- **raison**: spécialiste codemaps + docs in-repo générées depuis le code (entry points, modules, data flow, freshness). Delta non-dup : `engineering-technical-writer` (Tier B) écrit de la prose ; ici c'est génération de cartes d'architecture from source-of-truth. Recadrage §5 lourd : strip `npx madge`/`jsdoc2md` (egress réseau) → `network:false`, lecture du tree local uniquement ; writes scopés à la surface docs du sandbox.
- **dedup**: partiel — chevauche `engineering-technical-writer` sur la prose mais le garde car le delta codemaps/AST-from-source est distinct ; recadré pour ne pas re-doublonner (favorite_skill `documentation-lookup` + `code-tour`).
- **chemin library**: `packages/agents/library/doc-updater.md`
- **état**: fiche écrite. tier B, **haiku** (routine, comme demandé). 6 tools (Read/Write/Edit/Bash/Grep/Glob) → `fs_write:scoped`, `shell:scoped`, `network:false`. Prompt Defense Baseline + Principles (source) + Process + Red Flags + Verification présents. 0 sdk, 0 secret, ≤7 tools.

## docs-lookup
- **décision**: adapt
- **raison**: exécutant qui résout+interroge un MCP docs-live (Context7) pour répondre aux questions lib/framework/API avec exemples à jour, anti-injection sur output MCP. Delta non-dup : le skill `documentation-lookup` porte la doctrine ; ici c'est le rôle agent routine qui l'exécute (haiku, comme demandé pour le routinier).
- **dedup**: partiel — adossé au skill `documentation-lookup` (même origine ECC) qu'il consomme ; recadré pour ne pas dupliquer la doctrine, juste l'incarner en agent. Distinct du `Researcher` (web général).
- **chemin library**: `packages/agents/library/docs-lookup.md`
- **état**: fiche écrite. tier B, **haiku**. 4 tools (Read/Grep/2 outils Context7 MCP). `network:scoped` — MCP read-only docs, autorisé seulement si l'hôte est sur `config/permissions.json#allowed_hosts` (§5) ; sinon escalate. `@anthropic-ai/sdk` absent. Prompt Defense Baseline (incl. clause anti-injection sur docs fetchés) + Principles (source) + Process + Red Flags + Verification présents. 0 secret, ≤7 tools.

## e2e-runner
- **décision**: adapt
- **raison**: exécutant Playwright E2E (journeys POM, artefacts, quarantaine flaky) — sert directement le check `pnpm --filter @mas/web smoke` (CLAUDE.md §7). Le skill `e2e-testing` (déjà ingéré) porte la doctrine ; aucun *agent* ne lançait les tests. Recadrage §5 fort : strip Agent Browser global install + egress tiers + ports d'exemple paiement ; scope local-only, hôtes allowlist, jamais de flux argent réel.
- **dedup**: non sur l'agent — adossé au skill `e2e-testing` qu'il incarne ; distinct des `testing-*` Tier B (benchmark/reality-check/accessibility) qui ne pilotent pas de suite E2E.
- **chemin library**: `packages/agents/library/e2e-runner.md`
- **état**: fiche écrite. tier B, sonnet. 6 tools (Read/Write/Edit/Bash/Grep/Glob) → `fs_write:scoped`, `shell:scoped` (Playwright local), `network:false`. Exec §5-scopé : pas d'install globale, pas d'egress, escalate si flux paiement/trade (risk:blocking). Prompt Defense Baseline + Principles (source) + Process + Red Flags + Verification présents. 0 sdk, 0 secret, ≤7 tools.

## gan-generator
- **décision**: adopt
- **raison**: rôle Generator de la boucle adverse Generator⇄Evaluator — incarne le skill `gan-style-harness` (déjà ingéré, T1). Arsenal génération-app/haute-craft : construit depuis le spec, lit le feedback, itère sans s'auto-juger, anti-AI-slop. Fort dans son domaine → keep (pas niche).
- **dedup**: non — la doctrine vit dans le skill `gan-style-harness` ; la fiche est le rôle concret callable par le dispatcher. Trio GAN (avec `gan-planner` autre lot + `gan-evaluator`).
- **chemin library**: `packages/agents/library/gan-generator.md`
- **état**: fiche écrite. tier B, model **sonnet** (source = opus ; opus réservé § routing risk:high — la boucle est ~15× quota, gatée TOKEN_STRATEGY §8). 6 tools → `fs_write:scoped`, `shell:scoped` (dev server local), `network:false`. Recadrage §11 : pilotage via `packages/core/src/llm.ts`, pas de flag shell `--model`, pas de cash (quota units). Prompt Defense Baseline + Principles (source) + Process + Red Flags + Verification présents. 0 sdk, 0 secret, ≤7 tools.

## gan-evaluator
- **décision**: adopt
- **raison**: rôle Evaluator de la boucle — juge externe ruthlessly-strict (le cœur anti-self-praise du harness), score rubric pondéré, feedback à fix concrets sur l'app live locale. Incarne `gan-style-harness`. Fort dans son domaine → keep.
- **dedup**: non — distinct de `reviewer`/`quality-controller` (gates de mission) : ici juge de craft/design d'une boucle de génération, pas gate de pipeline. La doctrine = skill ; le rôle = fiche.
- **chemin library**: `packages/agents/library/gan-evaluator.md`
- **état**: fiche écrite. tier B, model **sonnet** (source = opus ; même raison de routing/quota que gan-generator). 6 tools (Read/Write/Bash/Grep/Glob + Edit pour feedback files) → `fs_write:scoped`, `shell:scoped`, `network:false`. Recadrage §5 : test app live **locale** uniquement, fallback code-only (build/test/lint) si pas de browser automation, pas d'egress tiers. §11 : `llm.ts`, quota units. Prompt Defense Baseline + Principles (source) + Process + Red Flags + Verification présents. 0 sdk, 0 secret, ≤7 tools.

---

## Bilan lot S2
- **adopt**: comment-analyzer, conversation-analyzer, gan-generator, gan-evaluator (4)
- **adapt**: doc-updater, docs-lookup, e2e-runner (3)
- **fold/reject**: aucun
- **Keepers**: 7/7 (barre LARGE Phase C ; tous forts en domaine, deltas non-dup, recadrés §5/§11). Aucun KILL déclenché.
- Re-audit: au prochain phase-gate self-audit, ou si `affaan-m/ecc` publie une révision majeure de ces agents (> 6 mois de stale), ou si un check `pnpm lint`/registry rejette un champ de fiche.



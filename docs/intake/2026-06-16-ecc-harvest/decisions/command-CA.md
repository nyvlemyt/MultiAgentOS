# ECC Harvest — décisions commandes (lot CA, 46 commandes)

Doer: lot commandes CA (46). Worktree `maos-ecc`. Méthode: dedup-map d'abord (CLUSTERS.md §commandes + `our-assets-index.md`), puis `intake-audit` uniquement sur les WORKFLOW génériques qu'on N'a PAS.
Source ECC: `affaan-m/ecc` (MIT), bodies dans `/tmp/ecc-inspect/commands/<name>.md`. Cible des adoptés: `.claude/commands/<name>.md` (exemplar format = `security-review.md`).
Recadrage transverse: MAOS = abonnement (§11) → tout chiffre = unités de quota, jamais $/€; état MAOS sous `data/` (§8); actions destructrices/egress restent human-gated (§5).

Taxonomie:
- **WRAPPER** = appel mince sur un agent/skill qu'on possède déjà (langage-reviewers, build-resolvers, marketing-campaign skill, notre reviewer) → SKIP, pas de fichier.
- **DUP / install-specific** = machinerie de gestion du harness ECC (scripts `github-coordination.js`, `harness-audit.js`, CLI instinct `continuous-learning-v2`, hooks ECC, `npx ecc-universal`) ou déjà-nôtre → SKIP.
- **WORKFLOW** = flux multi-étapes générique-produit qu'on LACK → `intake-audit`, adopter si retenu.

Bilan: **2 adoptés** (`aside`, `checkpoint`) sur 46. Tout le reste = WRAPPER, DUP/install-specific, ou unsafe/externe.

---

## aside
- **tag**: WORKFLOW
- **décision**: adopt
- **raison**: wrapper de question-de-côté read-only (gèle l'état tâche → répond → reprend) qu'on N'a pas. Pure cognition, zéro write/exec/egress. Recadré §5: tool gate `Read/Glob/Grep/LS` seulement (pas d'Edit/Write/Bash/réseau), redirection "changement de direction" vers le mission flow.
- **chemin**: `.claude/commands/aside.md`

## auto-update
- **tag**: DUP / install-specific
- **décision**: reject
- **raison**: pull + réinstall des cibles managées ECC — pure gestion d'install du harness ECC, sans objet pour MAOS.

## build-fix
- **tag**: WRAPPER
- **décision**: reject
- **raison**: enveloppe build-resolver générique (détecte build system, fixe erreurs) — couvert par notre template `build-resolver` harvesté dans `packages/agents/library/`.

## checkpoint
- **tag**: WORKFLOW
- **décision**: adopt
- **raison**: marque/compare des points sûrs pendant un build (log + verify delta) — on n'a pas de commande de checkpoint. Recadré: ancré sur le **gate 5-checks** (§7), log sous `data/checkpoints.log` (§8), aucune op destructrice (reset/force-push/delete branch restent §5 human-gated), pas d'auto-commit.
- **chemin**: `.claude/commands/checkpoint.md`

## code-review
- **tag**: WRAPPER / DUP
- **décision**: reject
- **raison**: revue locale+PR multi-phase — chevauche notre `mas-reviewer` (PASS/NEEDS_WORK/BLOCK) + `quality-controller` + la commande existante `security-review.md`. Le mode PR (gh review/publish) = egress + déjà couvert par notre flow. Dup-no-better.

## cost-report
- **tag**: WRAPPER / DUP (unsafe framing)
- **décision**: reject
- **raison**: lit `~/.claude-cost-tracker/usage.db` (DB externe HORS repo) et rapporte du `cost_usd` en $. Contredit §11 (abonnement, quota_units jamais $/€) et §8 (état sous `data/`). Jumeau exact du skill `cost-tracking` déjà rejeté (shard token-T1). Reporting d'usage = déjà via `events` + `/tokens`.

## cpp-build
- **tag**: WRAPPER
- **décision**: reject
- **raison**: invoque `cpp-build-resolver` — couvert par notre template `build-resolver`.

## cpp-review
- **tag**: WRAPPER
- **décision**: reject
- **raison**: invoque `cpp-reviewer` — couvert par notre template `language-reviewer`.

## cpp-test
- **tag**: WRAPPER
- **décision**: reject
- **raison**: workflow TDD C++ (GoogleTest/gcov) — spécifique langage; la doctrine TDD est déjà chez nous (`superpowers:test-driven-development`, CLAUDE.md §7). Pas de flux générique nouveau.

## ecc-guide
- **tag**: DUP / install-specific
- **décision**: reject
- **raison**: navigue la surface live du repo ECC (agents/skills/commands/hooks/profils) — méta-outil du harness ECC, sans objet pour MAOS.

## epic-claim
- **tag**: DUP / install-specific
- **décision**: reject
- **raison**: enveloppe `node scripts/github-coordination.js` (coordination d'issues GitHub propre à ECC) + egress GitHub. Machinerie de harness, pas un flux générique.

## epic-decompose
- **tag**: DUP / install-specific
- **décision**: reject
- **raison**: idem — `github-coordination.js decompose`; la décomposition de mission est déjà notre `mas-mission-planner` (DAG typé).

## epic-publish
- **tag**: DUP / install-specific
- **décision**: reject
- **raison**: `github-coordination.js` publish back vers l'issue — coordination GitHub ECC + egress.

## epic-review
- **tag**: DUP / install-specific
- **décision**: reject
- **raison**: marque review d'epic (requested/approved/changes) via la coordination GitHub ECC.

## epic-sync
- **tag**: DUP / install-specific
- **décision**: reject
- **raison**: sync bodies/labels/snapshots depuis GitHub — machinerie de coordination ECC + egress.

## epic-unblock
- **tag**: DUP / install-specific
- **décision**: reject
- **raison**: balaye les epics bloqués via la coordination GitHub ECC.

## epic-validate
- **tag**: DUP / install-specific
- **décision**: reject
- **raison**: valide readiness/dépendances d'epic via la coordination GitHub ECC.

## evolve
- **tag**: DUP / install-specific
- **décision**: reject
- **raison**: exécute la CLI instinct ECC (`continuous-learning-v2/scripts/instinct-cli.py evolve`) pour promouvoir des "instincts" en skills/commands/agents. Système propre à ECC; la promotion de connaissances chez nous = Memory Keeper + `skill-creator`.

## fastapi-review
- **tag**: WRAPPER
- **décision**: reject
- **raison**: revue FastAPI — couvert par notre template `language-reviewer` (Python/framework).

## feature-dev
- **tag**: WRAPPER / DUP
- **décision**: reject
- **raison**: workflow guidé discovery→explore→design→impl→review qui enveloppe `code-explorer`/`code-architect`/`code-reviewer` — c'est exactement notre mission lifecycle (planner → dispatch → reviewer). Dup-no-better.

## flutter-build
- **tag**: WRAPPER
- **décision**: reject
- **raison**: invoque `dart-build-resolver` — couvert par `build-resolver`.

## flutter-review
- **tag**: WRAPPER
- **décision**: reject
- **raison**: invoque le reviewer Flutter/Dart — couvert par `language-reviewer`.

## flutter-test
- **tag**: WRAPPER
- **décision**: reject
- **raison**: TDD Flutter/Dart spécifique langage; doctrine TDD déjà nôtre.

## gan-build
- **tag**: WORKFLOW (unsafe/incomplet)
- **décision**: reject
- **raison**: boucle générateur/évaluateur qui dépend des agents `gan-planner/generator/evaluator` qu'on N'a pas, lance un dev-server live + eval Playwright (egress) et crée `gan-harness/` hors `data/`. La boucle eval-first bornée, on la possède déjà comme doctrine (`agentic-engineering` adopté, shard token-T1). KILL: dépendances agents absentes + egress non maîtrisé.

## gan-design
- **tag**: WORKFLOW (unsafe/incomplet)
- **décision**: reject
- **raison**: variante design de `gan-build` (mêmes agents gan-* absents, même dev-server/eval). Même KILL.

## go-build
- **tag**: WRAPPER
- **décision**: reject
- **raison**: invoque `go-build-resolver` — couvert par `build-resolver`.

## go-review
- **tag**: WRAPPER
- **décision**: reject
- **raison**: invoque `go-reviewer` — couvert par `language-reviewer`.

## go-test
- **tag**: WRAPPER
- **décision**: reject
- **raison**: TDD Go (table-driven, go test -cover) spécifique langage; doctrine TDD déjà nôtre.

## gradle-build
- **tag**: WRAPPER
- **décision**: reject
- **raison**: fixe les builds Gradle Android/KMP — enveloppe build-resolver spécifique build system.

## harness-audit
- **tag**: DUP / install-specific
- **décision**: reject
- **raison**: exécute `node scripts/harness-audit.js` (moteur de scoring propre à ECC, rubrique ECC, catégories deploy-target). Audit de harness ECC, pas un flux générique; notre audit build-time de surface = skill `context-budget` (shard token-T1).

## hookify-configure
- **tag**: DUP / install-specific
- **décision**: reject
- **raison**: active/désactive des règles hookify ECC — gestion du système de hooks ECC.

## hookify-help
- **tag**: DUP / install-specific
- **décision**: reject
- **raison**: aide du système hookify ECC.

## hookify-list
- **tag**: DUP / install-specific
- **décision**: reject
- **raison**: liste les règles hookify ECC.

## hookify
- **tag**: DUP / install-specific
- **décision**: reject
- **raison**: crée des hooks ECC à partir de l'analyse de conversation — système de hooks propre à ECC; chez nous les hooks = `settings.json` (update-config).

## instinct-export
- **tag**: DUP / install-specific
- **décision**: reject
- **raison**: exporte les "instincts" du système continuous-learning ECC vers un fichier — machinerie ECC.

## instinct-import
- **tag**: DUP / install-specific
- **décision**: reject
- **raison**: importe des instincts depuis fichier/URL (egress) dans le système ECC — machinerie ECC.

## instinct-status
- **tag**: DUP / install-specific
- **décision**: reject
- **raison**: lit `~/.claude/homunculus/.../instincts/` via la CLI ECC — système d'instincts propre à ECC, hors `data/`.

## jira
- **tag**: WRAPPER / DUP
- **décision**: reject
- **raison**: enveloppe la skill `jira-integration` + MCP Jira (intégration externe + egress). Pas de skill Jira chez nous; intégration tierce hors-scope produit actuel et §5 (egress). Si un jour scopé → via MCP + `config/permissions.json`, pas une commande hardcodée.

## kotlin-build
- **tag**: WRAPPER
- **décision**: reject
- **raison**: invoque `kotlin-build-resolver` — couvert par `build-resolver`.

## kotlin-review
- **tag**: WRAPPER
- **décision**: reject
- **raison**: invoque `kotlin-reviewer` — couvert par `language-reviewer`.

## kotlin-test
- **tag**: WRAPPER
- **décision**: reject
- **raison**: TDD Kotlin (Kotest/Kover) spécifique langage; doctrine TDD déjà nôtre.

## learn
- **tag**: WORKFLOW / DUP
- **décision**: reject
- **raison**: extrait des patterns de session en skills, mais écrit dans `~/.claude/skills/learned/` (HORS repo, viole §8) et double notre flux Memory Keeper + `MemoryProposal` + `skill-creator`. Dup-no-better + chemin non conforme.

## learn-eval
- **tag**: WORKFLOW / DUP
- **décision**: reject
- **raison**: `learn` + quality-gate + choix Global/Project, mais écrit toujours sous `~/.claude/skills/` (HORS `data/`, §8). La discipline gate qualité, on l'a (`mas-reviewer`/`quality-controller`); le placement mémoire, c'est Memory Keeper. Même KILL que `learn`.

## loop-start
- **tag**: WORKFLOW / DUP
- **décision**: reject
- **raison**: lance une boucle autonome managée avec gates de sécurité — chevauche notre autopilot scheduler (Phase 6) et dépend du profil de hooks ECC (`ECC_HOOK_PROFILE`). La gouvernance d'autonomie + stop conditions + risk gates est déjà notre §4/§5 + Phase 6. Dup-no-better.

## loop-status
- **tag**: DUP / install-specific
- **décision**: reject
- **raison**: inspecte l'état de boucle via `npx ecc-universal ecc loop-status` qui scanne `~/.claude/projects/**` (transcripts locaux) — outil propre au harness ECC, hors `data/`.

## marketing-campaign
- **tag**: WRAPPER
- **décision**: reject
- **raison**: enveloppe la skill `marketing-campaign` (déjà auditée côté skills) + WebSearch/WebFetch (egress §5). La commande n'ajoute rien à la skill.

---

**Adoptés: 2** → `.claude/commands/aside.md`, `.claude/commands/checkpoint.md`.
**Shard**: `docs/intake/2026-06-16-ecc-harvest/decisions/command-CA.md`.

# Lot — Sous-pages de contenu (distillations réelles)

Les 4 sous-pages sont la **seule matière intégrable** d'awesomeclaude.ai. Chacune passe l'audit puis est distillée dans `docs/knowledge/` (source + licence citées). Source : awesomeclaude.ai (MIT, webfuse-com/awesome-claude).

## 1. /code-cheatsheet — Claude Code 2.1 Cheatsheet → `fold`
- **Identité** : aide-mémoire exhaustif Claude Code 2.1 (install, alias modèles, niveaux d'effort, raccourcis, config, CLI, env vars, mémoire, checkpointing, slash-commands, skills, plugins, MCP, worktrees, subagents, permissions, hooks).
- **Fit / doublon** : recoupe `docs/knowledge/claude-code-context-and-modes.md` (3 couches contexte + 6 modes permission) MAIS apporte des **deltas 2026** : nouveaux modèles (Fable 5 / Opus 4.8), niveaux d'effort (`low→max`+`ultracode`), Dynamic Workflows, commandes `/goal` `/loop` `/batch` `/workflows` `/schedule`, env vars (`MAX_THINKING_TOKENS`, `CLAUDE_CODE_DISABLE_CRON`, caps `--max-budget-usd`), 9 events de hooks.
- **3 coûts** : install = ~1 section ajoutée ; maintenance = obsolescence medium (suivre versions Claude Code) ; removal = trivial.
- **KILL** : aucun (pas de PAYG, pas d'exécution). **Décision** : `fold` → nouvelle §6 « Deltas cheatsheet 2026 » dans `claude-code-context-and-modes.md`. Mapping MAOS clé : `/goal`+`/loop`+`/batch`+Dynamic Workflows = primitives natives qui recoupent notre **autopilot scheduler (Phase 6)** + **multi-mission parallèle (Phase 8a)** ; `--max-budget-usd`/`--max-turns` recoupent notre `budgets` table + caps fenêtre (§11).

## 2. /vibe-coding-guide → `fold` (apprendre, cross-map)
- **Identité** : méthodologie « vibe coding » = diriger l'IA par intention + vérification (director mindset, small scopes, verify relentlessly, state discipline) ; la « Vibe Loop » en 6 étapes ; playbook de prompting ; quality gates ordonnés ; safety & trust.
- **Fit / doublon** : recoupe **fortement** notre mission lifecycle (PRODUCT_SPEC §5), le gate 5-checks (CLAUDE.md §7), les superpowers `test-driven-development` + `verification-before-completion`, et §5 safety. Peu de neuf.
- **KILL** : doublon conceptuel quasi total → ne PAS créer de fichier dédié.
- **Décision** : `fold` léger → une note de cross-mapping en fin de `claude-code-context-and-modes.md` (confirme nos invariants, 1 apport : « prompt = spec compacte avec acceptance + non-goals » à garder comme check de qualité de brief mission). Pas de duplication.

## 3. /ralph-wiggum → `adapt` (nouvelle section knowledge)
- **Identité** : technique « Ralph Wiggum » (Geoffrey Huntley, 2025) = `while :; do cat PROMPT.md | claude ; done` — boucle qui réinjecte le même prompt jusqu'à un signal de complétion ; itération > perfection ; nécessite max-iterations comme garde-fou de sécurité.
- **Fit** : pattern d'**autonomie non-attendue** directement pertinent pour notre **mode autopilot (§4)** + **autopilot scheduler (Phase 6)**. Le « completion-promise + max-iterations » est exactement la garde manquante à formaliser. Les primitives natives (`/goal`, `/loop`, `/batch`) en sont la version supportée.
- **3 coûts** : install = 1 section knowledge ; maintenance = faible ; removal = trivial.
- **KILL** : risque de **runaway tokens** (la page le dit elle-même) → adoption *du pattern*, jamais d'exécution non-bornée. Doit se brancher sur §5 (gates risk:high/blocking interrompent même en autopilot) + §6 (budget cap) + `budgets` table.
- **Décision** : `adapt` → section « Boucle d'autonomie type Ralph / completion-loop » ajoutée à `docs/knowledge/risk-scoring-and-session-orchestration.md` (session orchestration), avec les garde-fous MAOS obligatoires (max-iterations, budget cap, gate §5, signal de complétion vérifiable). C'est aussi un input Phase 6.

## 4. /top-mcp-servers → `adapt` (augmenter le catalogue)
- **Identité** : ~50 serveurs MCP curatés par catégorie (file systems, browser, VCS, dev tools, coding agents, monitoring, memory, DB, comms, security/RE, cloud, CLI, search, productivity, multimedia, gaming, mobile, data science, research).
- **Fit** : alimente `docs/knowledge/mcp-connector-policy-and-catalog.md`. **Nouveaux candidats non encore catalogués**, dont une cible directe P4 :
  - **MarkusPfundstein/mcp-obsidian** → **réponse directe à la question ouverte P4** (connecteur mémoire⇄Obsidian, `project_linked_memory`). À intake-auditer en P4.
  - **topoteretes/cognee** (mémoire KG + vecteur, 30+ sources), **mediar-ai/screenpipe** (capture locale écran/audio, recall sémantique), **Shashankss1205/codegraphcontext** (graphe de code) → candidats mémoire/second-brain P4, à comparer à omega-memory/squish/longhand.
  - **oraios/serena** (agent de code symbolique via LSP), **dagger/container-use** (worktrees isolés multi-agents — sibling de notre dispatcher + Phase 8a), **eyaltoledano/claude-task-master** (gestion tâches PRD→DAG, recoupe `mas-mission-planner`).
  - **upstash/context7** (docs live — déjà au catalogue), **microsoft/markitdown** (déjà notre outil de lecture PDF, cf. `feedback_pdf-to-md-reads`).
  - **LaurieWired/GhidraMCP**, **mrexodia/ida-pro-mcp** (reverse-engineering) → pertinents pour l'arsenal **cyber défensif** (malware-analysis/forensics), opt-in, jamais défaut.
- **KILL** : la **règle connecteur** (Universal + MCP-beats-CLI, défauts <10) veto tout passage en défaut. Tous restent **opt-in, découverte seulement, jamais auto-install**.
- **Décision** : `adapt` → enrichir le catalogue avec ces candidats classés par la règle ; **mcp-obsidian flaggé pour P4**. Aucun défaut ajouté.

## Re-audit
- Cheatsheet : re-vérifier à chaque version majeure Claude Code.
- MCP catalog : re-scanner à l'ouverture de P4 (mémoire/Obsidian).

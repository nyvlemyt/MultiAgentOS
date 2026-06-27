# docs/knowledge/ — Index des sources de connaissance

Ce dossier agrège **toute la connaissance curatée** qui informe MultiAgentOS. **Aucune source n'est la vérité unique.** Les sources se croisent : une décision d'architecture solide est confirmée par ≥2 sources indépendantes (recherche académique + pratique terrain + doctrine projet).

CLAUDE.md §12 rend la consultation de ce dossier **obligatoire** avant de créer/modifier un SKILL.md, une fiche agent, ou une feature mémoire.

## Les 4 familles de sources

### 1. Recherche & écosystème (fondations techniques)

Fichiers de recherche curatée — patterns validés par la recherche académique, la doc officielle Anthropic, et les frameworks open-source de référence.

| Fichier | Couvre | Autorité |
|---------|--------|----------|
| `anthropic-ecosystem.md` | SDK, hooks 27 events, depth=1, effort param, billing June 15, Dynamic Workflows | Doc officielle Anthropic |
| `claude-code-context-and-modes.md` | 3 couches contexte, `.claude/rules/` paths, 6 modes permission, mode `auto` classifier, protected paths | Doc Claude Code + ressources |
| `frameworks-comparison.md` | LangGraph, CrewAI, claude-mpm, Agent Teams, quota multipliers | Frameworks open-source |
| `agent-patterns.md` | Orchestrator-Workers, Quality Controller, routing domaine, test binaire, 3 modes audit | Recherche + VibeFlow |
| `memory-patterns.md` | memweave, mem0, **QMD**, **Graphify**, 5 registres, prompt caching | Recherche + outils |
| `skills-reference.md` | L1/L2/L3, lifecycle skill, RES-054 5-phases, GEPA, three-tier | Spec officielle + VibeFlow |
| `prompting-anthropic.md` | XML tags, CoT, effort mapping, self-consistency | Doc Anthropic |
| `production-patterns.md` | 12-factor agents, Langfuse, OWASP, HITL, multi-agent failures | MLOps community |
| `project-doctrine.md` | 5-register architecture, trio Constitution/Registres/Usage | Doctrine projet |
| `references.md` | **Index maître de toutes les ressources** (statut ✅/⏳/📁) | — |

### 2. Doctrine VibeFlow (pratique terrain @le_gouverneur_ia)

`vibeflow/` — patterns extraits de 41 ressources Notion de gouvernance IA. **Pratique terrain de 4 projets parallèles**, pas de la recherche. Complète (ne remplace pas) la famille 1.

| Fichier | Couvre |
|---------|--------|
| `vibeflow/INDEX.md` | Table des 41 ressources + statut accès |
| `vibeflow/agents-skills.md` | Critère succès (3 formes), auditeur 4 champs, 3 modes audit, archi agent |
| `vibeflow/memoire.md` | Déplacement valeur, close-out 3 champs, consolidation, 5 registres |
| `vibeflow/gouvernance.md` | OWASP, EVAL-XXX, DURCIR 3 niveaux, base saine |
| `vibeflow/workflows.md` | Tableau 23 skills custom, trio doctrine |
| `vibeflow/hooks.md` | Hooks Phase 6 (à ré-exporter) |

**Croisements famille 1 ↔ 2** (où les sources se confirment) :
- 5 registres mémoire : `project-doctrine.md` (doctrine) + `memory-patterns.md` (memweave research) + `vibeflow/memoire.md` (RES-029 terrain) → **convergence forte** → Phase 4
- Test binaire skill/agent : `agent-patterns.md` (Anthropic Orchestrator-Workers) + `vibeflow/agents-skills.md` (RES-035) → confirmé
- Quality Controller : `skills-reference.md` (repowise adversarial) + `vibeflow/agents-skills.md` (RES-043 auditeur) + `vibeflow/gouvernance.md` (RES-040 EVAL-XXX) → spec complète
- Mémoire poisoning : `production-patterns.md` (OWASP) + `vibeflow/gouvernance.md` (RES-042 ASI06) → même risque, 2 angles

### 3. Cours & docs sources (`docs/claude-doc/`)

Documents complets sauvés localement (PDFs Anthropic + ressources VibeFlow intégrales + cours). **Source primaire** quand intégrale, pas juste un résumé.

| Fichier | Contenu | Statut |
|---------|---------|--------|
| `prompt_best_practice.pdf` | Best practices prompting Anthropic | → prompting-anthropic.md |
| `Console_prompting_tools.pdf` | Outils Console Anthropic | → prompting-anthropic.md |
| `vrai-memoire-agent-claude.md` | RES-029 intégral : 5 registres + prompts + Obsidian | → memoire.md (Phase 4 prompts) |
| `sommaire-que-l-ia-lit-avant-de-fouiller-sa-memoire.md` | RES-056 intégral : SUMMARY.md | → memoire.md |
| `systeme-qui-fai-tourner-une-distribution-claude.md` | RES-053 intégral : archi distribution | → workflows.md |
| `le-stack-doctrine.md` | RES-032 intégral : doctrine par-dessus framework | → project-doctrine.md |
| `3-checks-avant-upgrade-modele-ia.md` | RES-031 intégral : checklist upgrade | → ADR 0002 |
| `6-commandes-anti-vibe-coding.md` | anti-patterns | doublon Stack Doctrine |
| `ressources.md`, `skill-sh.md` | index Notion brut (⚠️ pas du contenu) | → remplacé par vibeflow/ |

### 4. Outils externes (à auditer avant install)

Référencés dans `references.md`, intégrés dans les fichiers thématiques. **Tous nécessitent un audit sécu avant install** (CLAUDE.md §5).

| Outil | Rôle | Phase | Fichier |
|-------|------|-------|---------|
| **QMD** | Retrieval mémoire/docs (BM25+vector+rerank) | 4 | memory-patterns.md |
| **Graphify** | Knowledge graph codebase (AST+Leiden, -71.5× tokens) | 4/5 | memory-patterns.md |
| **Obsidian** + obsidian-skills | Visualisation humaine mémoire | 6 | memory-patterns.md, skills-reference.md |
| taste-skill, impeccable, awesome-design-md | Design cockpit | 7 | skills-reference.md |
| agency-agents | Source Tier B (144 agents) | 5 | agent-patterns.md |
| spec-kit | Pattern décomposition | 3 | agent-patterns.md |

## Règle d'or de consultation

Avant toute décision d'architecture sur MAS :
1. Chercher dans **famille 1** (recherche/écosystème) — la fondation technique
2. Croiser avec **famille 2** (VibeFlow terrain) — la validation pratique
3. Si intégral nécessaire → **famille 3** (`docs/claude-doc/`)
4. Si outil externe → **famille 4** + audit sécu

**Une décision tenue par 1 seule source = à vérifier. Tenue par ≥2 familles = solide.**

## Distillations ECC résiduel (2026-06-21)

Au-delà des skills/agents/rules/commands déjà récoltés, l'audit des dirs restants de `affaan-m/ecc` (dossier `docs/intake/2026-06-21-ecc-residual/PLAN.md`) a distillé 3 fichiers :

| Fichier | Sujet | Alimente |
|---------|-------|----------|
| `mcp-connector-policy-and-catalog.md` | Règle « Universal + MCP-beats-CLI » + catalogue ~30 serveurs MCP (mémoire: omega-memory/squish/longhand) | P4 linked-memory, §11.bis |
| `risk-scoring-and-session-orchestration.md` | Scoring risque 4-axes + patterns session (state machine, ring buffer, DbWriter, métriques) | §5, Phase 6 risk classifier, worker |
| `continuous-learning-and-memory-lifecycle.md` | Cycle hooks mémoire (SessionStart/PreCompact/SessionEnd) + spirale apprentissage continu | §13 bridge, Phase 4 |

## Audit (2026-06-03)

Voir `docs/workflows/phase3-audit-report-2026-06-03.md` pour l'audit complet des ressources et le backlog d'implémentation par phase.

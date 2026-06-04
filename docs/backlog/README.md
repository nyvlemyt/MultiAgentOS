# docs/backlog/ — Ressources & idées "pour plus tard"

Ce dossier capture les ressources, outils et idées **qui ne sont pas intégrés immédiatement mais qu'on ne veut pas perdre**. Chaque carte : ce que c'est, pourquoi pas maintenant, quand/comment l'utiliser, ce qu'on en extrait.

Règle : rien ne se perd. Si une ressource a une bonne idée mais est trop lourde / hors phase / coûteuse, on la range ici avec le pattern extractible, pas le repo entier.

---

## Rapport de couverture — vérification 2026-06-03

Vérification que **tout** ce qui a été fourni est soit intégré, soit rangé ici, soit rejeté avec raison.

### Vision projet (multi-LLM, manager, fr/en)

| Idée | Statut | Où |
|------|--------|-----|
| Recherche avec Perplexity | ✅ intégré | ROADMAP §3.5 routing `research→Perplexity` |
| Audit avec Codex | ⚠️ raffinement | ROADMAP a `code-review→o1-mini/GPT-4o` ; "codex" = préciser dans ADR 0002 (voir carte ci-dessous) |
| Dev avec Claude | ✅ | ROADMAP `code-execution→Claude` (only) |
| Vérification avec Codex ou Claude | ✅ | ROADMAP `code-review` + `security→Claude/o1-mini` |
| Manager d'agents (règles, archi, dev) | ✅ | Quality Controller — audit report §P3.5-A, vibeflow/agents-skills.md (RES-043/037) |
| Token fallback (ChatGPT↔Claude si quota épuisé) | ✅ | ROADMAP §3.5 "Token fallback automatique" |
| Tout en français / mode fr-en | ✅ | ROADMAP §3.5 "Mode langue `fr/en`" |
| Principes Anthropic (prompt/agents/skills) | ✅ | docs/knowledge/prompting-anthropic.md, anthropic-ecosystem.md, skills-reference.md |

**→ Input explicite pour ADR 0002 (multi-model router)** — préférences provider/rôle de l'utilisateur, à encoder dans `config/model-routing.json` :
- `research` → **Perplexity**
- `code-execution` (dev) → **Claude** (only — Agent SDK)
- `code-review` (audit) → **Codex** (OpenAI codex CLI / GPT-5-codex) — préférence user explicite, remplace "o1-mini" du ROADMAP
- `security`/verification → **Codex ou Claude**
- Quality Controller (manager) → **Codex ou Claude** (cross-check d'autre famille que Claude — argument EVAL-XXX, vibeflow/gouvernance.md RES-040)
- Fallback quota Claude↔ChatGPT → token fallback ROADMAP §3.5
- ROADMAP table dit "o1-mini" → ADR 0002 doit trancher o1-mini vs codex (user préfère codex pour le code).

### Skills GitHub (mémoire, étudiant, etc.)

| Skill | Statut | Où |
|-------|--------|-----|
| colbymchenry/codegraph | ✅ | agent-patterns.md, memory-patterns.md §Graphify (comparatif), references.md |
| Imbad0202/academic-research-skills-codex | ✅ | agent-patterns.md (escalade/socratic), references.md |
| tinyhumansai/openhuman | ✅ | agent-patterns.md (token compression), references.md |
| rohitg00/agentmemory | ✅ | memory-patterns.md (4 niveaux, -92% tokens), references.md |

### Liens utiles

| Lien | Statut | Où |
|------|--------|-----|
| agentic-academy.fr template prompt | ✅ noté 🔐 auth | references.md |
| doc claude system-prompts | ✅ | references.md, prompting-anthropic.md |
| prompt-eng-interactive-tutorial | ✅ | references.md, prompting-anthropic.md |

### Repos GitHub (liste audit)

spec-kit, taste-skill, impeccable, superpowers, build-your-own-x, awesome-design-md, emilkowal.ski/skill, magic-mcp, skillui → **tous audités** : audit report 2026-06-03 + skills-reference.md. magic-mcp **rejeté** (API key 21st.dev = PAYG, viole §11). build-your-own-x **rejeté** (hors scope).

### Outils mémoire/graph

| Outil | Statut | Où |
|-------|--------|-----|
| QMD | ✅ | memory-patterns.md (retrieval Phase 4) |
| Graphify | ✅ | memory-patterns.md §Graphify (Context Manager Phase 4/5) |
| Obsidian + obsidian-skills | ✅ | memory-patterns.md, skills-reference.md |
| Instagram×Obsidian (Loucash) | ✅ | memory-patterns.md (pattern ingestion) |
| sommaire mémoire (RES-056) | ✅ | vibeflow/memoire.md, docs/claude doc local |

### Docs locaux & cours

| Doc | Statut |
|-----|--------|
| système-distribution (RES-053) | ✅ vibeflow/workflows.md |
| 5 couches Claude Code (unmuteai) | ✅ audit report (5-layer arch validé) |
| skill-sh.md (skills.sh guide) | ⚠️ **méthode audit pas encore en policy** → carte `skill-install-policy.md` |

### Agents

| Source | Statut |
|--------|--------|
| msitarzewski/agency-agents (147 agents) | ✅ audité — agent-patterns.md (source Tier B Phase 5). Page Notion d'explication : non fetchée (juste install guide, le repo suffit) |

### NOUVEAU — à ranger ici (pas encore intégré)

| Ressource | Carte |
|-----------|-------|
| ruvnet/ruflo (meta-harness multi-agent) | `frameworks-to-mine.md` |
| Méthode audit skills.sh (Find→Audit→Install→Use + 6 checks) | `skill-install-policy.md` |
| Design Stack (taste+21st+ui-ux-pro-max + params) | `design-stack-phase7.md` |

---

## Cartes "pour plus tard"

- [`second-brain-cross-project.md`](second-brain-cross-project.md) — **second cerveau** : couche savoir/mémoire partagée build-time + cross-projet, extension Phase 4 (candidat ADR). Doctrine de build associée : [`../workflows/knowledge-bootstrap.md`](../workflows/knowledge-bootstrap.md). **Cœur du projet.**
- [`intake-audit-skill.md`](intake-audit-skill.md) — **skill d'audit universel d'ajout** (ressource/skill/agent/idée/mémoire/principe) → Phase 4.5. Généralise le master-prompt one-shot. Version manuelle dispo : [`../workflows/intake-audit-template.md`](../workflows/intake-audit-template.md). **Anti-dérive + gouvernance.**
- [`llm-selection-audit.md`](llm-selection-audit.md) — **méthodologie + audit de sélection LLM par tâche/agent/domaine/risk** (→ ADR 0002, prérequis Phase 3.5). **Critique perf+coût.** Réconcilie les 4 dimensions qui se contredisent.
- [`skill-install-policy.md`](skill-install-policy.md) — méthode d'audit sécu skills externes (→ ADR 0005, Phase 6 prep). **Haute valeur sécurité.**
- [`frameworks-to-mine.md`](frameworks-to-mine.md) — ruflo + frameworks lourds dont extraire des patterns (pas adopter).
- [`design-stack-phase7.md`](design-stack-phase7.md) — workflow design cockpit Phase 7.
- [`self-audit-lean-claude-md.md`](self-audit-lean-claude-md.md) — **self-audit Batch 1** : CLAUDE.md > 200 lignes (RES-022/012) + retourner les audits RES-024/008/023/015 sur MAS lui-même au gate Phase 3.5. **Dette réflexive, décision humaine.**

## Principe (rappel)

Un skill/agent/idée peut être bon à reprendre même si pas utilisé directement. Si trop lourd / trop coûteux : garder le **pattern + fichiers utiles** ici, améliorer plus tard. Voir `docs/knowledge/README.md` pour l'articulation des sources.

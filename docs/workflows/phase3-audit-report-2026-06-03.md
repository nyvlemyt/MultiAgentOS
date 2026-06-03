# Audit Stratégique Phase 3 — MultiAgentOS
**Date** : 2026-06-03 | **Branch** : `phase/3-skill-registry` | **Phase** : 3 (~70% complète)

Ce document est un guide d'implémentation basé sur l'audit de 18 ressources externes et 20+ fichiers locaux. Il est destiné aux futures sessions d'implémentation, pas à la conversation qui l'a produit.

**Ressources consultées** : Notion VibeFlow (41 ressources), obra/superpowers, github/spec-kit, Leonxlnx/taste-skill, pbakaus/impeccable, VoltAgent/awesome-design-md, msitarzewski/agency-agents (144+ agents), tobi/qmd, 21st-dev/magic-mcp, emilkowal.ski, skillui.vercel.app, skills.sh, unmuteai.com — plus les 9 fichiers `docs/knowledge/` et 6 fichiers `docs/claude doc/`.

---

## État Phase 3 — Ce qui reste

Phase 3 exit criteria (`ROADMAP.md §Phase 3`) :
> "All 6 orchestrator skills have a `summary.md`. Skill Router injects summaries (not bodies) in mission prompts. Filter + promote actions work and persist across reload."

> ⚠️ **CORRECTION 2026-06-03 (vérification post-audit)** : l'inventaire initial (Agent context pack) indiquait `data/skill-cache/` absent et `reindex` non implémenté. **C'était faux.** Vérification directe du code : **Phase 3 implémentation est essentiellement COMPLÈTE et committée** (commits `2bdb323` → `cd55386`). Cette section liste ce qui EXISTE et ce qui reste à VÉRIFIER, pas à construire. Ne pas réécrire le code existant.

**État réel des livrables Phase 3** :

| ID | Livrable | État | Preuve |
|----|---------|------|--------|
| P3-A | `pnpm skills:reindex` pipeline | ✅ **FAIT** | `packages/skills/src/{reindex,scanner,router,types}.ts` committés ; `data/skill-cache/` peuplé (6 dirs) ; script `skills:reindex` dans `package.json` |
| P3-B | Effort parameter wire-up | ✅ **FAIT** | `packages/core/src/llm.real.ts:29-32` `MODE_TO_EFFORT` (eco→medium, standard→high, expert→xhigh), passé à `query()` ligne 78. Bonus : `ANTHROPIC_API_KEY` strippé de l'env ligne 66. |
| P3-C | Domain taxonomy tagging | ✅ **FAIT** | `schema.ts` colonne `domain` enum 9 valeurs ; `summary.md` frontmatter `domain` ; `types.ts` `Domain` union |
| P3-D/E | Verification Criteria SKILL.md | ✅ **FAIT** | commit `cd55386` "enrich 6 orchestrator SKILL.md" ; sections Verification présentes dans mas-skill-router, mas-mission-planner, mas-sec-reviewer |
| P3-F | Persistence filter + promote `/skills` | ✅ **FAIT** | filter via `searchParams` URL (`?domain=&q=`) → persiste au reload ; promote via `<form method=POST action=/api/skills/promote>` → DB |

**Architecture réelle (importante — diffère de l'hypothèse audit initiale)** :
- Les summaries L1 sont **écrits à la main dans le frontmatter** des SKILL.md (champ `summary:`), **PAS générés par un LLM**. `scanner.ts:48` lit `fm['summary']`. Conforme à CLAUDE.md §12.5.
- `reindex.ts` = scanner déterministe (lit frontmatter → écrit `data/skill-cache/<id>/summary.md` + upsert DB). **Aucun appel LLM.** Donc la question "quel modèle pour générer les summaries" est SANS OBJET.
- Schema `skills` : `summaryPath` (pointeur vers le fichier cache), `domain` enum, `tagsJson`. PAS de colonne `summary` inline, PAS de `summary_generated_at`.
- Format réel `summary.md` : frontmatter `domain` + `tags` seulement, puis le texte. PAS de `generated_at`/`token_count`/`id`.

**Ce qui reste réellement à faire pour clore Phase 3 (vérification + qualité, pas construction)** :

```bash
# 1. Confirmer suite verte
pnpm -w lint && pnpm -w test

# 2. Re-run reindex pour s'assurer que data/skill-cache reflète les SKILL.md committés
pnpm skills:reindex
# Attendu : "[reindex] done — 6 skills indexed."

# 3. Smoke test /skills (manuel)
pnpm --filter @mas/web dev
# /skills?domain=planning → reload → filtre maintenu
# promote un skill → reload → toujours promoted
```

**Revue qualité optionnelle (amélioration, pas blocage exit criteria)** :
- Les Verification Criteria des SKILL.md couvrent-elles la checklist 16 pts RES-035 (`docs/knowledge/agent-patterns.md` §Pattern Test Binaire) ? Si lacune → enrichir, sans réécrire.
- Les fiches `packages/agents/fiches/*.md` (distinctes des SKILL.md) ont-elles aussi des Verification Criteria ? À vérifier — les SKILL.md les ont, les fiches peut-être pas encore. Source patterns : RES-046 (3 formes critère succès), RES-024 (5 dimensions audit).

→ **Phase 3 peut être déclarée close après confirmation des 3 commandes ci-dessus.** Demander le "go" utilisateur pour Phase 3.5.

---

## ~~P3-A/B/C/D/E/F~~ — Tous faits (voir tableau ci-dessus)

Détail conservé pour référence des patterns sources, mais **ne pas ré-implémenter** :

- **Verification Criteria fiches Tier A** (`packages/agents/fiches/*.md`, distinctes des SKILL.md) — si lacune détectée à la revue qualité, ajouter au format binaire. Exemples de critères :
  - `mission-planner` : décomposée en ≥2 tâches (type+description+risk) / budget estimé / aucune tâche → agent inexistant / `risk: high` → `requires_validation: true` / output JSON valide
  - `skill-router` : domain tag par tâche / skill = domain match / L1 summary jamais body sans hydration / `requires_validation` si email|send|trade|push|secret / escalade si aucun skill ≥0.6
  - `sec-reviewer` : verdict PASS|NEEDS_CHANGES uniquement / chaque finding cite catégorie `permissions.json` / escalade si catégorie manquante / défaut ambiguïté = NEEDS_CHANGES

- **Checklist 16 pts RES-035** pour enrichir `mas-skill-router` SKILL.md Verification Criteria si lacune :
```markdown
- [ ] Exactement 1 orchestrateur actif par mission
- [ ] L'orchestrateur ne produit pas de livrable (délègue uniquement)
- [ ] Chaque Tier A a mandat écrit (1-2 phrases dans sa fiche)
- [ ] Chaque Tier A peut décider seul sur ≥3 choix nommés
- [ ] Chaque Tier A a escalade claire vers un agent nommé ou l'humain
- [ ] Aucun Tier B ne prend de décisions (si oui → réqualifier en Tier A)
- [ ] Skills chargés conditionnellement (jamais systématiquement)
- [ ] Skill sélectionné = domain match avec la tâche reçue
```

---

## Backlog Phase 3.5

### P3.5-A : Quality Controller — Fiche Tier A

**Lire avant** :
1. `docs/knowledge/agent-patterns.md` §Pattern 3 Modes d'Audit (RES-037) : STRICT/AUDIT/SHADOW
2. `docs/claude doc/ressources.md` RES-043 : template agent-auditeur 4 champs
3. `docs/claude doc/ressources.md` RES-040 : template EVAL-XXX + 3 dérives
4. `AGENTS.md §4` : spec Quality Controller

**Fichier** : `packages/agents/fiches/quality-controller.md`

**Schema** (aligner avec `AGENTS.md §4` détail QC) :
- Tier A, gate entre exécution et Reviewer : `[agents d'exécution] → Quality Controller → Reviewer → SecReviewer → archive`
- Provider : `Claude` (sonnet-4-6) par défaut, ou `o1-mini` via le multi-model router Phase 3.5 (AGENTS.md autorise o1-mini pour les tâches de cognition — pas d'exécution)
- Budget : 3000 tokens
- Tools (≤7) : Read (diff), Read (events log), Read (permissions.json), Write (EVAL-XXX), Notify (dispatcher), Read (fiches/)
- Responsabilités (AGENTS.md §4) : outputs respectent CLAUDE.md (conventions, archi, no PAYG) / commits Conventional ≤60 chars / dérive archi (framework sans ADR) / token spend justifié / **langue de sortie cohérente FR/EN avec le mode projet**
- Différence Reviewer : Reviewer vérifie le CODE, QC vérifie PROCESSUS + RÈGLES
- Mode STRICT si `risk: high/blocking`, AUDIT si `risk: medium`, SHADOW si `risk: low`
- Escalade : si diff touche `.env*` / secrets / cross-project → sec-reviewer obligatoire avant verdict
- Output : `data/memory/<projectId>/evals/EVAL-<timestamp>.md` avec verdict PASS/NEEDS_WORK + findings numérotés
- **Note** : QC est listé dans ROADMAP.md comme feature Phase 3.5 (ligne 188). Le multi-model router (P3.5-B) doit exister avant de pouvoir router QC vers o1-mini.

### P3.5-B : ADR 0002 — Multi-Model Router

**Lire avant** :
1. `docs/claude doc/3 checks a faire avant d'upgrader ton modele IA.md` — checklist upgrade
2. `docs/knowledge/frameworks-comparison.md` §Three-Tier Model Strategy (wshobson)
3. `ROADMAP.md §Phase 3.5`

**Décisions à trancher** :
- eco → haiku-4-5 only ou haiku + sonnet retry ?
- expert → sonnet-4-6 ou opus-4-8 ?
- Phase 3.5 : Anthropic uniquement ou Perplexity pour `research` domain ?
- Schema `config/model-routing.json`

**Fichier** : `docs/decisions/0002-multi-model-router.md`

### P3.5-C : mas-quality-controller SKILL.md

**Lire avant** :
1. `docs/knowledge/skills-reference.md` — structure lifecycle L1/L2/L3 obligatoire
2. `docs/knowledge/prompting-anthropic.md` — XML tags, effort mapping
3. RES-037 + RES-040

**Summary L1 (≤200 tokens)** :
> "Quality Controller audits mission outputs against CLAUDE.md §4-7, token budget, ungated risks, missing tests. Returns PASS/NEEDS_WORK verdict via EVAL-XXX file. Mode STRICT blocks, AUDIT traces, SHADOW observes. Default on ambiguity: NEEDS_WORK — never PASS without evidence."

---

## Backlog Phase 4 — Mémoire

### P4-A : Memory 5-Register Structure

**Lire avant** :
1. `docs/claude doc/vrai-memoire-agent-claude.md` — **CONTIENT LES PROMPTS COMPLETS** (initialization + close-out ritual, copy-paste ready)
2. `docs/claude doc/ressources.md` RES-029 — spec des 5 registres
3. `docs/claude doc/ressources.md` RES-056 — format SUMMARY.md
4. `docs/knowledge/memory-patterns.md` — architecture memweave + QMD

**Structure cible** :
```
data/memory/<projectId>/
├── SUMMARY.md          ← ≤500 tokens, chargé par Context Manager au début de chaque mission
├── decisions.md        ← BDR-XXX
├── learnings.md        ← LRN-XXX
├── blockers.md         ← BLK-XXX
├── journal.md          ← per-session bullets
└── evals/              ← EVAL-XXX (Quality Controller)
```

**SUMMARY.md format** (source RES-056) :
```markdown
---
project_id: <id>
updated_at: <ISO8601>
token_count: <N>
---

## Ce projet en 3 lignes
<pitch technique en 3 bullets>

## Décisions clés (top 3)
- BDR-001: <décision + date>

## Learnings actifs (top 3)
- LRN-001: <learning + date>

## Blockers ouverts
- BLK-001: <blocker + date> [ou "Aucun"]

## Prochaine action
<1 phrase>
```

**Prompt d'initialisation** : voir `docs/claude doc/vrai-memoire-agent-claude.md` §"Le prompt maître". Adapter le path `.claude/memory/` → `data/memory/<projectId>/`.

**Rituel close-out** : voir `docs/claude doc/vrai-memoire-agent-claude.md` §"Le prompt du rituel". 5 min par session.

### P4-B : QMD Integration — Retrieval Layer

**⚠️ ADR 0003 requis avant d'implémenter.**

**Ce que c'est** : tobi/qmd — moteur recherche local, BM25+vector+LLM reranking, MCP server natif, Node 22+ ✓, TypeScript, SQLite FTS5. ~2GB modèles locaux.

**Ce que ça remplace** : notre plan custom `packages/memory/src/index.ts` + `data/memory/<projectId>/index.db` FTS5. QMD est plus riche et maintenu.

**Ce que ça ne remplace PAS** : l'écriture dans les 5 registres (Memory Keeper). QMD = lecture/recherche uniquement.

**Configuration MCP** dans `.claude/settings.json` (ou worker settings) :
```json
{
  "mcpServers": {
    "qmd": {
      "command": "qmd",
      "args": ["mcp", "--collection", "mas-knowledge"],
      "env": {}
    }
  }
}
```

**Collections** :
- `mas-knowledge` → indexe `docs/knowledge/`, `docs/claude doc/`, `docs/workflows/`
- `mas-memory` → indexe `data/memory/` (re-indexé après chaque session Memory Keeper)

**Vérification prérequis** :
```bash
node --version     # ≥22 ✓
df -h ~/.cache/    # ~2GB disponibles ?
```

**Source** : `docs/knowledge/memory-patterns.md` §QMD, `docs/knowledge/references.md`

### P4-C : ADR 0003 — Memory Storage Format

**Décisions à trancher** :
- QMD vs custom FTS5 (recommandation : QMD)
- SUMMARY.md format standard (voir §P4-A)
- Obsidian integration timing (Phase 6+ avec kepano/obsidian-skills)
- sqlite-vec threshold (>200 memories/projet)

---

## Backlog Phase 5+

### Phase 5 — Tier B Expansion
Source : `msitarzewski/agency-agents` (144+ agents). Extraire workflow patterns. Adapter au schema MAS. Ne pas importer directement (formats différents, le nôtre est plus économique en tokens).
Source : `docs/knowledge/agent-patterns.md` §bobmatnyc/claude-mpm — Channel Hub multi-sessions.

### Phase 6 — Autonomy Gates + Hooks
Sources :
- `docs/claude doc/ressources.md` RES-025 "3 chemins hors du terminal" (plugins/MCP/schedulers)
- `docs/claude doc/ressources.md` RES-026 "8 hooks Claude Code" — starter pack settings.json
- `docs/knowledge/anthropic-ecosystem.md` §Hooks — 27 événements, exit codes 0/2
- Dynamic Workflows (16 agents concurrents) pour missions massives

### Phase 7 — Cockpit UI Polish
Ordre d'utilisation :
1. `VoltAgent/awesome-design-md` : copier 1 DESIGN.md dans `apps/web/` (zéro install)
2. `Leonxlnx/taste-skill` : après audit sécu, `design-taste-frontend` ou `redesign-existing-projects`
3. `pbakaus/impeccable` : après audit sécu, `/impeccable audit` sur `apps/web/`
4. Sonner (emilkowal.ski) pour notifications cockpit : `npm install sonner`
5. Vaul (emilkowal.ski) pour drawers si Phase 8 Tauri mobile

### Phase 8 — Tauri Desktop
Source : `winfunc/opcode` (CLAUDE.md §9.bis)

---

## Décisions Architecturales — Contraintes Absolues

**depth=1 : aucun Tier C possible.** Subagents ne peuvent pas spawner leurs propres subagents. Architecture Tier A/B est la seule valide. Dynamic Workflows pour missions >16 agents (Phase 6+).
Source : `docs/knowledge/anthropic-ecosystem.md`

**effort param values confirmés** :
```
eco → 'medium' | standard → 'high' | expert → 'xhigh'
Valeurs SDK : 'low' | 'medium' | 'high' | 'xhigh' | 'max'
```
Source : `docs/knowledge/anthropic-ecosystem.md` §AgentDefinition

**Billing June 15, 2026** : Agent SDK subscription = crédit mensuel séparé de Claude.ai. Agents = ~4× quota normal. Multi-agent research = ~15×. `budgets` table doit tracker séparément.
Source : `docs/knowledge/anthropic-ecosystem.md`

**last_message (pas full_history) sur handoff Tier A → Tier B** : évite le coût du contexte complet. Le context pack projet compense.
Source : `docs/knowledge/frameworks-comparison.md`

**Session resume** : stocker `session_id` dans colonne `projects.sessionId` pour continuité entre sessions.
Source : `docs/knowledge/anthropic-ecosystem.md` §Session resume

---

## Ressources Rejetées

| Ressource | Raison |
|-----------|--------|
| 21st-dev/magic-mcp | API key 21st.dev → PAYG externe → violation CLAUDE.md §11 |
| codecrafters-io/build-your-own-x | Guides "build X from scratch". Aucune pertinence agents. |
| github/spec-kit (install) | Doublon superpowers. Extraire le pattern, ne pas installer. |

---

## Security Review

**Interdit sans ADR billing** : 21st-dev/magic-mcp.

**Audit sécu requis avant Phase 7** :
- `Leonxlnx/taste-skill` : Shell 100%, install npm — quels scripts ? quels fichiers ?
- `pbakaus/impeccable` : CLI + Playwright optionnel — chemins filesystem accédés ?
- `skills.sh` (tout skill) : chaque skill = code tiers exécutable, audit individuel obligatoire
- QMD : vérifier intégrité checksums des ~2GB modèles auto-téléchargés

**ADR Candidates** :
| # | Titre | Urgence |
|---|-------|---------|
| 0002 | Multi-Model Router | Avant tout code Phase 3.5 |
| 0003 | Memory Storage Format (QMD vs custom FTS5) | Avant Phase 4 |
| 0004 | Quality Controller Tier (peut-il appeler sec-reviewer ?) | Phase 3.5 |
| 0005 | Skill Install Policy (skills.sh, taste-skill) | Phase 6 prep |
| 0006 | QMD Integration Mode (MCP vs library) | Phase 4 |

---

## Ressources Encore à Explorer

Depuis `docs/knowledge/references.md` status ⏳ :
- `wong2/awesome-mcp-servers` — Phase 3 MCP servers
- `modelcontextprotocol/servers` — Phase 3 MCP servers
- Webinaire Anthropic Advanced Patterns PDF — Phase 3
- `baryhuang/claude-code-by-agents` — Phase 5
- `eugeniughelbur/obsidian-second-brain` — Phase 6
- Anthropic Academy (5 cours prioritaires) — Phase 3.5 formation

---

## Open Questions (mises à jour post-vérification)

1. ~~Quel modèle pour générer les summaries ?~~ **SANS OBJET** — les summaries sont écrits à la main dans le frontmatter SKILL.md, pas générés par LLM. `reindex.ts` est un scanner déterministe.
2. ~~`packages/skills/` existe-t-il ?~~ **OUI** — package complet committé (scanner, router, reindex, types, tests).
3. ~~Schema colonnes summary/domain/generated_at ?~~ **Résolu** — schema utilise `summaryPath` (pointeur), `domain` enum, `tagsJson`. Pas de summary inline ni generated_at. Design intentionnel.
4. ~~`/skills` persistence ?~~ **CONFIRMÉ FAIT** — filter via searchParams URL, promote via form POST → DB.
5. ~~Les fiches ont-elles des Verification Criteria ?~~ **Résolu** — les fiches utilisent le champ YAML `quality_criteria:` (schéma canonique AGENTS.md §2), pas une section markdown `## Verification Criteria`. Les SKILL.md utilisent `## Verification Criteria` markdown. Deux artefacts distincts, deux schémas, les 6 de chaque côté sont complets. Vérifié 2026-06-03 : les 6 fiches ont quality_criteria + escalate_when + common_mistakes + budget, toutes ≤7 tools.
6. **Reste ouvert (Phase 4)** : QMD modèles ~2GB — espace disque disponible ? `df -h ~/.cache/`.

---

## Ordre d'Exécution Recommandé

```
PHASE 3 (implémentation FAITE) :
  → pnpm -w lint && pnpm -w test  (confirmer vert)
  → pnpm skills:reindex            (confirmer 6 skills indexed)
  → smoke test /skills manuel
  → revue qualité Verification Criteria fiches (optionnel)
  → DEMANDER "go" utilisateur pour clore Phase 3

PHASE 3.5 (après go) :
  P3.5-B (ADR 0002 multi-model router) → P3.5-A (QC fiche) → P3.5-C (QC SKILL.md)
  → Go Phase 4

PHASE 4 (après go) :
  ADR 0003 (memory format + QMD) → P4-A (5 registres) → P4-B (QMD MCP) → P4-C (Memory Keeper live)
```

**Budget tokens pour clore Phase 3** : ~5k tokens (lint + test + reindex + revue). L'implémentation lourde est déjà committée — il ne reste que la vérification.

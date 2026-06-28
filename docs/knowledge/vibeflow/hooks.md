---
id: vibeflow-hooks-sortir-du-terminal-patterns-extraits
slug: vibeflow-hooks-sortir-du-terminal-patterns-extraits
source_key: 'sha256:76d8daa683f0f724096b061c9df9f03828c28cb70933b46ff9f1232d7a16c780'
lifecycle: active
trust: trusted
schema_version: '1'
---
# VibeFlow — Hooks & Sortir du Terminal (patterns extraits)

Catégorie Hooks de la page Notion @le_gouverneur_ia. **Les 3 ressources de cette catégorie utilisent des IDs `248dc06a` morts (404 au fetch 2026-06-03).** À récupérer via `notion-search` ou ré-export utilisateur.

Pertinence : **Phase 6** (autonomy gates + hooks). Les hooks Claude Code sont la couche déterministe qui garantit les risky-action gates de CLAUDE.md §5 (les instructions CLAUDE.md sont advisory ; les hooks sont garantis — voir `docs/knowledge/anthropic-ecosystem.md` §Hooks).

---

## Ressources à récupérer

| RES | Titre | Contenu attendu | Phase MAS |
|-----|-------|-----------------|-----------|
| 025 | 3 chemins hors du terminal | plugins / MCP / schedulers — comment sortir Claude Code du terminal | 6 (déjà : cockpit web fait) |
| 026 | 8 hooks Claude Code | starter pack settings.json (les 8 hooks essentiels) | 6 |
| 027 | 3 hooks essentiels | version minimale settings.json | 6 |

---

## Ce qu'on sait déjà (depuis anthropic-ecosystem.md)

27 événements de hooks. Clés pour MAS :
- `PreToolUse` → gate avant action dangereuse (§5)
- `PostToolUse` → audit log table `events`
- `PermissionRequest` → intercepter demandes de permission
- `SessionStart` → injecter context pack projet
- `Stop` → résumer session → Memory Keeper (rituel close-out RES-044)
- `SubagentStart/Stop` → traçage subagents dans `/trace`

Exit codes : `0` allow, `2` block + message à Claude, autres = erreur non-bloquante.

**Pattern OWASP ASI02** (RES-042, gouvernance.md) : hook pre-action qui bloque `rm -rf`, `DROP TABLE`, `git push --force`, `curl externe` + log obligatoire. C'est l'implémentation déterministe de CLAUDE.md §5.

---

## Application MAS Phase 6

Quand on récupère RES-025/026/027 :
- Mapper les 8 hooks sur les 27 événements
- `settings.json` hooks pour : risky-action gates (PreToolUse), audit log (PostToolUse), context injection (SessionStart), memory close-out (Stop)
- Le hook `Stop` déclenche le rituel close-out automatique (RES-044) → Memory Keeper propose les entrées BDR/LRN/BLK

→ Demander à l'utilisateur de ré-exporter RES-025/026/027 depuis Notion (markdown) quand Phase 6 approche.

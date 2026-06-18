# Decisions — cluster skill:core-memory (lot N1)

Doer: ECC Harvest Phase C. Source: affaan-m/ecc (RO at /tmp/ecc-inspect). Audit: intake-audit (KILL, large bar, Sanitize, dedup vs packages/memory + mas-context-manager + mas-memory-keeper).

Format par bloc: `slug · décision · raison · dedup · chemin`.

---

## agent-architecture-audit
- **slug**: agent-architecture-audit
- **décision**: adopt (adapté MAS, maintainer-safe, Prompt Defense Baseline ajoutée)
- **raison**: Diagnostic 12-couches d'un stack d'agents (wrapper regression, memory contamination, tool-discipline, hidden repair loops, rendering corruption) — capacité absente de notre roster. Sert directement le self-audit §13 et le pre-flight avant tout feature agentique. Améliorations: surface mappée sur MAS (mas-reviewer/quality-controller/mas-memory-keeper en negative triggers), principe d'admission mémoire aligné §8, fix plan flag les actions gatées §5, KILL §11 explicite, Prompt Defense Baseline (l'agent lit du code non fiable).
- **dedup**: distinct de mas-reviewer (output-vs-brief), quality-controller (conventions/architecture drift), mas-memory-keeper (triage candidats). Aucun chevauchement — c'est un diagnostic de stack, pas une revue de sortie.
- **chemin**: packages/skills/library/agent-architecture-audit/SKILL.md
- **note origine**: upstream réel = oh-my-agent-check (conservé en `upstream_origin`); distribué via affaan-m/ecc (`origin`).

## agentic-os
- **slug**: agentic-os
- **décision**: reject (dup-pas-mieux)
- **raison**: Tutoriel pour transformer Claude Code en "OS agentique" (kernel CLAUDE.md, agents spécialistes, mémoire fichier, cron, data layer JSON/md). C'est exactement ce que MultiAgentOS EST déjà — et la version productionisée (Drizzle DB, dispatcher, niveaux d'autonomie, budgets, gates §5) dépasse de loin le blueprint. Pas un skill opérationnel pour nos agents, c'est un guide de construction de ce qui existe.
- **dedup**: dup de l'architecture MAS entière (CLAUDE.md §1-§8, packages/*, apps/worker). Le skill est strictement inférieur à l'implémentation existante.
- **chemin**: — (non retenu)

## autonomous-agent-harness
- **slug**: autonomous-agent-harness
- **décision**: reject (unsafe §11 + dup-pas-mieux)
- **raison**: Guide d'installation d'un harness autonome (crons, dispatch, computer-use MCP). KILL §11: l'exemple de dispatch embarque `Authorization: Bearer $ANTHROPIC_API_KEY` (curl PAYG) — auto-reject. Dup par ailleurs de l'autopilot scheduler + autonomie Phase 6 de MAS. C'est un setup guide, pas un skill opérationnel.
- **dedup**: dup de Phase 6 (risk classifier + autopilot scheduler) et du modèle d'autonomie §4. Inférieur + non sûr.
- **chemin**: — (non retenu)

## ck (context-keeper)
- **slug**: ck
- **décision**: reject (dup-pas-mieux + violation §8)
- **raison**: Mémoire per-projet via scripts Node + hook SessionStart écrivant dans `~/.claude/ck/`. Dup direct de la mémoire MAS (packages/memory: registers/retriever/capture/intake/classifier + mas-memory-keeper + mas-context-manager). Violation §8/CLAUDE.md: écrit HORS du repo (état MAS doit vivre dans `data/`, seul le Memory Keeper écrit la mémoire). Le store 5-registres de MAS est plus riche et gouverné.
- **dedup**: dup de packages/memory (store 5-registres, FTS retriever, auto-capture, intake) + mas-context-manager (context pack ≤4k). Inférieur + casse l'invariant d'écriture mémoire.
- **chemin**: — (non retenu)

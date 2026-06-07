# Backlog — Frameworks lourds dont extraire des patterns (pas adopter)

Frameworks multi-agents trop lourds pour MAS local-first single-user (violent "min deps / no framework sans ADR", CLAUDE.md §2). On **mine les patterns**, on n'adopte pas le stack.

---

## ruvnet/ruflo — Agent meta-harness pour Claude

**Quoi** : "nervous system" au-dessus de Claude Code. 33 plugins, 100+ agents, swarm coordination (queen-led, mesh, adaptive), consensus Raft/Byzantine/Gossip, AgentDB HNSW vectors, SONA neural patterns, federation zero-trust mTLS, 27 hooks, ~210 MCP tools. TypeScript 86%.

**Pourquoi PAS adopter** :
- Énorme : 33 plugins, daemon, federation cross-machine → MAS est single-user local-first, pas un cluster.
- Consensus Byzantine / Gossip / trust scoring → inutile sans multi-machine.
- AgentDB + GPU ruvector → QMD (CPU, local) suffit pour single-user.
- Adopter = violer §2 (no framework sans ADR) + §11 (multi-LLM avec failover déjà prévu Phase 3.5, mais en lean).

**Patterns à MINER (par phase MAS)** :

| Pattern ruflo | Application MAS | Phase |
|---------------|-----------------|-------|
| **Background workers auto-triggered** (12 : audit, optimize, testgaps) | mode **autopilot** : batches non-risqués (audit code, indexation, test gaps) déclenchés auto, report on resume | 6 |
| **SONA neural patterns** : store trajectoires réussies → retrieve similaires | **self-improvement** : Memory Keeper stocke les plans de mission réussis (LRN) → Mission Planner les retrouve pour missions similaires. = ReasoningBank. Lien GEPA (skills-reference.md) | 6+ |
| **27 hooks reactivity** | confirme anthropic-ecosystem.md hooks. Mapper sur risky gates Phase 6 | 6 |
| **Hybrid memory HNSW + graph traversal** | confirme combo **QMD (vector) + Graphify (graph)** (memory-patterns.md) | 4/5 |
| **Routing 89% accuracy** (benchmark) | cible de précision pour `mas-skill-router` domain routing | 3.5 |
| **AIDefence** : input validation, CVE scan, prompt injection block, PII detection | confirme grille audit skills (skill-install-policy.md) + OWASP ASI (vibeflow/gouvernance.md) | 6 |
| **GOAP A\* adaptive replanning** quand l'état change mid-exécution | re-planification Mission Planner sur rejet/scope change (déjà dans la fiche mission-planner `draft→clarified→planned`) | 5 |

**Décision** : carte de référence pour Phase 5/6. Quand on construit l'autopilot (Phase 6), relire les patterns "background workers" + "SONA trajectory memory". Ne pas cloner ruflo. Extraire le principe.

**Repo** : https://github.com/ruvnet/ruflo

---

## Autres frameworks déjà minés (référence)

Voir `docs/knowledge/frameworks-comparison.md` :
- **bobmatnyc/claude-mpm** (129⭐) — l'implémentation la PLUS proche de MAS. Channel Hub multi-sessions, ETag caching. À lire Phase 5 avant le dispatcher complet.
- **LangGraph** — checkpointing, `blockedBy`, HITL interrupt patterns → table `tasks`.
- **wshobson/agents** — three-tier model strategy (opus/sonnet/haiku par risk).
- **CrewAI, MetaGPT, AutoGen** — patterns ponctuels (rôles YAML, AFlow décomposition, débat).

**Articulation** : ruflo = le plus ambitieux (cluster/federation). claude-mpm = le plus proche (single-machine multi-session). MAS = le plus lean (single-user local-first). On vise claude-mpm en architecture, on mine ruflo pour les idées avancées (autopilot, self-improvement).

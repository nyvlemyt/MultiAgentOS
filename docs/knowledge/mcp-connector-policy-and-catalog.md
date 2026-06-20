# MCP Connector Policy + Catalog

*Source: `affaan-m/ecc` `docs/MCP-CONNECTOR-POLICY.md` + `mcp-configs/mcp-servers.json` (MIT), distilled 2026-06-21. Aligns to CLAUDE.md §11.bis (provider policy) and feeds [[project_linked_memory]] (Phase 4 second-brain / MCP work).*

## The connector decision rule (reusable)

A connector earns a **default** slot only if **both** hold:

1. **Universal** — applies to essentially every user, on every harness, with **no required API key** (a key fails universality → make it opt-in).
2. **MCP beats a CLI/REST-wrapped-in-a-skill** — the job genuinely needs what MCP uniquely gives: **held-open session state, streaming, an auth handshake, or structured browsing**. Stateless request/response work is a **skill**, not a server.

> Tool schemas load into *every* session — each default connector taxes every user's context window whether used or not. **Keep enabled defaults under ~10** (2026 field default is 0–2 + native built-ins). "Popular" is not an argument; "stateful and universal" is.

**Drop-for-skill heuristic** (ECC's June-2026 audit dropped 6 of 7 defaults): `github`→`gh` CLI skill; `context7`→REST docs-lookup skill; `exa`→harness-native WebSearch + opt-in skill; `playwright`→CLI e2e skills; `memory`/`sequential-thinking`→native harness memory + extended thinking (servers that wrapped no external system). Only `chrome-devtools` survived as default (interactive CDP session = textbook stateful case).

**MAOS application:** our cockpit should treat MCP servers as **opt-in, per-project**, not globally injected — mirrors §11.bis (provider SDKs confined, default OFF) and TOKEN_STRATEGY §6 (don't inject what you don't need). A candidate connector runs the two-prong test before it becomes a default.

## Catalog (opt-in pool worth knowing)

Grouped from ECC's `mcp-servers.json`. **Discovery only — never auto-install** (mirrors [[reference_skills_sh]] doctrine). Keys are user-supplied; none bundled.

### Memory / second-brain (directly relevant to P4)
- **omega-memory** (`uvx omega-memory serve`) — persistent agent memory with semantic search, multi-agent coordination, knowledge graphs. Richer than the basic memory server.
- **squish** (`npx squish-memory`) — local-first persistent memory, auto-captures across sessions, 1–20 ms recall, SQLite, no second LLM. Optional paid cloud sync.
- **longhand** (`longhand mcp-server`) — **lossless** session history: indexes raw tool calls / edits / thinking blocks from `~/.claude/projects/*.jsonl` into local SQLite + ChromaDB before rotation. Complements synthesized memory with *verbatim* recall.
- **memory** (`@modelcontextprotocol/server-memory`) — basic knowledge-graph store (mostly superseded by native harness memory).

### Research / docs
- **parallel-search** (http, key-free anon) — objective+queries → citation-backed excerpts in one call; replaces multiple keyword searches.
- **exa-web-search** (key) — web search/research/ingestion.
- **context7** (`@upstash/context7-mcp`) — live library documentation lookup (resolve-library-id / query-docs).

### Cost / privacy / tokens (relevant to §11 + router)
- **nexus** — local cost/privacy proxy: query own usage & savings, route to cheapest capable model, **mask secrets/PII before egress**. Conceptually parallels MAOS's RouterLLMClient + budget meter.
- **token-optimizer** — context reduction via dedup/compression.

### Eval / quality (relevant to mas-reviewer)
- **evalview** (`python -m evalview mcp serve`) — agent regression testing: snapshot behavior, detect tool-call/output regressions; deterministic checks work key-free.
- **codescene** (opt-in, key) — code-health MCP.

### Orchestration
- **devfleet** (http localhost) — dispatch parallel Claude Code agents in isolated worktrees; plan projects, auto-chain missions, structured reports. (Conceptual sibling of MAOS's own dispatcher.)

### Infra / platform (project-dependent, opt-in)
github · jira · confluence · supabase · clickhouse · vercel · railway · cloudflare-* · firecrawl · playwright · browserbase · browser-use · filesystem · magic (UI) · fal-ai · laraplugins.

## Why this matters for MAOS
- The **memory MCPs** (omega-memory / squish / longhand) are concrete candidates for the Phase-4 linked second-brain — evaluate each against our local-first + subscription-only constraints before adopting. longhand's *verbatim pre-rotation capture* is the most novel (nothing in MAOS does this yet).
- The **connector rule** gives us a crisp gate so the cockpit's MCP surface never bloats the context window.
- **nexus** validates our own router/budget direction (cheapest-capable routing + pre-egress secret masking).

Relates to [[project_linked_memory]] · [[reference_links_registry]] · CLAUDE.md §11.bis.

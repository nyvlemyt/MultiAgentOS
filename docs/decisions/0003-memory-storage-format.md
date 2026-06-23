# ADR 0003 — Memory storage & retrieval format (Phase 4)

- **Status**: Accepted — amended 2026-06-22 (Phase 9 · 0a renforcée: QMD now live, see amendment below)
- **Date**: 2026-06-08
- **Deciders**: Melvyn + Claude (pre-flight Phase 4)
- **Sources**: `docs/knowledge/memory-patterns.md`, `docs/knowledge/project-doctrine.md`, `docs/backlog/second-brain-cross-project.md`, `docs/workflows/knowledge-bootstrap.md`

## Context

Phase 4 builds the per-project memory ("second brain"): missions produce memory, memory rehydrates the next mission. Two questions must be settled before coding:

1. **Storage format** of the memory.
2. **Retrieval layer** (how an agent finds the right entry) — the distilled research proposes **QMD** (BM25+vector+rerank MCP server) *replacing* a custom SQLite-FTS5 index.

Hard constraints: local-first, subscription-only (§11, no PAYG embeddings → Mem0-cloud rejected), Memory Keeper is the sole writer to `data/memory/`, reversibility is a first-class cost (intake-audit §3), and Phase 4's exit gate includes the **persistence bridge** (seed `data/memory/_global/` from `docs/knowledge/` + `vibeflow/INDEX.md`, then prove a build-time fact is retrievable).

## Decision

**1. Storage = Markdown source-of-truth + derived SQLite index (memweave pattern).**
- Per project: `data/memory/<projectId>/` holds the **5 registers** — `decisions.md` (**BDR-XXX**), `learnings.md` (LRN-XXX), `blockers.md` (BLK-XXX), `journal.md` (per-date), `evals.md` (EVAL-XXX) + `audits/`.
- Global: `data/memory/_global/` for cross-project knowledge (seed target of the bridge).
- The Markdown is the source of truth (human-readable, Obsidian-openable). The SQLite index is **derived and rebuildable** from a SHA-256 hash of the `.md` files.
- The existing `memory_items` / `memory_candidates` tables stay as the **structured candidate/promotion pipeline**; the 5 registers are the **human/agent-readable judgment layer (N3)**.

**2. Retrieval = SQLite FTS5 behind a `MemoryRetriever` interface for the Phase 4 MVP. QMD is the planned upgrade, swapped behind the same interface (Phase 4.x).**
- Define `MemoryRetriever { query(q, opts): MemoryHit[] }` in `packages/memory/`.
- Ship `FtsRetriever` (SQLite FTS5/BM25) for the MVP.
- `QmdRetriever` lands later (see `docs/intake/2026-06-08-qmd.md`) as a one-file swap, with its own mini-gate.

## Rationale

- FTS5 is **already in the stack** (better-sqlite3), zero new dependency, trivially reversible.
- It **satisfies the Phase 4 exit gate**: the bridge acceptance tests are exact-term lookups (`"BDR"`, `"Mem0 cloud"`, `"95% builders"`) — BM25 nails these. Semantic/rerank is not needed to pass the gate.
- QMD's cost is real: **~2 GB of models**, an **MCP server process**, a **single-maintainer** young repo. That cost is not justified on a small early corpus — but it *is* the right target once recall goes fuzzy / the corpus grows.
- The `MemoryRetriever` seam makes "FTS5 now, QMD later" **non-lossy and cheap** — honoring reversibility (§3) without giving up the more powerful tool.

This sequences (does not contradict) `memory-patterns.md`, whose "Phase 4 target" lists QMD: QMD remains the target retriever; it lands in **4.x**, not the 4-MVP critical path.

## Alternatives considered

- **QMD now (in the 4-MVP)** — rejected: blocks the memory MVP on a 2 GB / MCP / young dependency for benefit the exit gate doesn't require. Kept as the fast-follow upgrade.
- **Mem0 / MemOS / external memory framework** — rejected: Mem0 default needs OpenAI embeddings → PAYG → §11. No external memory framework without its own ADR.
- **Pure Markdown, no index** — rejected: no retrieval → can't pass the bridge's retrievability test.
- **Graphify for memory** — rejected (wrong layer): Graphify indexes *codebases* for the Context Manager, not the Markdown memory. See `docs/intake/2026-06-08-graphify.md` + future ADR 0006.

## Consequences

- New package `packages/memory/` with the `MemoryRetriever` interface + `FtsRetriever` + the Markdown register read/write (Memory Keeper-owned).
- The **persistence bridge** is part of Phase 4 exit criteria: an idempotent seed importer (Memory Keeper-owned) reads each `docs/knowledge/*` + `vibeflow/INDEX.md` → `data/memory/_global/` entries carrying `source:` provenance; a retrieval query for a known build-time fact must return the seeded entry. (Acceptance test: `docs/backlog/second-brain-cross-project.md` §"Test d'acceptation du pont".)
- **Naming**: project-level decisions use **BDR-XXX** (project-doctrine, retained). Build-time architecture decisions use **ADR-000X** in `docs/decisions/`. Same shape, different registers — do not conflate.
- Cap discipline holds: ≤5 global-memory items injected per mission call (§12), regardless of store size.
- QMD adoption later requires: models pinned/hashed (supply-chain), MCP wired into the worker, interface unchanged.

## Decision note (2026-06-22) — `memory_items` fate = reserved (Phase 9 · 0a)

The live N3 store is the Markdown registers under `data/memory/` (this ADR §1). The `memory_items` table is a **structured mirror**: it is only demo-seeded (`packages/db/src/seed.ts`) and is **never read at runtime**. During Phase 9 · 0a (memory activation) its fate was settled: **keep it as RESERVED, do not drop it.**

- **Why not remove**: reversibility is a first-class cost (intake-audit §3 / CLAUDE.md §5). Dropping it would mean a destructive migration with no functional gain; keeping it preserves the option of a future structured-promotion target (candidate → `memory_items` mirror) without re-litigating schema.
- **Why not wire in**: the Markdown source-of-truth + FTS index already satisfies the Phase 4 retrievability gate; a second read path would create two stores to keep in sync (memory-patterns anti-pattern).
- **Action taken**: a `RESERVED` comment block above the table in `packages/db/src/schema.ts`. **No migration**, **no schema change**. Wiring it into runtime reads later requires its own ADR.

## Amendment (2026-06-22) — QMD is now live (Phase 9 · 0a renforcée)

Decision §2 said "FTS5 now, QMD later (Phase 4.x)". The fast-follow is done: **QMD
is live as the primary retriever, with FTS as the fallback** — same
`MemoryRetriever` seam, exactly as §2's reversibility argument promised. The
sequencing in this ADR is fulfilled, not reversed.

**What changed**

1. **QMD now, not deferred.** `QmdRetriever` (BM25 + vector + rerank, via
   `@tobilu/qmd`) is wired into the dispatch memory-context path through
   `createRetriever` / `UnifiedRetriever`. The 4-MVP FtsRetriever is unchanged and
   now serves as the documented fallback.

2. **Retrieval is unified across three corpora — knowledge + memory + arsenal.**
   QMD indexes one path per collection: `mas-knowledge` (`docs/knowledge`),
   `mas-workflows` (`docs/workflows`), `mas-memory` (`data/memory`), and
   `mas-arsenal` (`data/arsenal-index`, derived L1-summary stubs). The
   mission-memory context queries `[mas-memory, mas-knowledge, mas-workflows]`
   (`QMD_MEMORY_COLLECTIONS`); `mas-arsenal` is the Skill Router's candidate
   corpus, queried separately. One engine, one ranking, three registers — "what
   the system knows" and "what the system remembers" share a retriever.

3. **FTS is the fallback, and the degradation is never silent.**
   `UnifiedRetriever` runs QMD primary and catches into FTS over the same corpus.
   `createRetriever` selects FTS when QMD is unavailable (no `.qmd` index / no
   binary) and **never crashes**. `MAS_RETRIEVAL_BACKEND=fts` forces FTS (CI
   default for agent tests). At worker boot `retrievalDoctor` logs the active
   backend and, when QMD is absent, tells the user to run `pnpm qmd:setup`; the
   same is exposed as `pnpm mem:doctor`. A fresh clone is informed, not silently
   degraded.

4. **Store / search / decide boundary holds.** QMD only **reads** the Markdown
   source-of-truth (and the derived arsenal stubs); it **never writes** to
   `data/memory/` — the Memory Keeper remains the sole writer (§8). The `.qmd`
   index and `data/arsenal-index/` are **derived, rebuildable, gitignored** (the
   §1 "derived & rebuildable" principle, generalized). QMD *searches*; the Keeper
   *stores*; the agents *decide*. Three roles, no overlap.

5. **QMD = optional external runtime dependency, not an npm dependency.** The
   first `qmd embed` downloads **~4.4 GB** of GGUF models; vendoring that into
   `pnpm install` would tax every clone for an optional capability. So QMD is
   installed out-of-band via `pnpm qmd:setup` (pins `@tobilu/qmd@2.5.3`,
   supply-chain §5), requires **Node ≥ 22**, and its absence degrades to the FTS
   fallback documented above. Runbook:
   [`docs/workflows/qmd-retrieval-setup.md`](../workflows/qmd-retrieval-setup.md).

**Billing isolation (§11) re-confirmed.** QMD is a 100 %-local shell binary behind
the `MemoryRetriever` seam: no API key, no network at query time, no provider SDK
import. It does not touch the subscription quota. Compliant.

**Consequence update.** The §52 "QMD adoption later requires" checklist is
discharged: CLI pinned (`@tobilu/qmd@2.5.3`), interface unchanged
(`MemoryRetriever`), and — per the user-validated decision this session — QMD is
queried **out of the worker process** via the same CLI rather than wiring a
long-lived MCP server into the worker; the MCP server remains available for
interactive use (`.mcp.json`). Semantic + arsenal recall is proven by the golden
eval harness (`pnpm mem:eval`, backend=qmd).

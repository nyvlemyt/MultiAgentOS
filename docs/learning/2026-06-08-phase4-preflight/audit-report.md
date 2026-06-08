# Pre-flight intake-audit — Phase 4 · Memory

**Date**: 2026-06-08 · **Method**: `docs/workflows/intake-audit-template.md` + `knowledge-bootstrap.md §3` (per-phase pre-flight) · **Scope**: Phase 4 only (memory), not the whole resource batch.

> Goal of a pre-flight: **decide** the Phase 4 architecture from our distilled knowledge **before** writing code. No code in this step. Output = this report + 2 ADRs + 2 intake dossiers + the ready-to-paste build prompt.

## 0. Guard-rails re-stated (intake §0)

Local-first · single-user cockpit · **subscription-only, no PAYG (§11)** · LLM only via `packages/core/src/llm.ts` · Memory Keeper is the **sole writer** to `data/memory/` (§8) · progressive disclosure (L1→L2→L3) · risky actions gated (§5) · no major framework without an ADR · **phase discipline**: don't let future-phase scope in the back door.

## 1. The mental model we're building to (grounded, not invented)

Memory is **three levels**, not one (`memory-patterns.md §RES-041`):

| Level | What | MAS owner |
|------|------|-----------|
| **N1 Storage** | archived facts/context | derived SQLite index over Markdown |
| **N2 Recall** | what surfaces at the right time | `MemoryRetriever` (FTS5 → QMD) |
| **N3 Judgment** | *why* you chose, what you learned, what drifted | the **5 registers**, written **only** by Memory Keeper — never delegated to a plugin |

N3 is **judgment, not signal** — a plugin can archive/recall a decision's text, it cannot generate the reasoning. That's why MAS keeps N3 in-house.

## 2. Items audited (full dossiers linked)

| Item | Decision | Why (1-liner) |
|------|----------|---------------|
| **5 registers** (BDR/LRN/BLK/journal/EVAL) | **implement_now** | Already our doctrine (`project-doctrine.md`); the N3 layer. |
| **Markdown + derived SQLite FTS5** (memweave) | **implement_now** | Zero-dep, in-stack, rebuildable, reversible. **ADR 0003**. |
| **Persistence bridge** (seed `_global` from `docs/knowledge/`) | **implement_now** | Hard exit gate — anti-amnesia (`second-brain-cross-project.md`). |
| **QMD** (BM25+vector+rerank MCP) | **backlog_next (4.x)** | Target retriever, but lands behind `MemoryRetriever` after the MVP. 2 GB models + MCP not justified for the gate. [dossier](../../intake/2026-06-08-qmd.md) · ADR 0003 |
| **Graphify** (codebase graph) | **backlog_next (5 / PoC)** | Wrong layer (codebase, not memory); executes code + spawns sub-agents → sec-audit + ADR 0006 first. [dossier](../../intake/2026-06-08-graphify.md) |
| **Prompt caching** (2 breakpoints) | **implement_now** | Cheap win in `claudeCodeLLM` (system + context-pack). |
| **mem0 / MemOS** (external mem frameworks) | **reject** | Default OpenAI embeddings → PAYG → §11. |
| **Multi-account router** | **backlog (Phase 3.5)** | Captured in **ADR 0002**; built *after* memory (it depends on memory for grounding). |

## 3. Decided Phase 4 architecture

```
data/memory/
├── _global/                      # cross-project knowledge (bridge seed target)
│   ├── knowledge/                #   seeded from docs/knowledge/* (source: provenance)
│   └── decisions.md, learnings.md ...
└── <projectId>/
    ├── decisions.md   # BDR-XXX
    ├── learnings.md   # LRN-XXX
    ├── blockers.md    # BLK-XXX
    ├── journal.md     # per-session
    ├── evals.md       # EVAL-XXX
    └── audits/        # auditor reports (Quality Controller, later)

packages/memory/                  # NEW package
├── registers.ts                  # read/write the 5 .md registers (Memory Keeper-owned)
├── retriever.ts                  # MemoryRetriever interface + FtsRetriever (MVP)
├── seed.ts                       # idempotent bridge importer (docs/knowledge → _global)
└── index.ts
```

- **Write path locked**: only the Memory Keeper agent / its code path writes `data/memory/`. The `memory_candidates` table (already in schema) stays the proposal inbox; promotion writes a register entry.
- **Retrieval**: `MemoryRetriever.query()` over the derived FTS5 index; rebuilt from a SHA-256 of the `.md` files if the index is missing.
- **Injection**: per-project memory summary into the Mission Planner prompt; **≤5 global items per call** (§12). On-demand retrieval, **no auto-injection at startup** (anti-pattern `memory-patterns §297`).
- **Naming**: **BDR-XXX** for project decisions (distinct from build-time **ADR-000X** in `docs/decisions/`).

## 4. Build sequence (for the next session — see the build prompt)

1. `packages/memory/` skeleton + `MemoryRetriever` interface + `FtsRetriever` (TDD).
2. 5-register read/write (`registers.ts`), Memory Keeper-owned; wire to `memory_candidates` promotion.
3. Bridge importer `seed.ts` (idempotent, provenance-tagged) → `data/memory/_global/`.
4. Mission Planner injection (per-project summary + ≤5 global) + 2 prompt-cache breakpoints.
5. `/memory` page: accept/reject candidates, edit, retire (UI already stubbed).
6. Tests: registers round-trip, retriever BM25, **bridge acceptance test** (the hard gate).

## 5. Exit criteria / DoD (from ROADMAP Phase 4 + bridge test)

1. A 2nd mission on a project visibly uses the 1st mission's memory in its plan (Trace diff of system prompts).
2. **Bridge (hard gate)**: `data/memory/_global/` holds an entry traceable to **each** `docs/knowledge/*` + INDEX; a retrieval query for a known build-time fact returns it. Concrete cases: `"BDR"` → decision register; `"Mem0 cloud"` → rejected §11; `"95% builders"` → unsourced, don't propagate; `"40% Gartner"` → from "Structurer AVANT". A distilled fact **not** retrievable from runtime memory = **bridge failed = phase not done**.
3. Write path provably locked to Memory Keeper.
4. `pnpm -r test` green; new `packages/memory` tests green; e2e smoke green.

## 6. Self-audit (existing artifacts vs Phase 4 plan)

- `schema.ts`: `memory_items` + `memory_candidates` already exist (scope global/project, type enum) → reuse as the candidate/promotion pipeline. ✅ No migration churn beyond an FTS index table.
- `AGENTS.md`: `memory-keeper` (Tier A, haiku, 1500-tok budget) present; CLAUDE.md §8 locks the write-path. ✅ Consistent.
- Debt noted: no FTS index table nor 5-register file convention yet → that's the Phase 4 build, expected.

## 7. Deferred (do NOT pull into Phase 4)

- **QMD-now** → 4.x fast-follow behind the interface (mini-gate: models pinned, MCP wired, sec-audit).
- **Graphify / codegraph** → Phase 5 (ADR 0006 + sec-audit + PoC on OtakuGO).
- **Multi-account router** → Phase 3.5 (ADR 0002; needs memory first for grounding).
- **sqlite-vec / semantic** → Phase 5 (>200 items) if QMD not yet in.

## 8. Budget & risk

- Build budget (guidance): ~40 k tokens (ROADMAP Phase 4). Use **eco** + **MAS_MOCK_LLM** for tests (the bridge/retriever logic is deterministic — no live LLM needed for the gate).
- Risk: over-engineering retrieval (→ QMD too early). Mitigation: interface seam, FTS5 first. The bridge test is keyword-based → FTS5 passes it.
- **What NOT to do**: don't adopt QMD/Graphify in this phase; don't let any agent but Memory Keeper write `data/memory/`; don't auto-inject memory at startup; don't start Phase 3.5/router code.

## 9. Next step

Paste **[`phase4-build-prompt.md`](./phase4-build-prompt.md)** into a fresh session **after you give the explicit Phase 4 go** (CLAUDE.md §10 phase gate). It builds Phase 4 only and stops at the exit criteria.

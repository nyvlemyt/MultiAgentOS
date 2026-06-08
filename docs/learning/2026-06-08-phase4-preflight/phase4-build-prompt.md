# Phase 4 · Memory — ready-to-paste build prompts

Two prompts: **Doer** (build) then **Checker** (verify). Paste the Doer in a fresh session **only after you've said "go Phase 4"** (phase gate, CLAUDE.md §10). The pre-flight is done — architecture is decided in **ADR 0003** and `docs/learning/2026-06-08-phase4-preflight/audit-report.md`.

---

## ① DOER — paste this to build Phase 4

```
Build Phase 4 (Memory) of MultiAgentOS. The pre-flight is already done — DO NOT re-audit.

Read first: CLAUDE.md (esp. §8 memory, §11 billing, §12 knowledge), ROADMAP.md "Phase 4",
docs/decisions/0003-memory-storage-format.md, docs/learning/2026-06-08-phase4-preflight/audit-report.md,
docs/knowledge/memory-patterns.md, docs/knowledge/project-doctrine.md (5 registers),
docs/backlog/second-brain-cross-project.md (bridge acceptance test), AGENTS.md (memory-keeper).

Rules:
- Subscription-only, NO PAYG (§11). LLM only via packages/core/src/llm.ts. Use MAS_MOCK_LLM for tests.
- Memory Keeper is the SOLE writer to data/memory/ (§8). Enforce it in code.
- TDD (superpowers:test-driven-development) for the new domain logic. Conventional Commits ≤60 chars.
- eco mode for internal prose. Work on a NEW branch `phase/4-memory` off main — never push to main, never merge.
- STOP at the Phase 4 exit criteria. Do NOT start Phase 3.5 / the router. Do NOT adopt QMD or Graphify
  (they are deferred — FTS5 behind a MemoryRetriever interface per ADR 0003).
- Token budget this session: 40k. At 80% used, pause and report.

Build, in this order, committing + verifying each step:
1. packages/memory/ : MemoryRetriever interface + FtsRetriever (SQLite FTS5/BM25). Index derived from the
   .md registers, rebuildable from a SHA-256 of the files. TDD.
2. registers.ts : read/write the 5 registers in data/memory/<projectId>/ (decisions.md=BDR-XXX,
   learnings.md=LRN-XXX, blockers.md=BLK-XXX, journal.md, evals.md) + data/memory/_global/. Memory
   Keeper-owned. Wire promotion from the existing memory_candidates table → a register entry.
2b. CAPTURE mechanism (how sessions become memory_candidates) — do a 20-min mini-audit BEFORE coding it,
   pick the BEST local fit, record the choice as a BDR. Compare at least:
     - agentmemory (rohitg00) — automatic capture via Claude Code hooks (SessionStart/PostToolUse/Stop),
       RRF retrieval, ~-92% tokens. Read docs/knowledge/memory-patterns.md §agentmemory.
     - close-out ritual (project-doctrine 5-min / 3 questions) — explicit, zero-LLM.
     - mem0 ADD-only (single LLM call at session end) — but mem0 default = OpenAI embeddings → §11, reconfigure or drop.
   Constraints: §11 (no PAYG), local-first, cheap (prefer zero/low-LLM). Likely answer = ritual + optional
   hooks for auto-capture; but DECIDE it, don't default. The chosen mechanism writes memory_candidates rows.
3. seed.ts : idempotent bridge importer. Reads each docs/knowledge/* + vibeflow/INDEX.md → entries in
   data/memory/_global/ carrying `source:` provenance. Re-run = no duplicates.
4. Mission Planner injection: per-project memory summary + ≤5 global items per call (§12). On-demand
   retrieval, NO auto-injection at startup. Add 2 prompt-cache breakpoints (system + context-pack) in claudeCodeLLM.
5. /memory page: wire accept/reject candidates, edit body, retire stale (UI is already stubbed).

Naming: project decisions = BDR-XXX (NOT ADR — ADR-000X is build-time only, in docs/decisions/).

Definition of Done (all must pass — this is the gate):
- The CAPTURE mechanism is chosen with a 1-paragraph rationale recorded as a BDR (agentmemory hooks vs
  close-out ritual vs mem0 ADD-only), §11-compliant, and actually creates memory_candidates rows.
- A 2nd mission on a project visibly uses the 1st mission's memory in its plan (show it via the Trace
  diff of system prompts).
- BRIDGE (hard gate): data/memory/_global/ has an entry traceable to each docs/knowledge/* + INDEX, and
  a retrieval query returns the seeded entry for these build-time facts: "BDR", "Mem0 cloud", "95% builders",
  "40% Gartner". Any distilled fact NOT retrievable = bridge failed = phase NOT done.
- Write path provably locked to Memory Keeper (a test proving another path is rejected).
- pnpm -r test green + new packages/memory tests green + `lsof -ti:3000|xargs kill` then
  `pnpm --filter @mas/web smoke` green. Never leave unit/tsc red — if a fix breaks verification, revert it
  and backlog it.

Then write docs/learning/<date>-phase4-memory/build-report.md (done / deferred+reason / DoD status /
commit list) and STOP for my review. Do not start the next phase.
```

---

## ② CHECKER — paste this in a separate session to verify

```
Verify Phase 4 (Memory) of MultiAgentOS against its exit criteria. Read-only review — do NOT fix, report.

Read: docs/decisions/0003-memory-storage-format.md, docs/backlog/second-brain-cross-project.md
(§"Test d'acceptation du pont"), ROADMAP.md "Phase 4", the build-report under docs/learning/.

Check and give each a PASS/FAIL with evidence:
1. 5 registers exist for a project + data/memory/_global/ ; formats match project-doctrine (BDR/LRN/BLK/
   journal/EVAL).
2. Write path: prove NON-Memory-Keeper writes are rejected (find the guard + its test).
3. Bridge idempotency: run the seed importer twice → no duplicates; entries carry `source:` provenance;
   count(entries) ≥ count(docs/knowledge files) + 1 (INDEX).
4. Bridge retrievability (the real test): query the retriever for "BDR", "Mem0 cloud", "95% builders",
   "40% Gartner" → each returns the right seeded entry. List any build-time fact NOT retrievable.
5. Injection cap: a mission call injects ≤5 global items (§12); no auto-injection at startup.
6. NO scope creep: confirm QMD / Graphify / router code were NOT added (deferred per ADR 0003 / 0002).
6b. Capture choice: a BDR records why the chosen capture mechanism (agentmemory vs ritual vs mem0) beat
    the others, and it's §11-compliant (no PAYG embeddings).
7. Verification: pnpm -r test, per-package tsc, and `pnpm --filter @mas/web smoke` all green (paste output).

Output a verdict: PASS / NEEDS_WORK / BLOCK with a findings list. Do not modify files.
```

---

### Notes for the next session
- If the bridge retrievability test needs semantic recall (fuzzy queries) it does NOT today — the 4 facts are exact-term, FTS5/BM25 handles them. QMD stays deferred (ADR 0003).
- The multi-account router (ADR 0002) is the phase AFTER this. Memory must exist first so non-Claude providers can be grounded in project files.
- Keep `docs/knowledge/` and the ADRs in sync if you learn something new (knowledge-bootstrap §5.bis enrichment spiral).

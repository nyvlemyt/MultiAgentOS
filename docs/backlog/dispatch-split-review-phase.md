# Backlog — split dispatch.ts review phase (§7 size debt)

**Status:** ✅ RESOLVED 2026-06-25 (night build, committed on `phase/9c-roster` → #39). Was DEFERRED in 0c.
**Found:** Checker + cross-Reviewer, Wave 0c. **Severity:** low (pre-existing; runtime correct).

## What

Two CLAUDE.md §7 binary thresholds are exceeded in `packages/agents/src/dispatch.ts`:

- File length **1026 lines** (> 800).
- `runReviewPhase` (`dispatch.ts:432`) **105 lines** (> 50).

Both are **pre-existing** (base `d3cd68e`: file 1008, fn 87). Wave 0c added ~+18
to each via the advisory Agent-Evaluator block — it did not introduce the overage
but marginally widened it. Nesting ≤ 4 and per-function complexity are fine.

## Why deferred (not a 0c blocker)

A size refactor of the single dispatch chokepoint touches the worker and the web
inline path simultaneously; doing it inside the roster wave would couple an
unrelated structural change to the audit close-out and risk a cross-wave
regression. The §7 thresholds are a quality target, not a gate that fails the
build. Both verdicts (checker-verdict.md, reviewer-verdict.md) rate this MINOR/LOW
and recommend a card, not a wave blocker.

## Proposed fix (own attended PR)

Extract the review-phase critic sequence — **QC gate → sec loop (high/blocking)
→ reviewer (last task) → advisory Agent-Evaluator** — into a
`runCriticGates(db, m, all, llm, lastTask)` helper in a new
`packages/agents/src/review-phase.ts` module. `runReviewPhase` then orchestrates:
collect gates → compute `blocked` → persist status → fire close-out ritual. That
pulls `runReviewPhase` back under 50 lines and trims `dispatch.ts` toward 800.

Keep the contracts intact:
- `blocked` is still computed from `qc.verdict` + `verdicts[]` only.
- The Agent-Evaluator stays **advisory** (logged `agent_evaluation`, never pushed
  to `verdicts[]`, best-effort try/catch) — RES-043 4th-layer audit.
- No behaviour change; the move is mechanical. Cover with the existing
  `dispatch-evaluator.test.ts` + `dispatch.*.test.ts` suites (must stay green).

## Acceptance

`runReviewPhase` < 50 lines · `dispatch.ts` trending toward < 800 · 5 checks green
· Sonar exit 0 · no change to mission-status outcomes across the dispatch suites.

## Resolution (2026-06-25)

Split executed exactly as proposed, plus two extra extractions to clear the §7
file threshold:
- `mission-events.ts` (84 L) ← `logEvent`/`logEventDetached`/`lastMessageFor`/
  `loadBlockedWindows` + `type Db`.
- `mission-llm.ts` (166 L) ← `buildRetriever`/`memoryContextFor`/`getSkillRouter`/
  `selectLLM`/`buildMissionLLM` + `type ExecProject`.
- `review-phase.ts` (113 L) ← new `runCriticGates` helper + `runReviewPhase`.
- `dispatch.ts`: **1026 → 690 L** (< 800 ✓); `runReviewPhase` body **48 L** (< 50 ✓);
  re-exports `loadBlockedWindows` + `type Db`; unused imports pruned (S1128).

Behaviour preserved: `blocked` still from `qc.verdict` + `verdicts[]`; Agent-Evaluator
stays advisory; acyclic import graph (events ← llm ← review-phase ← dispatch).
5 local checks green (agents 125/125 unchanged, full suite 513 green, lint, build,
smoke 32/32). Sonar verified at PR time.

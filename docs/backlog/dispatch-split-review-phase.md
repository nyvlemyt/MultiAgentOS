# Backlog — split dispatch.ts review phase (§7 size debt)

**Status:** 🔵 DEFERRED — logged Phase 9 · 0c (2026-06-24). **Out of 0c scope.**
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

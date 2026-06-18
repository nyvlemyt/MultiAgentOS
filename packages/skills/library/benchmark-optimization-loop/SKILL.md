---
name: benchmark-optimization-loop
description: |
  Turns "make it 20x faster" or "try N recursive optimizations" into a bounded, measured loop that
  actually improves a system without breaking it. Requires a baseline, a correctness gate, a single
  metric, and an explicit search budget before any variant runs; promotes only the fastest variant
  that stays correct and is repeatable.
  Use when asked to make something faster, try many variants, run recursive/hyperparameter
  optimization, or pick the best implementation by repeated measured tests.
  Do NOT use to measure a one-off baseline with no variants (use benchmark), to optimize without a
  correctness gate, or to claim a "global optimum" from a non-exhaustive search.
summary: >-
  Bounded measured optimization loop. Refuses to optimize until five things exist: the operation,
  a correctness gate that must stay green, one metric (wall time / p95 / rows-sec / cost-run /
  memory / error-rate), the current baseline, and a search budget (max variants / time / spend /
  data impact). Loop: measure baseline → find bottleneck from evidence → generate variants testing
  ONE hypothesis each → run with identical input shape → reject any that fail correctness/safety/
  reproducibility → promote fastest safe variant → codify it in source → rerun to confirm delta.
  For recursive search, persist every run to a ledger, compare against the best accepted winner
  (not just the previous run), stop when gains are within noise or budget is hit. Say "best measured
  safe variant", never "global optimum" unless the space was truly exhaustive.
metadata:
  origin: affaan-m/ecc
  license: MIT
  cluster: skill:core-eval
  tier: T2
  status: library
---
<!-- pattern from affaan-m/ecc skills/benchmark-optimization-loop/SKILL.md -->

## Overview

"Make it faster" with no baseline, no metric, and no budget is how optimization work spirals into
unbounded variant-churn that may even regress correctness. This skill converts an open-ended
performance ambition into a bounded, evidence-driven search: keep the ambition, but make the loop
measurable and stoppable. It is the *search/loop* layer; `benchmark` is the *measurement* layer it
calls each iteration.

The discipline is that a faster variant is worthless until it is proven correct, repeatable, and
encoded somewhere durable. A speedup that cannot be reproduced or rolled back is a liability, not a
win.

## When to Use / When NOT

**Use when:**
- The user asks to make something faster, or to try many variants / recursive optimization.
- A hyperparameter or implementation choice should be decided by repeated measured tests.
- There is a real bottleneck and you can define a correctness gate and a search budget.

**Do NOT use when:**
- You only need a single baseline measurement with no variants → `benchmark`.
- No correctness gate exists — building one is the prerequisite, not optional.
- The search space is open-ended and you'd be tempted to claim a "global optimum".

## Principles

*Source: `affaan-m/ecc skills/benchmark-optimization-loop/SKILL.md`.*

1. **No optimization without a baseline and a correctness gate.** You cannot prove improvement
   against an unknown starting point, and a faster-but-wrong variant is a regression.
2. **One hypothesis per variant.** A variant that changes several things at once cannot tell you
   *which* change caused the delta — and cannot be explained or trusted.
3. **Bounded search.** Max variants, max time, max spend, max data impact are set up front. The loop
   stops when the budget is hit, gains fall within noise, or the search starts changing more
   variables than it can explain.
4. **Promote only the proven.** A winner becomes the default only after correctness passes, the
   delta is repeated or explained, rollback is obvious, and the change is encoded in source.
5. **Honest language.** "Best measured safe variant" — never "global optimum" unless the space was
   actually exhaustive.

## Process

1. **Establish the required baseline** (refuse to proceed without all five): the operation; the
   correctness gate that must stay green; the single metric (wall time / p95 latency / rows-sec /
   cost-run / memory / error rate); the current measured baseline; the search budget.
2. **Measure the baseline** with the real input shape.
3. **Identify the bottleneck from evidence** (profiles, timings), not from intuition.
4. **Generate variants**, each testing exactly one hypothesis.
5. **Run every variant with the identical input shape** so deltas are comparable.
6. **Reject** any variant that fails correctness, safety, or reproducibility.
7. **Promote** the fastest surviving variant.
8. **Codify** the winning path in a script, command, test, config, or runbook.
9. **Rerun baseline and winner** to confirm the delta is real and repeatable.

**Variant ledger** (track every run; for recursive search, persist to a durable file and compare
against the best *accepted* winner, not just the previous run; keep a holdout/replay check):

```text
Variant     | Hypothesis        | Command                      | Time | Correct? | Notes
baseline    | current path      | npm run job                  | 120s | yes      | stable
batch-500   | fewer round trips | npm run job -- --batch 500   | 42s  | yes      | winner
parallel-8  | more workers      | npm run job -- --workers 8   | 31s  | no       | rate limited
```

## Rationalizations

| Excuse | Reality |
|---|---|
| "Let's just try things and see what's faster." | Without a baseline and metric you can't prove anything got faster. Set them first. |
| "I'll change a few things in this variant to save time." | One hypothesis per variant. Bundled changes make the delta unexplainable. |
| "It's 4x faster, ship it." | Not until correctness passes, the delta repeats, and rollback is obvious. |
| "This is the optimal implementation." | Say "best measured safe variant" unless the search was exhaustive. |
| "The speedup is real, no need to write it down." | An unencoded, unreproducible win is a liability. Codify it in source or a runbook. |

## Red Flags

- Starting variants before a baseline and a correctness gate exist.
- A variant that changes more than one thing at once.
- Comparing each run only to the previous run instead of the best accepted winner.
- No search budget — the loop has no defined stopping condition.
- A promoted winner with no rollback path and no encoding in source control.
- The summary claims "optimum" without an exhaustive search.

## Verification Criteria

- [ ] Baseline, correctness gate, single metric, and search budget all defined before any variant ran.
- [ ] Each variant tested exactly one hypothesis and ran with the identical input shape.
- [ ] Every variant recorded in the ledger with time + correctness verdict.
- [ ] The promoted winner passed correctness, has a repeated/explained delta, and an obvious rollback.
- [ ] The winning path is encoded in a script / test / config / runbook (not just discussed).
- [ ] The loop stopped at a defined condition (budget hit / within noise / unexplainable variables).
- [ ] The summary says "best measured safe variant" unless the search was genuinely exhaustive.

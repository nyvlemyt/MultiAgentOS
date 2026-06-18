---
name: benchmark
description: |
  Measure performance baselines and detect regressions before/after a PR across four modes: page
  (Core Web Vitals via a browser tool), API (latency percentiles under load), build (cold build,
  HMR, test/typecheck/lint times), and before/after comparison against a stored baseline. Stores
  git-tracked JSON baselines so a team shares the same reference numbers.
  Use to set a performance baseline, gate a PR on regression, or compare stack alternatives.
  Do NOT use to run a recursive optimization search (use benchmark-optimization-loop), for visual/
  interaction QA (use browser-qa), or to declare "fast enough" without targets defined first.
summary: >-
  Performance baseline + regression detection. Four modes: (1) Page — Core Web Vitals via browser
  tool (LCP<2.5s, CLS<0.1, INP<200ms, FCP<1.8s, TTFB<800ms) plus bundle/page-weight; (2) API — hit
  each endpoint repeatedly, report p50/p95/p99, test under concurrency vs SLA; (3) Build — cold
  build, HMR, test-suite, typecheck, lint, container build times; (4) Before/After — save a baseline,
  make changes, compare with a delta+verdict table. Baselines stored as git-tracked JSON so the team
  shares them. Browser-MCP is an optional dependency: API and build modes need no browser. Define
  targets before judging; this skill measures, it does not search for the optimum.
metadata:
  origin: affaan-m/ecc
  license: MIT
  cluster: skill:core-eval
  tier: T2
  status: library
---
<!-- pattern from affaan-m/ecc skills/benchmark/SKILL.md -->

## Overview

"It feels slow" is not a measurement and "we made it faster" is not a proof. This skill produces
comparable, stored numbers: a baseline you can regress against, percentiles instead of averages,
and a before/after table with an explicit verdict per metric. Baselines are committed as JSON so the
whole team shares one reference rather than each person eyeballing their own machine.

It is the *measurement* layer. When the task is to iterate toward a faster implementation through
many variants, that is `benchmark-optimization-loop` (which calls this skill each iteration). When
the task is interaction/visual correctness rather than speed, that is `browser-qa`.

The browser tool is an **optional** dependency: page mode needs it, but API and build modes run with
nothing more than the project's own scripts.

## When to Use / When NOT

**Use when:**
- Setting a performance baseline for a project.
- Gating a PR: measure before and after to quantify the performance impact.
- A user reports "it feels slow" and you need real numbers.
- Comparing the current stack against an alternative.

**Do NOT use when:**
- You need to iterate through many variants toward an optimum → `benchmark-optimization-loop`.
- The concern is whether the UI *works* (forms, links, layout) → `browser-qa`.
- No targets/SLA are defined — set them first, or the verdict is arbitrary.

## Principles

*Source: `affaan-m/ecc skills/benchmark/SKILL.md`; Core Web Vitals thresholds per web.dev (INP replaced FID, March 2024).*

1. **Measure, don't estimate.** Every claim of "faster"/"slower" is backed by a stored number with
   the same input shape on both sides.
2. **Percentiles over averages for latency.** p50/p95/p99 expose the tail an average hides.
3. **A baseline is shared state.** Store it as git-tracked JSON so everyone regresses against the
   same reference, not a local one-off.
4. **Targets before verdicts.** Core Web Vitals targets / SLA must exist before a result can be
   judged pass or fail.
5. **Same input shape on both sides.** A before/after comparison is only valid when the load,
   concurrency, and data are identical.

## Process

Pick the mode(s) that fit the question:

1. **Page performance** (needs browser tool): navigate each target URL; measure Core Web Vitals —
   LCP < 2.5s, CLS < 0.1, INP < 200ms, FCP < 1.8s, TTFB < 800ms; measure resource sizes (page
   weight < 1MB, JS bundle < 200KB gzipped, CSS, images, third-party); count requests; flag
   render-blocking resources.
2. **API performance:** hit each endpoint many times (e.g. 100); report p50/p95/p99 latency,
   response size, status codes; test under concurrency (e.g. 10 simultaneous); compare to SLA.
3. **Build performance:** cold build time, hot-reload (HMR), test-suite duration, typecheck time,
   lint time, container build time.
4. **Before/after comparison:** save the current metrics as a baseline → make the change → compare,
   producing a delta + verdict per metric:

   ```text
   | Metric | Before | After | Delta   | Verdict  |
   |--------|--------|-------|---------|----------|
   | LCP    | 1.2s   | 1.4s  | +200ms  | WARN     |
   | Bundle | 180KB  | 175KB | -5KB    | BETTER   |
   | Build  | 12s    | 14s   | +2s     | WARN     |
   ```

5. **Store baselines** as git-tracked JSON (e.g. under a `benchmarks/` dir) so the team shares them.
6. **Integrate:** run the before/after comparison on every PR; pair with `browser-qa` for a full
   pre-ship checklist.

## Rationalizations

| Excuse | Reality |
|---|---|
| "It feels faster now." | Feel is not a measurement. Run before/after with the same input shape. |
| "Average latency is fine." | The average hides the tail. Report p95/p99 — that's where users hurt. |
| "I measured it on my machine, good enough." | A local one-off isn't shared state. Commit the baseline JSON. |
| "We're well under budget." | Only true if targets were defined first. Define the SLA/CWV targets, then judge. |
| "Before and after were close enough setups." | A different load or dataset invalidates the comparison. Identical input shape both sides. |

## Red Flags

- A "faster" claim with no stored before/after numbers.
- Latency reported as an average with no percentiles.
- A pass/fail verdict with no target or SLA defined beforehand.
- A before/after comparison run with different load, concurrency, or data on each side.
- Baselines kept locally and not committed, so teammates regress against different references.

## Verification Criteria

- [ ] Targets/SLA (Core Web Vitals or endpoint SLA) defined before any verdict was issued.
- [ ] Latency reported as p50/p95/p99, not a bare average.
- [ ] Before/after used the identical input shape (load, concurrency, dataset) on both sides.
- [ ] The baseline is stored as git-tracked JSON, not a local one-off.
- [ ] Each compared metric carries an explicit delta and verdict.
- [ ] Page mode degrades gracefully when no browser tool is available (API/build modes still run).

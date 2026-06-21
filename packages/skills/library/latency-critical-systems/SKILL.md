---
name: latency-critical-systems
description: "Use to design, diagnose, and optimize latency-sensitive or realtime systems — realtime dashboards, market-data feeds, streaming agents, queues, caches, execution gateways, HFT-like infrastructure — where freshness and tail latency (p95/p99) matter. Do NOT use for general feature work where latency is not a stated concern, to authorize live trading, or to give financial advice — this is an engineering lens only."
domain: backend
summary: "Engineering method for systems where freshness and tail latency are first-class. Split metrics instead of collapsing to 'fast': track p50/p95/p99, throughput, freshness age, queue depth, cache hit rate, provider response time, render time, correctness-under-load, and retry behavior. Map the full hot path (source event → provider → ingest → queue → cache → edge → client stream → render → visible state) and measure each segment. Optimize in order: remove round trips, cache stable reads with freshness metadata, batch, move compute closer, split hot/cold paths, apply backpressure, stream only when it helps, add staleness canaries. Verify with live readbacks (timings, freshness timestamps, queue/cache state, browser checks). Never hide stale data behind a fast cache hit; never claim ms behavior without measurement. Live orders / destructive migrations stay behind an approval gate (§5)."
metadata:
  origin: affaan-m/ecc
  license: MIT
  cluster: skill:core-agent
  tier: T2
  status: library
---
<!-- pattern from affaan-m/ecc skills/latency-critical-systems/SKILL.md -->

# Latency Critical Systems

## Overview

This skill is the engineering lens for systems where freshness and tail latency are the product, not an afterthought — realtime dashboards, market-data feeds, streaming agents, queues, caches, and execution gateways. The discipline it enforces is refusing to collapse performance into a single "fast" number: you split the metrics, map the entire hot path from source event to user-visible state, measure each segment, and optimize in a deliberate order. It is engineering-focused — it does not authorize live trading or give financial advice, and it never trades correctness or freshness honesty for a faster-looking number.

## When to Use / When NOT

Use when:
- The user cares about realtime behavior, hot paths, streaming freshness, or execution speed.
- Diagnosing why a dashboard, feed, or stream is slow or stale.
- Designing HFT-like or market-data-adjacent infrastructure (engineering only).

Do NOT use for:
- General feature work where latency is not a stated concern — premature optimization is waste.
- Authorizing live order execution or giving financial advice — out of scope; execution stays gated (§5).
- Pure correctness/logic bugs unrelated to timing — use standard debugging.

## Principles

*Source: `affaan-m/ecc skills/latency-critical-systems`; bound to CLAUDE.md §5 (live orders / destructive migrations / customer-impacting deploys require an approval gate) and the signal-density / observation-masking discipline in `docs/knowledge/skills-reference.md`.*

1. **Don't collapse to "fast".** Split the metrics: p50/p95/p99, throughput, freshness age, queue depth, cache hit rate, provider response time, render time, correctness under load, retry/failure behavior.
2. **Map the whole hot path.** Write the path from event to visible state and measure each segment separately — the bottleneck is rarely where you guessed.
3. **Optimize in order.** Cheap structural wins first (remove round trips, cache, batch) before exotic ones; don't reach for streaming until it demonstrably helps.
4. **Freshness honesty.** Never hide stale data behind a fast cache hit; carry freshness metadata and canary on staleness.
5. **Measure, don't claim.** No millisecond claim from a client label without a real measurement.
6. **Never trade away validation.** Latency wins must not drop required validation or correctness.
7. **Gate the dangerous path.** Live orders, destructive migrations, and customer-impacting deploys require an explicit approval gate (§5).

## Process

1. **Split the metrics.** Enumerate the metrics above for the surface in question; pick the ones that define "good" here.
2. **Map the hot path.** Write `source event → provider API → ingest → queue → cache → edge route → client stream → browser render → visible state` (adapt to the real topology).
3. **Measure each segment.** Instrument every hop; find where the p95/p99 budget is actually spent.
4. **Apply the optimization order.** (1) remove unnecessary round trips, (2) cache stable reads with freshness metadata, (3) batch small calls/writes, (4) move compute closer to data/user, (5) split hot/cold paths, (6) apply backpressure before queues grow unbounded, (7) stream only when it improves freshness/UX, (8) add canaries for stale data, degraded providers, bad cache state.
5. **Verify with live readbacks.** HTTP timings + headers, provider freshness timestamp, queue/job state, edge/cache state, browser verification for real UI freshness, retry/degraded-mode logs.
6. **For market-data/execution-adjacent paths,** also verify orderbook age, VWAP assumptions, provider status, and kill-switch behavior before calling the path ready.

## Rationalizations

| Excuse | Reality |
|---|---|
| "It's fast, the average is low." | Averages hide tails. Track p95/p99 — that's where users feel pain. |
| "Cache hit, so it's fresh." | A fast hit can serve stale data. Carry freshness metadata and canary on staleness. |
| "Add streaming, that'll make it realtime." | Streaming adds complexity. Use it only when it measurably improves freshness/UX; do the cheap wins first. |
| "The client logs say 8ms, ship it." | A client label is not a measurement. Verify with live readbacks. |
| "Drop that validation, it's on the hot path." | Latency never justifies dropping required validation. Split hot/cold instead. |
| "Just push the migration, it's quick." | Destructive migrations and customer-impacting deploys are gated (§5). |

## Red Flags

- Performance is reported as one "fast/slow" number with no percentile split.
- No hot-path map exists; optimization targets a guessed bottleneck.
- Stale data is served from cache without freshness metadata or a staleness canary.
- A latency claim has no live measurement behind it.
- Required validation was removed to hit a latency target.
- A live order, destructive migration, or customer-impacting deploy proceeds without an approval gate.

## Verification Criteria (binary pass/fail)

- [ ] Metrics are split (at minimum p50/p95/p99 + freshness age) — not a single "fast" number.
- [ ] A written hot-path map exists and each segment is measured separately.
- [ ] Optimizations followed the documented order; streaming was justified by a freshness/UX gain.
- [ ] Cached reads carry freshness metadata and a staleness canary exists.
- [ ] Claims are backed by live readbacks (timings/headers/freshness/queue/cache/browser).
- [ ] No required validation was dropped for latency.
- [ ] Any live order / destructive migration / customer-impacting deploy is behind an approval gate (§5).

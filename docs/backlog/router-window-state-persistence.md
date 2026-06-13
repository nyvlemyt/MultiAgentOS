# Backlog — Router quota-window state persistence

**Source**: Phase 3.5 Checker finding (info/medium), 2026-06-13. `docs/learning/2026-06-13-phase3.5-router/checker-verdict.md` §Findings #2.

## What

`RouterLLMClient` tracks each source's quota-window block state **in-memory** (`blockedAt` Map, 5h TTL) — [packages/core/src/llm.router.ts:45,64-74](../../packages/core/src/llm.router.ts#L45). On a worker restart the map resets, so a source blocked just before restart is treated as fresh and re-tried first (one wasted 429 round-trip, then it re-blocks and fails over correctly).

## Why it's only backlog, not a Phase 3.5 defect

- Not in the Phase 3.5 DoD (DoD #2 requires the failover *behavior* — 429 ⇒ blocked + fallback, 529 ⇒ retry — which is implemented and tested).
- Self-healing: a stale-fresh source re-blocks on its first post-restart 429, so failover still converges; the only cost is one extra blocked call per restart per recently-blocked source.
- ADR 0002's "reset on first successful call" intent holds within a single process.

## What to do (when picked up — 3.5b or Phase 5)

Persist window state to the `events` table (plan §2 step 3 named this): write a `window_blocked {source, blockedAt, ttlMs}` event on block, hydrate the `blockedAt` Map from the latest such events on `RouterLLMClient` init. Reset/clear on the first successful call per source (already the in-memory behavior). One migration-free change (events table exists). Add a test: a source blocked before "restart" (fresh client, same DB) is still skipped until TTL.

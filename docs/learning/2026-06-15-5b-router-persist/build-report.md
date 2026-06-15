# Build report — 5b · Router quota-window state persistence

Date 2026-06-15 · Branch `phase/5b-router-persist` · TDD (red→green per step).
Spec: `docs/learning/2026-06-15-5b-router-persist-preflight/plan.md`.

## Shipped

Persists `RouterLLMClient`'s in-memory 5h quota-block map to the `events` table so a
just-blocked source is not retried first on the next dispatch call or after a worker
restart. Core stays decoupled from `@mas/db`: persistence is injected as two optional
hooks (`initialBlocked` to hydrate, `onBlock` to persist), wired by the db-aware
`dispatch.ts`. TTL-clear stays as-is (`getWindowState` deletes on expiry); blocked
sources are never candidates, so TTL is the only clear — no clear-event needed. New
`window_blocked` event type is inert to the §8 quota meter (counts `llm_call` only).

## Files changed

- `packages/core/src/llm.router.ts` — `RouterLLMClientOptions`: `readonly initialBlocked?`
  + `readonly onBlock?`; constructor hydrates `blockedAt` from `initialBlocked`; quota
  branch captures `blockedAt` once and fires `onBlock(id, blockedAt)` with the same value.
- `packages/core/src/llm.router.test.ts` — +2 tests (hydrate recent→blocked / stale→fresh;
  `onBlock` spy fires `(id, now)` on a 429).
- `packages/core/src/providers/factory.ts` — `CreateRouterLLMOptions`: `initialBlocked?` +
  `onBlock?`; both passed into `new RouterLLMClient(...)`.
- `packages/agents/src/dispatch.ts` — hoisted `WINDOW_TTL_MS` const; new exported
  `loadBlockedWindows(db, now, ttlMs=WINDOW_TTL_MS)` (selects in-TTL `window_blocked`
  rows newest-first, latest `blockedAt` per source wins); `selectLLM` gains
  `initialBlocked?`/`onBlock?` passed to `createRouterLLM`; both call sites
  (`executeTaskWithLLM`, `resumeAfterValidation`) compute `initialBlocked` via
  `loadBlockedWindows(db, new Date())` and persist via `onBlock → logEventDetached`
  (`type: 'window_blocked'`).
- `packages/agents/src/router-persist.test.ts` — new suite (per-suite temp DB): expired
  rows dropped; newest `blockedAt` wins for a repeated source.

`loadBlockedWindows` is re-exported via the package index (`export * from './dispatch'`).

## Commits (3, on branch, not pushed)

- `feat(router): hydrate+onBlock window hooks` (Step 1)
- `feat(router): factory passes block hooks through` (Step 2)
- `feat(dispatch): persist+restore router windows` (Step 3)

## Verification — 4 local checks (Sonar = 5th, post-push)

`pnpm -r test` — PASS. Per package: core 95/95, agents 76/76, db 15/15, memory 41/41,
skills 11/11, web 70/70, worker 6/6 (all test files passed).

`pnpm lint` — PASS (exit 0). `lint-no-sdk-payg.sh`: no forbidden provider SDK imports;
all `tsc --noEmit` clean.

`pnpm build` — PASS (exit 0). web build emitted, all routes built.

`pnpm --filter @mas/web smoke` — PASS (exit 0). 31 passed (39.0s).

## Hard rules honored

- No `@anthropic-ai/sdk`; `llm.router.ts` does NOT import `@mas/db` (hooks-only seam).
- No `data/memory/` writes.
- Both hooks optional → existing router tests stayed green.
- Time-dependent `loadBlockedWindows` takes an explicit `now: Date`.
- Sonar pre-empt: readonly opts, hoisted TTL literal (S1192), `node:` import prefixes,
  no nested ternary, no `use*` helper, blockedAt captured once.

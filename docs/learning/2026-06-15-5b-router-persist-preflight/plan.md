# Pre-flight — 5b · Router quota-window state persistence

Date 2026-06-15 · Branch `phase/5b-router-persist` · Base `main` (bcd7e57, #17 merged).
Spec: `docs/backlog/router-window-state-persistence.md`.

## Problem
`RouterLLMClient.blockedAt` (5h TTL quota-block map) is in-memory. Worse than the
backlog implies: `selectLLM` builds a **fresh router per call** (no memoization), so the
block map resets every task AND every worker restart — a just-blocked source is retried
first (one wasted 429, then it re-blocks + fails over correctly). Persisting the window
state to the `events` table fixes both (per-call and per-restart) durability.

## Design (keep core decoupled from @mas/db — §architecture)
`RouterLLMClient` (in `@mas/core`) must NOT import `@mas/db`. Inject persistence as hooks
from the db-aware caller (`dispatch.ts`):
- **hydrate** via `initialBlocked: Record<sourceId, blockedAtMs>` passed into the client.
- **persist** via `onBlock(sourceId, blockedAtMs)` called when a source is quota-blocked.
TTL-clear stays as-is (`getWindowState` deletes on expiry); blocked sources are never
candidates so they never "succeed-clear" — TTL is the only clear, no clear-event needed.

## Existing code
- `packages/core/src/llm.router.ts` — `RouterLLMClientOptions` (l20), `blockedAt` (l45),
  constructor (l47), `getWindowState` (TTL delete, l63-74), `call()` quota branch sets
  `blockedAt` (l111).
- `packages/core/src/providers/factory.ts` — `createRouterLLM` / `CreateRouterLLMOptions`
  (l15), `new RouterLLMClient({config,env,clients,onEvent})` (l60).
- `packages/agents/src/dispatch.ts` — `selectLLM` (l108), call sites in `executeTaskWithLLM`
  (l564) + `resumeAfterValidation` (l684); `logEventDetached` (l168).
- `packages/db/src/schema.ts` — `events` (type/payloadJson/createdAt; nullable mission/task).
  The §8 quota meter counts `type='llm_call'` only, so a new `window_blocked` type is inert
  to it.

## Build steps (TDD — red before green, commit each)

### Step 1 — core hooks (`llm.router.ts`)
- `RouterLLMClientOptions`: add `readonly initialBlocked?: Readonly<Record<string, number>>;`
  and `readonly onBlock?: (sourceId: string, blockedAt: number) => void;`.
- Constructor: for each `[id, at]` in `initialBlocked`, `this.blockedAt.set(id, at)`.
- `call()` quota branch: after `this.blockedAt.set(id, now)`, call `this.opts.onBlock?.(id, now)`.
- RED first in `llm.router.test.ts`: (a) a client built with `initialBlocked` for a recent
  ts → `getWindowState(id)==='blocked'`; an entry older than TTL → `'fresh'`. (b) `onBlock`
  spy fires with `(id, now)` on a 429/quota block.

### Step 2 — factory passthrough (`factory.ts`)
- `CreateRouterLLMOptions`: add `initialBlocked?` + `onBlock?` (same types).
- Pass both into `new RouterLLMClient({ ... , initialBlocked: opts.initialBlocked, onBlock: opts.onBlock })`.

### Step 3 — db wiring (`dispatch.ts`)
- New `async loadBlockedWindows(db, now: Date, ttlMs = 5*60*60*1000): Promise<Record<string,number>>`
  — select `events` where `type='window_blocked'` and `createdAt >= now-ttl`, newest first;
  build a map taking the latest `blockedAt` per `source` from `payloadJson`.
- `selectLLM` opts: add `initialBlocked?` + `onBlock?`; pass them into `createRouterLLM`.
- At both call sites compute `const initialBlocked = await loadBlockedWindows(db, new Date())`
  and pass `onBlock: (source, at) => logEventDetached(db, { missionId, taskId, type:'window_blocked', payload:{ source, blockedAt: at } })`.
  (Time-dependent → take an explicit `now`/`Date` per CLAUDE.md; `loadBlockedWindows` accepts `now`.)
- RED first (agents test): write two `window_blocked` events (one within TTL, one expired) →
  `loadBlockedWindows` returns only the in-TTL source with its latest ts.

## Risks
- **Sonar** — `readonly` opts, hoist the TTL literal (one const, S1192), `node:`/no nested
  ternary, `localeCompare` if sorting, no `use*` helpers, keep `call()` complexity flat
  (the onBlock call is one line). Possible S1172 if a param goes unused — all are used.
- **No behavior change when persistence absent** — both hooks optional; existing router
  tests must stay green (run `llm.router.test.ts` unchanged first).
- **events write volume** — one `window_blocked` row per actual quota block (rare); inert to
  the §8 meter (counts `llm_call`).

## DoD (5 checks — §7)
`pnpm -r test` · `pnpm lint` · `pnpm build` · `pnpm --filter @mas/web smoke` ·
`scripts/sonar-pr-issues.sh <pr>` exit 0 + gate OK. Plus Checker PASS; the durability seam
demonstrated (hydrate→blocked across a fresh client + same DB).

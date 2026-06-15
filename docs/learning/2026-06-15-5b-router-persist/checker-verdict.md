# Checker verdict — 5b · Router quota-window state persistence

Date 2026-06-15 · Branch `phase/5b-router-persist` · Diff `git diff main HEAD`
(commits e685870 → 53ed15f). READ-ONLY review.

## Verdict: PASS

All five DoD checks are green and every architectural invariant holds. One item from
the explicit DoD/backlog — the **end-to-end durability seam test** (DB → load → fresh
client → `getWindowState==='blocked'`) — is asserted only as two isolated halves, not
as one bridging test. It is a real coverage gap against a stated DoD line but does not
break the shipped behavior (each half is verified), so it lands NEEDS_WORK-severity as
a finding rather than a BLOCK. Recommend adding the bridge test before merge.

## Plan-step confirmation

### Step 1 — core hooks (`llm.router.ts`) — CONFIRMED
- `RouterLLMClientOptions.initialBlocked?: Readonly<Record<string, number>>` and
  `onBlock?: (sourceId, blockedAt) => void` added, both `readonly` (l38, l40).
- Constructor hydrates the block map from `initialBlocked` (l62-64).
- `call()` quota branch fires `this.opts.onBlock?.(id, blockedAt)` after `set` (l123),
  using the same `now` source as the stored `blockedAt` (l121) — consistent.
- RED→GREEN tests present: hydration recent→blocked / stale→fresh (l199-211); `onBlock`
  spy fires `(id, now)` on 429 (l213-227). Existing 20 router cases unchanged.

### Step 2 — factory passthrough (`factory.ts`) — CONFIRMED
- `CreateRouterLLMOptions` gains `initialBlocked?` + `onBlock?` (l24-27); both passed
  straight into `new RouterLLMClient({...})` (l66-67). Pure passthrough, no logic.

### Step 3 — db wiring (`dispatch.ts`) — CONFIRMED
- `loadBlockedWindows(db, now: Date, ttlMs = WINDOW_TTL_MS)` selects `window_blocked`
  events `>= now-ttl`, `orderBy(desc(createdAt))`, builds the map with
  `blocked[source] ??= blockedAt` (newest-first ⇒ latest per source wins) (l180-200).
- `WINDOW_TTL_MS = 5*60*60*1000` hoisted to one const, comment notes it must match the
  router default (l48-50). It does match `RouterLLMClient`'s `5*60*60*1000` default.
- `selectLLM` opts extended; both call sites (`executeTaskWithLLM` l596, l600-607;
  `resumeAfterValidation` l725, l729-736) compute `loadBlockedWindows(db, new Date())`
  and wire `onBlock` → `logEventDetached(... type:'window_blocked' ...)`.
- RED→GREEN tests: in-TTL only (l38-45); newest-blockedAt-wins (l47-54).

## Invariant checks

1. **No `@anthropic-ai/sdk`** — PASS. Zero hits in `packages/*/src` + `apps/*/{src,app}`
   (only node_modules bin scripts match). `pnpm lint` SDK guard prints
   "PASS: no forbidden provider SDK imports".
2. **core does NOT import `@mas/db`** — PASS. `llm.router.ts` & `factory.ts` have zero
   `import/require/import()` of `@mas/db`; the only occurrence is a doc comment
   (l36 router) explaining the decoupling. Persistence is injected via hooks only.
3. **No `data/memory/` writes; `window_blocked` inert to §8 meter** — PASS. Diff has no
   `data/memory/` write (matches are docs/comments). The §8 meter
   (`apps/web/lib/tokens.ts:76,87`) filters `eq(events.type, 'llm_call')`; the new
   `window_blocked` type is never counted by window-count or cache-ratio aggregates.
   `lib/tokens.test.ts` (2 tests) still green.
4. **Both hooks OPTIONAL → router behavior unchanged when absent** — PASS. All pre-5b
   `llm.router.test.ts` cases (domain resolution, paid ON, failover taxonomy, pool
   expansion, TTL reset) still pass; the two new hook cases are additive (22 total).
5. **Determinism** — PASS. `loadBlockedWindows` takes explicit `now: Date`; TTL filter
   `gte(createdAt, now-ttl)`; `desc(createdAt)` + `??=` ⇒ latest `blockedAt` per source
   wins. Tested directly. Router side also takes injectable `now` for state checks.
6. **End-to-end durability seam asserted** — PARTIAL (finding F1). The cross-restart
   property is verified as two disjoint halves: `router-persist.test.ts` asserts
   DB→`loadBlockedWindows`→map; `llm.router.test.ts` asserts `initialBlocked`→
   `getWindowState==='blocked'`. No single test feeds a real loaded map into a fresh
   `RouterLLMClient`/`createRouterLLM` and asserts the source is skipped until TTL —
   the exact scenario the backlog DoD names ("a source blocked before 'restart'
   (fresh client, same DB) is still skipped until TTL"). The seam is sound by
   composition, but the explicit DoD bridge test is missing.

## Local checks (run by Checker)

- `pnpm -r test` — PASS. core 95 · db 15 · skills 11 · memory 41 · agents 76
  (incl. `router-persist.test.ts` 2) · worker 6 · web 70. `llm.router.test.ts` 22 pass.
- `pnpm lint` — PASS, exit 0. SDK guard PASS; all `tsc --noEmit` Done.
- `pnpm build` — PASS, exit 0 (web build completes, all routes emitted).
- `pnpm --filter @mas/web smoke` — PASS, 31 passed (36.1s).

## Sonar (`sonar-recurring-rules.md`) assessment — pre-PR

- `WINDOW_TTL_MS` hoisted to one const (S1192) — OK.
- `node:` prefixes on all new node-builtin imports (both tests) — OK.
- `readonly` on new option fields — OK.
- No nested ternaries; `call()` complexity flat (onBlock is one line);
  `loadBlockedWindows` is a single linear loop — low cognitive complexity — OK.
- No `.sort()` without comparator, no `void` operator (`logEventDetached` is the
  S3735-safe helper), no `/tmp` literal (tests use `join(tmpdir(), ...)`) — OK.
- WATCH (low): the `onBlock` block is duplicated across the two `selectLLM` call sites
  (6 lines each, differing only in `m.id`/`next.id` vs `t.missionId`/`t.id`). This
  mirrors the pre-existing `onRouterEvent` duplication already on `main` (which passed
  Sonar), so it is expected to stay under the duplicated-lines threshold — but confirm
  `scripts/sonar-pr-issues.sh <pr>` exits 0 and gate==OK once the PR analysis lands.

## Recommendations (before merge)

- **F1 (NEEDS_WORK):** add one bridge test asserting the full seam — insert a
  `window_blocked` event, `loadBlockedWindows(db, now)`, feed the map as
  `initialBlocked` into a fresh `RouterLLMClient` (or `createRouterLLM`), assert
  `getWindowState(source)==='blocked'` and that the source is skipped on the next
  `call()`; plus the TTL-expired counterpart returning `'fresh'`. This closes the
  explicit DoD line "durability seam demonstrated (hydrate→blocked across a fresh
  client + same DB)".
- **F2 (INFO):** the 5th DoD check (`scripts/sonar-pr-issues.sh <pr>` exit 0 + gate OK)
  is pending PR creation; run it after push per CLAUDE.md §7.

```json
{
  "verdict": "PASS",
  "findings": [
    {
      "severity": "NEEDS_WORK",
      "message": "Durability-seam end-to-end test missing: the cross-restart property (DB window_blocked -> loadBlockedWindows -> fresh RouterLLMClient -> getWindowState==='blocked', skipped until TTL) is asserted only as two isolated halves, not one bridging test, despite being an explicit DoD/backlog line. Behavior is sound by composition; add the bridge test before merge."
    },
    {
      "severity": "INFO",
      "message": "5th verification check (scripts/sonar-pr-issues.sh <pr> exit 0 + qualitygate OK) is pending PR creation; run after push per CLAUDE.md §7."
    },
    {
      "severity": "INFO",
      "message": "onBlock logEventDetached block is duplicated across both selectLLM call sites (mirrors the pre-existing onRouterEvent duplication already on main). Expected under Sonar duplication threshold; confirm at PR analysis."
    }
  ]
}
```

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>

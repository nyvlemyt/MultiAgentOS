# Phase 6 · Autonomy + risk gates — Build report

**Date:** 2026-06-14 · **Branch:** `phase/6-autonomy` · **Mode:** autonomous, TDD (red→green per step)

## TL;DR
All 8 steps shipped. Backend safety (steps 1–6) complete; UI (step 7) shipped the
two read helpers + dashboard daily-report card + pending-validations indicator +
`/trace` label + smoke landmark. **No 6b deferrals required** — the full scope
landed within budget. The §5 gate is untouched; autopilot never bypasses it.

## 4 checks — all green

| Check | Result |
|-------|--------|
| `pnpm -r test` | **265 passed** (core 88, db 13, skills 11, memory 41, agents 62, web 46, worker 4). Exit 0 |
| `pnpm lint` | **Exit 0** — SDK-PAYG guard PASS (§11 + §11.bis), all `tsc --noEmit` clean |
| `pnpm build` | **Exit 0** — Next.js production build, all routes compiled |
| `pnpm --filter @mas/web smoke` | **29 passed** (Playwright). Exit 0 |

### Tails
```
pnpm -r test:
packages/agents test:  Test Files  14 passed (14)
packages/agents test:       Tests  62 passed (62)
apps/web test:       Tests  46 passed (46)
apps/worker test:       Tests  4 passed (4)   TEST EXIT: 0

pnpm lint:
PASS: no forbidden provider SDK imports (§11 + §11.bis)
apps/web lint: Done                            LINT EXIT: 0

pnpm build:
apps/web build: Done                           BUILD EXIT: 0

pnpm --filter @mas/web smoke:
27 [chromium] › Command Center shows the autopilot daily-report card and pending-validations indicator (Phase 6)
29 passed (34.2s)                              SMOKE EXIT: 0
```
(Sonar = 5th check, run by the main session after push.)

## What shipped (per step)

1. **Risk classifier** — `packages/core/src/risk-classifier.ts` (+test, 27 cases).
   Pure `classifyRisk()`, hoisted readonly `BLOCKING_RULES` table mirroring
   CLAUDE.md §5 → `blocking`; perms-declared high categories → `high`; shell-ish
   no-match → `needsLLMFallback`. Exported from core index.
2. **Planning wiring** — `dispatch.ts planMission` persists the stricter of
   classified vs planner risk, logs `risk_classified {rule, from, to}`, consults
   `mockSecReviewer` on `needsLLMFallback`. Test `risk-classify-wiring.test.ts`:
   an `rm -rf` task → `blocking` → pauses at the §5 gate. Existing gate untouched.
3. **`schedules` table** — `schema.ts` + drizzle-kit-generated migration
   `0007_panoramic_brood.sql` (the generator's stray `ALTER TABLE projects ADD
   language` was a meta-snapshot artifact — 0006 already adds it; removed the dup
   line so migrations apply cleanly). Schema test inserts/reads with defaults.
4. **Autopilot engine** — `packages/agents/src/autopilot.ts` (+test, 9 cases).
   `isWithinWindow` (day-of-week + HH:MM, midnight-wrap), `selectAutopilotMissions`,
   `runAutopilotTick` — runs only `risk ≤ maxRisk` via `executeNextTask` (gate
   intact), records higher-risk in `skippedHighRisk`, never executes them.
   Deterministic via explicit `now: Date`.
5. **Daily report** — `packages/agents/src/daily-report.ts` (+test, 3 cases).
   `buildDailyReport` counts events/validations + sums `quotaUnits`; `emitDailyReport`
   logs a `daily_report` event and writes `data/reports/<date>.md` (mkdir -p,
   never `data/memory/`). **quotaUnits only, no €.** `hasDailyReportFor` for the
   once-a-day guard.
6. **Worker** — `apps/worker/src/index.ts` refactored: exported `tick(db, now)`
   (dispatch loop + `runAutopilotTick` + `maybeEmitDailyReport`) and
   `maybeEmitDailyReport(db, now)` (once/day). API-key refusal + async shape kept;
   auto-start gated to the entry path so tests can import without booting the
   interval. Test `autopilot-tick.test.ts`: low-risk advances, high-risk stays paused.
7. **UI** — `apps/web/lib/autopilot.ts` (+test, 4 cases): `listPendingValidations`
   (validations→tasks→missions join) + `latestDailyReport`. Dashboard gained a
   **Daily report** card (`data-testid="daily-report-card"`) and a real
   **Pending validations** indicator (`data-testid="pending-validations"`) wired
   to live DB reads. i18n keys added (fr + en). `/trace` labels `daily_report`
   (and `risk_classified`). Smoke spec asserts both dashboard landmarks.
8. **Docs** — "Autonomy & autopilot safety" subsection added to
   `docs/knowledge/production-patterns.md`. New modules exported from package
   `index.ts` files. No new top-level files.

## Files

**Created:** `packages/core/src/risk-classifier.ts` (+`.test.ts`);
`packages/agents/src/autopilot.ts` (+`.test.ts`), `daily-report.ts` (+`.test.ts`),
`risk-classify-wiring.test.ts`; `packages/db/src/schedules-schema.test.ts`,
`packages/db/migrations/0007_panoramic_brood.sql` (+meta);
`apps/web/lib/autopilot.ts` (+`.test.ts`); `apps/worker/src/autopilot-tick.test.ts`;
this report.

**Edited:** `packages/core/src/index.ts`, `packages/agents/src/dispatch.ts`,
`packages/agents/src/index.ts`, `packages/db/src/schema.ts`,
`apps/worker/src/index.ts`, `apps/web/lib/i18n.ts`,
`apps/web/app/(cockpit)/page.tsx`, `apps/web/app/(cockpit)/trace/page.tsx`,
`apps/web/tests/smoke.spec.ts`, `docs/knowledge/production-patterns.md`.

## Exit criteria
- Autopilot advances a low-risk batch inside its window — covered by autopilot +
  worker tick tests.
- The audit log proves nothing high-risk ran unsupervised — a high-risk task in
  an autopilot window stays gated (`skippedHighRisk`, status never `done`/`running`),
  asserted in both `autopilot.test.ts` and `autopilot-tick.test.ts`.
- Wake-up report in `/trace` (event `daily_report` + friendly label) and on the
  dashboard (card) — smoke spec #27 asserts both landmarks.

## Sonar adherence (pre-emptive)
No `use*` helper names; `node:` import prefixes; `readonly` on rule table + result
interfaces; no nested ternaries; duplicated literals hoisted (`BLOCKING_RULES`,
`RISK_ORDER`, `ADVANCE_TYPES`, `EVENT_LABELS`); shared fixtures not copy-pasted
(autopilot/daily-report tests use distinct, local seed helpers; agents reuse
`testing.ts` where applicable); async `execFile` not used here (no shell-out added).

## Deferrals to 6b
None. (Reserved scope — richer trace styling, a dedicated validations queue page —
was not needed to meet the exit criteria and is left for a future pass if desired.)

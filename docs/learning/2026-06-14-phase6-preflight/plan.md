# Phase 6 · Autonomy + risk gates — Pre-flight plan

**Date:** 2026-06-14 · **Branch:** `phase/6-autonomy` (cut from `phase/5-tier-b`, since PR #10 is
unmerged — work chains) · **Autonomy:** autonomous overnight

## TL;DR
Make `autonomous` + `autopilot` modes run **safely**: a rule-based risk classifier (LLM/Sec-Reviewer
fallback seam) tags every task before dispatch; risky actions already pause via the §5 gate; an in-DB
autopilot scheduler runs only `risk ≤ low` batches inside a configurable window; a daily wake-up report
(missions advanced/blocked, validations pending, quotaUnits spent) lands in `/trace` (event) and on the
dashboard (card). TDD, mocked LLM, zero spend. Surfacing > cleverness — the audit log must prove
nothing high-risk ran unsupervised.

## Intake-audit (targeted, Phase 6)
Method `docs/workflows/intake-audit-template.md`. Kept from `docs/knowledge/production-patterns.md`:
- **Human-in/on/out-of-loop** ↔ `manual`/`assisted`+`autonomous`/`autopilot` (Martin Fowler). Worker
  stays **async** — humans are not request-response components.
- **Pub/Sub gate**: worker writes `validations` row → UI subscribes (SSE) → human clicks → resume.
  (Already implemented in `dispatch.ts pauseForRiskGate` + `resumeAfterValidation`.)
- **Circuit breakers**: `budget_exceeded → pause`, `rate_limit → fallback` (Phase 3.5 router),
  `task_timeout (5-min heartbeat) → fail/escalate`. Phase 6 adds the autopilot **maxRisk** breaker.
- **Plan-then-execute**: plan DAG in a clean context before touching external content (already so).
- **Decision:** no new dep, no ADR. One new table (`schedules`) via Drizzle migration. Re-audit Phase 7.
- **Distill:** add an "Autonomy & autopilot safety" note to `docs/knowledge/production-patterns.md`.

## Build steps (TDD — red before green)
1. **Risk classifier** — `packages/core/src/risk-classifier.ts` (+test).
   `classifyRisk(input: { title: string; description: string; action?: string }, opts?: { perms?:
   PermissionsConfig; declaredRisk?: Risk }): { risk: Risk; rule: string; needsLLMFallback: boolean }`.
   Rule table mirrors **CLAUDE.md §5** (always-gate → `blocking`): `rm `/`rm -rf`, `git reset --hard`,
   `git push --force`/`-f`, branch deletion (`git branch -D`, `git push * --delete`), writes to
   `.env*`/secrets/keystores, `curl … | sh`, `eval `, `sudo `. `high` for network sends / outbound /
   payments / message-send categories declared in `perms.categories` with `risk:high|blocking`.
   No rule → `max(declaredRisk, 'low')`; set `needsLLMFallback:true` when shell-ish tokens appear but
   no concrete rule matched (the Sec-Reviewer LLM refinement seam; mocked now). Pure + deterministic.
   Tests: each §5 pattern → blocking; a benign task → low/declared; ambiguous → needsLLMFallback.
2. **Wire classifier into planning** — in `dispatch.ts planMission`, run `classifyRisk` per task and
   persist the **stricter** of `classifyRisk.risk` vs the planner's `t.risk` to `tasks.risk`; log a
   `risk_classified` event with the matched rule. (LLM fallback: when `needsLLMFallback`, call
   `mockSecReviewer` and bump to `blocking` on BLOCK.) Keep existing gate behavior intact.
   Test: a mission whose task title contains `rm -rf` ends up `blocking` + paused at the §5 gate.
3. **`schedules` table** — Drizzle migration + schema in `packages/db`.
   `schedules { id, projectId→projects, kind:'autopilot', windowStart:text 'HH:MM',
   windowEnd:text 'HH:MM', daysJson:text default '[0..6]', maxRisk:'low'|'medium' default 'low',
   enabled:boolean default true, lastRunAt:epoch?, createdAt:epoch }`. Export types. Generate the
   migration with the repo's drizzle-kit script; commit the SQL. Test: migration applies; insert/read.
4. **Autopilot engine** — `packages/agents/src/autopilot.ts` (+test).
   `isWithinWindow(schedule, now): boolean` (HH:MM + day-of-week, handles wrap-past-midnight).
   `selectAutopilotMissions(db, now): Promise<Mission[]>` — dispatchable missions whose project is
   `autonomy:'autopilot'` AND has an enabled schedule active at `now`.
   `runAutopilotTick(db, now): Promise<{ ran: string[]; skippedHighRisk: string[] }>` — for each such
   mission, only auto-execute tasks with `risk ≤ schedule.maxRisk` (default low); anything higher is
   left for the §5 gate and recorded in `skippedHighRisk`. Reuses `executeNextTask`'s gate — never
   bypasses it. Test: low-risk task auto-runs in-window; high-risk task is skipped/paused, never run;
   out-of-window → nothing runs.
5. **Daily report** — `packages/agents/src/daily-report.ts` (+test).
   `buildDailyReport(db, { since: Date; until: Date }): Promise<DailyReport>` — counts missions
   advanced (status change events), blocked, validations pending, tasks done, `quotaUnits` spent
   (sum events). `emitDailyReport(db, report)` logs a `daily_report` event (payload = report) so
   `/trace` renders it, and persists markdown to `data/reports/<date>.md`. **No € figures** — quota
   units only (CLAUDE.md §11 amendment). Test: counts correct over a seeded event window; event logged.
6. **Worker integration** — `apps/worker/src/index.ts`: tick also calls `runAutopilotTick(getDb(), new
   Date())`; on first tick of a new local day (or window open), call `emitDailyReport`. Guard so it
   fires once per day (check the latest `daily_report` event date). Keep the API-key refusal + async
   shape. Worker test: a stubbed-time tick within an autopilot window advances a low-risk mission and
   leaves a high-risk one paused.
7. **UI surface** — `apps/web`:
   - `lib/autopilot.ts` (+test): `listPendingValidations(db)` and `latestDailyReport(db)` read helpers
     (mirror `lib/health.ts` style; server-side DB read).
   - Dashboard (`app/(cockpit)/page.tsx`): a **"Pending validations"** count + a **"Daily report"**
     card showing the latest report figures. i18n keys via `lib/i18n.ts` (fr default + en).
   - `/trace` already renders events → confirm `daily_report` events show (add a label/icon).
   - Smoke (`tests/smoke.spec.ts`): assert the dashboard renders the daily-report card landmark and a
     pending-validations indicator.
   Scope guard: if UI runs long, ship the two read helpers + the dashboard daily-report card + smoke
   (the exit-criterion landmarks), and defer richer trace styling / a dedicated validations queue page
   to **6b** with a note. Backend safety (steps 1–6) is non-negotiable.
8. **Docs.** Add the "Autonomy & autopilot safety" note to `docs/knowledge/production-patterns.md`
   (classifier rule table source = §5, autopilot maxRisk breaker, daily report fields). No new
   top-level files.

## Files
- New: `packages/core/src/risk-classifier.ts`(+test); `packages/agents/src/autopilot.ts`(+test),
  `daily-report.ts`(+test); `packages/db/migrations/<next>_*.sql` + schema edit;
  `apps/web/lib/autopilot.ts`(+test).
- Edit: `dispatch.ts` (classifier wiring), `apps/worker/src/index.ts`, dashboard page + i18n,
  trace page (label), `packages/{core,agents}/src/index.ts` exports, `production-patterns.md`.

## Risks / mitigations
- **Time-dependent tests**: pass an explicit `now: Date` everywhere (no `Date.now()` inside logic) so
  window tests are deterministic. Worker passes `new Date()`.
- **Autopilot must never run high-risk**: `runAutopilotTick` routes through `executeNextTask`, which
  already pauses `high|blocking` at the §5 gate — autopilot only *selects*, never *bypasses*. Test the
  skip path explicitly (exit criterion: audit log shows nothing high-risk ran unsupervised).
- **§11 billing**: no € in reports (quotaUnits only); no SDK import; mocked LLM in tests.
- **§8 memory lock**: reports write to `data/reports/`, never `data/memory/`.
- **Migration determinism**: use the repo's drizzle-kit generate; never hand-edit applied migrations.

## Definition of Done (5 checks — Sonar is the 5th)
1. `pnpm -r test` green (new core/agents/web/worker suites; never export MAS_MOCK_LLM globally).
2. `pnpm lint` clean (incl. SDK-PAYG guard).
3. `pnpm build` clean.
4. `pnpm --filter @mas/web smoke` green (dashboard daily-report + pending-validations landmarks).
5. `scripts/sonar-pr-issues.sh <pr>` exits 0 (zero issues + zero hotspots) AND gate status OK. Apply
   `docs/knowledge/sonar-recurring-rules.md` proactively (no `use*` helpers, `node:` prefixes,
   readonly, no nested ternaries, hoist duplicated literals, dedup test fixtures across files).

Plus phase exit: autopilot advances a low-risk batch inside its window; the audit log proves no
high-risk task ran unsupervised; the wake-up report appears in `/trace` and on the dashboard.

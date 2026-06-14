# Phase 6 — Doer ① and Checker ② prompts (ready to paste)

---

## ① DOER prompt

You are the Doer for **Phase 6 · Autonomy + risk gates** of MultiAgentOS. Autonomous, TDD, on branch
`phase/6-autonomy` (already created from `phase/5-tier-b`). Read `CLAUDE.md` (esp. §5 risky actions,
§7 verification, §8 memory lock, §11/§11.bis billing, §12 knowledge), the Phase 6 section of
`ROADMAP.md`, `AGENTS.md`, and `docs/learning/2026-06-14-phase6-preflight/plan.md` — that plan is your
spec. Read `docs/knowledge/sonar-recurring-rules.md` BEFORE writing code and apply it. Inspect existing
patterns first: `packages/agents/src/dispatch.ts` (risk gate, planMission), `packages/db/src/schema.ts`
+ how migrations are generated (`package.json` `db:migrate` + drizzle-kit), `apps/worker/src/index.ts`,
`apps/web/lib/health.ts` + `apps/web/lib/i18n.ts` + `apps/web/app/(cockpit)/page.tsx` +
`app/(cockpit)/trace/page.tsx`, and `apps/web/tests/smoke.spec.ts`.

Build in this order, each step RED-before-GREEN (Vitest). Commit each step (Conventional Commits ≤60
chars, every message ending with `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`).

1. **Risk classifier** `packages/core/src/risk-classifier.ts` (+`risk-classifier.test.ts`).
   `classifyRisk(input: { title: string; description: string; action?: string }, opts?: { perms?:
   PermissionsConfig; declaredRisk?: Risk }): { risk: Risk; rule: string; needsLLMFallback: boolean }`.
   Pure/deterministic. Always-gate → `blocking`: `rm `/`rm -rf`, `git reset --hard`, `git push --force`,
   `push -f`, branch deletion (`git branch -D`, `git push * --delete`), writes to `.env`/secret/keystore
   paths, `curl ... | sh`, `eval `, `sudo `. `high`: outbound network/send/payment/message categories
   declared in `opts.perms.categories` with `risk:'high'|'blocking'`. No match → `risk = the stricter of
   'low' and opts.declaredRisk`, `rule:'none'`. Set `needsLLMFallback:true` when the text has shell-ish
   tokens (`bash`,`sh -c`,`>`,`|`,`chmod`,`ssh`) but no concrete rule matched. Hoist the rule patterns
   to a `readonly` const array of `{ pattern: RegExp; risk; rule }` (no duplicated string literals).
   Tests: each §5 pattern → blocking; benign → low/declared; ambiguous shell → needsLLMFallback true.
   Export from `packages/core/src/index.ts`.

2. **Wire into `planMission`** (`dispatch.ts`). For each planned task, compute `classifyRisk({title,
   description})` and persist `tasks.risk = strictest(classified.risk, planner t.risk)` (order
   low<medium<high<blocking). Log a `risk_classified` event `{ rule, from, to }`. If
   `needsLLMFallback`, call `mockSecReviewer(t.id,{risk})` and if it returns BLOCK set risk `blocking`.
   Do NOT change the existing §5 gate in `executeNextTask`. Test (in dispatch tests): a mission with a
   task titled/desc containing `rm -rf build` is stored `blocking` and pauses at the gate
   (`executeNextTask` → `paused_for_validation`).

3. **`schedules` table.** Edit `packages/db/src/schema.ts`: add `schedules` per the plan
   (`id, projectId→projects(onDelete cascade), kind('autopilot'), windowStart text, windowEnd text,
   daysJson text default '[0,1,2,3,4,5,6]', maxRisk('low'|'medium') default 'low', enabled boolean
   default true, lastRunAt epoch nullable, createdAt epoch`). Export `Schedule`/`NewSchedule` types.
   Generate the migration via the repo's drizzle-kit command (do NOT hand-write the applied SQL — run
   the generator, then commit the produced file). Add a schema-level test (apply migrations to a temp
   DB, insert + read a schedule).

4. **Autopilot engine** `packages/agents/src/autopilot.ts` (+test). `isWithinWindow(schedule, now:
   Date): boolean` — parse `windowStart`/`windowEnd` `HH:MM`, check `now`'s day ∈ daysJson and time in
   window (handle windows that wrap past midnight). `selectAutopilotMissions(db, now): Promise<Mission[]>`
   — dispatchable/executing missions whose project `autonomy='autopilot'` AND has an `enabled` schedule
   with `isWithinWindow`. `runAutopilotTick(db, now): Promise<{ ran: string[]; skippedHighRisk:
   string[] }>` — for each selected mission, inspect its runnable tasks; for `risk ≤ maxRisk` call
   `executeNextTask(mission.id)` (which still enforces the §5 gate); for any higher-risk runnable task
   record it in `skippedHighRisk` and do NOT execute it. NEVER bypass `executeNextTask`'s gate. Use the
   test helpers in `packages/agents/src/testing.ts` (extend if needed; no `use*` names). Tests: low-risk
   in-window auto-advances; high-risk in-window is skipped (status never `done`/`running`-then-done — it
   stays gated); out-of-window → ran empty.

5. **Daily report** `packages/agents/src/daily-report.ts` (+test). `DailyReport` type
   `{ since; until; missionsAdvanced; missionsBlocked; tasksDone; validationsPending; quotaUnits }`.
   `buildDailyReport(db, { since, until }): Promise<DailyReport>` — derive counts from `events`
   (`mission_*`, `task_done`) + `validations` (status pending) + sum `events.quotaUnits` in window.
   `emitDailyReport(db, report): Promise<void>` — `logEvent` a `daily_report` event (payload=report) and
   write markdown to `data/reports/<YYYY-MM-DD>.md` (mkdir -p; never `data/memory/`). NO € anywhere —
   quotaUnits only. Tests: seed events/validations in a window → correct counts; `daily_report` event
   present after emit.

6. **Worker** (`apps/worker/src/index.ts`). In `tick`, after the existing dispatch loop, call
   `runAutopilotTick(getDb(), new Date())` and log a line for ran/skipped. Add `maybeEmitDailyReport`:
   if no `daily_report` event exists for today's local date, call `emitDailyReport` for the last 24h.
   Keep the `ANTHROPIC_API_KEY` refusal and async shape. Add/extend a worker test (`startup.test.ts` or
   a new `autopilot-tick.test.ts`) using a temp DB + fixed `now`: a low-risk mission advances, a
   high-risk one stays paused.

7. **UI** (`apps/web`). `lib/autopilot.ts` (+test): `listPendingValidations(db)` (join validations→tasks
   →missions, status pending) and `latestDailyReport(db)` (most recent `daily_report` event payload).
   Mirror `lib/health.ts` for the DB-read style and `lib/*.test.ts` for the test style. Dashboard
   `app/(cockpit)/page.tsx`: add a **Daily report** card (figures from `latestDailyReport`) and a
   **Pending validations** indicator (count from `listPendingValidations`); add i18n keys to `lib/i18n.ts`
   (fr + en). `/trace` page: give `daily_report` events a clear label/icon. Extend `tests/smoke.spec.ts`
   with one spec asserting the dashboard shows the daily-report card landmark and the pending-validations
   indicator. Follow `docs/knowledge/sonar-recurring-rules.md` for a11y (labels, button names).

8. **Docs.** Add an "Autonomy & autopilot safety" subsection to `docs/knowledge/production-patterns.md`
   (classifier rule source = CLAUDE.md §5; autopilot `maxRisk` breaker; daily-report fields; quota-only,
   no €). Export new modules from the package `index.ts` files. No new top-level files.

**Hard rules:** TDD (watch red first). No `@anthropic-ai/sdk` import anywhere; don't touch
`packages/core/src/providers/`. Never export `MAS_MOCK_LLM` globally. Memory writes forbidden outside
Memory Keeper (reports go to `data/reports/`). All time-dependent logic takes an explicit `now: Date`
(no `Date.now()` buried in pure functions) for deterministic tests. Dedup any shared test fixtures into
`testing.ts` rather than copy-pasting across files (Sonar duplication). Use async `execFile` not
`execFileSync` if you shell out (S4036).

**When done**, run from repo root and capture exact tails: `pnpm -r test` · `pnpm lint` · `pnpm build` ·
`pnpm --filter @mas/web smoke`. Fix until all green (don't claim green without the real output). Write
`docs/learning/2026-06-14-phase6/build-report.md` (what shipped, files, the 4 check tails, deferrals to
6b) and commit it. Leave all commits on `phase/6-autonomy`; do NOT push (the main session pushes).

Return a concise summary: files created, commit count, pass/fail + numbers of each of the 4 checks.

---

## ② CHECKER prompt

You are the Checker for **Phase 6 · Autonomy + risk gates**. READ-ONLY — do NOT modify source. Repo
`/Users/melvyn/Documents/02_PROJETS/multiAgentOS`, branch `phase/6-autonomy`. Verify against
`docs/learning/2026-06-14-phase6-preflight/plan.md`, the Phase 6 section of `ROADMAP.md`, and `CLAUDE.md`
(§5, §7, §8, §11/§11.bis, §12). Build report: `docs/learning/2026-06-14-phase6/build-report.md`.

Check and record findings for each:
1. **Risk classifier**: every CLAUDE.md §5 always-gate pattern (`rm`, `git reset --hard`, `git push
   --force`, branch deletion, `.env`/secrets writes, `curl|sh`, `eval`, `sudo`) classifies as `blocking`;
   benign → low/declared; ambiguous → `needsLLMFallback`. Pure/deterministic (no hidden `Date.now()`).
2. **Planning wiring**: `planMission` persists the strictest of classified vs planner risk, logs
   `risk_classified`, and an `rm -rf` task pauses at the §5 gate in `executeNextTask`.
3. **Autopilot**: `runAutopilotTick` NEVER runs `risk > maxRisk` tasks — it routes through
   `executeNextTask` (gate intact) and records high-risk in `skippedHighRisk`. `isWithinWindow` handles
   day-of-week + midnight wrap. Confirm the exit criterion: **audit log proves nothing high-risk ran
   unsupervised** (a high-risk task in an autopilot window stays gated, not executed).
4. **Daily report**: counts derive from events/validations over the window; `emitDailyReport` logs a
   `daily_report` event and writes only under `data/reports/` (never `data/memory/`); **no € figures**,
   quotaUnits only.
5. **Worker**: tick calls autopilot + emits the daily report once/day; API-key refusal + async shape
   intact.
6. **UI**: dashboard shows the daily-report card + pending-validations indicator; `/trace` labels
   `daily_report`; smoke asserts the landmarks. i18n fr+en present.
7. **5 checks**: run `pnpm -r test`, `pnpm lint`, `pnpm build`, `pnpm --filter @mas/web smoke`; paste
   tails + numbers. (Sonar = 5th, run by the main session post-push — assess adherence to
   `docs/knowledge/sonar-recurring-rules.md`: no `use*` helpers, `node:` prefixes, readonly, no nested
   ternaries, no duplicated literals, deduped fixtures, async execFile.)
8. **CLAUDE.md**: §5 gate intact, §7 conventions (`git log --oneline`), §8 memory lock, §11 billing
   (no SDK, no €, mocked LLM), §12 knowledge note added.

WRITE your full verdict (markdown rationale per the 8 points + a fenced ```json `ReviewerVerdict`
`{ "verdict": "PASS"|"NEEDS_WORK"|"BLOCK", "findings":[{"severity":"info"|"warn"|"block","message"}] }`)
to `docs/learning/2026-06-14-phase6/checker-verdict.md` and commit ONLY that file (message
`docs(phase6): checker verdict`, ending with the Co-Authored-By line). Do not push. Prioritize coverage
over filtering — list every real finding. Return a 3-line summary: verdict + finding counts by severity.

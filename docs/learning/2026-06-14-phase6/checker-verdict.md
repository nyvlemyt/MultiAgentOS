# Phase 6 · Autonomy + risk gates — Checker verdict

**Date:** 2026-06-14 · **Branch:** `phase/6-autonomy` · **Reviewer:** Checker ② (read-only)
**HEAD:** `63a7e14` · **Verdict:** **PASS**

Verified against `docs/learning/2026-06-14-phase6-preflight/plan.md`, the Phase 6 section of
`ROADMAP.md`, `CLAUDE.md` (§5/§7/§8/§11/§11.bis/§12), and the Doer build report. All 4 local checks
run by me are green; the 5th (Sonar) is the main session's post-push step and adherence looks clean.

---

## 1. Risk classifier — PASS

`packages/core/src/risk-classifier.ts`. Pure/deterministic — no `Date.now()`, no I/O, no LLM. Every
CLAUDE.md §5 always-gate pattern is in the hoisted `readonly BLOCKING_RULES` table and maps to
`blocking`: `rm` (`\brm\b`), `git reset --hard`, `git push --force|-f`, branch deletion
(`git branch -D` + `git push … --delete`), `.env`/`secrets?`/`keystore`, `curl … | sh`, `eval`,
`sudo`. Benign → `low`/rule `none`; `declaredRisk` honoured via `stricter()`; ambiguous shell tokens
(`bash`,`sh -c`,`>`,`|`,`chmod`,`ssh`) with no concrete match set `needsLLMFallback:true`. Perms-declared
`high|blocking` categories raise risk. Test file covers all 13 §5 cases + benign + declared + perms +
ambiguous (88 core tests pass). Result interfaces are `readonly`. Exported from core index.

Note (info): patterns are intentionally broad (`\brm\b`, `\bsecrets?\b`, `\beval\b`) — they will gate
benign prose containing those words. That is the correct fail-safe direction (over-gate, never
under-gate) and consistent with §5 intent; no change required.

## 2. Planning wiring — PASS

`dispatch.ts planMission` computes `classifyRisk({title,description})` per task and persists
`stricterRisk(classified.risk, t.risk)` (RISK_ORDER low<medium<high<blocking). On `needsLLMFallback`
it consults `mockSecReviewer` and bumps to `blocking` on BLOCK. It logs a `risk_classified` event with
`{rule, from, to}`. The existing §5 gate in `executeNextTask` is **unchanged** — `pauseForRiskGate`
fires for `high|blocking` exactly as before. `risk-classify-wiring.test.ts` confirms an `rm -rf` task is
stored `blocking` and pauses (`paused_for_validation`).

## 3. Autopilot — PASS (exit criterion met)

`packages/agents/src/autopilot.ts`. `runAutopilotTick` only auto-runs a mission's next runnable task
when `RISK_ORDER[next.risk] ≤ RISK_ORDER[cap]`; anything higher is pushed to `skippedHighRisk` and
never claimed/executed. Tasks at/under the cap route through `executeNextTask`, which still enforces the
§5 gate (a gate-paused result is also recorded as skipped). No bypass path exists.
`isWithinWindow` handles HH:MM, day-of-week membership, and midnight-wrap (prev-day check for the
before-end branch). Tests assert: low-risk in-window → `done`; **high-risk in-window → `skippedHighRisk`,
status never `done`/`running` (stays gated)**; out-of-window → nothing runs. The audit-log exit
criterion (nothing high-risk runs unsupervised) is directly proven by `autopilot.test.ts` and the worker
`autopilot-tick.test.ts`.

## 4. Daily report — PASS

`packages/agents/src/daily-report.ts`. `buildDailyReport` derives counts from `events`
(advance types, `mission_blocked`, `task_done`), `validations` (pending), and sums `events.quotaUnits`
over `[since, until)`. `emitDailyReport` logs a `daily_report` event (payload = report) and writes
markdown **only** to `data/reports/<date>.md` (`mkdir -p`) — never `data/memory/` (§8 lock intact).
**No € anywhere — quotaUnits only** (grep confirms; an explicit "NEVER a € figure" comment cites §11).

Note (warn, minor): `missionsAdvanced` counts advancing *events*, not distinct missions, so one mission
crossing several states (dispatched→executing→validated) increments it multiple times. Field name vs.
semantics is imprecise for a telemetry surface. Non-blocking; consider renaming to `advanceEvents` or
de-duping by missionId in a follow-up.

## 5. Worker — PASS

`apps/worker/src/index.ts`. `tick(db, now)` runs the dispatch loop, then `runAutopilotTick(db, now)`,
then `maybeEmitDailyReport(db, now)` (guarded by `hasDailyReportFor` → once per local day, last-24h
window). `now` is explicit (deterministic). The `ANTHROPIC_API_KEY` refusal (`process.exit(1)`) and the
async/`setInterval` shape are intact; the interval only boots when run as the entry point, so test
imports don't start the loop. Worker tests: low-risk mission advances, high-risk stays paused, report
idempotent for a day.

## 6. UI — PASS

`apps/web/lib/autopilot.ts`: `listPendingValidations` (validations→tasks→missions join, status pending)
and `latestDailyReport` (most recent `daily_report` payload). Dashboard renders a **Daily report** card
(`data-testid="daily-report-card"`) and a **Pending validations** indicator
(`data-testid="pending-validations"`) from live DB reads. `/trace` labels `daily_report` (🌅 Daily
report). i18n keys present in **both fr and en** (`card.dailyReport*`, `card.pendingValidations`). Smoke
spec #27 asserts both landmarks visible; 29/29 smoke pass.

## 7. Five checks

| Check | Result |
|-------|--------|
| `pnpm -r test` | **265 passed**, exit 0 (core 88, db 13, skills 11, memory 41, agents 62, web 46, worker 4) |
| `pnpm lint` | **exit 0** — SDK-PAYG guard PASS (§11 + §11.bis), all `tsc --noEmit` clean |
| `pnpm build` | **exit 0** — Next.js production build, all routes compiled |
| `pnpm --filter @mas/web smoke` | **29 passed**, exit 0 |

Tails:
```
pnpm -r test:  packages/core 88 | db 13 | skills 11 | memory 41 | agents 62 | web 46 | worker 4   EXIT=0
pnpm lint:     PASS: no forbidden provider SDK imports (§11 + §11.bis) ... LINT EXIT=0
pnpm build:    apps/web build: Done                                       BUILD EXIT=0
pnpm smoke:    27 [chromium] daily-report card + pending-validations (Phase 6) ✓ ... 29 passed  EXIT=0
```

**Sonar (5th, pre-push assessment):** adherence looks clean — no `use*` helper names, `node:` import
prefixes on fs/crypto/path/url, `readonly` on rule table + result interfaces, no nested ternaries,
duplicated literals hoisted (`BLOCKING_RULES`, `RISK_ORDER`, `ADVANCE_TYPES`, `EVENT_LABELS`),
async `execFile` only (no `execFileSync`/`execSync` in new code). Run `scripts/sonar-pr-issues.sh <pr>`
post-push to confirm zero issues + zero hotspots and gate OK.

## 8. CLAUDE.md compliance

- **§5 gate** — intact; `executeNextTask` risk-gate body unchanged; autopilot never bypasses it.
- **§7** — Conventional Commits ≤60 chars, every message carries the Co-Authored-By line (`git log`
  verified). No new top-level files.
- **§8 memory lock** — reports write to `data/reports/`; no writes to `data/memory/` outside the Keeper.
- **§11/§11.bis billing** — `grep` of `apps/*/src` + `packages/*/src` finds **no `@anthropic-ai/sdk`
  import**; daily-report/autopilot/UI helpers carry no €; tests use mocked LLM (`MAS_MOCK_LLM` is never
  globally exported — only a local test note references it).
- **§12 knowledge** — "Autonomy & autopilot safety (Phase 6)" subsection added to
  `docs/knowledge/production-patterns.md` (classifier source = §5, maxRisk breaker, report fields,
  quotaUnits/no €).

## Drizzle meta drift (specifically requested)

- `0007_panoramic_brood.sql` contains **only** the `schedules` CREATE TABLE + `schedules_project_idx`
  index — **no stray ALTER** (grep confirmed). Generator output minus the hand-trimmed dup ALTER.
- `meta/0006_snapshot.json` is **missing** (snapshots jump 0005 → 0007), but `_journal.json` correctly
  lists all 8 entries including `0006_dapper_polaris`, and the `0006` migration SQL exists. All db /
  agents / worker tests migrate from 0000 and pass, so runtime is unaffected.
- Tracked in `docs/backlog/drizzle-0006-snapshot-drift.md` with a concrete fix-next-time plan.
- **Judgment: acceptable LOW-severity deferral, not a BLOCK.** The journal is the runtime source of
  truth and it is correct; the missing snapshot only affects future `drizzle-kit generate` diffs, which
  the backlog note flags. Recommend regenerating the meta chain on the next schema change.

---

## Findings

```json
{
  "verdict": "PASS",
  "findings": [
    { "severity": "warn", "message": "daily-report.ts: missionsAdvanced counts advancing EVENTS, not distinct missions — one mission crossing several states inflates the count. Field name vs semantics is imprecise. Consider de-duping by missionId or renaming. Non-blocking telemetry imprecision." },
    { "severity": "info", "message": "Drizzle meta/0006_snapshot.json missing (snapshots 0005→0007); _journal.json is correct and all migrations apply from 0000 in tests. Acceptable low-severity deferral, tracked in docs/backlog/drizzle-0006-snapshot-drift.md; regenerate meta chain on next schema change." },
    { "severity": "info", "message": "Pre-existing static '€0.35 / €3.00' Token budget placeholder card in apps/web/app/(cockpit)/page.tsx (introduced in Phase 0, commit c11765a). Unrelated to Phase 6 scope; the §11 no-€ rule is satisfied for the autopilot daily report. Worth replacing the placeholder with quotaUnits in a future UI pass." },
    { "severity": "info", "message": "risk-classifier patterns are intentionally broad (\\brm\\b, \\bsecrets?\\b, \\beval\\b) and will over-gate benign prose. Correct fail-safe direction per §5; no change required." },
    { "severity": "info", "message": "All 4 local checks green: pnpm -r test 265 passed (exit 0), pnpm lint exit 0 (SDK-PAYG guard PASS), pnpm build exit 0, smoke 29 passed (exit 0). Sonar 5th check to be run post-push by main session." }
  ]
}
```

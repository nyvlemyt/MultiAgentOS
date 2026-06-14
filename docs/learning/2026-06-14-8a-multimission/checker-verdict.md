# Checker verdict — item 3 / Phase 8 functional half · 3a multi-project parallel execution

Date 2026-06-14 · Branch `phase/8a-multimission` · Diff `git diff phase/techdebt-drizzle-inline HEAD`
Reviewer: Checker (read-only). HEAD `2ad3e5c`.

## Verdict: PASS

3a (multi-project parallel advance with per-project + global concurrency caps) is correctly built,
fully verified by deterministic tests, and clean against all four local checks plus the §5/§7/§8/§11
invariants. The 3b (CLI executor) deferral is acceptable — it is correctly scoped as an attended,
unverifiable-in-CI item, and the SDK executor already covers all autonomy modes, so no mission is
blocked. Sonar risk at PR time is low (no recurring rule triggered in the new code).

## Plan-point verification

### Step 1 — `runDispatchTick` + pure `selectForTick` (`packages/agents/src/dispatch-tick.ts`)
- CONFIRM — Interfaces `DispatchTickConfig`, `DispatchAdvance`, `DispatchSkip`, `DispatchTickResult`
  present, all fields `readonly`, skip reasons typed `'project_cap' | 'global_cap'`. Matches plan.
- CONFIRM — `selectForTick` is **pure + deterministic**: sorts a copy (`[...missionRows]`) by
  `createdAt.getTime()` then `id.localeCompare`; no DB/LLM. Per-project cap applied first (overflow →
  `project_cap`), then global cap over the taken set (overflow → `global_cap`). Both caps enforced in
  the documented order.
- CONFIRM — `runDispatchTick` is a thin orchestrator: `listDispatchableMissions()` → `selectForTick`
  → `Promise.all(executeNextTask)` → maps `kind` into `advanced`. Cognitive complexity low (S3776).
- CONFIRM — RED-first tests present (`packages/agents/src/dispatch-tick.test.ts`): three pure
  `selectForTick` cases (per-project cap, global cap, deterministic order) + two integration cases
  under `MAS_MOCK_LLM=1` (two projects → both advanced; 3 missions + perProjectCap 1 → 1 advanced,
  2 skipped `project_cap`). All green.

### Step 2 — wire the worker (`apps/worker/src/index.ts`)
- CONFIRM — sequential dispatchable loop replaced by `runDispatchTick(dispatchConfig())` in `tick()`.
- CONFIRM — env override via `envInt`: `MAS_MAX_CONCURRENT_PER_PROJECT` (default 1),
  `MAS_MAX_GLOBAL_CONCURRENT` (default 4), parsed near `TICK_MS`; bad/≤0 values fall back to default.
- CONFIRM — one-line summary log `dispatch advanced=N skipped=M` mirrors the autopilot log.
- CONFIRM — `runAutopilotTick` + `maybeEmitDailyReport` unchanged and still run after the dispatch
  pass; `tick`'s `db` param still load-bearing for both.
- CONFIRM — RED-first worker test (`apps/worker/src/dispatch-tick.test.ts`): two projects advance
  concurrently in one `tick()` within budget (both tasks `done`); global-cap-1 test confirms exactly
  one advances. Both green.

### Exit criterion — two projects advance concurrently within budget
- CONFIRM — proven by the worker test "advances two projects concurrently in one tick within budget"
  (`m1_t1` + `m2_t1` both `done` after a single `tick()`), and by the agents integration test. Test
  log shows `dispatch advanced=2 skipped=0`.

## Invariant grep results
1. CONFIRM — no `@anthropic-ai/sdk` import in any new file (grep NONE).
2. CONFIRM — no `data/memory/` write in any new file (grep NONE); dispatch path only reads memory
   (existing read-only `memoryContextFor`); §8 Memory-Keeper write-lock untouched.
3. CONFIRM — `MAS_MOCK_LLM` set per-suite in `beforeEach`, deleted in `afterEach`, in BOTH new test
   files; never exported globally.
4. CONFIRM (read) — §5 risk gate intact. `executeNextTask` (dispatch.ts:636–638) still pauses any
   `high`/`blocking` task via `pauseForRiskGate` BEFORE any LLM call. `runDispatchTick` only calls
   `executeNextTask`; parallel advance cannot bypass the gate. The existing autopilot test
   "leaves a high-risk autopilot mission paused (gate intact)" still passes.
5. CONFIRM — `selectForTick` pure + deterministic (sort `createdAt` then `id` via `localeCompare`),
   both caps enforced (per-project then global). Double-run prevented by the unchanged atomic
   task-claim in `executeNextTask` (UPDATE ... WHERE status='todo' RETURNING; `claimed.length===0`
   ⇒ `no_runnable`). better-sqlite3 synchronous-per-statement + atomic claim make `Promise.all` safe.
6. CONFIRM — `db` param dropped from `runDispatchTick` (S1172); only source call site
   `apps/worker/src/index.ts:43` passes a single arg `runDispatchTick(dispatchConfig())`. (The
   `.next/` build-artifact hit is generated output, not source.)

## Sonar-recurring-rules adherence (`docs/knowledge/sonar-recurring-rules.md`)
- readonly interface fields — applied (all 4 interfaces).
- localeCompare sorts — applied (dispatch-tick.ts:44, worker test:92).
- S5443 `/tmp` literals — none; tests use `tmpdir()` / `join(tmpdir(), …)`.
- S2871 sort without comparator — none; every sort has a comparator.
- S7776 array-includes-as-membership — N/A; uses a `Map` for per-project counts.
- node: prefixes — applied in both test files.
- no `use*` helpers (S6440) — none.
- cognitive complexity (S3776) — `selectForTick` split into two simple loops; `runDispatchTick` thin.
- No likely new Sonar issue spotted in the diff. (Definitive clearance still requires
  `scripts/sonar-pr-issues.sh <pr>` exit 0 + gate OK on HEAD once the PR is opened — that is the 5th
  check and remains outstanding by design at Checker time.)

## Local checks (run by Checker)
| Check | Result |
|-------|--------|
| `pnpm -r test` | PASS — core 88, db 15, skills 11, memory 41, agents 73, worker 6, web 64. All suites green. (The `ERROR: … imported outside …` lines in packages/core are the lint-guard test's own fixture assertions; that suite passes.) |
| `pnpm lint` | PASS — `PASS: no forbidden provider SDK imports (§11 + §11.bis)` then `pnpm -r lint` (tsc --noEmit) clean. |
| `pnpm build` | PASS — full turbo/Next build completes ("Done"). |
| `pnpm --filter @mas/web smoke` | PASS — 31 passed (45.1s). |

Tails:
- worker test: `dispatch advanced=2 skipped=0` (concurrent case) and `dispatch advanced=1 skipped=1`
  (global-cap case); `Test Files 3 passed (3) · Tests 6 passed (6)`.
- agents test: `Test Files 17 passed (17) · Tests 73 passed (73)`.
- smoke: `31 passed (45.1s)`.

## 3b deferral judgment
ACCEPTABLE (not a BLOCK). The headless `claude` CLI executor needs `claude login` + the binary
present and cannot be exercised unattended in CI/smoke — same class as the deferred Tauri packaging
item. Shipping process-spawn + §11 billing-strip code without a live verification path would ship
unverified risk-sensitive code. Deferral is documented in the build report and the plan; the SDK
executor (`claudeCodeLLM`) already covers all autonomy modes, so missions are not blocked.

## Findings

```json
{
  "verdict": "PASS",
  "findings": [
    {
      "severity": "info",
      "message": "5th verification check (scripts/sonar-pr-issues.sh <pr> exit 0 + gate OK on HEAD sha) is outstanding by design — no PR open at Checker time. Run it after push and fix anything listed before declaring the phase done (CLAUDE.md §7)."
    },
    {
      "severity": "info",
      "message": "Worker global-cap test asserts done.length===1 without pinning WHICH mission wins. selectForTick determinism is fully pinned by the agents pure-selection suite, so this is acceptable; optionally assert the surviving id for stronger coverage."
    },
    {
      "severity": "info",
      "message": "3b (headless claude CLI executor) deferred to an attended item. Acceptable: not CI-verifiable; SDK executor already covers all autonomy modes. Tracked in build report + plan."
    }
  ]
}
```

# Build report — 3 · Phase 8 functional half (3a multi-mission parallel)

Date 2026-06-14 · Branch `phase/8a-multimission` · Doer: Fable 5 · TDD (red→green).

## Shipped (3a)
Multi-project parallel execution with a per-project + global concurrency budget in
the worker. The sequential `for...of` dispatch loop is replaced by a single
budgeted, deterministic pass (`runDispatchTick`) that advances eligible missions
concurrently via `Promise.all`. The atomic task-claim in `executeNextTask` makes
concurrent advance safe (one executor per task); double-advance with the autopilot
pass remains harmless (yields `no_runnable`).

### Step 1 — `packages/agents/src/dispatch-tick.ts`
- Interfaces (all `readonly`): `DispatchTickConfig`, `DispatchAdvance`,
  `DispatchSkip` (`'project_cap' | 'global_cap'`), `DispatchTickResult`.
- Pure `selectForTick(missions, config)` → `{ selected, skipped }`. Deterministic
  order: `createdAt` (getTime) then `id` via `localeCompare`. Per-project cap first
  (overflow `project_cap`), then global cap over the taken set (overflow
  `global_cap`). No DB / LLM — keeps cognitive complexity low (S3776).
- `runDispatchTick(db, config)`: `listDispatchableMissions()` → `selectForTick` →
  `Promise.all(executeNextTask)` over `selected`, mapping each `.kind` into
  `advanced`. Returns `{ advanced, skipped }`.
- Exported from `packages/agents/src/index.ts`.

### Step 2 — `apps/worker/src/index.ts`
- `tick()` now calls `runDispatchTick(db, dispatchConfig())`; `runAutopilotTick` +
  `maybeEmitDailyReport` unchanged after it.
- Config via env override near `TICK_MS`: `MAS_MAX_CONCURRENT_PER_PROJECT`
  (default 1), `MAS_MAX_GLOBAL_CONCURRENT` (default 4), parsed once
  (`envInt` — positive-int guard, falls back on bad/missing values).
- One-line log when work happened: `[worker] dispatch advanced=N skipped=M`.

## Files
- `packages/agents/src/dispatch-tick.ts` (new)
- `packages/agents/src/dispatch-tick.test.ts` (new — pure cap/order cases + mock-LLM integration)
- `packages/agents/src/index.ts` (export)
- `apps/worker/src/index.ts` (wire tick + config)
- `apps/worker/src/dispatch-tick.test.ts` (new — two projects advance concurrently; global cap honored)

Two commits on the branch (one per step). Not pushed.

## Verification (4 checks)
- `pnpm -r test` — PASS. core 88, agents 73, memory 41, db 15, skills 11, web 64, worker 6.
- `pnpm lint` — PASS. `PASS: no forbidden provider SDK imports (§11 + §11.bis)`;
  recursive tsc clean (7 of 8 projects — agents/worker have no `lint` script; their
  types are checked by `pnpm build`).
- `pnpm build` — PASS (Next + all packages; `Done`).
- `pnpm --filter @mas/web smoke` — PASS (31 passed).

5th check (SonarCloud `scripts/sonar-pr-issues.sh <pr>`) requires an open PR /
pushed HEAD sha; this branch is not pushed per instructions, so it runs at PR time.
Note for the Checker: `runDispatchTick(db, …)` keeps `db` in the signature for
symmetry with `runAutopilotTick` and the worker call site, though the underlying
`listDispatchableMissions`/`executeNextTask` self-resolve via `getDb()` — watch for
a possible Sonar S1172 (unused param) flag at PR time.

## Exit criterion
Demonstrated: two projects advance concurrently within budget in one `tick()`
(worker test "advances two projects concurrently in one tick within budget"), and
the global cap is honored (`MAS_MAX_GLOBAL_CONCURRENT=1` → 1 advanced, 1 skipped).

## 3b deferral (→ attended)
The headless `claude` CLI executor (process-spawn for shell-heavy missions) is
deferred to an attended item **3b**. It needs `claude login` + the binary present
and cannot be exercised in CI/smoke unattended (same class as Tauri packaging);
shipping the process-spawn + §11 billing strip without a live verification path
would be unverified risk-sensitive code. The SDK executor (`claudeCodeLLM`) already
covers all autonomy modes, so missions are not blocked. See preflight plan §Scope.

# Pre-flight — 3 · Phase 8 functional half

Date 2026-06-14 · Branch `phase/8a-multimission` (chained off `phase/techdebt-drizzle-inline`,
base `main`; retarget to main after the #13→#14 chain merges).

## Scope decision (autonomous)
ROADMAP Phase 8 functional half = (a) **multi-project parallel execution with a per-project
concurrency budget in the worker**, (b) **headless `claude` CLI executor for shell-heavy missions**.

- **Build 3a (this PR):** multi-mission parallel advance + per-project + global concurrency
  budget in the worker. Fully verifiable with deterministic tests (`MAS_MOCK_LLM` per-suite).
  Exit: two projects advance concurrently within budget.
- **Defer 3b (→ attended):** the CLI executor spawns the real `claude` binary, which needs
  `claude login` + the binary present; it **cannot be exercised in CI/smoke unattended** (same
  class as the already-attended Tauri packaging item). Designing the process-spawn + §11
  billing (strip `ANTHROPIC_API_KEY`, subscription-only) without a live verification path would
  ship unverified risk-sensitive code. Tracked as item **3b** in the pipeline. The SDK executor
  (`packages/core/src/llm.real.ts` `claudeCodeLLM`) already covers all autonomy modes via
  `permissionMode`, so missions are not blocked by this deferral.

## Intake-audit (§13)
No new external resource: 3a is internal worker concurrency; 3b's `claude` CLI is already
sanctioned in CLAUDE.md §2 (and deferred). Decision: **n/a (no candidate addition)**, no
`docs/intake/` dossier. ADRs unchanged.

## Existing code (read first, mirror)
- `apps/worker/src/index.ts` — `tick()` currently advances dispatchable missions **sequentially**
  (`for...of` awaiting one `executeNextTask` each), then `runAutopilotTick`, then daily report.
- `packages/agents/src/dispatch.ts` — `executeNextTask` (atomic task-claim already makes
  concurrent advance safe — only one executor claims a given task), `listDispatchableMissions`.
- `packages/agents/src/autopilot.ts` — `runAutopilotTick` shape/return to mirror.
- `apps/worker/src/autopilot-tick.test.ts` — the worker-test seeding pattern + `MAS_MOCK_LLM`.

## Build steps (TDD — red before green, commit each)

### Step 1 — `runDispatchTick` (new `packages/agents/src/dispatch-tick.ts`)
- `export interface DispatchTickConfig { readonly maxConcurrentPerProject: number; readonly maxGlobalConcurrent: number; }`
- `export interface DispatchAdvance { readonly missionId: string; readonly projectId: string; readonly kind: string; }`
- `export interface DispatchSkip { readonly missionId: string; readonly projectId: string; readonly reason: 'project_cap' | 'global_cap'; }`
- `export interface DispatchTickResult { readonly advanced: DispatchAdvance[]; readonly skipped: DispatchSkip[]; }`
- `export async function runDispatchTick(db: Db, config: DispatchTickConfig): Promise<DispatchTickResult>`:
  1. `listDispatchableMissions()`; deterministic order (sort by `createdAt` then `id` via `localeCompare`).
  2. Group by `projectId`. Per project, take the first `maxConcurrentPerProject`; the rest →
     `skipped` reason `project_cap`.
  3. Across the taken set, cap at `maxGlobalConcurrent`; overflow (deterministic order) → `skipped`
     reason `global_cap`.
  4. `await Promise.all` of `executeNextTask(m.id)` over the selected set; map each result `kind`
     into `advanced` (record `missionId`,`projectId`,`kind`). (better-sqlite3 is synchronous per
     statement + the atomic task-claim makes concurrent advance safe.)
  5. Return `{ advanced, skipped }`.
- Keep cognitive complexity low (S3776): extract the selection (steps 1–3) into a pure helper
  `selectForTick(missions, config)` that takes plain mission rows and returns
  `{ selected, skipped }` — unit-testable WITHOUT a DB/LLM.
- RED first: `packages/agents/src/dispatch-tick.test.ts` — pure `selectForTick` cases
  (per-project cap, global cap, deterministic order) + an integration case driving real missions
  with `MAS_MOCK_LLM=1` (two projects each with one dispatched mission → both in `advanced`;
  a project with 3 dispatched + perProjectCap 1 → 1 advanced, 2 skipped `project_cap`).

### Step 2 — wire the worker (`apps/worker/src/index.ts`)
- Replace the sequential dispatchable loop in `tick()` with `runDispatchTick(db, config)`.
- `config` from constants + env override: `MAS_MAX_CONCURRENT_PER_PROJECT` (default **1**),
  `MAS_MAX_GLOBAL_CONCURRENT` (default **4**). Parse once near `TICK_MS`. Log a one-line
  summary (`advanced=N skipped=M`) mirroring the existing autopilot log.
- Keep `runAutopilotTick` + `maybeEmitDailyReport` unchanged after it.
- RED first: extend `apps/worker/src/autopilot-tick.test.ts` (or a new `dispatch-tick.test.ts`
  in the worker) — two projects advance concurrently in one `tick()` within budget.

## Risks
- **Double-advance with autopilot** — harmless: the atomic task-claim means a mission advanced by
  the dispatch tick yields `no_runnable` to the autopilot pass (no double-run). Same as today.
- **Sonar** — apply `docs/knowledge/sonar-recurring-rules.md`: `readonly` interface fields,
  `localeCompare` sorts, hoist literals, `node:` prefixes, no `use*` helpers, extract
  `selectForTick` to keep complexity down.
- **Determinism** — selection order via `createdAt` then `id`; tests pin it.

## Definition of Done (5 checks — §7)
1. `pnpm -r test` green (new dispatch-tick suites + worker tick + all existing).
2. `pnpm lint` green (incl. no-PAYG guard).
3. `pnpm build` green.
4. `pnpm --filter @mas/web smoke` green.
5. `scripts/sonar-pr-issues.sh <pr>` exits 0 AND gate OK on HEAD.
Plus Checker PASS; exit criterion demonstrated (two projects advance concurrently within budget).
3b (CLI executor) deferral documented in the build report + pipeline.

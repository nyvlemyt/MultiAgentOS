# Backlog — Functions over the §7 50-line cap (4 confirmed) — RESOLVED 2026-06-26 (Bloc D)

**Source**: 0d auto-audit scan, 2026-06-25 (adversarially verified, 2 real votes each). Findings `F-FN-1..4`. Scan output: `tasks/w8omnh3ai.output` §confirmedFindings. Note: the file-size sibling `F-SIZE-1` (dispatch.ts 1008 LOC) is **already resolved** — the 0c/0d split (commit c19dcca) landed on main via PR #42; dispatch.ts is now 739 lines.

## Status — RESOLVED (Bloc D, branch `chore/bloc-d-hardening`)

- `F-FN-1` **RESOLVED** — `seed.ts main()` 351→~20 lines; split into `seedResetSeededTables`/`seedProjectRow`/`seedAgentRoster`/`seedMissionRow`/… per-table helpers. Verified by running the seed + smoke gate.
- `F-FN-2` **RESOLVED** — `planMission()` 138→44 lines; extracted pure `resolveTaskRisk` (unit-tested in `dispatch-resolve-risk.test.ts`), `suggestColdAgent`, `classifyAndPersistTask`, `finalizeMissionPlan`.
- `F-FN-3` **RESOLVED** — `getTokenSnapshot()` 84→45 lines; extracted pure `aggregateProviderSpend` (unit-tested in `tokens.test.ts`) + lifted `budgetMeterWindow`/`cacheHitRatioSince`.
- `F-FN-4` **DOCUMENTED EXCEPTION** — `llm.real call()` left at ~74 lines by decision: the single §11 billing-isolation injection point, kept co-located for auditability. Inline `§7 length exception` comment added at the function head. No split, no tests changed.

All splits preserved behaviour (TDD; `@mas/agents` + `@mas/web` tokens suites green).

## What

CLAUDE.md §7 caps functions at 50 lines. Four confirmed over, none on a hot request path:

| Finding | Function | LOC | File | Note |
|---|---|---|---|---|
| `F-FN-1` (MED) | `main()` | 351 | [seed.ts:51](../../packages/db/src/seed.ts#L51) | dev-only seed; sequential delete/insert blocks, low cognitive complexity |
| `F-FN-2` (MED) | `planMission()` | 138 | [dispatch.ts:73](../../packages/agents/src/dispatch.ts#L73) | the c19dcca split fixed the FILE, not this fn; bulk is the per-task for-loop (skill-select + risk-classify + 3 logEvent + cold-agent suggest) |
| `F-FN-3` (LOW) | `getTokenSnapshot()` | 84 | [tokens.ts:102](../../apps/web/lib/tokens.ts#L102) | budget rows + 5h-window + cache-hit aggregate + per-provider reduce, inline |
| `F-FN-4` (LOW) | `call()` | 74 | [llm.real.ts:82](../../packages/core/src/llm.real.ts#L82) | §11 single LLM injection path; env-strip + options + for-await loop + failReason branching |

## Why it's only backlog, not a fix-now

- No correctness risk — all four are long-but-linear (data literals / sequential I/O / one query-build), not deeply nested. Nesting stays ≤ 4.
- The high-severity sibling (file size) is already fixed; these are the residual long-function tail.

## Original plan (executed — see Status above)

- `F-FN-2` first (it's on the live dispatch path and the most readable win): extract the per-task body of `planMission`'s for-loop into a `classifyAndPersistTask(t, …)` helper — drops the function well under 50 and isolates the risk/skill/event logic for unit testing.
- `F-FN-1`: split `seed.ts main()` into `seedX()` helpers per domain table (or accept as dev-script debt and note an explicit §7 exception).
- `F-FN-3` / `F-FN-4`: low priority; extract the per-provider reduce and the result-mapping block respectively if touched for other reasons.

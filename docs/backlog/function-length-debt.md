# Backlog — Functions over the §7 50-line cap (4 confirmed)

**Source**: 0d auto-audit scan, 2026-06-25 (adversarially verified, 2 real votes each). Findings `F-FN-1..4`. Scan output: `tasks/w8omnh3ai.output` §confirmedFindings. Note: the file-size sibling `F-SIZE-1` (dispatch.ts 1008 LOC) is **already resolved** — the 0c/0d split (commit c19dcca) landed on main via PR #42; dispatch.ts is now 739 lines.

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

## What to do (when picked up)

- `F-FN-2` first (it's on the live dispatch path and the most readable win): extract the per-task body of `planMission`'s for-loop into a `classifyAndPersistTask(t, …)` helper — drops the function well under 50 and isolates the risk/skill/event logic for unit testing.
- `F-FN-1`: split `seed.ts main()` into `seedX()` helpers per domain table (or accept as dev-script debt and note an explicit §7 exception).
- `F-FN-3` / `F-FN-4`: low priority; extract the per-provider reduce and the result-mapping block respectively if touched for other reasons.

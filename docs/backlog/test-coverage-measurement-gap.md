# Backlog — Test-coverage threshold is unenforceable (no provider installed)

**Source**: 0d auto-audit scan, 2026-06-25 (adversarially verified, 2 real votes). Findings `COV-1` (LOW) + `COV-2` (MED). Scan output: `tasks/w8omnh3ai.output` §confirmedFindings.

## What

CLAUDE.md §7 sets a binary review threshold of **coverage ≥ 80 %**, but it is never measured:

- `@vitest/coverage-v8` is absent from every package — `pnpm --filter @mas/skills exec vitest run --coverage` errors `MISSING DEPENDENCY  Cannot find dependency @vitest/coverage-v8`; `grep coverage */package.json` → 0 hits (`COV-1`).
- The 5-check verification gate (test · lint · build · smoke · Sonar) measures none of it — so the §7 80 % rule has no enforcement point in CI.
- Knock-on (`COV-2`): `@mas/db` ships [seed.ts](../../packages/db/src/seed.ts) (408 LOC of imperative branching/insert logic) with **no** `seed.test.ts`; only `seed-safety.ts` of 6 source modules is tested → the package estimate is well under 80 %.

## Why it's only backlog, not a fix-now

- No runtime defect — purely a governance/measurement gap. The 5-check gate that does run is green.
- The §7 number was always aspirational; nothing regressed.

## What to do (when picked up)

1. Add `@vitest/coverage-v8` at the workspace root, enable `coverage` in a shared vitest config (`provider: 'v8'`, `thresholds.lines: 80` scoped per-package, or report-only first to see the real baseline).
2. Decide whether coverage becomes a **6th** verification check or stays advisory — update CLAUDE.md §7 either way so the doc matches reality.
3. Backfill the worst gap first: `seed.ts` (or carve its logic into testable units), then `client.ts` / `testing.ts`.
4. Re-measure; record the real per-package baseline so future drift is visible.

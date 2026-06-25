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

1. ~~Add `@vitest/coverage-v8` at the workspace root, enable `coverage` in a shared vitest config.~~ **DONE 2026-06-25** — `@vitest/coverage-v8@2` at root; `vitest.config.ts` `coverage` block (`provider: 'v8'`, `all: true`, report-only, no thresholds); `pnpm test:coverage` script.
2. ~~Decide 6th check vs advisory; sync CLAUDE.md §7.~~ **DONE 2026-06-25** — kept **advisory** (report-only). Rationale: overall 91 % lines clears the §7 bar, but a naive per-package line gate would fail on dev-only CLI shims at 0 % (`*-cli.ts`, `reindex.ts`, `build-library-index.ts`). Promotion to a hard 6th check is deferred until those are excluded or backfilled. CLAUDE.md §7 updated to match.
3. Backfill the worst gap first: `seed.ts` (or carve its logic into testable units), then `client.ts` / `testing.ts`. **(still open)**
4. ~~Re-measure; record the real per-package baseline.~~ **DONE 2026-06-25** — see baseline below.

## Baseline — 2026-06-25 (`pnpm test:coverage`, v8, `all: true`)

Overall: **statements 91.22 % · branches 83.97 % · functions 87.70 % · lines 91.22 %** (4137/4535 lines).

Per-package lines: `agents/src` high (most modules 95–100 %) · `core/src` 93.9 % · `core/src/providers` 97.1 % · `db/src` 95.8 % (fn 27 % = drizzle column-def artifact in `schema.ts`) · `memory/src` 87.0 % · `skills/src` **78.0 %** (dragged by 0 % CLI shims).

Zero-coverage files (all dev-only CLI entrypoints, excluded from any future gate or backfilled): `memory/src/arsenal-cli.ts`, `doctor-cli.ts`, `eval-cli.ts`, `seed-cli.ts`; `skills/src/build-library-index.ts`, `reindex.ts`. Real logic gaps to backfill: `db/src/client.ts` 67.6 %, `agents/src/sandbox-diff.ts` 83.6 %, `core/src/llm.real.ts` 83.8 %.

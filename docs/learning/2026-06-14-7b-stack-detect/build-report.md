# Build report — 4 · 7b slice: stack auto-detection from `projects.path`

Date 2026-06-14 · Branch `phase/7b-stack-detect` · Doer (Fable)

## Shipped
Pure, read-only stack auto-detection over a registered project's own path, wired
as the no-template / no-explicit-stack fallback in `createProject`. TDD,
RED-before-GREEN per step.

### Step 1 — `apps/web/lib/stack-detect.ts`
- `DetectedStack { readonly type: ProjectType; readonly stack: readonly string[] }`.
- `detectStack(rootPath)`: read-only, never throws; missing/unreadable path or no
  markers → `{ type: 'other', stack: [] }`.
- One hoisted ordered dep→tag table drives both detection and canonical output
  order (no `.sort()` on input — determinism). TypeScript via `typescript` dep OR
  `tsconfig.json`. Marker files: requirements.txt/pyproject.toml→Python,
  Cargo.toml→Rust, go.mod→Go.
- `type`: `'bot'` iff a bot lib (discord.js | telegraf | grammy |
  node-telegram-bot-api) is present, else `'other'`. Never claims
  manga-app/business-website/automation (undetectable from files).

### Step 2 — wire into `createProject` (`apps/web/lib/projects.ts`)
- Fallback line → `input.stack ?? (tpl ? [...tpl.stack] : [...detectStack(input.path).stack])`.
- `type` resolution left UNCHANGED (no surprise override).

## Files
- created: `apps/web/lib/stack-detect.ts`
- created: `apps/web/lib/stack-detect.test.ts` (5 cases incl. determinism + empty/nonexistent)
- changed: `apps/web/lib/projects.ts` (import + fallback line)
- changed: `apps/web/lib/projects.create.test.ts` (auto-detect case)
- created: this report

## Verification (4 local checks — exact tails)
1. `pnpm -r test` — **PASS**. web: 15 files, 70 tests; worker: 2 files, 6 tests; all packages green.
2. `pnpm lint` — **PASS**. SDK-PAYG guard PASS; all `tsc --noEmit` Done.
3. `pnpm build` — **PASS**. Next build Done.
4. `pnpm --filter @mas/web smoke` — **PASS**. 31 passed (43.1s).

5th check (Sonar `scripts/sonar-pr-issues.sh <pr>` + gate OK) runs after push/PR —
branch not pushed per instructions; owner to run at PR time.

## Deferred (recorded)
4b/4c remain in the pipeline: onboarding tour, remaining empty/error/no-permission
states, deeper i18n. These are visual/smoke-flake-prone and better batched/attended;
this PR ships only the pure unit-testable detector slice.

# Checker verdict — item 4 / 7b slice: stack auto-detection

Date 2026-06-14 · Branch `phase/7b-stack-detect` · Diff `git diff phase/8a-multimission HEAD`
Plan: `docs/learning/2026-06-14-7b-stack-detect-preflight/plan.md`

## Scope shipped
- `apps/web/lib/stack-detect.ts` — `detectStack` pure detector
- `apps/web/lib/stack-detect.test.ts` — 5 cases
- `apps/web/lib/projects.ts` — one-line `stack` fallback in `createProject`
- `apps/web/lib/projects.create.test.ts` — +1 case (detect from path)
- 4b/4c (tour, empty/error states, i18n) deferred

## 4 local checks (run by Checker)

| Check | Result |
|-------|--------|
| `pnpm -r test` | PASS — web 70 tests / 15 files, worker 6 tests / 2 files. `stack-detect.test.ts (5)` + `projects.create.test.ts (8)` green |
| `pnpm lint` | PASS — `lint-no-sdk-payg.sh` PASS (no forbidden provider SDK), all `tsc --noEmit` clean (7/8 workspaces) |
| `pnpm build` | PASS — Next.js build Done, all routes compiled |
| `pnpm --filter @mas/web smoke` | PASS — 31 Playwright specs passed (42.2s) |

Tails:
- test: `apps/web test: ✓ lib/stack-detect.test.ts (5 tests) 18ms` · `Tests 70 passed (70)` · worker `Tests 6 passed (6)`
- lint: `PASS: no forbidden provider SDK imports (§11 + §11.bis)` · `apps/web lint: Done`
- build: `apps/web build: Done`
- smoke: `31 passed (42.2s)`

5th check (Sonar `scripts/sonar-pr-issues.sh <pr>` + gate OK) requires a pushed PR — out of
Checker scope here; pre-assessment below flags nothing likely to raise issues.

## Plan-point verification

### Step 1 — `stack-detect.ts` (pure detector) — CONFIRMED
- `DetectedStack` interface with `readonly type` + `readonly stack`. ✓
- `detectStack(rootPath)` returns `{ type:'other', stack:[] }` (`EMPTY`) on falsy/`!existsSync`
  path (line 66) and on no markers (line 83). Never throws. ✓
- `package.json` read in `readDeps` under try/catch around `JSON.parse`; `!existsSync` guard
  before read; malformed JSON → empty Set, not a throw (lines 47–63). ✓
- Single hoisted ordered `DEP_TO_TAG` table; iterates the table, not the input (lines 17–30, 71–73). ✓
- TypeScript tag if `typescript` dep OR `tsconfig.json` exists (line 75). ✓
- Marker files Python/Rust/Go via hoisted `MARKER_TO_TAG`, dedup-guarded (`!stack.includes`) (lines 79–81). ✓
- Determinism: no `.sort()` on raw input (only in a comment); order fixed by table iteration. ✓
- `type` conservative: `'bot'` only if a `BOT_LIBS` member present, else `'other'`; never
  manga-app/business-website/automation (lines 85–86). ✓
- Tests cover Next+TS+Tailwind→other, Telegraf→bot, pyproject-only→Python, empty + nonexistent
  →EMPTY, determinism. ✓

### Step 2 — wire into `createProject` — CONFIRMED
- `const stack = input.stack ?? (tpl ? [...tpl.stack] : [...detectStack(input.path).stack]);`
  (projects.ts:64) — fallback only when no explicit stack AND no template; readonly array
  spread to `string[]` for `JSON.stringify`. ✓
- `type: tpl?.type ?? input.type` (projects.ts:73) is **UNCHANGED** — detection never feeds
  `type`; explicit user/template choice is not overridden. ✓
- New test asserts a no-template/no-stack project pointed at a Next package.json persists
  `stackJson` containing `Next.js`; the pre-existing "explicit ... override" test is intact. ✓

## Invariant grep

1. No new `@anthropic-ai/sdk`: the only diff hits are in the prose of the build report, not
   runtime code. `apps/`/`packages/*/src` clean; lint guard PASS. ✓
2. `detectStack` READ-ONLY: no `writeFileSync`/`mkdirSync`/`appendFileSync`/`unlink` in the file;
   only `existsSync` + `readFileSync`. try/catch + `!existsSync` guards confirm no-throw. ✓
3. No `data/memory/` writes. ✓
4. Deterministic — tags emit in `DEP_TO_TAG` order; no `.sort()` on raw input. ✓
5. `type` conservative — bot-only-on-bot-lib, else 'other'. ✓
6. `createProject` `type` resolution unchanged. ✓

## Sonar pre-assessment (`docs/knowledge/sonar-recurring-rules.md`)
- Dep→tag table hoisted, single literals (S1192) — OK.
- `BOT_LIBS` is a `Set` used with `.has()` (S7776) — OK.
- Tests use `mkdtempSync(join(tmpdir(), ...))`, no `/tmp` literal (S5443) — OK.
- `readonly` interface fields, `node:` import prefixes — OK.
- Ternaries are single-level, non-negated (no S7735 / no nested-ternary smell) — OK.
- No `.sort()` without comparator (S2871) — n/a.

No likely PR-time Sonar issues. Push + `scripts/sonar-pr-issues.sh <pr>` still required to
close the 5th check.

## 4b/4c deferral
**Acceptable.** The tour, empty/error/no-permission states, and deeper i18n are visual,
smoke-flake-prone, and best batched/attended. Shipping only the pure, fully unit-testable
detector keeps this PR unattended-verifiable, and the deferral is recorded in the preflight plan
and pipeline. Conservative, consistent with §7.

## Verdict
PASS. Both plan steps implemented faithfully, all six invariants hold, 4/4 local checks green.
Only residual gate item is the Sonar run on the pushed PR (pre-assessment clean).

```json
{
  "verdict": "PASS",
  "findings": [
    { "severity": "info", "message": "Step 1 (detectStack pure detector) confirmed: readonly, no-throw on bad/missing path + malformed package.json, hoisted ordered dep->tag table, deterministic, conservative type ('bot' only on bot lib else 'other')." },
    { "severity": "info", "message": "Step 2 (createProject fallback) confirmed: stack fallback only when no explicit stack and no template; type resolution (tpl?.type ?? input.type) unchanged." },
    { "severity": "info", "message": "Invariants OK: no new @anthropic-ai/sdk in runtime code, READ-ONLY fs (existsSync+readFileSync only), no data/memory writes, no .sort() on raw input." },
    { "severity": "info", "message": "4/4 local checks green — test 70+6, lint PASS, build Done, smoke 31 passed. Sonar (5th check) pending PR push; pre-assessment clean." },
    { "severity": "info", "message": "4b/4c (tour, empty/error states, i18n) deferral is acceptable and recorded in the preflight plan." }
  ]
}
```

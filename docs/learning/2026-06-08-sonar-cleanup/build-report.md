# SonarCloud + Copilot cleanup — build report

**Date**: 2026-06-08 (autonomous overnight session)
**Branch**: `chore/sonar-cleanup` (pushed; **not merged**, `main` untouched, no force-push)
**Scope**: Waves B + C of the SonarCloud cleanup (handoff: `docs/backlog/sonar-cleanup-remaining.md`) plus the Copilot review comments on PR #2.

## TL;DR

- **45 SonarCloud code issues fixed** across 9 rules, in 6 small conventional commits.
- **2 issues deferred** with reasons (S4325, S6848) — both genuinely risky/ambiguous, neither worth destabilizing verified-green code.
- **All 4 Copilot PR #2 comments resolved** (1 already fixed on-branch, 2 moot, 1 backlogged per instruction).
- **Verification: green at every batch** — 28 unit tests, per-package `tsc`, 19 Playwright e2e (incl. the real mission lifecycle + the converted dialog, screenshot-checked).
- The §5 risk-gate behavior is unchanged; the §11 PAYG guard still passes.

## Issues cleared (by rule)

Live issue list was re-fetched from the SonarCloud public API (`nyvlemyt_MultiAgentOS2`, branch `main`) before editing; located by symbol/context, not stale line numbers.

| Rule | Title | Count | How |
|------|-------|-------|-----|
| S6759 | Mark props read-only | 27 | Wrapped each component/page props type in `Readonly<…>` (16 components + 11 page/sub-components). |
| S3358 | Nested ternary | 8 | Extracted named helpers: `toneFor` (BudgetBar), `accentBorderFor` (page Card), `stageBg`/`stageColor`/`taskStatusColor` (mission detail); flattened the run-label ternary to a single non-nested one. |
| S7735 | Negated condition | 3 | Flipped `x !== 1 ? 's' : ''` → `x === 1 ? '' : 's'` (page, skills count); swapped the skills Pin/pinned JSX branches to `=== 'pinned'`. |
| S6479 | Array index in keys | 2 | Keyed the avatar stack by `a.name`, orbit edges by `` `${e.from}-${e.to}` `` (dropped the unused index param in both). |
| S7677 | Redirect error to stderr | 1 | `scripts/lint-no-sdk-payg.sh` error block → `>&2` (kept PASS on stdout). The `.claude/**` S7677/S7688 instances are handled by you via the Sonar UI exclusion. |
| S6819 | Use native `<dialog>` | 1 | `ValidationModal` `role="dialog"` div → native `<dialog open>` with UA-style resets (`m-0 border-0 bg-transparent h-full w-full max-w-none`) so the bottom-right floating panel renders identically. |
| S3776 | Cognitive complexity (23→≤15) | 1 | `executeNextTask` split into `runReviewPhase`, `pauseForRiskGate`, `executeTaskWithLLM` — verbatim extraction, behavior identical. |
| S2871 | `.sort()` without comparator | 1 | `dispatch.test.ts` → `.sort((a, b) => a.localeCompare(b))` (preserves the alphabetical order the assertion relies on). |
| S1135 | "TODO" comment | 1 | False positive: the claim comment contained the word "todo" (describing the `'todo'` status). Reworded; not a real task marker. |
| **Total** | | **45** | |

## Issues deferred (with reason)

| Rule | Location | Why deferred |
|------|----------|--------------|
| S4325 | `apps/web/app/(cockpit)/trace/page.tsx:13` | "Unnecessary assertion" on the SSE handler line. The two casts are `(e as MessageEvent)` (needed by tsc for `.data` — `e` is typed `Event` under the EventSource string-event overload) and `JSON.parse(...) as {…}` (narrows `any`). Sonar's flag contradicts tsc's view; removing the cast Sonar likely means would break `tsc` (`strictFunctionTypes`), which violates the "never leave tsc red" rule. New since the handoff, MINOR. Best resolved by typing the listener param (`(e: MessageEvent) =>`) **iff** it survives `strictFunctionTypes`, or marked in the Sonar UI. |
| S6848 | `apps/web/components/MissionsBoardClient.tsx:56` | The flagged `<section>` is the kanban drop target (`onDragOver/onDragLeave/onDrop`). Sonar wants a genuine interactive role **plus** tab/keyboard/touch support. (a) There is no honest ARIA role for a drop zone; a token `role`+`tabIndex` would be cargo-cult a11y the rule itself asks to back with keyboard DnD we don't implement. (b) `lifecycle.spec.ts` couples to the `<section>` tag (`xpath=ancestor::section[1]`, `page.locator('section', …)`), so changing the element breaks the e2e. Proper fix = an accessible drag-and-drop redesign with a keyboard alternative — out of scope for a lint-cleanup PR. |

Both are documented for a follow-up; neither blocks the rest.

## Not touched (your SonarCloud UI tasks — confirmed left alone)

- **S2245** Math.random hotspots (×12, `seed.ts`/`fixtures.ts`) → Mark Safe.
- **S5443** publicly-writable-dir hotspots (×2, test dirs) → Mark Safe.
- **`.claude/**` and `docs/**` exclusions** → the ~12 `shelldre:S7688`/`S7677` issues in `web-artifacts-builder/scripts/*.sh` clear once `**/.claude/**` is excluded.
- Encoding = UTF-8, duplicate-project deletion.

## Copilot comments (PR #2 = `chore/sonar-cleanup`, which is now merged/closed)

Scoped strictly to PR #2's 4 review comments (PR #1 / phase-3 comments were out of scope):

1. **`packages/skills/src/scanner.ts:36` — `str()` should coerce primitives** → **already resolved on-branch.** The current helper coerces `number`/`boolean` via `String(v)` (added in `aa556e1`), falling back only for objects/arrays/null — which is the intended "avoid `[object Object]`" behavior. No change needed.
2. **`apps/web/app/api/stream/route.ts:30` — SSE cursor** → **backlogged** (per your instruction — explicitly *do not touch*). The `createdAt`-only `gt` cursor can skip events sharing a millisecond. Fix = composite cursor `(createdAt, id)` with matching `orderBy` + `or(gt(createdAt,c), and(eq(createdAt,c), gt(id,lastId)))`. Recorded in `docs/backlog/sonar-cleanup-remaining.md` (Backlog section).
3. **`.mcp.json:3` (new top-level file rule)** → **moot.** `.mcp.json` was removed from git in `0ee9443` and is gitignored (`git ls-files .mcp.json` → empty).
4. **`.mcp.json:8` (`--pull=always`)** → **moot** for the same reason.

> Note: PR #2 is **merged/closed**, so there is no live review thread to reply to. The decisions are recorded here and in the backlog doc instead of posting to a closed PR.

## Files touched (this session, waves B/C)

- `apps/web/app/layout.tsx`, `apps/web/app/(cockpit)/{layout,page,agents/[id]/page,memory/page,missions/[id]/page,projects/[slug]/page,projects/new/page,skills/page,tokens/page}.tsx`
- `apps/web/components/{AgentAvatar,AgentCard,BudgetBar,KanbanColumn,MissionActions,MissionCard,MissionsBoardClient,ModePill,RiskBadge,Sparkline,Timeline,ValidationModal}.tsx`, `apps/web/components/studio/{OrbitView,OrgChartView}.tsx`
- `scripts/lint-no-sdk-payg.sh`
- `packages/agents/src/{dispatch.ts,dispatch.test.ts}`

(The `git diff main...HEAD` stat also lists wave-A files — `fixtures.ts`, `scanner.ts`, `router.ts`, `stream/route.ts`, etc. — because the **local** `main` ref is still at `1183de0` (pre-wave-A). They are not part of this session's edits.)

## Verification

Run after every batch, and a final full sweep at the end. All green:

- `pnpm -r test` → **28 unit tests pass** (db 3, core 6, skills 9, agents 8, web 1, worker 1).
- `tsc --noEmit` → **clean** for `@mas/web`, `@mas/agents`, `@mas/skills`.
- `bash scripts/lint-no-sdk-payg.sh` → **PASS** (§11 PAYG guard intact).
- `pnpm --filter @mas/web smoke` → **19/19 Playwright e2e pass**, including:
  - `lifecycle.spec.ts` — full Plan → Run → **risk-gate pause** → Approve → validated → archived (exercises the refactored `executeNextTask` and the native `<dialog>`).
  - the kanban move test (unaffected by the deferred S6848).
- **Dialog visual check**: a temporary spec drove a mission to the pending-validation state and screenshotted it; the native `<dialog>` renders pixel-identically to the old div (transparent overlay, bottom-right panel, dark theme) — no UA white-box regression. Temp spec deleted afterward.

## CI status

⚠️ **CI was not auto-triggered by the branch pushes.** `.github/workflows/ci.yml` runs only on `pull_request` and `push` to `main`. PR #2 is merged/closed, so there is no open PR for `chore/sonar-cleanup`, and pushes to the branch alone don't fire the workflow. `gh` is not installed and this session has no GitHub write token, so a PR could not be opened automatically.

**However**, the CI `build-test` job is exactly `pnpm install` → `pnpm lint` (PAYG guard + per-package tsc) → `pnpm -r test` → Playwright smoke — **all of which were run locally and passed**. CI is expected to be green.

**Recommended next step (yours):** open a PR `chore/sonar-cleanup` → `main`. That will (a) run `build-test`, (b) trigger a fresh SonarCloud analysis of the branch so the 45 fixes register, and (c) re-run Copilot review. Then merge when green.

## Commits (this session, newest first)

```
4bcf55c chore(sonar): reword comment to clear S1135 false TODO
d8fb411 test(sonar): add sort comparator in dispatch test (S2871)
92d2de5 refactor(sonar): split executeNextTask helpers (S3776)
1b036c1 fix(sonar): native <dialog> for validation modal (S6819)
fc15854 fix(sonar): redirect lint guard errors to stderr (S7677)
ba6d444 fix(sonar): readonly props, ternaries, stable keys (web UI)
```

## Expected SonarCloud delta

Of the 61 open issues on `main`, this branch addresses **45** in code and defers **2** (S4325, S6848). The remaining **14** are your UI tasks (12× S2245 + 2× S5443 hotspots) plus the `.claude/**` shell-script issues cleared by the source-exclusion glob. Once the branch is analyzed via a PR, the code-issue count should drop accordingly.

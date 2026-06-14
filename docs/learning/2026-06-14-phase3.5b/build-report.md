# Phase 3.5b — Build Report (Language mode + Quality Controller)

**Date**: 2026-06-14 · **Branch**: `phase/3.5b-language-qc` · **PR**: #9 · **Base sha**: `301da9c`
**Method**: TDD throughout (RED → GREEN per step), deterministic (no real LLM; `MAS_MOCK_LLM` short-circuit unchanged and still first in `selectLLM`).

## Done

| # | Step | Tests (TDD) |
|---|------|-------------|
| 1 | `projects.language` (`'fr'\|'en'`, default `'fr'`) + migration **0006** (`0006_dapper_polaris.sql`) + journal entry. Legacy rows backfill to `fr`. | `packages/db/src/language-schema.test.ts` (3) |
| 2 | `languageDirective(lang)` pure fn in `@mas/core` (fr→"Respond in French.", en→"Respond in English.", undefined→fr). Prepended to **both** system assemblies in `dispatch.ts` (`executeTaskWithLLM` + `resumeAfterValidation`); `language` added to both project selects. No LLM call added. | `packages/core/src/language.test.ts` (3) · `packages/agents/src/language-wiring.test.ts` (3) |
| 3 | `LanguagePill` (topbar, fr/en) → `PATCH /api/projects/[id]/language`; `lib/projects.ts` (`setProjectLanguage`, `isProjectLanguage`, `PROJECT_LANGUAGES`). Reads current language from the project (layout query). | `apps/web/lib/projects.test.ts` (3) · smoke |
| 4 | Minimal cockpit-shell i18n `apps/web/lib/i18n.ts` (`t(key,lang)`, nav + topbar keys, fr default + fr fallback + key fallback). Sidebar nav + Topbar labels use it. | `apps/web/lib/i18n.test.ts` (5) |
| 5 | `mockQualityController` in `@mas/core` (ReviewerVerdict shape; PASS unless `[qc-block]` sentinel). Wired into `runReviewPhase` **before** the reviewer; QC `BLOCK` blocks the mission + short-circuits the reviewer, logging `quality_control_verdict`. Tier A fiche added. `quality-controller` registered in the seed roster + test rosters. | `packages/core/src/quality-controller.test.ts` (2) · `packages/agents/src/quality-controller-wiring.test.ts` (2) |
| 6 | `/trace` shows `quality_control_verdict` (the Timeline renders every event `type` generically — no special-casing needed). Topbar shows the language pill. Smoke covers language-pill persistence + shell i18n switch. | smoke (28 total) |

## Deferred (with reason)

- **Deep per-page i18n** — only the cockpit *shell* (nav + topbar) is translated. Page bodies/headings stay as-is. Reason: full per-page i18n is a large surface; the DoD-critical part is **agent output language** (the directive), not UI translation. Scoped per plan §0/§4. Page-heading smoke assertions are unaffected (they check `<h1>`, not nav).
- **QC-in-trace E2E smoke** — covered by the unit wiring test (`quality-controller-wiring.test.ts` asserts the `quality_control_verdict` event is logged before `review_verdict`) plus the generic Timeline renderer. A full mission-run E2E would require driving risk-gated validations through the API (flaky, low marginal value). Documented choice.

## Deviations from plan

- **Fiche location** — plan's Files table listed `.claude/agents/quality-controller.md` (Tier B convention). The actual Tier A reviewer/sec-reviewer fiches live in `packages/agents/fiches/`, and the seed sets `fichePath = packages/agents/fiches/<id>.md`. Placed the fiche there with its siblings so the DB row's `fichePath` resolves. ≤7 tools (Read, Grep, Glob).
- **Avatar** — fiche references `packages/agents/avatars/quality-controller.svg` for roster parity; the SVG asset itself is not added (no avatar pipeline in scope for 3.5b).

## DoD status (5 checks)

1. ✅ `pnpm -r test` — 7 packages green (db 11 · core 57 · skills 11 · memory 41 · agents 26 · web 42 · worker 1).
2. ✅ `pnpm lint` — no-PAYG guard clean (§11/§11.bis), all `tsc --noEmit` Done.
3. ✅ `pnpm build` — clean; `/api/projects/[id]/language` route present.
4. ✅ `pnpm --filter @mas/web smoke` — 28 passed (incl. language-pill persistence + fr→en shell switch).
5. ✅ **SonarCloud** — first scan flagged 4: `S6443` ×2 (LanguagePill setter-uses-its-own-state) + `S5443` ×2 (hardcoded `/tmp` paths in the migration test). Fixed (commit `6536936`): LanguagePill now commits state only on a successful PATCH (no optimistic-revert); the test uses `join(tmpdir(), …)`. Re-scan (analysis `2026-06-13T23:59:32Z`, new HEAD sha `6536936`): `scripts/sonar-pr-issues.sh 9` → **0 open issues, 0 to-review hotspots, exit 0** = SONAR CLEAN (CLAUDE.md §7). The quality **gate** still reads ERROR — that is the new-code *coverage* metric on the UI/test files, not an open issue; §7 makes the issue script (exit 0) the bar, consistent with prior phases.

Scope guardrails respected: no provider/router change (§11 intact), no Phase 5 Tier B execution, §8 memory write-lock untouched (no new writer), producer/receptacle code untouched.

## Commits

```
3607239 feat(db): projects.language column + migration 0006
dd2941a feat(agents): languageDirective injected into both system assemblies
23c575a feat(web): LanguagePill + PATCH language route + minimal i18n shell
9bae716 feat(agents): Quality Controller gate before reviewer + Tier A fiche
dfb989c test(web): smoke covers language pill persistence + shell i18n
6536936 fix(review): sonar PR9 — S6443 commit-on-success, S5443 tmpdir paths
```

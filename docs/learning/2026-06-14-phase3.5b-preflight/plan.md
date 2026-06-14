# Phase 3.5b · Language mode + Quality Controller — Pre-flight Plan

**Date**: 2026-06-14 · **Prereq**: Phase 3.5 router + 4.5 (all merged) · **Source**: ROADMAP "Phase 3.5 · Features additionnelles", AGENTS.md §4 (Quality Controller) · **Branch**: `phase/3.5b-language-qc` (off main).

> The two separable "features additionnelles" deferred from Phase 3.5. **Built before Phase 5 on purpose:** language mode is cross-cutting over agent system prompts — cheaper to wire now (Tier A surface only) than to retrofit across 8 Tier B prompts after Phase 5.

## 0. Pre-flight findings (audit, 2026-06-14)

- **Language storage = a `projects.language` column** (`'fr'|'en'`, default `'fr'`), mirroring the existing `defaultMode` column. ROADMAP wrote "`config/project.json`" but that file does not exist and projects are DB rows — a per-project column is consistent with `defaultMode`/`autonomy`/`defaultModel`. Migration **0006**. (Deviation noted; ADR not required — it's a column, not a framework.)
- **Prompt injection point**: `executeTaskWithLLM` + `resumeAfterValidation` in `dispatch.ts` assemble `system: [...]`. Prepend a `languageDirective(lang)` line. Memory/skill context stay verbatim (router grounding parity unaffected).
- **Topbar**: `ModePill` is a client-only local-state toggle (not persisted). Add a sibling `LanguagePill` (fr/en) that **persists** to the project via a small API route. Keep ModePill as-is (its persistence is out of scope).
- **UI labels**: full per-page i18n is a large surface. **Scope 3.5b to a minimal `t()` dictionary** covering the cockpit shell (nav items + topbar + section headings most visible). Deep per-page i18n is **deferred** (note in build-report) — the DoD-critical part is *agent output language*, not full UI translation.
- **Quality Controller**: the review pipeline (`runReviewPhase`) already stacks mock verdicts (`mockReviewer`, `mockSecReviewer`). Add `mockQualityController` in `@mas/core` (same shape, returns `ReviewerVerdict`) and a `quality-controller` Tier A fiche; wire it into `runReviewPhase` **before** the reviewer (pipeline `execution → QC → Reviewer → SecReviewer`, per AGENTS.md §4). QC checks process/rules (conventional commits, no-PAYG drift, output-language match, no framework-without-ADR); at mock stage returns PASS unless a seeded BLOCK signal.

## 1. Build steps (TDD, commit + verify each)

1. **Migration 0006 + schema**: `projects.language` (`'fr'|'en'`, default `'fr'`). Applies clean, legacy rows default `fr`. TDD round-trip.
2. **`languageDirective(lang)`** (`packages/core/src` or `apps`): pure fn → a one-line system-prompt directive ("Respond in French." / "Respond in English."). Wire into both `system: [...]` assemblies in `dispatch.ts`. TDD: a `fr` project's task prompt contains the FR directive; `en` → EN. No LLM (mock seam unchanged).
3. **`LanguagePill` + persistence**: topbar pill (fr/en) → `PATCH /api/projects/[id]/language`; reads current from project. TDD the route + a smoke asserting toggle persists.
4. **Minimal UI i18n**: `apps/web/lib/i18n.ts` — `t(key, lang)` dict for the cockpit shell (nav + topbar + a few headings). Default fr. Topbar/nav use it. Deep per-page i18n deferred. TDD the dict (key coverage + fallback).
5. **Quality Controller**: `mockQualityController` in `@mas/core` (ReviewerVerdict shape) + `.claude/agents/quality-controller.md` fiche (per AGENTS.md §4, ≤7 tools). Wire into `runReviewPhase` before the reviewer; a QC `BLOCK` blocks the mission + logs `quality_control_verdict`. TDD: QC runs before reviewer; BLOCK path blocks; PASS path proceeds.
6. **Trace/visibility**: QC verdict appears in `/trace` (event type `quality_control_verdict`); language shown in the topbar pill. Smoke covers topbar + trace render.

## 2. Files

| File | Action |
|---|---|
| `packages/db/src/schema.ts` + `migrations/0006_*` | `projects.language` column |
| `packages/core/src/` (lang + qc) + `index.ts` | `languageDirective`, `mockQualityController` |
| `packages/agents/src/dispatch.ts` | inject directive in both system assemblies; wire QC into `runReviewPhase` |
| `apps/web/components/Topbar.tsx` + `LanguagePill.tsx` | language pill |
| `apps/web/app/api/projects/[id]/language/route.ts` | PATCH persistence |
| `apps/web/lib/i18n.ts` (+ test) | minimal `t()` dict |
| `.claude/agents/quality-controller.md` | Tier A fiche |
| `apps/web/tests/smoke.spec.ts` | language toggle + QC-in-trace |

## 3. Risks

| Risk | Mitigation |
|---|---|
| UI i18n scope blowout | Minimal shell dict only; deep per-page deferred + documented |
| Language directive skews router grounding-parity test | Directive is project-level + identical across providers; parity test still byte-equal per provider |
| QC inserted wrong in pipeline order | Test asserts QC verdict logged before reviewer verdict (createdAt/order) |
| `config/project.json` expectation vs column | Document the deviation in build-report; column matches existing pattern |
| Mock QC always-PASS hides the gate | Seed a BLOCK signal in a test (e.g. a flagged task) to exercise the block path |

## 4. DoD (gate)

1. `projects.language` migration 0006 applies clean; legacy rows default `fr` (test).
2. A `fr` project's task system prompt contains the FR directive; `en` → EN (test); no LLM call added.
3. Topbar `LanguagePill` toggles fr/en and **persists** to the project (test + smoke).
4. Minimal `t()` dict renders cockpit-shell labels in the project language with fr fallback (test).
5. Quality Controller runs in `runReviewPhase` **before** the reviewer; a QC BLOCK blocks the mission, PASS proceeds; verdict in `/trace` (tests).
6. `quality-controller` fiche exists (AGENTS.md §4 shape, ≤7 tools).
7. **5 checks green**: `pnpm -r test` · `pnpm lint` · `pnpm build` · `pnpm --filter @mas/web smoke` · **`scripts/sonar-pr-issues.sh <pr>` exits 0** (CLAUDE.md §7 — zero open issues/hotspots, not just a green gate).
8. No scope creep: no provider/router change, no Phase 5 Tier B execution, no deep per-page i18n; producer/receptacle untouched.

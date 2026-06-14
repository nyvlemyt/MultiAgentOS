# Phase 7 · Project templates + polish — Pre-flight plan

**Date:** 2026-06-14 · **Branch:** `phase/7-templates` (cut from `phase/6-autonomy`; PRs #10/#11
unmerged — work chains) · **Autonomy:** autonomous overnight

## TL;DR
Ship the four project types as **templates** with sensible defaults, **wire the New-project wizard**
end-to-end (today it's a Phase-0 stub with the submit disabled), and add **empty/loading/error**
polish so a fresh user creates a project in < 60 s and emits a mission in < 3 min. Memory seeds land as
`memory_candidates` (§8 — Memory Keeper promotes; never direct `data/memory/` writes). TDD, no LLM
spend. Onboarding tour + exhaustive per-page no-permission states are the explicit 7b deferral.

## Intake-audit (targeted, Phase 7)
Method `docs/workflows/intake-audit-template.md`. Scope: onboarding/empty-state/template patterns.
- Kept (`docs/knowledge/project-doctrine.md` 5-register memory, `production-patterns.md` HITL floors):
  each template sets a **default autonomy floor** (manga-app→assisted, bot→assisted,
  business-website→manual, personal-automation→autopilot for low-risk batches) and a seed-memory set
  keyed to the 5 registers. Skill policy + Tier A roster prefilled per type.
- Decision: no new dep, no ADR (uses existing schema: `projects`, `project_links`, `memory_candidates`).
  One new API route + lib + a templates data module. Re-audit at Phase 8 packaging.
- Distill: short "Project templates & autonomy floors" note in `docs/knowledge/project-doctrine.md`.

## Build steps (TDD — red before green)
1. **Templates module** `apps/web/lib/templates.ts` (+test).
   `PROJECT_TEMPLATES: readonly ProjectTemplate[]` with 4 entries — `manga-app`, `bot`,
   `business-website`, `personal-automation` (→ DB `type:'automation'`). Each:
   `{ id, label, blurb, type, autonomyFloor, defaultMode, defaultModel, stack: string[],
   seedMemory: { register: MemoryRegister; body: string }[], skillPolicy: string[],
   tierARoster: string[] }`. Pure data + `getTemplate(id): ProjectTemplate | undefined`.
   Test: 4 templates; every `type` is a valid `projects.type` enum; autonomyFloor valid; getTemplate.
2. **createProject lib** — extend `apps/web/lib/projects.ts` with
   `createProject(db, input: { name; path; type; templateId?; autonomy?; mode?; stack?: string[] }):
   Promise<Project>`. Slugify name (unique-safe: append `-2`… on collision). Insert the project row.
   If `templateId`: insert `project_links` (kind `skill` for skillPolicy, kind `agent` for tierARoster)
   and one `memory_candidates` row per `seedMemory` entry (status pending — Memory Keeper promotes;
   NEVER write `data/memory/` directly, §8). Test: project inserted with slug; links + candidates
   created from a template; slug collision appends suffix.
3. **Create-project API** `apps/web/app/api/projects/route.ts` — `POST` validates name+path+type
   (400 on missing), calls `createProject`, returns 201 `{ ok, project }`; `GET` lists projects.
   Mirror `app/api/ideas/route.ts` (force-dynamic, nodejs runtime). Test via the lib (route is thin).
4. **Wire the wizard** `app/(cockpit)/projects/new/page.tsx` → client component.
   Template cards (4) — selecting one prefills type/autonomy/mode/stack and shows the blurb. Name +
   absolute-path inputs (path required). Submit → `POST /api/projects` → on 201 redirect to
   `/projects/<slug>`. Replace the "Phase 0 disables submit" note. Keep a11y: every input has a
   `<label>`, the submit button has an accessible name, template cards are real `<button>`s with
   `aria-pressed`. i18n keys (fr default + en) in `lib/i18n.ts`.
5. **EmptyState polish** — `apps/web/components/EmptyState.tsx` (icon/title/hint/optional CTA, themed
   tokens, `role="status"`). Apply to the **projects**, **missions**, and **ideas** list pages when
   their data is empty. Add `loading.tsx` + `error.tsx` for `/projects` and `/missions` (explicit
   skeleton + retry). Test the EmptyState render + a lib path; smoke asserts the wizard template cards
   and an empty-state landmark.
6. **Docs.** Add the template/autonomy-floor note to `docs/knowledge/project-doctrine.md`. No new
   top-level files (components live under `apps/web/components`).

## Deferred to 7b (documented)
- Onboarding tour through the 7 zones (≤5 steps) — lower exit-criterion value; ship after the wizard.
- Exhaustive per-page no-permission states beyond projects/missions/ideas.
- Stack auto-detection from the project path (Phase 3 left it manual).

## Files
- New: `apps/web/lib/templates.ts`(+test), `apps/web/app/api/projects/route.ts`,
  `apps/web/components/EmptyState.tsx`(+test), `apps/web/app/(cockpit)/projects/loading.tsx` +
  `error.tsx`, `…/missions/loading.tsx` + `error.tsx`.
- Edit: `apps/web/lib/projects.ts` (+test), `projects/new/page.tsx`, list pages (empty states),
  `lib/i18n.ts`, `tests/smoke.spec.ts`, `docs/knowledge/project-doctrine.md`.

## Risks / mitigations
- **§8 memory lock**: template seed memory → `memory_candidates` rows ONLY; the Memory Keeper promotes.
  No `data/memory/` writes from the wizard/API. Checker must verify.
- **§5 / autonomy floor**: a template's `autonomyFloor` is a *default*, not an override of the §5 gate;
  high/blocking tasks still pause. business-website floors at `manual`.
- **Slug uniqueness**: collision handling tested (DB has a unique constraint on `projects.slug`).
- **No LLM spend**: wizard + templates are pure data/DB; tests use the temp-DB helper, no LLM.
- **a11y / Sonar**: labels, button names, `aria-pressed`; no nested ternaries; hoist literals; dedup
  fixtures into `testing`/`fixtures`; follow `docs/knowledge/sonar-recurring-rules.md`.

## Definition of Done (5 checks — Sonar is the 5th)
1. `pnpm -r test` green (templates, projects, EmptyState; never export MAS_MOCK_LLM globally).
2. `pnpm lint` clean (incl. SDK-PAYG guard).
3. `pnpm build` clean.
4. `pnpm --filter @mas/web smoke` green (wizard template cards + project-create flow + an empty-state
   landmark).
5. `scripts/sonar-pr-issues.sh <pr>` exits 0 (zero issues + zero hotspots) AND gate status OK.

Plus phase exit: from `/projects/new`, pick the **business-website** template, create a "website audit"
project, land on its page (< 60 s of clicks), and the existing mission flow can emit a mission (< 3 min).

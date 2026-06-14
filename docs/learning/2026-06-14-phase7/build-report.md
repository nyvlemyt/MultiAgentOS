# Phase 7 · Project templates + polish — Build report

**Date:** 2026-06-14 · **Branch:** `phase/7-templates` · **Mode:** autonomous, TDD (red → green)

## What shipped

All 6 build steps from the Doer ① prompt, in order, each RED-before-GREEN and committed:

1. **Templates module** — `apps/web/lib/templates.ts` (+`templates.test.ts`).
   `PROJECT_TEMPLATES` (4: `manga-app`, `bot`, `business-website`, `personal-automation`→type
   `automation`) with `type / autonomyFloor / defaultMode / defaultModel / stack / seedMemory
   (keyed to the 5 doctrine registers) / skillPolicy (existing `mas-*` ids) / tierARoster
   (existing Tier A fiche ids)` + `getTemplate(id)`. 7 tests.
2. **createProject lib** — extended `apps/web/lib/projects.ts` with `slugify` + `createProject`.
   Slugify (NFKD + diacritic strip + split/filter/join, no greedy-trim regex) with collision
   suffix `-2/-3…`; template defaults applied; on a template inserts `project_links` (skill +
   agent) and one **pending** `memory_candidates` row per seedMemory entry (register → candidate
   type mapping). **No `data/memory/` write** — Memory Keeper remains the sole writer (§8). 7 tests.
3. **API route** — `apps/web/app/api/projects/route.ts`: `POST` validates name+path+type (400 else
   201 via `createProject`), `GET` lists; `force-dynamic` + `runtime='nodejs'` (mirrors ideas route).
   Thin route; logic tested in the lib.
4. **Wizard** — `apps/web/components/NewProjectWizard.tsx` (`'use client'`) + server
   `app/(cockpit)/projects/new/page.tsx` (resolves active language, renders the wizard). 4 template
   `<button>` cards with `aria-pressed`; selecting prefills type/autonomy/mode/stack + shows the
   blurb; name + required path inputs (all labeled); submit → `POST /api/projects` → redirect to
   `/projects/<slug>` on 201, inline `role="alert"` error otherwise. Phase-0 note removed. i18n
   keys (fr default + en) added to `lib/i18n.ts`. Themed `.input` styles kept.
5. **Polish** — `apps/web/components/EmptyState.tsx` (+`empty-state.test.ts`, 4 tests; themed,
   `role="status"`, title/hint/cta). Applied to **projects**, **missions**, **ideas** list pages
   when empty (no Lorem). Added `loading.tsx` (skeleton, `role="status"`) + `error.tsx`
   (`'use client'`, `role="alert"` + retry) under `projects/` and `missions/`. Extended
   `tests/smoke.spec.ts`: a Phase-7 spec that asserts the 4 template cards, `aria-pressed` on
   select, then a real create reaching `/projects/website-audit`; plus a projects-list render spec.
   `vitest.config.ts` gained `esbuild.jsx: 'automatic'` so `.tsx` components render via
   `react-dom/server` in the node-only harness.
6. **Docs** — "Project templates & autonomy floors" subsection added to
   `docs/knowledge/project-doctrine.md` (floor table + §5/§8 invariants). No new top-level files.

## Files

**New:** `apps/web/lib/templates.ts`, `apps/web/lib/templates.test.ts`,
`apps/web/lib/projects.create.test.ts`, `apps/web/app/api/projects/route.ts`,
`apps/web/components/NewProjectWizard.tsx`, `apps/web/components/EmptyState.tsx`,
`apps/web/empty-state.test.ts`, `apps/web/app/(cockpit)/projects/{loading,error}.tsx`,
`apps/web/app/(cockpit)/missions/{loading,error}.tsx`.

**Edited:** `apps/web/lib/projects.ts`, `apps/web/lib/i18n.ts`, `apps/web/vitest.config.ts`,
`apps/web/app/(cockpit)/projects/new/page.tsx`, `apps/web/app/(cockpit)/{projects,missions,ideas}/page.tsx`,
`apps/web/tests/smoke.spec.ts`, `docs/knowledge/project-doctrine.md`.

7 commits (Conventional Commits, each ending with the Fable Co-Authored-By line).

## The 4 checks (real tails)

| Check | Result | Numbers |
|-------|--------|---------|
| `pnpm -r test` | PASS | 7 workspaces, all green: core 88, db 13, skills 11, memory 41, agents 62, web 64, worker 4 |
| `pnpm lint` | PASS | SDK-PAYG guard clean (§11/§11.bis) + `tsc --noEmit` clean across 7 projects |
| `pnpm build` | PASS | Next build clean; `/projects/new` now dynamic (3.71 kB); `/api/projects` route built |
| `pnpm --filter @mas/web smoke` | PASS | 31 passed (incl. Phase-7 wizard create flow + projects-list) |

5th check (Sonar) is run post-push by the main session per CLAUDE.md §7. Code follows
`docs/knowledge/sonar-recurring-rules.md`: no `use*` helper names (S6440 — the React hook
`useMemo`/`useState`/`useRouter` are framework hooks, not custom helpers), `node:` import prefixes,
`readonly` props, no nested ternaries, hoisted/shared literals (`CORE_ROSTER`), `new Set(...)` for
membership checks, slugify avoids greedy-trim regex (split/filter/join), no hardcoded `/tmp` literal
(tests use `join(tmpdir(), …)`), a11y labels + button names + `aria-pressed`.

## §8 / §5 / §11 invariants

- **§8 memory lock:** template seed memory → `memory_candidates` (status `pending`, `sourceKind:'note'`)
  ONLY. Verified by `projects.create.test.ts` and by grep — `createProject` imports nothing from the
  memory store and writes no `data/memory/` files.
- **§5 / autonomy floor:** the template `autonomyFloor` is a **default**, not a §5 override —
  documented in `project-doctrine.md`; high/blocking gating is untouched.
- **§11 billing:** no `@anthropic-ai/sdk` import; the create path is pure data + DB, no LLM spend;
  `MAS_MOCK_LLM` not exported globally.

## 7b deferrals (documented, accepted by plan)

- Onboarding tour through the 7 zones (≤5 steps) — lower exit-criterion value than the wizard.
- Exhaustive per-page no-permission states beyond projects/missions/ideas (e.g. agents, skills,
  trace, tokens still use their existing presentation).
- Stack auto-detection from the project path (Phase 3 left it manual; wizard keeps a manual stack
  field).
- Deep per-page i18n beyond the wizard + cockpit shell (existing list-page headings stay English,
  consistent with the pre-Phase-7 codebase).

## Exit criterion

From `/projects/new` a fresh user picks the **business-website** template (prefills type
`business-website`, autonomy floor `manual`, standard mode, stack), enters a name + absolute path,
submits, and lands on `/projects/<slug>` — exercised end-to-end by the Phase-7 smoke spec. The
existing mission/idea flow (unchanged) can then emit a mission from that project.

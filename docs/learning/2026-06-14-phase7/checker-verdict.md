# Phase 7 · Project templates + polish — Checker verdict

**Date:** 2026-06-14 · **Branch:** `phase/7-templates` · **HEAD:** d06781a · **Mode:** READ-ONLY review

Verified against `docs/learning/2026-06-14-phase7-preflight/plan.md`, the Phase 7 section of `ROADMAP.md`,
`CLAUDE.md` (§5, §7, §8, §11, §12), and the build report. All 4 local checks were re-run by the Checker
(not taken on trust). Overall: **PASS** with two non-blocking notes for the main session to confirm at
the Sonar (5th) gate.

---

## 1. Templates (`apps/web/lib/templates.ts`) — PASS

- Exactly 4 templates: `manga-app`, `bot`, `business-website`, `personal-automation`. Order asserted by
  `templates.test.ts`.
- `personal-automation` → DB `type: 'automation'` (verified in code + test).
- Every `type` ∈ `projects.type` enum (`manga-app|bot|business-website|automation|other`); every
  `autonomyFloor` ∈ `manual|assisted|autonomous|autopilot`; every `defaultMode` ∈ `eco|standard|expert`
  — asserted by `templates.test.ts` "uses only valid enum values everywhere".
- Each template carries `seedMemory` (≥2, keyed to the 5 doctrine registers), non-empty `skillPolicy`
  and `tierARoster`. `getTemplate` hit + miss tested.
- Floors match the plan: manga-app→assisted, bot→assisted, business-website→manual,
  personal-automation→autopilot.

## 2. createProject (`apps/web/lib/projects.ts`) — PASS

- Inserts a project with a slugified name; `uniqueSlug` appends `-2/-3…` on collision (tested: audit /
  audit-2 / audit-3). Slugify is NFKD + diacritic strip + split/filter/join (no greedy-trim regex).
- Template path inserts `project_links` (`kind:'skill'` per skillPolicy, `kind:'agent'` per tierARoster)
  and one **pending** `memory_candidates` row per seedMemory entry (`sourceKind:'note'`,
  register→type map). Bare (no-template) input creates no links/candidates — tested.
- **§8 memory lock holds.** Grep of the create path (`projects.ts`, `route.ts`, `NewProjectWizard.tsx`,
  `templates.ts`) finds NO `MemoryStore`, no `data/memory/` write, no `fs.write*` — the only `data/memory`
  hit is a comment. Memory Keeper remains the sole writer. Seeds land as candidates only.

## 3. API (`apps/web/app/api/projects/route.ts`) — PASS

- `POST` validates name/path (trim, 400 on empty) and `type` via a `Set`-backed `isProjectType` (400 on
  invalid), calls `createProject`, returns **201** `{ ok:true, project }`. `GET` lists projects ordered
  by `lastActiveAt`. `export const dynamic='force-dynamic'` + `runtime='nodejs'` present (mirrors ideas).
  Route is thin; logic tested in the lib.

## 4. Wizard (`projects/new/page.tsx` + `NewProjectWizard.tsx`) — PASS

- Real client component (`'use client'`). 4 template cards rendered as `<button type="button">` with
  `aria-pressed={active}`; selecting one prefills type/autonomy/mode/stack and reveals its blurb.
- Submit → `fetch('/api/projects', POST)` → on 201 `router.push('/projects/'+slug)`; non-ok shows an
  inline `role="alert"` error. The Phase-0 "disables submit" note is gone.
- a11y: every input is wrapped in a `<label>` via the `Field` helper; the submit button has a clear
  accessible name (`Créer le projet` / `Create project`). i18n fr (default) + en keys added to
  `lib/i18n.ts` (`wizard.*`).
- Server page resolves the active project language and renders the wizard; heading is French
  ("Enregistrer un projet").

## 5. Polish — PASS

- `EmptyState` (`role="status"`, title/hint/optional cta) applied to **projects**, **missions**, and
  **ideas** list pages on empty data (no Lorem). The ideas empty-state has no CTA (capture is inline) —
  acceptable.
- `loading.tsx` (skeleton, `role="status"`) + `error.tsx` (`'use client'`, `role="alert"` + Retry
  button) exist for both `projects/` and `missions/`.
- `empty-state.test.ts` (4 tests) renders via `react-dom/server`. No empty hero left on those pages.

## 6. Five checks — 4/4 local GREEN (Sonar deferred to main session)

| Check | Result | Numbers |
|-------|--------|---------|
| `pnpm -r test` | **PASS** | web 64 (incl. templates 7, projects.create 7, empty-state 4); worker 4; all 7 workspaces green |
| `pnpm lint` | **PASS** | SDK-PAYG guard clean (§11+§11.bis), `tsc --noEmit` clean across 7 projects |
| `pnpm build` | **PASS** | Next build clean; `/projects/new` dynamic (ƒ 3.71 kB); `/api/projects` route built |
| `pnpm --filter @mas/web smoke` | **PASS** | 31 passed (incl. Phase-7 wizard create flow → `/projects/website-audit`, projects-list landmark) |

Sonar (5th check) is run post-push by the main session. Adherence to
`docs/knowledge/sonar-recurring-rules.md` is good overall: no `use*` custom-helper names (only framework
hooks `useMemo/useState/useRouter`), `node:` import prefixes, `Readonly`/`readonly` props, no nested
ternaries, `Set`-backed membership checks, deduped test fixtures (`setupTempDb`, `join(tmpdir(),…)` —
no `/tmp` literal), a11y labels + button names + `aria-pressed`. **Two literals to watch (see findings):**
`'claude-haiku-4-5'` ×4 and the register strings (`'journal'` ×5, `'decisions'` ×5) repeat across the
data table — Sonar S1192 may flag them. They sit in a pure-data array (not logic), so often tolerated,
but the main session should confirm `scripts/sonar-pr-issues.sh` exits 0 and hoist if flagged.

## 7. CLAUDE.md compliance — PASS

- **§5 gate intact.** The template `autonomyFloor` is applied as the project's *default* autonomy
  (`input.autonomy ?? tpl.autonomyFloor ?? 'manual'`); it is not wired to bypass risk gating. The
  doctrine note explicitly states an `autopilot` floor never lifts §5 high/blocking gates. No risky-action
  category was touched.
- **§7 conventions.** 7 Conventional-Commit subjects, all ≤60 chars, each ending with the
  `Co-Authored-By: Claude Fable 5` line (`git log --oneline`). No new top-level files.
- **§8 memory lock.** Candidates only — re-confirmed by grep (point 2).
- **§11 billing.** No runtime `@anthropic-ai/sdk` import (the single grep hit is a fiche markdown line
  documenting the ban). Create path is pure data + DB — no LLM spend in tests; `MAS_MOCK_LLM` not
  exported by any Phase-7 file. Worker startup guard test still passes.
- **§12 knowledge.** "Project templates & autonomy floors (Phase 7)" subsection added to
  `docs/knowledge/project-doctrine.md` with the floor table + §5/§8 invariants.

## 8. Exit criterion — MET

A fresh user can open `/projects/new`, pick **business-website**, enter a name + absolute path, submit,
and land on `/projects/<slug>` — exercised end-to-end by the Phase-7 smoke spec (creates "Website audit"
→ `/projects/website-audit`). The existing idea→mission flow (convert-to-mission smoke test still green)
can emit a mission from that project. The documented 7b deferrals (onboarding tour, exhaustive per-page
no-permission states, stack auto-detection, deep per-page i18n) are lower exit-criterion value and do not
block the phase exit — **acceptable, not a BLOCK**.

## Doer-flagged changes verified

- `vitest.config.ts` `esbuild: { jsx: 'automatic' }` — enables `.tsx` rendering via `react-dom/server` in
  the node harness; `empty-state.test.ts` passes and no other suite regressed (web 64 green). OK.
- `/projects/new` heading changed to French ("Enregistrer un projet") — the smoke route table asserts
  this exact heading and passes; the create-flow spec matches `Nom|Name` / `Créer le projet|Create project`
  for fr+en. OK.

## Findings

- **info** — tierARoster mixes `mas-*` skill ids (CORE_ROSTER: `mas-mission-planner`, `mas-skill-router`,
  …) with real Tier B fiche ids (`design-ux-architect`, `engineering-frontend-developer`). The plan asked
  for "Tier A fiche ids"; the actual Tier A fiches are `mission-planner`, `skill-router`, `reviewer`,
  `memory-keeper`, `context-manager`, `sec-reviewer`, `quality-controller` (no `mas-` prefix). `bot` also
  lists `mas-sec-reviewer` (a skill id) under `tierARoster`. `project_links.refId` has no FK, so nothing
  breaks; this is a naming/consistency nit to reconcile in Phase 8 (or backlog) so links resolve cleanly
  against the agents registry.
- **warn** — Sonar S1192 risk: `'claude-haiku-4-5'` (×4) and register strings (`'journal'`/`'decisions'`
  ×5) repeat in `templates.ts`. They live in a pure-data array, often tolerated by Sonar, but the main
  session must confirm `scripts/sonar-pr-issues.sh` exits 0 (and gate OK) before declaring the 5th check
  green; hoist to consts if flagged.
- **info** — `ideas` list EmptyState ships no CTA (unlike projects/missions). Intentional (capture is
  inline) and within plan scope; noted only for completeness.

---

```json
{
  "verdict": "PASS",
  "findings": [
    { "severity": "info", "message": "tierARoster mixes mas-* skill ids (CORE_ROSTER) with real Tier B fiche ids; actual Tier A fiches have no mas- prefix; bot lists the mas-sec-reviewer skill id as an agent. No FK so nothing breaks — reconcile naming in Phase 8 / backlog." },
    { "severity": "warn", "message": "Sonar S1192 risk: 'claude-haiku-4-5' (x4) and register strings ('journal'/'decisions' x5) repeat in templates.ts. Pure-data array (often tolerated), but main session must confirm scripts/sonar-pr-issues.sh exits 0 + gate OK; hoist if flagged." },
    { "severity": "info", "message": "ideas list EmptyState has no CTA (projects/missions do); intentional inline-capture, within plan scope." }
  ]
}
```

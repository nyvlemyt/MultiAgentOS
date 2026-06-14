# Phase 7 — Doer ① and Checker ② prompts (ready to paste)

---

## ① DOER prompt

You are the Doer for **Phase 7 · Project templates + polish** of MultiAgentOS. Autonomous, TDD, on
branch `phase/7-templates` (already created from `phase/6-autonomy`). Read `CLAUDE.md` (esp. §5, §7
verification, §8 memory lock — Memory Keeper is the SOLE writer to `data/memory/`, §11 billing, §12
knowledge), the Phase 7 section of `ROADMAP.md`, and `docs/learning/2026-06-14-phase7-preflight/plan.md`
— that plan is your spec. Read `docs/knowledge/sonar-recurring-rules.md` BEFORE writing code.

Inspect existing patterns first: `apps/web/app/(cockpit)/projects/new/page.tsx` (the stub to replace),
`apps/web/lib/projects.ts` + `lib/projects.test.ts`, `apps/web/app/api/ideas/route.ts` (mutation route
pattern — force-dynamic + nodejs runtime), `apps/web/lib/ideas.ts` (`createIdea` insert pattern),
`apps/web/lib/i18n.ts`, `apps/web/lib/fixtures.ts`, `packages/db/src/schema.ts` (`projects`,
`projectLinks`, `memoryCandidates` shapes), and `apps/web/tests/smoke.spec.ts` + how lib tests set up a
temp DB (`packages/agents/src/testing.ts` / web lib `*.test.ts`).

Build in order, each RED-before-GREEN (Vitest). Commit each step (Conventional Commits ≤60 chars, every
message ending with `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`).

1. **Templates module** `apps/web/lib/templates.ts` (+`templates.test.ts`). `ProjectTemplate` =
   `{ id; label; blurb; type; autonomyFloor; defaultMode; defaultModel; stack: string[]; seedMemory:
   { register; body }[]; skillPolicy: string[]; tierARoster: string[] }`. Export
   `PROJECT_TEMPLATES: readonly ProjectTemplate[]` with 4 entries — `manga-app` (type `manga-app`,
   floor `assisted`), `bot` (type `bot`, floor `assisted`), `business-website` (type
   `business-website`, floor `manual`), `personal-automation` (type `automation`, floor `autopilot`).
   Give each a realistic stack, 2-3 seed-memory items keyed to the 5 registers, a small skillPolicy
   (existing `mas-*` skill ids) and a tierARoster (existing Tier A fiche ids). Export
   `getTemplate(id): ProjectTemplate | undefined`. Test: 4 templates; every `type` ∈ the
   `projects.type` enum; every `autonomyFloor` ∈ the autonomy enum; `getTemplate` hit + miss.

2. **createProject lib** — extend `apps/web/lib/projects.ts`: `createProject(db, input: { name: string;
   path: string; type: <projects type>; templateId?: string; autonomy?: <autonomy>; mode?: <mode>;
   stack?: string[] }): Promise<Project>`. Slugify `name`; on unique collision append `-2`,`-3`… Insert
   the project (defaults from the template when `templateId` given, else from `input`). If a template:
   insert `projectLinks` rows (`kind:'skill'` per skillPolicy id, `kind:'agent'` per tierARoster id)
   and ONE `memoryCandidates` row per `seedMemory` entry (status pending — Memory Keeper promotes;
   NEVER write `data/memory/` directly, §8). Test: project inserted with expected slug; template links
   + candidates created; slug collision appends a suffix; non-template create works with bare input.

3. **Create-project API** `apps/web/app/api/projects/route.ts` — `POST`: parse JSON, validate
   name+path+type (400 with `{ ok:false, error }` on missing/invalid), call `createProject`, return 201
   `{ ok:true, project }`. `GET`: list projects. `export const dynamic='force-dynamic'; export const
   runtime='nodejs';` (mirror ideas route). Keep the route thin — logic lives in the lib (tested there).

4. **Wire the wizard** `app/(cockpit)/projects/new/page.tsx` → a client component (`'use client'`).
   Render 4 template cards as real `<button>`s with `aria-pressed`; selecting one prefills type +
   autonomy + mode + stack and shows its blurb. Name + absolute-path inputs (path required). On submit,
   `fetch('/api/projects', { method:'POST', body: JSON.stringify(...) })`; on 201 `router.push(
   '/projects/' + project.slug)`; show an inline error on non-ok. Remove the "Phase 0 disables submit"
   note. a11y: every input has a `<label>` (keep the `Field` helper), the submit button has a clear
   name. i18n keys (fr default + en) in `lib/i18n.ts`. Keep the existing themed `.input` styles.

5. **EmptyState polish** — `apps/web/components/EmptyState.tsx`: `{ title; hint?; cta? }`, themed via
   the existing CSS vars, `role="status"`. Apply it to the **projects**, **missions**, and **ideas**
   list pages when their data array is empty (no Lorem; a clear title + CTA to the relevant create
   flow). Add `loading.tsx` (skeleton) + `error.tsx` (`'use client'`, message + retry button) under
   `app/(cockpit)/projects/` and `app/(cockpit)/missions/`. Test the EmptyState render
   (`components/EmptyState.test.tsx` or a lib-style test); extend `tests/smoke.spec.ts` with one spec
   asserting `/projects/new` shows the template cards and the create flow reaches a project page (you
   can submit the form against the real dev DB the smoke harness uses, or assert the cards + button
   names if creating a row is impractical in smoke — prefer a real create if the harness allows).

6. **Docs.** Add a "Project templates & autonomy floors" subsection to
   `docs/knowledge/project-doctrine.md`. No new top-level files.

**Hard rules:** TDD (watch red first). No `@anthropic-ai/sdk` import anywhere; don't touch
`packages/core/src/providers/`. Never export `MAS_MOCK_LLM` globally. **Template seed memory → only
`memory_candidates` rows; never `data/memory/` writes (§8).** Autonomy floors are defaults, not §5
overrides — high/blocking still gates. Dedup test fixtures (Sonar duplication). a11y: labels, button
names, `aria-pressed`; no nested ternaries; hoist duplicated literals (`docs/knowledge/
sonar-recurring-rules.md`).

**When done**, run from repo root and capture exact tails (don't claim green without real output):
`pnpm -r test` · `pnpm lint` · `pnpm build` · `pnpm --filter @mas/web smoke`. Fix until green (TDD).
Write `docs/learning/2026-06-14-phase7/build-report.md` (what shipped, files, the 4 check tails,
7b deferrals) and commit it. Leave commits on `phase/7-templates`; do NOT push (main session pushes).

Return a concise summary: files created, commit count, pass/fail + numbers of each of the 4 checks.

---

## ② CHECKER prompt

You are the Checker for **Phase 7 · Project templates + polish**. READ-ONLY — do NOT modify source.
Repo `/Users/melvyn/Documents/02_PROJETS/multiAgentOS`, branch `phase/7-templates`. Verify against
`docs/learning/2026-06-14-phase7-preflight/plan.md`, the Phase 7 section of `ROADMAP.md`, and `CLAUDE.md`
(§5, §7, §8 memory lock, §11 billing, §12). Build report:
`docs/learning/2026-06-14-phase7/build-report.md`.

Check and record findings (with severity):
1. **Templates**: 4 templates (`manga-app`, `bot`, `business-website`, `personal-automation`→
   `automation`); each `type` is a valid `projects.type`; each `autonomyFloor` valid; seedMemory +
   skillPolicy + tierARoster present; `getTemplate` works.
2. **createProject**: inserts a project with a unique slug (collision → suffix); template path inserts
   `projectLinks` (skill+agent) and `memoryCandidates` (pending) — and **writes NOTHING to
   `data/memory/`** (grep to confirm no MemoryStore/file write in the create path; §8).
3. **API**: `POST /api/projects` validates + returns 201; `GET` lists; force-dynamic + nodejs runtime.
4. **Wizard**: real client component, 4 template cards (`aria-pressed`), prefill on select, submit →
   create → redirect to the project page; the "Phase 0 disables submit" note is gone; every input has a
   label; submit button named; i18n fr+en.
5. **Polish**: `EmptyState` applied to projects/missions/ideas empties; `loading.tsx`+`error.tsx` for
   projects + missions; no Lorem/empty hero left on those pages.
6. **5 checks**: RUN `pnpm -r test`, `pnpm lint`, `pnpm build`, `pnpm --filter @mas/web smoke`; paste
   tails + numbers. (Sonar = 5th, run by the main session post-push — assess adherence to
   `docs/knowledge/sonar-recurring-rules.md`: no `use*` helpers/S6440, `node:` prefixes, readonly, no
   nested ternaries, no duplicated literals, deduped fixtures, a11y names/labels.)
7. **CLAUDE.md**: §5 gate intact (autonomy floor is a default, not an override), §7 conventions
   (`git log --oneline`), §8 memory lock (candidates only), §11 billing (no SDK, no LLM spend in tests),
   §12 knowledge note added.
8. **Exit criterion**: judge whether a fresh user can create a "website audit" project via the wizard
   and the existing mission flow can emit a mission — call out any gap as a finding (and whether the 7b
   deferrals, onboarding tour + extra no-permission states, are acceptable or a BLOCK).

WRITE your full verdict (markdown rationale per the 8 points + a fenced ```json `ReviewerVerdict`
`{ "verdict": "PASS"|"NEEDS_WORK"|"BLOCK", "findings":[{"severity":"info"|"warn"|"block","message":"..."}] }`)
to `docs/learning/2026-06-14-phase7/checker-verdict.md` and commit ONLY that file (message
`docs(phase7): checker verdict`, ending with the Co-Authored-By line). Do not push. Prioritize coverage
over filtering. Return a 3-line summary: verdict + finding counts by severity.

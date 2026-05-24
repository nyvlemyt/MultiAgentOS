# MultiAgentOS — Roadmap

Each phase has hard exit criteria. **Do not start phase N+1 without explicit user green light.** Budgets in tokens are guidance for the build sessions themselves (i.e. how much it costs us to *build* MultiAgentOS, not what MultiAgentOS spends at runtime).

## Branching rule (permanent)

Every phase from Phase 1 onward is developed on a **dedicated git branch** named `phase/N-short-name` (e.g. `phase/1-mission-lifecycle`, `phase/2-real-claude`). Phase work never lands directly on `main`.

After all checks pass (`pnpm lint`, `pnpm test`, `pnpm build`, `pnpm smoke`), the branch is pushed to `origin`. **Merging into `main` requires explicit user approval.** No fast-forward auto-merge, no PR auto-merge.

Phase 0 was the bootstrap exception and lives on `main` directly because the repo did not yet exist when it ran.

---

## Phase 0 · Foundations + visual vision  (≈ 3–4 sessions, ~ 90 k tokens)

**Goal:** a walkable skeleton **plus the full visual vision rendered with mocked data**. After Phase 0, opening the cockpit must immediately communicate "this is a premium agent studio", even though no real agent executes anything yet.

**Repo + tooling**

- `git init` ✓ (already done at planning time). pnpm workspaces, baseline `tsconfig.base.json`, shared `eslint.config.js`, `vitest.config.ts`, `.editorconfig`.
- `package.json` scripts: `dev` (Next.js + worker concurrent), `build`, `test`, `lint`, `db:migrate`, `db:seed`, `skills:reindex`.

**Frontend (apps/web)**

- Next.js 15 App Router + TypeScript. Tailwind + shadcn/ui initialized.
- Theme system via the `theme-factory` skill: light + dark themes, single accent token, persisted via `localStorage` and an HTML `data-theme` attribute. Topbar toggle.
- Typography pair shipped (display + mono). Vertical rhythm tokens. Spacing scale.
- Layout shell: collapsible sidebar (zone nav), topbar (active project pill, autonomy pill, mode pill, budget pill, theme toggle).
- Routes scaffolded with **populated mocked-data UI** (not empty placeholders):
  - `/` Command Center — 7 cards filled with mock figures.
  - `/projects` list + `/projects/[slug]` detail. Seed registers the user's manga app (codename **OtakuGO_UP**) at the absolute path `/Users/melvyn/Documents/03_PROFESSIONNEL/OtakuGO_UP`.
  - `/projects/new` registration wizard (filesystem path picker + form).
  - `/missions` kanban with 5 mock missions across the 7 columns.
  - `/missions/[id]` mission detail (FSM ribbon + task DAG + trace strip + diff preview placeholder).
  - `/agents` grid + `/agents/[id]` detail (with the 6 Tier A agents as cards; 4 mock Tier B agents shown busy).
  - `/studio` Agent Studio with the **orbit view** wired to mocked agents + animated delegation edges; org-chart view as a toggle.
  - `/skills` table with the real 20 + 14 installed skills auto-listed (no summaries yet — that's Phase 3).
  - `/tokens` page with mock spend charts.
  - `/trace` timeline with mock events.
  - `/memory` two columns with mock items + an inbox.
- Reusable components built in `packages/ui` (or `apps/web/components`): `AgentAvatar` (status ring), `AgentCard`, `MissionCard`, `KanbanColumn`, `RiskBadge`, `BudgetBar`, `ModePill`, `ScopeBreadcrumb`, `OrbitView`, `OrgChartView`, `Timeline`, `Sparkline`.

**Backend skeleton**

- `packages/db`: Drizzle schema + initial migration covering every table in `PRODUCT_SPEC.md §8` (including `projects.path`, `project_links`, `permissions`).
- `apps/worker`: Node `tsx` daemon — logs "worker alive", polls `tasks` table every 2 s.
- SSE channel `/api/stream`: worker emits 1 test event per 5 s; web subscribes and renders it on `/trace`.
- `config/permissions.json` skeleton (empty allowlists, schema-only) and a typed loader in `packages/core/permissions.ts`.
- Seed script (`pnpm db:seed`) populates: 1 external project — **OtakuGO_UP** at `/Users/melvyn/Documents/03_PROFESSIONNEL/OtakuGO_UP` (type: `manga-app`, autonomy: `manual`, mode: `eco`) — 6 Tier A agents with their geometric SVG avatars, 4 mock Tier B agents, 1 demo mission in `draft`, 30 mock trace events.
- Avatar style: stylized geometric SVGs (no faces, no characters). One distinct geometric mark per Tier A agent (compass for Skill Router, map for Mission Planner, brain-circuit for Context Manager, book for Memory Keeper, magnifier for Reviewer, shield for Sec Reviewer). Tier B inherits a domain-prefix default.
- Theme default: **dark**. Light mode is toggleable in the topbar. Both themes generated through `theme-factory`.

**UX/UI skills used during build**

- `ui-ux-pro-max` — page-by-page guidance, density review, interaction states.
- `frontend-design` — component patterns, hierarchy, layout.
- `theme-factory` — light/dark token generation.
- `webapp-testing` — smoke test that every route loads without console errors and renders its key landmarks (used as the exit-criteria proof).

**.gitignore** covers `data/`, `.env*`, `node_modules`, `.next`, `*.db` (already written at planning time).

**Exit criteria.**

1. `pnpm dev` brings up the cockpit; light/dark theme toggle works.
2. All 13 routes (`/`, `/projects`, `/projects/[slug]`, `/projects/new`, `/missions`, `/missions/[id]`, `/agents`, `/agents/[id]`, `/studio`, `/skills`, `/tokens`, `/trace`, `/memory`) render with mock data — no empty hero sections, no Lorem-ipsum, all key landmarks present.
3. Drizzle migration applies clean. `pnpm db:seed` works.
4. Worker idle-polls. SSE roundtrip visible in `/trace`.
5. `webapp-testing` smoke test green for every route.
6. The agent studio orbit view animates at least one delegation edge between two mocked agents.

---

## Phase 1 · Mission lifecycle (mocked LLM)  (≈ 3–4 sessions, ~ 90 k tokens)

**Goal:** end-to-end mission run with **mocked** Claude — proves the FSM and the UI before paying for real tokens.

- Tier A fiches written for the 6 MVP agents (`AGENTS.md §3`); content stubbed where LLM is needed.
- Mocked LLM in `packages/core/llm.ts` returns deterministic JSON per agent.
- Mission Planner produces a fixed task DAG for the seed mission.
- Skill Router picks from a hardcoded matrix per task tag.
- Task dispatcher in worker: topological execution, concurrency = 1, risk gate stub.
- Mission Board kanban interactive (drag = status change for `Inbox`/`To clarify`/`Planned`).
- Validation modal triggered for any `risk = high` task.
- Trace timeline shows real events from the run.

**Exit criteria.** Seed mission flows `draft → archived` via UI clicks. Trace records every event with the correct agent + task IDs. Risk-high task pauses for validation. All happens with zero Anthropic API spend.

---

## Phase 2 · Real Claude integration  (≈ 2–3 sessions, ~ 80 k tokens)

**Goal:** swap the mock for `@anthropic-ai/sdk`. Token meter live.

- `@anthropic-ai/sdk` wired in `packages/core/llm.ts` behind the same interface.
- Token meter records `input_tokens`, `output_tokens`, `cache_read`, `cache_creation`, `cost_cents` per call.
- Mode pill in topbar (`eco` / `standard` / `expert`) drives model choice + Caveman gate.
- Caveman system-prompt suffix applied only on the routes listed in `TOKEN_STRATEGY.md §6`.
- Context Manager builds the first real context pack for the manga seed project (≤ 4 k tokens).
- Anthropic prompt cache enabled with `cache_control: ephemeral` on the system blocks.
- `/tokens` page shows live spend + cache hit ratio.

**Exit criteria.** Same seed mission runs against real Claude under 30 k tokens total. Token meter accurate within ±5 %. Cache hit rate ≥ 50 % on a 2-mission rerun.

---

## Phase 3 · Skill Registry  (≈ 1–2 sessions, ~ 40 k tokens)

**Goal:** skills become first-class citizens.

- Auto-discovery scanner reads `.claude/skills/*/SKILL.md` and any nested `superpowers/skills/*`.
- For each skill, the Skill Router calls `skill-creator` once to produce a `summary.md` (≤ 200 tokens) and a tag set in `data/skill-cache/<id>/`.
- Skill Router pulls summaries, not bodies, by default. `requireSkill(id)` hydrates bodies on demand.
- `/skills` page: searchable table, per-project relevance toggle, "promote to project-pinned" action.
- Skill policy persisted in `config/skills.policy.json` and editable from the UI.

**Exit criteria.** All 20 top-level skills + 14 superpowers sub-skills indexed. Each has a `summary.md`. Filter + promote actions work and persist across reload.

---

## Phase 4 · Memory  (≈ 1–2 sessions, ~ 40 k tokens)

**Goal:** missions produce memory; memory rehydrates the next mission.

- Memory Keeper agent reads `memory_candidates` table; promotes or rejects per rules.
- `/memory` page: accept / reject candidates, edit body, change scope, retire stale items.
- Per-project memory summary auto-injected into Mission Planner prompts.
- Global memory available cross-project under a strict cap (≤ 5 items per call).
- Memory write path locked to Memory Keeper only.

**Exit criteria.** A second mission on the same project visibly leverages the first mission's memory in its plan (verify via Trace diff of system prompts).

---

## Phase 5 · Tier B wrapping  (≈ 2–3 sessions, ~ 90 k tokens)

**Goal:** real specialized work via the 58 library agents.

- Library loader for `.claude/agents/*.md` (parses YAML front-matter into a typed `AgentFiche`).
- `delegate()` in `dispatch.ts` builds an LLM prompt that includes the Tier B fiche + the current task + a constrained tool-use surface.
- Wire the 8 Tier B agents listed in `AGENTS.md §6`.
- Frontend Builder writes diffs against a sandboxed copy of the target project. Diffs are validated with `git apply --check` before being shown.

**Exit criteria.** A real mission (e.g. "polish the manga feed empty-state") produces a unified diff that applies clean and is reviewed by Code Reviewer + Reality Checker before reaching the user for validation.

---

## Phase 6 · Autonomy + risk gates  (≈ 1–2 sessions, ~ 40 k tokens)

**Goal:** autonomous + autopilot modes work safely.

- Risk classifier (rule-based table first, LLM fallback via Sec Reviewer) tags every task with `risk` before dispatch.
- Risky actions write a `validations` row and pause execution. UI surfaces them on the dashboard.
- Autopilot scheduler in worker (cron-like, in-DB) runs `risk ≤ low` batches on a configurable window.
- Daily report at autopilot wake: missions advanced, blocked, validations needed, € spent.

**Exit criteria.** Autopilot can run an indexing/summary batch overnight; the audit log shows nothing high-risk ran unsupervised; the wake-up report is in `/trace` and on the dashboard.

---

## Phase 7 · Project templates + polish  (≈ 2–3 sessions, ~ 80 k tokens)

**Goal:** the four project types ship as templates with sensible defaults.

- "New project" wizard with templates: `manga-app`, `bot`, `business-website`, `personal-automation`.
- Each template ships a seed memory, a default Skill Router policy, a default Tier A roster, and a default autonomy floor.
- Empty-state UX love on every page; loading / error / no-permission states explicit.
- Brief onboarding tour through the 7 zones (≤ 5 steps).

**Exit criteria.** A fresh user creates a new "website audit" project in < 60 s and emits a real mission in < 3 min.

---

## Phase 8 · Packaging + multi-mission (later)

- Tauri desktop wrapper.
- Multi-project parallel execution (concurrency budget per project).
- Claude Code CLI integration as an alternative executor for shell-heavy missions (use the headless `claude` CLI from `apps/worker`).
- Optional Slack / Telegram notifier for autopilot wake reports.

---

## The "Future Build Prompt"

Once this plan is validated, paste this in a fresh Claude Code session at the repo root to start **Phase 0**:

> Read `CLAUDE.md`, `PRODUCT_SPEC.md`, `AGENTS.md`, `ROADMAP.md`, `SKILLS_REGISTRY.md`, `TOKEN_STRATEGY.md`. Then execute **Phase 0 only** from `ROADMAP.md`. Follow the locked stack in `CLAUDE.md §2`. Use the `superpowers:writing-plans` skill to confirm the per-task plan before any code is written. Apply the build-time pinned skills in `SKILLS_REGISTRY.md §0` (`ui-ux-pro-max`, `frontend-design`, `theme-factory`, `webapp-testing`, `superpowers:test-driven-development`, `superpowers:verification-before-completion`). Work directly on `main` — no worktree. Stop at Phase 0 exit criteria — do not start Phase 1 without my explicit green light. Token budget for this session: 90 k. If you reach 80 % of budget, pause and report.

For subsequent phases, swap the phase number and the budget (see the per-phase estimates above). Each phase prompt must reaffirm "stop at exit criteria, do not start the next phase".

## Per-phase budget table (build sessions, not runtime)

| Phase | Estimated build tokens | Notes                                                      |
| ----- | ---------------------- | ---------------------------------------------------------- |
| 0     | 90 k                   | Skeleton + full visual vision with mocked data.            |
| 1     | 90 k                   | FSM + real interaction wiring; mocked LLM keeps spend low. |
| 2     | 80 k                   | Some live Claude calls to validate token meter.            |
| 3     | 40 k                   | Heavy on summaries (cheap haiku calls).                    |
| 4     | 40 k                   | Memory store + Keeper agent.                               |
| 5     | 90 k                   | Real delegated runs against real Tier B fiches.            |
| 6     | 40 k                   | Mostly rules + UI for validations.                         |
| 7     | 80 k                   | Templates + onboarding polish.                             |

Cumulative budget to MVP-complete (through Phase 7): **≈ 550 k build tokens**. At Sonnet 4.6 input rates this should land well under the 20 € envelope provided runtime missions stay in `eco` mode.

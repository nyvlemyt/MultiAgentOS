# MultiAgentOS — Roadmap

Each phase has hard exit criteria. **Do not start phase N+1 without explicit user green light.** Budgets in tokens are guidance for the build sessions themselves (i.e. how much it costs us to *build* MultiAgentOS, not what MultiAgentOS spends at runtime).

## Branching rule (permanent)

Every phase from Phase 1 onward is developed on a **dedicated git branch** named `phase/N-short-name` (e.g. `phase/1-mission-lifecycle`, `phase/2-claude-code-bridge`). Phase work never lands directly on `main`.

After all checks pass (`pnpm lint`, `pnpm test`, `pnpm build`, `pnpm smoke`), the branch is pushed to `origin`. **Merging into `main` requires explicit user approval.** No fast-forward auto-merge, no PR auto-merge.

Phase 0 was the bootstrap exception and lives on `main` directly because the repo did not yet exist when it ran.

---

## Build order (re-sequenced 2026-06-09, user GO)

The **document** keeps phases in numeric order for readability, but the **build order** from Phase 4 onward is:

> **Phase 4 ✅ (verified) → Phase 4.5-producer ✅ (built 2026-06-12, split per ADR 0004 — receptacle deferred) → Phase 3.5 (Multi-model Router) → Phase 4.5-receptacle (Ideas/Decisions/Prioritization) → Phase 5 → …**
>
> **Split note (2026-06-12):** Phase 4.5 built **producer-only** (auto-capture, intake, classifier, security gate, trust auto-file, intake-audit skill, provenance migration) on `phase/4.5-memory-intake`. The receptacle half (§B Ideas/Decisions/prioritization UI) follows Phase 3.5, as allowed by ADR 0004 §Consequences. Build report: `docs/learning/2026-06-12-phase4.5-intake/build-report.md`.

**Why 4.5 before 3.5:** Phase 4.5 *feeds* the memory — auto-capture on `mission-complete`, multi-source intake, classification into registers. Phase 3.5's multi-account router *consumes* grounded project memory to ground non-Claude providers and justify routing. Build the producer of memory before its consumer. (The auto-capture explicitly deferred in Phase 4's capture BDR — agentmemory hooks behind the `captureCandidates()` seam — lands in 4.5, not bolted onto Phase 4.) Architecture: **ADR 0004**. Pre-flight pack: `docs/learning/2026-06-09-phase4.5-preflight/`.

**Optional split** (decide at the 4.5 pre-flight gate): if 4.5 is too large, build only the *producer* half (intake + auto-capture + classifier + security gate) before 3.5, and defer the *receptacle* half (Ideas Inbox / Decision Log / prioritization UI) to after 3.5.

---

## Learning pre-flight & self-audit (permanent)

Résout le paradoxe de bootstrap : l'outil qui doit créer des projets parfaits doit lui-même être construit avec le meilleur savoir possible — pas en apprenant à la fin. Doctrine complète : [`docs/workflows/knowledge-bootstrap.md`](docs/workflows/knowledge-bootstrap.md).

**Avant de construire chaque phase N (pré-vol obligatoire) :**

1. **Intake-audit ciblé** des ressources pertinentes pour N (`docs/ressources/` + sources), méthode [`docs/workflows/intake-audit-template.md`](docs/workflows/intake-audit-template.md). Cibler la phase, pas tout le lot.
2. **Distiller** le retenu dans `docs/knowledge/` (et `CLAUDE.md` / skills `mas-*` si ça devient une règle).
3. **Puis** construire la phase N.

Les ressources sont un **input par phase**, pas un bloc de fin. Le pré-vol applique l'intake-audit au projet lui-même (bootstrap récursif). Budget : scoper au strict pertinent (cf. `TOKEN_STRATEGY.md`).

**À chaque gate de phase (self-audit / durcissement) :** ré-auditer les artefacts de base déjà construits (`CLAUDE.md`, `AGENTS.md`, fiches Tier A, skills `mas-*`, ADRs) contre le meilleur savoir courant. Corriger ou backloguer la dette — « ce qui a été fait avant n'est pas forcément optimal ».

**Distinction clé** : ce pré-vol nourrit **Claude en build-time** (savoir dans `docs/knowledge/`). Le « second cerveau » runtime cross-projet — même source, consommateur différent — est une feature Phase 4+ ([`docs/backlog/second-brain-cross-project.md`](docs/backlog/second-brain-cross-project.md)).

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

## Phase 2 · Claude Code bridge (Agent SDK)  (≈ 2–3 sessions, ~ 80 k tokens)

**Branch:** `phase/2-claude-code-bridge` (cut from `main`; supersedes the abandoned `phase/2-real-claude`).

**Goal:** drive Claude Code via the Agent SDK (Voie 3, billing against subscription). Zero PAYG spend. See `docs/decisions/0001-claude-code-engine-over-api-sdk.md`.

- `@anthropic-ai/claude-agent-sdk` wired in `packages/core/src/llm.real.ts` behind the existing `LLMClient` interface.
- `ANTHROPIC_API_KEY` presence at worker init triggers warning + refusal to start.
- Session model: one long-lived Claude Code session per project (`sessionId` stored in `projects` table). Each mission is a new *prompt turn* on that session, not a new session (`cwd = project.path`).
- `costCents` renamed to `quotaUnits` across `LLMResponse` and all call sites — **atomic commit with `/tokens` page copy migration** (no intermediate state with mismatched types).
- Token meter records `input_tokens`, `output_tokens`, `cache_read`, `cache_creation`, `quotaUnits` per call. No € figures.
- Mode pill in topbar (`eco` / `standard` / `expert`) drives model choice + Caveman gate.
- Context Manager builds the first real context pack for the manga seed project (≤ 4 k tokens).
- `/tokens` page shows **messages used in current 5-hour window / week** (not €). Window quota key: `(subscriptionUserId, windowStart)`.
- CI guard: `pnpm lint` fails on `import … from '@anthropic-ai/sdk'` outside `packages/core/src/api-fallback/`.
- Drizzle migration: rename `events.cost_cents` → `events.quota_units` + backfill (lands in the same atomic commit as the `LLMResponse.quotaUnits` rename — see atomic rename requirement in ADR 0001 amendments).

**Exit criteria.**

1. Same seed mission runs end-to-end under the Claude Code engine via Agent SDK.
2. Anthropic Console usage graph shows **zero API spend** during the run window.
3. Claude subscription dashboard shows the run consumed messages there.
4. Screenshots of both dashboards saved to `docs/decisions/0001-proof/`.
5. `quotaUnits` meter accurate within ±5 % vs SDK-reported token counts.
6. Cache hit rate ≥ 30 % on a 2-mission rerun.

---

## Phase 3 · Skill Registry  (≈ 1–2 sessions, ~ 40 k tokens)

**Goal:** skills become first-class citizens. **Scope narrowed by ADR 0001 Q3 decision (option b).**

**What Phase 3 covers:**
- Summariser for the **6 orchestrator skills** only (mission-planner, skill-router, context-manager, memory-keeper, reviewer, sec-reviewer). These skills live in the MultiAgentOS repo's `.claude/skills/` and are injected at the prompt layer because the execution session runs with `cwd = project.path` (which loads the *target project's* skills, not MultiAgentOS's).
- Auto-discovery scanner for those 6 skills: reads `.claude/skills/<id>/SKILL.md`, calls `skill-creator` once to produce `data/skill-cache/<id>/summary.md` (≤ 200 tokens) and a tag set.
- Skill Router pulls summaries at prompt-assembly time, never full bodies. `requireSkill(id)` hydrates bodies on demand for the orchestrator tier.
- `/skills` page: searchable table listing all discovered skills (orchestrator + any skills from the active external project loaded natively by the engine), per-project relevance toggle, "promote to project-pinned" action.
- Skill policy persisted in `config/skills.policy.json` and editable from the UI.

**What Phase 3 does NOT need to build:** a summariser for execution-session skills (the engine loads those natively from the target project's `.claude/skills/`).

**Exit criteria.** All 6 orchestrator skills have a `summary.md`. Skill Router injects summaries (not bodies) in mission prompts. Filter + promote actions work and persist across reload.

**Phase 3 domain-tagging addendum (feeds Phase 3.5):** During skill discovery, each skill gets a `domain` tag from a fixed taxonomy: `research | code-execution | code-review | planning | memory | security | ux | writing | search`. The tag is stored in `data/skill-cache/<id>/summary.md` frontmatter and in the `skills` DB table. No routing logic yet — just the taxonomy. The tag set is the input to Phase 3.5 routing rules.

**Phase 3 effort-mapping addendum (quick win, Anthropic best practice):** `project.defaultMode` maps directly to the Claude effort parameter. Wire in `claudeCodeLLM` before Phase 3.5:

| Mode | Effort | Usage |
|------|--------|-------|
| `eco` | `medium` | Tâches courtes, non intelligence-intensive |
| `standard` | `high` | Défaut — équilibre token/intelligence |
| `expert` | `xhigh` | Coding et agentic — meilleur réglage |

Implémenter dans `packages/core/src/llm.real.ts` : passer `effort` dans les options `query()` depuis `LLMRequest.mode`. Voir `docs/knowledge/prompting-anthropic.md §2`.

---

## Phase 3.5 · Multi-model Router  (≈ 1–2 sessions, ~ 40 k tokens)

> **Build order note (2026-06-09):** this phase now builds **after Phase 4.5** (see "Build order" at top). The router consumes the project memory that 4.5's intake produces.

**Goal:** route tasks to the best available model/provider based on task domain and cost policy. Preserve Claude quota for high-value tasks.

**Context:** user has Claude Pro (subscription, limited), ChatGPT (subscription), Gemini (free student), Perplexity (subscription). Skills and agents are provider-agnostic for *cognition* tasks; *execution* tasks (file I/O, bash, git) remain Claude-only via Agent SDK.

**ADR required before coding:** `docs/decisions/0002-multi-model-router.md`. Must amend CLAUDE.md §11 to allow non-Anthropic providers in `packages/core/src/providers/`.

**What Phase 3.5 covers:**

- Provider abstraction: `packages/core/src/providers/` — one `LLMClient` impl per provider:
  - `claude-code.ts` (existing `claudeCodeLLM`, execution tasks only)
  - `openai.ts` (ChatGPT / GPT-4o / o1 via `openai` SDK)
  - `gemini.ts` (Gemini via `@google/generative-ai`)
  - `perplexity.ts` (OpenAI-compatible endpoint, search tasks)
- Routing config: `config/model-routing.json` — maps `domain → provider + model`, with a `fallback` chain. Editable from UI.
- `RouterLLMClient` in `packages/core/src/llm.router.ts` — reads `LLMRequest.domain`, resolves provider, delegates call. Falls back to Claude if provider unavailable.
- `LLMRequest` gains a `domain` field (optional, from the skill's tag). Dispatcher sets it from the task's skill tags.
- Provider credentials stored in `.env.local` (gitignored). Loader in `packages/core/src/providers/credentials.ts` validates presence at startup (warn, not crash, if a non-Claude provider key is missing).
- `/tokens` page: per-provider breakdown (Claude quota units + OpenAI tokens + Gemini tokens).
- Initial routing rules (best-effort, iterable):

| Domain | Primary | Fallback |
|--------|---------|---------|
| `search` | Perplexity | Gemini |
| `code-execution` | Claude Code | — (Claude-only) |
| `code-review` | o1-mini or GPT-4o | Claude |
| `planning` | Claude | GPT-4o |
| `memory` | Gemini | GPT-4o |
| `security` | Claude | o1-mini |
| `ux` | GPT-4o | Claude |
| `writing` | GPT-4o | Gemini |
| `research` | Perplexity | Gemini |

**Exit criteria.** Router resolves `domain → provider` correctly for all 9 domains. A `research` task hits Perplexity (verified via trace log provider field). A `code-execution` task stays on Claude Code. Claude quota drops measurably vs a baseline run with routing disabled.

**Features additionnelles dans Phase 3.5 :**

- **Token fallback automatique** : si Claude renvoie `rate_limit` ou `quota_exhausted`, le RouterLLMClient retente automatiquement avec le provider fallback de la chaîne. Log dans `/trace` : `provider_fallback { from: 'claude', to: 'gpt-4o', reason: 'quota' }`.
- **Mode langue** : `config/project.json` ajoute `language: 'fr' | 'en'`. Tous les system prompts des agents sont générés dans la langue du projet. Mode FR par défaut pour MultiAgentOS. Cockpit UI adapte ses labels. Toggle visible dans le topbar (à côté du mode eco/standard/expert).
- **Quality Controller agent** : ajouté au pipeline (voir AGENTS.md §4). Gate entre exécution et Reviewer. Provider hint : Claude ou o1-mini.

---

## Phase 4 · Memory  (≈ 1–2 sessions, ~ 40 k tokens)

**Goal:** missions produce memory; memory rehydrates the next mission.

- Memory Keeper agent reads `memory_candidates` table; promotes or rejects per rules.
- `/memory` page: accept / reject candidates, edit body, change scope, retire stale items.
- Per-project memory summary auto-injected into Mission Planner prompts.
- Global memory available cross-project under a strict cap (≤ 5 items per call).
- Memory write path locked to Memory Keeper only.
- **Persistence bridge (anti-oubli — CLAUDE.md §13 / `docs/workflows/knowledge-bootstrap.md §5.bis`):** a one-shot, idempotent seed import populates `data/memory/_global/` **from `docs/knowledge/` + `vibeflow/INDEX.md`** — the build-time distilled knowledge becomes the first entries of the runtime second brain. Memory Keeper owns the import (sole writer). Re-runnable when `docs/knowledge/` changes. Without it, build-time and runtime knowledge diverge and everything learned during the build is invisible at runtime.

**Exit criteria.**
1. A second mission on the same project visibly leverages the first mission's memory in its plan (verify via Trace diff of system prompts).
2. **Bridge test (hard gate):** `data/memory/_global/` holds a seeded entry traceable to each `docs/knowledge/` file + the INDEX, and a retrieval query (FTS5/QMD) for a known build-time fact — e.g. *"BDR is the canonical decision-register name"* or *"Mem0 cloud is rejected (§11)"* — returns that seeded entry. If a build-time fact in `docs/knowledge/` is not retrievable from runtime memory, the bridge failed → phase not done.

---

## Phase 4.5 · Memory & Knowledge Intake → Ideas, Decisions & Prioritization  (≈ 3–4 sessions, ~ 70 k tokens)

> **Re-sequenced 2026-06-09 (user GO): builds BEFORE Phase 3.5.** Architecture: **ADR 0004**. Pre-flight pack: `docs/learning/2026-06-09-phase4.5-preflight/`. Title widened from "Ideas, Decisions, Planning & Prioritization" — the planning surfaces are now the **receptacle** half of a phase whose **producer** half (memory/knowledge intake) was specified by the user on 2026-06-08. The backlog already links them: an intake dossier feeds the Ideas Inbox + Decision Log (`docs/backlog/intake-audit-skill.md`, `docs/workflows/intake-audit-template.md`).

**Goal:** close two loops — (1) **Producer:** a finished mission *or* a new resource (repo / note / course / skill / pattern) becomes durable, well-classified memory; (2) **Receptacle:** an idea or decision becomes a prioritized mission. The producer's intake dossier feeds the receptacle's Ideas Inbox + Decision Log, which converts to a mission.

**Guardrails — non-negotiable (CLAUDE.md §5/§8/§11/§12):**
- **No direct memory writes.** Everything is a *candidate* → Memory Keeper *promotion* only (the Phase 4 write-lock holds; §8).
- **Deterministic rules first.** A rule-based classifier (register + scope) runs first; a **light** LLM fallback fires only when rules abstain. Subscription-only, no PAYG (§11).
- **Mandatory security audit before ingesting any repo or executing any source code** — `mas-sec-reviewer` must PASS; `risk: blocking` → always human (§5).
- **≤5 selective-injection cap** preserved (§12). Zero memory pollution, zero quota waste.

### A. Producer — Memory & Knowledge Intake (user's 2026-06-08 vision)

- **Auto-capture on `mission-complete`:** a worker hook fires the close-out ritual automatically at mission end, calling the **existing `captureCandidates()` seam** (Phase 4) → `memory_candidates` rows (status=pending). No new write path. This is the auto-capture deferred in Phase 4's capture BDR — wired cleanly here, not bolted onto Phase 4.
- **agentmemory hooks** (the deferred 4.x option) become the optional auto-capture backend behind that same `captureCandidates()` API.
- **Multi-source intake:** repo / note / course / skill / pattern. Each produces an **intake dossier** at `docs/intake/<date>-<slug>.md` (skeleton already in `intake-audit-template.md`; `docs/intake/` already holds the graphify + qmd dossiers).
- **`intake-audit` skill** (`docs/backlog/intake-audit-skill.md`): the universal "should we add this / how to adapt it / what does it cost" audit — token-cheap, progressive disclosure, produces the dossier. Built per CLAUDE.md §12 (Principles → Process → Rationalizations → Red Flags → Verification Criteria).
- **Classifier (register + scope):** deterministic rules map a candidate/dossier to a register (BDR / LRN / BLK / journal / EVAL) + scope (`project` | `global`). Light LLM only on abstain.
- **Auto-file for trusted sources:** a configurable trust list lets high-confidence sources skip manual triage and be Keeper-promoted directly (still through the Keeper write-path — auto-triage, not a new writer).

### Memory Center

- The `/memory` page (built in Phase 4) is the **visual repository**: pending candidates (from auto-capture + intake), promoted register entries, seeded knowledge. Add an intake-source filter and a "promote / reject / edit" flow already wired in Phase 4.

### B. Receptacle — Ideas Inbox, Decision Log, Prioritization

*(Existing spec, preserved. The intake dossier from Part A lands here. The deterministic scoring below uses no LLM.)*

### Ideas Inbox (`/ideas`)

- New `ideas` table: `id, title, body, scope (global|project), project_id, status (inbox|to_clarify|prioritized|converted|archived), priority_score, impact, urgency, effort_est, cost_est_tokens, created_at, updated_at`.
- Kanban: `Inbox → To clarify → Prioritized → Converted → Archived`.
- "Convert to mission" button: creates a `missions` row in `draft`, links back via `idea_id`, marks idea `converted`.
- Ideas visible in Command Center (Inbox count card) and in `/projects/[slug]` (project-scoped view).
- Global Ideas = ideas with `scope = global` or no `project_id`.

### Decision Log

- New `decisions` table: `id, scope (global|project), project_id, source (user|mission|validation|agent), source_mission_id, source_task_id, title, body, created_at`.
- Memory Keeper may propose a decision candidate (same `proposeMemory` path, distinct `type = decision`).
- User can also log a decision manually from any context (Command Center, project page, mission page).
- Visible in: Command Center sidebar widget (last 5 global decisions) + `/projects/[slug]` section + `/missions/[id]` section.
- No dedicated `/decisions` route at MVP — embedded in existing pages.

### Deadlines & milestones on missions

- Add `deadline date` (nullable) and `milestone text` (nullable, free-form label) to `missions` table via new migration.
- Deadline input in mission creation form and on the mission detail page.
- Command Center: missions with `deadline < now + 7 days` flagged with a warning badge.
- Alert logic (no LLM): `if deadline < created_at + (spentTokens / monthlyRate * 30 days) → flag as unrealistic`. Purely arithmetic.

### Prioritization

- `priority_score integer` added to `missions` and `ideas` tables (0–100, user-editable or auto-computed).
- Score formula (deterministic, no LLM): `impact * 0.35 + urgency * 0.30 + (100 - effort_est) * 0.20 + (100 - risk_score) * 0.15`. All inputs are 0–100 sliders set by the user.
- `/priorities` route: top-N board, sortable by score, filterable by project. Shows: title, score breakdown, deadline, estimated tokens.
- Top 3 priorities surfaced in Command Center "Top priorities" card (replaces the static Recommendations placeholder from Phase 0).

### Project Health widget

- New server-computed `health` object per project (no table — computed at read time from existing rows):
  ```ts
  { missionsTotal, missionsDone, missionsBlocked, lastActivity, budgetUsedPct, nextDeadline, openIdeas, pendingValidations }
  ```
- Rendered as a compact status bar in `/projects/[slug]` header and as a row in `/projects` list.

### Budget: pre-launch cost estimate + projection

- Mission detail page: before "Run", show estimated token cost (from `missions.budget_tokens`, set during `planned` FSM state) with a €-equivalent label.
- `/tokens` page: add "Remaining capacity" widget — `(monthlyCapCents - moneySpentCents) / avgMissionCostCents → N missions estimated remaining this month`. Uses rolling 30-day average, shows "~X missions" or "< 1 mission".

**Schema migration:** one migration adding `ideas`, `decisions` tables + `deadline`, `milestone`, `priority_score` columns to `missions`.

**Exit criteria:**

**Producer (memory & knowledge intake):**
- P1. A completed mission auto-fires the close-out ritual → `memory_candidates` rows (status=pending) appear with **no manual step**; verify no direct memory write occurred (Keeper-promotion path only).
- P2. An intake dossier (repo / note / course / skill / pattern) is produced at `docs/intake/<date>-<slug>.md` and, on promotion, becomes a classified register entry (correct register + scope); deterministic rules used first, any LLM fallback logged.
- P3. Security gate: ingesting a repo / running source code without a `mas-sec-reviewer` PASS is refused (test proves rejection); `risk: blocking` always pauses for human.
- P4. The `intake-audit` skill exists with the §12 structure (Principles → Process → Rationalizations → Red Flags → Verification Criteria) and produces a dossier for a sample item.
- P5. Selective injection still caps at ≤5 global items; auto-capture adds zero startup injection.

**Receptacle (planning surfaces):**
1. `/ideas` kanban renders; creating an idea, moving it to Prioritized, and converting it to a mission all work end-to-end.
2. A decision can be logged manually from the Command Center and appears in `/projects/[slug]`.
3. Setting a `deadline` on a mission shows a warning badge on Command Center when within 7 days.
4. `/priorities` page lists missions sorted by `priority_score`; editing a score via sliders persists.
5. Project Health widget shows correct aggregated values after seed + lifecycle smoke test.
6. `/tokens` "Remaining capacity" widget shows a non-zero mission estimate.
7. `pnpm lint` + `pnpm test` + `pnpm build` + `pnpm smoke` green.

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
| 4.5   | 70 k                   | Memory/knowledge intake (producer) + Ideas/Decisions/Prioritization (receptacle). Builds **before** 3.5. Deterministic-first; light LLM only on classifier abstain. |
| 5     | 90 k                   | Real delegated runs against real Tier B fiches.            |
| 6     | 40 k                   | Mostly rules + UI for validations.                         |
| 7     | 80 k                   | Templates + onboarding polish.                             |

Cumulative budget to MVP-complete (through Phase 7): **≈ 610 k build tokens**. At Sonnet 4.6 input rates this should land well under the 20 € envelope provided runtime missions stay in `eco` mode.

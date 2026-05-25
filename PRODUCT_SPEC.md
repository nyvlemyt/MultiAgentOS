# MultiAgentOS — Product Specification

## 0. One-line pitch

A local cockpit that turns natural-language missions into orchestrated, budget-aware multi-agent execution across all your projects.

## 1. Vision

Stop using Claude as a chat. Use it as a **fleet**. MultiAgentOS is the bridge between "I have an idea" and "the right agents executed the right tasks with the right skills, on budget, with a memory of what they learned."

The product is opinionated: cockpit-first, project-scoped, budget-enforced, validation-gated.

## 2. Primary user

The repo owner. Solo operator. Example project types they expect to **register** with MultiAgentOS (not built into it):

1. **Manga social-network app** — group of 5 humans, frontend-heavy, existing codebase living elsewhere on disk.
2. **WhatsApp / Telegram / messaging bots** — conversational automations, API integrations.
3. **Business website agency work** — audits, UI refonte, branding, SEO.
4. **Personal automation projects** — email digest, AI/news watch, finance, portfolio, trading. These are *future projects you may register later*; MultiAgentOS does not ship any built-in email, finance, or trading feature at MVP.

Each one lives in its own folder on disk and is referenced by MultiAgentOS via an absolute path. See §11.

Constraints: ~20 € Anthropic credit. Token economy is a hard product requirement, not a nice-to-have.

## 3. Non-goals

- Not a SaaS, not multi-tenant, no cloud login at MVP.
- Not a generic chat client.
- Not a plugin marketplace UI (skills are installed via filesystem).
- No mobile app at MVP. Tauri desktop later. Web cockpit first.
- **Does not copy, move, or clone external projects.** MultiAgentOS only references projects by absolute path. The user's code stays where it lives on disk.
- No built-in email / finance / trading workflows at MVP. Those are future projects the user will create later; the architecture only needs to remain extensible and safe.

## 4. Information architecture — cockpit zones and dashboard hierarchy

The first view after launch is **Command Center**. A left sidebar holds the top-level zones. The topbar shows: active project pill, autonomy level pill, mode pill (`eco` / `standard` / `expert`), token budget remaining today.

### 4.0 Dashboard hierarchy

MultiAgentOS has **five dashboard scopes**. Each is a different level of zoom on the same underlying data:

| Scope    | URL pattern              | What it shows                                                                            |
|----------|--------------------------|------------------------------------------------------------------------------------------|
| Global   | `/`                      | Across all projects: active missions, busy agents, blocked tasks, validations, budget.   |
| Project  | `/projects/[slug]`       | Single project: its missions board, its agents, its memory, its context pack health.     |
| Mission  | `/missions/[id]`         | Single mission: FSM, task DAG, per-task panel, live trace, diff preview, validations.    |
| Agent    | `/agents/[id]`           | Single agent: fiche, current task, recent activity, success metrics, dedicated timeline. |
| Catalog  | `/skills`, `/tokens`, `/memory`, `/studio` | Cross-cutting registries and analytics. |

Breadcrumb in the topbar reflects the current scope (e.g. `Manga App ▸ Mission #142 ▸ Tasks ▸ "polish feed empty-state"`).

### 4.1 Visual identity (aesthetic brief)

MultiAgentOS feels like a **premium local-first agent studio** — a small company made of agents, visible at work. The aesthetic is dense, professional, modern; **never** a marketing landing page. Concretely:

- Both **light and dark themes** ship; theme tokens generated via `theme-factory`. Default is dark; switchable in the topbar.
- **High readability** before "wow": good vertical rhythm, generous spacing, no fancy gradients on text.
- **Stylized avatars** for every agent (geometric / abstract, not photographs). A `<AgentAvatar />` component renders avatar + status ring (idle / running / blocked / waiting-validation).
- **Clean cards** with subtle elevation. No drop shadows on more than two layers.
- **Strong typography**: one display family (e.g. Inter Tight or Geist) + one mono (e.g. JetBrains Mono) for code/trace.
- **Density first**: every page must show useful state by default — no half-empty hero sections.

### 4.1 Command Center (route `/`)

Above-the-fold dashboard with 7 cards:

- **Active projects** — count + last activity per project.
- **Missions in flight** — list with progress %, current step, ETA.
- **Agents currently busy** — avatar grid, hover reveals current task.
- **Blocked tasks** — red badge → click to resolve.
- **Pending validations** — CTA "Review N actions" → opens validation modal.
- **Token budget** — today / this month, sparkline, € remaining.
- **Recommendations** — surfaced by the Mission Planner ("3 missions could be batched tonight in autopilot").

### 4.2 Mission Board (route `/missions`)

Kanban with columns: `Inbox` → `To clarify` → `Planned` → `In progress` → `Review` → `Ready to validate` → `Done`. Each card shows: title, assigned agents (avatar stack), skills (tag chips), token budget bar, risk badge, deadline if any.

Filters: project, agent, risk, autonomy override.

### 4.3 Agent Room (route `/agents`)

Grid of agent cards. Each card: name, emoji, status (idle / running / waiting validation), domain tags, current task, average token cost, 7-day success rate, edit button.

Detail view = the agent's full fiche (see §6) with an inline editor.

### 4.4 Skill Registry (route `/skills`)

Table of installed skills (auto-discovered from `.claude/skills/`). Columns: name, source, tags, agents that use it, relevance score per project, `auto-load? Y/N`, summary size, last used.

Click a skill row → drawer with summary + "promote to project-pinned" toggle.

### 4.5 Context & Token Manager (route `/tokens`)

Per-project gauges + per-mission breakdowns. Three mode pills (eco / standard / expert). Shows:

- Context loaded right now (token count + breakdown by source).
- What is cached vs cold (prompt-cache hit ratio).
- Summary chain depth (how many summaries between raw source and the LLM).
- Money spent today / week / month, with hard cap warning.

### 4.6 Timeline / Trace (route `/trace`)

Append-only event log. Each row: timestamp · agent · action · skill(s) used · files touched · tokens · cost · risk. Filter by mission, by agent, by file path. Export to JSON.

### 4.6b Ideas Inbox (route `/ideas`)

Rapid capture for raw ideas, global or project-scoped.

- **Kanban**: `Inbox → To clarify → Prioritized → Converted → Archived`.
- Each card: title, project tag (or "Global"), priority score, estimated effort, estimated token cost.
- **"Convert to mission" CTA**: one click creates a `missions` row in `draft` state, pre-filled from the idea body.
- Ideas visible in Command Center (count badge) and in `/projects/[slug]` (project-filtered).
- Ideas with no project tag are global.

### 4.6c Decision Log (embedded, not a separate route)

Stores important decisions — product, architecture, delegation, user override.

- Logged from: Command Center quick-add, mission detail page, validation modal (auto-log on approve/reject of a `blocking` task).
- Fields: title, body, scope (global / project), source (user / mission / validation / agent), date.
- Visible in: **Command Center** (last 5 global decisions widget) + `/projects/[slug]` dedicated section + `/missions/[id]` related decisions.
- Memory Keeper may propose a decision candidate via the same `proposeMemory` path (type = `decision`).

### 4.6d Planning & Deadlines (embedded in Mission Board + Command Center)

- `deadline` (optional date) and `milestone` (optional free-form label) fields on missions.
- Command Center: missions with deadline within 7 days → yellow badge; overdue → red badge.
- Per-project calendar widget in `/projects/[slug]`: timeline of upcoming deadlines and milestones.
- Alert (arithmetic, no LLM): if `deadline < today + estimated_remaining_days_at_current_burn_rate` → flag "deadline may be unrealistic given remaining budget".

### 4.6e Prioritization (route `/priorities`)

- Priority score (0–100) on missions and ideas. Computed from four user-set sliders: **Impact** (0–100), **Urgency** (0–100), **Effort** (0–100, inverted), **Risk** (0–100, inverted).
- Formula: `impact × 0.35 + urgency × 0.30 + (100 − effort) × 0.20 + (100 − risk) × 0.15`. Fully deterministic, no LLM.
- `/priorities`: board view sorted by score, filterable by project. Shows score breakdown on hover.
- **Top 3 priorities** card in Command Center replaces the static Recommendations placeholder.

### 4.6f Project Health (widget embedded in `/projects/[slug]` header)

Compact computed overview, no dedicated route:

```
missions: X done / Y total  ·  blocked: Z  ·  budget: N%  ·  next deadline: DD MMM  ·  open ideas: N  ·  pending validations: N
```

Computed at read time from existing DB rows. No separate table.

### 4.7 Memory Center (route `/memory`)

Two columns: **Global memory** · **Project memory**. Each item: title, type (`user` / `feedback` / `project` / `reference`), source mission, age, "still relevant?" voting. Separate **Inbox** of memory candidates proposed by agents but not yet accepted/rejected by the user.

### 4.8 Agent Studio (route `/studio`)

A "living workspace" view where the agency is visible at a glance. Two layouts, toggleable:

- **Orbit view** — concentric rings. Inner ring = Tier A orchestrators. Outer ring = Tier B library agents currently active. Edge animation when one delegates to another. Each node = the agent's avatar with a status ring.
- **Org-chart view** — hierarchical: Mission Planner at root, then Skill Router, then per-domain Tier A wrappers, then Tier B leaves. Helpful for understanding the routing topology of a specific mission.

Click any node → opens the agent's detail page (§4.9). Hover any node → tooltip with current task + last 3 events.

### 4.9 Agent detail page (route `/agents/[id]`)

The "employee profile" of an agent. Sections:

- **Header**: avatar, name, emoji, status, current task, current mission link.
- **Fiche**: rendered Markdown of the agent's fiche (read-only by default; "Edit fiche" CTA for Tier A only).
- **Recent activity**: paginated timeline scoped to this agent.
- **Metrics**: 7- and 30-day token cost, success rate, average tokens per task, mode distribution.
- **Chat / Timeline**: chronological transcript of this agent's messages on missions where it participated. Read-only at MVP.
- **Capabilities**: skills favorited + required, plus the Tier B agents it delegates to most.

### 4.10 Project detail page (route `/projects/[slug]`)

The project hub once a project is selected. Sections:

- **Header**: name, type, absolute path (with "Reveal in Finder"), stack tags, autonomy default, last mission age.
- **Mission board** — pre-filtered by this project (same component as `/missions`).
- **Active agents** — agents currently assigned to missions of this project.
- **Memory** — project-scoped Memory Center embed.
- **Context pack health** — token size, last indexed, file count, "Rebuild" CTA.
- **Settings** — autonomy default, mode default, monthly budget, permissions overrides.

## 5. Mission lifecycle (canonical FSM)

```
draft → clarified → planned → dispatched → executing → review → validated → archived
                                       ↘  blocked ↗
```

Transitions:

- `draft → clarified` — Mission Planner asks ≤ 3 clarifying questions, fills the mission card.
- `clarified → planned` — Planner emits a task DAG. Skill Router attaches skills + agents per task. Budget estimated.
- `planned → dispatched` — User clicks "Run" (or autopilot dispatches automatically if `risk ≤ low` AND budget within cap).
- `dispatched → executing` — Worker picks up tasks in topological order. Concurrency capped per project (1 at MVP).
- `executing → review` — All terminal tasks reach `done`. Code Reviewer + Security Reviewer (if needed) run automatically.
- `review → validated` — User approves OR autopilot auto-validates if reviewers are green AND no high-risk action ran.
- `validated → archived` — Outputs frozen, memory candidates surfaced to Memory Center inbox.

Any task can move to `blocked` and surfaces to the dashboard immediately.

## 6. Agent fiche schema

Each Tier A (orchestrator) agent has a YAML-front-matter Markdown file in `packages/agents/fiches/`. Each Tier B (library) agent already exists in `.claude/agents/`. See `AGENTS.md` for the full tiering doctrine.

Cockpit-relevant fields:

```yaml
id: skill-router
name: Skill Router
emoji: 🧭
avatar: packages/agents/avatars/skill-router.svg
status_visible: true            # appears on /studio network view
role: short
responsibilities: [bullet]
limits: [bullet]
favorite_skills: [id]
required_skills: [id]
permissions: { fs_write: scoped, shell: false, network: allowlist }
budget: { default_tokens: 2000, model: claude-haiku-4-5 }
quality_criteria: [bullet]
output_format: json | markdown | patch
common_mistakes: [bullet]
escalate_when: [bullet]
domains: [manga-app, bot, website, automation]
```

## 7. Skill routing policy (summary)

Three layers, expanded in `SKILLS_REGISTRY.md`:

1. **Pinned** — always loaded as a 1-line summary in every agent's system prompt.
2. **Project-pinned** — full summary (≤ 200 tokens) loaded when the matching project is active.
3. **On-demand** — full content loaded only when the Skill Router emits an explicit `requireSkill(<id>)`.

## 8. Data model (initial Drizzle schema)

```ts
projects(
  id, name, slug,
  path,                              -- absolute filesystem path, never copied into this repo
  type,                              -- free-form tag: "manga-app" | "bot" | "business-website" | "automation" | "other"
  stack_json,                        -- detected/declared stack tags ["next", "ts", "prisma", ...]
  autonomy,                          -- default level for this project
  default_model, default_mode,
  monthly_budget_cents,
  created_at, last_active_at
)
project_links(                       -- M:N links between projects + Tier A agents + Tier B agents + skills
  project_id, kind, ref_id,
  pinned, weight                     -- weight feeds the Skill Router's relevance score
)
missions(id, project_id, title, objective, status, risk, budget_tokens, spent_tokens, autonomy_override, mode_override,
         deadline date,              -- optional, for planning/calendar
         milestone text,             -- optional free-form label
         priority_score int,         -- 0-100, computed or user-set
         idea_id text,               -- FK to ideas.id if converted from an idea
         created_at, updated_at)
tasks(id, mission_id, parent_task_id, title, description, status, risk, agent_id, skills_json, depends_on_json, budget_tokens, spent_tokens, output_path, created_at, updated_at)
ideas(id, title, body, scope enum(global|project), project_id,
      status enum(inbox|to_clarify|prioritized|converted|archived),
      priority_score int,            -- 0-100
      impact int, urgency int, effort_est int,  -- 0-100 sliders
      cost_est_tokens int,           -- estimated LLM cost if converted to mission
      created_at, updated_at)
decisions(id, scope enum(global|project), project_id,
          source enum(user|mission|validation|agent),
          source_mission_id text, source_task_id text,
          title text, body text,
          created_at)
agents(id, tier, fiche_path, name, emoji, avatar_path, model, enabled, total_runs, total_tokens, success_rate)
skills(id, source, path, summary_path, tags_json, tier, auto_load, last_used_at)
events(id, mission_id, task_id, agent_id, type, payload_json, tokens_in, tokens_out, cache_read, cache_creation, cost_cents, risk, created_at)
memory_items(id, scope, project_id, type, title, body, source_mission_id, accepted, created_at)
memory_candidates(id, source_task_id, type, body, status, created_at)
validations(id, task_id, requested_by_agent, action_summary, status, decided_at, decided_by_user, payload_json)
budgets(id, scope, scope_id, period, tokens_cap, tokens_spent, money_cap_cents, money_spent_cents)
context_packs(id, project_id, version, path, generated_at, token_size, file_count)
permissions(id, category, action, risk, allow_list_json)   -- declarative risky-action registry (see CLAUDE.md §5)
```

Indices: `(mission_id, status)`, `(task_id, created_at)`, `(agent_id, created_at)`, `(scope, scope_id, period)`.

## 9. MVP scope (v0.1)

**In:**

- All cockpit routes wired with the full visual identity (§4.1) — light + dark themes, agent avatars, studio view, multi-level dashboards. Where backends are absent, the UI is populated with mocked fixtures so the product concept is immediately legible at first launch.
- External Projects Registry: register, edit, remove a project by absolute path; per-project autonomy + mode + budget.
- Mission lifecycle FSM under manual + assisted autonomy.
- 6 Tier A orchestrator agents wired end-to-end: Mission Planner, Skill Router, Context Manager, Memory Keeper, Code Reviewer, Security Reviewer.
- 8 Tier B library agents callable via the delegator: Software Architect, Frontend Developer, Backend Architect, UX Architect, UI Designer, Technical Writer, Performance Benchmarker, Reality Checker.
- Skill Registry auto-discovery + per-skill `summary.md` generation.
- Token meter (real cost per Claude SDK call) + per-mission budget enforcement.
- Caveman mode toggle for agent-to-agent prose.
- 1 seeded external project (the user's manga app, registered by path) with 1 demo mission ready to play.
- Trace timeline & Memory Center read-only at MVP.
- Generic `permissions` table + a minimal `config/permissions.json` (no hardcoded email/finance/trading actions).

**Out (deferred to Phase 4.5+):**

- Ideas Inbox, Decision Log, Planning/Deadlines, Prioritization board (Phase 4.5).
- Autonomous + autopilot levels (UI present, execution gated) (Phase 6).
- Bots / website / personal-automation project templates (Phase 7).
- Claude Code CLI integration (Phase 8).
- Tauri packaging (Phase 8).
- Memory candidate auto-acceptance (Phase 4+).
- Multi-project parallel execution (single concurrent mission at MVP) (Phase 8).
- Finance / trading agents (post-MVP).

## 10. Success criteria for MVP

- I can paste a mission ("redesign the manga feed empty-state with empty-state UX best practices") → Planner emits ≥ 3 tasks → dispatcher runs them → I get a Markdown brief + a unified diff in `output/` → tokens used < 30 k → no high-risk action ran unsupervised → ≥ 1 memory candidate proposed.
- Cockpit renders the full state of that mission from the DB after a hard refresh (zero in-memory-only state).
- Caveman mode reduces measured agent-to-agent prose tokens by ≥ 40 % on the same mission rerun.
- Prompt-cache hit rate ≥ 50 % across the run (see `TOKEN_STRATEGY.md §7`).

## 11. External Projects Registry

MultiAgentOS is a **hub**, not a workspace owner. Real projects stay on disk where they already live.

### 11.1 Registration

The "New project" wizard (`/projects/new`) collects:

| Field            | Source                            | Required |
|------------------|-----------------------------------|----------|
| Name             | user input                        | yes      |
| Slug             | derived from name, editable       | yes      |
| Absolute path    | filesystem picker                 | yes      |
| Type             | dropdown: manga-app, bot, business-website, automation, other | yes |
| Stack            | auto-detected (package.json, etc.) + editable chips | no |
| Autonomy default | `manual` (safe default)           | yes      |
| Mode default     | `eco`                             | yes      |
| Monthly budget   | € amount; default 5 €             | yes      |

The wizard's last step **dry-runs** the Context Manager: it scans the path, lists detected stack signals, estimates context-pack size, and tells the user how many tokens a first indexing would cost. The user can skip indexing and do it later.

### 11.2 Storage

External projects are stored in the `projects` table by `path` (absolute). MultiAgentOS never writes inside `projects.path` automatically; diffs are produced and shown for user-approved application. The MVP exposes a "Apply diff" button that uses `git apply` against the project's git tree if it has one, or copies a patch file into `data/patches/` otherwise.

### 11.3 Sync

There is no continuous file sync. The Context Manager rebuilds the context pack on demand or on a schedule (per `TOKEN_STRATEGY.md §4`). Detection of "source changed > N %" is based on a stored manifest of file mtimes + sizes, not full diffs.

### 11.4 Multi-project agents and skills

A project can pin Tier A agents, Tier B agents, and skills via the `project_links` table. The Skill Router uses these pins to weight its choices. A project never sees the agents/skills of another project unless explicitly cross-referenced from a mission.

### 11.5 Future: config file

Beyond MVP, a `projects.config.json` checked into the user's dotfiles could declaratively register projects across machines. Not in scope at MVP, but the SQLite schema is the source of truth and `projects.config.json` is just an export/import.

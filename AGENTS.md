# AGENTS — MultiAgentOS Roster

## 1. Two tiers

**Tier A — Orchestrator agents (new, MultiAgentOS-specific).**
Live in `packages/agents/fiches/`. They own the mission lifecycle, route work, and call Tier B. They never do specialized execution themselves.

**Tier B — Library agents (pre-installed).**
58 fiches already under `.claude/agents/` (agency-style + NEXUS doctrine). They do specialized execution. MultiAgentOS treats them as **callable functions**: a Tier A agent emits `delegate({ agent: "engineering-frontend-developer", task: {...} })`.

The dispatcher is the only path between tiers. **Tier B never calls Tier A.**

## 2. Canonical Tier A fiche schema

```yaml
---
id: skill-router
name: Skill Router
emoji: 🧭
avatar: packages/agents/avatars/skill-router.svg
status_visible: true                # surfaces in /studio network view
tier: A
role: "Decide which skills + which Tier B agents handle a given task."
domains: [all]
responsibilities:
  - Classify task type
  - Pick required + favorite skills
  - Select Tier B agent(s)
  - Estimate token budget
  - Justify selection in ≤3 lines
limits:
  - Never executes work itself
  - Never invents skills not in the registry
favorite_skills: [skill-creator, caveman]
required_skills: [using-superpowers]
permissions:
  fs_write: false
  shell: false
  network: false
budget:
  default_tokens: 1500
  model: claude-haiku-4-5
quality_criteria:
  - Justification cites concrete signal from the task text
  - Budget estimate within ±25% of real cost on rerun
output_format: json
common_mistakes:
  - Loading skills "just in case"
  - Picking 5+ agents for a 1-file change
escalate_when:
  - No agent matches with confidence ≥0.6
  - Task contains words like "trading", "payment", "send email", "deploy"
---

Body in Markdown: full responsibilities, examples of good vs bad output,
JSON schema of the expected response, common failure modes with fixes.
```

## 3. Tier A roster — MVP (6 agents)

| ID                | Name                | Role                                                        | Model         | Default budget |
|-------------------|---------------------|-------------------------------------------------------------|---------------|----------------|
| `mission-planner` | Mission Planner 🗺️ | NL mission → clarifying Qs → task DAG                       | sonnet-4-6    | 4000           |
| `skill-router`    | Skill Router 🧭     | Pick skills + Tier B agents + budget per task               | haiku-4-5     | 1500           |
| `context-manager` | Context Manager 🧠  | Build/maintain per-project context packs and summaries      | haiku-4-5     | 2000           |
| `memory-keeper`   | Memory Keeper 📚    | Promote memory candidates; write to memory store            | haiku-4-5     | 1500           |
| `reviewer`        | Code Reviewer 🔍    | Diff + artifact review before `review → validated`          | sonnet-4-6    | 3000           |
| `sec-reviewer`    | Security Reviewer 🛡️ | Risk gate; mandatory before any `high` or `blocking` action | sonnet-4-6    | 3000           |

## 4. Tier A roster — Phase 2 (8 more)

| ID                    | Name                 | Role                                                  |
|-----------------------|----------------------|-------------------------------------------------------|
| `project-manager`     | Project Manager 📋   | Cross-mission planning, batching, deadlines           |
| `architect`           | Architect 🏛️         | Domain modelling, ADR authoring                       |
| `frontend-builder`    | Frontend Builder 🎨  | Wraps Tier B frontend agents; produces diffs          |
| `backend-builder`     | Backend Builder 🛠️   | Wraps Tier B backend agents                           |
| `ux-critic`           | UX/UI Critic ✨      | Pre-merge UX gate                                     |
| `researcher`          | Researcher 🔭        | External research, link curation, source ranking      |
| `automation-designer` | Automation Designer ⚙️ | Pipelines, cron/autopilot specs                       |
| `docs-writer`         | Docs Writer 📝       | README, ADRs, runbooks, technical writeups            |

## 5. Tier A roster — Project-specialized (later, on demand)

Thin wrappers that pre-bind a Tier A behaviour to a project type:

- Manga App Lead
- Community / Gamification Agent
- WhatsApp / Telegram Bot Agent
- Business Website Audit Agent
- Agency Client Delivery Agent
- Media / Social Content Agent
- Email Automation Agent
- AI News Analyst
- Finance Portfolio Analyst (later)
- Trading Bot Safety Reviewer (later, mandatory gate on any trading task)

Each one preselects: relevant Tier B agents, project-scoped skills, memory scope, and a default risk floor.

## 6. Tier B delegation map — MVP slice

The 8 Tier B agents wired in MVP and who calls them:

| Tier B fiche (`.claude/agents/`)        | Called by                  | Use case                                     |
|-----------------------------------------|----------------------------|----------------------------------------------|
| `engineering-software-architect`        | Mission Planner, Architect | ADRs, system design                          |
| `engineering-frontend-developer`        | Frontend Builder           | UI changes, components                       |
| `engineering-backend-architect`         | Backend Builder            | API design, data flow                        |
| `design-ux-architect`                   | UX/UI Critic               | UX flow design                               |
| `design-ui-designer`                    | Frontend Builder, UX Critic| Visual polish, component libraries           |
| `engineering-technical-writer`          | Docs Writer                | README, ADRs, user-facing docs               |
| `testing-performance-benchmarker`       | Reviewer                   | Perf gates before validation                 |
| `testing-reality-checker`               | Reviewer, Sec Reviewer     | Default-to-needs-work gate before archive    |

## 7. Files to create at MVP

```
packages/agents/
├── fiches/
│   ├── mission-planner.md
│   ├── skill-router.md
│   ├── context-manager.md
│   ├── memory-keeper.md
│   ├── reviewer.md
│   └── sec-reviewer.md
├── avatars/                # stylized SVG avatars per Tier A agent
│   ├── mission-planner.svg
│   ├── skill-router.svg
│   ├── context-manager.svg
│   ├── memory-keeper.svg
│   ├── reviewer.svg
│   └── sec-reviewer.svg
├── registry.ts             # auto-loads Tier A fiches + indexes Tier B fiches
├── dispatch.ts             # delegate() + risk gate + budget enforcement
└── prompts/
    ├── tier-a-system.md    # shared system preface
    └── tier-b-system.md    # shared system preface for delegated calls
```

Tier B agents inherit a default avatar derived from their domain prefix (`engineering-*` → cog, `design-*` → palette, etc.); they can be overridden later by dropping an SVG in `packages/agents/avatars/library/<id>.svg`.

## 8. Agent runtime contract

Every Tier A agent receives a `MissionContext`:

```ts
type MissionContext = {
  mission: { id; title; objective; autonomy; risk; budgetRemaining };
  project: { id; slug; contextPackPath; memorySummary };
  task: Task;
  prior: Event[];                 // last N events for this mission
  skills: SkillRef[];             // hydrated by Skill Router
  tools: {
    delegate(to: string, subtask: Task): Promise<TaskResult>;
    proposeMemory(item: MemoryCandidate): void;
    requestValidation(action: string, risk: 'high' | 'blocking'): Promise<boolean>;
    requireSkill(id: string): Promise<void>; // forces hydration
  };
};
```

It returns a `TaskResult`:

```ts
type TaskResult =
  | { kind: 'done';            outputs: Artifact[]; memoryCandidates: MemoryCandidate[] }
  | { kind: 'blocked';         reason: string; suggested_next: string }
  | { kind: 'needsValidation'; action: string; risk: 'high' | 'blocking' }
  | { kind: 'delegate';        to: string; subtask: Task };
```

## 9. Output discipline

- Tier A internal reasoning passed agent-to-agent: **Caveman style when mode = eco** (see `TOKEN_STRATEGY.md §6`).
- Final artifacts for the user: **normal style**.
- Diffs: unified patch format applied via `git apply --check` before being accepted.
- Reports: Markdown with H2 sections; first paragraph is a 2-line TL;DR.

## 10. Authoring rule

When creating a new Tier A fiche, copy the schema in §2 verbatim and fill every key. Empty keys are not allowed. A Tier A fiche without `escalate_when` clauses will be rejected by `registry.ts`.

## 11. Forbidden patterns

- A Tier A agent calling another Tier A agent directly (route through the dispatcher).
- A Tier B agent reading/writing files outside its sandbox path (enforced in `dispatch.ts`).
- An agent loading a skill body it did not declare in `required_skills` or hydrate via `requireSkill()`.
- An agent writing to `data/memory/` directly — only Memory Keeper holds that pen.

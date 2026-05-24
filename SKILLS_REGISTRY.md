# Skills Registry — MultiAgentOS

## 0. Build-time pinned skills (during MultiAgentOS construction itself)

When **building MultiAgentOS** (i.e. Claude Code working in this repo on the cockpit code), these skills are always loaded by the build agent, regardless of the runtime project context defined below. They make the visual + product result match the standard set in `PRODUCT_SPEC.md §4.1`:

- `ui-ux-pro-max` — every UI task, every page, every component.
- `frontend-design` — component patterns, layout, hierarchy, density.
- `theme-factory` — light/dark token system, color palettes, typography pairs.
- `webapp-testing` — verification before claiming a route works (acts as the Phase 0 exit-criteria proof).
- `superpowers:writing-plans` — before writing code for a new phase.
- `superpowers:test-driven-development` — for new domain logic in `packages/core` and `packages/db`.
- `superpowers:verification-before-completion` — before marking any phase exit-criteria met.
- `caveman` — internal agent-to-agent prose only (eco mode).

These are **not** the same as the runtime tiering below — the runtime tiers apply to MultiAgentOS's own agents when they execute against the user's external projects.

## A. Plugin-managed skills (not vendored in this repo)

Three skill directories under `.claude/skills/` are **plugin-managed git repositories** that are NOT tracked in this repo. They live in `.gitignore` because tracking them as gitlinks would break `git push` without a `.gitmodules` file, and vendoring their contents would bloat the repo and create update drift.

| Skill                          | Upstream                                                   | Reinstall command (Claude Code) |
|--------------------------------|------------------------------------------------------------|---------------------------------|
| `.claude/skills/superpowers`   | https://github.com/obra/superpowers                        | install from the `superpowers-dev` plugin (obra/superpowers) |
| `.claude/skills/caveman`       | https://github.com/JuliusBrussee/caveman                   | install from the `caveman` plugin (JuliusBrussee/caveman)    |
| `.claude/skills/ui-ux-pro-max` | https://github.com/nextlevelbuilder/ui-ux-pro-max-skill    | install from the `ui-ux-pro-max-skill` plugin                |

After cloning the MultiAgentOS repo on a fresh machine, install the three plugins via the Claude Code marketplace (`/plugin`) — they will repopulate those folders. Everything else under `.claude/skills/` is vendored as plain files and committed normally.

## 1. Source of truth

The runtime auto-discovers skills from `.claude/skills/*` (and nested `superpowers/skills/*`) at boot. This file is the **policy layer**: when each skill loads, who uses it, and how its short summary is produced.

## 2. Skill tiers

| Tier              | Load behaviour                                                                | Examples                                                            |
|-------------------|-------------------------------------------------------------------------------|---------------------------------------------------------------------|
| **Pinned**        | 1-line summary always present in every agent system prompt.                   | `using-superpowers`, `security-review`, in-house `skill-router` policy |
| **Project-pinned**| Full summary (≤ 200 tokens) loaded when a matching project is active.         | `frontend-design`, `ui-ux-pro-max`, `webapp-testing`, `mcp-builder` |
| **On-demand**     | Full content loaded only when the Skill Router emits `requireSkill(id)`.      | `algorithmic-art`, `canvas-design`, `slack-gif-creator`, `pdf`, `pptx`, `docx`, `xlsx` |
| **Methodology**   | Loaded by the orchestrator when the corresponding lifecycle phase begins.     | `brainstorming`, `writing-plans`, `executing-plans`, `test-driven-development`, `verification-before-completion`, `systematic-debugging` |

## 3. Installed skills × default tier

| Skill                                            | Default tier                                | Triggers                                            |
|--------------------------------------------------|---------------------------------------------|-----------------------------------------------------|
| `caveman`                                        | Pinned (active only when `mode = eco`)      | mode toggle                                         |
| `claude-api`                                     | Project-pinned (bots, automations)          | files import `@anthropic-ai/sdk`                    |
| `frontend-design`                                | Project-pinned (manga, website)             | tasks tagged `ui`                                   |
| `ui-ux-pro-max`                                  | Project-pinned (manga, website)             | tasks tagged `ux`                                   |
| `webapp-testing`                                 | Project-pinned (website, manga)             | tasks tagged `e2e`                                  |
| `mcp-builder`                                    | Project-pinned (bots, automations)          | tasks tagged `mcp`                                  |
| `theme-factory`                                  | On-demand                                   | "theme", "palette", "style"                         |
| `brand-guidelines`                               | On-demand                                   | "brand", "logo", "guidelines"                       |
| `canvas-design`                                  | On-demand                                   | "poster", "static art"                              |
| `algorithmic-art`                                | On-demand                                   | "generative", "p5", "flow field"                    |
| `slack-gif-creator`                              | On-demand                                   | "gif", "slack"                                      |
| `pdf` / `docx` / `pptx` / `xlsx`                 | On-demand                                   | file extension or "spreadsheet/deck/word/pdf"       |
| `internal-comms`                                 | On-demand                                   | "status update", "newsletter", "incident report"    |
| `doc-coauthoring`                                | On-demand                                   | "write doc", "spec", "decision"                     |
| `skill-creator`                                  | On-demand                                   | only the Skill Router calls it                      |
| `web-artifacts-builder`                          | On-demand                                   | multi-component HTML artifact (not repo changes)    |
| `superpowers:using-superpowers`                  | Pinned                                      | always                                              |
| `superpowers:brainstorming`                      | Methodology                                 | new feature / creative scope                        |
| `superpowers:writing-plans`                      | Methodology                                 | `clarified → planned`                               |
| `superpowers:executing-plans`                    | Methodology                                 | `dispatched`                                        |
| `superpowers:test-driven-development`            | Methodology                                 | code tasks                                          |
| `superpowers:systematic-debugging`               | Methodology                                 | task `blocked`                                      |
| `superpowers:verification-before-completion`     | Methodology                                 | `review → validated`                                |
| `superpowers:requesting-code-review`             | Methodology                                 | feature complete                                    |
| `superpowers:receiving-code-review`              | Methodology                                 | review comments inbound                             |
| `superpowers:dispatching-parallel-agents`        | Methodology                                 | Planner detects ≥ 2 independent tasks               |
| `superpowers:subagent-driven-development`        | Methodology                                 | parallel tracks                                     |
| `superpowers:finishing-a-development-branch`     | Methodology                                 | mission Done → archive                              |
| `superpowers:using-git-worktrees`                | Methodology                                 | risky long missions needing isolation               |
| `superpowers:writing-skills`                     | On-demand                                   | "create a new skill"                                |

## 4. Auto-summary protocol

For every skill in `.claude/skills/`:

1. On first boot, the Skill Router invokes `skill-creator` to produce a `summary.md` (≤ 200 tokens) and a tag set under `data/skill-cache/<id>/`.
2. `summary.md` includes: 1-line purpose · trigger keywords · 3 micro-examples · "load full body when …" guidance.
3. Agents always reference summaries unless the Skill Router explicitly hydrates the full body for the current task.
4. Regenerate the summary only when the source `SKILL.md` mtime changes.

## 5. Skill Router policy

**Input:** `{ taskText, projectDomain, autonomy, modeRequested }`.
**Output:**

```ts
{
  requiredSkills: string[];
  favoriteSkills: string[];
  tierBAgents: string[];
  budgetEstimate: { tokens: number; model: 'haiku-4-5' | 'sonnet-4-6' | 'opus-4-7' };
  rationale: string;           // ≤ 3 lines
  requires_validation: boolean;
}
```

**Rules:**

- Always include the methodology skill matching the current lifecycle phase.
- Prefer 1 favorite skill per task. Two needs a one-line justification. Three is rejected.
- Domain detector maps keywords:
  - `manga | feed | community | gamification | follow | reaction → manga-app`
  - `whatsapp | telegram | bot | webhook | command → bot`
  - `audit | landing | refonte | seo | client | brand → business-website`
  - `email | digest | news | finance | trading | portfolio → personal-automation`
- If `taskText` contains any of `["email", "send", "trade", "buy", "sell", "push", "force", "delete", "secret"]` → set `requires_validation: true` and inject `security-review`.
- If `modeRequested = eco`, the Router prefers haiku-4-5 and shorter rationale (Caveman style).

## 6. Adding a skill

1. Drop the skill folder under `.claude/skills/`.
2. Run `pnpm skills:reindex` (Skill Router rescans, regenerates summary).
3. Optionally promote it to Pinned or Project-pinned in `config/skills.policy.json` or via `/skills` UI.

## 7. Forbidden combinations

- `caveman` MUST NOT be active for: code generation, commit messages, PR descriptions, ADRs, user-facing UI copy, error messages, validation modal text. Caveman is **agent-to-agent prose only**.
- `web-artifacts-builder` MUST NOT be active for missions whose deliverable is a repo change — only for standalone HTML artifacts.
- `pptx` / `docx` / `xlsx` / `pdf` MUST be on-demand only — never auto-load; they carry large body content.
- `algorithmic-art` and `canvas-design` MUST NOT auto-load — only when the mission deliverable is explicitly an image/art file.

## 8. Where the policy lives in code

```
config/skills.policy.json     # declarative tiering + project bindings
packages/skills/registry.ts   # discovery, indexing, summary IO
packages/skills/router.ts     # Skill Router prompt + JSON schema
packages/skills/cache.ts      # data/skill-cache/* IO
```

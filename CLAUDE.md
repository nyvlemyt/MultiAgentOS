# MultiAgentOS — Claude Operating Context

This file is loaded automatically by Claude Code at the root of this repo. It is the **single source of truth** for how Claude (and any subagent) must behave when working on MultiAgentOS.

## 1. What this project is

MultiAgentOS is a **local-first multi-agent command center** for a single power user (the repo owner). It is *not* a chat UI. It is a **Mission Control** that:

- ingests a natural-language mission for a chosen project,
- decomposes it into a smart to-do list,
- dispatches tasks to specialized agents,
- routes the right skills to each task,
- tracks token cost, risk, and human-validation gates,
- maintains long-term memory per project + global preferences,
- supports manual / assisted / autonomous / autopilot autonomy modes,
- **registers external projects by absolute path — it never copies, moves, or clones your code into the MultiAgentOS repo.** Selecting a project in MultiAgentOS should feel equivalent to opening that project in VS Code with Claude Code, but driven from this centralized cockpit.

The product surface and detailed scope live in `PRODUCT_SPEC.md`. The agent roster is in `AGENTS.md`. The build plan is in `ROADMAP.md`. Skill policy is in `SKILLS_REGISTRY.md`. Budget policy is in `TOKEN_STRATEGY.md`.

## 2. Stack (locked for MVP)

- **Frontend**: Next.js 15 (App Router) + TypeScript + Tailwind + shadcn/ui
- **Orchestrator worker**: separate Node process (`apps/worker`) using `tsx`, communicating with Next.js via the SQLite job table + an SSE channel
- **DB**: SQLite via Drizzle ORM (file: `data/mas.db`)
- **AI**: `@anthropic-ai/sdk` (later: Claude Agent SDK and/or headless `claude` CLI for shell-heavy missions)
- **Packaging (later)**: Tauri desktop wrapper
- Node ≥ 20, pnpm workspaces (`apps/web`, `apps/worker`, `packages/*`)

Do not introduce frameworks outside this list without an ADR in `docs/decisions/`.

## 3. Repository layout (planned)

```
multiAgentOS/
├── apps/
│   ├── web/                 # Next.js cockpit UI
│   └── worker/              # Node orchestrator daemon
├── packages/
│   ├── core/                # Mission/Agent/Skill domain logic + LLM wrapper
│   ├── db/                  # Drizzle schema + migrations
│   ├── agents/              # Tier A fiches + dispatcher
│   ├── skills/              # Skill router + summaries
│   ├── memory/              # Memory store + summarizer
│   └── tokens/              # Budget + cost meter
├── .claude/                 # Existing — see AGENTS.md, SKILLS_REGISTRY.md
├── data/                    # SQLite + caches (gitignored)
├── docs/
│   ├── decisions/           # ADRs
│   └── workflows/           # Operational runbooks
├── CLAUDE.md
├── AGENTS.md
├── PRODUCT_SPEC.md
├── ROADMAP.md
├── SKILLS_REGISTRY.md
└── TOKEN_STRATEGY.md
```

## 4. Autonomy levels (enforce in code)

| Level        | What Claude / agents may do automatically                                    |
|--------------|------------------------------------------------------------------------------|
| `manual`     | Read + propose only. Every write/exec waits for user click.                  |
| `assisted`   | Internal edits inside `apps/` allowed. Shell, git, external APIs → confirm.  |
| `autonomous` | Anything inside the project sandbox. Risky actions still gated (§5).         |
| `autopilot`  | Long, non-risky batches (summaries, indexing, research). Report on resume.   |

The runtime persists the level **per project** AND per session. The cockpit must show it permanently in the topbar.

## 5. Risky actions — always gated

These ALWAYS require a human click, regardless of autonomy level:

- `rm`, `git reset --hard`, `git push --force`, branch deletion
- Any write to `.env*`, secrets files, keystores
- Any write to a path outside the currently active project's `path` (cross-project leakage)
- Any action whose category is marked `risk: high | blocking` in `config/permissions.json` (sending messages, payments, outbound network sends, etc.)
- Network calls to hosts not in `config/permissions.json#allowed_hosts`
- Shell commands containing `curl | sh`, `eval`, `sudo`

The dispatcher tags each task with a `risk` enum (`low` / `medium` / `high` / `blocking`). `high` and `blocking` always pause for human validation, even in autopilot.

`config/permissions.json` ships with a minimal schema and an empty allowlist. It is the **single extension point** for declaring new risky-action categories (used later when domain agents like email or finance are introduced — they will register their actions here, not hardcode them).

## 6. Token discipline (every agent must obey)

See `TOKEN_STRATEGY.md` for the full policy. Summary:

- Never inject a full skill body when `data/skill-cache/<id>/summary.md` exists — load the summary, expand only on need.
- Never reload a project's source tree if `data/context-packs/<projectId>.md` exists and is < 24 h old.
- Each mission has a hard token budget. Going over → pause + ask.
- Mode `eco` activates the Caveman style for internal agent-to-agent prose ONLY (never for code, commits, ADRs, or user-facing UI copy).

## 7. Conventions

- **Commits**: Conventional Commits. Subject ≤ 60 chars.
- **Tests**: Vitest. TDD per `superpowers:test-driven-development` for new domain logic.
- **Comments**: write none unless the WHY is non-obvious.
- **No new top-level files** without updating §3.
- **No silent destructive ops** — see §5.

## 8. Memory

Per-project memory lives in `data/memory/<projectId>/`. Global memory in `data/memory/_global/`. The Memory Keeper agent is the only one allowed to write to those folders. Other agents propose memory candidates via the `MemoryProposal` task type and they land in the Memory Center inbox.

Note: **all MultiAgentOS state lives inside this repo's `data/` folder.** The external project at `projects.path` is read-only-by-default from MultiAgentOS's perspective; agents may produce diffs against it, but the source tree itself is the user's responsibility.

## 9. When in doubt

1. Re-read `PRODUCT_SPEC.md` §5 "Mission lifecycle".
2. Check `AGENTS.md` for the right agent.
3. Check `SKILLS_REGISTRY.md` for the right skill.
4. If still unclear → ask the user. Never invent product behavior.

## 10. Building MultiAgentOS itself

When building features of MultiAgentOS, follow `ROADMAP.md` phase by phase. Do not start phase N+1 without explicit user green light at the phase-N exit criteria. The "Future Build Prompt" at the end of `ROADMAP.md` is the canonical kick-off for each phase.

## 11. Billing isolation (CRITICAL — Claude Code vs Anthropic API)

Claude Code CLI has **two billing modes**. Mixing them silently causes unexpected charges.

| Mode | Trigger | Cost |
|------|---------|------|
| Subscription (Pro/Max) | `claude login` auth, no API key in env | Fixed monthly |
| API PAYG | `ANTHROPIC_API_KEY` present in shell env | Per token, ~$3/$15 per 1M |

**Rules — enforce always, never override:**

1. `ANTHROPIC_API_KEY` must **never** be exported in global shell config (`~/.zshrc`, `~/.bashrc`, `~/.zshenv`, `~/.profile`). Verify: `echo $ANTHROPIC_API_KEY` in a fresh terminal must be empty.
2. The key must only be injected per-process: via `.env` loaded by the app (`dotenv`/`tsx --env-file`), never `source`d globally.
3. Claude Code authenticates exclusively via `claude login` (subscription). If it prompts for an API key, something is wrong — investigate before entering one.
4. `.env` files are gitignored and must stay that way. Never commit a file containing `ANTHROPIC_API_KEY`.
5. Any agent or script that needs to call the Anthropic API must receive the key via the app's runtime environment, not from the shell.

**In MultiAgentOS code:** the `packages/core/llm.ts` LLM wrapper is the single injection point. It reads `process.env.ANTHROPIC_API_KEY` at call time. No other file may read this variable directly.

**Guard against runaway cost:** the `budgets` table + `TOKEN_STRATEGY.md §8` define hard caps. The worker must check the active budget row before every LLM call and return `budget_exceeded` without calling the API if the cap is reached.

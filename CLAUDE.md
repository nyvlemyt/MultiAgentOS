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
- **AI**: `@anthropic-ai/claude-agent-sdk` (primary — drives Claude Code engine via subscription); headless `claude --print` (fallback for shell-heavy missions and risk-gated `manual` autonomy tasks only)
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
│   ├── agents/              # Tier A fiches + dispatcher; agents/library/ = cold Tier B arsenal (ECC, ADR 0005)
│   ├── skills/              # Skill router + summaries; skills/library/ + index.json = cold skill arsenal (ECC, ADR 0005)
│   ├── memory/              # Memory store + summarizer
│   └── tokens/              # Budget + cost meter
├── .claude/                 # Existing — see AGENTS.md, SKILLS_REGISTRY.md
├── data/                    # SQLite + caches (gitignored)
├── docs/
│   ├── decisions/           # ADRs
│   ├── rules/               # Per-language coding-standard arsenal (ECC harvest) — see §7
│   └── workflows/           # Operational runbooks
├── CLAUDE.md
├── AGENTS.md
├── PRODUCT_SPEC.md
├── ROADMAP.md
├── SKILLS_REGISTRY.md
└── TOKEN_STRATEGY.md
```

> `packages/{skills,agents}/library/index.json` are **generated** (regen via `pnpm --filter @mas/skills build-library-index`) and **gitignored** — not committed, since their summary prose trips SonarCloud S7164 secret false positives and they are build artifacts.

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
- **Coding standards arsenal**: per-language standards live in `docs/rules/<lang>/<concern>.md` (ECC harvest). For our active stack (TS/React/Next/web) these are **active rules**, not just reference — the non-obvious ones:
  - `unknown` (never `any`) for untrusted input (LLM output, SSE frames, request bodies); narrow at trust boundaries with Zod `safeParse`, derive the type via `z.infer` (schema = single source).
  - Prefer literal unions over `enum` (clean SQLite/Drizzle column + SSE round-trip).
  - No bare `console.log` in committed code — use the project logger.
  - Server Component by default; `"use client"` only for state/effects/handlers; mark sensitive modules `import 'server-only'`; never re-export server-only through a client module (the bundler ships it silently).
  - Provider/`ANTHROPIC_API_KEY` keys never `NEXT_PUBLIC_*` or client-side (reinforces §11).
  - `useEffect` = external synchronization only (not derived state); do **not** memoize by default (profile first).
  - **Research-&-Reuse FIRST** — before writing new code, check existing repos/registries/our library (generalizes §9.bis Voie 2 to all code).
  - **Anti-template = UI done-criteria**: a delivered frontend surface must show ≥4 intentional qualities (hierarchy, rhythm, depth, designed hover/focus states), never raw Tailwind/shadcn default.
  - Binary review thresholds: fn < 50 lines · file < 800 · nesting ≤ 4 · coverage ≥ 80 %.
  - Do **not** adopt ECC's "attribution disabled" git rule — it contradicts our mandatory `Co-Authored-By` (§ commit footer).
- **Verification = 5 checks, not 4.** A phase/PR is done only when `pnpm -r test` · `pnpm lint` · `pnpm build` · `pnpm --filter @mas/web smoke` **and** SonarCloud are all clean. Sonar clean means `scripts/sonar-pr-issues.sh <pr>` exits 0 — **zero open issues and zero to-review hotspots**, not merely a green gate (the gate ignores MINOR/MAJOR smells). After `git push`, poll until the analysis of your HEAD sha lands, run the script, and fix everything it lists. Recurring rules + canonical fixes: `docs/knowledge/sonar-recurring-rules.md` — read it before writing UI/test code to avoid the round-trips.

## 8. Memory

Per-project memory lives in `data/memory/<projectId>/`. Global memory in `data/memory/_global/`. The Memory Keeper agent is the only one allowed to write to those folders. Other agents propose memory candidates via the `MemoryProposal` task type and they land in the Memory Center inbox.

Note: **all MultiAgentOS state lives inside this repo's `data/` folder.** The external project at `projects.path` is read-only-by-default from MultiAgentOS's perspective; agents may produce diffs against it, but the source tree itself is the user's responsibility.

## 9. When in doubt

1. Re-read `PRODUCT_SPEC.md` §5 "Mission lifecycle".
2. Check `AGENTS.md` for the right agent.
3. Check `SKILLS_REGISTRY.md` for the right skill.
4. If still unclear → ask the user. Never invent product behavior.

## 9.bis. Inspiration Voie 2 (permanent design principle)

Whenever the Claude Agent SDK docs are vague — session resume, file-context injection, tool gating, streaming back-pressure, image attachments, stop reasons, error recovery, rate-limit signalling — the first reflex is *"how do the open-source webuis do it?"*

Reference repos (in priority order):

- **[siteboon/claudecodeui](https://github.com/siteboon/claudecodeui)** — primary reference (project picker, session list, file tree, terminal, mobile UX).
- **[sugyan/claude-code-webui](https://github.com/sugyan/claude-code-webui)** — minimalist; best for reading the streaming-chat layer alone.
- **[winfunc/opcode](https://github.com/winfunc/opcode)** — Tauri desktop; reference for Phase 8 packaging.
- **[KyleAMathews/claude-code-ui](https://github.com/KyleAMathews/claude-code-ui)** — session tracker; reference for `/trace`.

**Workflow:** before writing a new piece of bridge code, clone the relevant reference, grep for the equivalent feature, and port the **pattern** (not the code). Cite the source file in a leading code comment: `// pattern from siteboon/claudecodeui src/lib/claude.ts:142`.

**Why this matters:** the Agent SDK is young; the open-source webuis already absorbed the rough edges (Windows quoting, session-id format, partial JSON streams, rate-limit signalling). Do not reinvent those.

See `docs/decisions/0001-claude-code-engine-over-api-sdk.md` §Decision clause 6 for the full rationale.

## 10. Building MultiAgentOS itself

When building features of MultiAgentOS, follow `ROADMAP.md` phase by phase. Do not start phase N+1 without explicit user green light at the phase-N exit criteria. The "Future Build Prompt" at the end of `ROADMAP.md` is the canonical kick-off for each phase.

## 11. Billing isolation (CRITICAL)

MultiAgentOS has **one** billing mode: the Claude Code subscription (Pro/Max). PAYG via API key is a **forbidden** mode.

| Mode | Trigger | Billing |
|------|---------|---------|
| **Subscription** *(only legal mode)* | `claude login` + `@anthropic-ai/claude-agent-sdk` | Fixed monthly |
| ~~API PAYG~~ *(forbidden)* | `@anthropic-ai/sdk` + `ANTHROPIC_API_KEY` | Per token — facture salée |

**Rules — enforce always, never override:**

1. **No runtime code may `import` from `@anthropic-ai/sdk`** in `apps/` or `packages/*/src/`. The only legal location is an opt-in `packages/core/src/api-fallback/` behind an explicit config flag. Enforcement: **CI lint guard active** — `scripts/lint-no-sdk-payg.sh`, wired into `pnpm lint` (matches any import form: quotes, dynamic `import()`, `require`, subpaths).
2. `ANTHROPIC_API_KEY` presence at worker init triggers a **warning log + refusal to start**. The key is treated as a smell, not a feature.
3. `ANTHROPIC_API_KEY` must never be exported in global shell config (`~/.zshrc`, `~/.bashrc`, `~/.zshenv`, `~/.profile`). Verify: `echo $ANTHROPIC_API_KEY` in a fresh terminal must be empty.
4. Claude Code authenticates exclusively via `claude login`. If it prompts for an API key, something is wrong — investigate before entering one.
5. `.env` files are gitignored and must stay that way. Never commit a file containing `ANTHROPIC_API_KEY`.

**In MultiAgentOS code:** `packages/core/src/llm.ts` is the single LLM injection point. It drives the Claude Code engine via `@anthropic-ai/claude-agent-sdk`. No other file may instantiate an LLM client.

**§11.bis — Non-Anthropic providers (Phase 3.5, ADR 0002):** provider SDKs (`openai`, `@google/generative-ai`, Perplexity via OpenAI-compatible endpoint) are allowed **only** under `packages/core/src/providers/`, resolved exclusively by the `RouterLLMClient`, configured via `config/model-routing.json`. Rules:
1. The Anthropic-PAYG ban above is **unchanged** — `@anthropic-ai/sdk` stays forbidden everywhere.
2. Paid third-party APIs (OpenAI, Perplexity) ship **opt-in, default OFF** (`paid_apis_enabled: false`). Default-enabled sources: pooled Claude accounts (per-account `CLAUDE_CONFIG_DIR`) + Gemini free tier.
3. Provider keys live in `.env.local` (gitignored); a missing key disables that provider with a startup warning, never a crash.
4. Execution tasks (file I/O, bash, git) are **Claude-only**; non-Claude providers do cognition, grounded by explicit memory/context-pack injection.
5. The lint guard confines provider SDK imports to `packages/core/src/providers/`.

**Guard against runaway quota:** the `budgets` table + `TOKEN_STRATEGY.md §8` define hard window caps. The worker checks the active budget row before every LLM call and returns `budget_exceeded` if the cap is reached.

**⚠️ Billing change effective 2026-06-15:** Agent SDK usage on subscription plans consumes a **separate** monthly credit from Claude.ai conversations. The `budgets` table must track Agent SDK quota independently from interactive Claude.ai usage. Agents consume ~4× quota vs normal chat; multi-agent research missions ~15×. Source: `docs/knowledge/anthropic-ecosystem.md`.

## 12. Knowledge Base — mandatory consultation rules

`docs/knowledge/` contains curated research on agents, prompting, memory, and production patterns. **Ignoring it produces mediocre work.** These rules are non-negotiable:

### Before creating or modifying any SKILL.md file
1. Read `docs/knowledge/prompting-anthropic.md` — apply XML tags, chain-of-thought, effort mapping
2. Read `docs/knowledge/skills-reference.md` — use the lifecycle structure (Overview → When to Use → Process → Rationalizations → Red Flags → Verification Criteria)
3. Read the relevant domain file (`agent-patterns.md`, `memory-patterns.md`, `production-patterns.md`, or `project-doctrine.md`)
4. SKILL.md body must include: Principles section (citing source), Process (numbered steps), Rationalizations Table, Red Flags, Verification Criteria (binary pass/fail)
5. `summary:` field (L1, ≤200 tokens) = one-paragraph précis for prompt injection. Body (L2) = full operational guide.

### Before creating or modifying any agent fiche
1. Check `AGENTS.md` for the correct tier, domain, and responsibility
2. Read `docs/knowledge/agent-patterns.md` for the relevant patterns
3. Apply ≤7 tools per agent rule (MLOps Community research)

### Before implementing a memory feature
1. Read `docs/knowledge/memory-patterns.md` — use the 5-register architecture from `project-doctrine.md`
2. Apply signal-density test to every piece of context injected
3. Never inject more than 5 global memory items per mission

### Red flag phrases — stop and consult docs/knowledge/ if you think any of these
- "The skill is just instructions, it doesn't need much content" → wrong, see §12.1
- "I'll keep the summary short for now" → summary=L1 brief, body=L2 rich — both required
- "I don't need to look at the knowledge base for this" → always do

## 13. Learning bootstrap — pre-flight, intake-audit & persistence (mandatory)

The tool that builds great projects must itself be built with the best knowledge — learned *before* each phase, never last. Full doctrine: `docs/workflows/knowledge-bootstrap.md`.

### Before building any ROADMAP phase N
1. **Pre-flight** — run a targeted intake-audit of the resources relevant to phase N (`docs/ressources/`, `docs/knowledge/`), method in `docs/workflows/intake-audit-template.md`. Scope to the phase, not the whole batch.
2. **Distill** the kept items into the existing `docs/knowledge/` files (and CLAUDE.md / skills only if it becomes a rule).
3. **Then** build. Resources are a per-phase input, not an end-of-project block.

### Adding anything (resource / skill / agent / idea / memory / principle)
Run the intake-audit (`docs/workflows/intake-audit-template.md`): identity → fit → 3 costs (install/maintenance/removal) → score → **KILL criteria** (the audit must be able to say `reject`) → decision enum → adaptation → integration plan → re-audit date. The audit *decides*; implementation reuses the mission lifecycle.

### Self-audit (at every phase gate)
Re-audit already-built artifacts (`CLAUDE.md`, `AGENTS.md`, Tier A fiches, `mas-*` skills, ADRs) against current best knowledge. Fix or backlog the debt.

### Persistence bridge (anti-oubli — firm requirement)
Phase 4 memory MUST seed from `docs/knowledge/` + `vibeflow/INDEX.md`, so build-time knowledge flows into the runtime second brain instead of diverging. In Phase 4 exit criteria. See `docs/backlog/second-brain-cross-project.md` and `knowledge-bootstrap.md §5.bis` (the enrichment spiral).

## 14. Style de communication & rapports (préférence utilisateur — non négociable)

> S'applique à **tout message adressé à l'utilisateur** : rapports de fin de phase, explications, retours de session, réponses. Le code, les commits, les ADR et les artefacts techniques gardent leur rigueur ; c'est la **communication avec l'utilisateur** qui suit cette règle.

1. **Clarté imagée d'abord, jargon en dernier.** Expliquer avec des images et des analogies du quotidien, pas avec le jargon technique du projet. Si un terme technique est indispensable, le traduire aussitôt en une phrase simple + une image.
2. **L'essentiel en tête.** Donner d'abord les infos les plus importantes, expliquées et illustrées — jamais un dump exhaustif. Le détail technique vient après, ou sur demande.
3. **Toujours préparer la suite.** Terminer par (a) un **plan clair des prochaines étapes** (quoi faire, dans quel ordre, pourquoi), bien expliqué, et (b) une **recommandation explicite** de ce qu'il faut faire au vu du résultat revu.
4. **Exigence d'excellence.** Le travail attendu est complet, approfondi, bien construit, bien écrit. Pas de bâclé, pas de demi-mesure.
5. **Correction continue.** Dès qu'une coquille ou une erreur apparaît (code, doc, raisonnement — n'importe où) → corriger immédiatement. Dès qu'une idée ou une info nouvelle mérite d'être ajoutée/utilisée → l'intégrer par le bon canal (ADR / ROADMAP / mémoire), sans attendre.
6. **Persistance.** Cette préférence vit aussi dans le second cerveau (mémoire globale, registre user/préférence, écrit par le Memory Keeper) pour que les agents runtime la portent — pas seulement ici.

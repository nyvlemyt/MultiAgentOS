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

## 3. Repository layout

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
  - Binary review thresholds: fn < 50 lines · file < 800 · nesting ≤ 4 · coverage ≥ 80 % — coverage is now **measured** (`pnpm test:coverage`, v8 provider, report-only). 2026-06-25 baseline: 91 % lines / 84 % branches / 88 % functions. It is **advisory**, *not* a blocking gate yet (low spots are dev-only CLI shims); promotion to a 6th verification check is pending — see `docs/backlog/test-coverage-measurement-gap.md`.
  - Do **not** adopt ECC's "attribution disabled" git rule — it contradicts our mandatory `Co-Authored-By` commit footer (§7 Commits).
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

MultiAgentOS has **one** legal billing mode — the Claude Code subscription (Pro/Max, fixed monthly) via `claude login` + `@anthropic-ai/claude-agent-sdk`. PAYG via `@anthropic-ai/sdk` + `ANTHROPIC_API_KEY` (per-token "facture salée") is **forbidden**.

**Rules — enforce always, never override:**

1. **No runtime code may `import` from `@anthropic-ai/sdk`** in `apps/` or `packages/*/src/`. The only legal location is an opt-in `packages/core/src/api-fallback/` behind an explicit config flag. Enforcement: **CI lint guard active** — `scripts/lint-no-sdk-payg.sh`, wired into `pnpm lint` (matches any import form: quotes, dynamic `import()`, `require`, subpaths).
2. `ANTHROPIC_API_KEY` presence at worker init triggers a **warning log + refusal to start** — the key is a smell, not a feature.
3. `ANTHROPIC_API_KEY` must never be exported in global shell config (`~/.zshrc`, `~/.bashrc`, `~/.zshenv`, `~/.profile`). Verify: `echo $ANTHROPIC_API_KEY` in a fresh terminal must be empty.
4. Claude Code authenticates exclusively via `claude login`. If it prompts for an API key, something is wrong — investigate before entering one.
5. `.env` files are gitignored and must stay that way. Never commit a file containing `ANTHROPIC_API_KEY`.

`packages/core/src/llm.ts` is the single LLM injection point (drives the engine via `@anthropic-ai/claude-agent-sdk`); no other file may instantiate an LLM client.

**§11.bis — Non-Anthropic providers (ADR 0002):** provider SDKs (`openai`, `@google/generative-ai`, Perplexity) are allowed **only** under `packages/core/src/providers/`, resolved by `RouterLLMClient`; paid APIs ship opt-in / default-OFF and the lint guard confines them there. The `@anthropic-ai/sdk` PAYG ban above is unchanged.

> Full rationale, the provider sub-rules, the 2026-06-15 Agent-SDK credit split, and the runaway-quota guard live in **`docs/decisions/0009-billing-isolation.md`** — update that ADR (not this prose) when the billing model changes.

## 12. Knowledge Base — mandatory consultation rules

`docs/knowledge/` holds curated research on agents, prompting, memory, and production patterns. **Ignoring it produces mediocre work** — these rules are non-negotiable.

- **Before creating/modifying any `SKILL.md`:** read `prompting-anthropic.md` (XML tags, chain-of-thought, effort mapping) + `skills-reference.md` (lifecycle: Overview → When to Use → Process → Rationalizations → Red Flags → Verification) + the relevant domain file (`agent-patterns.md` / `memory-patterns.md` / `production-patterns.md` / `project-doctrine.md`). Body must carry Principles (cite source) · numbered Process · Rationalizations table · Red Flags · binary Verification Criteria. `summary:` = L1 précis (≤200 tok); body = L2 full guide — **both required**.
- **Before creating/modifying any agent fiche:** check `AGENTS.md` for tier/domain/responsibility; read `agent-patterns.md`; apply the **≤7 tools** rule (MLOps Community research).
- **Before any memory feature:** read `memory-patterns.md` (5-register architecture from `project-doctrine.md`); apply the signal-density test; never inject >5 global memory items per mission.

**Red-flag thoughts — stop and consult `docs/knowledge/` if you catch any of these:** "the skill is just instructions, it doesn't need much content" · "I'll keep the summary short for now" · "I don't need the knowledge base for this." All three are wrong (see the rules above).

## 13. Learning bootstrap — pre-flight, intake-audit & persistence (mandatory)

The tool that builds great projects must itself be built with the best knowledge — learned *before* each phase, never last. Full doctrine: `docs/workflows/knowledge-bootstrap.md`.

- **Before building ROADMAP phase N:** run a phase-scoped intake-audit of relevant resources (`docs/ressources/`, `docs/knowledge/`; method in `docs/workflows/intake-audit-template.md`), **distill** kept items into `docs/knowledge/` (and CLAUDE.md / skills only if it becomes a rule), **then** build. Resources are a per-phase input, not an end-of-project block.
- **Adding anything (resource / skill / agent / idea / memory / principle):** run the intake-audit — identity → fit → 3 costs → score → **KILL criteria** (must be able to say `reject`) → decision enum → adaptation → integration plan → re-audit date. The audit *decides*; the mission lifecycle executes.
- **Self-audit at every phase gate:** re-audit shipped artifacts (`CLAUDE.md`, `AGENTS.md`, Tier A fiches, `mas-*` skills, ADRs) against current best knowledge; fix or backlog the debt.
- **Persistence bridge (anti-oubli):** Phase 4 memory was seeded from `docs/knowledge/` + `vibeflow/INDEX.md` (2026-06-09), so build-time knowledge flows into the runtime second brain instead of diverging. See `docs/backlog/second-brain-cross-project.md` and `knowledge-bootstrap.md §5.bis` (the enrichment spiral).

## 14. Style de communication & rapports (préférence utilisateur — non négociable)

> S'applique à **tout message adressé à l'utilisateur** : rapports de fin de phase, explications, retours de session, réponses. Le code, les commits, les ADR et les artefacts techniques gardent leur rigueur ; c'est la **communication avec l'utilisateur** qui suit cette règle.

1. **Clarté imagée d'abord, jargon en dernier.** Expliquer avec des images et des analogies du quotidien, pas avec le jargon technique du projet. Si un terme technique est indispensable, le traduire aussitôt en une phrase simple + une image.
2. **L'essentiel en tête.** Donner d'abord les infos les plus importantes, expliquées et illustrées — jamais un dump exhaustif. Le détail technique vient après, ou sur demande.
3. **Toujours préparer la suite.** Terminer par (a) un **plan clair des prochaines étapes** (quoi faire, dans quel ordre, pourquoi), bien expliqué, et (b) une **recommandation explicite** de ce qu'il faut faire au vu du résultat revu.
4. **Exigence d'excellence.** Le travail attendu est complet, approfondi, bien construit, bien écrit. Pas de bâclé, pas de demi-mesure.
5. **Correction continue.** Dès qu'une coquille ou une erreur apparaît (code, doc, raisonnement — n'importe où) → corriger immédiatement. Dès qu'une idée ou une info nouvelle mérite d'être ajoutée/utilisée → l'intégrer par le bon canal (ADR / ROADMAP / mémoire), sans attendre.
6. **Persistance.** Cette préférence vit aussi dans le second cerveau (mémoire globale, registre user/préférence, écrit par le Memory Keeper) pour que les agents runtime la portent — pas seulement ici.

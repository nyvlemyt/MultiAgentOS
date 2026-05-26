# ADR 0001 — Pilot Claude Code, do not call the raw Anthropic API

- **Status**: Accepted (supersedes the implicit choice baked into Phase 0 and the first half of Phase 2)
- **Date**: 2026-05-27
- **Branch in flight when decided**: `phase/2-real-claude`

## Context

Anthropic now separates **two billing surfaces** that look superficially the same from a developer's seat:

1. **Anthropic API (`@anthropic-ai/sdk`)** — PAYG, per-token, billed against the Console credit pool. This is the path you take when you `new Anthropic({ apiKey })`. Every call burns cents.
2. **Claude Code engine (subscription-backed)** — fixed monthly cost (Pro / Max). The local `claude` CLI authenticates via `claude login`, and any program that drives Claude through that engine — via the **Claude Agent SDK** (`@anthropic-ai/claude-agent-sdk`) or by spawning `claude --print` headless — runs against the *subscription*, not the API credit pool.

The architecture you pick determines which surface gets billed. The mantra: **architecture = facturation**.

There are three observable patterns ("voies") for building an agent stack on top of Claude:

| Voie | Wrapper calls… | Auth | Billing |
|------|----------------|------|---------|
| **1** | `@anthropic-ai/sdk` directly (external wrapper) | API key | **PAYG, facture salée** |
| **2** | Open-source webui that pilots Claude Code (e.g. `siteboon/claudecodeui`, `sugyan/claude-code-webui`, ~4 k stars) | `claude login` | Subscription (free over the abonnement) |
| **3** | Your own UI doing the same thing as Voie 2 — Agent SDK or headless `claude` CLI under the hood | `claude login` | Subscription (free over the abonnement) |

MultiAgentOS is, in product terms, **Voie 3**: a personal Mission Control that drives Claude Code. The catch: until this ADR, the *implementation* was **Voie 1**.

## Problem (the gap we are closing)

The doctrine in `CLAUDE.md §11` ("Billing isolation") already states the rule:

> Claude Code authenticates exclusively via `claude login` (subscription). If it prompts for an API key, something is wrong.

But the code on `phase/2-real-claude` directly contradicts it:

- `packages/core/package.json` declares `@anthropic-ai/sdk` as a runtime dependency.
- `packages/core/src/llm.real.ts` does `import Anthropic from '@anthropic-ai/sdk'` and `new Anthropic({ apiKey })`.
- `apps/worker` boots `realLLM(apiKey)` whenever `ANTHROPIC_API_KEY` is present.
- `packages/core/src/llm.real.ts` ships a `PRICE_PER_M` table (cents per million tokens) — proof that the design intent was PAYG, not subscription.
- `ROADMAP.md §Phase 2` literally says *"swap the mock for `@anthropic-ai/sdk`"*. The roadmap itself points at Voie 1.

In other words: **the moment any non-mock mission runs, MultiAgentOS leaks tokens onto the API credit pool instead of consuming the abonnement we already pay for.**

## Decision

1. **No agent-runtime code may `import` from `@anthropic-ai/sdk`.** The package is removed from `packages/core` runtime dependencies. It may remain available, isolated, only inside an explicit `packages/core/src/api-fallback/` if and only if a future feature genuinely cannot be reached through the Claude Code engine — and even then, gated behind an opt-in config flag plus a separate budget envelope.
2. **All LLM calls go through the Claude Code engine.** The new transport is one of:
   - `@anthropic-ai/claude-agent-sdk` (preferred — typed, streamable), or
   - spawn `claude --print --output-format=stream-json …` headless (fallback for shell-heavy missions, already mentioned as "later" in `CLAUDE.md §2`).
3. **Authentication is `claude login` only.** `ANTHROPIC_API_KEY` is no longer read by any runtime path. The variable is treated as a *forbidden* signal in `packages/core/src/llm.real.ts`: if it is present in the worker's process env when the LLM client initialises, the worker **logs a warning and refuses to start** until it is unset.
4. **Voie 2 is the architectural reference.** We mirror the wiring of the leading open-source webui (`siteboon/claudecodeui` ≈ 4 k stars; alternates: `sugyan/claude-code-webui`, `winfunc/opcode`, `KyleAMathews/claude-code-ui`). Concretely: a Node bridge process exposes a streaming session to the Next.js cockpit over WebSocket / SSE; the bridge owns the `claude` subprocess (or the Agent SDK client) and translates UI events into Claude Code session events. We are not copying their code — we are copying their **transport pattern**, because it is the proven way to drive the engine without paying API tokens.
5. **`packages/core/src/llm.ts` interface stays.** What changes is the *implementation* of `realLLM`. From the rest of the codebase's point of view, `LLMClient.call(req)` keeps the same shape. The cost meter is rebadged: `costCents` is renamed to `subscriptionTokens` (or kept as a *non-binding estimate*), because under the abonnement there is no per-token bill — only a quota of messages per 5-hour rolling window and a weekly quota. The hard money cap in `TOKEN_STRATEGY.md §8` becomes a **quota cap** (messages-per-window) instead of a **euro cap**.
6. **The "Inspiration Voie 2" principle is permanent.** Whenever a question arises that the Claude Agent SDK docs don't answer cleanly — session resume, file-context injection, tool gating, streaming back-pressure, image attachments, stop reasons — the first reflex is *"how do the open-source webuis do it?"*. We read their code, we steal their pattern, we do not invent. This is logged here so future agents working on the repo treat it as policy, not as a one-off shortcut.

## Consequences

### Positive

- Zero PAYG bleed. The cost of running MultiAgentOS is the abonnement, period.
- The token meter shifts from "money burned" to "subscription-quota consumed" — a much more honest signal of how aggressively we are using the user's plan.
- Pattern-reuse from a ~4 k-star reference shortens Phase 2 considerably: streaming, session resume, tool gating are already solved in the wild.
- `CLAUDE.md §11` and the runtime now agree. The doctrine is enforceable, not aspirational.

### Negative / accepted trade-offs

- We lose direct access to API-only features (prompt caching control beyond what the Agent SDK exposes, raw `stop_sequences`, custom system prompts that bypass the Claude Code system prompt). Those will need an opt-in `api-fallback` path if they ever block a feature — see clause 1.
- The cost meter is no longer a euros figure. Some of `/tokens` UI copy needs reworking.
- `TOKEN_STRATEGY.md §1` ("Anthropic credit pool ≈ 20 €") is no longer the relevant envelope. The envelope is the abonnement's rolling window. Strategy doc needs a follow-up patch.
- Phase 2's exit criteria as currently written ("Same seed mission runs against real Claude under 30 k tokens total") need a new yardstick. Proposal: "Same seed mission runs end-to-end under the Claude Code engine via the Agent SDK, using ≤ N messages of the current 5-hour window, with zero entries in the Anthropic Console usage page for the run window."

### Compatibility note

This ADR **invalidates the current head of `phase/2-real-claude`**. The branch must not be merged into `main` as-is. Either:

- Rebase the branch and rewrite the commits that introduced the `@anthropic-ai/sdk` runtime path (`2660dd6`, `e3fa424`, anything that touches `llm.real.ts`), or
- Abandon the branch in favour of a new `phase/2-claude-code-bridge` cut from `main`.

## Open questions (for the active Claude Code session to resolve)

- **Q1.** Which transport: Agent SDK npm package, or headless `claude --print` over child-process? (Recommend: SDK as primary, child-process as fallback for missions that already need the shell.)
- **Q2.** Session model: one long-lived Claude Code session per project, or one ephemeral session per task? (Recommend: per-project session for context cache reuse; per-mission scoping done at the *prompt* layer, not the *session* layer.)
- **Q3.** Where do skills load? Inside the Claude Code session's `.claude/skills/` (already supported by the engine), or in MultiAgentOS-side prompt assembly? (Recommend: lean on the engine's native skill loading whenever possible — saves us re-implementing the loader.)
- **Q4.** How do we detect when the abonnement's 5-hour window is close to exhausted? (Recommend: the SDK surfaces `stop_reason` and rate-limit headers; mirror what `claudecodeui` does.)

## References

- `CLAUDE.md` §2 (stack), §9.bis (Inspiration Voie 2), §11 (billing isolation) — amended on `phase/2-claude-code-bridge`
- `TOKEN_STRATEGY.md` §1, §3, §8, §9, §11 — amended on `phase/2-claude-code-bridge`
- `ROADMAP.md` Phase 2, Phase 3 — rewritten on `phase/2-claude-code-bridge`
- `packages/core/src/llm.real.ts` — to be rewritten (sections C + D)
- Reference repos (Voie 2 inspiration): [siteboon/claudecodeui](https://github.com/siteboon/claudecodeui), [sugyan/claude-code-webui](https://github.com/sugyan/claude-code-webui), [winfunc/opcode](https://github.com/winfunc/opcode), [KyleAMathews/claude-code-ui](https://github.com/KyleAMathews/claude-code-ui)

---

## Amendments (2026-05-27)

Applied during the doctrine-patch pass on `phase/2-claude-code-bridge`. These clarify or correct the open questions and add two integration requirements discovered in review.

### Q1 — SDK `permissionMode` must be verified before splitting into `ShellMissionRunner`

The ADR recommends Agent SDK as primary transport and headless `claude --print` as fallback. A second class (`ShellMissionRunner`) is only justified if the SDK does not expose the `permissionMode` flag natively.

**Verification required before the architecture split:**
```bash
pnpm add @anthropic-ai/claude-agent-sdk -F @mas/core
grep -r "permissionMode" node_modules/@anthropic-ai/claude-agent-sdk
```

If the SDK surfaces `permissionMode: 'plan' | 'default' | 'acceptEdits' | 'bypassPermissions'` in `query()`, risk-gating stays as a flag on the single runner — no second class. The second class (`ShellMissionRunner`) is only created if the SDK does not map all modes needed by `CLAUDE.md §4` autonomy levels.

**Document the finding in a comment at the top of `llm.real.ts` before committing the file.**

### Q3 — Orchestrator skills vs execution-session skills: two-session model

**The problem:** when the Claude Code session runs with `cwd = project.path`, the engine loads skills from that project's `.claude/skills/`. It does **not** load MultiAgentOS's orchestrator skills (mission-planner, skill-router, context-manager, etc.) which live in the MultiAgentOS repo's `.claude/skills/`.

Two options were evaluated:

- **(a) Two sessions per project** — orchestrator session (`cwd = MultiAgentOS repo`), execution session (`cwd = project.path`). Clean separation, double resource usage, more complex bridge wiring.
- **(b) One session, orchestrator skills prompt-side** — session runs with `cwd = project.path`. Orchestrator skills (the 6 Tier A skills) are injected as summaries at the prompt layer by MultiAgentOS, not loaded by the engine. Phase 3 narrows to producing and maintaining those 6 summaries.

**Decision: option (b).** One session per project (`cwd = project.path`). Orchestrator skill summaries injected at prompt layer. The engine loads execution-context skills natively; MultiAgentOS owns routing decisions and orchestrator skill content.

**Consequence for Phase 3:** Phase 3 is narrowed. It no longer needs to build a general skill summarizer for all 20+ skills. It needs to maintain high-quality summaries for the **6 orchestrator skills** only (mission-planner, skill-router, context-manager, memory-keeper, reviewer, sec-reviewer). External project skills are loaded by the engine natively. The `/skills` page still lists all discovered skills, but the "summarize" pipeline runs only on the orchestrator set.

### Q4 — Subscription window key is per-subscription, not per-project

The 5-hour rolling quota belongs to the subscription account, not to individual projects. Three concurrent missions on three different projects draw from the **same** window bucket.

**Correction:** the `budgets` table window counter key is `(subscriptionUserId, windowStart)`, not `(projectId, windowStart)`.

The per-project breakdown visible on `/tokens` is a **read-only view** computed from `(subscriptionUserId, windowStart)` — it shows how each project contributed to the shared window consumption, but it is not a separate quota. Project-level caps (§3 of `TOKEN_STRATEGY.md`) are enforced as a share of the shared window, not as an independent meter.

### Memory Keeper vs session engine — synchronisation contract

The Claude Code session engine maintains its own in-session memory (conversation history, tool results). MultiAgentOS persists structured memory to disk in `data/memory/<projectId>/`. These are two distinct memory layers.

**Synchronisation contract (applies from Phase 4 onward, but noted here to prevent architectural drift):**

- The session's in-session memory is **volatile** — it lives only as long as the session, and is not written to disk by MultiAgentOS.
- The Memory Keeper agent is the **sole disk writer** for `data/memory/<projectId>/` and `data/memory/_global/`. No other agent or the session engine may write there.
- At the start of each mission turn, MultiAgentOS injects a compact summary of relevant memory items (≤ 5 items, ≤ 200 tokens total) as a prompt-side prefix. The session engine does not "know" about the disk store — it sees only what is injected.
- Memory candidates produced during a mission are queued as `MemoryProposal` tasks (existing pattern in `CLAUDE.md §8`) and processed by Memory Keeper after the mission ends, not during.

### `/tokens` page — atomic rename requirement

The rename `costCents → quotaUnits` in `LLMResponse` and the `/tokens` page copy migration (€ → messages) **must land in the same commit**. A split commit creates a window where the backend sends a message count and the UI renders "5.23 €". The commit scope is: `packages/core/src/llm.ts` interface + `llm.real.ts` implementation + `apps/web` `/tokens` page copy, all in one atomic change.

# ADR 0002 — Multi-account + multi-provider router (Phase 3.5)

- **Status**: Proposed — **deferred to Phase 3.5** (after Phase 4 Memory). Captured now so the reframe isn't lost.
- **Date**: 2026-06-08
- **Deciders**: Melvyn + Claude
- **Supersedes scope of**: ROADMAP "Phase 3.5 · Multi-model Router" (which framed it as multi-*provider* only)

## Context

The user's real constraint is **quota windows, not € per token**. Billing facts (2026-06-08):
- Claude subscription(s): the **Agent SDK blocks** when the daily/weekly quota window is exhausted.
- The user holds **two Claude accounts** (a 20 € plan + a 100 € plan) **plus** ChatGPT, Gemini (free student tier), and Perplexity credentials.
- Goal: **use the least-costly source each time = the account/provider whose quota window is freshest**, and **fail over** when one blocks — like home electricity backed by several generators, each taking over on demand.
- Hard requirement: every source must answer **from the project's files** (config / README / ROADMAP / memory / context-pack), **not** from what the model thinks it knows about the user. Same knowledge across all generators.

## Decision (direction — to be finalized at the Phase 3.5 pre-flight)

1. **Account + provider abstraction** in `packages/core/src/providers/`: one `LLMClient` per (provider, account). `RouterLLMClient` resolves `LLMRequest.domain` + quota state → the cheapest **available** source, with a **fail-over chain**.
2. **Multi-account Claude pooling is first-class** (not just multi-provider): pool the 20 € + 100 € Claude accounts to survive quota windows; other providers (Gemini-free, GPT, Perplexity) are overflow / specialization.
3. **Execution stays Claude-only.** File I/O, bash, git run through the Agent SDK (needs `cwd = project.path` + tools). Non-Claude providers do **cognition only** (reasoning, writing, search). So "each generator does the same thing" is true for *cognition*, not *execution*.
4. **Grounding is mandatory and uniform.** Non-Claude providers have no `cwd`, so the **memory layer + context-pack (Phase 4) are injected explicitly** into every provider's prompt. → This is *why* Memory (Phase 4) is built **before** the router.
5. **Cost model = quota windows**, not money. The router tracks each source's window state (fresh / near-limit / blocked) and prefers the freshest; on `rate_limit` / `quota_exhausted` it logs `provider_fallback { from, to, reason }` in `/trace`.
6. **Amend CLAUDE.md §11** to allow non-Anthropic providers **only** under `packages/core/src/providers/` behind config; the PAYG-Anthropic ban is unchanged.

## Open questions (resolve at 3.5 pre-flight, before coding)

- **Multi-account Claude auth with the Agent SDK**: the SDK uses a single `claude login` session. Pooling 2 accounts likely means **per-account `CLAUDE_CONFIG_DIR`** (separate credential/config dirs) and switching on quota block. Validate feasibility (look at how open-source Claude webuis juggle sessions — CLAUDE.md §9.bis Voie 2).
- **Quota-window detection**: how does the SDK signal "window exhausted" vs a transient rate-limit? Need a reliable signal to drive failover.
- **Non-Claude API cost**: ChatGPT Plus / Perplexity Pro **subscriptions do not include API access** — their APIs are pay-per-token (real €). Gemini has a free tier. → default routing should prefer **Claude-accounts + Gemini-free**, and treat paid OpenAI/Perplexity APIs as opt-in.
- **Provider parity on grounding**: verify each provider honors the injected context-pack/memory (no "I don't have access to your files" drift).

## Alternatives considered

- **Single Claude account only** (status quo) — rejected: blocks the whole system when its window exhausts; wastes the user's other accounts/subs.
- **Multi-provider without multi-account** (original ROADMAP framing) — insufficient: misses the cheapest lever (a second Claude account on a fresh window) and pushes work to paid third-party APIs.

## Consequences

- This ADR is **deferred**: Phase 4 (Memory) ships first; the router is built on top of it.
- The Phase 3.5 pre-flight intake-audit must produce the final version of this ADR (resolve the open questions) before any provider code.
- `LLMRequest` gains an optional `domain`; the dispatcher sets it from the task's skill tags (the Phase 3 domain taxonomy already exists in the `skills` table).

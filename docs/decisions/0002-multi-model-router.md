# ADR 0002 — Multi-account + multi-provider router (Phase 3.5)

- **Status**: Accepted — finalized at the 2026-06-13 Phase 3.5 pre-flight (open questions resolved below); build green-lit by user "go Phase 3.5"
- **Date**: 2026-06-08 (amended 2026-06-13)
- **Deciders**: Melvyn + Claude
- **Supersedes scope of**: ROADMAP "Phase 3.5 · Multi-model Router" (which framed it as multi-*provider* only)

## Context

The user's real constraint is **quota windows, not € per token**. Billing facts (2026-06-08):
- Claude subscription(s): the **Agent SDK blocks** when the daily/weekly quota window is exhausted.
- The user holds **two Claude accounts** (a 20 € plan + a 100 € plan) **plus** ChatGPT, Gemini (free student tier), and Perplexity credentials.
- Goal: **use the least-costly source each time = the account/provider whose quota window is freshest**, and **fail over** when one blocks — like home electricity backed by several generators, each taking over on demand.
- Hard requirement: every source must answer **from the project's files** (config / README / ROADMAP / memory / context-pack), **not** from what the model thinks it knows about the user. Same knowledge across all generators.

## Decision (finalized at the 2026-06-13 Phase 3.5 pre-flight)

1. **Account + provider abstraction** in `packages/core/src/providers/`: one `LLMClient` per (provider, account). `RouterLLMClient` resolves `LLMRequest.domain` + quota state → the cheapest **available** source, with a **fail-over chain**.
2. **Multi-account Claude pooling is first-class** (not just multi-provider): pool the 20 € + 100 € Claude accounts to survive quota windows; other providers (Gemini-free, GPT, Perplexity) are overflow / specialization.
3. **Execution stays Claude-only.** File I/O, bash, git run through the Agent SDK (needs `cwd = project.path` + tools). Non-Claude providers do **cognition only** (reasoning, writing, search). So "each generator does the same thing" is true for *cognition*, not *execution*.
4. **Grounding is mandatory and uniform.** Non-Claude providers have no `cwd`, so the **memory layer + context-pack (Phase 4) are injected explicitly** into every provider's prompt. → This is *why* Memory (Phase 4) is built **before** the router.
5. **Cost model = quota windows**, not money. The router tracks each source's window state (fresh / near-limit / blocked) and prefers the freshest; on `rate_limit` / `quota_exhausted` it logs `provider_fallback { from, to, reason }` in `/trace`.
6. **Amend CLAUDE.md §11** to allow non-Anthropic providers **only** under `packages/core/src/providers/` behind config; the PAYG-Anthropic ban is unchanged.

## Open questions — RESOLVED (2026-06-13 pre-flight)

1. **Multi-account Claude auth → per-account `CLAUDE_CONFIG_DIR`.** Confirmed working in the field: setting `CLAUDE_CONFIG_DIR` gives a fully isolated Claude Code profile (credentials, settings, sessions). The router declares accounts in `config/model-routing.json` (`claude_accounts: [{ id, configDir, plan }]`) and the Claude provider passes the account's `configDir` as env when invoking the Agent SDK. Each account = one `LLMClient` instance. (Sources: wmedia.es CLAUDE_CONFIG_DIR profiles guide; anthropics/claude-code#44687 — one-account-per-OS-user limitation + env-var workaround.)
2. **Quota-window detection → SDK `rate_limit_event` + error taxonomy.** The Agent SDK emits `rate_limit_event` messages (`SDKRateLimitInfo`, fed by `anthropic-ratelimit-unified-*` headers; see anthropics/claude-code#50518). Failover policy: `status` ≠ allowed or a 429/quota error → mark the source's window `blocked` and fail over; **529/overloaded is transient capacity, NOT failover** — retry same source with backoff. Window state persisted per source (events table), reset on first successful call.
3. **Non-Claude API cost → paid APIs opt-in, default OFF.** ChatGPT Plus / Perplexity Pro subscriptions do NOT include API access; their APIs bill per token (real €). Default enabled chain: **Claude accounts (pooled) → Gemini free tier**. OpenAI/Perplexity providers ship behind `paid_apis_enabled: false` + per-provider keys in `.env.local`; missing key = provider disabled with a startup warning (never a crash). This honors the user's ~20 € envelope (KILL criterion: silent per-token billing).
4. **Grounding parity → solved by construction, tested at DoD.** Phase 4/4.5 provide `buildMemoryContext` (≤5 global cap) + context-packs. Non-Claude providers (no `cwd`) get both injected explicitly in the system prompt; the DoD includes a parity test asserting the injected context is identical across providers for the same task.

## Alternatives considered

- **Single Claude account only** (status quo) — rejected: blocks the whole system when its window exhausts; wastes the user's other accounts/subs.
- **Multi-provider without multi-account** (original ROADMAP framing) — insufficient: misses the cheapest lever (a second Claude account on a fresh window) and pushes work to paid third-party APIs.

## Consequences

- Phase 4 + 4.5-producer shipped first (done); the router builds on their memory/grounding layer.
- `LLMRequest` gains an optional `domain`; the dispatcher sets it from the task's skill tags (the Phase 3 domain taxonomy already exists in the `skills` table).
- CLAUDE.md §11 amended (2026-06-13): non-Anthropic provider SDKs allowed **only** under `packages/core/src/providers/`, behind `config/model-routing.json`; the Anthropic-PAYG ban is unchanged; the lint guard gains a rule confining provider SDK imports to that directory.
- Routing scope discipline: ROADMAP's initial domain table is the seed, but **default-enabled** providers are only Claude accounts + Gemini free; domains whose primary is a paid API (search/research → Perplexity, ux/writing/code-review → GPT) fall back to the default chain until `paid_apis_enabled` is turned on.

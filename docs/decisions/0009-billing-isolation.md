# ADR 0009 — Billing isolation: subscription-only, PAYG forbidden

- **Status**: Accepted — consolidates the billing-isolation policy that lived inline in `CLAUDE.md §11/§11.bis`. The hard rules stay in `CLAUDE.md §11` (single source for enforcement); this ADR holds the rationale, the provider sub-rules, the 2026-06-15 credit split, and the runaway-quota guard.
- **Date**: 2026-06-27 (the decision itself predates this file — see ADR 0001 for the original pivot and ADR 0002 for the provider extension)
- **Deciders**: Melvyn + Claude
- **Sources**: `docs/decisions/0001-claude-code-engine-over-api-sdk.md` (the Voie 3 pivot), `docs/decisions/0002-multi-model-router.md` (non-Anthropic providers), `docs/knowledge/anthropic-ecosystem.md` (2026-06-15 billing change), `CLAUDE.md §5/§6/§11`.

## Context

MultiAgentOS runs on the user's **Claude Code subscription** (Pro/Max), a fixed monthly cost. The competing path — calling `@anthropic-ai/sdk` with an `ANTHROPIC_API_KEY` — bills **per token** against the Anthropic Console credit pool ("facture salée"). For a single power user on a ~20 € envelope, accidental PAYG usage is the single most expensive failure mode. The ban must therefore be **enforced in code**, not just documented (ADR 0001 found §11's rules were correct in spirit but un-enforced).

| Mode | Trigger | Billing |
|------|---------|---------|
| **Subscription** *(only legal mode)* | `claude login` + `@anthropic-ai/claude-agent-sdk` | Fixed monthly |
| ~~API PAYG~~ *(forbidden)* | `@anthropic-ai/sdk` + `ANTHROPIC_API_KEY` | Per token — facture salée |

## Decision

**One billing mode (subscription) and one forbidden mode (PAYG via API key).** The five hard enforcement rules are the operative contract and live in `CLAUDE.md §11` (kept there so every agent sees them). In summary they require: no `@anthropic-ai/sdk` import in `apps/` or `packages/*/src/` (CI-guarded by `scripts/lint-no-sdk-payg.sh`); `ANTHROPIC_API_KEY` at worker init → warn + refuse to start; the key never exported in global shell config; auth exclusively via `claude login`; `.env` stays gitignored. `packages/core/src/llm.ts` is the single LLM injection point.

### §11.bis — Non-Anthropic providers (Phase 3.5, ADR 0002)

Provider SDKs (`openai`, `@google/generative-ai`, Perplexity via an OpenAI-compatible endpoint) are allowed **only** under `packages/core/src/providers/`, resolved exclusively by the `RouterLLMClient`, configured via `config/model-routing.json`:

1. The Anthropic-PAYG ban above is **unchanged** — `@anthropic-ai/sdk` stays forbidden everywhere.
2. Paid third-party APIs (OpenAI, Perplexity) ship **opt-in, default OFF** (`paid_apis_enabled: false`). Default-enabled sources: pooled Claude accounts (per-account `CLAUDE_CONFIG_DIR`) + Gemini free tier.
3. Provider keys live in `.env.local` (gitignored); a missing key disables that provider with a startup warning, never a crash.
4. Execution tasks (file I/O, bash, git) are **Claude-only**; non-Claude providers do cognition, grounded by explicit memory/context-pack injection.
5. The lint guard confines provider SDK imports to `packages/core/src/providers/`.

### Runaway-quota guard

The `budgets` table + `TOKEN_STRATEGY.md §8` define hard window caps. The worker checks the active budget row before every LLM call and returns `budget_exceeded` if the cap is reached.

### ⚠️ Billing change effective 2026-06-15

Agent SDK usage on subscription plans consumes a **separate** monthly credit from Claude.ai conversations. The `budgets` table must track Agent SDK quota independently from interactive Claude.ai usage. Agents consume ~4× quota vs normal chat; multi-agent research missions ~15×. Source: `docs/knowledge/anthropic-ecosystem.md`.

## Alternatives considered

- **Allow PAYG as a fallback when the subscription window is exhausted** — rejected as a *default*: per-token billing is the exact cost the product exists to avoid. A narrow, explicitly opt-in `packages/core/src/api-fallback/` escape hatch behind a config flag is the only tolerated form, and it is off by default.
- **Document the ban without CI enforcement** (the pre-ADR-0001 state) — rejected: the rules were already documented and still got violated on `phase/2-real-claude`. Enforcement must be a lint guard, not prose.
- **Keep all this detail inline in `CLAUDE.md §11`** — rejected: §11 + §11.bis + the billing-change notice pushed CLAUDE.md over its 200-line budget (G2). The hard rules stay; the rationale and sub-rules move here.

## Consequences

- `CLAUDE.md §11` shrinks to the five enforcement rules + a pointer to this ADR; the `§11.bis` anchor is preserved as a stub so existing cross-refs (AGENTS.md §4, ADR 0002, coding-standards §7) keep resolving.
- This ADR is the canonical home for billing rationale; update it (not CLAUDE.md prose) when the billing model changes.
- The lint guard (`scripts/lint-no-sdk-payg.sh`, wired into `pnpm lint`) remains the enforcement mechanism; weakening it requires amending this ADR.

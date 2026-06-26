# Backlog — AGENTS.md roster-doc reconciliation (counts, ghost callers, provider routing)

**Source**: Bloc C agent audit, 2026-06-26 (Dim 4). Surfaced while promoting `architect` to a shipped Tier A fiche. These are documentation-accuracy gaps in `AGENTS.md`, not runtime defects — deferred so the bloc-c PR stays mechanical and low-risk.

## What

Three doc/code drifts in [AGENTS.md](../../AGENTS.md), plus one provider constraint to pin before the `researcher` agent is built:

1. **Tier B count ambiguity.** §1 states "60 fiches already under `.claude/agents/`" (verified: `ls .claude/agents/*.md` = 60 — the raw agency-style + NEXUS arsenal). §6.bis states the ECC harvest deposited "32 cold Tier B fiches in `packages/agents/library/`" (verified: 32). **Both numbers are individually correct**, but the doc never says how the two sets relate — a reader can't tell whether the canonical callable Tier B arsenal is the 60, the 32, their union, or whether one supersedes the other. The runtime only indexes the 32 (`loadAgentLibraryIndex()` → `packages/agents/library/index.json`); the `.claude/agents/` 60 are not scanned into a router index. Spell this out.

2. **Ghost callers in the §6 delegation map.** The "Called by" column names Tier A agents that are **not shipped** — `Frontend Builder`, `Backend Builder`, `UX/UI Critic`, `Docs Writer` live only in the §4 "Phase 2" backlog, yet §6 presents them as live MVP callers. The real runtime wiring is `TIER_B_DELEGATION_MAP` + `domainScopeFor(agentId)` in [library.ts](../../packages/agents/src/library.ts), keyed by **Tier B id** with a `DelegationEntry` scope — not by these named Tier A agents. The "Called by" column is aspirational doctrine, not code truth; mark it as such or align it to the shipped roster.

3. **`domainScopeFor` param naming drift.** §6.bis prose calls it `domainScopeFor(agentHint)`; the actual signature is `domainScopeFor(agentId: string | undefined | null)` ([library.ts:224](../../packages/agents/src/library.ts)). `agentHint` is the *plan-time* `PlannerOutput` field; it is resolved to a task `agentId` before dispatch, and the function takes the resolved `agentId`. Either rename the doc to `agentId` or note the hint→id resolution explicitly so the two names aren't read as one undefined symbol.

4. **`researcher` provider routing (pin before build).** §4 hints the future `researcher` agent at "Perplexity". When built, Perplexity (and any paid third-party provider) MUST be reached via an MCP/subscription path, **never the paid REST API** — CLAUDE.md §11.bis: paid third-party APIs ship opt-in, default OFF (`paid_apis_enabled: false`); the Anthropic-PAYG ban (§11) is absolute. Record this so the provider choice isn't silently wired to a billed endpoint later. See also [per-provider-subscription-awareness.md](per-provider-subscription-awareness.md).

## Why it's only backlog, not a fix-now

- Zero runtime impact: every statement that drives code (the §2 schema, the shipped §3 roster, `TIER_B_DELEGATION_MAP`) is accurate and enforced by `validateFiche()` + tests. The drifts are in narrative columns and prose.
- Fixing them well means a small editorial pass with judgement calls (how much of §6 is doctrine vs. wiring), which is out of scope for a mechanical agent-hardening PR.
- The `researcher` item is a constraint to honour at build time, not a change to make now.

## What to do (when picked up)

1. Add one sentence under §1/§6.bis clarifying that the 32-fiche `packages/agents/library/` index is the router-callable cold arsenal, and the 60 `.claude/agents/` fiches are the unindexed source pool.
2. Either (a) trim the §6 "Called by" column to shipped Tier A agents only, or (b) add a note that it documents intended ownership, with the live wiring being `TIER_B_DELEGATION_MAP`/`domainScopeFor`.
3. Reconcile the `domainScopeFor(agentHint)` prose with the `agentId` signature (rename or annotate the hint→id resolution).
4. When the `researcher` agent is authored: route Perplexity via MCP/subscription, gated behind `paid_apis_enabled`, and add a Red Flag in its fiche against the paid REST endpoint.

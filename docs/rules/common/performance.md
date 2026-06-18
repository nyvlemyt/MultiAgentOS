---
origin: affaan-m/ecc
license: MIT
lang: common
concern: performance
---
<!-- pattern from affaan-m/ecc rules/common/performance.md -->

# Performance & Effort (stack-agnostic)

Model-effort selection and context-window discipline for agent work. **Reframed for MAOS:** the source frames model choice in dollar "cost savings"; under CLAUDE.md §11 MAOS is subscription-only — there is no per-token PAYG, so every tradeoff here is expressed as **quota units / Agent-SDK credit** (CLAUDE.md §11 bis, `budgets` table), never €/$. This overlaps router-core's three-tier routing (`config/model-routing.json`); keep it as the human-facing rationale, not a second router.

## Model-effort selection (maps to the 3-tier router)

- **Haiku tier (`risk_low`)** — lightweight, frequently-invoked agents; code generation; worker agents in a multi-agent system. Lowest quota draw.
- **Sonnet tier (`risk_medium`)** — main development work; orchestrating multi-agent workflows; complex coding.
- **Opus tier (`risk_high`)** — deepest reasoning: architectural decisions, hard research/analysis.

This is exactly the `risk_high→opus / risk_medium→sonnet / risk_low→haiku` mapping `mas-skill-router` already applies. Pick the lowest tier that clears the reasoning bar — agents consume ~4× quota vs chat, multi-agent research ~15× (CLAUDE.md §11).

## Context-window management

Avoid the last ~20% of the context window for high-stakes work:

- Large-scale refactors, multi-file feature work, debugging complex interactions → keep headroom.
- Low-sensitivity tasks tolerate a fuller window: single-file edits, independent utility creation, doc updates, simple bug fixes.

(In MAOS, this is one more reason to lean on context-packs and L1 skill summaries — CLAUDE.md §6 — rather than reloading whole trees.)

## Extended thinking + plan mode

For tasks needing deep reasoning: enable extended thinking, use plan mode for structure, run multiple critique rounds, and use split-role sub-agents for diverse perspectives. Cap the thinking budget (`MAX_THINKING_TOKENS`) on routine tasks to protect quota.

## Reference

- Pairs with `TOKEN_STRATEGY.md`, `config/model-routing.json`, and `mas-skill-router`.

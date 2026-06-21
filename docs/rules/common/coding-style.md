---
origin: affaan-m/ecc
license: MIT
lang: common
concern: coding-style
---
<!-- pattern from affaan-m/ecc rules/common/coding-style.md -->

# Coding Style (stack-agnostic)

Language-agnostic style doctrine for any registered project, and a baseline for MAOS's own code where `CLAUDE.md §7` is silent. Where this overlaps §7, **§7 wins**. The per-language packs (`docs/rules/<lang>/coding-style.md`) extend this.

## Immutability (default)

Prefer creating new objects over mutating existing ones. Immutable updates prevent hidden side effects, ease debugging, and make concurrency safe. (MAOS leans on this hard — the orchestrator passes state between agents.)

```
WRONG:  modify(original, field, value) → changes original in-place
CORRECT: update(original, field, value) → returns a new copy with the change
```

## Core principles

- **KISS** — simplest solution that actually works; clarity over cleverness; avoid premature optimization.
- **DRY** — extract repeated logic when the repetition is real, not speculative.
- **YAGNI** — do not build abstractions before they are needed.

## File organization

Many small focused files beat few large ones. High cohesion, low coupling. Target 200–400 lines, **800 max**. Organize by feature/domain, not by type.

## Error handling

Handle errors explicitly at every level. User-friendly messages in UI-facing code; detailed context server-side. Never silently swallow an error (mirrors §7 "no silent destructive ops").

## Input validation

Validate at every system boundary. Schema-based where available; fail fast with a clear message. Never trust external data — API responses, user input, file content, **or LLM output**.

## Naming conventions

- Variables / functions: `camelCase`, descriptive.
- Booleans: `is` / `has` / `should` / `can` prefix.
- Types / interfaces / components: `PascalCase`.
- Constants: `UPPER_SNAKE_CASE`.

## Smells to avoid

- **Deep nesting** — prefer early returns once logic stacks (>4 levels is a refactor trigger).
- **Magic numbers** — name meaningful thresholds, delays, limits.
- **Long functions** — split into focused pieces (<50 lines).

## Reference

- See per-language packs for concrete tooling.

---
origin: affaan-m/ecc
license: MIT
lang: common
concern: hooks
---
<!-- pattern from affaan-m/ecc rules/common/hooks.md -->

# Hooks System (stack-agnostic)

Claude Code harness hook taxonomy for a registered project. Hooks run via the harness, not the model. The per-language packs (`docs/rules/<lang>/hooks.md`) extend this with concrete commands.

## Hook types

- **PreToolUse** — before tool execution (validation, parameter checks). The right place to enforce a deny rule before an action runs.
- **PostToolUse** — after tool execution (auto-format, typecheck, lint on changed files).
- **Stop** — at session end (final verification).

## Auto-accept permissions

- Enable auto-accept only for trusted, well-defined plans; disable for exploratory work.
- **Never** use a `dangerously-skip-permissions` flag. Configure an explicit `allowedTools` allowlist instead. (This aligns with CLAUDE.md §5 — risky actions stay gated regardless of autonomy level.)

## Progress tracking

Use a todo list on multi-step tasks to surface out-of-order steps, missing items, wrong granularity, or misinterpreted requirements before they cost a round-trip.

## Reference

- Pairs with the per-language `hooks.md` packs (lint → format → timed typecheck sequencing).

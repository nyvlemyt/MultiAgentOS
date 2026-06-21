---
origin: affaan-m/ecc
license: MIT
lang: nuxt
concern: hooks
---
<!-- pattern from affaan-m/ecc rules/nuxt/hooks.md -->

# Nuxt Hooks

Claude Code harness hooks (PostToolUse) for Nuxt work on a registered project. They run via the harness, not Claude. Extends `docs/rules/common/hooks.md`.

## Typecheck

- `nuxi typecheck` wraps `vue-tsc`. Requires `vue-tsc` + `typescript` dev deps.
- Run on `.vue` / `.ts` edit or pre-commit. Typecheck is project-wide, so debounce it and wrap it in a timeout (e.g. `timeout 60 nuxi typecheck`) so a hung type-check is reaped instead of accumulating across fast edits.

## Lint

- Use the `@nuxt/eslint` module (flat-config, project-aware, generates `.nuxt/eslint.config.mjs`).
- Run `eslint .` or `eslint --fix`. This is the Nuxt-official ESLint integration — prefer it over hand-rolled configs.

## Format

- `prettier --write`, or enable stylistic rules in `@nuxt/eslint` to avoid a Prettier/ESLint conflict.
- Pick one formatting authority. Do not run both Prettier and ESLint stylistic at once.

## Suggested PostToolUse chain

- On Edit to `app/**` and `server/**`: run `eslint --fix`, then `timeout 60 nuxi typecheck`.
- Order matters: lint-fix first (mutates the file), the timed typecheck second (verifies the result). Debouncing still applies.

## Reference

- [@nuxt/eslint module](https://eslint.nuxt.com/) · [nuxi typecheck](https://nuxt.com/docs/api/commands/typecheck)

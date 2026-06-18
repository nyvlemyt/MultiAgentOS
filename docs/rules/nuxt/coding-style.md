---
origin: affaan-m/ecc
license: MIT
lang: nuxt
concern: coding-style
---
<!-- pattern from affaan-m/ecc rules/nuxt/coding-style.md -->

# Nuxt Coding Style

Coding standard for Nuxt framework files (`nuxt.config.*`, `app.config.*`, `app.vue`, `pages/`, `layouts/`, `middleware/`) on a registered project. Arsenal for external Nuxt projects, not MAOS's own cockpit (Next.js, CLAUDE.md §2). Extends `docs/rules/vue/coding-style.md` and `docs/rules/common/coding-style.md`.

## Directory layout

- Default `srcDir` is `app/`. Framework files live at `app/pages/`, `app/layouts/`, `app/middleware/`, `app/plugins/`, `app/app.config.ts`. `nuxt.config.ts` and `server/` stay at project root.
- Some projects override `srcDir` to `src/` for a Feature-Sliced Design layout, remapping `dir.pages` (e.g. to `src/app/routes`), `dir.layouts`, and the `@`/`~` aliases. Always check `nuxt.config.ts` before assuming a path.

## Auto-imports discipline

- Composables in `app/composables/` and `server/utils/` auto-import. Do NOT manually import Nuxt composables (`useFetch`, `useState`, `navigateTo`) or `defineStore` / `storeToRefs`.
- Do NOT add a standalone `vue-router` dep (Nuxt bundles its own) or hand-mount `createApp` / `createPinia` / `createRouter`. The framework wires these.

## Compiler macros

- `definePageMeta` is a compile-time macro. Static values only — no reactive data, no side-effect calls inside it.
- Augment typed `PageMeta` via `declare module '#app'` rather than casting.

## Config file separation

Three distinct files, do not conflate.

- `nuxt.config.ts` = build-time only (`routeRules`, `modules`, `nitro`, `ssr` flag). Not reactive.
- `runtimeConfig` (inside nuxt.config) = per-env runtime values, env-overridable via `NUXT_*`. Root keys are server-only; `public` keys are client-visible.
- `app/app.config.ts` = public build-fixed reactive settings (theme tokens, feature flags). No env override. NEVER secrets.

## Head and meta

- `app.head` in `nuxt.config.ts` takes static values only.
- Reactive meta goes through `useHead` / `useSeoMeta` in component setup, never via `app.head`.

## Reference

- [Nuxt directory structure](https://nuxt.com/docs/guide/directory-structure/app) · [Nuxt configuration](https://nuxt.com/docs/api/nuxt-config)

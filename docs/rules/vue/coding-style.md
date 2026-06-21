---
origin: affaan-m/ecc
license: MIT
lang: vue
concern: coding-style
---
<!-- pattern from affaan-m/ecc rules/vue/coding-style.md -->

# Vue Coding Style

Coding standard for `**/*.vue`. MultiAgentOS's own cockpit is Next.js (CLAUDE.md §2), so this is **arsenal** for registered external projects on a Vue stack, not for `apps/web`. Extends `docs/rules/common/coding-style.md`; where it overlaps `CLAUDE.md §7`, §7 wins.

## SFC Structure

- Always `<script setup lang="ts">` with the Composition API. No Options API in new code.
- Block order: `<script setup>`, then `<template>`, then `<style scoped>`. One component per file.
- Naming: component files PascalCase (`AuctionCard.vue`); composables camelCase prefixed `useXxx` (`useAuctionTimer`).
- Format with Prettier + ESLint flat config using `eslint-plugin-vue` (`vue/vue3-recommended`). Type-check with `vue-tsc` (plain `tsc` cannot read `.vue`).

## Reactivity Discipline

- `ref` is the primary state API. Mutate via `.value` in script; auto-unwrapped only at template top level.
- Nested `ref` inside arrays, `Map`, or `Set` still needs `.value` to read.
- Reach for `reactive` only for grouped object state. Never reassign a whole `reactive` object.
- Never destructure a `reactive` object or a Pinia store without `toRefs` / `storeToRefs` — plain destructure silently drops reactivity.

## Computed and Watchers

- `computed` getters must be pure: no side effects, no async, no DOM access.
- 3.4+ `computed` only triggers when the returned value changes. Return the prior object unchanged when equal to skip downstream updates.
- `watch` is lazy. Pass a getter for a reactive property (`watch(() => x.value, ...)`), not the bare reactive object.
- `watchEffect` is eager and stops tracking dependencies after its first `await`.

## Lifecycle and DOM

- Register lifecycle hooks synchronously inside `setup` (`onMounted`, `onUnmounted`).
- Clean up timers, listeners, and subscriptions in `onUnmounted`.
- Read or measure the DOM only after `await nextTick()`.

## Macros and Templates

- Macros: `defineProps` / `defineEmits` (tuple form `change: [id: number]`), `defineModel` (3.4+) for `v-model`, `withDefaults` or 3.5+ reactive-props-destructure for defaults, `defineExpose` for the public ref API.
- Put a `:key` on every `v-for` — a stable unique primitive. Never the array index, never an object.
- Never put `v-if` and `v-for` on the same element. Wrap with `<template v-for>` plus an inner `v-if`, or precompute a filtered list.

```vue
<script setup lang="ts">
const props = defineProps<{ id: number }>()
const emit = defineEmits<{ change: [id: number] }>()
const open = defineModel<boolean>('open', { default: false })
</script>
```

## Reference

- Docs: https://vuejs.org/api/sfc-script-setup.html · https://vuejs.org/guide/essentials/reactivity-fundamentals.html · https://eslint.vuejs.org/

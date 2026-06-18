---
origin: affaan-m/ecc
license: MIT
lang: web
concern: patterns
---
<!-- pattern from affaan-m/ecc rules/web/patterns.md -->

# Web Patterns

Composition, state, and data-fetching patterns for `apps/web`. See `docs/rules/react/patterns.md` for the React-specific deep dive (RSC boundary, Suspense, forms).

## Component Composition

- **Compound components** when related UI shares state and interaction semantics (Tabs, Accordion, Menu). Parent owns state; children consume via context. Prefer over prop drilling for complex widgets.
- **Render props / slots** when behavior is shared but markup must vary. Keep keyboard handling, ARIA, and focus logic in a headless layer.
- **Container / presentational split**: containers own data loading and side effects; presentational components receive props and stay pure.

```tsx
<Tabs defaultValue="overview">
  <Tabs.List>
    <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
    <Tabs.Trigger value="settings">Settings</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value="overview">…</Tabs.Content>
</Tabs>
```

## State Management — separate the concerns

| Concern | Tooling |
|---|---|
| Server state | TanStack Query, SWR, tRPC, RSC fetch |
| Client state | Zustand, Jotai, signals |
| URL state | search params, route segments |
| Form state | React Hook Form or equivalent |

- Do not duplicate server state into client stores.
- Derive values instead of storing redundant computed state.

## URL as State

Persist shareable state in the URL: filters, sort order, pagination, active tab, search query. In the cockpit, the active project / mission filter and selected tab belong in the URL so a view is linkable and survives reload.

## Data Fetching

- **Stale-while-revalidate**: return cached data immediately, revalidate in the background. Prefer an existing library over rolling it by hand.
- **Optimistic updates**: snapshot → apply → roll back on failure → surface a visible error on rollback.
- **Parallel loading**: fetch independent data in parallel; avoid parent→child request waterfalls; prefetch likely next routes when justified.

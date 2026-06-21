---
origin: affaan-m/ecc
license: MIT
lang: react
concern: patterns
---
<!-- pattern from affaan-m/ecc rules/react/patterns.md -->

# React Patterns

Component-architecture patterns for the Next.js 15 App Router cockpit. Extends `docs/rules/typescript/patterns.md`. For hook rules see `docs/rules/react/hooks.md`.

## Container / Presentational Split

Container components own data fetching, state, and side effects. Presentational components receive props and render — no service calls, no hooks beyond local UI state.

```tsx
export function UserPage({ userId }: { userId: string }) {
  const { data: user, isLoading } = useUser(userId)
  if (isLoading) return <Spinner />
  if (!user) return <NotFound />
  return <UserCard user={user} onSelect={handleSelect} />
}
```

## State Location Decision Tree

1. Used by one component → `useState` inside it.
2. Used by parent + a few children → lift to nearest common ancestor, pass via props.
3. Used across distant branches → React Context **for low-frequency reads only** (theme, auth, locale).
4. High-frequency updates shared across the tree → external store (Zustand, Jotai).
5. Server-derived data → server-state library (TanStack Query, SWR, RSC fetch) — not application state.

Context misused for frequently changing values re-renders every consumer on every update.

## Server / Client Component Boundary (RSC, App Router)

- Server Components are the default: they run on the server, don't ship to the client, and can `await` directly.
- Client Components opt in with `"use client"` on line 1.
- Data flows down: a Server Component renders a Client Component and passes serializable props.
- A Client Component cannot import a Server Component, but can receive one via `children` / named slots.
- Mark sensitive modules with `import 'server-only'` so the bundler errors if a client file imports them — keeps DB clients and secrets off the client (aligns with §11).

```tsx
// Server (default)
export default async function Page() {
  const user = await fetchUser()
  return <UserClient user={user} />
}
// Client
'use client'
export function UserClient({ user }: { user: User }) {
  const [tab, setTab] = useState('profile')
  return <Tabs value={tab} onChange={setTab}>{user.name}</Tabs>
}
```

## Suspense + Error Boundaries

Every Suspense boundary needs an Error Boundary above it — the pair handles both states. Place boundaries close to where data is needed, not at the route root; multiple narrow boundaries reveal content progressively.

```tsx
<ErrorBoundary fallback={<ErrorView />}>
  <Suspense fallback={<Skeleton />}>
    <UserDetails id={id} />
  </Suspense>
</ErrorBoundary>
```

The Error Boundary must be a class component (no functional equivalent yet) or a library wrapper (`react-error-boundary`). The cockpit already standardizes route-level errors on a shared `ErrorState` via `error.tsx` — reuse it rather than hand-rolling per route.

## Forms

- **Uncontrolled + form actions (React 19)**: prefer when the form has a clear submit step; the browser owns the value, React reads it via `FormData`.
- **Controlled**: when the value drives other UI, real-time validation, or formatting.
- **Form libraries** for complex forms (multi-step, dynamic arrays, cross-field validation): React Hook Form, TanStack Form, Final Form.

```tsx
async function action(formData: FormData) {
  'use server'
  await saveUser({ name: String(formData.get('name')) })
}
```

## Data Fetching

| Strategy | When |
|---|---|
| RSC fetch (`await` in Server Component) | Per-request data, no client cache needed |
| TanStack Query | Client cache, mutations, optimistic, polling |
| SWR | Lightweight cache + revalidation |
| `fetch` in `useEffect` | **Avoid** — race conditions, no cache, no retry |

Never fetch in `useEffect` when a cache library is available — they dedupe, invalidate, retry, and integrate with Suspense.

## Lists and Keys

- `key` must be stable across renders — never `index` for a list that can reorder, insert, or delete.
- `key` must be unique among siblings, not globally.
- A reordered list with index keys attaches child state to the wrong row.

## Composition over Inheritance

Pass `children` for slots, render-prop functions for parameterized rendering, component types for plug-in points (`renderItem={UserRow}`). Never extend a component class to specialize.

## Compound Components

For related controls (Tabs, Accordion, Menu), share state via Context behind a compound API (`<Tabs.List>`, `<Tabs.Trigger>`, `<Tabs.Panel>`).

## Portals

Use `createPortal` for modals, tooltips, toasts — anything that must escape parent `overflow: hidden` or `z-index` stacking. Render to a stable mounted node.

## Refs and Forwarding (React 19+)

React 19 lets function components accept `ref` as a regular prop — `forwardRef` is no longer required. React 18 codebases still need `forwardRef`.

```tsx
export function Input({ ref, ...rest }: { ref?: React.Ref<HTMLInputElement> } & InputProps) {
  return <input ref={ref} {...rest} />
}
```

## Out of Scope (pointers)

- **Next.js App Router specifics** (Server Actions, Route Handlers, Middleware, Parallel/Intercepted Routes, streaming Metadata): treat as a separate concern; follow Next.js official docs. A dedicated `docs/rules/nextjs/` track can be proposed when deep Next-specific rules accumulate.
- **React Native**: separate track; React core hooks/patterns here still apply.

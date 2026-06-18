---
origin: affaan-m/ecc
license: MIT
lang: react
concern: coding-style
---
<!-- pattern from affaan-m/ecc rules/react/coding-style.md -->

# React Coding Style

Component style for the Next.js 15 App Router cockpit (`apps/web`). Extends `docs/rules/typescript/coding-style.md`.

## File Extensions

- `.tsx` for any file containing JSX, even one-liners.
- `.ts` for pure logic, hooks without JSX, type defs, utilities.
- `.test.tsx` / `.test.ts` mirroring the source.
- `.jsx` only when a project intentionally avoids TS — flag every new untyped React file in review. (MultiAgentOS is TS-only, §2: don't add `.jsx`.)

## Naming

- Components: `PascalCase` for symbol and file (`UserCard.tsx`, default export `UserCard`).
- Custom hooks: `useCamelCase` symbol; kebab-case file when that's the project convention (`use-debounce.ts` → `useDebounce`).
- Context: `<Domain>Context` symbol, `<Domain>Provider` component, `use<Domain>` consumer hook.
- Event handlers: `handleClick` / `handleSubmit` inside the component; the prop that receives it is `onClick` / `onSubmit`.
- Boolean props: `isLoading`, `hasError`, `canSubmit` — never bare `loading` / `error` for booleans.

## Component Shape

```tsx
type Props = {
  user: User
  onSelect: (id: string) => void
}

export function UserCard({ user, onSelect }: Props) {
  return (
    <button type="button" onClick={() => onSelect(user.id)}>
      {user.name}
    </button>
  )
}
```

- Prefer `type Props = {}` for closed prop shapes; use `interface` only when the prop type is extended via declaration merging or exported as a public extension point.
- Always destructure props in the parameter list — no `props.user` inside the body.
- Let JSX infer the return type; annotate `: JSX.Element` only when a conditional return confuses inference.

## JSX

- Self-close childless tags: `<img />`, `<UserCard user={u} />`.
- Use fragments `<>…</>` over wrapper `<div>` when no DOM element is needed.
- Conditional rendering: `{cond && <Foo />}` for booleans, ternary for either/or, early return for guards.
- Never inline multi-line logic in JSX — extract to a `const` above the return.

```tsx
const greeting = user.isAdmin ? 'Welcome, admin' : `Hello ${user.name}`
return <h1>{greeting}</h1>
```

## Server / Client Boundary (Next.js App Router, RSC)

- Default a new file to **Server Component**; add `"use client"` only when it uses state, effects, refs, browser APIs, or event handlers.
- Put `"use client"` on line 1, before imports.
- Never import a Client Component from inside a `"use server"` action file.
- Never re-export server-only code through a client module — the bundler will silently include it.

## Imports

- React imports first (`import { useState } from 'react'`), then third-party, then absolute project imports, then relative.
- Type-only imports: `import type { ReactNode } from 'react'` — don't mix runtime and type imports in one statement when `consistent-type-imports` is on.

## State

- Local first (`useState`), lift only when shared.
- Context for low-frequency cross-cutting state (theme, auth, i18n) — not high-frequency updates.
- External store (Zustand, Jotai) when state must persist across routes, sync across tabs, or be devtools-debuggable.
- Never duplicate derivable state — compute during render.

## Class Components

Forbidden in new code. Convert legacy class components to function components when touching them for non-trivial changes. (Exception: an Error Boundary still needs a class or a library wrapper — see `patterns.md`.)

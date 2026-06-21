---
origin: affaan-m/ecc
license: MIT
lang: react
concern: hooks
---
<!-- pattern from affaan-m/ecc rules/react/hooks.md -->

# React Hooks

> Covers **React hooks** (`useState`, `useEffect`, `useMemo`, `useCallback`, custom hooks) — NOT Claude Code editor hooks (see `docs/rules/web/hooks.md`). Extends `docs/rules/typescript/patterns.md`.

## Rules of Hooks

Enforce `eslint-plugin-react-hooks` with `react-hooks/rules-of-hooks: error`.

1. Hooks only at the top level of a function component or another hook.
2. Never in loops, conditionals, nested functions, or after early returns.
3. Always called in the same order on every render.
4. Only inside React function components or custom hooks (`use*`).

```tsx
// WRONG: conditional hook
function Foo({ enabled }: { enabled: boolean }) {
  if (enabled) { const [x] = useState(0) } // violation
}

// CORRECT: hook unconditional, condition inside
function Foo({ enabled }: { enabled: boolean }) {
  const [x] = useState(0)
  if (!enabled) return null
  return <span>{x}</span>
}
```

## `useEffect` — When NOT to Use

`useEffect` synchronizes with **external** systems (subscriptions, browser APIs, third-party libs). It is **not** for:

- Derived state — compute during render.
- Transforming data for rendering — compute during render.
- Resetting state when a prop changes — use a `key` on the parent or derive from props.
- Notifying parents of state changes — call the callback in the event handler.
- Initializing app-level singletons — call module-side or in entry.

```tsx
// WRONG
const [fullName, setFullName] = useState('')
useEffect(() => { setFullName(`${first} ${last}`) }, [first, last])

// CORRECT
const fullName = `${first} ${last}`
```

## Dependency Arrays

- Include every reactive value referenced inside the effect/callback.
- Enable `react-hooks/exhaustive-deps`; never silence without a comment explaining why.
- If the dep array grows unwieldy, the effect is doing too much — split it.
- Wrap a function in `useCallback` only when it is itself a dependency of another hook or passed to a memoized child.

## Cleanup

Every subscription, interval, listener, or in-flight request must clean up — missing cleanup = race conditions on dep change, leaks on unmount.

```tsx
useEffect(() => {
  const controller = new AbortController()
  fetch(url, { signal: controller.signal }).then(handleResponse)
  return () => controller.abort()
}, [url])
```

## `useMemo` / `useCallback` — When Worth It

Default: **do not memoize**. Add it only when:

1. The value is passed to a `React.memo` child as a prop and identity matters.
2. The value is a dependency of another hook.
3. The computation is measurably expensive (profile first).

Premature memoization adds noise, hides bugs, and can be slower than the recompute.

## Custom Hooks

Extract when: the same state+effect+computed sequence appears in 2+ components; the logic has a clear nameable purpose (`useDebounce`, `useOnClickOutside`); or you want to test it independently.
Do NOT extract when: it would have a single caller (inline it); or it's just `useState` with a different name (indirection, no value).

## `useState` Patterns

- Lazy init for expensive computation: `useState(() => computeInitial(prop))`.
- Functional updater when new state depends on old: `setCount(c => c + 1)` — never `setCount(count + 1)` in async/batched contexts.
- Group related state in one object only when they always change together; otherwise split.
- `useReducer` once transitions are conditional on the previous state or there are 3+ related values.

## `useRef` Patterns

- DOM refs for imperative APIs (focus, scroll, third-party libs).
- Mutable container that does not re-render (timer ids, previous values, "is mounted").
- Never read/write `ref.current` during render — only in effects or event handlers.
- `useImperativeHandle` only to expose a child API to a parent ref — last resort.

## `useSyncExternalStore`

The supported way to subscribe to any external store (browser API, third-party state lib, custom emitter) safely under concurrent rendering.

```tsx
const isOnline = useSyncExternalStore(
  (cb) => {
    window.addEventListener('online', cb)
    window.addEventListener('offline', cb)
    return () => {
      window.removeEventListener('online', cb)
      window.removeEventListener('offline', cb)
    }
  },
  () => navigator.onLine,
  () => true,
)
```

## React 19 Additions

When the project targets React 19+, prefer these over hand-rolled equivalents:

- `use()` — unwrap promises/contexts inline; usable conditionally (the only hook with that property).
- `useFormStatus()` / `useActionState()` — form submission state without prop drilling.
- `useOptimistic()` — optimistic UI while a server action is pending.
- `useTransition()` — mark non-urgent updates so urgent ones stay responsive.

## Stale Closure Trap

Async handlers and intervals capture values from the render that created them. Fix by: functional `setState` updater; putting the changing value in the dep array and rebuilding the handler; or reading from a ref kept in sync.

## Lint Configuration

```json
{ "rules": { "react-hooks/rules-of-hooks": "error", "react-hooks/exhaustive-deps": "warn" } }
```

Treat `exhaustive-deps` warnings as errors in CI for new code.

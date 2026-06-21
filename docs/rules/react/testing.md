---
origin: affaan-m/ecc
license: MIT
lang: react
concern: testing
---
<!-- pattern from affaan-m/ecc rules/react/testing.md -->

# React Testing

Component testing for the cockpit. Extends `docs/rules/typescript/testing.md`. Repo standard is **Vitest + React Testing Library** (§7).

## Library Choice

- **React Testing Library (RTL)** — standard for component testing; tests behavior through the rendered DOM.
- **Vitest** — the runner for this repo (§7). Faster than Jest, native ESM, same API.
- **Playwright Component Testing** — when a real browser engine is needed (animation, layout, complex events).

Pick one component-test runner per project — do not mix RTL + Playwright CT in the same repo.

## Core Principle

Test what the user sees and does, not implementation details. Query by accessible role first, then label, then text — `data-testid` only as a last resort. Never assert on internal state, props passed to children, or which hooks were called. Refactor-without-breaking = the test tested behavior.

## Query Priority

1. **Accessible to everyone**: `getByRole(role, { name })` (primary) · `getByLabelText` (inputs) · `getByText` (non-interactive) · `getByDisplayValue`.
2. **Semantic**: `getByAltText` (images) · `getByTitle` (last resort).
3. **Test IDs**: `getByTestId` (escape hatch only).

`getBy*` throws on no match; `queryBy*` returns null (assert absence); `findBy*` returns a promise (async).

## User Interaction

Prefer `userEvent` over `fireEvent` — it simulates real browser sequences. Always `await` it; call `userEvent.setup()` once per test.

```tsx
import userEvent from '@testing-library/user-event'

test('submits the form', async () => {
  const user = userEvent.setup()
  render(<UserForm onSubmit={handleSubmit} />)
  await user.type(screen.getByLabelText('Email'), 'user@example.com')
  await user.click(screen.getByRole('button', { name: /save/i }))
  expect(handleSubmit).toHaveBeenCalledWith({ email: 'user@example.com' })
})
```

## Async Assertions

```tsx
expect(await screen.findByText('Loaded')).toBeInTheDocument()     // async element
await waitFor(() => expect(saveSpy).toHaveBeenCalled())           // async side effect
```

Never `setTimeout` + assertion — flaky.

## Network Mocking with MSW

Use Mock Service Worker for any test crossing a network boundary — it intercepts at the network layer, so component, hooks, and fetch all behave as in production.

```tsx
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'

const server = setupServer(
  http.get('/api/users/:id', ({ params }) => HttpResponse.json({ id: params.id, name: 'Alice' })),
)
beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

Per-test override with `server.use(...)`.

## Avoid Snapshot Tests for Components

Rendered-output snapshots are brittle and rubber-stamped. Use them only for pure data serialization. For visual regression use real screenshot diffs (Playwright/Percy), not DOM diffs.

## Test Setup Helpers

Wrap providers once in `renderWithProviders` (Query client, theme, router) exported from `test-utils.tsx`.

## Custom Hook Testing

`renderHook` from RTL; wrap state-changing calls in `act`; test through the public hook API.

```tsx
const { result } = renderHook(() => useCounter())
act(() => result.current.increment())
expect(result.current.count).toBe(1)
```

## Accessibility Assertions

Run axe (`vitest-axe`) in component tests — catches missing labels, ARIA misuse, limited contrast.

```tsx
const { container } = render(<UserCard user={mockUser} />)
expect(await axe(container)).toHaveNoViolations()
```

## When to Reach for Playwright / Cypress

RTL + JSDOM cannot test real layout, scrolling/drag-drop, native animation/transitions, or cross-frame interactions. Use Playwright (CT or E2E) for those.

## Coverage Targets

| Layer | Target |
|---|---|
| Pure utilities | ≥90% |
| Custom hooks | ≥85% |
| Presentational components | ≥80% (behavior, not lines) |
| Container components | ≥70% (golden paths + error states) |
| Pages (E2E separately) | smoke test per route minimum |

## Anti-Patterns

`container.querySelector` (bypasses accessibility queries) · asserting render counts · mocking React hooks · mocking child components by default · ignoring `act()` warnings (they indicate real bugs).

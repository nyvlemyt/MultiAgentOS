---
origin: affaan-m/ecc
license: MIT
lang: typescript
concern: patterns
---
<!-- pattern from affaan-m/ecc rules/typescript/patterns.md -->

# TypeScript / JavaScript Patterns

Reusable shapes for `**/*.{ts,tsx,js,jsx}`. Apply where they fit; don't impose them on code that doesn't need them.

## API / Result Envelope

A discriminated, typed envelope for responses and for any operation that can fail without throwing (LLM calls, budget checks, sandbox diffs). Mirrors the `success`-flagged shape the worker already returns to the web layer.

```typescript
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  meta?: { total: number; page: number; limit: number }
}
```

Prefer narrowing on `success` to a true discriminated union when the caller must branch:

```typescript
type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string }
```

## Custom Hook Pattern

Co-locate state + effect + cleanup behind a named hook (see `docs/rules/react/hooks.md` for the discipline on when to extract).

```typescript
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])
  return debouncedValue
}
```

## Repository Pattern

Define a typed interface for a persistence surface so call sites depend on the contract, not on the Drizzle/SQLite specifics. Keeps the DB swappable and the domain logic testable with a mock implementation.

```typescript
interface Repository<T> {
  findAll(filters?: Filters): Promise<T[]>
  findById(id: string): Promise<T | null>
  create(data: CreateDto): Promise<T>
  update(id: string, data: UpdateDto): Promise<T>
  delete(id: string): Promise<void>
}
```

In MultiAgentOS, the Drizzle schema (`packages/db`) is the canonical store; a Repository interface is worth it when a domain package (`core`, `memory`, `tokens`) needs to be unit-tested without touching `data/mas.db`.

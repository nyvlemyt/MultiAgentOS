---
origin: affaan-m/ecc
license: MIT
lang: typescript
concern: coding-style
---
<!-- pattern from affaan-m/ecc rules/typescript/coding-style.md -->

# TypeScript / JavaScript Coding Style

Coding standard for `**/*.{ts,tsx,js,jsx}`. This is MultiAgentOS's whole stack (CLAUDE.md §2: Next.js 15 + TypeScript + Tailwind). It complements `CLAUDE.md §7` (Conventions); where they overlap, §7 wins.

## Types and Interfaces

Use types to make public APIs, shared models, and component props explicit, readable, and reusable.

### Public APIs

- Add parameter and return types to **exported** functions, shared utilities, and public class methods.
- Let TypeScript infer obvious **local** variable types — don't annotate what the compiler already knows.
- Extract repeated inline object shapes into named types or interfaces.

```typescript
// WRONG: exported function without explicit types
export function formatUser(user) {
  return `${user.firstName} ${user.lastName}`
}

// CORRECT: explicit types on the public boundary
interface User {
  firstName: string
  lastName: string
}

export function formatUser(user: User): string {
  return `${user.firstName} ${user.lastName}`
}
```

### `interface` vs `type`

- `interface` for object shapes that may be extended or implemented.
- `type` for unions, intersections, tuples, mapped types, utility types.
- Prefer string-literal unions over `enum` unless an `enum` is required for interop. In this repo, prefer unions (Drizzle/SQLite columns and SSE payloads round-trip as strings cleanly).

```typescript
type UserRole = 'admin' | 'member'
type UserWithRole = User & { role: UserRole }
```

### Avoid `any`

- No `any` in application code.
- Use `unknown` for external or untrusted input (LLM output, SSE frames, request bodies), then narrow safely.
- Use generics when a value's type depends on the caller.

```typescript
// CORRECT: unknown forces safe narrowing
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return 'Unexpected error'
}
```

### React Props

- Define props with a named `interface` or `type` (see `docs/rules/react/coding-style.md` for which to pick).
- Type callback props explicitly.
- Do not use `React.FC` unless there is a specific reason.

### JavaScript files

- In `.js` / `.jsx`, use JSDoc when types improve clarity and a TS migration is impractical. Keep JSDoc aligned with runtime behavior.

## Immutability

Use the spread operator for immutable updates; accept `Readonly<T>` where you do not mutate.

```typescript
function updateUser(user: Readonly<User>, name: string): User {
  return { ...user, name }
}
```

## Error Handling

`async/await` with `try/catch`; narrow `unknown` errors before use; never swallow.

```typescript
async function loadUser(userId: string): Promise<User> {
  try {
    return await riskyOperation(userId)
  } catch (error: unknown) {
    logger.error('Operation failed', error)
    throw new Error(getErrorMessage(error))
  }
}
```

## Input Validation

Validate external input with Zod and infer the type from the schema (single source of truth). Use `safeParse` at trust boundaries (request handlers, Server Actions, LLM JSON output) so a bad payload returns an error instead of throwing.

```typescript
import { z } from 'zod'

const userSchema = z.object({
  email: z.string().email(),
  age: z.number().int().min(0).max(150),
})
type UserInput = z.infer<typeof userSchema>
const validated: UserInput = userSchema.parse(input)
```

## No `console.log` in committed code

Use a real logger. `console.log` is acceptable only in throwaway local debugging and must never land in a commit. In this repo, worker/web logs go through the project logger, not bare `console`.

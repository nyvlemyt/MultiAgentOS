---
origin: affaan-m/ecc
license: MIT
lang: common
concern: testing
---
<!-- pattern from affaan-m/ecc rules/common/testing.md -->

# Testing Requirements (stack-agnostic)

Testing baseline for a registered project. **Where this overlaps CLAUDE.md §7, §7 wins** (§7 already mandates Vitest + `superpowers:test-driven-development` for new domain logic). The portable deltas are the coverage floor, the test-type spread, and the structure/naming conventions.

## Coverage floor: 80% (ECC default)

Three test types, all expected:

1. **Unit** — individual functions, utilities, components.
2. **Integration** — API endpoints, DB operations.
3. **E2E** — critical user flows (framework chosen per language).

## TDD loop

RED (write failing test) → GREEN (minimal implementation) → IMPROVE (refactor) → verify coverage. Fix the implementation, not the test, unless the test itself is wrong.

## Test structure — Arrange-Act-Assert

```typescript
test('calculates similarity correctly', () => {
  // Arrange
  const a = [1, 0, 0]
  const b = [0, 1, 0]
  // Act
  const similarity = cosineSimilarity(a, b)
  // Assert
  expect(similarity).toBe(0)
})
```

## Test naming — describe the behavior

```typescript
test('returns empty array when no markets match query', () => {})
test('throws error when API key is missing', () => {})
test('falls back to substring search when Redis is unavailable', () => {})
```

## Reference

- Pairs with `code-review.md` (coverage gate) and `development-workflow.md` (TDD step).

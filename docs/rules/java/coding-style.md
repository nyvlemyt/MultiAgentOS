<!-- pattern from affaan-m/ecc rules/java/coding-style.md -->
---
origin: affaan-m/ecc
license: MIT
lang: java
concern: coding-style
---
# Java Coding Style

## Formatting
- **google-java-format** or **Checkstyle** (Google/Sun style) for enforcement.
- One public top-level type per file; consistent indent (match project standard).
- Member order: constants, fields, constructors, public, protected, private.

## Immutability
- Prefer `record` for value types (Java 16+); fields `final` by default.
- Return defensive copies from public APIs (`List.copyOf()`, `Map.copyOf()`, `Set.copyOf()`).
- Copy-on-write: return new instances rather than mutating.

```java
public record OrderSummary(Long id, String customerName, BigDecimal total) {}
```

## Naming
- `PascalCase` types · `camelCase` members · `SCREAMING_SNAKE_CASE` for `static final` · packages lowercase reverse-domain.

## Modern Java
- **Records** (16+) for DTOs/value types · **sealed** hierarchies (17+) · **pattern matching** `instanceof` (16+) · **text blocks** (15+) · **switch expressions** (14+) · **pattern matching in switch** (21+).

```java
if (shape instanceof Circle c) { return Math.PI * c.radius() * c.radius(); }

String label = switch (status) {
    case ACTIVE -> "Active";
    case SUSPENDED -> "Suspended";
    case CLOSED -> "Closed";
};
```

## Optional
- Return `Optional<T>` from finders that may have no result; chain `map`/`flatMap`/`orElseThrow`.
- Never call `get()` without `isPresent()`; never use `Optional` as a field or parameter.

## Error Handling
- Prefer unchecked domain exceptions extending `RuntimeException`; include context in messages.
- Avoid broad `catch (Exception e)` except at top-level handlers.

## Streams
- Keep pipelines short (3–4 ops); method references when readable; no side effects.
- For complex logic, prefer a loop over a convoluted pipeline.

## Verification
- [ ] Formatter/Checkstyle clean; one public type per file.
- [ ] Value types are `record`s; fields `final`; public getters return defensive copies.
- [ ] No `Optional.get()` without guard; no `Optional` field/param.

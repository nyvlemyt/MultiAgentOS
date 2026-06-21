<!-- pattern from affaan-m/ecc rules/fsharp/coding-style.md -->
---
origin: affaan-m/ecc
license: MIT
lang: fsharp
concern: coding-style
---
# F# Coding Style

Reference doc for writing idiomatic F#. Leverage the type system for correctness; immutability by default.

## Types and Models
- Discriminated unions for domain modeling over class hierarchies.
- Records for data with named fields; single-case unions as type-safe wrappers around primitives.
- Avoid classes unless interop or mutable state requires them.

```fsharp
type EmailAddress = EmailAddress of string

type OrderStatus =
    | Pending
    | Confirmed of confirmedAt: DateTimeOffset
    | Shipped of trackingNumber: string
    | Cancelled of reason: string
```

## Immutability
- Records are immutable; use `with` expressions to update.
- Prefer `list`/`map`/`set` over mutable collections; avoid `ref` cells and mutable fields in domain logic.
- `mutable` only when justified by a measured performance need.

```fsharp
let rename (profile: UserProfile) newName = { profile with Name = newName }
```

## Function Style
- Small, composable functions over large methods.
- Pipe operator `|>` to build readable pipelines; pattern matching over if/else chains.
- `Option` instead of null; `Result` for operations that can fail.

```fsharp
let processOrder order =
    order
    |> validateItems
    |> Result.bind calculateTotal
    |> Result.map applyDiscount
    |> Result.mapError OrderError
```

## Async and Error Handling
- `task { }` for .NET async interop; `async { }` for F#-native workflows.
- Propagate `CancellationToken` through public async APIs.
- Railway-oriented `Result` over exceptions for *expected* failures.

## Formatting
- `fantomas` for automatic formatting; significant whitespace, no unnecessary parentheses; remove unused `open`.
- Group `open` into four lexically-sorted sections separated by blank lines: `System.*`, `Microsoft.*`, third-party, first-party.

## Verification
- [ ] `fantomas --check` clean; no unused `open`.
- [ ] No null in domain code (`Option`/`Result` instead); no `mutable` without a perf justification.
- [ ] Domain states modeled as DUs/records, not class hierarchies.

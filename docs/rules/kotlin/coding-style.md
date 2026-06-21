<!-- pattern from affaan-m/ecc rules/kotlin/coding-style.md -->
---
origin: affaan-m/ecc
license: MIT
lang: kotlin
concern: coding-style
---
# Kotlin Coding Style

## Formatting
- **ktlint** or **Detekt**; official code style (`kotlin.code.style=official` in `gradle.properties`).

## Immutability
- Prefer `val` over `var`; `data class` for value types; immutable collections in public APIs.
- Copy-on-write state updates: `state.copy(field = newValue)`.

## Naming
- `camelCase` functions/properties · `PascalCase` types/objects/type-aliases · `SCREAMING_SNAKE_CASE` constants.
- Name interfaces by behavior, not `I`: `Clickable` not `IClickable`.

## Null Safety
- Never `!!`. Prefer `?.`, `?:`, `requireNotNull()`, `checkNotNull()`; `?.let {}` for scoped null-safe ops.

```kotlin
val name = user?.name ?: "Unknown"
```

## Sealed Types
Model closed state hierarchies; always use exhaustive `when` (no `else`).

```kotlin
sealed interface UiState<out T> {
    data object Loading : UiState<Nothing>
    data class Success<T>(val data: T) : UiState<T>
    data class Error(val message: String) : UiState<Nothing>
}
```

## Extension & Scope Functions
- Extensions in files named for the receiver (`StringExt.kt`); avoid extending `Any`.
- Right scope fn: `let` (null+transform) · `run` (compute) · `apply` (configure) · `also` (side effects). Max 2 nesting levels.

## Error Handling
- `Result<T>` or sealed types; `runCatching {}` to wrap throwables.
- Never catch `CancellationException` — always rethrow. Avoid try/catch for control flow.

## Verification
- [ ] ktlint/Detekt clean; `val`-first; no `!!`.
- [ ] `when` over sealed types is exhaustive without `else`.
- [ ] No try/catch used for control flow; `CancellationException` never swallowed.

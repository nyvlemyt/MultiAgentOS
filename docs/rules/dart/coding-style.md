<!-- pattern from affaan-m/ecc rules/dart/coding-style.md -->
---
origin: affaan-m/ecc
license: MIT
lang: dart
concern: coding-style
---
# Dart/Flutter Coding Style

Modern Dart 3+ / Flutter baseline, null-safety-first.

## Formatting
- `dart format` for all `.dart` files, enforced in CI (`dart format --set-exit-if-changed .`). 80-char lines. Trailing commas on multi-line argument/parameter lists for cleaner diffs.

## Immutability
- Prefer `final` for locals, `const` for compile-time constants and constructors where all fields are `final`.
- Return unmodifiable collections from public APIs (`List.unmodifiable`, `Map.unmodifiable`). Use `copyWith()` for state mutations on immutable classes.

## Naming
`camelCase` (variables, params, named constructors) · `PascalCase` (classes, enums, typedefs, extensions) · `snake_case` (files, libraries) · `SCREAMING_SNAKE_CASE` (top-level `const`). Prefix private members with `_`. Extension names describe the type they extend (`StringExtensions`).

## Null Safety
- Avoid `!` — prefer `?.`, `??`, `if (x != null)`, or Dart 3 pattern matching. Reserve `!` only where null is a programming error and crashing is correct.
- Avoid `late` unless init is guaranteed before first use. Use `required` for must-provide constructor params.

```dart
final name = user?.name ?? 'Unknown';
final name = switch (user) { User(:final name) => name, null => 'Unknown' };
```

## Sealed Types & Pattern Matching (Dart 3+)
Model closed state hierarchies with `sealed` classes; use exhaustive `switch` (no default/wildcard).

```dart
sealed class AsyncState<T> { const AsyncState(); }
final class Loading<T> extends AsyncState<T> { const Loading(); }
final class Success<T> extends AsyncState<T> { const Success(this.data); final T data; }
final class Failure<T> extends AsyncState<T> { const Failure(this.error); final Object error; }

return switch (state) {
  Loading() => const CircularProgressIndicator(),
  Success(:final data) => DataWidget(data),
  Failure(:final error) => ErrorWidget(error.toString()),
};
```

## Error Handling
- Specify exception types in `on` clauses — never bare `catch (e)`. Never catch `Error` subtypes (programming bugs).
- Use `Result`-style types or sealed classes for recoverable errors; don't use exceptions for control flow.

## Async / Futures
- Always `await` Futures or call `unawaited()` to mark intentional fire-and-forget. Never mark a function `async` if it never `await`s.
- `Future.wait` / `Future.any` for concurrency. Check `context.mounted` before using `BuildContext` after any `await` (Flutter 3.7+).

## Imports
`package:` imports throughout — never relative (`../`) for cross-feature/cross-layer. Order: `dart:` → external `package:` → internal `package:`. No unused imports (`dart analyze` enforces).

## Code Generation
Generated files (`.g.dart`, `.freezed.dart`, `.gr.dart`) — commit or gitignore consistently per project; never edit by hand. Keep generator annotations (`@JsonSerializable`, `@freezed`, `@riverpod`) on the canonical source file only.

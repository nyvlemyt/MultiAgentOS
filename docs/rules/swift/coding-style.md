---
origin: affaan-m/ecc
license: MIT
lang: swift
concern: coding-style
---
<!-- pattern from affaan-m/ecc rules/swift/coding-style.md -->

# Swift — Coding Style (reference)

## Formatting

- **SwiftFormat** for auto-formatting, **SwiftLint** for style enforcement.
- `swift-format` is bundled with Xcode 16+ as an alternative.

## Immutability

- Prefer `let` over `var` — define everything as `let` and only switch to `var` if the compiler requires it.
- Use `struct` with value semantics by default; use `class` only when identity or reference semantics are needed.

## Naming

Follow the Apple API Design Guidelines:

- Clarity at the point of use — omit needless words.
- Name methods and properties for their roles, not their types.
- Use `static let` for constants over global constants.

## Error handling

Use typed throws (Swift 6+) and pattern matching:

```swift
func load(id: String) throws(LoadError) -> Item {
    guard let data = try? read(from: path) else {
        throw .fileNotFound(id)
    }
    return try decode(data)
}
```

## Concurrency

Enable Swift 6 strict concurrency checking. Prefer:

- `Sendable` value types for data crossing isolation boundaries.
- Actors for shared mutable state.
- Structured concurrency (`async let`, `TaskGroup`) over unstructured `Task {}`.

## See also

- `docs/rules/swift/patterns.md` for protocol-oriented design and the actor pattern.

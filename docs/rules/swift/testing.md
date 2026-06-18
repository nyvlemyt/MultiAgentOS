---
origin: affaan-m/ecc
license: MIT
lang: swift
concern: testing
---
<!-- pattern from affaan-m/ecc rules/swift/testing.md -->

# Swift — Testing (reference)

## Framework

Use **Swift Testing** (`import Testing`) for new tests. Use `@Test` and `#expect`:

```swift
@Test("User creation validates email")
func userCreationValidatesEmail() throws {
    #expect(throws: ValidationError.invalidEmail) {
        try User(email: "not-an-email")
    }
}
```

## Test isolation

Each test gets a fresh instance — set up in `init`, tear down in `deinit`. No shared mutable state between tests.

## Parameterized tests

```swift
@Test("Validates formats", arguments: ["json", "xml", "csv"])
func validatesFormat(format: String) throws {
    let parser = try Parser(format: format)
    #expect(parser.isValid)
}
```

## Coverage

```bash
swift test --enable-code-coverage
```

## See also

- `superpowers:test-driven-development` for the RED → GREEN → REFACTOR loop (MAOS §7).

---
origin: affaan-m/ecc
license: MIT
lang: rust
concern: testing
---
<!-- pattern from affaan-m/ecc rules/rust/testing.md -->

# Rust — Testing (reference)

## Test framework

- **`#[test]`** with `#[cfg(test)]` modules for unit tests.
- **rstest** for parameterized tests and fixtures.
- **proptest** for property-based testing.
- **mockall** for trait-based mocking.
- **`#[tokio::test]`** for async tests.

## Test organization

- Unit tests inside `#[cfg(test)]` modules in the same file.
- Integration tests in `tests/` (each file = a separate binary); shared helpers in `tests/common/`.
- Criterion benchmarks in `benches/`.

## Unit test pattern

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn creates_user_with_valid_email() {
        let user = User::new("Alice", "alice@example.com").unwrap();
        assert_eq!(user.name, "Alice");
    }
}
```

## Parameterized tests

```rust
use rstest::rstest;

#[rstest]
#[case("hello", 5)]
#[case("", 0)]
fn test_string_length(#[case] input: &str, #[case] expected: usize) {
    assert_eq!(input.len(), expected);
}
```

## Async tests

Use `#[tokio::test]` with an async test client.

## Mocking with mockall

Define traits in production code (`pub` so integration tests can import them); generate mocks with `mockall::mock!` in test modules.

## Test naming

Descriptive scenario names: `creates_user_with_valid_email()`, `rejects_order_when_insufficient_stock()`, `returns_none_when_not_found()`.

## Coverage

- Target 80%+ line coverage with **cargo-llvm-cov**.
- Focus on business logic — exclude generated code and FFI bindings.

```bash
cargo llvm-cov --fail-under-lines 80
```

## Commands

```bash
cargo test                 # all tests
cargo test -- --nocapture  # show println output
cargo test --lib           # unit tests only
cargo test --doc           # doc tests only
```

## See also

- `superpowers:test-driven-development` for the RED → GREEN → REFACTOR loop (MAOS §7).

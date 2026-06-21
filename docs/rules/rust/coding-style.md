---
origin: affaan-m/ecc
license: MIT
lang: rust
concern: coding-style
---
<!-- pattern from affaan-m/ecc rules/rust/coding-style.md -->

# Rust — Coding Style (reference)

## Formatting

- **rustfmt** — always run `cargo fmt` before committing.
- **clippy** — `cargo clippy -- -D warnings` (treat warnings as errors).
- 4-space indent, max line width 100 (rustfmt defaults).

## Immutability

Rust variables are immutable by default — embrace this:

- Use `let` by default; only use `let mut` when mutation is required.
- Prefer returning new values over mutating in place.
- Use `Cow<'_, T>` when a function may or may not need to allocate.

```rust
use std::borrow::Cow;

// GOOD — immutable by default, new value returned
fn normalize(input: &str) -> Cow<'_, str> {
    if input.contains(' ') {
        Cow::Owned(input.replace(' ', "_"))
    } else {
        Cow::Borrowed(input)
    }
}
```

## Naming

- `snake_case` for functions, methods, variables, modules, crates.
- `PascalCase` for types, traits, enums, type parameters.
- `SCREAMING_SNAKE_CASE` for constants and statics.
- Lifetimes: short lowercase (`'a`, `'de`) — descriptive for complex cases (`'input`).

## Ownership and borrowing

- Borrow (`&T`) by default; take ownership only when you need to store or consume.
- Never clone to satisfy the borrow checker without understanding the root cause.
- Accept `&str` over `String`, `&[T]` over `Vec<T>` in function parameters.
- Use `impl Into<String>` for constructors that need to own a `String`.

## Error handling

- Use `Result<T, E>` and `?` for propagation — never `unwrap()` in production code.
- **Libraries**: define typed errors with `thiserror`.
- **Applications**: use `anyhow` for flexible error context.
- Add context with `.with_context(|| format!("failed to ..."))?`.
- Reserve `unwrap()` / `expect()` for tests and truly unreachable states.

```rust
#[derive(Debug, thiserror::Error)]
pub enum ConfigError {
    #[error("failed to read config: {0}")]
    Io(#[from] std::io::Error),
    #[error("invalid config format: {0}")]
    Parse(String),
}
```

## Iterators over loops

Prefer iterator chains for transformations; use loops for complex control flow with early returns.

## Module organization

Organize by domain, not by type (`auth/`, `orders/`, `db/` — each a module directory).

## Visibility

- Default to private; use `pub(crate)` for internal sharing.
- Only mark `pub` what is part of the crate's public API. Re-export from `lib.rs`.

## See also

- `docs/rules/rust/patterns.md` for repository/service/newtype/builder patterns.

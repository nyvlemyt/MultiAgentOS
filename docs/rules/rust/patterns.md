---
origin: affaan-m/ecc
license: MIT
lang: rust
concern: patterns
---
<!-- pattern from affaan-m/ecc rules/rust/patterns.md -->

# Rust — Patterns (reference)

## Repository pattern with traits

Encapsulate data access behind a trait; concrete impls handle storage (Postgres, SQLite, in-memory for tests).

```rust
pub trait OrderRepository: Send + Sync {
    fn find_by_id(&self, id: u64) -> Result<Option<Order>, StorageError>;
    fn save(&self, order: &Order) -> Result<Order, StorageError>;
}
```

## Service layer

Business logic in service structs; inject dependencies via constructor:

```rust
pub struct OrderService {
    repo: Box<dyn OrderRepository>,
}

impl OrderService {
    pub fn new(repo: Box<dyn OrderRepository>) -> Self {
        Self { repo }
    }
}
```

## Newtype pattern for type safety

Prevent argument mix-ups with distinct wrapper types (`struct UserId(u64); struct OrderId(u64);`).

## Enum state machines

Model states as enums — make illegal states unrepresentable. Match exhaustively; no wildcard `_` for business-critical enums.

```rust
enum ConnectionState {
    Disconnected,
    Connecting { attempt: u32 },
    Connected { session_id: String },
    Failed { reason: String, retries: u32 },
}
```

## Builder pattern

Use for structs with many optional parameters; a `*Builder` with chained setters and a `build()`.

## Sealed traits

Use a private module to seal a trait, preventing external implementations:

```rust
mod private {
    pub trait Sealed {}
}

pub trait Format: private::Sealed {
    fn encode(&self, data: &[u8]) -> Vec<u8>;
}
```

## API response envelope

Consistent responses via a tagged generic enum:

```rust
#[derive(Debug, serde::Serialize)]
#[serde(tag = "status")]
pub enum ApiResponse<T: serde::Serialize> {
    #[serde(rename = "ok")]
    Ok { data: T },
    #[serde(rename = "error")]
    Error { message: String },
}
```

## See also

- `docs/rules/rust/coding-style.md` (ownership/error handling), `docs/rules/rust/security.md`.

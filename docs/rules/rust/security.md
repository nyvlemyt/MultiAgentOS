---
origin: affaan-m/ecc
license: MIT
lang: rust
concern: security
---
<!-- pattern from affaan-m/ecc rules/rust/security.md -->

# Rust — Security (reference)

Aligns with MultiAgentOS §11 (secrets never committed; `.env*` gitignored). Route secret/auth/`unsafe` edits through `mas-sec-reviewer` (§5).

## Secrets management

- Never hardcode API keys, tokens, or credentials in source code.
- Use environment variables and fail fast if a required secret is missing at startup.
- Keep `.env` files in `.gitignore`.

```rust
// GOOD — environment variable with early validation
fn load_api_key() -> anyhow::Result<String> {
    std::env::var("PAYMENT_API_KEY")
        .context("PAYMENT_API_KEY must be set")
}
```

## SQL injection prevention

- Always use parameterized queries — never format user input into SQL strings.
- Use a query builder or ORM (sqlx, diesel, sea-orm) with bind parameters.

```rust
// GOOD — parameterized query with sqlx
// Placeholder syntax varies: Postgres $1 | MySQL ? | SQLite $1
sqlx::query("SELECT * FROM users WHERE name = $1")
    .bind(&name)
    .fetch_one(&pool)
    .await?;
```

## Input validation

- Validate user input at system boundaries before processing.
- Use the type system to enforce invariants (newtype pattern).
- Parse, don't validate — convert unstructured data into typed structs at the boundary.

## Unsafe code

- Minimize `unsafe` blocks — prefer safe abstractions.
- Every `unsafe` block must carry a `// SAFETY:` comment explaining the invariant.
- Never use `unsafe` to bypass the borrow checker for convenience.
- Audit all `unsafe` during review — a red flag without justification.

## Dependency security

```bash
cargo audit            # known CVEs
cargo deny check       # licenses + advisories + duplicates
cargo tree -d          # transitive duplicates
```

Minimize dependency count; evaluate before adding crates. Keep deps updated (Dependabot/Renovate).

## Error messages

- Never expose internal paths, stack traces, or database errors in API responses.
- Log detailed errors server-side (`tracing`/`log`); return generic messages to clients.

## See also

- `docs/rules/rust/patterns.md` (newtype, enum states), `config/permissions.json`.

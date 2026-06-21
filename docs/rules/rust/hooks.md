---
origin: affaan-m/ecc
license: MIT
lang: rust
concern: hooks
---
<!-- pattern from affaan-m/ecc rules/rust/hooks.md -->

# Rust — Editor / CI Hooks (reference)

PostToolUse-style automation for a Rust project. In MultiAgentOS these run after an agent edits a `.rs` file; they do not replace the §7 five-check verification.

## PostToolUse hooks

- **cargo fmt** — auto-format `.rs` files after edit.
- **cargo clippy** — run lint checks after editing Rust files.
- **cargo check** — verify compilation after changes (faster than `cargo build`).

## See also

- `docs/rules/rust/testing.md`, `docs/rules/rust/security.md`.

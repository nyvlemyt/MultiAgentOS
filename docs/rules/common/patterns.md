---
origin: affaan-m/ecc
license: MIT
lang: common
concern: patterns
---
<!-- pattern from affaan-m/ecc rules/common/patterns.md -->

# Common Patterns (stack-agnostic)

Reusable design patterns for a registered project. The per-language packs (`docs/rules/<lang>/patterns.md`) extend this.

## Start from a proven skeleton

When implementing new functionality, search for a battle-tested skeleton/template first (echoes `development-workflow.md` §0 and CLAUDE.md §9.bis). Evaluate candidates on security, extensibility, and relevance, then iterate inside the proven structure rather than from a blank file.

## Repository pattern

Encapsulate data access behind a consistent interface:

- Standard operations: `findAll`, `findById`, `create`, `update`, `delete`.
- Concrete implementations handle storage details (DB, API, file).
- Business logic depends on the abstract interface, not the storage mechanism.
- Enables swapping data sources and simplifies testing with mocks.

## API response envelope

Use one consistent envelope for all API responses:

- A success/status indicator.
- The data payload (nullable on error).
- An error-message field (nullable on success).
- Metadata for paginated responses (`total`, `page`, `limit`).

## Reference

- Pairs with `coding-style.md` (immutability, DRY) and the per-language packs.

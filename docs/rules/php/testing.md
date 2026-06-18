---
origin: affaan-m/ecc
license: MIT
lang: php
concern: testing
---
<!-- pattern from affaan-m/ecc rules/php/testing.md -->

# PHP — Testing (reference)

## Framework

Use **PHPUnit** by default. If **Pest** is configured, prefer Pest for new tests and avoid mixing frameworks.

## Coverage

```bash
vendor/bin/phpunit --coverage-text
# or
vendor/bin/pest --coverage
```

Prefer **pcov** or **Xdebug** in CI, and keep coverage thresholds in CI rather than as tribal knowledge.

## Test organization

- Separate fast unit tests from framework/database integration tests.
- Use factories/builders for fixtures instead of large hand-written arrays.
- Keep HTTP/controller tests focused on transport and validation; move business rules into service-level tests.

## Inertia

If the project uses Inertia.js, prefer `assertInertia` with `AssertableInertia` to verify component names and props instead of raw JSON assertions.

## See also

- `superpowers:test-driven-development` for the RED → GREEN → REFACTOR loop (MAOS §7 default for new domain logic).

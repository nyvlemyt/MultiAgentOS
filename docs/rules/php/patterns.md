---
origin: affaan-m/ecc
license: MIT
lang: php
concern: patterns
---
<!-- pattern from affaan-m/ecc rules/php/patterns.md -->

# PHP — Architecture Patterns (reference)

## Thin controllers, explicit services

- Keep controllers focused on transport: auth, validation, serialization, status codes.
- Move business rules into application/domain services that test without HTTP bootstrapping.

## DTOs and value objects

- Replace shape-heavy associative arrays with DTOs for requests, commands, and external API payloads.
- Use value objects for money, identifiers, date ranges, and other constrained concepts.

## Dependency injection

- Depend on interfaces or narrow service contracts, not framework globals.
- Pass collaborators through constructors so services are testable without service-locator lookups.

## Boundaries

- Isolate ORM models from domain decisions when the model layer is doing more than persistence.
- Wrap third-party SDKs behind small adapters so the codebase depends on your contract, not theirs.

## See also

- `docs/rules/php/coding-style.md` for type/error conventions.

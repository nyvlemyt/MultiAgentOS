---
origin: affaan-m/ecc
license: MIT
lang: php
concern: coding-style
---
<!-- pattern from affaan-m/ecc rules/php/coding-style.md -->

# PHP — Coding Style (reference)

Arsenal reference for PHP work driven from MultiAgentOS. Applies when an agent edits a registered project whose stack is PHP/Laravel.

## Standards

- Follow **PSR-12** formatting and naming conventions.
- Put `declare(strict_types=1);` at the top of application code.
- Use scalar type hints, return types, and typed properties everywhere new code permits.

## Immutability

- Prefer immutable DTOs and value objects for data crossing service boundaries.
- Use `readonly` properties (PHP 8.1+) or immutable constructors for request/response payloads.
- Keep arrays for simple maps; promote business-critical structures into explicit classes.

## Formatting & static analysis

- Format with **Laravel Pint** or **PHP-CS-Fixer**.
- Run **PHPStan** or **Psalm** for static analysis; keep the level checked in.
- Keep Composer scripts checked in so the same commands run locally and in CI.

## Imports

- Add `use` statements for all referenced classes, interfaces, and traits.
- Avoid the global namespace unless the project explicitly prefers fully qualified names.

## Error handling

- Throw exceptions for exceptional states; do not return `false`/`null` as hidden error channels in new code.
- Convert framework/request input into validated DTOs before it reaches domain logic.

## See also

- `docs/rules/php/patterns.md` — service/repository layering.

---
origin: affaan-m/ecc
license: MIT
lang: php
concern: hooks
---
<!-- pattern from affaan-m/ecc rules/php/hooks.md -->

# PHP — Editor / CI Hooks (reference)

PostToolUse-style automation to wire for a PHP project. In MultiAgentOS these run as project-local checks after an agent edits a `.php` file; they do not replace the §7 five-check verification.

## PostToolUse hooks

- **Pint / PHP-CS-Fixer** — auto-format edited `.php` files.
- **PHPStan / Psalm** — run static analysis after PHP edits in typed codebases.
- **PHPUnit / Pest** — run targeted tests for touched files/modules when edits affect behavior.

## Warnings (flag, do not auto-fix)

- Warn on `var_dump`, `dd`, `dump`, or `die()` left in edited files.
- Warn when edited PHP files add raw SQL or disable CSRF/session protections.

## See also

- `docs/rules/php/testing.md`, `docs/rules/php/security.md`.

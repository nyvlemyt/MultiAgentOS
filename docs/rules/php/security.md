---
origin: affaan-m/ecc
license: MIT
lang: php
concern: security
---
<!-- pattern from affaan-m/ecc rules/php/security.md -->

# PHP — Security (reference)

Aligns with MultiAgentOS §5 (risky actions gated) and §11 (secrets never committed). Any agent edit that touches auth, raw SQL, or secrets in a PHP project is security-sensitive and should route through `mas-sec-reviewer`.

## Input and output

- Validate request input at the framework boundary (`FormRequest`, Symfony Validator, or explicit DTO validation).
- Escape output in templates by default; treat raw HTML rendering as a justified exception.
- Never trust query params, cookies, headers, or uploaded file metadata without validation.

## Database safety

- Use prepared statements (`PDO`, Doctrine, Eloquent query builder) for all dynamic queries.
- Avoid string-building SQL in controllers/views.
- Scope ORM mass-assignment carefully and whitelist writable fields.

## Secrets and dependencies

- Load secrets from environment variables or a secret manager, never from committed config files (MAOS §11: `.env*` stays gitignored).
- Run `composer audit` in CI and review new package maintainer trust before adding dependencies.
- Pin major versions deliberately and remove abandoned packages quickly.

## Auth and session safety

- Use `password_hash()` / `password_verify()` for password storage.
- Regenerate session identifiers after authentication and privilege changes.
- Enforce CSRF protection on state-changing web requests.

## See also

- `docs/rules/php/hooks.md` (Brakeman-equivalent warnings), `config/permissions.json` (risky-action categories).

---
origin: affaan-m/ecc
license: MIT
lang: ruby
concern: patterns
---
<!-- pattern from affaan-m/ecc rules/ruby/patterns.md -->

# Ruby / Rails — Patterns (reference)

## Rails way first

- Start with plain Rails MVC and Active Record conventions for small/medium features.
- Introduce service objects, query objects, form objects, decorators, or presenters when the model/controller boundary carries multiple responsibilities.
- Name extracted objects after the business operation they perform, not after generic layers like `Manager` or `Processor`.

## Persistence

- Prefer PostgreSQL for multi-host production Rails apps unless the platform has a clear reason for MySQL or SQLite.
- Treat Rails 8 SQLite-backed defaults as viable for single-host or modest deployments, not an automatic fit for shared multi-service systems.
- Keep raw SQL behind query objects or model scopes and parameterize every dynamic value.

## Background jobs and runtime services

- Use **Solid Queue** for greenfield Rails 8 apps with modest throughput and simple deployment.
- Use **Sidekiq** when the app needs mature observability, high throughput, existing Redis infrastructure, or Pro/Enterprise features.
- Use **Solid Cache** and **Solid Cable** when their deployment model matches; use Redis for cross-service behavior, high fanout, or advanced data structures.

## Frontend

- Prefer **Hotwire** (Turbo, Stimulus, Importmap, Propshaft) for server-rendered Rails apps.
- Use React, Vue, Inertia.js, or a separate SPA when interaction complexity or product architecture justifies the client surface.
- Keep view components, partials, and presenters focused on rendering; keep persistence and authorization out of templates.

## Authentication

- Use the Rails 8 authentication generator for straightforward session auth and password reset.
- Use Devise or another established system for OAuth, MFA, confirmable/lockable flows, multi-model auth, or a large existing Devise footprint.

## See also

- `docs/rules/ruby/security.md`, `docs/rules/ruby/testing.md`.

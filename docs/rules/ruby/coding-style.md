---
origin: affaan-m/ecc
license: MIT
lang: ruby
concern: coding-style
---
<!-- pattern from affaan-m/ecc rules/ruby/coding-style.md -->

# Ruby / Rails — Coding Style (reference)

## Standards

- Target **Ruby 3.3+** for new Rails work unless the project pins an older supported runtime.
- Enable **YJIT** in production only after measuring boot time, memory, and request/job throughput.
- Add `# frozen_string_literal: true` to new files when the project uses that convention.
- Prefer clear Ruby over clever metaprogramming; isolate DSL-heavy code behind narrow, tested boundaries.

## Formatting and linting

- Use the project's checked-in RuboCop config. For Rails 8+ apps, start from `rubocop-rails-omakase` and customize only where the codebase has a real convention.

```bash
bundle exec rubocop
bundle exec rubocop -A
```

- Do not silence cops inline unless the exception is narrow, documented, and hard to express cleanly in code.

## Rails style

- Follow Rails naming and directory conventions before adding custom structure.
- Keep controllers transport-focused: authentication, authorization, parameter handling, response shape.
- Put reusable domain behavior in models, concerns, service objects, query objects, or form objects based on actual complexity, not default ceremony.
- Prefer `bin/rails`, `bin/rake`, and checked-in binstubs over globally installed commands.

## Error handling

- Rescue specific exceptions. Avoid broad `rescue StandardError` unless it re-raises or preserves enough context for operators.
- Use `ActiveSupport::Notifications` or the app logger for operational events; do not leave `puts`, `pp`, or `debugger` in committed code.

## See also

- `docs/rules/ruby/patterns.md` for service/repository layering.

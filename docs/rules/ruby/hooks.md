---
origin: affaan-m/ecc
license: MIT
lang: ruby
concern: hooks
---
<!-- pattern from affaan-m/ecc rules/ruby/hooks.md -->

# Ruby / Rails — Editor / CI Hooks (reference)

Project-local hooks for a Ruby project, preferring binstubs and checked-in tooling. In MultiAgentOS these run after an agent edits a Ruby file; they do not replace the §7 five-check verification.

## PostToolUse hooks

- **RuboCop** — run `bundle exec rubocop -A <file>` or the project's safer formatter command after Ruby edits.
- **Brakeman** — run `bundle exec brakeman --no-progress` after security-sensitive Rails changes.
- **Tests** — run the narrowest matching `bin/rails test ...` or `bundle exec rspec ...` for touched files.
- **Bundler audit** — run `bundle exec bundle-audit check --update` when `Gemfile`/`Gemfile.lock` changes and bundler-audit is installed.

## Warnings (flag, do not auto-fix)

- Warn on committed `debugger`, `binding.irb`, `binding.pry`, `puts`, `pp`, or `p` calls in application code.
- Warn when an edit disables CSRF, expands mass-assignment, or adds raw SQL without parameterization.
- Warn when a migration changes data destructively without a reversible path or documented rollout plan (cf. MAOS §5: destructive ops gate).

## CI gate suggestions

```bash
bundle exec rubocop
bundle exec brakeman --no-progress
bin/rails test
bundle exec rspec
```

Use only commands present in the project; do not install new hook dependencies without maintainer approval.

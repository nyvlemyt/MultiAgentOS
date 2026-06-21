<!-- pattern from affaan-m/ecc rules/perl/hooks.md -->
---
origin: affaan-m/ecc
license: MIT
lang: perl
concern: hooks
---
# Perl Hooks

Claude Code automation hooks for Perl work, configured in `~/.claude/settings.json`.

## PostToolUse
- **perltidy** — auto-format `.pl`/`.pm` files after edit.
- **perlcritic** — lint check after editing `.pm` files.

## Warnings
- Warn about `print` in non-script `.pm` files — use `say` or a logging module (e.g. `Log::Any`).

## Verification
- [ ] perltidy + perlcritic hooks fire on Perl edits.
- [ ] A guard flags `print` in `.pm` modules.

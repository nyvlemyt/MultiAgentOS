---
origin: affaan-m/ecc
license: MIT
lang: python
concern: hooks
---
<!-- pattern from affaan-m/ecc rules/python/hooks.md -->

# Python — Editor / CI Hooks (reference)

PostToolUse-style automation for a Python project. In MultiAgentOS these run as project-local checks after an agent edits a `.py` file; they do not replace the §7 five-check verification.

## PostToolUse hooks

- **black / ruff** — auto-format `.py` files after edit.
- **mypy / pyright** — run type checking after editing `.py` files.

## Warnings (flag, do not auto-fix)

- Warn about `print()` statements in edited files (use the `logging` module instead).

## See also

- `docs/rules/python/testing.md`, `docs/rules/python/security.md`.

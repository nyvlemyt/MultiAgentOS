---
origin: affaan-m/ecc
license: MIT
lang: swift
concern: hooks
---
<!-- pattern from affaan-m/ecc rules/swift/hooks.md -->

# Swift — Editor / CI Hooks (reference)

PostToolUse-style automation for a Swift project. In MultiAgentOS these run after an agent edits a `.swift` file; they do not replace the §7 five-check verification.

## PostToolUse hooks

- **SwiftFormat** — auto-format `.swift` files after edit.
- **SwiftLint** — run lint checks after editing `.swift` files.
- **swift build** — type-check modified packages after edit.

## Warning (flag, do not auto-fix)

- Flag `print()` statements — use `os.Logger` or structured logging for production code.

## See also

- `docs/rules/swift/testing.md`, `docs/rules/swift/security.md`.

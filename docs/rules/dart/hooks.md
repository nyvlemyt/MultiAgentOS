<!-- pattern from affaan-m/ecc rules/dart/hooks.md -->
---
origin: affaan-m/ecc
license: MIT
lang: dart
concern: hooks
---
# Dart/Flutter Editor/Agent Hooks

Suggested automation hooks when an agent edits Dart source (harness settings).

## PostToolUse
- **`dart format`** — auto-format `.dart` files after edit.
- **`dart analyze`** — static analysis after edit, surface warnings.
- **`flutter test`** — optionally run affected tests after significant changes.

Example matcher: `PostToolUse` on `Edit` of `**/*.dart` → `dart format $CLAUDE_FILE_PATHS`.

## Pre-commit Checks
```bash
dart format --set-exit-if-changed .
dart analyze --fatal-infos
flutter test
```

## Useful One-liners
```bash
dart format .
dart analyze
flutter test --coverage
dart run build_runner build --delete-conflicting-outputs   # regenerate code-gen
flutter pub outdated
flutter pub upgrade
```

> Scope hooks to the active project's path only (MultiAgentOS §5 cross-project guard).

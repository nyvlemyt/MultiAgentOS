<!-- pattern from affaan-m/ecc rules/kotlin/hooks.md -->
---
origin: affaan-m/ecc
license: MIT
lang: kotlin
concern: hooks
---
# Kotlin Hooks

Claude Code automation hooks for Kotlin work, configured in `~/.claude/settings.json`.

## PostToolUse
- **ktfmt/ktlint** — auto-format `.kt`/`.kts` files after edit.
- **detekt** — static analysis after editing Kotlin files.
- **./gradlew build** — verify compilation after changes.

## Verification
- [ ] Format + detekt hooks fire on `.kt`/`.kts` edits.
- [ ] Gradle build hook runs after Kotlin changes.

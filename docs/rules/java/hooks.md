<!-- pattern from affaan-m/ecc rules/java/hooks.md -->
---
origin: affaan-m/ecc
license: MIT
lang: java
concern: hooks
---
# Java Hooks

Claude Code automation hooks for Java work, configured in `~/.claude/settings.json`.

## PostToolUse
- **google-java-format** — auto-format `.java` files after edit.
- **checkstyle** — style checks after editing Java files.
- **./mvnw compile** or **./gradlew compileJava** — verify compilation after changes.

## Verification
- [ ] Format + checkstyle hooks fire on `.java` edits.
- [ ] Compile hook runs after Java changes.

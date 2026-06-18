<!-- pattern from affaan-m/ecc rules/angular/hooks.md -->
---
origin: affaan-m/ecc
license: MIT
lang: angular
concern: hooks
---
# Angular Editor/Agent Hooks

Suggested automation hooks when an agent edits Angular source. Configure in the harness settings (`~/.claude/settings.json`).

## PostToolUse
- **Prettier** — auto-format `.ts` and `.html` after edit.
- **`ng lint`** — run after editing Angular source to catch decorator misuse, template errors, style violations.
- **`tsc --noEmit`** — type-check after editing `.ts`.
- **`ng build`** — run after generating or significantly changing code to surface template/type errors early.

## Stop
- **Lint audit** — run `ng lint` across modified files before the session ends to catch outstanding violations.

> Scope these to the active project's path only — never run build/lint against paths outside the registered project (MultiAgentOS §5 cross-project guard).

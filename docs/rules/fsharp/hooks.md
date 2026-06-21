<!-- pattern from affaan-m/ecc rules/fsharp/hooks.md -->
---
origin: affaan-m/ecc
license: MIT
lang: fsharp
concern: hooks
---
# F# Hooks

Claude Code automation hooks for F# work, configured in `~/.claude/settings.json`.

## PostToolUse
- **fantomas** — auto-format edited `.fs`/`.fsx` files.
- **dotnet build** — verify the solution/project still compiles after edits.
- **dotnet test --no-build** — re-run the nearest relevant test project after behavior changes.

## Stop
- Final `dotnet build` before ending a session with broad F# changes.
- Warn on modified `appsettings*.json` so secrets are not committed (aligns with the security rule).

## Verification
- [ ] Format + build hooks fire on `.fs`/`.fsx` edits.
- [ ] A secret-leak guard covers `appsettings*.json`.

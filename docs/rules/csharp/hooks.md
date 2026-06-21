<!-- pattern from affaan-m/ecc rules/csharp/hooks.md -->
---
origin: affaan-m/ecc
license: MIT
lang: csharp
concern: hooks
---
# C# Editor/Agent Hooks

Suggested automation hooks when an agent edits C# source (harness settings).

## PostToolUse
- **`dotnet format`** — auto-format edited files and apply analyzer fixes.
- **`dotnet build`** — verify the solution/project still compiles after edits.
- **`dotnet test --no-build`** — re-run the nearest relevant test project after behavior changes.

## Stop
- Run a final `dotnet build` before ending a session with broad C# changes.
- Warn on modified `appsettings*.json` so secrets do not get committed (mirrors §11).

> Scope hooks to the active project's path only (MultiAgentOS §5 cross-project guard).

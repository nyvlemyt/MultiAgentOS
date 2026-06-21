<!-- pattern from affaan-m/ecc rules/arkts/hooks.md -->
---
origin: affaan-m/ecc
license: MIT
lang: arkts
concern: hooks
---
# HarmonyOS / ArkTS Editor/Agent Hooks

Build commands and suggested automation hooks when an agent edits HarmonyOS source.

## Build / Dependency Commands
```bash
hvigorw assembleHap -p product=default          # build HAP
hvigorw assembleHap -p module=entry -p product=default
hvigorw clean
ohpm install        # install deps
ohpm update         # update deps
```

## Suggested Hooks (harness settings)
- **PostToolUse after `.ets`/`.ts` edit** — run `hvigorw assembleHap -p product=default` (async, ~60s timeout) to catch ArkTS compilation errors.
- **PostToolUse after `module.json5`** — remind to verify permissions and abilities.
- **PostToolUse after `oh-package.json5`** — run `ohpm install` (async).
- **PreToolUse on `.ets`** — remind: use `@ComponentV2` / `@Local` / `@Param`; V1 decorators (`@State`, `@Prop`, `@Link`) are prohibited.

## Validation Checklist (per cycle)
- [ ] `hvigorw assembleHap` completes without errors
- [ ] no V1 decorators in new/modified `.ets`
- [ ] no `@ohos.router` imports
- [ ] all API permissions declared in `module.json5`
- [ ] all deps listed in `oh-package.json5`
- [ ] resource strings added to all i18n directories
- [ ] dark-theme colors provided for new color resources

> Scope hooks to the active project's path only (MultiAgentOS §5 cross-project guard).

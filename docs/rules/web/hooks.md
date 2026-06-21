---
origin: affaan-m/ecc
license: MIT
lang: web
concern: hooks
---
<!-- pattern from affaan-m/ecc rules/web/hooks.md -->

# Web Hooks (Claude Code editor hooks)

> This covers **Claude Code `PostToolUse` / `PreToolUse` / `Stop` hooks** that run formatter/linter/type-checker after edits — NOT React hooks (see `docs/rules/react/hooks.md`).

**Hard rule (MultiAgentOS):** prefer project-local tooling. Do **not** wire hooks to remote one-off package execution (`npx some-remote-pkg`, `curl | sh`) — that is a §5 risky action and a supply-chain hole. Use repo-owned dependencies via `pnpm` only.

## PostToolUse — format, lint, type-check after edits

```jsonc
{
  "hooks": {
    "PostToolUse": [
      { "matcher": "Write|Edit", "command": "pnpm prettier --write \"$FILE_PATH\"", "description": "Format edited files" },
      { "matcher": "Write|Edit", "command": "pnpm eslint --fix \"$FILE_PATH\"", "description": "Lint edited files" }
    ]
  }
}
```

### Type-check — incremental + timeout-capped

Use `--incremental` so re-runs reuse `.tsbuildinfo` (1–3s on unchanged code vs 30–60s cold). Wrap in `timeout` so a stuck `tsc` is reaped by the OS instead of orphaning across edits.

```jsonc
{
  "matcher": "Write|Edit",
  "command": "timeout 60 pnpm tsc --noEmit --pretty false --incremental --tsBuildInfoFile node_modules/.cache/tsc-hook.tsbuildinfo",
  "description": "Type-check after edits (incremental + timeout-capped)"
}
```

**Why both flags matter:**
- Without `--incremental`, every edit re-checks the whole program. Edits at 5–10s intervals + 30–60s `tsc` runs = N concurrent `tsc` processes piling up.
- Without `timeout`, a `tsc` that hangs (transitive type change, recursive type) never exits and orphans when its parent shell does.
- `--tsBuildInfoFile` is required because `--noEmit` suppresses the buildinfo write; naming the path explicitly keeps incremental working.

On a host without GNU `timeout`, use a wrapper or a Stop/SessionEnd hook that sweeps stale `tsc` processes.

## PreToolUse — guard oversized writes

Block oversized writes from the **tool input content**, not from a file that may not exist yet.

```jsonc
{
  "matcher": "Write",
  "command": "node -e \"let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{const i=JSON.parse(d);const c=i.tool_input?.content||'';const lines=c.split('\\n').length;if(lines>800){console.error('[Hook] BLOCKED: '+lines+' lines, split into modules');process.exit(2)}console.log(d)})\"",
  "description": "Block writes that exceed 800 lines"
}
```

## Stop — final verification at session end

```jsonc
{ "hooks": { "Stop": [ { "command": "pnpm build", "description": "Verify production build at session end" } ] } }
```

A `console.log` audit at Stop (grep modified files) is a cheap guard for the no-`console.log` rule.

## Ordering

format → lint → type-check → build verification.

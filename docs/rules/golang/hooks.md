<!-- pattern from affaan-m/ecc rules/golang/hooks.md -->
---
origin: affaan-m/ecc
license: MIT
lang: golang
concern: hooks
---
# Go Hooks

Claude Code automation hooks for Go work, configured in `~/.claude/settings.json`.

## PostToolUse
- **gofmt/goimports** — auto-format `.go` files after edit.
- **go vet** — static analysis after editing `.go` files.
- **staticcheck** — extended static checks on modified packages.

## Verification
- [ ] Format + vet hooks fire on `.go` edits.
- [ ] staticcheck runs on modified packages.

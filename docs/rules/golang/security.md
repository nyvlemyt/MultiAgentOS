<!-- pattern from affaan-m/ecc rules/golang/security.md -->
---
origin: affaan-m/ecc
license: MIT
lang: golang
concern: security
---
# Go Security

## Secret Management
Read secrets from the environment; fail closed when unset. Never hardcode.

```go
apiKey := os.Getenv("PROVIDER_API_KEY")
if apiKey == "" {
    log.Fatal("PROVIDER_API_KEY not configured")
}
```

## Security Scanning
- Run **gosec** for static security analysis:

```bash
gosec ./...
```

## Context & Timeouts
Always thread `context.Context` for cancellation and timeout control — never leave network calls unbounded.

```go
ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
defer cancel()
```

## Verification
- [ ] No hardcoded secrets; env-sourced and fail-closed.
- [ ] `gosec ./...` clean (or findings triaged).
- [ ] All I/O and network calls accept and honor a `context.Context` with a timeout.

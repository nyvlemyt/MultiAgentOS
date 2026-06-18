<!-- pattern from affaan-m/ecc rules/golang/coding-style.md -->
---
origin: affaan-m/ecc
license: MIT
lang: golang
concern: coding-style
---
# Go Coding Style

## Formatting
- **gofmt** and **goimports** are mandatory — no style debates.

## Design Principles
- Accept interfaces, return structs.
- Keep interfaces small (1–3 methods); define them where they are used, not where implemented.

## Error Handling
Always wrap errors with context using `%w` so callers can `errors.Is`/`errors.As`:

```go
if err != nil {
    return fmt.Errorf("failed to create user: %w", err)
}
```

## Verification
- [ ] `gofmt -l` and `goimports -l` report no files.
- [ ] Public functions return concrete structs; interfaces stay ≤3 methods.
- [ ] Errors wrapped with `%w` and contextual messages (no bare `return err` at boundaries).

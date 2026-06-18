<!-- pattern from affaan-m/ecc rules/golang/testing.md -->
---
origin: affaan-m/ecc
license: MIT
lang: golang
concern: testing
---
# Go Testing

## Framework
Standard `go test` with **table-driven tests** as the default structure.

## Race Detection
Always run with `-race` in CI:

```bash
go test -race ./...
```

## Coverage
```bash
go test -cover ./...
```

## Verification
- [ ] Test cases expressed as table-driven subtests (`t.Run`).
- [ ] CI runs `go test -race ./...`.
- [ ] Coverage measured on the packages that hold logic.

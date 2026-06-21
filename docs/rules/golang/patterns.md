<!-- pattern from affaan-m/ecc rules/golang/patterns.md -->
---
origin: affaan-m/ecc
license: MIT
lang: golang
concern: patterns
---
# Go Patterns

## Functional Options
Configure constructors with variadic option functions instead of large parameter lists.

```go
type Option func(*Server)

func WithPort(port int) Option {
    return func(s *Server) { s.port = port }
}

func NewServer(opts ...Option) *Server {
    s := &Server{port: 8080}
    for _, opt := range opts {
        opt(s)
    }
    return s
}
```

## Small Interfaces
Define interfaces where they are consumed, not where implemented. Prefer 1–3 method interfaces.

## Dependency Injection
Inject via constructor functions:

```go
func NewUserService(repo UserRepository, logger Logger) *UserService {
    return &UserService{repo: repo, logger: logger}
}
```

## Verification
- [ ] Constructors with many knobs use functional options.
- [ ] Interfaces declared on the consumer side.
- [ ] Dependencies passed through constructors, not package-level globals.

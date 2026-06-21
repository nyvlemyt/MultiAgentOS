<!-- pattern from affaan-m/ecc rules/perl/testing.md -->
---
origin: affaan-m/ecc
license: MIT
lang: perl
concern: testing
---
# Perl Testing

## Framework
Use **Test2::V0** for new projects (not Test::More):

```perl
use Test2::V0;
is($result, 42, 'answer is correct');
done_testing;
```

## Runner
```bash
prove -l t/              # adds lib/ to @INC
prove -lr -j8 t/         # recursive, 8 parallel jobs
```
Always use `-l` so `lib/` is on `@INC`.

## Coverage
**Devel::Cover** — target 80%+:

```bash
cover -test
```

## Mocking
- **Test::MockModule** — mock methods on existing modules.
- **Test::MockObject** — build test doubles from scratch.

## Pitfalls
- Always end test files with `done_testing`.
- Never forget `-l` with `prove`.

## Verification
- [ ] New tests use Test2::V0 and end with `done_testing`.
- [ ] `prove -l` used; coverage measured with Devel::Cover (80%+).

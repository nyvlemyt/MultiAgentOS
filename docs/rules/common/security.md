---
origin: affaan-m/ecc
license: MIT
lang: common
concern: security
---
<!-- pattern from affaan-m/ecc rules/common/security.md -->

# Security Guidelines (stack-agnostic)

Pre-commit security baseline for a registered project. This is application-level hygiene; it complements — never replaces — MAOS's own risky-action gating (CLAUDE.md §5) and `mas-sec-reviewer`. The per-language packs (`docs/rules/<lang>/security.md`) extend this with framework-specific vectors.

## Pre-commit checklist

Before any commit:

- [ ] No hardcoded secrets (API keys, passwords, tokens)
- [ ] All user inputs validated at the boundary
- [ ] SQL injection prevented (parameterized queries, never string-concat)
- [ ] XSS prevented (sanitized/escaped HTML)
- [ ] CSRF protection enabled
- [ ] Authn / authz verified
- [ ] Rate limiting on endpoints
- [ ] Error messages don't leak sensitive data

## Secret management

- Never hardcode secrets in source. Use env vars or a secret manager.
- Validate that required secrets are present at startup (fail fast).
- Rotate any secret that may have been exposed.
- (MAOS specifics, CLAUDE.md §11/§5: `ANTHROPIC_API_KEY` is a *smell* — its presence at worker init must refuse start; `.env*` writes are always human-gated.)

## Response protocol

On a security issue: stop, escalate to the security-review gate, fix CRITICAL issues before continuing, rotate exposed secrets, sweep the codebase for the same pattern elsewhere.

## Reference

- Pairs with `code-review.md` (security triggers) and the per-language `security.md` packs.

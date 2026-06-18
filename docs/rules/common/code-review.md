---
origin: affaan-m/ecc
license: MIT
lang: common
concern: code-review
---
<!-- pattern from affaan-m/ecc rules/common/code-review.md -->

# Code Review Standards (stack-agnostic)

When and how to review code on a registered project. In MAOS itself, the `mas-reviewer` skill is the review gate (CLAUDE.md §7 verification = 5 checks); this rule supplies the concrete thresholds `mas-reviewer` and the per-language reviewers apply.

## When to review

Mandatory triggers: after writing/modifying code; before any commit to a shared branch; when security-sensitive code changes (auth, payments, user data); on architectural changes; before merging a PR.

Pre-review requirements: CI green, conflicts resolved, branch up to date with target.

## Review checklist (binary thresholds)

- [ ] Readable, well-named
- [ ] Functions focused (**<50 lines**)
- [ ] Files cohesive (**<800 lines**)
- [ ] No deep nesting (**>4 levels** = fix)
- [ ] Errors handled explicitly
- [ ] No hardcoded secrets or credentials
- [ ] No `console.log` / debug statements in committed code
- [ ] Tests exist for new functionality
- [ ] Coverage meets the project floor (ECC default **80%**)

## Severity levels

| Level | Meaning | Action |
|-------|---------|--------|
| CRITICAL | Security vuln or data-loss risk | **BLOCK** — fix before merge |
| HIGH | Bug or significant quality issue | **WARN** — should fix before merge |
| MEDIUM | Maintainability concern | **INFO** — consider fixing |
| LOW | Style / minor | **NOTE** — optional |

Approval: no CRITICAL/HIGH → approve; HIGH only → merge with caution; CRITICAL → block. (Maps onto `mas-reviewer`'s PASS / NEEDS_WORK / BLOCK verdict.)

## Security review triggers

Escalate to a dedicated security pass when the change touches: authn/authz, user-input handling, DB queries, filesystem ops, external API calls, crypto, or payment/financial code. In MAOS these align with the risky-action categories of CLAUDE.md §5 and `mas-sec-reviewer`.

## Common issues to catch

- **Security**: hardcoded creds, SQL injection (string-concat queries), XSS (unescaped input), path traversal, missing CSRF, auth bypasses.
- **Quality**: oversized functions/files, deep nesting, missing error handling, mutation where immutability fits, missing tests.
- **Performance**: N+1 queries, missing pagination/`LIMIT`, unbounded queries, missing caching of expensive ops.

## Reference

- Pairs with `docs/rules/common/testing.md` and `docs/rules/common/security.md`.

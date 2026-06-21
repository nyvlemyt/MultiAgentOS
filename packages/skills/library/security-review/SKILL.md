---
name: security-review
description: |
  Use as a write-time secure-coding pattern library when implementing auth/authorization, handling user input
  or file uploads, creating API endpoints, managing secrets, or storing/transmitting sensitive data. Provides
  concrete FAIL→PASS patterns and per-area verification checklists (secrets, input validation, injection, authn/z,
  XSS, CSRF, rate limiting, sensitive-data exposure, dependency hygiene).
  Do NOT use as the risk gate that approves/blocks a risky action (that is mas-sec-reviewer, PASS/BLOCK), and do
  NOT use as the pre-merge mission verification (that is mas-reviewer + the §7 five-check loop). This skill informs
  how code is written; it does not authorize execution.
summary: "Write-time secure-coding pattern library: FAIL→PASS examples + per-area checklists for secrets, input validation, SQL/NoSQL injection, authn/z, XSS, CSRF, rate limiting, sensitive-data exposure, and dependency hygiene, plus a pre-deploy checklist. Secret values come from env, never source (§11: MAS itself never uses an API key). Distinct from mas-sec-reviewer (the PASS/BLOCK risk gate on action categories) and mas-reviewer (mission gate)."
metadata:
  origin: affaan-m/ecc
  license: MIT
  cluster: skill:core-eval
  tier: T1
  status: library
---
<!-- pattern from affaan-m/ecc skills/security-review/SKILL.md -->

# Security Review (secure-coding patterns)

## Overview

A write-time secure-coding pattern library: FAIL→PASS examples and per-area checklists (secrets, input validation, injection, authn/z, XSS, CSRF, rate limiting, sensitive-data exposure, dependency hygiene) applied while implementing security-sensitive code. Use it to make the code itself defensible before review; it is **not** the authorization gate — `mas-sec-reviewer` decides PASS/BLOCK on risky actions (§5) and `mas-reviewer` gates the mission output.

## When to Use

- Implementing authentication or authorization.
- Handling user input or file uploads.
- Creating new API endpoints.
- Managing secrets/credentials, or storing/transmitting sensitive data.
- Integrating third-party APIs.

## When NOT to Use

- Approving or blocking a risky action (`rm`, push --force, network sends, payments, secrets writes) — that is `mas-sec-reviewer`, which always BLOCKs `risk:blocking`.
- Pre-merge mission verification — that is `mas-reviewer` plus the §7 five checks (test · lint · build · smoke · Sonar).
- Deciding whether a new tool/repo enters the project — that is `intake-audit`.

## Principles

*Source: `affaan-m/ecc` security-review + OWASP Top 10 + CLAUDE.md §5 (gated actions), §11 (secrets/PAYG ban).*

1. **Secrets never live in source.** Read from environment; verify presence at startup; keep `.env*` gitignored. MAS itself uses no API key (§11) — these patterns are for the *user's* registered project.
2. **Validate at the boundary, allowlist not denylist.** Every external input is validated against a schema before use; whitelist the accepted shape.
3. **Never concatenate untrusted data into a query.** Parameterize / use the ORM correctly. Same rule for shell, paths, and templates.
4. **Fail closed and quiet.** Authorize before acting; return generic errors to users; log details server-side only — never leak secrets, stack traces, or internals.
5. **Defense in depth.** httpOnly+Secure+SameSite cookies, CSP without `unsafe-inline`/`unsafe-eval`, CSRF tokens on state-changing routes, rate limits per endpoint.

## Process

1. **Secrets.** Read from env, verify presence, fail fast if missing. FAIL→PASS:
   ```ts
   // FAIL: const apiKey = "sk-xxxxx"        // hardcoded secret
   // PASS:
   const apiKey = process.env.SERVICE_API_KEY
   if (!apiKey) throw new Error('SERVICE_API_KEY not configured')
   ```
   Check: no hardcoded keys/tokens/passwords · all secrets in env · `.env*` gitignored · no secrets in git history · production secrets in the hosting platform.
2. **Input validation.** Validate every input with a schema before processing; restrict file uploads by size, MIME type, and extension (allowlist). Never feed raw input into queries. Keep error messages non-leaky.
3. **Injection prevention.** Parameterize all DB queries; no string concatenation in SQL; use the query builder/ORM correctly. Apply the same care to OS commands, file paths, and template rendering.
4. **Authn / authz.** Store tokens in httpOnly+Secure+SameSite cookies (not `localStorage`). Check authorization *before* sensitive operations; enable row-level security and role-based access where the datastore supports it.
5. **XSS.** Sanitize any user-provided HTML (allowlist tags/attrs); lean on the framework's built-in escaping; ship a strict CSP and treat `unsafe-inline`/`unsafe-eval` as documented temporary debt only.
6. **CSRF.** Require CSRF tokens on state-changing operations; set `SameSite=Strict` on cookies; consider the double-submit pattern.
7. **Rate limiting.** Limit all API endpoints; tighten limits on expensive operations (search, auth); apply both IP- and user-based limits.
8. **Sensitive-data exposure.** Never log passwords, tokens, card data, or PII (redact to `last4`/`userId`); return generic user-facing errors; keep stack traces in server logs only.
9. **Dependency hygiene.** Run the ecosystem audit (`npm audit` / equivalent), commit lock files, use reproducible installs (`npm ci`), keep deps current, enable automated dependency alerts.

## Rationalizations Table

| Excuse | Reality |
|---|---|
| "It's just a dev key, hardcoding is fine for now" | §11/§5: secrets in source leak via git history. Env var from minute one. |
| "I'll sanitize the input later, it's internal" | "Internal" inputs become external after one refactor. Validate at the boundary now. |
| "String interpolation is more readable than params" | It is also a SQL/command injection. Parameterize. |
| "localStorage is easier than cookie config" | localStorage tokens are XSS-exfiltratable. httpOnly cookies. |
| "I'll add the generic error message after launch" | Stack traces leaked once are leaked forever in logs/screenshots. Generic from the start. |
| "This skill said PASS, so the action is approved" | Wrong gate. Approval is `mas-sec-reviewer`'s job; this skill only improves the code. |

## Red Flags — stop and reconsider

- A secret appears as a literal anywhere in source or config.
- Untrusted data is concatenated into a query, command, or path.
- Tokens are kept in `localStorage`; cookies lack httpOnly/Secure/SameSite.
- An error response returns `error.message` / `error.stack` to the client.
- CSP ships with `unsafe-inline`/`unsafe-eval` and no removal plan.
- You are treating this skill's checklist as authorization to execute a risky action.

## Verification Criteria (binary)

- [ ] No hardcoded secrets; all secret values read from env with a presence check; `.env*` gitignored.
- [ ] Every external input is schema-validated; uploads restricted by size/type/extension.
- [ ] All DB queries are parameterized; no untrusted concatenation into queries/commands/paths.
- [ ] Tokens use httpOnly+Secure+SameSite cookies; authorization is checked before sensitive ops.
- [ ] User HTML is sanitized; a strict CSP is present without unexplained `unsafe-*`.
- [ ] CSRF protection and per-endpoint rate limits are in place; logs/errors leak no secrets or stack traces.
- [ ] Dependency audit is clean and lock files are committed.

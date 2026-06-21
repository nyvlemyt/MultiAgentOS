---
origin: affaan-m/ecc
license: MIT
lang: web
concern: security
---
<!-- pattern from affaan-m/ecc rules/web/security.md -->

# Web Security Rules

Frontend/transport security for `apps/web`. Complements MultiAgentOS §5 (risky actions) and §11 (billing/secret isolation). For React-component-level security (`dangerouslySetInnerHTML`, server actions, env-var leakage) see `docs/rules/react/security.md`.

## Content Security Policy

Always configure a production CSP. Use a **per-request nonce** for scripts instead of `'unsafe-inline'`. Adjust origins to the project — do not cargo-cult the block unchanged.

```text
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'nonce-{RANDOM}';
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' data: https:;
  font-src 'self' https://fonts.gstatic.com;
  connect-src 'self';
  frame-src 'none';
  object-src 'none';
  base-uri 'self';
```

> `connect-src` should list only hosts the cockpit actually talks to. Outbound hosts are governed by `config/permissions.json#allowed_hosts` (§5) — keep the CSP and the allowlist consistent.

## XSS Prevention

- Never inject unsanitized HTML.
- Avoid `innerHTML` / `dangerouslySetInnerHTML` unless sanitized first with a vetted local sanitizer (DOMPurify).
- Escape dynamic template values.

## Third-Party Scripts

- Load asynchronously; use SRI when serving from a CDN.
- Audit quarterly; prefer self-hosting critical dependencies when practical.

## HTTPS and Headers

```text
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

## Forms

- CSRF protection on state-changing forms.
- Rate-limit submission endpoints.
- Validate client **and** server side.
- Prefer honeypots / light anti-abuse over heavy CAPTCHA defaults.

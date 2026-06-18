<!-- pattern from affaan-m/ecc rules/angular/security.md -->
---
origin: affaan-m/ecc
license: MIT
lang: angular
concern: security
---
# Angular Security

Security baseline for Angular apps. Reinforces MultiAgentOS CLAUDE.md §5 (risky actions gated) and §11 (no secrets in source).

## XSS Prevention
Angular auto-sanitizes bound values. Never bypass the sanitizer on user-controlled input.
- Never call `bypassSecurityTrust*` without a documented, reviewed reason. Prefer `sanitizer.sanitize(SecurityContext.HTML, input)`.
- Avoid `[innerHTML]` with untrusted content — use `innerText` or a sanitizing pipe.
- Never bind `[href]` to user input (`javascript:` URLs are not blocked in all contexts).
- Never construct template strings from user data.

## HTTP Security
Use `HttpClient` exclusively — raw `fetch()`/XHR bypasses interceptors (auth headers, error handling, logging).
- Attach auth tokens via interceptors, never per-call.
- Treat external data as `unknown` at the boundary; type and validate responses.
- Never log responses that may carry tokens, PII, or credentials.

## Secret Management
- Treat `environment.ts` as a config *shape* — never store real secrets in source-controlled environment files.
- Inject production secrets via CI/CD (env vars, secret managers).
- No hardcoded keys in source (e.g. `const apiKey = 'sk-live-…'`). This mirrors MultiAgentOS §11: secrets never live in tracked files.

## Route Guards
Every authenticated or role-restricted route needs a guard — never rely on hiding UI alone. Use `canMatch` for sensitive routes so the module never loads for unauthorized users.

```typescript
{ path: 'admin', canMatch: [authGuard, roleGuard('admin')], loadChildren: () => import('./admin/admin.routes') }
```

## SSR Security
- Never expose server-side env vars to the client via `TransferState` unless intentionally public.
- Sanitize inputs before SSR — DOM-based XSS can occur server-side too.
- Avoid `window`/`document`/`localStorage` on the server; gate with `isPlatformBrowser` or the `DOCUMENT` token.

## Content Security Policy
Configure CSP headers server-side. Avoid `unsafe-inline` in `script-src`. With SSR inline scripts, use nonces via Angular's CSP support.

---
origin: affaan-m/ecc
license: MIT
lang: react
concern: security
---
<!-- pattern from affaan-m/ecc rules/react/security.md -->

# React Security

Component-level security for the App Router cockpit. Extends `docs/rules/typescript/security.md` and `docs/rules/web/security.md`. Aligns with MultiAgentOS §5 (risky actions) and §11 (secret/billing isolation).

## XSS via `dangerouslySetInnerHTML`

CRITICAL. The prop name is deliberately scary — treat every usage as a code-review halt.

```tsx
// CRITICAL: unsanitized user input
<div dangerouslySetInnerHTML={{ __html: userBio }} />

// CORRECT
<div>{userBio}</div>                                  // render as text
<ReactMarkdown>{userBio}</ReactMarkdown>              // library that sanitizes
import DOMPurify from 'isomorphic-dompurify'          // or sanitize at the call site
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userBio) }} />
```

Audit each call: is the input always under our control (document the source)? If user-derived, is it sanitized at the **same call site**? Is the sanitizer config an allowlist of tags, not a denylist?

## Unsafe URL Schemes

`javascript:` and `data:` URLs in `href` / `src` / `xlink:href` execute arbitrary code. React warns about `javascript:` in dev but does not block at runtime. Always validate.

```tsx
function safeUrl(url: string): string | undefined {
  try {
    const parsed = new URL(url)
    if (['http:', 'https:', 'mailto:'].includes(parsed.protocol)) return url
  } catch { return undefined }
  return undefined
}
<a href={safeUrl(user.website)}>Visit</a>
```

## `target="_blank"` Without `rel`

Add `rel="noopener noreferrer"` — without it the target page can reach `window.opener`. Browsers default to `noopener` for `target="_blank"`, but be explicit.

## Server Action Input Validation

`"use server"` actions run at the trust level of a public API endpoint. Validate every input, authenticate inside the action (do not trust the client route gate), authorize the specific record, and rate-limit sensitive actions.

```tsx
'use server'
import { z } from 'zod'
const Input = z.object({ email: z.string().email(), age: z.number().int().min(0).max(120) })

export async function updateUser(_state: unknown, formData: FormData) {
  const parsed = Input.safeParse({ email: formData.get('email'), age: Number(formData.get('age')) })
  if (!parsed.success) return { error: parsed.error.flatten() }
  // ...
}
```

## Secret Exposure via Env Vars

Prefixed env vars are bundled into the client — treat them as public.

| Framework | Public prefix | Private |
|---|---|---|
| Next.js | `NEXT_PUBLIC_*` | all others |
| Vite | `VITE_*` | `.env` server-side only |

```ts
// CRITICAL: secret leaked into client bundle
const apiKey = process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY
```

**MultiAgentOS-specific (§11):** `ANTHROPIC_API_KEY` and any provider key must never be `NEXT_PUBLIC_*`, never reach a Client Component, and never be bundled. Keys live in `.env.local` (gitignored). Audit every PR touching env vars: would this string in the public bundle be a problem?

## Authentication / Authorization

- Never store sessions in `localStorage` (any XSS can read them) — use httpOnly secure cookies.
- Never trust client-set state to gate sensitive UI. Render-gating hides display, not access — the API must enforce.
- CSRF: cookie auth needs CSRF tokens or `SameSite=Strict`/`Lax`.

## Content Security Policy

Configure server-side (see `docs/rules/web/security.md`). Minimum for a React app: avoid `unsafe-inline`/`unsafe-eval` in `script-src`; use per-request nonces for SSR inline scripts (Next.js supports nonce injection). `style-src 'unsafe-inline'` is often unavoidable for CSS-in-JS — document the tradeoff.

## Prototype Pollution via Object Spread

Never spread untrusted JSON directly into state (attacker controls `__proto__`). Parse with a Zod schema or guard keys first.

```tsx
const Allowed = z.object({ name: z.string(), email: z.string().email() })
const parsed = Allowed.parse(await req.json())
setState({ ...state, ...parsed })
```

## SSR Template Injection

With `renderToString` / `renderToPipeableStream`: values in JSX are escaped by React (safe); values passed to `dangerouslySetInnerHTML` are NOT; manually constructed HTML wrappers around React output must be escaped — never concatenate user input into the surrounding template.

## Third-Party Components

Run `npm audit` before adding a UI library; check it doesn't internally feed your input through `dangerouslySetInnerHTML` (rich-text editors); pin versions and review changelogs before major upgrades.

## Source Map Exposure in Production

Ship production without public source maps (or upload them to an error tracker and strip from the public bundle). Public maps leak internal logic and file structure.

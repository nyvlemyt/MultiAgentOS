---
origin: affaan-m/ecc
license: MIT
lang: vue
concern: security
---
<!-- pattern from affaan-m/ecc rules/vue/security.md -->

# Vue Security

XSS / injection rules for `**/*.vue` on a registered project. Extends `docs/rules/common/security.md`. These complement, never replace, MAOS's own risky-action gating (CLAUDE.md §5) when MAOS produces diffs against a Vue project.

## What Vue Escapes Automatically

- Text interpolation `{{ }}` and dynamic attribute bindings (`:title`) are auto-escaped. The vectors below are NOT protected.

## Rule No.1: Templates from Trusted Sources Only

- Never use non-trusted content as a component template. No runtime template compilation from user input.
- No user-controlled `:is` that resolves a component from an arbitrary string.

## v-html and Render Functions

- `v-html` bypasses escaping and is a direct XSS vector. Avoid it on user content.
- If unavoidable, sanitize with DOMPurify (allowlist config) before binding, or render in a sandboxed iframe. Sanitize on the backend before persisting.
- Render-function and scoped-slot output carry the same risk. Passing user HTML through `h()` with `innerHTML` is `v-html` by another name. Sanitize first.

## URL, Style, and Event Injection

- `:href` and `:src` are not escaped. `javascript:` URLs execute. Validate the scheme; allow `http` / `https` / `mailto` only. (`@braintree/sanitize-url` helps, but sanitize on the backend before persisting.)
- `:style` with user input is unsafe (CSS exfiltration). Use object syntax with whitelisted properties, never a raw user string.
- Never bind user input to `onclick`, `onfocus`, or any event attribute.

## Client Bundle Secrets

- Anything in `import.meta.env.VITE_*` ships to the browser. Keep API keys and tokens server-side.
- Use httpOnly cookies for session tokens. Never bundle credentials into the client.

```vue
<!-- unsafe -->
<div v-html="userBio" />
<!-- safe -->
<div v-html="sanitize(userBio)" />
```

## Reference

- Docs: https://vuejs.org/guide/best-practices/security.html · https://github.com/cure53/DOMPurify · https://github.com/braintree/sanitize-url

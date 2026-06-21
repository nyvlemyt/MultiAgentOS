<!-- pattern from affaan-m/ecc rules/arkts/security.md -->
---
origin: affaan-m/ecc
license: MIT
lang: arkts
concern: security
---
# HarmonyOS / ArkTS Security

Security baseline for HarmonyOS apps. Aligns with MultiAgentOS §5 (gated risky actions) and §11 (no secrets in source).

## Permission Management
Declare every permissioned system API in `module.json5` (`requestPermissions` with `name`, `reason` string resource, `usedScene`). Before calling a permissioned API:
- [ ] declared in `module.json5`
- [ ] reason string defined in resources (user-facing permissions)
- [ ] runtime request implemented for sensitive permissions (camera, location, …)
- [ ] permission checked before the call, with graceful fallback on denial

Runtime check/request via `abilityAccessCtrl.createAtManager()` → `checkAccessToken(tokenId, permission)`, then `requestPermissionsFromUser(...)` if not granted.

## Secret Management
- **Never** hardcode API keys, tokens, or passwords in `.ets`/`.ts` (mirrors §11 — secrets never in tracked files).
- Non-sensitive config via Preferences API or build-profile constants (`BuildProfile.API_ENDPOINT`).
- Sensitive credentials via HarmonyOS Keystore (HUKS) — encrypt/decrypt without exposing key material (AES-GCM session through `huks.initSession`/`finishSession`).

## Input Validation
- Validate all user input before processing; sanitize before display to prevent injection.
- Validate deep-link parameters against an allowlist before navigation, e.g. reject any path not in `['detail','settings','profile']` before `pushPath`.

## Network Security
HTTPS only; validate server certificates; enforce request timeout + retry; never log tokens/credentials in request/response logs.

## Data Storage
Encrypted preferences for sensitive local data; clear sensitive data from memory when done; classify data (public/internal/confidential) when choosing storage.

## Dependency Security
Only trusted sources (official ohpm registry); pin versions in `oh-package.json5`; check third-party libs for known vulnerabilities.

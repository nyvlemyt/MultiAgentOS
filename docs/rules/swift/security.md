---
origin: affaan-m/ecc
license: MIT
lang: swift
concern: security
---
<!-- pattern from affaan-m/ecc rules/swift/security.md -->

# Swift — Security (reference)

Aligns with MultiAgentOS §11 (secrets never committed). Route secret/auth edits through `mas-sec-reviewer` (§5).

## Secret management

- Use **Keychain Services** for sensitive data (tokens, passwords, keys) — never `UserDefaults`.
- Use environment variables or `.xcconfig` files for build-time secrets.
- Never hardcode secrets in source — decompilation tools extract them trivially.

```swift
let apiKey = ProcessInfo.processInfo.environment["API_KEY"]
guard let apiKey, !apiKey.isEmpty else {
    fatalError("API_KEY not configured")
}
```

## Transport security

- App Transport Security (ATS) is enforced by default — do not disable it.
- Use certificate pinning for critical endpoints.
- Validate all server certificates.

## Input validation

- Sanitize all user input before display to prevent injection.
- Use `URL(string:)` with validation rather than force-unwrapping.
- Validate data from external sources (APIs, deep links, pasteboard) before processing.

## See also

- `docs/rules/swift/hooks.md`, `config/permissions.json` (risky-action categories).

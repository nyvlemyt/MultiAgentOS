<!-- pattern from affaan-m/ecc rules/kotlin/security.md -->
---
origin: affaan-m/ecc
license: MIT
lang: kotlin
concern: security
---
# Kotlin Security (Android / KMP)

## Secrets Management
- Never hardcode keys/tokens. Use git-ignored `local.properties` locally; `BuildConfig` from CI secrets for releases; `EncryptedSharedPreferences` (Android) / Keychain (iOS) at runtime.

```kotlin
val apiKey = BuildConfig.API_KEY          // generated at build time
val token = secureStorage.get("auth_token") // secure storage at runtime
```

## Network Security
- HTTPS only; block cleartext via `network_security_config.xml`.
- Pin certificates for sensitive endpoints (OkHttp `CertificatePinner` / Ktor equivalent).
- Set explicit timeouts; validate/sanitize all server responses.

## Input Validation
- Validate before processing or sending; parameterize Room/SQLDelight queries — never concatenate input.

```kotlin
@Query("SELECT * FROM items WHERE name = :input")
fun findByName(input: String): List<ItemEntity>
```

## Data Protection
- `EncryptedSharedPreferences` for sensitive key-value; explicit `@Serializable` field names; clear sensitive data when done; ProGuard/`@Keep` rules for serialized classes.

## Authentication
- Tokens in secure storage, not plain SharedPreferences; proper 401/403 refresh; clear all auth state on logout; `BiometricPrompt` for sensitive ops.

## ProGuard / R8
- Keep rules for serialized models and reflection libs (Koin, Retrofit); test release builds — obfuscation breaks serialization silently.

## WebView Security
- JS disabled unless needed; validate URLs; no sensitive `@JavascriptInterface`; control nav via `shouldOverrideUrlLoading()`.

## Verification
- [ ] No hardcoded secrets; runtime secrets in EncryptedSharedPreferences/Keychain.
- [ ] HTTPS-only with timeouts; DB queries parameterized.
- [ ] Auth state fully cleared on logout; ProGuard keep-rules cover serialized/reflection types.

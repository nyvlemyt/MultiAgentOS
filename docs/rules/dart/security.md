<!-- pattern from affaan-m/ecc rules/dart/security.md -->
---
origin: affaan-m/ecc
license: MIT
lang: dart
concern: security
---
# Dart/Flutter Security

Mobile-focused security baseline. Aligns with MultiAgentOS §11 (no secrets in tracked files).

## Secrets Management
- Never hardcode API keys, tokens, or credentials in Dart source.
- `--dart-define` / `--dart-define-from-file` for compile-time config (NOT truly secret — use a backend proxy for server-side secrets).
- `flutter_dotenv` (or equivalent) with `.env` files gitignored.
- Runtime secrets in platform-secure storage: `flutter_secure_storage` (Keychain on iOS, EncryptedSharedPreferences on Android).

```dart
// BAD: const apiKey = 'sk-abc123...';
const apiKey = String.fromEnvironment('API_KEY');        // compile-time config
final token = await secureStorage.read(key: 'auth_token'); // runtime secret
```

## Network Security
- HTTPS only — no `http://` in production. Block cleartext via Android `network_security_config.xml` and iOS `NSAppTransportSecurity`.
- Always set request timeouts (`connectTimeout`/`receiveTimeout`). Consider certificate pinning for high-security endpoints.

## Input Validation
- Validate/sanitize all user input before API or storage. Parameterize SQL (sqflite/drift) — never interpolate input.
- Validate deep links: `Uri.tryParse`, check scheme/host, allowlist paths before navigating.

```dart
await db.query('users', where: 'email = ?', whereArgs: [userInput]); // parameterized
final uri = Uri.tryParse(incomingLink);
if (uri != null && uri.host == 'myapp.com' && _allowedPaths.contains(uri.path)) { context.go(uri.path); }
```

## Data Protection
Tokens/PII/credentials only in `flutter_secure_storage` — never plaintext `SharedPreferences` or local files. Clear auth state on logout. Use `local_auth` for sensitive operations. Never log secrets (`print(token)`).

## Android-Specific
Declare only required permissions. Set `android:exported="false"` on components that don't need to be exported; review intent filters. Use `FLAG_SECURE` on screens with sensitive data (blocks screenshots).

## iOS-Specific
Declare only required `Info.plist` usage descriptions. Secrets in Keychain (via `flutter_secure_storage`). Enforce ATS (disallow arbitrary loads). Enable data-protection entitlement for sensitive files.

## WebView Security
- `webview_flutter` v4+ (`WebViewController`/`WebViewWidget`). Disable JavaScript unless required (`JavaScriptMode.disabled`).
- Validate URLs before loading; intercept via `NavigationDelegate.onNavigationRequest` and `prevent` untrusted hosts. Never expose Dart callbacks to JS unless carefully sandboxed.

## Obfuscation & Build
- Release builds: `flutter build apk --obfuscate --split-debug-info=./debug-info/`. Keep `--split-debug-info` output out of version control.
- Ensure ProGuard/R8 rules don't expose serialized classes. Run `flutter analyze` and clear all warnings before release.

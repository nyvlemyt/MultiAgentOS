<!-- pattern from affaan-m/ecc rules/java/security.md -->
---
origin: affaan-m/ecc
license: MIT
lang: java
concern: security
---
# Java Security

## Secrets Management
- Never hardcode keys/tokens/credentials. Use `System.getenv(...)`; a secret manager (Vault, AWS SM) in prod; keep secret config files git-ignored.

```java
String apiKey = System.getenv("PAYMENT_API_KEY");
Objects.requireNonNull(apiKey, "PAYMENT_API_KEY must be set");
```

## SQL Injection Prevention
- Always parameterize — never concatenate user input into SQL. Use `PreparedStatement` or the framework's parameterized API.

```java
PreparedStatement ps = conn.prepareStatement("SELECT * FROM orders WHERE name = ?");
ps.setString(1, name);
```

## Input Validation
- Validate all input at boundaries before processing; Bean Validation (`@NotNull`, `@NotBlank`, `@Size`) on DTOs, or explicit checks in plain Java; reject with clear errors.

## Authentication & Authorization
- Never roll custom auth crypto. Store passwords with **bcrypt** or **Argon2** (never MD5/SHA1). Enforce authz at service boundaries. Never log passwords, tokens, or PII.

## Dependency Security
- Audit transitive deps (`mvn dependency:tree` / `./gradlew dependencies`); scan with OWASP Dependency-Check or Snyk; keep deps current (Dependabot/Renovate).

## Error Messages
- Never expose stack traces, internal paths, or SQL errors in responses. Map exceptions to safe generic messages at handler boundaries; log detail server-side.

```java
try {
    return orderService.findById(id);
} catch (OrderNotFoundException ex) {
    log.warn("Order not found: id={}", id);
    return ApiResponse.error("Resource not found");
} catch (Exception ex) {
    log.error("Unexpected error processing order id={}", id, ex);
    return ApiResponse.error("Internal server error");
}
```

## Verification
- [ ] No hardcoded secrets; env/secret-manager sourced and null-checked.
- [ ] All SQL parameterized; inputs validated at boundaries.
- [ ] Passwords hashed with bcrypt/Argon2; responses leak no internals; deps CVE-scanned.

> See also `security-review` skill for general checklists.

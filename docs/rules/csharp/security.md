<!-- pattern from affaan-m/ecc rules/csharp/security.md -->
---
origin: affaan-m/ecc
license: MIT
lang: csharp
concern: security
---
# C# Security

Aligns with MultiAgentOS §11 (no secrets in tracked files).

## Secret Management
- Never hardcode API keys, tokens, or connection strings in source.
- Use environment variables, user-secrets for local dev, a secret manager in production. Keep `appsettings.*.json` free of real credentials.

```csharp
// BAD: const string ApiKey = "sk-live-123";
// GOOD: read from config and fail closed
var apiKey = builder.Configuration["Service:ApiKey"]
    ?? throw new InvalidOperationException("Service:ApiKey is not configured.");
```

## SQL Injection Prevention
- Always parameterize (ADO.NET, Dapper, EF Core). Never concatenate user input into SQL.
- Validate sort fields and filter operators before any dynamic query composition.

```csharp
const string sql = "SELECT * FROM Orders WHERE CustomerId = @customerId";
await connection.QueryAsync<Order>(sql, new { customerId });
```

## Input Validation
Validate DTOs at the application boundary (data annotations, FluentValidation, or explicit guard clauses). Reject invalid model state before running business logic.

## Authentication & Authorization
Prefer framework auth handlers over custom token parsing. Enforce authorization policies at endpoint/handler boundaries. Never log raw tokens, passwords, or PII.

## Error Handling
Return safe client-facing messages. Log detailed exceptions with structured context server-side. Never expose stack traces, SQL text, or filesystem paths in API responses.

<!-- pattern from affaan-m/ecc rules/fsharp/security.md -->
---
origin: affaan-m/ecc
license: MIT
lang: fsharp
concern: security
---
# F# Security

## Secret Management
- Never hardcode API keys, tokens, or connection strings. Use env vars, user-secrets locally, a secret manager in prod.
- Keep `appsettings.*.json` free of real credentials.

```fsharp
// BAD: let apiKey = "<hardcoded-key>"
// GOOD
let apiKey =
    configuration["Provider:ApiKey"]
    |> Option.ofObj
    |> Option.defaultWith (fun () -> failwith "Provider:ApiKey is not configured.")
```

## SQL Injection Prevention
- Always parameterize (ADO.NET, Dapper, EF Core); never concatenate user input into SQL.
- Validate sort fields / filter operators before dynamic query composition.

```fsharp
let sql = "SELECT * FROM Orders WHERE CustomerId = @customerId"
connection.QueryAsync<Order>(sql, {| customerId = customerId |})
```

## Input Validation
- Validate at the boundary using types; single-case DUs for validated values; reject before domain logic.

```fsharp
type ValidatedEmail = private ValidatedEmail of string
module ValidatedEmail =
    let create (input: string) =
        if Regex.IsMatch(input, @"^[^@]+@[^@]+\.[^@]+$") then Ok(ValidatedEmail input)
        else Error "Invalid email address"
```

## Auth & Error Handling
- Prefer framework auth handlers over custom token parsing; enforce policies at handler boundaries.
- Never log raw tokens, passwords, or PII.
- Return safe client messages; log detailed exceptions server-side; never expose stack traces / SQL / paths in responses.

## Verification
- [ ] No hardcoded secrets; config resolved at runtime, fail-closed if missing.
- [ ] All SQL parameterized.
- [ ] API error responses contain no internals (stack/SQL/path); no tokens/PII in logs.

> See also `security-review` skill for broader app-security checklists.

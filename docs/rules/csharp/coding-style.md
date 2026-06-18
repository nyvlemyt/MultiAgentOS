<!-- pattern from affaan-m/ecc rules/csharp/coding-style.md -->
---
origin: affaan-m/ecc
license: MIT
lang: csharp
concern: coding-style
---
# C# Coding Style

Modern .NET conventions, nullable-aware.

## Standards
- Follow current .NET conventions; enable nullable reference types.
- Explicit access modifiers on public and internal APIs.
- Keep files aligned with the primary type they define.

## Types and Models
- `record` / `record struct` for immutable value-like models; `class` for entities with identity/lifecycle; `interface` for service boundaries.
- Avoid `dynamic` in application code — prefer generics or explicit models.

```csharp
public sealed record UserDto(Guid Id, string Email);
public interface IUserRepository {
    Task<UserDto?> FindByIdAsync(Guid id, CancellationToken cancellationToken);
}
```

## Immutability
Prefer `init` setters, constructor parameters, immutable collections. Don't mutate input models in place — produce updated state.

```csharp
public static UserProfile Rename(UserProfile profile, string name) => profile with { Name = name };
```

## Async and Error Handling
- `async`/`await` over blocking `.Result` / `.Wait()`.
- Thread `CancellationToken` through public async APIs.
- Throw specific exceptions; log with structured properties.

```csharp
return await repository.FindAsync(orderId, cancellationToken)
    ?? throw new InvalidOperationException($"Order {orderId} was not found.");
```

## Formatting
Use `dotnet format` for formatting and analyzer fixes. Keep `using` directives organized; remove unused imports. Use expression-bodied members only when they stay readable.

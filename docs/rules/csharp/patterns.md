<!-- pattern from affaan-m/ecc rules/csharp/patterns.md -->
---
origin: affaan-m/ecc
license: MIT
lang: csharp
concern: patterns
---
# C# Patterns

## API Response
```csharp
public sealed record ApiResponse<T>(bool Success, T? Data = default, string? Error = null, object? Meta = null);
```

## Repository
```csharp
public interface IRepository<T> {
    Task<IReadOnlyList<T>> FindAllAsync(CancellationToken cancellationToken);
    Task<T?> FindByIdAsync(Guid id, CancellationToken cancellationToken);
    Task<T> CreateAsync(T entity, CancellationToken cancellationToken);
    Task<T> UpdateAsync(T entity, CancellationToken cancellationToken);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken);
}
```

## Options Pattern
Strongly typed options for config instead of reading raw strings everywhere.
```csharp
public sealed class PaymentsOptions {
    public const string SectionName = "Payments";
    public required string BaseUrl { get; init; }
    public required string ApiKeySecretName { get; init; }
}
```

## Dependency Injection
- Depend on interfaces at service boundaries.
- Keep constructors focused — too many dependencies means responsibilities should be split.
- Register lifetimes intentionally: singleton (stateless/shared), scoped (per-request data), transient (lightweight pure workers).

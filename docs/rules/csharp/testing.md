<!-- pattern from affaan-m/ecc rules/csharp/testing.md -->
---
origin: affaan-m/ecc
license: MIT
lang: csharp
concern: testing
---
# C# Testing

## Framework
- **xUnit** for unit and integration tests.
- **FluentAssertions** for readable assertions.
- **Moq** or **NSubstitute** for mocking.
- **Testcontainers** when integration tests need real infrastructure.

## Organization
- Mirror `src/` structure under `tests/`. Separate unit / integration / e2e clearly.
- Name tests by behavior, not implementation.

```csharp
[Fact]
public async Task FindByIdAsync_ReturnsOrder_WhenOrderExists() {
    // Arrange / Act / Assert
}
```

## ASP.NET Core Integration Tests
Use `WebApplicationFactory<TEntryPoint>`. Test auth, validation, and serialization through HTTP, not by bypassing middleware.

## Coverage
Target 80%+ line coverage, focused on domain logic, validation, auth, and failure paths. Run `dotnet test` in CI with coverage collection where available.

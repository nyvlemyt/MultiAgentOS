<!-- pattern from affaan-m/ecc rules/fsharp/testing.md -->
---
origin: affaan-m/ecc
license: MIT
lang: fsharp
concern: testing
---
# F# Testing

## Framework
- **xUnit** + **FsUnit.xUnit** for F#-friendly assertions.
- **Unquote** for quotation-based assertions with clear failure messages.
- **FsCheck.xUnit** for property-based testing.
- **NSubstitute** or function stubs for mocking; **Testcontainers** for real-infra integration tests.

## Organization
- Mirror `src/` under `tests/`; separate unit / integration / e2e; name tests by behavior.

```fsharp
open Xunit
open Swensen.Unquote

[<Fact>]
let ``PlaceOrder returns success when request is valid`` () =
    let request = { CustomerId = "cust-123"; Items = [ validItem ] }
    let result = OrderService.placeOrder request
    test <@ Result.isOk result @>
```

## Property-Based Testing
```fsharp
open FsCheck.Xunit

[<Property>]
let ``order total is never negative`` (items: OrderItem list) =
    Order.calculateTotal items >= 0m
```

## ASP.NET Core Integration
- `WebApplicationFactory<TEntryPoint>` for API coverage; test auth/validation/serialization through HTTP, not by bypassing middleware.

## Coverage
- Target 80%+ line coverage focused on domain logic, validation, auth, failure paths.
- `dotnet test` in CI with coverage collection enabled.

## Verification
- [ ] Tests named by behavior, mirror `src/` layout.
- [ ] Domain invariants covered by FsCheck properties where applicable.
- [ ] Integration tests exercise the real HTTP boundary.

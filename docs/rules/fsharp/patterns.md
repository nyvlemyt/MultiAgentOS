<!-- pattern from affaan-m/ecc rules/fsharp/patterns.md -->
---
origin: affaan-m/ecc
license: MIT
lang: fsharp
concern: patterns
---
# F# Patterns

## Result for Error Handling
Railway-oriented `Result<'T,'TError>` instead of exceptions for expected failures.

```fsharp
type OrderError =
    | InvalidCustomer of string
    | EmptyItems
    | ItemOutOfStock of sku: string

let validateOrder (request: CreateOrderRequest) : Result<ValidatedOrder, OrderError> =
    if String.IsNullOrWhiteSpace request.CustomerId then Error(InvalidCustomer "CustomerId is required")
    elif request.Items |> List.isEmpty then Error EmptyItems
    else Ok { CustomerId = request.CustomerId; Items = request.Items }
```

## Option for Missing Values
Prefer `Option<'T>` over null; transform with `Option.map`/`bind`/`defaultValue`.

## Discriminated Unions for Domain Modeling
Model business states explicitly — the compiler enforces exhaustive handling.

```fsharp
type PaymentState =
    | AwaitingPayment of amount: decimal
    | Paid of paidAt: DateTimeOffset * transactionId: string
    | Refunded of refundedAt: DateTimeOffset * reason: string
    | Failed of error: string
```

## Computation Expressions
Use a `result { }` CE to chain fallible steps without nested matches.

```fsharp
let placeOrder request =
    result {
        let! validated = validateOrder request
        let! inventory = checkInventory validated.Items
        let! order = createOrder validated inventory
        return order
    }
```

## Module Organization
- Group related functions in modules, not classes.
- `[<RequireQualifiedAccess>]` to prevent name collisions; keep modules small and single-responsibility.

## Dependency Injection
- Dependencies as function parameters or a record-of-functions.
- Interfaces sparingly, at the .NET boundary; partial application to inject deps into pipelines.

```fsharp
type OrderDeps =
    { FindOrder: Guid -> Task<Order option>
      SaveOrder: Order -> Task<unit>
      SendNotification: Order -> Task<unit> }
```

## Verification
- [ ] Expected failures flow through `Result`/`Option`, not exceptions.
- [ ] `when`/match over DUs is exhaustive (no catch-all `_` hiding new cases).
- [ ] Dependencies injected via parameters/record-of-functions, not global state.

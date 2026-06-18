<!-- pattern from affaan-m/ecc rules/java/patterns.md -->
---
origin: affaan-m/ecc
license: MIT
lang: java
concern: patterns
---
# Java Patterns

## Repository Pattern
Encapsulate data access behind an interface; implementations handle storage (JPA, JDBC, in-memory for tests).

```java
public interface OrderRepository {
    Optional<Order> findById(Long id);
    List<Order> findAll();
    Order save(Order order);
    void deleteById(Long id);
}
```

## Service Layer
Business logic in services; keep controllers and repositories thin.

## Constructor Injection
Always constructor-inject — never field injection (testable, immutable, no framework magic).

```java
public class NotificationService {
    private final EmailSender emailSender;
    public NotificationService(EmailSender emailSender) { this.emailSender = emailSender; }
}
```

## DTO Mapping
Use records for DTOs; map at service/controller boundaries.

```java
public record OrderResponse(Long id, String customer, BigDecimal total) {
    public static OrderResponse from(Order order) {
        return new OrderResponse(order.getId(), order.getCustomerName(), order.getTotal());
    }
}
```

## Builder Pattern
For objects with many optional parameters (private constructor + static `Builder`).

## Sealed Types for Domain Models
Closed result hierarchies + exhaustive switch (Java 21+).

```java
public sealed interface PaymentResult permits PaymentSuccess, PaymentFailure {
    record PaymentSuccess(String transactionId, BigDecimal amount) implements PaymentResult {}
    record PaymentFailure(String errorCode, String message) implements PaymentResult {}
}
```

## API Response Envelope
Consistent `ApiResponse<T>` with `ok`/`error` factories.

## Verification
- [ ] Data access behind repository interfaces; logic in the service layer.
- [ ] Constructor injection everywhere; no `@Inject`/`@Autowired` on fields.
- [ ] DTOs are records mapped at boundaries; domain unions modeled as sealed types.

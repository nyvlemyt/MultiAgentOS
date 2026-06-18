<!-- pattern from affaan-m/ecc rules/java/testing.md -->
---
origin: affaan-m/ecc
license: MIT
lang: java
concern: testing
---
# Java Testing

## Framework
- **JUnit 5** (`@Test`, `@ParameterizedTest`, `@Nested`, `@DisplayName`).
- **AssertJ** fluent assertions · **Mockito** for mocks · **Testcontainers** for DB/service integration.

## Organization
Mirror `src/main/java` package structure under `src/test/java`; separate service/controller/repository/integration.

## Unit Test Pattern
```java
@ExtendWith(MockitoExtension.class)
class OrderServiceTest {
    @Mock private OrderRepository orderRepository;
    private OrderService orderService;

    @BeforeEach void setUp() { orderService = new OrderService(orderRepository); }

    @Test
    @DisplayName("findById returns order when exists")
    void findById_existingOrder_returnsOrder() {
        var order = new Order(1L, "Alice", BigDecimal.TEN);
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        var result = orderService.findById(1L);
        assertThat(result.customerName()).isEqualTo("Alice");
        verify(orderRepository).findById(1L);
    }
}
```

## Parameterized Tests
Use `@ParameterizedTest` + `@CsvSource` for table-style cases; compare BigDecimal with `isEqualByComparingTo`.

## Integration Tests
Use Testcontainers for real DB integration:

```java
@Testcontainers
class OrderRepositoryIT {
    @Container static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16");
    // wire repository from postgres.getJdbcUrl()/getUsername()/getPassword()
}
```

## Naming & Coverage
- `methodName_scenario_expectedBehavior()` + `@DisplayName` for human-readable reports.
- Target 80%+ line coverage (JaCoCo); focus service/domain logic, skip trivial getters/config.

## Verification
- [ ] Tests mirror package layout; named by scenario/behavior.
- [ ] Constructor-injected mocks (Mockito); integration via Testcontainers.
- [ ] JaCoCo coverage on logic-bearing classes meets target.

<!-- pattern from affaan-m/ecc rules/dart/testing.md -->
---
origin: affaan-m/ecc
license: MIT
lang: dart
concern: testing
---
# Dart/Flutter Testing

## Frameworks
`flutter_test` / `dart:test` (built-in) · `mockito` (`@GenerateMocks`) or `mocktail` (no codegen) · `bloc_test` for BLoC/Cubit · `fake_async` for time · `integration_test` for device e2e.

## Test Types
| Type | Tool | Location | When |
|------|------|----------|------|
| Unit | `dart:test` | `test/unit/` | domain logic, state managers, repositories |
| Widget | `flutter_test` | `test/widget/` | widgets with meaningful behavior |
| Golden | `flutter_test` | `test/golden/` | design-critical UI |
| Integration | `integration_test` | `integration_test/` | critical flows on device/emulator |

## State Managers
- **BLoC** via `blocTest` (`build`/`seed`/`act`/`expect`).
- **Riverpod** via `ProviderContainer` with `overrideWithValue(FakeRepo())`, `addTearDown(container.dispose)`.

```dart
blocTest<CartBloc, CartState>('emits items on add',
  build: () => bloc, act: (b) => b.add(CartItemAdded(testItem)),
  expect: () => [CartState(items: [testItem])]);
```

## Widget Tests
`pumpWidget` inside `ProviderScope` with overrides, `pump`, then `find.text(...)` / `find.byType(...)` assertions for key states (populated + empty).

## Fakes Over Mocks
Prefer hand-written fakes for complex dependencies (in-memory map, injectable `fetchError` to exercise error paths).

## Async
Use `fake_async` to control timers/Futures deterministically (`async.elapse(Duration(...))`).

## Golden Tests
`matchesGoldenFile('goldens/user_card.png')`; run `flutter test --update-goldens` for intentional visual changes.

## Naming & Organization
Behavior-focused names (`returns null when user does not exist`). Mirror layers under `test/unit|widget|golden/`, flows under `integration_test/flows/`.

## Coverage
- Target 80%+ for business logic (domain + state managers). Every state transition tested: loading→success, loading→error, retry.
- Run `flutter test --coverage`, inspect `lcov.info`; CI blocks below threshold.

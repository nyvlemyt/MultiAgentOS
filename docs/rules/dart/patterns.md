<!-- pattern from affaan-m/ecc rules/dart/patterns.md -->
---
origin: affaan-m/ecc
license: MIT
lang: dart
concern: patterns
---
# Dart/Flutter Patterns

Architecture and state-management patterns for Flutter apps.

## Repository
Abstract interface in the domain layer; implementation coordinates remote + local data sources (cache-on-read).

```dart
abstract interface class UserRepository {
  Future<User?> getById(String id);
  Future<List<User>> getAll();
  Stream<List<User>> watchAll();
  Future<void> save(User user);
  Future<void> delete(String id);
}
```

## State Management
**BLoC/Cubit** — Cubit for simple transitions (`emit(state + 1)`); BLoC for event-driven flows (`on<Event>((e, emit) => ...)`) with immutable `copyWith` state.

**Riverpod** — `@riverpod` providers for async data, `Notifier` classes for mutable state, `ConsumerWidget` + `ref.watch(...)` in the tree.

```dart
@riverpod
class CartNotifier extends _$CartNotifier {
  @override List<Item> build() => [];
  void add(Item item) => state = [...state, item];
}
```

## Dependency Injection
Constructor injection preferred. Register at the composition root with `get_it` or Riverpod providers:
```dart
di.registerSingleton<UserRepository>(UserRepositoryImpl(di<ApiClient>(), di<LocalDatabase>()));
di.registerFactory(() => UserListViewModel(di<UserRepository>()));
```

## ViewModel (without BLoC/Riverpod)
`ChangeNotifier` holding an `AsyncState<T>`, transitioning Loading → Success/Failure and calling `notifyListeners()`.

## UseCase
Single-responsibility callable wrapping repository access; inject collaborators (e.g. `IdGenerator`) so the domain layer never depends on infrastructure packages directly.

## Immutable State with freezed
```dart
@freezed
class UserState with _$UserState {
  const factory UserState({ @Default([]) List<User> users, @Default(false) bool isLoading, String? errorMessage }) = _UserState;
}
```

## Clean Architecture Layers
```
lib/
├── domain/        # pure Dart — no Flutter, no external packages (entities, repository interfaces, usecases)
├── data/          # implements domain interfaces (datasources, DTO models with fromJson/toJson, repositories)
└── presentation/  # Flutter widgets + state management (pages, widgets, providers/blocs/viewmodels)
```
- Domain must not import `package:flutter` or any data-layer package.
- Data maps DTOs to domain entities at repository boundaries.
- Presentation calls use cases, not repositories directly.

## Navigation (GoRouter)
Declarative routes with `redirect` for auth gating and `refreshListenable` to re-evaluate on auth-state changes.

```dart
final router = GoRouter(
  routes: [ GoRoute(path: '/users/:id', builder: (c, s) => UserDetailPage(userId: s.pathParameters['id']!)) ],
  refreshListenable: GoRouterRefreshStream(authCubit.stream),
  redirect: (context, state) {
    final loggedIn = context.read<AuthCubit>().state is AuthAuthenticated;
    return (!loggedIn && !state.matchedLocation.startsWith('/login')) ? '/login' : null;
  },
);
```

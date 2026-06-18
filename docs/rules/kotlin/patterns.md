<!-- pattern from affaan-m/ecc rules/kotlin/patterns.md -->
---
origin: affaan-m/ecc
license: MIT
lang: kotlin
concern: patterns
---
# Kotlin Patterns (Android / KMP)

## Dependency Injection
Constructor injection; Koin (KMP) or Hilt (Android-only).

```kotlin
val dataModule = module {
    single<ItemRepository> { ItemRepositoryImpl(get(), get()) }
    factory { GetItemsUseCase(get()) }
    viewModelOf(::ItemListViewModel)
}
```

## ViewModel Pattern
Single state object, event sink, one-way data flow (`MutableStateFlow` + `asStateFlow()` + `onEvent(event)`).

## Repository Pattern
`suspend` functions return `Result<T>`; `Flow` for reactive streams; coordinate local + remote sources.

```kotlin
interface ItemRepository {
    suspend fun getById(id: String): Result<Item>
    suspend fun getAll(): Result<List<Item>>
    fun observeAll(): Flow<List<Item>>
}
```

## UseCase Pattern
Single responsibility, `operator fun invoke`:

```kotlin
class GetItemUseCase(private val repository: ItemRepository) {
    suspend operator fun invoke(id: String): Result<Item> = repository.getById(id)
}
```

## expect/actual (KMP)
Platform-specific implementations declared `expect` in commonMain, `actual` per platform (Keychain on iOS, EncryptedSharedPreferences on Android, etc.).

## Coroutine Patterns
- `viewModelScope` in ViewModels; `coroutineScope` for structured child work; `supervisorScope` when children fail independently.
- Cold→hot: `stateIn(scope, SharingStarted.WhileSubscribed(5_000), initial)`.

## Builder DSL
Receiver-lambda config builders (`httpClient { baseUrl = ...; timeout = ... }`).

## Verification
- [ ] Constructor injection via Koin/Hilt; no service-locator globals.
- [ ] ViewModels expose a single immutable state + `onEvent`; repos return `Result`/`Flow`.
- [ ] KMP platform code split via `expect`/`actual`, not runtime branching.

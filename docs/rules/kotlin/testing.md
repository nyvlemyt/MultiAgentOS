<!-- pattern from affaan-m/ecc rules/kotlin/testing.md -->
---
origin: affaan-m/ecc
license: MIT
lang: kotlin
concern: testing
---
# Kotlin Testing (Android / KMP)

## Framework
- **kotlin.test** for multiplatform; **JUnit 4/5** for Android-specific.
- **Turbine** for Flow/StateFlow; **kotlinx-coroutines-test** (`runTest`, `TestDispatcher`).

## ViewModel Testing with Turbine
```kotlin
@Test
fun `loading state emitted then data`() = runTest {
    val repo = FakeItemRepository().apply { addItem(testItem) }
    val viewModel = ItemListViewModel(GetItemsUseCase(repo))
    viewModel.state.test {
        assertEquals(ItemListState(), awaitItem())
        viewModel.onEvent(ItemListEvent.Load)
        assertTrue(awaitItem().isLoading)
        assertEquals(listOf(testItem), awaitItem().items)
    }
}
```

## Fakes Over Mocks
Prefer hand-written fakes (a `FakeItemRepository` with an injectable `fetchError`) over mocking frameworks.

## Coroutine Testing
Use `runTest` — auto-advances virtual time and provides `TestScope`; `advanceUntilIdle()` to drain.

## Ktor MockEngine
Stub HTTP responses by `request.url.encodedPath` with `respond`/`respondError`.

## Room / SQLDelight
- Room: `Room.inMemoryDatabaseBuilder()`. SQLDelight: `JdbcSqliteDriver(JdbcSqliteDriver.IN_MEMORY)` for JVM.

## Naming & Organization
- Backtick descriptive names: `` `search with empty query returns all items` ``.
- Layout: `commonTest/` · `androidUnitTest/` · `androidInstrumentedTest/` · `iosTest/`.
- Minimum coverage: ViewModel + UseCase per feature.

## Verification
- [ ] Flow/StateFlow tested with Turbine under `runTest`.
- [ ] Hand-written fakes used over mock frameworks.
- [ ] Every feature has ViewModel + UseCase tests; shared logic in `commonTest`.

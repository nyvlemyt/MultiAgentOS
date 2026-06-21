<!-- pattern from affaan-m/ecc rules/arkts/patterns.md -->
---
origin: affaan-m/ecc
license: MIT
lang: arkts
concern: patterns
---
# HarmonyOS / ArkTS Patterns

Architecture and UI patterns for HarmonyOS apps. State Management V2 and `Navigation` are mandatory; V1 APIs are deprecated.

## State Management: V2 Only
Use V2 decorators; never use V1 (`@State`, `@Prop`, `@Link`, `@ObjectLink`, `@Observed`, `@Provide`, `@Consume`, `@Watch`, `@Component`).

| Decorator | Purpose |
|-----------|---------|
| `@ComponentV2` | V2 component struct |
| `@Local` | Local component state |
| `@Param` | Read-only props from parent |
| `@Event` | Child→parent callbacks |
| `@Provider` / `@Consumer` | Provide/consume state across descendants |
| `@Monitor` | Watch state changes (replaces `@Watch`) |
| `@Computed` | Derived values |
| `@ObservedV2` / `@Trace` | Observable class / observable property |

```typescript
@ObservedV2
class UserModel { @Trace name: string = ''; @Trace age: number = 0 }

@ComponentV2
struct UserCard {
  @Param user: UserModel = new UserModel()
  @Event onDelete: () => void = () => {}
  build() {
    Column() {
      Text(this.user.name).fontSize($r('app.float.font_size_title'))
      Button($r('app.string.delete')).onClick(() => this.onDelete())
    }
  }
}
```
State sharing across the tree: `@Provider('userState')` on the ancestor, `@Consumer('userState')` on the descendant.

## Routing: Navigation Only
Use `Navigation` + `NavPathStack`; never `@ohos.router`.
- `pushPath({ name, param })` to push, `replacePath` to replace, `pop()` / `clear()` to go back / to root.
- Map names to pages with a `@Builder routerMap(name, param)`; sub-pages are `NavDestination` structs.

## Architecture: MVVM
```
feature/  model/ (@ObservedV2 classes)  viewmodel/ (business logic)  view/ (@ComponentV2 structs)  service/ (API/data)
```
View = rendering only (no logic in `build()`); ViewModel = all business logic; Model = pure data with `@Trace`; Service = network/db/file I/O.

## Animation
- Declarative, state-driven: change a state variable, attach `.animation({ duration, curve })`, or use `animateTo` for explicit control.
- Prefer `transform` (translate/scale/rotate) and `opacity`. **Never** animate `width`/`height`/`padding`/`margin` — severe perf hit.
- Set `renderGroup(true)` for complex sub-component animations to reduce render batches.

## Performance
- `LazyForEach(dataSource, item => ..., item => item.id)` for large lists.
- Extract reusable components into separate files; `@Builder` for lightweight UI fragments; `@Param` for configurable components.

## Resource References
Define UI constants as resources and reference via `$r()` — never hardcode sizes/colors/strings:
```typescript
Text($r('app.string.greeting')).fontSize($r('app.float.font_size_body')).fontColor($r('app.color.text_primary'))
```

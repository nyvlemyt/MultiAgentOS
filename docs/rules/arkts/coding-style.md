<!-- pattern from affaan-m/ecc rules/arkts/coding-style.md -->
---
origin: affaan-m/ecc
license: MIT
lang: arkts
concern: coding-style
---
# HarmonyOS / ArkTS Coding Style

ArkTS is a strict, statically-typed subset of TypeScript. Violating its constraints causes **compilation failures**, so this is a correctness standard, not just style.

## Type System (hard constraints)
- No `any` / `unknown` — always explicit types. Omit type annotations in `catch` clauses (no `any`/`unknown` there).
- No index access types, conditional type aliases / `infer`, intersection types (use inheritance), mapped types, `typeof` annotations, `as const`.
- No structural typing — use inheritance/interfaces/type aliases.
- Only these utility types: `Partial`, `Required`, `Readonly`, `Record`. For `Record<K,V>` the index expression type is `V | undefined`.

## Functions & Classes
- Arrow functions only (no function expressions, no nested functions). No generators — use `async`/`await`.
- No `apply`/`call`/`bind` — traditional OOP for `this`. No `this` in standalone functions or static methods.
- No constructor type expressions / signatures; declare class fields in the class body, not the constructor.
- No definite assignment (`let v!: T`), no `new.target`, no class literals, no using classes as values. One static block per class.

## Object & Property Access
- No dynamic field declaration or `obj["field"]` — use `obj.field`. No `delete` — mark absence with a nullable type set to `null`.
- No prototype assignment, no `in` operator (use `instanceof`), no reassigning object methods.
- No `Symbol()` except `Symbol.iterator`. No `globalThis`/global scope — explicit module imports/exports. No namespaces-as-objects.

## Destructuring, Spread, Modules
- No destructuring (declarations, assignments, or parameters) — field-by-field access. Spread only expands arrays into rest params/array literals.
- `import` only (no `require`, no `export =`, no import assertions, no UMD, no wildcard module names). All imports before any other statements. TS code must not import ArkTS code (reverse is allowed).

## Other Restrictions
- `let`/`const` only (no `var`). No `for...in` (use regular `for`). No `with`, no JSX, no `#private` (use `private`). No declaration merging, no index signatures.
- Unary `+ - ~` only on numerics (no implicit string conversion). Specify return types explicitly when inference is limited.
- Object literals supported only when the compiler can infer the class/interface; NOT for `any`/`Object`/`object`, types with methods, parameterized constructors, or `readonly` fields.

## Naming & Formatting
- Variables/functions `camelCase`; classes/interfaces `PascalCase`; constants `UPPER_SNAKE_CASE`. Files: `PascalCase` for components (`HomePage.ets`), `camelCase` for utilities.
- Double quotes, semicolons, complete type annotations on all methods/params/returns.

## File Organization
- One `@ComponentV2` per `.ets` file; one ViewModel per file; related data models may share a file. Keep files <400 lines; extract helpers before ~800.

## Error Handling
```typescript
try {
  return await riskyOperation()
} catch (error) {
  hilog.error(0x0000, 'TAG', 'Operation failed: %{public}s', error)
  throw new Error('User-friendly error message')
}
```

## Immutability
Create new instances instead of mutating — e.g. `updateUser` returns a fresh `UserModel` with the new field rather than assigning `user.name`.

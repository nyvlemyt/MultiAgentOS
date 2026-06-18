<!-- pattern from affaan-m/ecc rules/cpp/coding-style.md -->
---
origin: affaan-m/ecc
license: MIT
lang: cpp
concern: coding-style
---
# C++ Coding Style

Modern C++ (C++17/20/23) baseline.

## Modern C++
- Prefer modern features over C-style constructs.
- Use `auto` when the type is obvious from context.
- Use `constexpr` for compile-time constants.
- Use structured bindings: `auto [key, value] = map_entry;`.

## Resource Management
- RAII everywhere — no manual `new`/`delete`.
- `std::unique_ptr` for exclusive ownership; `std::shared_ptr` only when shared ownership is genuinely needed.
- Prefer `std::make_unique` / `std::make_shared` over raw `new`.

## Naming
- Types/Classes: `PascalCase`. Functions/Methods: `snake_case` or `camelCase` (follow project). Constants: `kPascalCase` or `UPPER_SNAKE_CASE`. Namespaces: `lowercase`. Member variables: `snake_case_` (trailing underscore) or `m_` prefix.

## Formatting
Use **clang-format** — no style debates. Run `clang-format -i <file>` before committing.

<!-- pattern from affaan-m/ecc rules/cpp/security.md -->
---
origin: affaan-m/ecc
license: MIT
lang: cpp
concern: security
---
# C++ Security

## Memory Safety
- Never raw `new`/`delete` — use smart pointers.
- Never C-style arrays — use `std::array` or `std::vector`.
- Never `malloc`/`free` — use C++ allocation.
- Avoid `reinterpret_cast` unless absolutely necessary.

## Buffer Overflows
- Prefer `std::string` over `char*`.
- Use `.at()` for bounds-checked access where safety matters.
- Never `strcpy` / `strcat` / `sprintf` — use `std::string` or `fmt::format`.

## Undefined Behavior
- Always initialize variables.
- Avoid signed integer overflow.
- Never dereference null or dangling pointers.
- Run sanitizers in CI: `cmake -DCMAKE_CXX_FLAGS="-fsanitize=address,undefined" ..`.

## Static Analysis
- **clang-tidy**: `clang-tidy --checks='*' src/*.cpp`.
- **cppcheck**: `cppcheck --enable=all src/`.

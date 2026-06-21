<!-- pattern from affaan-m/ecc rules/cpp/hooks.md -->
---
origin: affaan-m/ecc
license: MIT
lang: cpp
concern: hooks
---
# C++ Editor/Agent Hooks

Checks to run before committing C++ changes.

```bash
clang-format --dry-run --Werror src/*.cpp src/*.hpp   # format check
clang-tidy src/*.cpp -- -std=c++17                     # static analysis
cmake --build build                                    # build
ctest --test-dir build --output-on-failure             # tests
```

## Recommended CI Pipeline
1. **clang-format** — formatting check
2. **clang-tidy** — static analysis
3. **cppcheck** — additional analysis
4. **cmake build** — compilation
5. **ctest** — test execution with sanitizers

> Scope hooks to the active project's path only (MultiAgentOS §5 cross-project guard).

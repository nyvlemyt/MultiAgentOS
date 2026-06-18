<!-- pattern from affaan-m/ecc rules/cpp/testing.md -->
---
origin: affaan-m/ecc
license: MIT
lang: cpp
concern: testing
---
# C++ Testing

## Framework
Use **GoogleTest** (gtest/gmock) with **CMake/CTest**.

## Running
```bash
cmake --build build && ctest --test-dir build --output-on-failure
```

## Coverage
```bash
cmake -DCMAKE_CXX_FLAGS="--coverage" -DCMAKE_EXE_LINKER_FLAGS="--coverage" ..
cmake --build .
ctest --output-on-failure
lcov --capture --directory . --output-file coverage.info
```

## Sanitizers
Always run tests with sanitizers in CI: `cmake -DCMAKE_CXX_FLAGS="-fsanitize=address,undefined" ..`.

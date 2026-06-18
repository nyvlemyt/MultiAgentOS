<!-- pattern from affaan-m/ecc rules/cpp/patterns.md -->
---
origin: affaan-m/ecc
license: MIT
lang: cpp
concern: patterns
---
# C++ Patterns

## RAII (Resource Acquisition Is Initialization)
Tie resource lifetime to object lifetime; delete copy ops on owning handles.

```cpp
class FileHandle {
public:
    explicit FileHandle(const std::string& path) : file_(std::fopen(path.c_str(), "r")) {}
    ~FileHandle() { if (file_) std::fclose(file_); }
    FileHandle(const FileHandle&) = delete;
    FileHandle& operator=(const FileHandle&) = delete;
private:
    std::FILE* file_;
};
```

## Rule of Five / Zero
- **Rule of Zero**: prefer classes needing no custom destructor, copy/move ctor, or assignment.
- **Rule of Five**: if you define any of destructor / copy-ctor / copy-assign / move-ctor / move-assign, define all five.

## Value Semantics
- Pass small/trivial types by value, large types by `const&`.
- Return by value (rely on RVO/NRVO). Use move semantics for sink parameters.

## Error Handling
- Exceptions for exceptional conditions.
- `std::optional` for values that may not exist.
- `std::expected` (C++23) or a result type for expected failures.

---
origin: affaan-m/ecc
license: MIT
lang: python
concern: patterns
---
<!-- pattern from affaan-m/ecc rules/python/patterns.md -->

# Python — Patterns (reference)

## Protocol (duck typing)

```python
from typing import Protocol

class Repository(Protocol):
    def find_by_id(self, id: str) -> dict | None: ...
    def save(self, entity: dict) -> dict: ...
```

## Dataclasses as DTOs

```python
from dataclasses import dataclass

@dataclass
class CreateUserRequest:
    name: str
    email: str
    age: int | None = None
```

## Context managers & generators

- Use context managers (`with` statement) for resource management.
- Use generators for lazy evaluation and memory-efficient iteration.

## See also

- `docs/rules/python/coding-style.md` for typing and immutability conventions.

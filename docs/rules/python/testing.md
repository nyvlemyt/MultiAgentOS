---
origin: affaan-m/ecc
license: MIT
lang: python
concern: testing
---
<!-- pattern from affaan-m/ecc rules/python/testing.md -->

# Python — Testing (reference)

## Framework

Use **pytest** as the testing framework.

## Coverage

```bash
pytest --cov=src --cov-report=term-missing
```

## Test organization

Use `pytest.mark` for test categorization:

```python
import pytest

@pytest.mark.unit
def test_calculate_total():
    ...

@pytest.mark.integration
def test_database_connection():
    ...
```

## See also

- `superpowers:test-driven-development` for the RED → GREEN → REFACTOR loop (MAOS §7 default for new domain logic).

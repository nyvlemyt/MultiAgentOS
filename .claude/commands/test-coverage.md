---
description: "Analyze test coverage, identify gaps worst-first, and generate the missing tests toward an 80%+ threshold."
argument-hint: "[path | --threshold N] (default: 80, whole repo)"
---

<!-- pattern from affaan-m/ecc commands/test-coverage.md (MIT) — ported to MultiAgentOS conventions -->

# Test Coverage

Analyze test coverage, identify gaps, and generate the missing tests to reach the target threshold (default 80%). Tests are first-class in MultiAgentOS (Vitest, TDD per `superpowers:test-driven-development` for new domain logic — CLAUDE.md §7).

## Step 1: Detect Test Framework

| Indicator | Coverage Command |
|-----------|-----------------|
| `vitest.config.*` (MAOS default) | `pnpm vitest run --coverage` |
| `jest.config.*` or `package.json` jest | `npx jest --coverage --coverageReporters=json-summary` |
| `pytest.ini` / `pyproject.toml` pytest | `pytest --cov=src --cov-report=json` |
| `Cargo.toml` | `cargo llvm-cov --json` |
| `pom.xml` with JaCoCo | `mvn test jacoco:report` |
| `go.mod` | `go test -coverprofile=coverage.out ./...` |

In a pnpm workspace, scope to the relevant package (e.g. `pnpm --filter @mas/core vitest run --coverage`) rather than running the whole monorepo when only one package changed.

## Step 2: Analyze Coverage Report

1. Run the coverage command.
2. Parse the output (JSON summary or terminal output).
3. List files **below the threshold**, sorted worst-first.
4. For each under-covered file, identify:
   - Untested functions or methods
   - Missing branch coverage (if/else, switch, error paths)
   - Dead code that inflates the denominator

## Step 3: Generate Missing Tests

For each under-covered file, generate tests in this priority order:

1. **Happy path** — core functionality with valid inputs
2. **Error handling** — invalid inputs, missing data, failures
3. **Edge cases** — empty arrays, null/undefined, boundary values (0, -1, MAX_INT)
4. **Branch coverage** — each if/else, switch case, ternary

### Test Generation Rules

- Place tests per project convention (`foo.ts` → `foo.test.ts`).
- Reuse existing test patterns from the project (import style, assertion library, mocking approach).
- Mock external dependencies (database, APIs, file system). For MultiAgentOS domain logic, **mock the LLM** — never make a live model call in a unit test (CLAUDE.md §6, token discipline).
- Each test independent — no shared mutable state.
- Name tests descriptively: `creates user with duplicate email returns 409`.

## Step 4: Verify

1. Run the full suite — all tests must pass.
2. Re-run coverage — confirm improvement.
3. If still below threshold, repeat Step 3 for the remaining gaps.

## Step 5: Report

Show a before/after comparison:

```
Coverage Report
──────────────────────────────
File                      Before  After
packages/core/llm.ts      45%     88%
packages/tokens/meter.ts  32%     82%
──────────────────────────────
Overall:                  67%     84%  PASS
```

## Focus Areas

- Functions with complex branching (high cyclomatic complexity)
- Error handlers and catch blocks
- Domain logic in `packages/*` (Mission/Agent/Skill, token meter, risk classifier)
- Edge cases: null, undefined, empty string, empty array, zero, negative numbers

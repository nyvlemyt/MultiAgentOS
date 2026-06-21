---
name: ai-regression-testing
description: |
  Regression-testing strategy for AI-assisted development, where the same model writes and reviews
  code and so carries identical blind spots into both steps. Provides sandbox/mock-mode API testing
  (no database dependency), a bug-driven test-writing discipline (test the bug, not the happy path),
  and sandbox/production parity checks — the #1 AI-introduced regression.
  Use after an AI agent has modified API routes or backend logic, when a bug was just found and must
  not recur, or when a project has a sandbox/mock mode usable for DB-free tests.
  Do NOT use for chasing a coverage percentage, for visual/browser regression (use browser-qa), or
  as a substitute for the security gate on risky tasks (use mas-sec-reviewer).
summary: >-
  Regression testing for AI-written code. Core insight: when one model both writes and reviews a
  fix, it repeats the same category of mistake — AI self-review is not a substitute for automated
  tests. Patterns: force sandbox/mock mode so tests run DB-free and fast; write a test for every bug
  found (named after the bug, e.g. BUG-R1) rather than for code that already works; assert the
  response *contract* (required fields, shape) not the implementation; explicitly test sandbox vs
  production parity — the most common AI regression is fixing one path and forgetting the other.
  Grows test count organically with bug fixes; aims at regression prevention, not coverage %.
metadata:
  origin: affaan-m/ecc
  license: MIT
  cluster: skill:core-eval
  tier: T1
  status: library
---
<!-- pattern from affaan-m/ecc skills/ai-regression-testing/SKILL.md -->

## Overview

When an AI writes a fix and then reviews its own work, it carries the same assumptions into both
steps. The result is a predictable loop: *AI writes fix → AI reviews fix → "looks correct" → bug
still there.* Only an external, deterministic check breaks the loop. This skill is that check: a
lightweight regression-testing discipline tuned to how AI-introduced bugs actually cluster.

The dominant AI regression observed in practice is **sandbox/production path inconsistency** — a fix
lands on one code path (the production query) but not the mirror path (the sandbox/mock branch), or
vice versa. The same model reviews both and misses it because the same blind spot is present in the
review. Automated tests catch it on the first run.

In MultiAgentOS terms this aligns with TOKEN_STRATEGY (sandbox/mock-first keeps tests fast and
LLM-free) and is the executable companion to `mas-reviewer`: the reviewer reads, this skill asserts.

## When to Use / When NOT

**Use when:**
- An AI agent (Claude Code, Cursor, Codex) has modified API routes or backend logic.
- A bug was found and fixed — you need a test that prevents its re-introduction.
- The project has a sandbox/mock mode that can be leveraged for DB-free testing.
- Multiple code paths exist (sandbox vs production, feature flags) that can silently diverge.

**Do NOT use when:**
- You are chasing a coverage percentage — this skill writes tests for bugs, not for working code.
- The regression is visual/layout → `browser-qa`.
- You think AI self-review is enough — it is not; that assumption is the problem this skill solves.
- The task is risk:high/blocking — that needs `mas-sec-reviewer` first; this is not a security gate.

## Principles

*Source: `affaan-m/ecc skills/ai-regression-testing/SKILL.md` (production-observed patterns).*

1. **The same model's review inherits the same blind spot.** Self-review cannot catch a mistake
   rooted in an assumption the model also holds while reviewing. Only an external assertion can.
2. **Test the bug, not the happy path.** Write a regression test for every bug found (ideally before
   fixing it), named after the bug. Do not write tests for code that has never failed.
3. **Assert the contract, not the implementation.** Check the response *shape* (required fields,
   not-undefined, type) so the test survives refactors and pins the behavior that broke.
4. **Sandbox/production parity is the #1 AI regression.** Explicitly assert that both paths return
   the same contract; the most frequent failure is fixing one and forgetting the other.
5. **Fast and DB-free.** Force sandbox/mock mode so the full suite runs in under a second — fast
   tests get run every bug-check; slow ones get skipped.

## Process

1. **Find a sandbox/mock mode** (or add one): an env switch (`SANDBOX_MODE=true`) that bypasses the
   database with deterministic fixtures, so route handlers can be invoked directly in a test.
2. **Stand up a DB-free harness.** Force the sandbox env in test setup; build a tiny request helper
   (e.g. construct a framework request with method/body/headers/sandbox-user) and a response parser.
3. **Define the contract.** Enumerate the fields/shape the response MUST have. This list is the
   target the bug violated.
4. **Write the regression test first.** Reproduce the exact bug as a failing assertion, named after
   it (`notification_settings is not undefined (BUG-R1 regression)`). Confirm it fails, then fix.
5. **Add a parity test.** For any handler with sandbox + production branches, assert both return the
   same contract — this is where AI fixes most often diverge.
6. **Wire into the bug-check loop.** Run the suite as the *first* step of every bug-check/review, so
   a re-introduced regression is caught before any new analysis.
7. **Let coverage grow organically.** Each fixed bug adds one test; untested-but-working code stays
   untested until it earns a test by breaking.

## Rationalizations

| Excuse | Reality |
|---|---|
| "The AI already reviewed the fix, it's fine." | Self-review inherits the same blind spot. An external test is the only thing that breaks the loop. |
| "It's just sandbox mock data, no need to test it." | Sandbox/production divergence is the #1 AI regression. The mock path ships to users in sandbox mode. |
| "We should get coverage up to 80% first." | Coverage % is the wrong target. Test the bugs that occurred; coverage grows on its own. |
| "An integration test would be more thorough." | A fast sandbox-mode unit test that runs every bug-check beats a slow integration test that gets skipped. |
| "I'll add the test after I ship the fix." | Write it before the fix where possible — a test that never saw red proves nothing. |

## Red Flags

- A fix was made to one code path (production) and the mirror path (sandbox/mock) was not touched.
- The test suite needs a live database and takes long enough that it gets skipped during bug-checks.
- Tests assert implementation details (internal call order) instead of the response contract.
- "AI reviewed it" is offered as the sole verification for an AI-written fix.
- New tests are written for code that has never had a bug, while the bug-prone path stays untested.

## Verification Criteria

- [ ] A sandbox/mock mode exists and the suite runs DB-free in under ~1 second.
- [ ] Every bug fixed in this change has a named regression test that failed before the fix.
- [ ] Tests assert the response contract (required fields / not-undefined / type), not implementation.
- [ ] Every handler with sandbox + production branches has a parity test asserting identical contract.
- [ ] The suite is the first step of the bug-check workflow and currently passes.
- [ ] No test was added merely to raise a coverage percentage.

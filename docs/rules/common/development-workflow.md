---
origin: affaan-m/ecc
license: MIT
lang: common
concern: development-workflow
---
<!-- pattern from affaan-m/ecc rules/common/development-workflow.md -->

# Development Workflow (stack-agnostic)

The development pipeline that runs *before* git operations: research → plan → TDD → review → commit. Extends `docs/rules/common/git-workflow.md`. In MAOS this maps onto the mission lifecycle (planner → dispatcher → reviewer) and the per-phase learning bootstrap (CLAUDE.md §13).

## 0. Research & Reuse (mandatory before any new implementation)

This generalizes CLAUDE.md §9.bis (Voie 2 — "how do the open-source webuis do it?") to *all* code, not just SDK bridge code.

- **Code search first** — search existing repos (`gh search repos`, `gh search code`) and the project's own tree for an existing implementation or pattern before writing anything new.
- **Primary docs second** — confirm API behavior / version specifics against vendor docs.
- **Registries** — check npm / PyPI / crates.io for a battle-tested library before hand-rolling utility code.
- **Adaptable implementations** — look for an open-source project that solves 80%+ of the problem and can be ported (cite the source in a leading comment, per §9.bis).
- Prefer porting a proven approach over net-new code when it meets the requirement.

## 1. Plan first

Produce a plan before coding: scope, dependencies, risks, phase breakdown. (MAOS: `mas-mission-planner` emits the task DAG.)

## 2. TDD

Tests first (RED) → minimal implementation (GREEN) → refactor (IMPROVE). Verify the coverage floor. (CLAUDE.md §7: Vitest + `superpowers:test-driven-development`.)

## 3. Review

Run the review gate immediately after writing code. Address CRITICAL and HIGH before proceeding (see `code-review.md`).

## 4. Commit & push

Conventional Commits, descriptive messages (see `git-workflow.md` and CLAUDE.md §7).

## 5. Pre-review checks

CI green, conflicts resolved, branch up to date with target. Only then request review. (MAOS: the 5-check verification of CLAUDE.md §7, Sonar included.)

## Reference

- Pairs with `git-workflow.md`, `code-review.md`, `testing.md`.

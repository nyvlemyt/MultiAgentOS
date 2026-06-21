---
name: agent-eval
description: "Use to compare coding agents/models head-to-head on reproducible, repo-specific tasks (pass rate, time, consistency) before adopting one. Do NOT use for one-off code review, nor for runtime task dispatch."
summary: "Reproducible head-to-head evaluation of coding agents/models on YOUR codebase, replacing vibes with evidence. Define tasks declaratively (goal, files, prompt, deterministic judge pinned to a commit); run each candidate N times in an isolated git worktree; collect pass rate, wall-clock time, and consistency (e.g. 3/3). Always include one deterministic judge (tests/build) — LLM-judges add noise. Run >=3 trials because agents are non-deterministic; the spread is the signal. MAS variant: subscription-only, so the comparison axis is pass-rate x consistency x time, never per-token cost; the LLM-as-judge runs through packages/core/src/llm.ts. Output: a comparison table feeding an intake-audit dossier when choosing a model/agent for a phase."
metadata:
  origin: affaan-m/ecc
  license: MIT
  cluster: skill:core-agent
  tier: T1
  status: library
---

<!-- pattern from affaan-m/ecc skills/agent-eval/SKILL.md -->

# Agent Eval

## Overview

Every "which coding agent is best?" decision tends to run on vibes. This skill systematizes it: define a small set of tasks that mirror your real workload, run each candidate agent or model against them several times in isolation, and score the results with deterministic judges. The output is an evidence table that can justify adopting (or rejecting) a model/agent for a given MultiAgentOS phase, fed into an `intake-audit` dossier rather than a gut feeling.

This is an evaluation method, not a bundled binary. The MAS version reimplements the lens against local, user-authorized evidence only — no unpinned external CLI install, no third-party upload of your source.

## When to Use / When NOT

Use when:
- Choosing between coding agents or Claude model tiers (e.g. Opus vs Sonnet for a phase) on the actual repo.
- Running a regression check after a model/tooling update to confirm no quality drop.
- Producing a data-backed selection decision instead of an opinion.

Do NOT use for:
- One-off code review of a single change (use `mas-reviewer` / `Code Reviewer`).
- Runtime task dispatch or planning (that is the mission lifecycle).
- Cost benchmarking via per-token API spend — MAS is subscription-only (§11); the cost axis is forbidden.

## Principles

*Source: `affaan-m/ecc skills/agent-eval` + `docs/knowledge/agent-patterns.md` (pass@k, eval coverage) + CLAUDE.md §11 (subscription-only) / §6 (token discipline).*

1. **Evidence over vibes.** A selection claim that cannot point to a pass-rate table is not a decision.
2. **Non-determinism is the measurement.** Agents vary run to run; a single run is anecdote. Run >=3 trials and report the spread (consistency).
3. **Deterministic judges anchor the score.** At least one tests/build judge per task. LLM-as-judge is allowed but adds noise — never the sole judge.
4. **Reproducibility is pinned.** Tasks pin a commit so results are comparable across days/weeks. Task definitions are test fixtures — version them.
5. **No cost axis.** Under subscription billing, per-token `$` comparison is meaningless and forbidden (§11). Compare pass rate x consistency x time.
6. **Isolation, not interference.** Each run executes in its own git worktree so candidates cannot corrupt the base repo or each other.

## Process

1. **Select 3-5 real tasks.** Pick representative slices of your actual workload (a bugfix, a small feature, a refactor) — never toy examples.
2. **Define each task declaratively.** Record: `name`, `description`, target `files`, the `prompt`, a pinned `commit`, and one or more `judge` entries. Include at least one deterministic judge (`pytest`/`vitest`/`build` exit code or a `grep` pattern). Add an LLM judge only as a secondary signal, routed through `packages/core/src/llm.ts`.
3. **Run each candidate N>=3 times in isolation.** For every run: create a fresh git worktree from the pinned commit, hand the prompt to the candidate agent/model, then evaluate the judges. Record pass/fail and wall-clock time per run.
4. **Aggregate.** Per candidate per task compute: pass rate, consistency (passes/runs, e.g. 3/3 = 100%), median time, pass@1 and pass@3.
5. **Compare.** Produce a table (candidate x pass rate x time x consistency). Flag the lowest-variance high-pass candidate.
6. **Decide via intake-audit.** Feed the table into an `intake-audit` dossier when the result changes which model/agent a phase should use; record the decision and a re-audit date.

## Rationalizations

| Excuse | Reality |
|---|---|
| "I ran it once and it worked, ship it" | One run is anecdote. Agents are non-deterministic; >=3 trials or the result is noise. |
| "The LLM judge said it passed" | LLM judges add noise. Anchor every task with a deterministic tests/build judge. |
| "Cheaper model wins on cost" | MAS is subscription-only (§11). There is no per-token cost axis to win on. |
| "Toy tasks are faster to write" | Toy tasks don't predict real performance. Use real workload slices. |
| "No need to pin the commit" | Without a pinned commit the comparison drifts and is not reproducible. |

## Red Flags

- A model/agent was adopted with no pass-rate table behind it.
- Only one trial per candidate was run.
- The only judge is an LLM-as-judge.
- A `$`/per-token cost column appears in the report (§11 violation).
- Runs share a worktree or mutate the base repo.

## Verification Criteria (pass/fail)

- [ ] Each evaluated task has a pinned commit and >=1 deterministic judge.
- [ ] Each candidate ran >=3 trials; consistency is reported.
- [ ] The comparison table reports pass rate, time, consistency — and contains no per-token/$ cost column.
- [ ] Each run was isolated in its own git worktree; base repo unchanged.
- [ ] A selection decision (if any) is recorded in an `intake-audit` dossier with a re-audit date.

---
name: automation-audit-ops
description: |
  Evidence-first inventory and overlap audit of an environment's live automations — cron jobs,
  worker ticks, git hooks, GitHub Actions, MCP servers, connectors, and wrapper scripts — before
  changing anything. Produces a proof-backed surface table and a keep / merge / cut / fix-next
  recommendation per item, collapsing redundant automation into one canonical lane.
  Use when the user asks "what automations are live / broken / overlapping" or wants to know what
  was ported from another system and still needs rebuilding.
  Do NOT use to execute the fixes themselves (the mission lifecycle does that), to decide whether to
  adopt a NEW candidate (use intake-audit), or to triage memory candidates (use mas-memory-keeper).
summary: >-
  Audit-first operator skill for taking inventory of live automations before touching them. Reads
  the real surface (hooks, cron, CI workflows, MCP configs, connectors, wrappers) read-only, then
  classifies each item by live state (configured / authenticated / recently-verified / stale-or-
  broken / missing) and problem type (active breakage / auth outage / stale / overlap / missing).
  Every important claim is backed by a concrete proof path (file, workflow run, log, command
  output, failure signature) — "present in config" never counts as "working". Ends with one call
  per suspect surface: keep / merge / cut / fix-next. Value = collapsing noisy automation into a
  single canonical lane, not preserving every historical path.
metadata:
  origin: affaan-m/ecc
  license: MIT
  cluster: skill:core-eval
  tier: T1
  status: library
---
<!-- pattern from affaan-m/ecc skills/automation-audit-ops/SKILL.md -->

## Overview

Environments accumulate automation faster than they retire it: a cron job here, a git hook there, a
GitHub Action, an MCP server, a wrapper script someone wrote once. Over time nobody can say what is
actually running, what is silently broken, and where three things do the same job. This skill
produces an **evidence-backed inventory** and a disposition for each item *before* any rewrite, so
fixes target the real high-signal breakage instead of churning low-value redundancy.

It is audit-first and read-only by default. The deliverable is a surface table plus a keep / merge /
cut / fix-next call per suspect item — the opposite of "let me just rewrite this". In MultiAgentOS
this applies directly to the project's own automation surface: the worker dispatch tick, cron/
autopilot schedulers, MCP servers, git hooks, and CI workflows.

This is distinct from `intake-audit` (which decides whether to *adopt a new* candidate): this skill
audits what *already exists and runs*.

## When to Use / When NOT

**Use when:**
- The user asks "what automations do I have", "what is live", "what is broken", or "what overlaps".
- The task spans cron jobs, worker ticks, git hooks, CI workflows, MCP servers, connectors, wrappers.
- The user wants to know what was ported from another agent/system and what still needs rebuilding.
- The environment has accumulated multiple ways to do the same thing and needs one canonical lane.

**Do NOT use when:**
- You are executing the fixes — that is the mission lifecycle (planner → dispatcher → reviewer).
- You are evaluating a NEW external candidate for adoption → `intake-audit`.
- You are triaging memory candidates → `mas-memory-keeper`.
- The user asked for an inventory — do not widen it into a repo rewrite (see Red Flags).

## Principles

*Source: `affaan-m/ecc skills/automation-audit-ops/SKILL.md` (adapted: ECC-specific skill-stack and sibling-app references removed; scoped to local, user-authorized evidence only).*

1. **Evidence over memory.** Read the live surface before theorizing. Never answer from recollection
   when the actual config, log, or command output can be read.
2. **Configured ≠ working.** A reference in a config or a skill does not mean the automation runs.
   Separate configured / authenticated / recently-verified / stale-or-broken / missing.
3. **Every claim cites a proof path.** File path, workflow run, hook log, config entry, recent
   command output, or exact failure signature. No proof → mark the state ambiguous, do not guess.
4. **Collapse, don't preserve.** The value is one canonical lane, not the survival of every
   historical path. Each overlap gets a single disposition.
5. **Triage by signal, not by ease.** Name and fix the broken high-signal path before tidying
   low-value redundancy.
6. **Read-only until asked.** Start read-only; mutating fixes require explicit user request and,
   for anything risk ≥ high, the security gate (§5).

## Process

1. **Inventory the real surface.** Read the live automation: git hooks and local hook scripts;
   cron jobs and worker/scheduler ticks; CI and scheduled workflows; MCP configs and enabled
   servers; connector-/app-backed integrations; wrapper scripts and automation entrypoints. Group
   by surface: local runtime · repo CI/automation · connected external systems · messaging/
   notifications · billing/customer ops · research/monitoring.
2. **Classify each item by live state:** configured · authenticated · recently-verified ·
   stale-or-broken · missing. Then tag the problem type: active breakage · auth outage · stale
   status · overlap/redundancy · missing capability.
3. **Trace the proof path.** Back every important claim with a concrete source (file path, workflow
   run, hook log, config entry, command output, failure signature). If state is ambiguous, say so
   directly — never present an incomplete audit as complete.
4. **Decide per suspect surface:** keep · merge · cut · fix-next. For overlaps, pick the canonical
   lane and mark the rest.
5. **Name the next move:** the exact hook / workflow / cron / MCP / lane to strengthen — one
   concrete, high-signal action, not a backlog.

## Output Format

```text
CURRENT SURFACE
- automation | source | live state | proof

FINDINGS
- active breakage | overlap | stale status | missing capability

RECOMMENDATION
- keep | merge | cut | fix next   (one call per suspect surface)

NEXT MOVE
- exact hook / workflow / cron / MCP lane to strengthen
```

## Rationalizations

| Excuse | Reality |
|---|---|
| "It's in the config, so it's working." | Configured ≠ authenticated ≠ recently-verified. Prove the live state. |
| "I remember this job runs nightly." | Answer from the live log/run, not memory. Memory is how stale state hides. |
| "Let me just rewrite the messy parts while I'm here." | The user asked for inventory. Rewriting before the evidence table exists is scope creep. |
| "There's redundancy, let me delete the duplicates now." | Do not merge/delete overlapping surfaces until the evidence table justifies the canonical lane. |
| "The audit is basically complete." | If any state is ambiguous, say so. A confident incomplete audit is worse than an honest gap. |

## Red Flags

- Claiming a tool is live because a skill or config *references* it, with no run/log proof.
- Merging or deleting overlapping surfaces before the evidence table exists.
- Fixing low-value redundancy before naming the broken high-signal path.
- Widening an inventory request into a repo rewrite.
- A recommendation with no per-item keep/merge/cut/fix-next disposition.

## Verification Criteria

- [ ] Every important claim cites a concrete live proof path (file / run / log / command output).
- [ ] Each surfaced automation is labeled with exactly one live-state category.
- [ ] Each suspect/overlapping surface has exactly one disposition: keep / merge / cut / fix-next.
- [ ] No mutating change was made unless the user explicitly requested fixes (and §5 gate passed).
- [ ] Ambiguous states are reported as ambiguous, not asserted.
- [ ] The output ends with one concrete next move, not an open backlog.

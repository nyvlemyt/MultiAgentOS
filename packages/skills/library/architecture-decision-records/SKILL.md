---
name: architecture-decision-records
description: "Use to capture an architectural decision made during a mission as a structured ADR under docs/decisions/. Detects decision moments (framework/library/pattern/DB/API choices), records context, alternatives, rationale, consequences. Do NOT use to re-litigate an already-accepted ADR, nor to record trivial choices (naming, formatting)."
summary: "Capture architectural decisions as structured ADRs in docs/decisions/ (Nygard format: Context / Decision / Alternatives Considered / Consequences). Fires when a mission chooses between significant alternatives or the user says 'record this'. The why matters more than the what: every ADR records rejected alternatives and honest trade-offs so future sessions understand why the codebase is shaped this way. Never writes a file without explicit human confirmation (§5 — docs/decisions/ is a project-owned surface). Reads existing ADRs to answer 'why did we choose X?'. One decision = one ADR; supersession is linked, never silently overwritten."
metadata:
  origin: affaan-m/ecc
  license: MIT
  cluster: skill:core-agent
  tier: T1
  status: library
---
<!-- pattern from affaan-m/ecc skills/architecture-decision-records/SKILL.md -->

# Architecture Decision Records

## Overview

Architectural decisions die in chat threads and memory. This skill turns a decision moment inside a MultiAgentOS mission into a structured, durable ADR under `docs/decisions/` — the same directory CLAUDE.md §3 reserves for ADRs. An ADR records not just *what* was decided but *why*, *what else was considered*, and *what it costs*, so a future mission (or the Memory Keeper) can reconstruct the rationale without re-running the analysis.

This is a Nygard-style lightweight ADR adapted for AI-assisted development: short enough to read in two minutes, complete enough to defend the decision a year later.

## When to Use / When NOT

**Use when**
- A mission chooses between significant alternatives: framework, library, pattern, database, API shape, auth strategy, deployment model.
- The user (or an agent) says "record this", "ADR this", "the reason we did X instead of Y is…".
- A user asks "why did we choose X?" → read the existing ADRs and answer from them.
- The mission planner proposes an architecture change → suggest an ADR.

**Do NOT use when**
- Re-litigating an ADR that is already `accepted` — ADRs are decided; the intake-audit skill feeds them, this skill does not override them.
- Recording trivial choices (variable naming, formatting, a one-line refactor).
- Auto-writing without consent — `docs/decisions/` is a project-owned surface (§5); writes wait for a human click.

## Principles

*Source: affaan-m/ecc `skills/architecture-decision-records` + Michael Nygard's ADR format + CLAUDE.md §3 (docs/decisions/) and §5 (no silent writes to project surfaces).*

1. **The why outweighs the what.** A decision without recorded rationale and rejected alternatives is not an ADR — it is a changelog line.
2. **Honest consequences.** Every decision has trade-offs; an ADR that lists only benefits is propaganda. Record positive, negative, and risk.
3. **No silent writes.** `docs/decisions/` belongs to the project. Present the draft; write only after explicit human confirmation (§5). Decline = discard, no file.
4. **Supersession over overwrite.** A reversed decision becomes a new ADR that links back; the old one is marked `superseded by`, never deleted or edited away.
5. **One decision, one ADR.** Bundling decisions hides rationale and breaks the index.

## Process

1. **Detect the decision.** Watch for explicit signals ("let's go with X", "record this as an ADR") and implicit ones (comparing two frameworks and concluding, choosing a schema strategy with stated rationale). On an implicit signal, *suggest* recording — never auto-create.
2. **Confirm directory.** If `docs/decisions/` lacks an index, propose creating `README.md` (index table) — ask first; do not create files without consent.
3. **Extract the core choice.** State the single architectural decision in one sentence.
4. **Gather context.** What problem forced this? What constraints (token budget, local-first, subscription-only, phase) apply?
5. **Document alternatives.** For each rejected option: pros, cons, and the specific reason it lost.
6. **State consequences.** Positive, negative, and risks-with-mitigation — honestly.
7. **Assign a number.** Scan `docs/decisions/` for the highest `NNNN` and increment.
8. **Present the draft for approval.** Show the full ADR. Write to `docs/decisions/NNNN-<kebab-title>.md` only on explicit approval; otherwise discard.
9. **Update the index** at `docs/decisions/README.md` (ADR / Title / Status / Date).

### ADR format

```markdown
# ADR-NNNN: [Decision Title]

**Date**: YYYY-MM-DD
**Status**: proposed | accepted | deprecated | superseded by ADR-NNNN
**Deciders**: [who was involved]

## Context
[2-5 sentences: situation, constraints, forces]

## Decision
[1-3 sentences stating the decision in present tense — "We use X"]

## Alternatives Considered
### Alternative 1: [Name]
- Pros / Cons / Why not

## Consequences
### Positive / ### Negative / ### Risks
```

### Lifecycle

`proposed → accepted → [deprecated | superseded by ADR-NNNN]`. A superseded ADR always links its replacement.

## Rationalizations

| Excuse | Reality |
|---|---|
| "It's obvious why we picked it, skip the ADR" | Obvious today, opaque in six months. The rationale is the whole point. |
| "I'll just write the file, it's only docs" | `docs/decisions/` is a project surface (§5). Draft → confirm → write. Never silent. |
| "Let me also fix this old ADR while I'm here" | Accepted ADRs are immutable. Reversal = a new ADR that supersedes, with a link. |
| "We considered no alternatives, just record the choice" | "We just picked it" is not a rationale. If there were no alternatives, say why none existed. |
| "List the upsides, the downsides will scare the reviewer" | An ADR with no trade-offs is untrustworthy. Honesty is the value. |

## Red Flags

- You are about to write `docs/decisions/NNNN-*.md` without showing the user the draft first.
- The Alternatives Considered section is empty or says "n/a".
- You are editing an `accepted` ADR's decision text instead of superseding it.
- The Context section is an essay (> ~10 lines) — too long for a 2-minute read.
- You are recording a naming or formatting choice — not ADR-worthy.

## Verification Criteria (pass/fail)

- [ ] PASS only if the ADR has all four sections: Context, Decision, Alternatives Considered, Consequences.
- [ ] PASS only if at least one rejected alternative is documented with a "why not".
- [ ] PASS only if the file was written after explicit human approval (or NOT written if declined).
- [ ] PASS only if a unique incremented `NNNN` was assigned and the index in `docs/decisions/README.md` was updated.
- [ ] FAIL if an existing `accepted` ADR's decision text was modified instead of superseded.

---
name: intake-audit
description: "Use to decide whether ANY candidate addition (resource, skill, agent, MCP, repo, note, course, pattern, idea, principle) enters MultiAgentOS, producing an intake dossier at docs/intake/<date>-<slug>.md. Use BEFORE installing, adopting, or distilling anything new. Do NOT use to execute the integration itself (mission lifecycle does that), and do NOT use for routine memory-candidate triage (that is mas-memory-keeper)."
domain: memory
tags: ["intake", "audit", "dossier", "decision", "kill-criteria", "reversibility"]
summary: "Universal should-we-add-this audit. Steps: guardrails check → identity → project fit → 3 costs (install/maintenance/REMOVAL) → 7-axis scoring 0-5 → KILL criteria veto → decision enum (implement_now/adapt_now/backlog_next/watch/reject) → appropriation → integration plan → re-audit date. Output: one dossier per item at docs/intake/<date>-<slug>.md feeding the Ideas Inbox / Decision Log. The goal is to DECIDE, not to integrate — an audit that cannot say reject is broken. Any PAYG/API-key requirement = automatic reject (§11). Repo/course ingestion requires mas-sec-reviewer PASS first (§5)."
---

# Intake Audit

You audit a candidate addition to MultiAgentOS and produce a decision dossier. The goal is to **decide**, not to integrate. An audit that cannot say `reject` is broken.

## When to Use
- A new resource / skill / agent / MCP / repo / note / course / pattern / idea / principle is proposed for the project
- A mission or a user surfaces "we should add X"
- Re-audit date of a previous dossier is reached

## When NOT to Use
- Executing the integration (the mission lifecycle does that: planner → dispatcher → reviewer)
- Triage of `memory_candidates` rows (that is `mas-memory-keeper`)
- Re-litigating an ADR — ADRs are decided; this skill feeds them, it does not override them

## Principles

*Source: `docs/workflows/intake-audit-template.md` + `docs/decisions/0004-memory-intake-and-auto-capture.md` + CLAUDE.md §5/§11/§12/§13.*

1. **Decide, don't accumulate.** The default outcome is NOT "add it". Five decisions exist; two of them say no.
2. **Reversibility is a first-class cost.** A skill is easy to remove; a framework that takes root is not. Removal cost weighs as much as install cost.
3. **Hard constraints veto scores.** A perfect score with a PAYG dependency is still `reject` (§11). KILL criteria are independent of scoring.
4. **The principle can be kept when the implementation is rejected.** Heavy framework → extract the pattern, backlog the code (`frameworks-to-mine.md`).
5. **Security gates are not optional.** Anything that can execute code or reach repos requires `mas-sec-reviewer` PASS before ingestion (§5); `risk: blocking` always pauses for a human.
6. **Phase discipline.** Out-of-phase scope → `backlog_next` with a target phase, never a back-door install.

## Process

1. **Guardrails (step 0).** Restate the hard constraints: local-first, subscription-only (§11), Memory Keeper sole writer (§8), ≤7 tools/agent, risky actions gated (§5), no new framework without ADR. Any violation → `reject` or `adapt_now`, never `implement_now` as-is.
2. **Identity.** What exactly is it, source link, recency signal, obsolescence (low/medium/high), 3–6 bullet summary.
3. **Fit.** What does it concretely improve (file/phase-linked)? Which surface does it touch? Duplicate of something in `docs/knowledge/`, a `mas-*` skill, or an agent? Duplicate → `reject` or merge via `adapt_now`.
4. **Three costs.** Install (effort + tokens), maintenance (who, how often, drift), **removal** (reversible or rooted?).
5. **Score 0–5** on: `project_fit · token_efficiency · safety · implementation_effort · evidence_maturity · user_value · phase_compatibility`.
6. **KILL criteria (veto).** Paid API key / PAYG → reject. Executes code without sec audit → blocked until `mas-sec-reviewer` PASS. Touches email/finance/payment/secrets/deploy → Security Reviewer first. Heavy framework → extract principle only. Out of phase → backlog_next. Weak evidence → watch.
7. **Decision enum**: `implement_now · adapt_now · backlog_next · watch · reject` + 2–4 line justification tied to a constraint or file.
8. **Appropriation** (if kept): what is the *MultiAgentOS* version; how to make it cheaper (L1 summary, mock LLM, cache, deterministic scoring).
9. **Integration plan** (if kept): target phase, files, agents/skills, token budget, binary DoD, human validation if risk ≥ high, what NOT to do. Execution reuses the mission lifecycle.
10. **Re-audit date** or condition ("re-check if repo >6 months stale").
11. **Write the dossier** to `docs/intake/<YYYY-MM-DD>-<slug>.md` (skeleton in `intake-audit-template.md`). One item = one pass = one dossier.

## Rationalizations Table

| Excuse | Reality |
|---|---|
| "It's popular (20k stars), just add it" | Stars ≠ fit. Score it; popularity is one axis (`evidence_maturity`), not the decision. |
| "It's free to try" | Install is one of THREE costs. Maintenance and removal usually dominate. |
| "We can skip the dossier, it's obviously good" | One item = one dossier. "Obvious" is how scope creep enters. |
| "The API key is only for a quick test" | §11 has no test exception. PAYG = automatic reject. |
| "The sec review can come after we look at the code" | Reading a repo into intake IS ingestion. PASS comes first (§5). |
| "It fits a future phase, let's wire it now while we're here" | Out-of-phase = `backlog_next`. Back-door scope breaks phase gates. |
| "Rejecting feels wasteful after this analysis" | The dossier IS the value: a recorded `reject` prevents re-auditing the same item from scratch. |

## Red Flags — stop and re-run the audit

- You are writing integration code before the decision enum is filled in
- The dossier has no KILL-criteria section, or every criterion is "n/a"
- The decision is `implement_now` but a guardrail violation is noted above it
- No re-audit date and no removal-cost estimate
- The item requires `ANTHROPIC_API_KEY` or any per-token billing anywhere
- A repo's contents are being summarized before any `sec_review_verdict` PASS exists

## Verification Criteria (binary)

- [ ] Dossier exists at `docs/intake/<date>-<slug>.md` with identity, fit, 3 costs, scores, KILL, decision, re-audit date
- [ ] Decision is exactly one of the 5 enum values, justified in ≤4 lines
- [ ] If kind is repo/course: a `sec_review_verdict` PASS event precedes ingestion
- [ ] If decision is keep-ish: integration plan names target phase + binary DoD
- [ ] If decision is `reject`/`watch`: re-audit condition recorded
- [ ] No code or dependency was added by the audit itself

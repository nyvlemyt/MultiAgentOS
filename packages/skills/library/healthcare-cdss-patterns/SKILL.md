---
name: healthcare-cdss-patterns
description: "Use to build Clinical Decision Support System (CDSS) logic: drug-interaction checking, dose validation, clinical scoring (NEWS2, qSOFA, GCS), and alert severity classification feeding an EMR workflow. CDSS is patient-safety critical — zero tolerance for false negatives. Use when implementing medication safety, lab interpretation, or early-warning scores in a clinical app. Do NOT use for non-clinical alerting, generic form validation, or UI styling unrelated to safety alerts."
summary: "CDSS as a pure-function library (input clinical data → severity-sorted alerts, no side effects, fully testable). Three modules: checkInteractions (bidirectional drug-drug + cross-reactive allergy checks), validateDose (weight/age/renal/absolute caps — BLOCK, never pass, when a required factor like weight is missing), and clinical scores matched exactly to published specs (NEWS2 per Royal College of Physicians). Severity drives UI: critical=blocking non-dismissable modal + documented override in audit trail, major=acknowledge, minor=info — never toasts. Tests: every interaction pair both directions, 100% pass; a single missed interaction is a patient-safety event. T2 healthcare vertical."
metadata:
  origin: affaan-m/ecc
  license: MIT
  cluster: skill:core-agent
  tier: T2
  status: library
---

<!-- pattern from affaan-m/ecc skills/healthcare-cdss-patterns/SKILL.md -->

# Healthcare CDSS Patterns

## Overview

Patterns for building Clinical Decision Support logic that plugs into an EMR workflow. The CDSS engine is a **pure function library with zero side effects**: clinical data in, severity-sorted alerts out. Purity makes it exhaustively testable, and exhaustive testing is mandatory because CDSS is patient-safety critical — a single missed interaction is a clinical incident, not a bug. The engine never decides UI; it returns classified alerts that the EMR renders and gates on.

## When to Use / When NOT

Use when:
- Implementing drug-interaction checking, dose validation, or medication order-entry safety.
- Building clinical scoring (NEWS2, qSOFA, APACHE, GCS) or abnormal-value alerting.
- Interpreting lab results in clinical context.

Do NOT use when:
- The alerting is non-clinical (generic notifications, business rules).
- The task is plain form validation or UI styling unrelated to safety alerts.

## Principles

*Source: affaan-m/ecc `skills/healthcare-cdss-patterns/SKILL.md` (contributed by Dr. Keyur Patel, Health1).*

1. **Zero tolerance for false negatives.** A missed interaction is a patient-safety event. The whole design optimizes against silently passing a real danger.
2. **Pure functions, no side effects.** The engine takes clinical data and returns alerts — no I/O, no hidden state — so every rule is unit-testable in isolation.
3. **Missing required data BLOCKS, never passes.** If a rule needs weight (mg/kg drug) and weight is absent, the result is invalid, not "assume safe."
4. **Interactions are bidirectional.** If A interacts with B, B interacts with A. Both directions are tested.
5. **Fail loud.** Errors in the CDSS engine surface visibly; they are never silently caught.
6. **Severity drives a defined UI contract.** Critical blocks (non-dismissable, documented override stored in the audit trail); major requires acknowledgment; minor is informational. Critical alerts are never toasts.

## Process

1. **Model the data.** Define typed structures — `DrugInteractionPair` (drugA/drugB/severity/mechanism/clinicalEffect/recommendation), dose rules (weight/age/renal/absolute caps), score inputs. No `any` for clinical data.
2. **Check interactions.** For a new drug, scan current medications (both directions) and the allergy list (cross-reactivity → critical). Return alerts sorted by severity.
3. **Validate dose.** Apply rules in order: required-factor presence (missing weight → invalid/blocked), weight-based max, age-adjusted max, renal-adjusted max, absolute max. Return validity, a message, a suggested range, and the factors applied.
4. **Score clinically.** Implement scores (e.g. NEWS2) matching the published specification exactly; return total, risk band, per-component breakdown, and escalation guidance.
5. **Classify severity → UI behavior.** Map each alert to critical (block + documented override) / major (acknowledge) / minor (info). Store override reasons in the audit trail.
6. **Test exhaustively.** Drive every interaction pair both directions, every dose edge (including missing-weight block), every scoring boundary, and malformed input (must not throw). CRITICAL suites require 100% pass.

## Rationalizations

| Excuse | Reality |
|---|---|
| "If weight is missing, just skip the weight-based check" | Skipping = silently passing a possibly lethal dose. Missing required data BLOCKS. |
| "Toast the critical interaction so it's less intrusive" | Critical alerts must block with a non-dismissable modal and a documented override. Never a toast. |
| "We only need to test A→B, B→A is symmetric anyway" | Symmetry is an assumption to *verify*. Test both directions explicitly. |
| "Catch CDSS errors quietly so the UI doesn't break" | Silent failure hides a safety gap. Fail loud and surface it. |
| "Hardcode the interaction pairs inline, it's faster" | Use a maintainable data structure; hardcoded pairs rot and get partially updated. |

## Red Flags

- A CDSS check is optional/skippable without a documented reason.
- A critical alert is implemented as a toast or is auto-dismissable.
- `any` types used for drug or clinical data.
- Weight-based validation passes when weight is unavailable.
- Errors in the engine are silently caught.
- A clinical score deviates from its published specification.

## Verification Criteria (pass/fail)

- [ ] The CDSS engine is pure (no side effects) and fully unit-tested.
- [ ] Every interaction pair is tested in both directions; CRITICAL suites pass at 100%.
- [ ] Dose validation BLOCKS (returns invalid) when a required factor (e.g. weight) is missing.
- [ ] Clinical scores match their published specifications exactly.
- [ ] Critical alerts block via a non-dismissable modal and require a documented override stored in the audit trail.
- [ ] No `any` types on clinical data; engine errors fail loud, never silently caught.

---
name: healthcare-eval-harness
description: "Use to gate deployment of an EMR/EHR application on patient-safety verification: an automated suite across CDSS accuracy, PHI exposure, data integrity, clinical workflow, and integration compliance. The three safety categories are CRITICAL gates requiring 100% pass — a single failure BLOCKS deployment. Use before any clinical-app deploy, after changing CDSS logic, patient-data schemas, or auth. Do NOT use as a generic test runner or for non-clinical apps where 100% gates are inappropriate."
summary: "Patient-safety deployment gate, five categories run in order. CRITICAL (100%, blocks deploy): CDSS Accuracy (every interaction pair both directions, dose rules, scores vs spec, no false negatives), PHI Exposure (no leaks in errors/logs/URLs/storage, cross-facility isolation, no service-role-key exposure), Data Integrity (locked encounters, audit entries, cascade-delete protection, no orphans). HIGH (95%+, warn): Clinical Workflow, Integration (HL7/FHIR). Critical suites run with bail-on-first-failure + coverage thresholds; framework-agnostic (Jest/Vitest/pytest). MAS: runs against local user-authorized code only, results emitted as a structured verdict; deploy is a gated action. T2 healthcare vertical."
metadata:
  origin: affaan-m/ecc
  license: MIT
  cluster: skill:core-agent
  tier: T2
  status: library
---

<!-- pattern from affaan-m/ecc skills/healthcare-eval-harness/SKILL.md -->

# Healthcare Eval Harness — Patient Safety Verification

## Overview

An automated verification gate for healthcare application deployments. It runs five test categories in order; the first three are CRITICAL gates that require a 100% pass rate, where a single failure blocks the deploy, and the last two are HIGH gates requiring 95%+ that warn-and-allow-with-review. Patient safety is non-negotiable, so the harness biases hard toward blocking. The reference examples use Jest, but the categories and thresholds are framework-agnostic (Vitest, pytest, PHPUnit, etc.).

## When to Use / When NOT

Use when:
- Before any deployment of an EMR/EHR application.
- After modifying CDSS logic, patient-data schemas, or authentication/access control.
- Configuring a CI/CD pipeline for a healthcare app, or after merge conflicts in clinical modules.

Do NOT use when:
- The app is non-clinical and 100% blocking gates are inappropriate.
- You only need a generic test runner with no safety semantics.

## Principles

*Source: affaan-m/ecc `skills/healthcare-eval-harness/SKILL.md` (contributed by Dr. Keyur Patel, Health1).*

1. **A single CRITICAL failure blocks the deploy.** CDSS Accuracy, PHI Exposure, and Data Integrity are 100%-or-block. There is no "it passed last time."
2. **Bail early on critical suites.** Critical gates run stop-on-first-failure so a safety regression is unmissable, not buried in a long log.
3. **Test the real logic, never mock the engine.** Mocking the CDSS engine in integration tests defeats the gate; it must exercise the real rules.
4. **Coverage is part of the gate.** Critical suites run with explicit coverage thresholds, not just pass counts.
5. **PHI exposure is a first-class category.** Leaks in error responses, logs, URL params, browser storage, cross-facility access, and service-role-key presence are all tested.
6. **HIGH gates warn, they do not silently pass.** Below 95% they surface a warning for review rather than blocking, but a zero-test category is itself a failure.

## Process

1. **Category 1 — CDSS Accuracy (CRITICAL, 100%).** Run the clinical-decision suite (interaction pairs both directions, dose rules, scores vs published spec, no false negatives) with bail + coverage threshold. Any failure → BLOCK.
2. **Category 2 — PHI Exposure (CRITICAL, 100%).** Test for protected-health-info leaks across error responses, console output, URL params, browser storage, cross-facility isolation, unauthenticated access, and absence of service-role keys. Bail. Any failure → BLOCK.
3. **Category 3 — Data Integrity (CRITICAL, 100%).** Test locked encounters, audit-trail entries, cascade-delete protection, concurrent-edit handling, no orphaned records. Bail. Any failure → BLOCK.
4. **Category 4 — Clinical Workflow (HIGH, 95%+).** Run end-to-end flows (encounter lifecycle, templates, medication sets, search, prescription PDF, red-flag alerts); compute pass rate; a zero-test result is a hard failure, below 95% is a warning.
5. **Category 5 — Integration Compliance (HIGH, 95%+).** Validate HL7 v2.x parsing, FHIR resources, lab-result mapping, malformed-message handling; same pass-rate logic.
6. **Emit a verdict report** — per-category tests/pass/fail/status, overall coverage vs target, and a final SAFE-TO-DEPLOY / BLOCKED verdict.

## MAS Appropriation (how this differs from the source)

- **Local, user-authorized evidence only.** The harness runs the project's own test suite against the locally-registered project path; it uploads nothing and calls no third-party scanner.
- **Deploy is a gated action.** The harness returns a verdict; acting on a SAFE verdict (the actual deployment) is a separate risk-gated step under the autonomy rules (CLAUDE.md §5), never auto-triggered by a green run.
- **Framework-neutral invocation.** Test commands resolve to the project's configured runner (the MAS stack uses Vitest); the Jest examples are illustrative only.

## Rationalizations

| Excuse | Reality |
|---|---|
| "CDSS passed last release, skip it this time" | Every deploy re-runs the safety gate. No category is grandfathered. |
| "Set the critical threshold to 99% so flaky tests don't block us" | CRITICAL gates are 100% by definition. A flaky safety test is a defect to fix, not a threshold to lower. |
| "Mock the CDSS engine in integration so tests are faster" | Mocking the engine voids the gate. Integration must exercise the real rules. |
| "Run critical suites without bail to see all failures" | Bail makes the first safety regression unmissable. Critical suites bail. |
| "Skip coverage on CDSS, the pass count is enough" | Coverage thresholds are part of the critical gate; uncovered branches hide false negatives. |

## Red Flags

- A CRITICAL threshold set below 100%.
- Critical suites run with `--no-bail` or without coverage.
- The CDSS engine mocked in integration tests.
- A deployment allowed while the safety gate is red.
- The harness uploading code or results to an external service, or acting on a SAFE verdict to deploy without a gate.

## Verification Criteria (pass/fail)

- [ ] Five categories run in order; CDSS Accuracy, PHI Exposure, Data Integrity are 100%-or-block.
- [ ] Critical suites run bail-on-first-failure with explicit coverage thresholds.
- [ ] The CDSS engine is exercised for real (not mocked) in integration tests.
- [ ] HIGH gates compute a real pass rate; a zero-test category fails hard, <95% warns.
- [ ] A structured verdict report (per-category status + coverage + SAFE/BLOCKED) is emitted.
- [ ] Runs against local user-authorized code only; deployment on a SAFE verdict remains a separate gated action.

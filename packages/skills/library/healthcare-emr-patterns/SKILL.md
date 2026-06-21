---
name: healthcare-emr-patterns
description: "Use to build EMR/EHR application workflows: single-page patient encounters, structured clinical note-taking, prescription/medication modules with interaction checking, locked-encounter + addendum audit trails, lab/vitals displays with reference-range flagging, and accessibility-first clinical data entry. Use when patient safety, clinical accuracy, and practitioner efficiency are the design constraints. Do NOT use for the CDSS rule logic itself (use healthcare-cdss-patterns) or for non-clinical CRUD apps."
summary: "EMR/EHR UI + workflow patterns. Every decision passes the test 'could this harm a patient?': drug interactions alert (never silent), abnormal labs flagged, critical vitals escalate, no data change without audit trail. Single-page vertical encounter flow (complaint→exam→vitals→diagnosis→meds→plan→sign), smart templates whose red flags fire non-dismissable alerts, medication safety pipeline (critical interaction BLOCKS prescribing, documented override only), locked encounters (post-sign = addendum-only, both in timeline). Healthcare accessibility is stricter: 4.5:1 contrast, 44px targets, keyboard nav, no color-only indicators, no auto-dismiss toasts for clinical alerts. T2 healthcare vertical."
metadata:
  origin: affaan-m/ecc
  license: MIT
  cluster: skill:core-agent
  tier: T2
  status: library
---

<!-- pattern from affaan-m/ecc skills/healthcare-emr-patterns/SKILL.md -->

# Healthcare EMR Patterns

## Overview

Patterns for building Electronic Medical/Health Record systems where patient safety, clinical accuracy, and practitioner efficiency are the binding constraints. Every design choice is evaluated against one question — "could this harm a patient?" — which produces hard rules: interactions alert rather than pass silently, abnormal values are flagged, critical vitals escalate, and no clinical data changes without an audit trail. This skill covers the *workflow and UI*; the safety rule engine itself lives in `healthcare-cdss-patterns`.

## When to Use / When NOT

Use when:
- Building patient encounter workflows (complaint → exam → diagnosis → prescription).
- Implementing structured/free-text/voice clinical notes, prescription modules, or lab/vitals displays.
- Designing audit trails and accessibility-first clinical data entry.

Do NOT use when:
- The task is the CDSS rule logic (use `healthcare-cdss-patterns`).
- The app is a non-clinical CRUD application without safety/audit requirements.

## Principles

*Source: affaan-m/ecc `skills/healthcare-emr-patterns/SKILL.md` (contributed by Dr. Keyur Patel, Health1).*

1. **Patient safety first.** Interactions must alert (not silently pass); abnormal labs must be flagged; critical vitals must trigger escalation; no clinical change without an audit trail.
2. **Single-page encounter flow.** The encounter scrolls vertically (complaint → HPI → exam → vitals → diagnosis → meds → investigations → plan → sign); tab-fragmented UIs break the clinical thought process.
3. **Critical alerts block; they are never toasts.** Red-flag template items and critical interactions render non-dismissable; the clinician must actively act, and overrides are documented in the audit trail.
4. **Signed encounters are immutable.** After signing, only a linked addendum is allowed; original and addendum both appear in the timeline.
5. **Healthcare accessibility is stricter than typical web.** 4.5:1 contrast, 44×44px targets, full keyboard nav, no color-only indicators, screen-reader labels, no auto-dismissing toasts for clinical alerts.
6. **No clinical data in volatile/unaudited storage.** No localStorage for clinical data; every modification is captured with who/when.

## Process

1. **Lay out a sticky patient header** (demographics, allergies, active medications) always visible above a vertically scrolling encounter.
2. **Drive structured note-taking with smart templates** — clickable symptom chips, required fields, ICD/SNOMED suggestions, and `redFlags` that fire a non-dismissable alert when matched.
3. **Run the medication safety pipeline on drug selection:** check current meds → encounter meds → allergies → validate dose (weight/age/renal). Critical interaction → BLOCK prescribing; clinician documents an override reason stored in the audit trail; major → require acknowledgment. Log every alert and override.
4. **Display vitals and labs with reference-range highlighting** (green/yellow/red plus text/icon — never color alone), trend vs previous, auto-calculated scores with inline escalation, and non-dismissable alerts for critical values.
5. **Lock encounters on sign.** Disable edits, expose only "Add Addendum" (a separate linked record), and show both in the timeline with timestamps and signer identity.
6. **Generate prescriptions** as one-click PDFs with demographics, allergies, diagnosis, drug details, and a signature block.
7. **Enforce healthcare accessibility** on every clinical surface per the contrast/target/keyboard/no-color-only/screen-reader/no-toast rules.

## Rationalizations

| Excuse | Reality |
|---|---|
| "Cache the encounter in localStorage so it survives reloads" | Clinical data in volatile/unaudited storage is unsafe. Persist with an audit trail. |
| "A toast for the critical alert is fine, doctors are busy" | Critical alerts must be non-dismissable and actively acknowledged. Never a toast. |
| "Let the doctor edit the signed note to fix a typo" | Signed encounters are immutable. Corrections are linked addenda, both kept in the timeline. |
| "Tabs make the encounter cleaner" | Tab-fragmented encounters break the clinical workflow; use a single vertical flow. |
| "Color alone is enough to flag the abnormal value" | Colorblind clinicians need text/icon too; never color-only indicators. |

## Red Flags

- Clinical data stored in browser localStorage or without an audit trail.
- Dismissable toasts used for critical clinical alerts.
- Tab-based encounter UI fragmenting the clinical workflow.
- Edits allowed on signed/locked encounters.
- Color-only abnormal-value indicators; contrast below 4.5:1; missing screen-reader labels.
- `any` types used for clinical data structures.

## Verification Criteria (pass/fail)

- [ ] Encounter is a single vertical flow under a sticky patient header (allergies + active meds visible).
- [ ] Critical interactions block prescribing; overrides require a documented reason in the audit trail.
- [ ] Red-flag template items and critical values render as non-dismissable alerts, never toasts.
- [ ] Signed encounters are immutable; corrections are linked addenda shown in the timeline.
- [ ] Vitals/labs use reference-range highlighting paired with text/icon (not color alone) plus trend.
- [ ] Accessibility met: 4.5:1 contrast, 44px targets, keyboard nav, screen-reader labels; no clinical data in localStorage; no `any` on clinical types.

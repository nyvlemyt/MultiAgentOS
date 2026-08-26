---
id: >-
  resource-s7-divers-doc-ext-certiport-compass-cloud-test-candidate-guide-en-v2-4-2-pdf-387adb68
slug: >-
  resource-s7-divers-doc-ext-certiport-compass-cloud-test-candidate-guide-en-v2-4-2-pdf-387adb68
source_key: 'sha256:387adb6855a098a27fd54894998cfda5a52f6af98a1fbcc1911b7bba4dc6270e'
part_of: S7 - Divers
order: 1
manifest: null
derived_from: 'sha256:387adb6855a098a27fd54894998cfda5a52f6af98a1fbcc1911b7bba4dc6270e'
sources: []
lifecycle: distilled
superseded_by: null
trust: untrusted
ocr_confidence: null
retrieval_context: null
quality_score: null
kind: resource
register: learnings
scope: global
doc_type: reference
actionability: resource
lane: resources
schema_version: '1'
tags:
  - certiport
  - compass-cloud
  - exam
  - testing-center
  - proctoring
  - certification
domain: certification-testing
---
# S7 - Divers — DOC-EXT-CERTIPORT-Compass-Cloud-Test-Candidate-Guide-EN-V2.4.2.pdf

## Summary

Compass Cloud (v2.4.2) is Certiport's in-person exam delivery platform for Certiport Authorized Testing Centers (CATCs). It runs on Windows 10/11, macOS Monterey 12+, or Chromebook; requires Chrome/Edge/Safari and ≥10 Mbps download. The desktop app locks down the workstation on launch. Candidates log in with Certiport credentials, enter an Access Code, wait in a lobby for proctor unlock, then complete the exam end-to-end inside the locked session.

## Fields/API

**name**: Supported OS
**value**: Windows 10, Windows 11, macOS Monterey 12.x+, Chromebook (current OS). OS language must match exam language.
**name**: Hardware
**value**: Full keyboard, 2-button mouse, laptop or desktop. Minimum screen resolution 1280×800.
**name**: Browser
**value**: Chrome (preferred), Edge, Safari.
**name**: Bandwidth
**value**: ≥10 Mbps download.
**name**: Delivery mode
**value**: In-person only at a CATC. Not available for remote/at-home proctoring.
**name**: Lockdown behavior
**value**: Workstation locks immediately on app launch; Alt-Tab and other apps are inaccessible. Can exit only before the exam starts (Close Window / Log out). Once exam starts, must finish or time out to exit.
**name**: Session join window
**value**: Can join from 5 minutes before scheduled start. Late by >30 minutes → locked out, must reschedule.
**name**: Session time (LITA exams only)
**value**: ~2 hours; covers login, tutorial, exam, results, and feedback. Applies only to Live-in-the-Application exams (Adobe, Autodesk, MOS) that use virtual machines.
**name**: Exam time
**value**: 45–60 minutes (timed portion) for all standard exams.
**name**: ADA accommodations
**value**: Extended testing time supported. Screen readers (e.g., JAWS) not supported in Compass Cloud; use locally-installed Compass for Windows/Mac for full ADA support.
**name**: Freeze/disconnect recovery
**value**: Restart computer, relaunch app, sign in with same access code → 'Enter exam' resumes. Exam timer continues during disconnect.
**name**: ACU (Autodesk) app switching
**value**: Classic UI: use toolbar icons or Alt+PageUp/PageDown (Win), Opt+Fn+↑ (Mac), Autodesk toolbar (Chromebook). Next Generation UI: exam and app share one screen, no switching needed.
**name**: Voucher association
**value**: Log in to certiport.com → My Exams → enter Access Code → 'Associate session'. Only if directed by proctor.
**name**: Exam flow sequence
**value**: 1. Accept agreements → 2. Tutorial → 3. Timed questions → 4. Finish/submit → 5. Feedback (optional) → 6. Score Report → 7. My Pathway summary (optional) → 8. End Exam Session.

## Constraints

- Cannot be used for at-home or remote proctoring — CATC in-person only.
- Candidate must be present ≥5 min before start; >30 min late = must reschedule.
- After exam launches, no exit until exam is finished or timer expires.
- Session time (~2 h) is only relevant for LITA exams (virtual machines); ADA candidates on LITA must not arrive late.
- Exam can only be changed to another title that was originally scheduled by the proctor within the active session.
- Screen readers (JAWS etc.) are not supported; full ADA support requires locally-installed Compass.

## Examples

- Candidate arrives 5 min early, double-clicks the Compass Cloud icon, logs in with Certiport credentials, enters the Access Code, verifies candidate/exam info, waits in lobby, clicks Start when proctor unlocks, completes timed exam, reviews score report, clicks End Exam Session.
- Computer freezes mid-exam: restart, relaunch Compass Cloud, sign in, re-enter same Access Code, click 'Enter exam' to resume (timer kept running).
- Autodesk ACU exam on Windows with classic UI: use Alt+PageUp / Alt+PageDown to toggle between exam window and Autodesk application.

---
name: accessibility
description: |
  Design, implement, and audit inclusive digital products against WCAG 2.2 Level AA. Generates
  semantic ARIA for Web and accessibility traits for Native (iOS SwiftUI / Android Compose), maps
  design requirements to Name/Role/Value attributes, and audits existing code for barriers.
  Use when specifying UI components, auditing an interface for compliance gaps, or implementing
  WCAG 2.2 criteria (target size, focus appearance, redundant entry).
  Do NOT use for visual/brand design choices (use frontend-design), for running a live browser
  audit (use browser-qa), or to claim full compliance from automated checks alone — automated
  scans cover ~30-40% of WCAG; keyboard, focus order, and a screen-reader pass remain manual.
summary: >-
  WCAG 2.2 AA implementation + audit skill. Maps each UI component to POUR attributes
  (Perceivable/Operable/Understandable/Robust) across Web (ARIA+HTML5), iOS (traits+labels),
  Android (Compose semantics). Process: identify role → perceivable (contrast 4.5:1, alt text,
  reflow) → operable (24x24px targets, keyboard reachable, visible focus) → understandable
  (consistent nav, error suggestions, redundant-entry) → robust (Name/Role/Value, aria-live).
  Flags div-buttons, color-only meaning, untrapped modal focus. Automated scan is necessary not
  sufficient — manual keyboard/screen-reader pass required before claiming "accessible".
metadata:
  origin: affaan-m/ecc
  license: MIT
  cluster: skill:core-eval
  tier: T2
  status: library
---
<!-- pattern from affaan-m/ecc skills/accessibility/SKILL.md -->

## Overview

Inclusive interfaces must be Perceivable, Operable, Understandable, and Robust (POUR) for users on
screen readers, switch controls, or keyboard-only navigation. This skill turns that principle into
the concrete technical attributes a component needs — ARIA roles on Web, accessibility traits on
iOS, Compose semantics on Android — and into a repeatable audit of existing code. It is an
implementation-and-audit skill, not a visual-design skill: it answers "is this reachable, labeled,
and announced correctly", never "is this pretty".

The accessibility tree (the representation assistive tech actually reads) is the unit of truth, not
the rendered pixels. A control that looks like a button but is a bare `<div>` is invisible to the
tree and therefore broken, regardless of how it renders.

## When to Use / When NOT

**Use when:**
- Defining UI component specs for Web, iOS, or Android before implementation.
- Auditing existing code for accessibility barriers or WCAG 2.2 compliance gaps.
- Implementing newer WCAG 2.2 criteria: Target Size Minimum (2.5.8), Focus Appearance (2.4.11),
  Redundant Entry (3.3.7), Dragging Movements (2.5.7).
- Mapping a high-level design requirement to Name/Role/Value attributes.

**Do NOT use when:**
- The task is visual/brand styling or layout aesthetics → `frontend-design`.
- You need a live, running browser audit with axe-core → `browser-qa` (this skill is the
  static/spec layer; browser-qa is the runtime layer).
- You want to declare "accessible" from an automated pass alone — automated tooling covers only
  ~30-40% of WCAG. The remaining manual checks are mandatory (see Verification).

## Principles

*Source: `affaan-m/ecc skills/accessibility/SKILL.md`, WCAG 2.2 (w3.org/TR/WCAG22), WAI-ARIA Authoring Practices.*

1. **Semantic-first.** Use the most semantic native element available before reaching for a custom
   role. A native `<button>` / `Button` carries focus, keyboard, and role for free; a `<div>` with
   `onClick` carries none and must reimplement all three.
2. **The accessibility tree is the contract.** Name, Role, and Value must be correct for every
   interactive element. If assistive tech can't announce what a control is and what it does, it
   does not exist for that user.
3. **Never encode meaning in color alone.** Status, errors, and state need a text or shape signal
   in addition to color (WCAG 1.4.1).
4. **Focus is managed, not incidental.** Modals trap focus while open and release it cleanly on
   close (Escape or close button, SC 2.1.2); dropdowns restore focus to their trigger.
5. **Automated coverage is a floor, not a ceiling.** A clean axe-core run is necessary, never
   sufficient — keyboard nav, focus order, and a screen-reader pass close the gap.

## Process

1. **Identify the component role.** Determine the functional purpose (button vs link vs tab vs
   disclosure). Pick the most semantic native element; only fall back to a custom `role` when no
   native element fits, and then reimplement keyboard + focus + state.
2. **Define perceivable attributes.** Text contrast ≥ 4.5:1 (normal) or 3:1 (large/UI components);
   text alternatives for all non-text content; content reflows to 400% zoom without loss of
   function or horizontal scroll.
3. **Implement operable controls.** Minimum 24×24 CSS px (Web, SC 2.5.8) / 44×44 pt (native) target
   size; every interactive element reachable by keyboard with a visible, high-contrast focus
   indicator (SC 2.4.11); provide single-pointer alternatives to drag gestures (SC 2.5.7).
4. **Ensure understandable logic.** Consistent navigation patterns; descriptive error messages with
   correction suggestions (SC 3.3.3); apply Redundant Entry (SC 3.3.7) — never re-ask for data
   already provided in the same flow.
5. **Verify robust compatibility.** Correct Name/Role/Value patterns; `aria-live` (or platform live
   regions) for dynamic status updates so changes are announced.
6. **Map cross-platform** when the component ships on more than one surface:

   | Feature | Web (HTML/ARIA) | iOS (SwiftUI) | Android (Compose) |
   |---|---|---|---|
   | Primary label | `aria-label` / `<label>` | `.accessibilityLabel()` | `contentDescription` |
   | Secondary hint | `aria-describedby` | `.accessibilityHint()` | `semantics { stateDescription }` |
   | Action role | `role="button"` | `.accessibilityAddTraits(.isButton)` | `semantics { role = Role.Button }` |
   | Live updates | `aria-live="polite"` | `.accessibilityLiveRegion(.polite)` | `semantics { liveRegion = LiveRegionMode.Polite }` |

7. **Audit / verify** against the binary criteria below; report findings with the failing SC number.

## Rationalizations

| Excuse | Reality |
|---|---|
| "It renders as a button, so it's a button." | Visual ≠ semantic. A `<div onClick>` has no role, no keyboard, no focus — it is invisible to the accessibility tree. |
| "axe-core passed, so it's accessible." | Automated tooling covers ~30-40% of WCAG. Keyboard, focus order, and screen-reader checks are still required. |
| "The red border already shows the error." | Color-only meaning fails SC 1.4.1. Add text or an icon. |
| "We'll add aria-labels later." | Labels are the contract for icon-only controls. Without them the control is unusable on a screen reader from day one. |
| "Focus trapping is overkill for this modal." | An untrapped modal lets keyboard users wander into background content (SC 2.1.2). Trap and release cleanly. |

## Red Flags

- Interactive elements built from `<div>`/`<span>` with a click handler and no role/keyboard support.
- Status, errors, or required-state communicated only through a color change.
- A modal or dialog that does not contain focus, or cannot be dismissed with Escape.
- Icon-only buttons with no `aria-label` / `accessibilityLabel` / `contentDescription`.
- Alt text beginning with "Image of…" / "Picture of…" (the role is already announced).
- Claiming "accessible" or "WCAG AA compliant" with only an automated scan as evidence.

## Verification Criteria

- [ ] Every interactive element has a correct Name, Role, and Value in the accessibility tree.
- [ ] Text contrast measured ≥ 4.5:1 (normal) / 3:1 (large/UI); no meaning is color-only.
- [ ] Interactive targets meet 24×24 px (Web) / 44×44 pt (native); focus indicator is visible.
- [ ] Full keyboard pass completed: every control reachable and operable, focus order logical.
- [ ] Modals trap focus while open and restore it to the trigger on close; Escape dismisses.
- [ ] Forms surface text-based error suggestions; no in-flow redundant data entry.
- [ ] A screen-reader pass (not just an automated scan) confirmed announcements; findings cite the SC number.

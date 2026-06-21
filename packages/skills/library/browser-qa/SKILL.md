---
name: browser-qa
description: |
  Automated visual + interaction QA of a running web app via a browser automation tool (any browser
  MCP, Playwright, or Puppeteer). Runs four phases — smoke (console/network/CWV), interaction
  (links, forms, auth), visual regression (breakpoint screenshots vs baseline), accessibility
  (axe-core + manual keyboard/screen-reader) — and emits a SHIP / SHIP-WITH-FIXES / DO-NOT-SHIP /
  INCONCLUSIVE verdict. Read-only by default: never runs a mutating journey against production.
  Use after deploying a feature to staging/preview, before shipping, or when reviewing frontend PRs.
  Do NOT use for unit/API regression tests (use ai-regression-testing), for performance baselining
  (use benchmark), or to claim "accessible" from the automated pass alone.
summary: >-
  Runtime QA of a live web app through a browser tool. Four phases: Smoke (console errors, no
  4xx/5xx, above-fold screenshot desktop+mobile, Core Web Vitals); Interaction (every nav link,
  valid+invalid form submits, auth login→protected→logout with TEST creds only); Visual regression
  (screenshots at 375/768/1440px vs committed baseline — no baseline ⇒ INCONCLUSIVE, never a silent
  PASS); Accessibility (axe-core per page + manual keyboard/landmark/screen-reader pass). Verdict ∈
  SHIP / SHIP-WITH-FIXES / DO-NOT-SHIP / INCONCLUSIVE. Safety: read-only default; mutating journeys
  (checkout/payment/delete) need explicit opt-in AND a staging URL; seeded test creds only; redact
  secrets/PII before saving screenshots.
metadata:
  origin: affaan-m/ecc
  license: MIT
  cluster: skill:core-eval
  tier: T1
  status: library
---
<!-- pattern from affaan-m/ecc skills/browser-qa/SKILL.md -->

## Overview

Unit tests prove functions; they do not prove a user can actually log in, submit the form, and read
the page on a phone. This skill drives a real browser through the running app like a user would —
checking console/network health, exercising links and forms, comparing layouts against a baseline,
and running an accessibility pass — then returns an honest ship verdict.

Because it drives real auth and real journeys, blast radius is treated explicitly: it is **read-only
by default** and never runs a mutating journey against production. It is the runtime QA companion to
the static layers — `ai-regression-testing` for API/unit contracts, `benchmark` for performance,
`accessibility` for the WCAG spec — and overlaps `webapp-testing` (Playwright driving) but adds a
structured, verdict-producing checklist on top of raw automation.

## When to Use / When NOT

**Use when:**
- A feature was deployed to staging/preview and needs verification before promotion.
- You must confirm UI behavior across pages and breakpoints.
- Reviewing a PR that touches frontend code.
- Running a responsive or accessibility audit on a live page.

**Do NOT use when:**
- The check is a unit/API regression → `ai-regression-testing`.
- You need performance numbers/baselines → `benchmark`.
- You only need the WCAG implementation spec (no running app) → `accessibility`.
- You intend to declare "accessible" from the automated axe pass alone (it covers ~30-40% of WCAG).

## Principles

*Source: `affaan-m/ecc skills/browser-qa/SKILL.md`; CWV thresholds per web.dev (INP replaced FID, March 2024).*

1. **Read-only by default; mutations are opt-in and staging-only.** Never run checkout/payment/
   delete/mass-update against a production URL. Mutating journeys require explicit opt-in *and* a
   staging/preview URL.
2. **Test credentials only.** Use seeded test creds, never real production logins.
3. **Redact before persisting.** Strip credentials, tokens, and PII before saving any screenshot.
4. **No baseline ⇒ INCONCLUSIVE.** A visual-regression phase with no committed baseline reports
   INCONCLUSIVE — never a silent PASS.
5. **Automated a11y is necessary, not sufficient.** axe-core covers ~30-40% of WCAG; keyboard nav,
   focus order, and a screen-reader pass still need a manual check before claiming "accessible".

## Process

Drive the app via any browser tool (browser MCP / Playwright / Puppeteer), then run the phases:

1. **Smoke test.** Navigate to the target URL; check for console errors (filter known noise:
   analytics, third-party); verify no 4xx/5xx in network; screenshot above-the-fold on desktop +
   mobile viewport; measure Core Web Vitals (LCP < 2.5s, CLS < 0.1, INP < 200ms).
2. **Interaction test.** Click every nav link (no dead links); submit forms with valid data (verify
   success state) and invalid data (verify error state); exercise the auth flow login → protected
   page → logout with **test creds only**; run critical journeys **read-only** unless a mutating
   journey has explicit opt-in against staging.
3. **Visual regression.** Screenshot key pages at 375 / 768 / 1440px; compare to committed baselines
   (no baseline ⇒ INCONCLUSIVE); flag layout shifts > 5px, missing elements, overflow; check dark
   mode if applicable.
4. **Accessibility.** Run axe-core (or equivalent) per page; flag WCAG 2.2 AA violations (contrast,
   labels, focus order); verify end-to-end keyboard navigation; check screen-reader landmarks.
   Treat the automated pass as a floor, then do the manual keyboard/screen-reader check.
5. **Emit the verdict** with findings:

   ```markdown
   ## QA Report — [URL] — [timestamp]
   ### Smoke         — console: 0 critical · network: all 2xx/3xx · CWV: LCP 1.2s ✓ ...
   ### Interactions  — nav 12/12 ✓ · contact form ✗ missing invalid-email error · auth ✓
   ### Visual        — hero overflows at 375px ✗ · dark mode ✓
   ### Accessibility — 2 AA violations: hero alt text, footer contrast
   ### Verdict: SHIP WITH FIXES (2 issues, 0 blockers)
   # verdict ∈ SHIP / SHIP WITH FIXES / DO NOT SHIP / INCONCLUSIVE (no visual baseline)
   ```

## Rationalizations

| Excuse | Reality |
|---|---|
| "It's just a quick checkout test on prod." | Mutating journeys never run against production without explicit opt-in and a staging URL. |
| "I'll use my real login to test faster." | Test credentials only. Real logins risk real data and leak into screenshots. |
| "No baseline yet, but the screenshots look fine." | No baseline ⇒ INCONCLUSIVE, never a silent PASS. |
| "axe-core is green, so it's accessible." | axe covers ~30-40% of WCAG. Keyboard + screen-reader pass required before claiming accessible. |
| "Console warnings are fine, ignore them." | Filter known third-party noise, but never blanket-ignore — a warning can be the regression. |

## Red Flags

- A mutating journey (checkout/payment/delete) executed against a production URL.
- Real production credentials used, or screenshots saved with unredacted tokens/PII.
- A PASS verdict on visual regression when no committed baseline exists.
- "Accessible" claimed from the automated axe pass with no manual keyboard/screen-reader check.
- A verdict outside the four allowed values, or a verdict with no per-phase findings.

## Verification Criteria

- [ ] All runs were read-only, OR mutating journeys had explicit opt-in against a staging/preview URL.
- [ ] Only seeded test credentials were used; saved screenshots are redacted of secrets/PII.
- [ ] Visual regression compared against a committed baseline, or reported INCONCLUSIVE.
- [ ] Accessibility ran axe-core AND a manual keyboard/screen-reader pass before any "accessible" claim.
- [ ] The report covers all four phases and ends with exactly one of SHIP / SHIP-WITH-FIXES / DO-NOT-SHIP / INCONCLUSIVE.
- [ ] Console noise was filtered by source, not blanket-ignored.

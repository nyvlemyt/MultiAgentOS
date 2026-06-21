---
name: design-system
description: "Use to generate a cohesive design-token system from a codebase, audit an existing UI for visual consistency, or detect generic AI-slop design before a redesign or a styling PR review. Do NOT use for one-off component coding, copywriting, or backend work — and do NOT scrape competitor sites or upload the repo to an external design service."
domain: design
summary: "Turns visual quality into something inspectable. Three modes: (1) Generate — scan existing CSS/Tailwind/styled-components, extract the de-facto colors/type/spacing/radius/shadow/breakpoints, and propose a consolidated token set (JSON + CSS custom properties) plus a self-contained preview, all from the repo's own evidence; (2) Audit — score the UI across ten dimensions (color, type hierarchy, spacing rhythm, component consistency, responsive, dark mode, motion, a11y, density, polish) with a file:line fix per finding; (3) AI-slop detection — flag gratuitous gradients, purple defaults, purposeless glassmorphism, personality-free font stacks. Local-evidence only: no competitor scraping, no third-party upload. Output: DESIGN.md + design-tokens.json + a static preview, or a scored audit with concrete fixes."
metadata:
  origin: affaan-m/ecc
  license: MIT
  cluster: skill:core-eval
  tier: T1
  status: library
---
<!-- pattern from affaan-m/ecc skills/design-system/SKILL.md -->

# Design System — Generate & Audit Visual Systems

## Overview

A design system is not a swatch board — it is the contract that keeps a UI coherent as it grows. This skill makes that contract explicit and auditable. It works in three modes: it can *generate* a token system distilled from what a codebase already does, *audit* a UI against ten dimensions of visual quality with a fix per finding, or *detect AI-slop* — the generic patterns (purple gradients, purposeless glass cards, personality-free fonts) that signal a design no human reasoned about. Every mode is grounded in the repo's own evidence; this version removes the original's competitor-scraping step so nothing leaves the user's machine.

## When to Use / When NOT

Use when:
- Starting a project that needs a coherent token set rather than ad-hoc hex values.
- Auditing an existing codebase for visual consistency before a redesign.
- The UI "looks off" and the cause needs to be pinpointed, not guessed.
- Reviewing a PR that touches styling, tokens, or theme files.

Do NOT use when:
- The task is coding one isolated component (use `frontend-design`).
- The task is copywriting, content, or backend logic.
- You would need to scrape external sites or upload the repo to a hosted design service — that path is removed here (see Principles).

## Principles

*Source: `affaan-m/ecc skills/design-system`, hardened against `docs/knowledge/prompting-anthropic.md §5` (anti-AI-slop) and CLAUDE.md §5/§8 (local-first, no third-party egress).*

1. **Audit from the repo's own evidence.** Tokens are extracted from the code that exists, not invented. The audit cites `file:line`; an audit with no evidence is an opinion.
2. **Consistency is the metric, not taste.** "Are you using your palette or random hex values?" is answerable; "is this pretty?" is not. Score what can be checked.
3. **Local-first, no egress.** Do not scrape competitor sites or upload source/screenshots to an external design service. Inspiration comes from the user's stated direction and the repo, not from exfiltrating the codebase (§5/§8).
4. **AI-slop is a real defect class.** Gratuitous gradients, purple-to-blue defaults, purposeless glassmorphism, and personality-free sans stacks are flagged the same as a missing focus state (`prompting-anthropic.md §5`).
5. **A fix beats a score.** Each finding ships with a concrete, file-anchored remediation. A number without a next action is noise.

## Process

1. **Resolve the surface.** Identify the styling stack (CSS / Tailwind / CSS-in-JS / tokens file), the entry points, and the pages or components in scope.
2. **Generate mode** — scan for existing patterns; extract colors, typography, spacing, border-radius, shadows, breakpoints; consolidate duplicates and near-duplicates into a candidate token set; emit `design-tokens.json` + CSS custom properties + `DESIGN.md` (rationale per decision) + a self-contained static `design-preview.html` (no external deps).
3. **Audit mode** — score 0–10 on each of: color consistency, type hierarchy, spacing rhythm, component consistency, responsive behavior, dark mode completeness, purposeful motion, accessibility (contrast/focus/touch targets), information density, polish (hover/transition/loading/empty states). Give each dimension a score, an example, and a `file:line` fix.
4. **Slop mode** — flag gratuitous gradients, purple-to-blue defaults, purposeless glassmorphism, over-rounded corners, scroll-animation excess, generic centered-hero-over-gradient, and personality-free font stacks.
5. **Report** — lead with the overall picture, then the prioritized findings, each with a concrete fix. Omit dimensions you checked but found clean unless the user asked for the full sheet.

## Rationalizations

| Excuse | Reality |
|---|---|
| "I'll just eyeball whether it looks good" | Eyeballing is not auditable. Score the dimensions so the finding survives review. |
| "Let me scrape three competitor sites for inspiration" | Removed here — that uploads/derives off-machine. Inspiration comes from the user's stated direction (§5/§8). |
| "The gradients look modern, leave them" | Gratuitous gradients are a named slop pattern. Flag, then let the user decide. |
| "Random hex values are fine, they match" | They drift. Consolidate to tokens or the next edit reintroduces inconsistency. |
| "A score is enough" | A score without a `file:line` fix gives the maintainer nothing to act on. |

## Red Flags

- You are proposing tokens not grounded in any existing code or a stated user direction.
- An audit dimension has a score but no example and no fix.
- The plan involves fetching, scraping, or uploading anything off the user's machine.
- "Slop" findings are skipped because the UI "looks fine" — the patterns are objective, check them.
- Generated `design-preview.html` pulls in a CDN font/script (it must be self-contained).

## Verification Criteria

- [ ] Generate mode emits `design-tokens.json`, CSS custom properties, `DESIGN.md`, and a self-contained preview (no external deps).
- [ ] Audit mode produces a 0–10 score per dimension, each with an example and a `file:line` fix.
- [ ] No external site was scraped and no repo content was uploaded to a third-party service.
- [ ] AI-slop pass ran and either reports findings or explicitly states none were found.
- [ ] Every finding carries a concrete remediation, not just a number.

---
name: make-interfaces-feel-better
description: "Use to apply the concrete design-engineering details that make an interface feel polished — concentric radius, optical alignment, layered shadows, text-wrap balance/pretty, tabular numerals, scoped transitions, split enter/exit motion, tactile press states, and adequate hit areas. Do NOT use for high-level design-token systems (use design-system), copywriting, or backend work."
domain: design
summary: "The small front-of-house details that compound into polish. Covers concentric radius (outer = inner + padding), optical vs geometric centering for icons, borders-for-separation vs layered-shadows-for-depth, text-wrap balance on headings and pretty on body, tabular-nums for updating numbers, macOS font smoothing at the root, neutral image outlines, interruptible CSS transitions over keyframes, scoped transition-property (never transition: all), split enter/exit motion with scale(0.96) tactile press, and >=40x40px (ideally 44x44px) hit areas. Reviews emit before/after rows with file paths; omits principles checked-but-unchanged. Pairs after design-system (tokens) and before a frontend ship."
metadata:
  origin: affaan-m/ecc
  license: MIT
  cluster: skill:core-eval
  tier: T1
  status: library
---
<!-- pattern from affaan-m/ecc skills/make-interfaces-feel-better/SKILL.md -->

# Make Interfaces Feel Better

## Overview

Polish is not one big decision — it is dozens of small design-engineering details that, individually invisible, compound into an interface that feels considered. This skill is the checklist of those details: concentric radii, optical alignment, the right reason for a border versus a shadow, text wrapping, tabular numerals, scoped and interruptible motion, tactile press states, and usable hit areas. It is deliberately concrete and CSS-level. Use it on a polish pass or a frontend review; the output is before/after recommendations a developer can apply directly. (Original detail set salvaged from a stale community PR; this version is reorganized into the project's lifecycle structure.)

## When to Use / When NOT

Use when:
- The UI feels off, flat, generic, cramped, jumpy, or unfinished.
- Building controls, cards, lists, dashboards, navigation, forms, or toolbars.
- A component needs hover / active / focus / enter / exit / loading / empty states.
- A frontend review needs specific before/after recommendations.

Do NOT use when:
- You need a token system or a full visual audit (use `design-system`).
- The task is copy, content, or backend logic.
- The change is purely structural with no rendered surface.

## Principles

*Source: `affaan-m/ecc skills/make-interfaces-feel-better`. Motion and a11y align with `docs/knowledge/prompting-anthropic.md §5` (avoid generic AI aesthetics).*

1. **Concentric radius.** For nested rounded surfaces: `outer radius = inner radius + padding`. When padding is large, treat layers as separate surfaces — optical coherence, not formula worship.
2. **Optical alignment over geometric.** Asymmetric glyphs (play triangle, arrows, stars) need a small offset to look centered. Fix the SVG when possible; otherwise nudge with pixel-level padding.
3. **Border for separation, shadow for depth.** Borders give separation and focus rings; layered, transparent, subtle shadows give depth across backgrounds. Pick by intent.
4. **Text wrapping is a detail, not a default.** `text-wrap: balance` on headings/short titles; `text-wrap: pretty` on short-to-medium body; neither on long prose, code, or preformatted text. `font-variant-numeric: tabular-nums` on counters, timers, prices, and updating numbers.
5. **Motion is scoped and interruptible.** Use CSS transitions (retargetable mid-intent) over keyframes for state changes; keyframes only for staged one-shot entrances. Split enter (opacity + small `translateY`, optional blur) from exit (shorter, ~150ms). `scale(0.96)` for tactile press. **Never** `transition: all` or `will-change: all` — name the changed properties.
6. **Hit areas are non-negotiable.** Interactive controls get >=40x40px, ideally 44x44px; expand with a pseudo-element when the visible icon is smaller, without overlapping neighbors.
7. **Neutral image outlines.** A subtle inset outline (black/white alpha) keeps image edges from blurring into the surface; never tint it with the brand palette.

## Process

1. **Inventory the surface.** Identify the components, their interaction states, and where dynamic numbers, nested rounded surfaces, or icons appear.
2. **Apply the principle set** above in passes: radius/alignment, borders/shadows, text wrapping/numerals, font smoothing, image outlines, motion/transition scope, hit areas.
3. **Prefer the smallest correct change.** A pixel offset on an SVG beats a layout rewrite; a scoped `transition-property` beats `transition: all`.
4. **Report as before/after rows** with the principle, the before, the after, and the file path when not obvious from the snippet.
5. **Omit what you checked but did not change** — the report is the diff, not the full checklist.

## Rationalizations

| Excuse | Reality |
|---|---|
| "transition: all is simpler" | It animates unrelated properties and stutters. Name the changed properties. |
| "Geometric center is mathematically correct" | It looks off for asymmetric icons. Optical alignment is the goal. |
| "The icon button is small but tappable enough" | Below 40x40px it fails on touch. Expand the hit area with a pseudo-element. |
| "Same radius on parent and child looks fine" | Nested radii read as misaligned. `outer = inner + padding`. |
| "will-change: all primes everything" | It thrashes the compositor. Use it only on transform/opacity/filter for real first-frame stutter. |

## Red Flags

- `transition: all` or `will-change: all` survived the pass.
- Updating numbers (timers, prices) shift width as digits change (missing `tabular-nums`).
- An interactive control has no focus state or a sub-40px hit area.
- Enter and exit use the same duration, or exit is as loud as enter.
- An image edge blurs into the background with no neutral outline where one is needed.
- The before/after report lists principles that were checked but unchanged (noise).

## Verification Criteria

- [ ] Nested rounded elements are optically coherent (radius accounts for padding).
- [ ] Dynamic numbers use `tabular-nums`; headings/short text use `balance`/`pretty` appropriately.
- [ ] No `transition: all` and no `will-change: all` remain; transitions name their properties.
- [ ] Enter and exit motion are split, subtle, and interruptible; press states are tactile without exaggeration.
- [ ] Small controls have >=40x40px (ideally 44x44px) hit areas.
- [ ] Report is before/after rows with file paths, omitting unchanged principles.

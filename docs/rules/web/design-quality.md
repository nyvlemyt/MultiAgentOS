---
origin: affaan-m/ecc
license: MIT
lang: web
concern: design-quality
---
<!-- pattern from affaan-m/ecc rules/web/design-quality.md -->

# Web Design Quality Standards

Anti-template bar for cockpit UI. Directly relevant: the cockpit shell reskin was once rejected as "colors ≠ design 3/10" — this standard exists to prevent that class of output.

## Anti-Template Policy

Frontend output must look intentional and specific to the product, not like an untouched library default.

### Banned Patterns

- Default card grids with uniform spacing and no hierarchy
- Stock hero: centered headline + gradient blob + generic CTA
- Unmodified library defaults passed off as finished design
- Flat layouts with no layering, depth, or motion
- Uniform radius / spacing / shadow across every component
- Safe gray-on-white with one decorative accent
- Dashboard-by-numbers: sidebar + cards + charts with no point of view
- Default font stacks used without a deliberate reason

### Required Qualities

Every meaningful surface should demonstrate **at least four**:

1. Clear hierarchy through scale contrast
2. Intentional rhythm in spacing, not uniform padding everywhere
3. Depth/layering via overlap, shadows, surfaces, or motion
4. Typography with character and a real pairing strategy
5. Color used semantically, not just decoratively
6. Hover/focus/active states that feel designed
7. Grid-breaking editorial or bento composition where appropriate
8. Texture, grain, or atmosphere when it fits
9. Motion that clarifies flow instead of distracting
10. Data viz treated as part of the design system

## Before Writing Frontend Code

1. Pick a specific style direction — avoid vague "clean minimal".
2. Define a palette intentionally.
3. Choose typography deliberately.
4. Gather a small set of real references (the cockpit's reference repos in CLAUDE.md §9.bis are a starting point).

## Worthwhile Style Directions

Editorial/magazine · neo-brutalism · glassmorphism with real depth · dark/light luxury with disciplined contrast · bento · scrollytelling · 3D integration · Swiss/International · retro-futurism.

> Note: the cockpit has a deliberate **dark-only** direction (per the UI-redesign decision) — that IS its intentional choice, not the lazy "default to dark mode" this rule warns against. For other product surfaces, pick the direction the product actually wants.

## Component Checklist

- [ ] Avoids looking like a default Tailwind / shadcn template
- [ ] Has intentional hover/focus/active states
- [ ] Uses hierarchy rather than uniform emphasis
- [ ] Would look believable in a real product screenshot
- [ ] If it supports both themes, both feel intentional

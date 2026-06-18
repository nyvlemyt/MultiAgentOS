---
origin: affaan-m/ecc
license: MIT
lang: web
concern: coding-style
---
<!-- pattern from affaan-m/ecc rules/web/coding-style.md -->

# Web Coding Style

Frontend coding standard for the Next.js 15 cockpit (`apps/web`). Extends `docs/rules/typescript/coding-style.md`.

## File Organization

Organize by feature / surface area, not by file type.

```text
src/
├── components/
│   ├── hero/
│   │   ├── Hero.tsx
│   │   ├── HeroVisual.tsx
│   │   └── hero.css
│   └── ui/
│       ├── Button.tsx
│       └── SurfaceCard.tsx
├── hooks/
│   └── useScrollProgress.ts
├── lib/
│   └── animation.ts
└── styles/
    ├── tokens.css
    └── global.css
```

## CSS Custom Properties (Design Tokens)

Define palette, type scale, spacing, and motion as CSS variables. Do not hardcode the same values repeatedly. Tailwind is the primary styling layer here; tokens live in the theme config and `:root` for values Tailwind doesn't own (fluid clamps, easing curves).

```css
:root {
  --color-surface: oklch(98% 0 0);
  --color-accent: oklch(68% 0.21 250);
  --text-hero: clamp(3rem, 1rem + 7vw, 8rem);
  --space-section: clamp(4rem, 3rem + 5vw, 10rem);
  --duration-normal: 300ms;
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
}
```

## Animate Only Compositor-Friendly Properties

Prefer `transform`, `opacity`, `clip-path`, `filter` (sparingly). Avoid animating layout-bound properties — they force reflow: `width`, `height`, `top`, `left`, `margin`, `padding`, `border`, `font-size`.

## Semantic HTML First

Reach for `header` / `nav` / `main` / `section` / `footer` and ARIA landmarks before generic `div` stacks. A semantic element that exists beats a wrapper div.

```html
<main>
  <section aria-labelledby="hero-heading">
    <h1 id="hero-heading">…</h1>
  </section>
</main>
```

## Naming

- Components: PascalCase (`SurfaceCard`)
- Hooks: `use` prefix (`useReducedMotion`)
- CSS classes: kebab-case or Tailwind utilities
- Animation timelines: camelCase with intent (`heroRevealTl`)

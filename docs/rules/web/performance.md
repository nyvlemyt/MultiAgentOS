---
origin: affaan-m/ecc
license: MIT
lang: web
concern: performance
---
<!-- pattern from affaan-m/ecc rules/web/performance.md -->

# Web Performance Rules

Targets and budgets for `apps/web`.

## Core Web Vitals Targets

| Metric | Target |
|--------|--------|
| LCP | < 2.5s |
| INP | < 200ms |
| CLS | < 0.1 |
| FCP | < 1.5s |
| TBT | < 200ms |

## Bundle Budget (gzipped)

| Page type | JS | CSS |
|-----------|----|-----|
| Landing | < 150kb | < 30kb |
| App page (cockpit views) | < 300kb | < 50kb |
| Microsite | < 80kb | < 15kb |

## Loading Strategy

1. Inline critical above-the-fold CSS where justified.
2. Preload the hero image and primary font only.
3. Defer non-critical CSS/JS.
4. Dynamically import heavy libraries (charts, editors, animation engines):

```js
const { ScrollTrigger } = await import('gsap/ScrollTrigger')
```

## Image Optimization

- Explicit `width` and `height` (prevents CLS).
- `loading="eager"` + `fetchpriority="high"` for hero media only; `loading="lazy"` below the fold.
- Prefer AVIF/WebP with fallbacks. Never ship source images far beyond rendered size.

## Font Loading

- Max two font families unless there is a clear exception.
- `font-display: swap`; subset where possible; preload only the truly critical weight/style.

## Animation Performance

- Animate compositor-friendly properties only (see `coding-style.md`).
- Use `will-change` narrowly and remove it when done.
- Prefer CSS for simple transitions; `requestAnimationFrame` or an established library for JS motion.
- Avoid scroll-handler churn — use `IntersectionObserver`.

## Checklist

- [ ] All images have explicit dimensions
- [ ] No accidental render-blocking resources
- [ ] No layout shifts from dynamic content
- [ ] Motion stays on compositor-friendly properties
- [ ] Third-party scripts load async/defer and only when needed

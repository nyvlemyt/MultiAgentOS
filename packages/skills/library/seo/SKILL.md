---
name: seo
description: |
  Use to audit, plan, and implement search-visibility improvements in a registered web project across technical
  SEO (crawlability, indexability, canonicals, redirects), on-page optimization (titles, meta, headings),
  structured data, Core Web Vitals, keyword mapping, and internal linking. Trigger when the user wants better
  organic search visibility, SEO remediation, schema markup, sitemap/robots work, or keyword-to-URL mapping.
  Do NOT use for paid search/ads, social-media strategy, or generic "make it rank" requests untied to specific
  pages — every recommendation must point at a real page or asset.
summary: "Search-visibility skill: fix technical blockers (crawlability, indexability, canonicals, redirect chains) before content; one primary intent per page; meet Core Web Vitals (LCP<2.5s, INP<200ms, CLS<0.1); add only truthful structured data; titles ~50-60 / meta ~120-160 chars; map one primary keyword per URL and avoid cannibalization. Every recommendation ties to a concrete page/file with severity, location, issue, fix. No gimmicks, no keyword stuffing."
metadata:
  origin: affaan-m/ecc
  license: MIT
  cluster: skill:core-eval
  tier: T1
  status: library
---
<!-- pattern from affaan-m/ecc skills/seo/SKILL.md -->

# SEO

## Overview

Audits, plans, and implements organic search-visibility improvements across technical SEO, on-page optimization, structured data, Core Web Vitals, keyword mapping, and internal linking — through technical correctness and content relevance, not gimmicks. Use it when the goal is better organic ranking for concrete pages; every recommendation is page-anchored and emitted as a diff against the registered project's source (read-only-by-default, §8).

## When to Use

- Auditing crawlability, indexability, canonicals, or redirects.
- Improving title tags, meta descriptions, and heading structure.
- Adding or validating structured data (schema.org / JSON-LD).
- Improving Core Web Vitals.
- Keyword research and mapping keywords to URLs.
- Planning internal linking, sitemap, or robots changes.

## When NOT to Use

- Paid search / ad campaigns, or social-media strategy.
- Generic "improve SEO" asks with no concrete pages in scope.
- Schema markup for content that is not actually present on the page.

## Principles

*Source: `affaan-m/ecc` seo + Google Core Web Vitals + CLAUDE.md §8 (external source read-only — emit diffs, don't silently edit).*

1. **Technical blockers before content.** A page that cannot be crawled or indexed gains nothing from copy tweaks. Fix crawl/index/canonical issues first.
2. **One page, one primary intent.** Each URL targets one clear search intent; competing pages cannibalize each other.
3. **Truth over schema.** Only mark up content that genuinely exists on the page; mismatched schema is a liability.
4. **Mobile-first by default.** Indexing is mobile-first; audit the mobile rendering and performance.
5. **Every recommendation is page-anchored.** No advice without naming the page/file, the issue, and the fix.

## Process

1. **Crawlability & indexability.** Verify `robots.txt` allows important pages and blocks low-value surfaces; no important page is unintentionally `noindex`; key pages are within shallow click depth; redirect chains ≤2 hops; canonicals self-consistent and non-looping; preferred URL format consistent; correct `hreflang` if multilingual; sitemaps reflect the intended public surface.
2. **Performance (Core Web Vitals).** Target LCP < 2.5s, INP < 200ms, CLS < 0.1. Common fixes: preload hero assets, cut render-blocking work, reserve layout space to avoid shifts, trim heavy JS.
3. **Structured data.** Match schema to reality: organization/business on the homepage, `Article`/`BlogPosting` on editorial pages, `Product`+`Offer` on product pages, `BreadcrumbList` on interior pages, `FAQPage` only when real Q&A content exists.
4. **On-page.** Titles ~50-60 chars with the primary concept near the front, legible to humans; meta descriptions ~120-160 chars, honest, topic included naturally; exactly one `H1`, with `H2`/`H3` reflecting real content hierarchy.
5. **Keyword mapping.** Define intent → gather realistic variants → prioritize by intent match, likely value, and competition → map one primary keyword/theme per URL → detect and resolve cannibalization.
6. **Internal linking.** Link from strong pages to pages you want to rank; use descriptive anchors; backfill links from new pages to relevant existing ones.
7. **Emit findings, not silent edits.** Produce a page-anchored audit; propose source diffs for the user to apply (the external project is read-only-by-default, §8).

Audit finding shape:
```text
[HIGH] Duplicate title tags on product pages
Location: src/routes/products/[slug].tsx
Issue: Dynamic titles collapse to the same default string, weakening relevance and creating duplicate signals.
Fix: Generate a unique title per product from the product name and primary category.
```

## Rationalizations Table

| Excuse | Reality |
|---|---|
| "Add the FAQ schema, it helps rankings" | Schema for content that isn't on the page is a manual-action risk. Match schema to reality. |
| "Just stuff the keyword a few more times" | Keyword stuffing is a quality-signal liability. Write for users first. |
| "I'll give general SEO advice without reading the page" | Generic advice is noise. Read the real page; tie every fix to it. |
| "Content first, we'll fix the noindex later" | A `noindex`/blocked page can't rank no matter the copy. Technical blockers first. |
| "These two pages both target the keyword, fine" | That's cannibalization. One primary keyword per URL; consolidate or differentiate. |
| "I'll just edit the templates directly" | External source is read-only-by-default (§8). Emit a diff; the user applies it. |

## Red Flags — stop and reconsider

- A recommendation names no page, file, or asset.
- Structured data is proposed for content not present on the page.
- Two or more URLs are optimized for the same primary keyword.
- Content optimization is suggested on a page that is `noindex` or unreachable.
- The audit edited the external project's files instead of proposing diffs.

## Verification Criteria (binary)

- [ ] Crawl/index/canonical/redirect issues were checked before any content advice.
- [ ] Each finding names a concrete page/file with severity, issue, and fix.
- [ ] Core Web Vitals targets (LCP/INP/CLS) are stated and measured where relevant.
- [ ] Structured data proposed matches content actually on the page.
- [ ] Each in-scope URL maps to exactly one primary keyword/intent; cannibalization is flagged.
- [ ] Changes are emitted as diffs/recommendations, not silent edits to `projects.path`.

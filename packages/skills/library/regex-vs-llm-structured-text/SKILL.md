---
name: regex-vs-llm-structured-text
description: >-
  Decision framework for parsing structured text (quizzes, forms, invoices, tables, documents):
  start with deterministic regex, score each extraction's confidence, and escalate ONLY the
  low-confidence edge cases to a cheap LLM call. Use when parsing repeating-pattern text, weighing
  regex vs LLM, or building a cost-aware hybrid extractor. Do NOT use for free-form highly variable
  text (go straight to the LLM), and do NOT use for general research or code search.
summary: >-
  Regex handles 95–98% of structured-text parsing cheaply and deterministically; reserve LLM calls
  for the flagged remainder. Pipeline: regex parse → clean noise → confidence-score each item →
  items ≥0.95 pass straight through, items <0.95 get a single cheap-model validation pass. Return
  new immutable instances, never mutate. TDD the parser (known patterns first, then edge cases).
  Typical result: ~98% regex success, a handful of LLM calls, ~95% cost saving vs all-LLM — directly
  serving the project token budget. The LLM step is provider-agnostic and routed through the project's
  single LLM injection point (llm.ts); subscription-only billing (§11).
metadata:
  origin: affaan-m/ecc
  license: MIT
  cluster: skill:core-research
  tier: T1
  status: library
---

<!-- pattern from affaan-m/ecc skills/regex-vs-llm-structured-text/SKILL.md -->

## Overview

When text has a consistent, repeating shape (numbered questions, form fields, invoice line items, document sections), regex parses the overwhelming majority of it deterministically and for free. The expensive, non-deterministic LLM call should be reserved for the few cases regex cannot confidently handle. This skill is the decision framework — *when* to reach for regex, when for an LLM, and how to combine them so cost tracks accuracy.

It is a direct expression of the project's token discipline (CLAUDE.md §6): the cheapest correct path wins, and the LLM is the fallback for edge cases, not the default tool. Any LLM validation pass goes through the project's single LLM injection point (`packages/core/src/llm.ts`) on the subscription engine — never a raw PAYG SDK (§11).

## When to Use / When NOT

Use when:
- Parsing structured text with repeating patterns (quiz/exam items, forms, tables).
- Deciding between regex and LLM for an extraction task.
- Building a hybrid pipeline where per-item cost matters.
- Optimizing the cost/accuracy tradeoff of an existing all-LLM extractor.

Do NOT use when:
- The text is free-form and highly variable (>10% off-pattern) — use the LLM directly; regex will fight you.
- The task is research, comparison, or code search (that is `research-ops` / `search-first`).
- The extraction runs once on tiny input where neither cost nor determinism matters.

## Principles

*Source: ECC `regex-vs-llm-structured-text` (production quiz pipeline, 410 items) + CLAUDE.md §6 (token discipline) / §11 (subscription-only LLM).*

1. **Regex first, always.** Even imperfect regex gives a deterministic baseline to measure and improve. It is free and reproducible.
2. **The LLM is the edge-case fallback, not the default.** Sending all text to an LLM when regex handles 95%+ is slow and expensive.
3. **Confidence scoring is the router.** A programmatic score (few choices, missing answer, suspiciously short text…) decides which items escalate — don't escalate by vibes.
4. **Use the cheapest model for validation.** Haiku-class is sufficient for "fix this one extraction"; reserve larger models for genuine reasoning.
5. **Never mutate parsed items.** Cleaning and validation return new immutable instances; mutation hides bugs and breaks reproducibility.
6. **TDD the parser.** Write tests for known patterns first, then the edge cases (malformed input, missing fields, encoding). Parsers reward it.
7. **Log the metrics.** Track regex success rate and LLM call count so pipeline health is observable, not assumed.

## Process

1. **Triage the format.** Is the text consistent and repeating (>90% follows a pattern)? If no → use the LLM directly, stop here. If yes → continue.
2. **Regex parse.** Extract structure with a documented pattern; produce immutable items with a default confidence of 1.0.
3. **Clean.** Strip noise (markers, page numbers, artifacts) into *new* instances.
4. **Score confidence.** For each item, apply deterministic checks (e.g. too few choices, missing answer, implausibly short text) and produce a 0–1 score with reasons.
5. **Route.** Items at or above the threshold (e.g. ≥0.95) pass straight to output. Items below it are flagged for validation.
6. **Validate the flagged few.** Send only flagged items to the cheapest model via `llm.ts`, with the original text and the current extraction, asking for a correction or confirmation. Replace the item with the corrected instance.
7. **Emit metrics.** Record regex success rate, count of low-confidence items, and number of LLM calls.

Reference shape (illustrative — adapt to the project's stack; the model call routes through `llm.ts`, not a direct SDK):

```text
source text
  → regex parse        (immutable items, confidence 1.0)
  → clean noise        (new instances)
  → score confidence   (0–1 + reasons)
  → ≥0.95 → output
  → <0.95 → cheap-model validate (via llm.ts) → output
```

Production reference metrics (410-item quiz pipeline): regex success ~98%, ~8 low-confidence items, ~5 LLM calls, ~95% cost saving vs all-LLM, 93% test coverage.

## Rationalizations

| Excuse | Reality |
|---|---|
| "Just throw it all at the LLM, it's easier" | On structured text that is the expensive, slow, non-deterministic path. Regex handles 95%+ for free. |
| "Regex will just work, skip the confidence check" | Without scoring you can't tell which extractions are wrong; the check is what makes the hybrid safe. |
| "Use the big model for validation to be safe" | Edge-case fixing is a Haiku-class job. Big models here just burn budget. |
| "I'll mutate the item in place while cleaning" | Mutation hides bugs and breaks reproducibility. Return new instances. |
| "It's a parser, tests are overkill" | Parsers are exactly where edge cases bite. TDD known patterns then malformed input. |
| "Regex is fighting me on this free-form text" | Then it's not structured — use the LLM directly. The framework says so. |

## Red Flags

- All input is sent to an LLM despite a consistent repeating format.
- There is no confidence scoring step — regex output goes straight out, hoped-correct.
- The validation step uses an expensive model for simple fixes.
- Parsed items are mutated during cleaning/validation.
- No tests cover malformed input, missing fields, or encoding issues.
- A direct provider SDK is called instead of routing the LLM step through `llm.ts` (§11 violation).

## Verification Criteria

- [ ] A regex/deterministic pass runs before any LLM call.
- [ ] Each extracted item carries a 0–1 confidence score with reasons.
- [ ] Only items below the threshold are sent to the LLM.
- [ ] The validation model is a cheap (Haiku-class) tier, called via `llm.ts`.
- [ ] Cleaning/validation return new instances; no item is mutated in place.
- [ ] Tests cover known patterns plus malformed/edge-case input.
- [ ] Regex success rate and LLM call count are logged.

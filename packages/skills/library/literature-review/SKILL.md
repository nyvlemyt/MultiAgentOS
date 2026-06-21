---
name: literature-review
description: |
  Use to find, screen, synthesize, and cite a body of academic, biomedical, technical, or scientific
  literature for a research question: search planning, source screening, thematic synthesis, citation
  verification, and a reproducible evidence log. Trigger on systematic / scoping / narrative reviews,
  state-of-the-art surveys, gap-finding, or citation-backed background sections.
  Do NOT use to score the quality of a single paper (that is scholar-evaluation), to evaluate an agent or model
  (agent-eval / agent-self-evaluation), or to gate a mission deliverable (mas-reviewer).
summary: "Reproducible literature-review workflow: define question (PICO / domain-method-baseline-metric) → plan search protocol → log evidence → dedup (DOI→PMID/arXiv→title) → stage screening → structured extraction → thematic synthesis with confidence tiers → verify every citation. Output = review doc + search log. Token-disciplined (§6): summarize sources, never inject full abstracts. Distinct from scholar-evaluation (scores one artifact) and mas-reviewer (gates a deliverable)."
metadata:
  origin: affaan-m/ecc
  license: MIT
  cluster: skill:core-eval
  tier: T1
  status: library
---
<!-- pattern from affaan-m/ecc skills/scientific-thinking-literature-review/SKILL.md -->

# Literature Review

## Overview

Finds, screens, synthesizes, and cites a body of academic or technical literature for a research question. The deliverable is a citation-backed review plus a reproducible search log — not a pile of links. Use it when you need a defensible map of what is known (and unknown) across many sources, rather than a quality score for one paper or a gate on a mission output.

## When to Use

- Building a systematic, scoping, or narrative review.
- Synthesizing the state of the art for a research question.
- Finding gaps, contradictions, or future-work directions.
- Preparing citation-backed background sections for a report, ADR, or proposal.
- Comparing evidence across peer-reviewed papers, preprints, patents, and technical reports.

## When NOT to Use

- Scoring the quality of a single paper or proposal — that is `scholar-evaluation`.
- Evaluating an agent's or model's behavior — that is `agent-eval` / `agent-self-evaluation`.
- Gating a mission output against its brief — that is `mas-reviewer`.

## Principles

*Source: `affaan-m/ecc` scientific-thinking-literature-review + CLAUDE.md §6 (signal density), §12 (evidence over assertion).*

1. **Protocol before sources.** Write the search protocol (databases, dates, languages, inclusion/exclusion, exact strings) before collecting anything, so the review is reproducible.
2. **Reproducibility is the product.** A review without a search log is an opinion. Log every query, filter, count, and export.
3. **Label evidence by type and confidence.** Preprints, reviews, and primary studies are not interchangeable; high/medium/low confidence is explicit, not implied.
4. **Signal density (§6).** Store raw IDs/abstracts/notes separately from prose; inject compact summaries into reasoning, never whole abstracts.
5. **A citation is a claim about a claim.** Never cite a paper for something it does not say.

## Process

1. **Define the question.** Convert the prompt into a searchable question. Clinical/biomedical → PICO (Population, Intervention, Comparator, Outcome). Technical → system/domain, method, comparison baseline, evaluation metric. If rigor is unspecified, default to scoping for exploration and systematic for publishable/clinical claims.
2. **Plan the search.** Fix databases (PubMed for biomedical; arXiv for CS/math/physics/q-bio; Semantic Scholar or Crossref for broad discovery; domain registries as needed), date range, languages, publication types, inclusion/exclusion criteria, and exact search strings.
3. **Search and log.** Keep a reproducible log:

   ```markdown
   | Database | Date searched | Query | Filters | Results | Export |
   | --- | --- | --- | --- | ---: | --- |
   | PubMed | 2026-06-18 | `("CRISPR"[tiab] OR "Cas9"[tiab]) AND "sickle cell"[tiab]` | 2020:2026, English | 86 | PMID list |
   ```

   Store raw IDs, URLs, DOIs, abstracts, and notes separately from the final prose.
4. **Deduplicate** in order: DOI → PMID/arXiv ID → exact title → normalized title + first author + year. Record how many duplicates were removed.
5. **Screen in stages:** title → abstract → full text. For systematic work, record an exclusion reason per dropped source (wrong population/intervention/outcome, not primary research, duplicate, no full text, out of date range).
6. **Extract into a structured table** (study, design, population/data, method, comparator, outcome, key finding, limitations; add dataset/benchmark/metric/baseline/reproducibility for technical papers).
7. **Synthesize by theme,** not paper-by-paper. Lenses: strongest evidence, conflicts, methodological weaknesses, population/dataset limits, recency/replication, practical implications, open questions. Tag each claim high/medium/low confidence.
8. **Verify every citation:** confirm DOI/PMID/arXiv ID/URL, author names, year; mark preprints as preprints; distinguish reviews from primary evidence; never attach a claim a paper does not make.

Output template: `# Literature Review: <Topic>` with sections Research Question · Search Strategy · Inclusion/Exclusion · Evidence Summary · Thematic Synthesis · Gaps and Limitations · References · Search Log.

## Rationalizations Table

| Excuse | Reality |
|---|---|
| "The search snippet says X, that's evidence" | Snippets are not evidence. Read the source or mark the claim unverified. |
| "One database is enough for this" | A broad claim from a single database is scope-limited at best, biased at worst — say so explicitly. |
| "I'll skip the search log, the prose is what matters" | No log = not reproducible = not a review. The log is the product. |
| "Preprint, review, primary study — close enough" | They carry different evidential weight. Label every source by type. |
| "The abstract claims it, so cite it" | Abstracts overstate. Verify the claim against the body before citing. |
| "Negative results aren't interesting, drop them" | Omitting conflicting/null findings manufactures false consensus. Include them. |

## Red Flags — stop and reconsider

- You are writing synthesis prose before the search protocol and log exist.
- A claim is cited but you never opened the source.
- Preprints and peer-reviewed primary studies are mixed without labels.
- "Systematic review" is claimed but there is no reproducible protocol.
- All evidence is high-confidence — recheck; real literature has gradients.

## Verification Criteria (binary)

- [ ] A search protocol (databases, dates, criteria, strings) was written before collection.
- [ ] A search log records each query, filter, result count, and export.
- [ ] Deduplication order and removed-duplicate count are recorded.
- [ ] Every retained source is labeled by type (primary / review / preprint / report).
- [ ] Synthesis is thematic and every claim carries a confidence tier.
- [ ] Every citation's identifier and metadata were verified; no claim exceeds its source.

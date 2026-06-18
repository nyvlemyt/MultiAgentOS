---
name: market-research
description: "Use to conduct decision-oriented market research, competitive analysis, investor/fund due diligence, market sizing (TAM/SAM/SOM), or technology/vendor scans with source attribution and an explicit recommendation. Do NOT use for one-off factual lookups, for writing marketing copy, or to make a final business decision on the user's behalf — it informs the decision, it does not take it."
domain: research
summary: "Produces research that supports a decision, not research theater. Standards: every important claim is sourced; recent data preferred and stale data flagged; contrarian evidence and downside cases included; findings translated into a decision; fact / inference / recommendation kept clearly separate. Modes: investor-fund diligence, competitive analysis (product reality not marketing copy), market sizing (top-down + bottom-up sanity check with explicit assumptions per leap), and technology/vendor research (trade-offs, lock-in, security/compliance/ops risk). Default output: executive summary → key findings → implications → risks/caveats → recommendation → sources. Quality gate before delivery: all numbers sourced or labeled estimates, old data flagged, recommendation follows from evidence, counterarguments present, and the output makes a decision easier."
metadata:
  origin: affaan-m/ecc
  license: MIT
  cluster: skill:core-agent
  tier: T2
  status: library
---
<!-- pattern from affaan-m/ecc skills/market-research/SKILL.md -->

# Market Research

## Overview

This skill produces research that makes a decision easier — not a polished summary that decides nothing. It covers four modes (investor/fund diligence, competitive analysis, market sizing, and technology/vendor research) under one set of standards: source every important claim, prefer recent data and flag stale data, surface contrarian evidence and downside cases, and keep fact, inference, and recommendation cleanly separated. The output always ends in a recommendation tied to the evidence. It informs the user's decision; it never pretends to take the decision for them.

## When to Use / When NOT

Use when:
- Researching a market, category, company, investor, or technology trend.
- Building TAM/SAM/SOM estimates or comparing competitors / adjacent products.
- Preparing an investor dossier before outreach, or pressure-testing a thesis before building/funding/entering a market.

Do NOT use for:
- A one-off factual lookup that fits a single response — just answer it.
- Writing marketing or sales copy — that is not research.
- Making the final business call — this skill delivers a recommendation; the user decides.

## Principles

*Source: `affaan-m/ecc skills/market-research`; bound to the signal-density / evidence-maturity discipline in `docs/knowledge/skills-reference.md` and the intake-audit habit of separating fact from inference from recommendation.*

1. **Every important claim needs a source.** Unsourced numbers are labeled estimates explicitly.
2. **Recency matters.** Prefer recent data; call out stale data as stale.
3. **Seek the downside.** Include contrarian evidence and downside cases — a research output with no risks is incomplete.
4. **Translate into a decision.** End in a recommendation that follows from the evidence, not a neutral summary.
5. **Separate the registers.** Keep fact, inference, and recommendation clearly distinct so the reader can audit the reasoning.
6. **Show the assumptions.** Every leap in a sizing or projection is an explicit, stated assumption.

## Process

1. **Frame the decision.** What choice does this research inform (build/fund/enter/partner/buy)? That defines what "enough" means.
2. **Pick the mode** and collect accordingly:
   - **Investor/fund diligence:** fund size, stage, typical check, relevant portfolio, public thesis, recent activity, fit reasons, red flags.
   - **Competitive analysis:** product reality (not marketing copy), funding/investor history if public, traction if public, distribution/pricing clues, strengths/weaknesses/positioning gaps.
   - **Market sizing:** top-down from reports/public datasets + bottom-up sanity check from realistic acquisition assumptions, with explicit assumptions per leap.
   - **Technology/vendor:** how it works, trade-offs, adoption signals, integration complexity, lock-in, security/compliance/operational risk.
3. **Source and date every claim.** Attribute or label as estimate; flag stale data.
4. **Add the counter-case.** Actively hunt contrarian evidence and downside scenarios.
5. **Assemble the output** in the default structure (below).
6. **Run the quality gate** before delivery.

### Default output structure
1. Executive summary → 2. Key findings → 3. Implications → 4. Risks & caveats → 5. Recommendation → 6. Sources.

## Rationalizations

| Excuse | Reality |
|---|---|
| "The number is roughly right, no need to source it." | Unsourced numbers are estimates — label them as such, every time. |
| "This data is a bit old but probably still holds." | Flag stale data as stale. Let the reader weigh recency. |
| "The thesis is strong, skip the downside." | A research output with no contrarian case is theater. Include the downside. |
| "I'll just summarize and let them decide." | Summaries don't decide. End in a recommendation tied to the evidence. |
| "Top-down sizing is enough." | Top-down alone is unbounded optimism. Add a bottom-up sanity check with stated assumptions. |
| "The marketing page says it does X." | Marketing copy is not product reality. Verify behavior, not claims. |

## Red Flags

- Important claims appear without a source or an explicit estimate label.
- Stale data is presented as current.
- The output has no risks/caveats section or no contrarian evidence.
- Fact, inference, and recommendation are blurred together.
- A market size is asserted with no stated assumptions or no bottom-up check.
- The output summarizes but never makes a recommendation.

## Verification Criteria (binary pass/fail)

- [ ] Every important claim is sourced or explicitly labeled an estimate.
- [ ] Stale data is flagged as stale.
- [ ] Contrarian evidence and at least one downside case are included.
- [ ] Fact, inference, and recommendation are clearly separated.
- [ ] Any market sizing has explicit per-leap assumptions and a bottom-up sanity check.
- [ ] The output follows the default structure and ends in a recommendation that follows from the evidence.

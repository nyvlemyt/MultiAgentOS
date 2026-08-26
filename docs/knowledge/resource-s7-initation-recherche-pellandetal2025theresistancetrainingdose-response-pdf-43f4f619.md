---
id: >-
  resource-s7-initation-recherche-pellandetal2025theresistancetrainingdose-response-pdf-43f4f619
slug: >-
  resource-s7-initation-recherche-pellandetal2025theresistancetrainingdose-response-pdf-43f4f619
source_key: 'sha256:43f4f61987b1c0ca93cff7aaadd86a4be8894c79cbf016ac931a74a59f0a39fa'
part_of: S7 - initation recherche
order: 4
manifest: null
derived_from: 'sha256:43f4f61987b1c0ca93cff7aaadd86a4be8894c79cbf016ac931a74a59f0a39fa'
sources: []
lifecycle: distilled
superseded_by: null
trust: untrusted
ocr_confidence: null
retrieval_context: null
quality_score: null
kind: resource
register: learnings
scope: global
doc_type: reference
actionability: resource
lane: knowledge
schema_version: '1'
tags:
  - resistance-training
  - hypertrophy
  - strength
  - volume
  - frequency
  - dose-response
  - meta-analysis
  - fractional-sets
  - sports-medicine
  - exercise-science
domain: exercise-science
---
# S7 - initation recherche — Pellandetal2025TheResistanceTrainingDose-Response.pdf

## Summary

Bayesian multi-level meta-regressions across 67 studies (2 058 participants, 79 % male, mean age 25 y) show that the 'fractional' quantification method—counting indirect/synergist sets as 0.5—best predicts both hypertrophy and strength adaptations. Volume has a positive dose-response with hypertrophy (square-root model, diminishing returns, no clear plateau) and with strength (reciprocal model, strong diminishing returns, functional plateau). Training frequency has a negligible independent effect on hypertrophy but a positive dose-response with strength (reciprocal model, diminishing returns). All dose-response curves are compatible with multiple functional forms, particularly at extreme volumes where data are sparse.

## Fields/API

**quantification_methods**: **total**: direct + all indirect sets (count = 1 each)
**fractional**: direct sets + indirect sets × 0.5 — strongest Bayesian evidence across all four outcomes
**direct**: only sets where the measured muscle is the primary force generator (hypertrophy) or the exact assessed exercise (strength)
**volume_hypertrophy**: **best_fit_model**: square root
**posterior_prob_slope_gt_0**: 100 %
**marginal_slope_at_mean**: β = 0.24 % muscle size per set [95 % CrI 0.15, 0.33]
**pattern**: positive dose-response with accelerating diminishing returns; no clear plateau identified
**minimum_effective_dose**: 4 fractional weekly sets (point estimate exceeds SDES of 2.05 %)
**efficiency_tiers**: **higher_efficiency**: 5–10 sets — ~6 additional sets per SDES increment
**intermediate**: 11–18 sets — ~8.5 additional sets per SDES increment
**lower**: 19–29 sets — ~10.75 additional sets per SDES increment
**lowest**: 30–42 sets — ~12.5 additional sets per SDES increment
**unclear**: 43+ sets — insufficient data
**volume_strength**: **best_fit_model**: reciprocal
**posterior_prob_slope_gt_0**: 100 %
**marginal_slope_at_mean**: β = 0.21 % maximal strength per set [95 % CrI 0.16, 0.26]
**pattern**: positive dose-response with strong diminishing returns and functional plateau
**minimum_effective_dose**: 1 fractional weekly set (exceeds SDES of 3.96 %)
**efficiency_tiers**: **higher_efficiency**: 2 sets — ~0.75 additional set per SDES increment
**intermediate**: 3–4 sets — ~2.25 additional sets per SDES increment
**lower**: 5+ sets — additional sets do not consistently enhance strength > SDES
**frequency_hypertrophy**: **best_fit_model**: reciprocal
**posterior_prob_slope_gt_0**: 91.3 %
**marginal_slope_at_mean**: β = 0.32 % muscle size per session [95 % CrI −0.14, 0.82]
**pattern**: compatible with negligible independent effect; not consistently identifiable across modeling approaches
**frequency_strength**: **best_fit_model**: reciprocal
**posterior_prob_slope_gt_0**: 100 %
**marginal_slope_at_mean**: β = 3.27 % maximal strength per session [95 % CrI 2.74, 3.84]
**pattern**: positive dose-response with diminishing returns; additional frequency provides practice stimulus beyond set-volume effects
**model_quality**: **R2_marginal_range**: 21.9 %–26.1 % (fixed effects only)
**R2_conditional_range**: 73.1 %–75.1 % (fixed + random effects)
**statistical_framework**: Bayesian estimation (brms + metafor in R); response ratios exponentiated to % change; no null-hypothesis significance testing
**smallest_detectable_effect_sizes**: **hypertrophy_SDES**: 2.05 %
**strength_SDES**: 3.96 %

## Constraints

- Population: predominantly young adults (mean 25 y); participants >70 y excluded — generalisation to older cohorts is limited.
- Sex: 79.1 % male; sex-specific dose-response curves not established.
- Duration: mean intervention 10.4 ± 4.5 weeks; long-term plateau dynamics are not captured.
- The 0.5 weighting for indirect sets is a heuristic; optimal weighting likely varies by muscle, exercise, rep range, and training status.
- Volume quantified on a weekly time-scale (arbitrary choice); per-session dose-response is explored in a parallel project (Remmert et al. 2025).
- Site-specific volume only — overall training load and cross-body fatigue are not modelled.
- No modelling of negative consequences of high dosage (injury, psychological burnout, overreaching).
- ~78 % of effects used some failure definition but only ~30 % explicitly defined momentary failure — proximity-to-failure as a moderator remains imprecise.
- Sparse data above ~25 fractional weekly sets for hypertrophy; efficiency tiers at 30+ sets carry wide uncertainty intervals.
- Participants must have completed post-testing (survivorship bias toward volumes that were tolerable).

## Examples

- Fractional counting example — biceps study: 5 sets biceps curls (direct) + 5 sets rows (indirect) → total = 10, fractional = 7.5, direct = 5 sets.
- Strength frequency example — reciprocal model: increasing from fractional frequency 1 → 2 raises estimated strength ES from 12.72 % [CrI 10.57, 15.05] to 17.32 % [CrI 14.34, 20.56]; returns diminish sharply beyond 2 sessions/week.
- Hypertrophy minimum effective dose: 4 fractional weekly sets are sufficient to exceed the 2.05 % SDES; going from 4 to ~10 sets requires only ~6 additional sets per detectable increment, but from 30 to 42 sets requires ~12.5 additional sets for the same increment.
- Strength plateau: beyond ~4–5 fractional weekly sets, additional volume does not consistently produce strength gains above the 3.96 % SDES, suggesting a functional plateau for strength that is not present for hypertrophy.
- Bayes-factor evidence for fractional method: BF for fractional vs direct was ≥ 10 (very strong) across all four outcomes; BF for fractional vs total ranged from strong (9.48) to very strong (54.84).

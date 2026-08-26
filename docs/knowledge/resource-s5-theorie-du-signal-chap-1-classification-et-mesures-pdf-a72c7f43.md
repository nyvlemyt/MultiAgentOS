---
id: resource-s5-theorie-du-signal-chap-1-classification-et-mesures-pdf-a72c7f43
slug: resource-s5-theorie-du-signal-chap-1-classification-et-mesures-pdf-a72c7f43
source_key: 'sha256:a72c7f435ce0dd08430e5f7bd0643f06798bbf969d986063f87e0105e00153c7'
part_of: S5 - Théorie du signal
order: 2
manifest: null
derived_from: 'sha256:a72c7f435ce0dd08430e5f7bd0643f06798bbf969d986063f87e0105e00153c7'
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
  - signal-theory
  - signal-classification
  - signal-measures
  - dirac
  - heaviside
  - correlation
  - autocorrelation
  - energy
  - power
  - mean-value
  - deterministic-signals
  - singular-signals
  - periodic-signals
domain: Signal Theory / Engineering Sciences
---
# S5 - Théorie du signal — Chap 1 - Classification et mesures .pdf

## Summary

Chapter 1 of a Signal Theory course (EFREI, Sept. 2024, D. Achvar) covering the taxonomy of signals and the key scalar measures defined on them. Signals are classified along two axes: time domain (continuous vs. discrete) and nature (deterministic vs. random). Three theoretical singular models are introduced (Dirac distribution, Heaviside step, rectangular gate, Dirac comb). Scalar measures — mean value, power, energy, cross-correlation, and autocorrelation — are given in both the general (limit-integral) and the T-periodic forms. TD exercises apply these definitions to concrete signals.

## Fields/API

**Signal classification**: **Continuous-time deterministic**: x(t) ∈ ℝ, t ∈ ℝ — described by a closed-form mathematical expression.
**Continuous-time random**: x(t) ∈ ℝ, t ∈ ℝ — described by statistical properties only.
**Discrete-time (sampled)**: x(t) ∈ ℝ, t ∈ ℤ — defined only on integer time indices.
**Discrete-amplitude (quantised)**: x(t) ∈ ℤ, t ∈ ℝ or t ∈ ℤ — amplitude takes countable values.
**Singular signal models**: **Dirac distribution δ(t)**: ∫φ(t)δ(t)dt = φ(0); ∫δ(t)dt = 1. Sampling property: x(t)δ(t−τ) = x(τ)δ(t−τ). Even function: δ(t)=δ(−t). Scaling: δ(at)=δ(t)/|a|.
**Heaviside step h(t)**: h(t)=1 for t≥0, 0 for t<0. Relation: h(t)=∫_{−∞}^{t}δ(τ)dτ.
**Rectangular gate Π_τ(t)**: 1 for t∈[−τ/2, +τ/2], 0 elsewhere. Limit: δ(t)=lim_{τ→0}(1/τ)Π_τ(t).
**Dirac comb Ш(t)**: Ш(t)=Σ_{k=−∞}^{+∞}δ(t−k). Scaled version: Ш(t/τ)=(1/τ)Σδ(t−kτ). Used for sampling and periodisation.
**Scalar measures — deterministic continuous-time signal x(t)**: **Mean value (general)**: X̄ = lim_{τ→∞} (1/τ)∫_{−τ/2}^{+τ/2} x(t)dt
**Mean value (T-periodic)**: X̄ = (1/T)∫_{−T/2}^{+T/2} x(t)dt
**Power (general, finite power)**: P = lim_{τ→∞} (1/τ)∫_{−τ/2}^{+τ/2} |x(t)|²dt
**Power (T-periodic)**: P = (1/T)∫_{−T/2}^{+T/2} |x(t)|²dt
**Energy (finite energy signal)**: E = ∫_{−∞}^{+∞} |x(t)|²dt
**Cross-correlation Γ_xy(τ)**: **Energy signals**: Γ_xy(τ) = ∫_{−∞}^{+∞} x(t) y*(t−τ)dt
**Power signals (general)**: Γ_xy(τ) = lim_{T→∞} (1/T)∫_{−T/2}^{+T/2} x(t) y*(t−τ)dt
**T-periodic signals**: Γ_xy(τ) = (1/T)∫_{−T/2}^{+T/2} x(t) y*(t−τ)dt
**Key property — non-commutativity**: Γ_xy(τ) ≠ Γ_yx(τ) in general.
**Shift property**: If x_θ(t)=x(t−θ) then Γ_{x_θ y}(τ)=Γ_xy(τ−θ).
**Autocorrelation Γ_x(τ)**: **Energy signals**: Γ_x(τ) = ∫_{−∞}^{+∞} x(t) x*(t−τ)dt
**T-periodic signals**: Γ_x(τ) = (1/T)∫_{−T/2}^{+T/2} x(t) x*(t−τ)dt
**Peak property**: |Γ_x(τ)| ≤ Γ_x(0) = E (energy signal) or Γ_x(0) = P (power signal).
**Symmetry (real signal)**: Γ_x(τ) = Γ_x(−τ)  [even function].
**Periodicity**: Γ_x(τ) = Γ_x(τ+T) for T-periodic signals.

## Constraints

- Power and energy are mutually exclusive: a signal with finite energy has zero mean power; a signal with finite non-zero power has infinite energy.
- The Dirac distribution is not a function in the classical sense — it is a distribution defined only through its action on test functions φ.
- Cross-correlation is not commutative: swapping x and y changes the sign of the lag (Γ_yx(τ) = Γ_xy(−τ) for real signals).
- Autocorrelation of a real signal is always an even function.
- Energy integrals diverge for periodic signals (use power instead).
- The Dirac comb Ш(t/τ) scales by 1/τ when the period is τ.

## Examples

- y(t) = (1/2)sin(ω₀t) − (1/4)sin(3ω₀t) + (1/4)sin(5ω₀t)  →  mean = 0, power P = 3/16  (sum of squared amplitudes divided by 2 for sinusoids, cross-terms vanish by orthogonality).
- y(t) = A·h(t)·exp(−t/τ)  →  energy E = A²·τ/2  (one-sided decaying exponential).
- x(t) = h(t)·exp(−t/θ)  →  autocorrelation Γ_x(τ) = (θ/2)·exp(−|τ|/θ), Γ_x(0) = θ/2 = E.
- δ(t−2): Dirac impulse shifted to t=2; ∫φ(t)δ(t−2)dt = φ(2).
- Π_{1/2}(t): gate of width 1/2, equal to 1 on [−1/4, +1/4], 0 elsewhere.

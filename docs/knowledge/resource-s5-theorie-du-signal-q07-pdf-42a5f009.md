---
id: resource-s5-theorie-du-signal-q07-pdf-42a5f009
slug: resource-s5-theorie-du-signal-q07-pdf-42a5f009
source_key: 'sha256:42a5f009d923fad13d869ba4f109eadc2365fab1f131bf190f91dff3b9881aa1'
part_of: S5 - Théorie du signal
order: 14
manifest: null
derived_from: 'sha256:42a5f009d923fad13d869ba4f109eadc2365fab1f131bf190f91dff3b9881aa1'
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
doc_type: explanation
actionability: resource
lane: knowledge
schema_version: '1'
tags:
  - fourier-series
  - signal-theory
  - harmonics
  - parseval
  - euler-identity
  - spectral-decomposition
domain: signal processing
---
# S5 - Théorie du signal — Q07.pdf

## Thesis

Any periodic signal can be decomposed into a sum of sinusoidal harmonics (Fourier series); demonstrated on a half-wave rectified sine x(t) = sin(ωt) for t∈[0,T/2], 0 elsewhere — showing that just three harmonics already capture the vast majority of the signal's power.

## Context

Undergraduate signal theory course (I1-APP.LSI, SNCF Réseau apprenticeship, September 2024). Prerequisite knowledge: complex exponentials, Euler's identity e^{jθ} = cos θ + j·sin θ, integral calculus over one period. The signal x(t) is a half-rectified sine: it follows sin(ωt) for the first half-period and is zero for the second half.

## Reasoning

1. **Mean value and mean power.** The mean value ⟨x⟩ = (1/T)∫₀ᵀ x(t)dt; for the half-rectified sine this is non-zero. Mean power P = (1/T)∫₀ᵀ x²(t)dt; using ∫sin²= T/4 over the active half-period yields P = 1/4.
2. **Complex Fourier coefficients λₖ.** General formula: λₖ = (1/T)∫₀ᵀ x(t)e^{−jkω₀t}dt. Because x(t)=0 on [T/2,T], integration reduces to [0,T/2]. Applying Euler's identity to sin(ωt) = (e^{jωt}−e^{−jωt})/(2j) and separating the exponentials leads to λ₁ = 1/(4i), hence phase θ₁ = −π/2. The general expression for k≠1 is derived similarly, yielding closed-form λₖ in terms of k.
3. **Fundamental and harmonics.** The fundamental (k=1): h₁(t) = 2|λ₁|cos(ω₀t + θ₁) = (1/2)sin(ω₀t). Second harmonic h₂ and third harmonic h₃ are computed from their respective λₖ. Their explicit trigonometric forms are listed.
4. **Numerical validation.** Plotting x(t) alongside h₁+h₂+h₃ shows the partial sum (red curve) closely tracks the theoretical signal (green curve), confirming convergence: more harmonics ⟹ closer approximation.
5. **Parseval's theorem.** Partial power through order 3: P₃ = Σₖ₌₋₃³ |λₖ|². Comparison with total power P shows that the DC component + first three harmonics capture nearly all the signal's energy.

## Trade-offs

Truncating the series at order 3 gives a very good approximation with low computational cost, but residual Gibbs-like ripple persists at discontinuities. Adding higher-order harmonics improves fidelity but increases the number of terms to compute and store; Parseval quantifies exactly how much power remains uncaptured at any truncation order.

## See also

- Parseval's theorem
- Gibbs phenomenon
- DFT / FFT (discrete implementation)
- Euler's identity
- spectral analysis
- Théorie du signal — cours I1-APP.LSI

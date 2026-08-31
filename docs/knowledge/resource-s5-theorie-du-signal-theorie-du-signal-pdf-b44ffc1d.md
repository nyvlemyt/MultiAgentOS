---
id: resource-s5-theorie-du-signal-theorie-du-signal-pdf-b44ffc1d
slug: resource-s5-theorie-du-signal-theorie-du-signal-pdf-b44ffc1d
source_key: 'sha256:b44ffc1d3d5fbbd3ef815f3cdd659f4289a61a06e576b2bb05f6c7d7f3e7d9d0'
part_of: resource-s5-theorie-du-signal-9d97f2d3
order: 21
manifest: null
derived_from: 'sha256:b44ffc1d3d5fbbd3ef815f3cdd659f4289a61a06e576b2bb05f6c7d7f3e7d9d0'
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
  - fourier-series
  - signal-theory
  - rectangular-pulse
  - parseval
  - gibbs-phenomenon
  - harmonics
  - complex-coefficients
domain: signal processing
---
# S5 - Théorie du signal — Théorie du signal.pdf

## Summary

Worked Fourier series analysis of a rectangular pulse: x(t)=1 on [0,T/4[, 0 elsewhere (duty cycle 1/4). Derives mean, power, complex coefficients λk, fundamental expression, harmonic power via Parseval, and documents numerical reconstruction behaviour including Gibbs phenomenon up to n=2000 harmonics.

## Fields/API

**name**: Signal definition
**value**: x(t)=1 for t∈[0,T/4[, x(t)=0 for t∈[T/4,T[ — duty cycle 1/4, period T, ωT=2π
**name**: Mean ⟨x(t)⟩ = λ0
**value**: 1/4
**name**: Power ⟨x²(t)⟩ = P_totale
**value**: 1/4 = 0.25
**name**: General coefficient λk (k>0)
**value**: λk = (1/(2jkπ)) · (1 − e^{−jkπ/2})
**name**: λ1
**value**: (1−j)/(2π)
**name**: λ2
**value**: −j/(2π)
**name**: λ3
**value**: (−1−j)/(6π)
**name**: λ4
**value**: 0 (cancels because duty cycle=1/4 makes e^{−j2π}=1)
**name**: Fundamental A1·cos(ωt−Θ1)
**value**: A1 = √2/π ≈ 0.450, Θ1 = −π/4 → (√2/π)·cos(ωt+π/4)
**name**: Power — first 4 harmonics (Parseval)
**value**: P = 1/16 + 29/(18π²) ≈ 0.2257, representing ≈90% of P_totale
**name**: Gibbs phenomenon
**value**: Overshoot persists at discontinuities for any finite N; amplitude decays as 1/(kπ); high-rank harmonics reconstruct edges, not flat regions
**name**: Numerical reconstruction convergence
**value**: Non-monotone; plateaus near P_recon≈0.1256 (not 0.25) even at n=2000 — gap with theory is a known numerical-truncation effect

## Constraints

- ωT = 2π required for the e^{−jkπ/2} substitution in λk
- λ0 = mean = 1/4; formula above holds only for k≥1
- Parseval: P = |λ0|² + 2·Σ_{k=1}^{N}|λk|² (two-sided spectrum folded)
- λk computed as (1/(jkωT))·(1−e^{−jkωT/4}); simplifies via ωT=2π
- Harmonics at k=4,8,12,… vanish for this duty cycle (e^{−j2π·integer}=1)

## Examples

- λ2 derivation: (1/(4jπ))·(1−e^{−jπ}) = (1/(4jπ))·2 = 1/(2jπ); multiply by j/j → −j/(2π)
- λ3 derivation: e^{−j3π/2}=j → (1−j)/(6jπ); multiply by j/j → (j−j²)/(6πj²) = (−1−j)/(6π)
- |λ1|² = ((1−j)/(2π))·((1+j)/(2π)) = 2/(4π²) = 1/(2π²)
- P_4harmoniques = 1/16 + 2·[1/(2π²) + 1/(4π²) + 1/(18π²) + 0] = 1/16 + 29/(18π²) ≈ 0.2257
- Reconstruction steps: n=0 → P=0.0625 (DC only); n=46 → 0.1246; n=335 → 0.1256 (peak); n=2000 → 0.1253

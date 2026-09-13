---
id: resource-s5-theorie-du-signal-q06-pdf-d45bc073
slug: resource-s5-theorie-du-signal-q06-pdf-d45bc073
source_key: 'sha256:d45bc073b053b029543794d05e884c6dc4042d6e79088f09e4995896f5a40516'
part_of: resource-s5-theorie-du-signal-9d97f2d3
order: 13
manifest: null
derived_from: 'sha256:d45bc073b053b029543794d05e884c6dc4042d6e79088f09e4995896f5a40516'
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
doc_type: tutorial
actionability: resource
lane: knowledge
schema_version: '1'
tags:
  - fourier-series
  - signal-theory
  - harmonic-analysis
  - periodic-signals
  - complex-coefficients
domain: signal processing
---
# S5 - Théorie du signal — Q06.pdf

## Goal

Compute the Fourier series development of a periodic rectangular signal x(t) — mean value, power, complex coefficients λ_k, fundamental harmonic expression, and harmonic power up to order 4.

## Prerequisites

- Definition of a periodic signal and its period T
- Euler's formula: e^(iθ) = cos θ + i·sin θ
- Basic integral calculus

## Steps

**step**: 1
**title**: Plot x(t)
**body**: x(t) is a rectangular periodic signal: x(t) = 1 for t ∈ [0, 3T/4] and x(t) = 0 for t ∈ [3T/4, T]. The duty cycle is 3/4.
**step**: 2
**title**: Compute mean value ⟨x(t)⟩
**body**: ⟨x(t)⟩ = (1/T) ∫₀ᵀ x(t) dt = (1/T)[t]₀^(3T/4) = 3/4.
**step**: 3
**title**: Compute total power P
**body**: P = (1/T) ∫₀ᵀ x(t)² dt = (1/T) ∫₀^(3T/4) 1² dt = (1/T)·(3T/4) = 3/4 = 0.75.
**step**: 4
**title**: General formula for Fourier coefficients λ_k (k > 0)
**body**: λ_k = (1/T) ∫₀ᵀ x(t)·e^(−ikωt) dt, with ω = 2π/T. Since x(t) = 1 on [0, 3T/4] and 0 elsewhere, the integral reduces to ∫₀^(3T/4) e^(−ikωt) dt. After integration: λ_k = (1/(ik·2π))·(1 − e^(−i·(3π/2)·k)).
**step**: 5
**title**: Compute explicit values λ₁, λ₂, λ₃, λ₄
**body**: Using the general formula with Euler's formula (cos + i·sin):
• λ₁ = (1−i)/(2π) = (1/2π) + i·(1/2π)·(−1) → |λ₁|² = 1/(2π²)
• λ₂ = −i/(2·2π) = −i/(4π) → |λ₂|² = 1/(4π²) [note: sign error flagged in source on this slide]
• λ₃ = (1−i)/(6π) → |λ₃|² = 1/(18π²)
• λ₄ = 0 (because e^(−i·6π) = 1, so 1−1 = 0)
**step**: 6
**title**: Express the fundamental harmonic h₁(t)
**body**: h₁(t) = 2·|λ₁|·cos(ωt + θ₁), where |λ₁| = 1/(2π·√2)·√2 = 1/(√2·2π) = 1/√(4π²)·… computed as |λ₁| = √(a²+b²) with a = 1/(2π), b = −1/(2π): |λ₁| = √(2/(4π²)) = 1/(π√2). Phase: θ₁ = arctan(a/b) = arctan(−1) = −π/4. Result: h₁(t) = (√2/π)·cos(ωt − π/4) = (1/(π√2))·2·cos(ωt − π/4).
**step**: 7
**title**: Compute harmonic power up to order 4
**body**: Parseval formula: P = λ₀² + 2·Σ|λ_k|² (k=1..∞). Truncated to order 4:
P₄ = (3/4)² + 2·(|λ₁|² + |λ₂|² + |λ₃|² + |λ₄|²)
   = 9/16 + 2·(1/(2π²) + 1/(4π²) + 1/(18π²) + 0)
   = 9/16 + 2·(7/(9π²)) ≈ 0.5625 + 0.1585 ≈ 0.72.
**step**: 8
**title**: Compare with theoretical power
**body**: Theoretical P = 0.75; harmonic sum to order 4 ≈ 0.72. The gap (0.03) comes from harmonics of order ≥ 5 not included. As more harmonics are added, the harmonic sum converges to the theoretical power (Parseval's theorem).

## Result

The Fourier series of x(t) converges to the rectangular signal. The first 4 harmonics already account for ~96 % of the total power (0.72/0.75), confirming that most energy is concentrated in low-order harmonics for a duty-cycle-3/4 rectangular wave.

## Next

- Extend the harmonic sum to order N and observe convergence to 0.75
- Plot the partial Fourier reconstruction and observe Gibbs phenomenon at discontinuities
- Generalize to duty cycle α: λ_k = (1/(ikω·T))·(1 − e^(−i·2παk))

---
id: resource-s5-theorie-du-signal-q03-pdf-598b4d99
slug: resource-s5-theorie-du-signal-q03-pdf-598b4d99
source_key: 'sha256:598b4d9919fefc4e2c81642176c7c9ce9865937649f54ae01aa269937c621674'
part_of: resource-s5-theorie-du-signal-9d97f2d3
order: 10
manifest: null
derived_from: 'sha256:598b4d9919fefc4e2c81642176c7c9ce9865937649f54ae01aa269937c621674'
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
  - signal-processing
  - convolution
  - linear-systems
  - discretization
  - windowing
  - numerical-simulation
domain: signal-theory
---
# S5 - Théorie du signal — Q03.pdf

## Thesis

The convolution of a decaying exponential x(τ) = e^{-aτ}·u(τ) with a unit step y(τ) = u(τ) yields z(t) = (1/a)·(1 − e^{-at}) analytically, but numerical simulation produces a sudden drop to zero — a discretization and windowing artifact, not a precision error.

## Context

Undergraduate signal theory course (I1-APP.LSI, September 2024). Students compute the convolution product analytically, then simulate it with software, and must explain the discrepancy between the theoretical curve (which saturates toward 1/a) and the numerical curve (which rises then abruptly falls to zero).

## Reasoning

1. **Analytical derivation.** Because x(τ) = 0 for τ < 0 and y(t−τ) = 0 for τ > t, the integration bounds collapse to [0, t]: z(t) = ∫₀ᵗ e^{-aτ} dτ = (1/a)·(1 − e^{-at}) for t ≥ 0, and z(t) = 0 for t < 0. The result is a saturating exponential that asymptotically approaches 1/a.
2. **Numerical convolution mechanics.** A computer must discretize the signals and represent each over a finite window of N samples. The discrete convolution of two length-N signals produces 2N−1 output values. When the convolution kernel slides past the defined window of x[n], the computer treats x as zero outside that window — effectively multiplying x by a rectangular (gate) function.
3. **Windowing artifact.** At the point where the sliding y[t−τ] reaches the tail of x's window, x values are implicitly set to zero. This causes the accumulation in the convolution sum to abruptly decrease, producing a sharp drop in the output signal toward zero rather than the expected plateau.
4. **Root cause summary.** The divergence between theoretical and numerical results is not floating-point imprecision — it is structural: discrete convolution is inherently a finite-support operation. Without zero-padding x well beyond its natural window, the numerical result will always truncate prematurely.

## Trade-offs

Extending the window (zero-padding) of x[n] before convolution removes the artifact but increases computation time and memory. The theoretical expression assumes infinite-duration signals; numerical tools always work with finite buffers, so some mismatch is unavoidable unless the window is made long relative to the system's time constant 1/a.

## See also

- discrete-fourier-transform
- zero-padding
- finite-impulse-response
- linear-time-invariant-systems
- step-response

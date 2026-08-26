---
id: resource-s5-theorie-du-signal-chap-4-la-transformation-de-fourier-pdf-6aab02dd
slug: resource-s5-theorie-du-signal-chap-4-la-transformation-de-fourier-pdf-6aab02dd
source_key: 'sha256:6aab02dd04d6379c6c5c3609dd29394e297149810821756e009b26306db18616'
part_of: S5 - Théorie du signal
order: 4
manifest: null
derived_from: 'sha256:6aab02dd04d6379c6c5c3609dd29394e297149810821756e009b26306db18616'
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
  - fourier-transform
  - signal-processing
  - spectral-analysis
  - convolution
  - shannon-theorem
  - filters
  - mathematics
domain: signal-theory
---
# S5 - Théorie du signal — Chap 4 - La transformation de Fourier.pdf

## Summary

Cours de théorie du signal (I1-APP.LSI, sept. 2024) couvrant la Transformation de Fourier (TF) : définition, propriétés, transformées usuelles, lien avec la convolution, fonction de transfert et théorème de Shannon.

## Fields/API

**definition**: **direct**: X(f) = TF{x(t)} = ∫_{-∞}^{+∞} x(t) e^{-2iπft} dt
**inverse**: x(t) = TF⁻¹{X(f)} = ∫_{-∞}^{+∞} X(f) e^{+2iπft} df
**amplitude_spectrum**: |X(f)|
**phase_spectrum**: Arg(X(f))
**properties**: **spectral_parity_real_signals**: **amplitude**: |X(-f)| = |X(f)| (paire)
**phase**: Arg(X(-f)) = -Arg(X(f)) (impaire)
**conjugate**: X(f) = X*(-f)
**delay**: TF{x(t-τ)} = e^{-2jπfτ} · X(f)
**modulation**: TF{x(t) e^{2jπνt}} = X(f - ν)
**scaling**: TF{x(λt)} = (1/λ) X(f/λ)
**derivation**: TF{dx(t)/dt} = 2iπf · X(f)
**duality**: x(-f) = TF{X(t)}
**conjugate_symmetries**: - X*(-f) = TF{x*(t)}
- X(-f) = TF{x(-t)}
- X*(f) = TF{x*(-t)}
**standard_transforms**: **dirac_delta**: TF{δ(t)} = 1
**shifted_dirac**: TF{δ(t-τ)} = e^{-2iπfτ}
**complex_exponential**: TF{e^{2iπf₀t}} = δ(f - f₀)
**constant_1**: TF{1} = δ(f)
**cosine**: TF{cos(2πf₀t)} = (1/2)[δ(f-f₀) + δ(f+f₀)]
**sine**: TF{sin(2πf₀t)} = (1/2i)[δ(f-f₀) - δ(f+f₀)]
**rect_function**: TF{Π_τ(t)} = τ · sinc(πτf) = sin(πτf)/(πf)
**convolution_theorem**: **time_to_freq**: TF{x(t) * y(t)} = X(f) · Y(f)
**freq_to_time**: TF{x(t) · y(t)} = X(f) * Y(f)
**linear_system_transfer**: **relation**: S(f) = R(f) · E(f)  ←→  s(t) = r(t) * e(t)
**filter_examples**: **low_pass**: R_LOW(f) = 1 / (1 + i·f/fc)
**high_pass**: R_HI(f) = (i·f/fc) / (1 + i·f/fc)
**band_pass**: R_BP(f) = (i·f/qf₀) / (1 + i·f/qf₀ + i·f²/qf₀²)
**shannon_theorem**: **context**: Signal x(t) band-limited, sampled at period T_E (frequency F_E = 1/T_E)
**effect**: Spectrum repeats periodically at frequency F_E
**condition**: No aliasing if F_E ≥ 2 · F_MAX
**periodic_signal_spectrum**: **series**: x(t) = Σ λ_k e^{ikωt}  with  λ_n = (1/T) ∫_T x(t) e^{-inωt} dt
**fourier_transform**: X(f) = Σ λ_k δ(f - k/T)  (line spectrum at harmonics)

## Constraints

- Signal must be integrable (L¹ or L²) for TF to exist in classical sense.
- Dirac distributions require distributional framework.
- Parity properties (amplitude even, phase odd) hold only for real-valued signals.
- Shannon theorem: sampling frequency must be at least twice the maximum frequency to avoid aliasing.
- Duality holds only when swapping t and f roles symmetrically in the transform pair.

## Examples

- Square wave spectrum: sinc-shaped envelope, harmonics at multiples of fundamental frequency; halving frequency doubles spectral line spacing.
- TF{δ(t)} = 1 → flat (white) spectrum; TF{1} = δ(f) → single DC component.
- Windowing (finite observation window) of a sinusoid: TF of x_P(t) = x(t)·Π_τ(t) is a convolution of the sinusoid spectrum with a sinc; frequency resolution improves as τ/T increases.
- Convolution in time ↔ multiplication in frequency: used in filter design (S(f) = R(f)·E(f)).
- Dirac comb of period T → Fourier transform is also a Dirac comb of period 1/T (basis of sampling theory).

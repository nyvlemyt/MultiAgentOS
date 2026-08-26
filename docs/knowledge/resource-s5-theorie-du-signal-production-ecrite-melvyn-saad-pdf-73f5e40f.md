---
id: resource-s5-theorie-du-signal-production-ecrite-melvyn-saad-pdf-73f5e40f
slug: resource-s5-theorie-du-signal-production-ecrite-melvyn-saad-pdf-73f5e40f
source_key: 'sha256:73f5e40fd0cd3c50235fdba0b847a374e026689b086b4b833407f7579dc36560'
part_of: S5 - Théorie du signal
order: 7
manifest: null
derived_from: 'sha256:73f5e40fd0cd3c50235fdba0b847a374e026689b086b4b833407f7579dc36560'
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
  - fourier
  - théorie-du-signal
  - harmoniques
  - parseval
  - gibbs
  - série-de-fourier
  - signal-rectangulaire
domain: mathématiques — traitement du signal
---
# S5 - Théorie du signal — Production écrite Melvyn Saad.pdf

## Summary

Fiche de calcul complète pour un signal rectangulaire périodique x(t) = 1 sur [0, T/4[ et 0 sur [T/4, T[. Couvre moyenne, puissance, coefficients de Fourier complexes λk (forme générale et valeurs k=1..4), expression de la fondamentale, théorème de Parseval (≈90 % de la puissance concentrée dans les 4 premiers harmoniques), et analyse numérique du phénomène de Gibbs lors de la reconstruction.

## Fields/API

**signal**: x(t) = 1 pour t∈[0, T/4[, x(t) = 0 pour t∈[T/4, T[
**moyenne**: ⟨x(t)⟩ = 1/4
**puissance_totale**: ⟨x²(t)⟩ = 1/4 = 0.25
**coefficient_général_k_positif**: λk = (1 − e^{−jkπ/2}) / (2jkπ)  [avec ωT = 2π]
**λ0**: 1/4  (valeur moyenne)
**λ1**: (1 − j) / (2π)
**λ2**: −j / (2π)
**λ3**: (−1 − j) / (6π)
**λ4**: 0  [car e^{−j2π} = 1]
**fondamentale**: (√2 / π) · cos(ωt − π/4)
**amplitude_fondamentale**: A1 = 2|λ1| = √2 / π
**phase_fondamentale**: Θ1 = −π/4
**puissance_4harmoniques**: 1/16 + 29/(18π²) ≈ 0.2257
**ratio_puissance**: P_4harmoniques / P_totale ≈ 0.2257 / 0.25 ≈ 90 %
**décroissance_amplitude**: |λk| ≈ 1/(kπ) pour k élevé  (décroissance en 1/k)

## Constraints

- ωT = 2π — condition de périodicité utilisée pour simplifier e^{−jkωT/2}
- λ4 = 0 car e^{−j2π} = 1, donc (1 − 1) = 0
- Le phénomène de Gibbs persiste aux discontinuités quelle que soit la valeur de N
- La convergence numérique de la puissance reconstituée n'est pas monotone ; elle plafonne autour de 0.1256 dès n = 335 et ne rejoint pas la puissance théorique 0.25 même à n = 2000
- Parseval : P = |λ0|² + 2·Σ_{k=1}^{N} |λk|²

## Examples

- Calcul λ1 : e^{−jπ/2} = −j → λ1 = (1+j)/(2jπ) ; multiplier par j/j → (1−j)/(2π)
- Calcul λ2 : e^{−jπ} = −1 → λ2 = 2/(4jπ) = 1/(2jπ) ; multiplier par j/j → −j/(2π)
- Calcul λ3 : e^{−j3π/2} = j → λ3 = (1−j)/(6jπ) ; multiplier par j/j → (−1−j)/(6π)
- Parseval 4 harmoniques : P = 1/16 + 2·(1/(2π²) + 1/(4π²) + 1/(18π²) + 0) = 1/16 + 29/(18π²) ≈ 0.2257
- Reconstruction numérique — n=0 : P_recon = 0.0625 ; n=46 : 0.1246 ; n=335 : 0.1256 (max) ; n=2000 : 0.1253 → convergence non monotone, limite pratique de la série de Fourier sur signal discontinu

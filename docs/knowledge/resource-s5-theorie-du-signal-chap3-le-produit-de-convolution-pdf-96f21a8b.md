---
id: resource-s5-theorie-du-signal-chap3-le-produit-de-convolution-pdf-96f21a8b
slug: resource-s5-theorie-du-signal-chap3-le-produit-de-convolution-pdf-96f21a8b
source_key: 'sha256:96f21a8b74c5428cf7219ec058dc036a625b80b66eb753297ecbbbc6c660a1ec'
part_of: S5 - Théorie du signal
order: 5
manifest: null
derived_from: 'sha256:96f21a8b74c5428cf7219ec058dc036a625b80b66eb753297ecbbbc6c660a1ec'
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
  - signal-processing
  - convolution
  - linear-systems
  - fourier
  - discrete-time
  - continuous-time
  - impulse-response
  - matlab
domain: signal-theory
---
# S5 - Théorie du signal — Chap3 - Le produit de convolution.pdf

## Summary

Le produit de convolution est l'outil mathématique central pour modéliser la réponse d'un système linéaire invariant dans le temps (LTI). Si r(t) est la réponse impulsionnelle du système, alors la sortie s(t) s'obtient en convoluant r(t) avec l'entrée e(t). La connaissance de r(t) suffit à caractériser entièrement le système.

## Fields/API

**name**: Définition (temps continu)
**value**: s(t) = r(t) * e(t) = ∫₋∞^{+∞} e(τ) r(t−τ) dτ = ∫₋∞^{+∞} r(τ) e(t−τ) dτ
**name**: Définition (temps discret)
**value**: s[n] = r[n] * e[n] = Σ_{k=−∞}^{+∞} e[k] r[n−k] = Σ_{k=−∞}^{+∞} r[k] e[n−k]
**name**: Commutativité
**value**: x(t) * y(t) = y(t) * x(t)
**name**: Associativité
**value**: (x(t) * y(t)) * z(t) = x(t) * (y(t) * z(t))
**name**: Linéarité
**value**: (α·a(t) + β·b(t)) * x(t) = α·a(t)*x(t) + β·b(t)*x(t)
**name**: Élément neutre (impulsion de Dirac)
**value**: x(t) * δ(t) = x(t)
**name**: Retard temporel
**value**: x(t) * δ(t − θ) = x(t − θ)
**name**: Dérivation
**value**: d/dt [x(t) * y(t)] = x(t) * dy(t)/dt = dx(t)/dt * y(t)
**name**: Périodicité (peigne de Dirac)
**value**: Un motif m(t) T-périodique s'écrit x(t) = Σ m(t−nT) = m(t) * Ш(t/T)/T, où Ш est le peigne de Dirac.
**name**: Fonctions propres
**value**: r(t) * e^{iωt} = R(ω) · e^{iωt}, où R(ω) = ∫ r(τ) e^{−iωτ} dτ est la transformée de Fourier de r(t). Les exponentielles complexes sont fonctions propres des systèmes LTI.
**name**: Lien Transformée de Fourier
**value**: TF{x(t) * y(t)} = X(f) · Y(f)  ;  TF{x(t) · y(t)} = X(f) * Y(f)
**name**: Réponse impulsionnelle
**value**: r(t) caractérise complètement un système LTI. Elle s'obtient expérimentalement en appliquant une impulsion à l'entrée et en observant la sortie.

## Constraints

- Valable uniquement pour les systèmes linéaires invariants dans le temps (LTI).
- L'intégrale de convolution converge sous réserve que les signaux soient d'énergie finie ou que la réponse impulsionnelle soit stable (BIBO).
- En temps discret, conv(x, y) en Matlab produit un vecteur de longueur length(x)+length(y)−1.
- La dérivation de la convolution nécessite que les signaux soient dérivables ; en pratique on utilise les distributions (Dirac, échelon).

## Examples

**label**: Convolution discrète Matlab
**description**: x = [−1, 0, 1], y = [1, 2, 4]. conv(x,y) donne z = [−1, −2, −3, 2, 4]. Méthode : retourner-décaler y(n−k) et calculer le produit scalaire avec x pour chaque n.
**label**: Réponse impulsionnelle d'un système RC
**description**: Entrée échelon e(t)=1 (t≥0), sortie s(t)=1−e^{−t/τ} (t≥0). La réponse impulsionnelle se déduit par dérivation : r(t) = ds/dt = (1/τ)e^{−t/τ}·u(t).
**label**: Convolution de deux créneaux
**description**: x(t) = Π(t/2T) et y(t) = Π(t/T). Le produit f(t)=x(t)*y(t) est un trapèze dont la durée totale est 2T+T=3T (la durée d'une convolution est la somme des durées des signaux).

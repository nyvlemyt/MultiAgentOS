---
id: resource-s5-theorie-du-signal-presentation-universe-pdf-10a15be8
slug: resource-s5-theorie-du-signal-presentation-universe-pdf-10a15be8
source_key: 'sha256:10a15be818771bf3d963c16d23a03b00592b6336692bebaf8d5bd0da133001dd'
part_of: resource-s5-theorie-du-signal-9d97f2d3
order: 6
manifest: null
derived_from: 'sha256:10a15be818771bf3d963c16d23a03b00592b6336692bebaf8d5bd0da133001dd'
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
  - fourier
  - series-de-fourier
  - signal-periodique
  - harmoniques
  - parseval
  - gibbs
  - theorie-du-signal
domain: mathématiques du signal
---
# S5 - Théorie du signal — Présentation UNIVERSE.pdf

## Thesis

Toute fonction périodique peut être décomposée en une somme infinie de sinusoïdes (harmoniques) via les séries de Fourier. La série converge vers la fonction d'origine à mesure que le nombre d'harmoniques croît, mais un résidu irréductible subsiste aux discontinuités (phénomène de Gibbs).

## Context

Cours de théorie du signal (S5), appliqué à un signal rectangulaire périodique. Le calcul d'énergie n'a pas de sens pour un signal périodique (il serait infini) ; seules la moyenne et la puissance sont des caractéristiques pertinentes. La décomposition de Fourier fournit une représentation fréquentielle complète du signal.

## Reasoning

1. **Représentation graphique** : le signal rectangulaire périodique sert de cas d'étude concret. 2. **Coefficients de Fourier (λk)** : on détermine l'expression générale de λk, puis on calcule λ1 à λ4 et on les met sous forme cartésienne (parties réelle a et imaginaire b). 3. **Fondamental / première harmonique** : on extrait le module ρ = √(a²+b²) et l'argument θ (cos θ = a/ρ, sin θ = b/ρ) par lecture sur le cercle trigonométrique. 4. **Théorème de Parseval** : la puissance totale du signal est égale à la somme des puissances de chaque harmonique — ce qui permet de quantifier la contribution relative de chaque rang. 5. **Reconstruction informatique** : la superposition successive des harmoniques reproduit visuellement le signal d'origine avec une fidélité croissante.

## Trade-offs

— **Phénomène de Gibbs** : aux points de discontinuité du signal, un dépassement oscillatoire (~9 %) persiste quel que soit le nombre d'harmoniques ajoutés ; la convergence est en puissance, pas en amplitude ponctuelle. — **Convergence rapide en puissance** : les quatre premiers harmoniques suffisent déjà à approximer la puissance totale ; les harmoniques de rang élevé contribuent de moins en moins. — **Énergie vs puissance** : pour un signal périodique, la puissance moyenne est le bon indicateur — l'énergie est infinie et sans intérêt pratique.

## See also

- transformée de Fourier discrète (TFD/FFT)
- théorème de Parseval
- phénomène de Gibbs
- analyse harmonique
- signal rectangulaire
- cercle trigonométrique

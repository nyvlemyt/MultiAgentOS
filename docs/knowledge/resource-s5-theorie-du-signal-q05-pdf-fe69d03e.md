---
id: resource-s5-theorie-du-signal-q05-pdf-fe69d03e
slug: resource-s5-theorie-du-signal-q05-pdf-fe69d03e
source_key: 'sha256:fe69d03ef3247de60a6a01aa5cfbc4217f15e54c3c6b1030169b04fe30cc5ced'
part_of: S5 - Théorie du signal
order: 12
manifest: null
derived_from: 'sha256:fe69d03ef3247de60a6a01aa5cfbc4217f15e54c3c6b1030169b04fe30cc5ced'
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
  - periodic-signal
  - harmonics
  - parseval
  - gibbs-phenomenon
  - spectral-decomposition
  - rectangular-signal
domain: signal processing
---
# S5 - Théorie du signal — Q05.pdf

## Thesis

Toute signal périodique peut être décomposé en une somme (infinie) d'harmoniques sinusoïdaux via la série de Fourier ; la convergence vers le signal d'origine est assurée, mais le phénomène de Gibbs subsiste aux discontinuités quelle que soit la troncature.

## Context

Cours S5 Théorie du signal — présentation étudiante (Melvyn, Saad, Rayane) portant sur un signal rectangulaire périodique comme cas d'étude. Couvre la représentation graphique, les caractéristiques fondamentales (moyenne, puissance — mais pas d'énergie pour un signal périodique car elle serait infinie), la décomposition de Fourier, l'analyse du fondamental et la reconstruction numérique.

## Reasoning

1. **Caractéristiques fondamentales** : sur un signal périodique on calcule la moyenne et la puissance ; l'énergie n'a pas de sens (signal infini dans le temps). 2. **Décomposition de Fourier** : on détermine l'expression générale des coefficients complexes λk, puis on calcule λ1, λ2, λ3, λ4 et on les met sous forme cartésienne (partie réelle a, imaginaire b). 3. **Fondamental (1ère harmonique)** : on extrait le module ρ = √(a²+b²) et l'argument θ via cos θ = a/ρ et sin θ = b/ρ, lu sur le cercle trigonométrique. 4. **Théorème de Parseval** : la puissance totale du signal est égale à la somme des puissances de chaque harmonique — les quatre premiers harmoniques fournissent déjà une approximation proche de la puissance totale ; les rangs élevés contribuent de moins en moins. 5. **Reconstruction informatique** : plus n augmente, meilleure est la reconstruction visuelle, mais le phénomène de Gibbs (sur-oscillation aux points de discontinuité) persiste même avec un grand nombre d'harmoniques.

## Trade-offs

Augmenter le nombre d'harmoniques améliore la fidélité spectrale et réduit l'erreur quadratique moyenne, mais ne supprime jamais le phénomène de Gibbs aux discontinuités — l'overshoot reste ≈ 9 % peu importe n. En pratique, les 4 premiers harmoniques suffisent à capturer l'essentiel de la puissance d'un signal rectangulaire ; au-delà, le gain marginal décroît rapidement (loi en 1/n² pour les coefficients d'un créneau).

## See also

- Transformée de Fourier (signal apériodique)
- Phénomène de Gibbs
- Théorème de Parseval
- Analyse spectrale
- Filtrage fréquentiel

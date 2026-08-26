---
id: resource-s5-theorie-du-signal-q04-pdf-13df9550
slug: resource-s5-theorie-du-signal-q04-pdf-13df9550
source_key: 'sha256:13df95503171790293dc4b61d148769b93fb4dd6089953ef3eced54bfe826a06'
part_of: S5 - Théorie du signal
order: 11
manifest: null
derived_from: 'sha256:13df95503171790293dc4b61d148769b93fb4dd6089953ef3eced54bfe826a06'
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
  - harmonics
  - periodic-signals
  - mathematics
  - DSP
domain: Signal Processing / Mathematics
---
# S5 - Théorie du signal — Q04.pdf

## Goal

Développer le signal périodique x(t) en série de Fourier complexe, en calculant ses coefficients Λk, puis vérifier numériquement la convergence avec k=5 et k=100 harmoniques.

## Prerequisites

- Notion de signal périodique et de période T
- Intégrale sur une période (calcul de valeur moyenne)
- Exponentielles complexes e^(j2πkt/T)
- Formule générale des coefficients de Fourier complexes Λk

## Steps

- 1. Représentation graphique de x(t) — Tracer x(t) sur plusieurs périodes (exemple illustré pour T=1) afin d'identifier visuellement la forme du signal et ses symétries.
- 2. Calcul de la valeur moyenne — Appliquer la formule Λ0 = (1/T)∫₀ᵀ x(t) dt sur une période pour obtenir la composante continue du signal.
- 3. Expression générale des coefficients Λk — À partir de la formule d'analyse de Fourier Λk = (1/T)∫₀ᵀ x(t)·e^(−j2πkt/T) dt, calculer l'expression analytique des Λk pour k≠0.
- 4. Développement en série de Fourier de x(t) — Substituer les Λk dans la formule de synthèse x(t) = Σₖ Λk·e^(j2πkt/T), puis calculer le module |Λk| et l'argument arg(Λk) de chaque coefficient.
- 5. Les 3 premiers harmoniques — Extraire les expressions explicites des harmoniques k=1, k=2, k=3 à partir du développement général obtenu à l'étape 4.
- 6. Illustration numérique et comparaison — Reconstruire x(t) numériquement avec T=1 pour k=5 harmoniques, puis pour k=100 harmoniques, et comparer les reconstructions à la courbe théorique pour visualiser la convergence (phénomène de Gibbs aux discontinuités).

## Result

Le signal x(t) est exprimé comme une somme infinie d'exponentielles complexes pondérées par les Λk. La reconstruction numérique montre qu'à k=5 l'approximation est grossière aux discontinuités, tandis qu'à k=100 elle converge vers x(t) avec oscillations de Gibbs résiduelles aux sauts.

## Next

- Transformée de Fourier (passage au spectre continu pour signaux non périodiques)
- Transformée de Fourier discrète (DFT/FFT) pour le traitement numérique
- Analyse spectrale en amplitude et en phase (diagramme de Bode)

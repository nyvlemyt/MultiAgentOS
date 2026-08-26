---
id: resource-s5-theorie-du-signal-q09-pdf-35fd092b
slug: resource-s5-theorie-du-signal-q09-pdf-35fd092b
source_key: 'sha256:35fd092bdd4f9497cfc75452fef29c8a32f4dcdb513fc2bb33353b99dbeb8b75'
part_of: S5 - Théorie du signal
order: 16
manifest: null
derived_from: 'sha256:35fd092bdd4f9497cfc75452fef29c8a32f4dcdb513fc2bb33353b99dbeb8b75'
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
  - signal-theory
  - convolution
  - continuous-time
  - piecewise-functions
  - MATLAB
  - LSI
domain: signal processing
---
# S5 - Théorie du signal — Q09.pdf

## Goal

Calculer le produit de convolution z(t) = (x*y)(t) de deux signaux définis par morceaux en temps continu, et en vérifier le résultat numériquement sous MATLAB.

## Prerequisites

- Calcul intégral de base (intégrale d'une fonction affine sur un segment)
- Notion de signal défini par morceaux et de support temporel
- Compréhension de la symétrie et du décalage d'une fonction (retournement temporel)

## Steps

- 1. **Définir x(t)** — signal porte (rectangular pulse) non nul sur un intervalle de durée T centré en 0 : x(t) = 1 pour t ∈ [−T/2 ; T/2], 0 ailleurs. Pour T = 3/2, le support est [−1,5 ; 1,5].
- 2. **Définir y(t)** — signal décroissant linéairement sur [0 ; T], nul en dehors : y(t) = (T − t)/T pour t ∈ [0 ; T], 0 ailleurs. Pour T = 3/2, le support est [0 ; 3].
- 3. **Retourner y** — former y(−u) (symétrique par rapport à l'axe des ordonnées), puis décaler : obtenir y(t − u) en substituant u → t − u. Cette étape est le « glissement » du noyau sur x.
- 4. **Déterminer les intervalles de chevauchement** — identifier les plages de t où y(u) et x(t − u) sont simultanément non nuls. On obtient quatre cas disjoints :
   - Cas 1 : t < −T/2 → aucun chevauchement, z(t) = 0.
   - Cas 2 : −T/2 ≤ t < T/2 → chevauchement partiel croissant, intégrer sur [0 ; t + T/2].
   - Cas 3 : T/2 ≤ t < T → chevauchement complet puis décroissant, intégrer sur [t − T/2 ; T].
   - Cas 4 : t ≥ T + T/2 → aucun chevauchement, z(t) = 0.
- 5. **Calculer l'intégrale pour chaque cas** — pour chaque intervalle, évaluer ∫ y(u) · x(t − u) du en exploitant les expressions affines de y et la valeur constante de x sur son support. Obtenir une expression analytique de z(t) par morceaux.
- 6. **Récapituler z(t)** — assembler les résultats en un tableau par morceaux et tracer la courbe. Observer que le support de z(t) est la somme des supports de x et y : pour T = 3/2, z est non nulle sur [−1,5 ; 4,5], soit une durée de 6 = 2 × T.
- 7. **Vérifier sous MATLAB** — générer x(t), y(t) et z(t) = conv(x, y) discrétisés. Pour T = 3/2 : z(t) augmente sur [−1,5 ; 0,5], puis redescend sur [0,5 ; 4,5], ce qui correspond au résultat analytique.

## Result

On obtient z(t) = (x * y)(t), fonction continue définie par morceaux sur [−T/2 ; 3T/2]. La convolution s'étend sur un intervalle plus large que chacun des signaux d'entrée (durée totale = durée(x) + durée(y)). Pour T = 3/2, la courbe MATLAB confirme : montée linéaire jusqu'à t = 0,5, puis descente jusqu'à t = 4,5.

## Next

- Généraliser le calcul à un paramètre T quelconque et vérifier la linéarité du résultat en T.
- Appliquer la propriété de commutativité (x * y = y * x) et comparer le résultat.
- Explorer la convolution en fréquentiel via la transformée de Fourier (multiplication spectrale).
- Étudier la convolution discrète (systèmes LSI numériques) comme extension naturelle.

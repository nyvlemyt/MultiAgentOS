---
id: resource-s5-probabilite-et-statistique-devoir-a-la-maison-pdf-79f41f6f
slug: resource-s5-probabilite-et-statistique-devoir-a-la-maison-pdf-79f41f6f
source_key: 'sha256:79f41f6fddf1f50ee00af6cefed3712000d3080d38239da35bb033bda6bfd385'
part_of: resource-s5-probabilite-et-statistique-491ffea1
order: 3
manifest: null
derived_from: 'sha256:79f41f6fddf1f50ee00af6cefed3712000d3080d38239da35bb033bda6bfd385'
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
doc_type: howto
actionability: area
lane: knowledge
schema_version: '1'
tags:
  - probabilité
  - statistique
  - loi exponentielle
  - densité de probabilité
  - variable aléatoire continue
  - espérance
  - intégration
  - changement de variable
domain: mathématiques / statistiques
---
# S5 - Probabilité et statistique — Devoir à la maison.pdf

## Problem

Résoudre les trois types de questions standards sur une variable aléatoire continue : (1) déterminer la constante de normalisation d'une densité f(x), (2) calculer une probabilité P(a ≤ X ≤ b), (3) calculer l'espérance E(X) et E(g(X)).

## Solution

**Étape 0 — Identifier la densité.** La densité f(x) est nulle hors du support et suit une expression analytique sur le support (ex. : λe^{−x/100} pour x ≥ 0, ou k√x pour 0 < x < 1).

**Étape 1 — Trouver la constante de normalisation.** Poser ∫f(x)dx = 1 sur le support, intégrer analytiquement (règle de puissance ou intégrale exponentielle), résoudre pour la constante. Exemples : pour f(x)=λe^{−x/100}, on obtient λ=1/100 ; pour f(x)=k√x sur [0,1], on obtient k=3/2.

**Étape 2 — Calculer P(a ≤ X ≤ b).** Écrire ∫_a^b f(x)dx. Appliquer un changement de variable si utile (u = x/100 pour l'exponentielle). Évaluer entre les bornes transformées. Ex. : P(50 ≤ X ≤ 150) = e^{−0.5} − e^{−1.5} ≈ 0.3834 ; P(X < 100) = 1 − e^{−1} ≈ 0.6321.

**Étape 3 — Calculer E(X) et E(g(X)).** E(X) = ∫x·f(x)dx. Pour E(g(X)) utiliser la linéarité : E(5X²−3X+1) = 5E(X²) − 3E(X) + 1, avec E(X^n) = ∫x^n·f(x)dx. Pour f(x)=(3/2)√x sur [0,1] : E(X)=3/5, E(X²)=3/7, donc E(5X²−3X+1)=15/7 − 9/5 + 1 = 32/35.

## Variations

• Loi exponentielle de paramètre μ quelconque : remplacer 100 par μ dans tous les calculs.
• Densité en racine : f(x)=k·x^{α} sur [0,1] — même méthode, la constante k = α+1.
• Espérance d'un polynôme de degré quelconque : décomposer terme par terme par linéarité et calculer chaque E(X^n) séparément.
• P(X > c) = 1 − P(X ≤ c) pour éviter une intégrale sur [c, +∞).

## Pitfalls

• Oublier de vérifier ∫f(x)dx = 1 avant tout calcul — une constante λ incorrecte fausse toutes les probabilités.
• Confondre les bornes après changement de variable (ex. x=50 → u=0.5, pas u=50).
• Appliquer la linéarité de l'espérance à une expression non affine sans décomposer au préalable.
• Utiliser f(x) définie hors de son support (f(x) vaut 0 pour x<0 ou ailleurs) : toujours restreindre l'intégrale au support effectif.

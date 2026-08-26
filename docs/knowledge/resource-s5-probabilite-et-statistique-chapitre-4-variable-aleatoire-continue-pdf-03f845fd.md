---
id: >-
  resource-s5-probabilite-et-statistique-chapitre-4-variable-aleatoire-continue-pdf-03f845fd
slug: >-
  resource-s5-probabilite-et-statistique-chapitre-4-variable-aleatoire-continue-pdf-03f845fd
source_key: 'sha256:03f845fdae2bbe9b5db86b2ce17aa4e613adf41ff0747210aa14ad3d3de0f62f'
part_of: S5 - Probabilité et statistique
order: 1
manifest: null
derived_from: 'sha256:03f845fdae2bbe9b5db86b2ce17aa4e613adf41ff0747210aa14ad3d3de0f62f'
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
  - probabilité
  - statistique
  - variable-aléatoire-continue
  - loi-uniforme
  - loi-exponentielle
  - loi-normale
  - densité
  - espérance
  - variance
  - fonction-de-répartition
domain: mathématiques
---
# S5 - Probabilité et statistique — Chapitre 4 Variable Aléatoire Continue.pdf

## Summary

Référentiel des variables aléatoires continues (cours S5, Syrine HLAOUA). Couvre les notions fondamentales — densité de probabilité, aire sous la courbe, fonction de répartition — puis détaille trois lois usuelles : Uniforme U([a,b]), Exponentielle de paramètre λ, et Normale N(μ,σ²) avec sa version centrée réduite N(0,1). Pour chaque loi : définition, fonction de répartition, espérance et variance.

## Fields/API

**name**: Variable aléatoire continue — densité
**description**: X est continue si P(a ≤ X ≤ b) est égale à l'aire sous la courbe de densité f sur [a,b]. f doit être positive et d'intégrale totale 1.
**name**: Loi Uniforme U([a,b])
**description**: f(x) = 1/(b−a) sur [a,b], 0 ailleurs. Fonction de répartition F(x) = (x−a)/(b−a) sur [a,b]. Espérance E(X) = (a+b)/2. Variance Var(X) = (b−a)²/12.
**name**: Loi Exponentielle Exp(λ)
**description**: f(x) = λ·e^(−λx) pour x ≥ 0, 0 sinon (λ > 0). Fonction de répartition F(x) = 1 − e^(−λx). Espérance E(X) = 1/λ. Variance Var(X) = 1/λ².
**name**: Loi Normale N(μ,σ²)
**description**: f(x) = [1/(σ√(2π))]·exp(−(x−μ)²/(2σ²)), x ∈ ℝ. Courbe en cloche, symétrique autour de μ. Espérance E(X) = μ. Variance Var(X) = σ². Modélise une très large gamme de phénomènes naturels (physique, médecine, agriculture).
**name**: Variable normale centrée réduite Z ~ N(0,1)
**description**: Si X ~ N(μ,σ²) alors Z = (X−μ)/σ ~ N(0,1). Permet de ramener tout calcul de probabilité normale à la table de la loi N(0,1).
**name**: Fonction de répartition — définition générale
**description**: F(x) = P(X ≤ x) = ∫_{−∞}^{x} f(t) dt. Croissante, F(−∞)=0, F(+∞)=1. P(a ≤ X ≤ b) = F(b) − F(a).

## Constraints

- f(x) ≥ 0 pour tout x (densité positive).
- ∫_{−∞}^{+∞} f(x) dx = 1 (densité normalisée).
- Pour U([a,b]) : a < b requis.
- Pour Exp(λ) : λ > 0 requis.
- Pour N(μ,σ²) : σ > 0 requis ; μ ∈ ℝ quelconque.
- P(X = x) = 0 pour toute variable continue (pas de masse ponctuelle).

## Examples

- Exercice corrigé (slide 65) : vérification qu'une fonction donnée est une densité sur [a,b] et calcul de probabilités comme aires sous la courbe.
- Standardisation : X ~ N(3, 4) → Z = (X−3)/2 ~ N(0,1) ; P(X ≤ 5) = P(Z ≤ 1) lu en table.

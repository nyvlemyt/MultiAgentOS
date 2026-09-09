---
id: >-
  resource-s5-probabilite-et-statistique-chapitre-6-liaison-variables-statistiques-pdf-2733540b
slug: >-
  resource-s5-probabilite-et-statistique-chapitre-6-liaison-variables-statistiques-pdf-2733540b
source_key: 'sha256:2733540ba44b34d8c637615582430d52ddb1a682544420fdcdc5c8ec49ee4ee7'
part_of: resource-s5-probabilite-et-statistique-491ffea1
order: 2
manifest: null
derived_from: 'sha256:2733540ba44b34d8c637615582430d52ddb1a682544420fdcdc5c8ec49ee4ee7'
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
  - statistiques
  - régression linéaire
  - corrélation
  - moindres carrés
  - covariance
  - bivariée
domain: mathématiques / statistiques
---
# S5 - Probabilité et statistique — Chapitre 6 Liaison Variables Statistiques.pdf

## Summary

Chapitre de statistique descriptive bivariée couvrant l'ajustement d'une droite de régression par la méthode des moindres carrés, le coefficient de corrélation linéaire r et le coefficient de détermination R².

## Fields/API

**name**: Nuage de points
**definition**: Représentation graphique de n couples (xᵢ, yᵢ) dans le plan. La forme du nuage suggère le type de liaison (droite, parabole, etc.).
**name**: Droite de régression de y en x (moindres carrés)
**definition**: Droite ŷ = âx + b̂ minimisant Σ(yᵢ − axᵢ − b)². Formules : â = cov(x,y) / σx² ; b̂ = ȳ − â·x̄. Peut aussi s'écrire : y − ȳ = â(x − x̄).
**name**: Moyenne
**definition**: x̄ = (1/n)Σxᵢ  ;  ȳ = (1/n)Σyᵢ
**name**: Variance
**definition**: σx² = (1/n)Σ(xᵢ − x̄)² = (1/n)Σxᵢ² − x̄²
**name**: Covariance
**definition**: cov(x,y) = (1/n)Σ(xᵢ − x̄)(yᵢ − ȳ) = (1/n)Σxᵢyᵢ − x̄ȳ
**name**: Coefficient de corrélation linéaire r
**definition**: r = cov(x,y) / (σx · σy). Compris entre −1 et 1. Bonne corrélation si |r| ≥ √3/2 ≈ 0,866. Signe de r indique le sens de la liaison (croissant si r > 0, décroissant si r < 0).
**name**: Formule de décomposition de la variance
**definition**: SCT = SCE + SCR : Σ(yᵢ − ȳ)² = Σ(ŷᵢ − ȳ)² + Σ(yᵢ − ŷᵢ)². SCE = variation expliquée par X ; SCR = résidus non expliqués.
**name**: Coefficient de détermination R²
**definition**: R² = SCE / SCT = 1 − SCR/SCT. Vaut approximativement r². Plus R² est proche de 1, meilleur est l'ajustement.

## Constraints

- −1 ≤ r ≤ 1
- 0 ≤ R² ≤ 1
- Bonne corrélation linéaire conventionnellement si |r| ≥ √3/2 ≈ 0,866
- L'existence d'une liaison statistique n'implique pas de lien de cause à effet
- R² ≈ r² (relation approchée vérifiable)

## Examples

**description**: Série double : x = (2,3,5,1,4), y = (6,6,11,2,10). Résultats : x̄=3, ȳ=7, cov=4,4, σx²=2, â=2,2, b̂=0,4. Droite de régression : y = 2,2x + 0,4. Coefficient de corrélation : r = 4,4 / (√2 × √10,4) ≈ 0,96 (très bonne corrélation). Coefficient de détermination : R² = 48,4/52 ≈ 0,93.

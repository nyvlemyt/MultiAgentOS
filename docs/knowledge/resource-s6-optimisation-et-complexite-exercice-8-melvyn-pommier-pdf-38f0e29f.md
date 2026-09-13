---
id: resource-s6-optimisation-et-complexite-exercice-8-melvyn-pommier-pdf-38f0e29f
slug: resource-s6-optimisation-et-complexite-exercice-8-melvyn-pommier-pdf-38f0e29f
source_key: 'sha256:38f0e29f17d6a9955415f77af193d2f8d0c43be82050407032ee13fdb3b867c3'
part_of: resource-s6-optimisation-et-complexite-7bceb175
order: 5
manifest: null
derived_from: 'sha256:38f0e29f17d6a9955415f77af193d2f8d0c43be82050407032ee13fdb3b867c3'
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
  - transport
  - optimisation
  - programmation-linéaire
  - recherche-opérationnelle
  - contraintes
  - fonction-objectif
  - coût
  - S6
domain: Optimisation et complexité
---
# S6 - Optimisation et complexité — Exercice 8 Melvyn Pommier.pdf

## Summary

Modélisation complète d'un problème de transport classique (3 usines → 4 clients) visant à minimiser le coût total de transport sous contraintes de capacité de production et de satisfaction de la demande. Instance issue du TD1 Exercice 8 de Melvyn Pommier (17/02/2025).

## Fields/API

**variables**: x_{i,j} ≥ 0 : quantité expédiée de l'usine i vers le client j
**matrice_des_coûts_c**: [[26,19,0,4],[12,2,20,24],[19,30,24,28]] (lignes = usines, colonnes = clients)
**capacités_s_i**: **Bordeaux (i=1)**: 25
**Biarritz (i=2)**: 15
**Toulouse (i=3)**: 20
**demandes_d_j**: **Pau (j=1)**: 20
**Bayonne (j=2)**: 12
**Bordeaux (j=3)**: 9
**Libourne (j=4)**: 14
**fonction_objectif**: min Z = Σ_{i=1}^{3} Σ_{j=1}^{4} c_{i,j} · x_{i,j}
**objectif_développé**: min Z = 26x₁₁ + 19x₁₂ + 0x₁₃ + 4x₁₄ + 12x₂₁ + 2x₂₂ + 20x₂₃ + 24x₂₄ + 19x₃₁ + 30x₃₂ + 24x₃₃ + 28x₃₄

## Constraints

**satisfaction_demande**: ∀j ∈ {1,2,3,4} : Σ_{i=1}^{3} x_{i,j} = d_j  (contrainte d'égalité stricte : la demande doit être exactement couverte)
**capacité_production**: ∀i ∈ {1,2,3} : Σ_{j=1}^{4} x_{i,j} ≤ s_i  (contrainte d'inégalité : la production ne dépasse pas la capacité maximale)
**non_négativité**: x_{i,j} ≥ 0 pour tout i, j

## Examples

**contraintes_demande_détaillées**: **Pau**: x₁₁ + x₂₁ + x₃₁ = 20
**Bayonne**: x₁₂ + x₂₂ + x₃₂ = 12
**Bordeaux**: x₁₃ + x₂₃ + x₃₃ = 9
**Libourne**: x₁₄ + x₂₄ + x₃₄ = 14
**contraintes_capacité_détaillées**: **Bordeaux**: x₁₁ + x₁₂ + x₁₃ + x₁₄ ≤ 25
**Biarritz**: x₂₁ + x₂₂ + x₂₃ + x₂₄ ≤ 15
**Toulouse**: x₃₁ + x₃₂ + x₃₃ + x₃₄ ≤ 20
**offre_totale_vs_demande_totale**: Offre totale = 25+15+20 = 60 ; Demande totale = 20+12+9+14 = 55 → problème non équilibré (surplus de 5 unités côté production)

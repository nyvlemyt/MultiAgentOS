---
id: resource-s7-ml2-bus-scolaires-electriques-aux-usa-pptx-8833df78
slug: resource-s7-ml2-bus-scolaires-electriques-aux-usa-pptx-8833df78
source_key: 'sha256:8833df784f3bc4e100d6fa82bcc0ec87e776fff4e17367ecc20ff75cdf141f68'
part_of: resource-s7-ml2-fa640f29
order: 1
manifest: null
derived_from: 'sha256:8833df784f3bc4e100d6fa82bcc0ec87e776fff4e17367ecc20ff75cdf141f68'
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
  - k-means
  - clustering
  - machine-learning
  - data-preprocessing
  - PCA
  - electric-school-buses
  - feature-engineering
  - standardization
  - elbow-method
domain: Machine Learning
---
# S7 - ml2 — Bus Scolaires Eléctriques aux USA.pptx

## Summary

Étude de clustering K-Moyennes appliquée au dataset 'District' sur les bus scolaires électriques aux USA. Le pipeline couvre la sélection de features, le nettoyage, la standardisation, la recherche du K optimal par méthode du coude, et l'interprétation des clusters via PCA et spider plot.

## Fields/API

**name**: Dataset
**value**: District (bus scolaires électriques USA) — choisi pour son volume élevé (réduit le risque d'overfitting)
**name**: Variables retenues
**value**: Indicateurs géographiques, démographiques/ethniques, socio-économiques et environnementaux ; suppression des redondances (adresse, ville, longitude) et des identifiants
**name**: Encodage
**value**: Binaire + One-Hot Coding pour les variables catégorielles (ex. locale rural/urbain)
**name**: Standardisation
**value**: Appliquée après encodage pour homogénéiser les échelles numériques
**name**: K optimal
**value**: K = 3, déterminé par la méthode du coude (10 itérations, rupture de pente à K = 3)
**name**: Clusters identifiés
**value**: Bleu = grandes métropoles (revenu médian élevé, forte densité) ; Rouge = zones rurales (faible pollution) ; Vert = profil intermédiaire
**name**: Visualisations
**value**: PCA 2D (limites inter-clusters fluides, agglomération centrale), spider plot (profils multidimensionnels), carte géographique (confirmation des hypothèses)

## Constraints

- Limites inter-clusters peu marquées en projection PCA (espace inter-cluster réduit) → clusters se chevauchent légèrement
- K-Means sensible à l'initialisation → 10 itérations d'init utilisées pour stabiliser
- Encodage One-Hot augmente la dimensionnalité — nécessite PCA pour visualisation

## Examples

- Colonne 'Locale' (rural/urbain) encodée en binaire avant standardisation
- Courbe d'inertie (elbow) simulée sur 10 valeurs de K ; coude visible à K = 3
- Spider plot à 3 branches confirmant les profils métropole / rural / intermédiaire, validés sur carte

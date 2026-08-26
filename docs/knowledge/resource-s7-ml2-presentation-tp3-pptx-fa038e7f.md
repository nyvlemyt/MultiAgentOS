---
id: resource-s7-ml2-presentation-tp3-pptx-fa038e7f
slug: resource-s7-ml2-presentation-tp3-pptx-fa038e7f
source_key: 'sha256:fa038e7f1525aed518241ed4236ff92ff7ef2693af5ff7ba474cba72c74b9c29'
part_of: S7 - ml2
order: 21
manifest: null
derived_from: 'sha256:fa038e7f1525aed518241ed4236ff92ff7ef2693af5ff7ba474cba72c74b9c29'
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
  - clustering
  - hierarchical-clustering
  - unsupervised-learning
  - segmentation
  - electric-school-bus
  - scikit-learn
  - ward-linkage
  - PCA
  - silhouette
domain: machine-learning
---
# S7 - ml2 — presentation_tp3.pptx

## Summary

Présentation du TP3 ML2 : clustering hiérarchique agglomératif (Ward) appliqué à la segmentation des 56 États/territoires américains selon leur profil d'adoption des bus scolaires électriques (ESB). Le modèle retenu produit 4 clusters interprétables à partir de 12 variables couvrant taille de flotte, adoption électrique et usage scolaire.

## Fields/API

**dataset**: Feuille state-level du dataset ESB (source WRI) — 56 lignes après retrait des agrégats ; l'État est identifiant, pas variable de clustering.
**variables_12**: - bus_total_sbf
- bus_total_fhwa
- bus_total_wri
- esb_committed
- pct_esb_atlas
- pct_esb_sbf
- pct_esb_fhwa
- pct_esb_wri
- pct_esb_average
- students_riding_esb_est
- persons_school_bus
- pct_persons_school_bus
**preprocessing_pipeline**: - Conversion numérique + retrait lignes agrégats
- Imputation par la médiane (valeurs manquantes)
- Transformation log1p (compression volumes)
- Standardisation (moyenne 0, écart-type 1)
**algorithme**: AgglomerativeClustering — chaque État commence seul, les profils proches fusionnent progressivement
**linkage**: Ward — minimise l'augmentation de variance interne à chaque fusion
**clusters_retenus**: 4
**metriques**: **silhouette**: 0.284
**calinski_harabasz**: 16.75
**clusters_resultats**: **leaders**: 2 États — 13,5 % ESB moyen
**grandes_flottes**: 5 États — 5,8 % ESB moyen
**intermediaire**: 18 États — 1,6 % ESB moyen
**faible_diffuse**: 31 États — 2,4 % ESB moyen
**livrables**: - Training dataset nettoyé
- Notebook (preprocessing + modèle + métriques)
- Dashboard HTML (KPIs, PCA, carte, comparaison modèles)
- PowerPoint

## Constraints

- Le clustering ne prouve pas de causalité et ne prédit pas l'adoption future.
- Les résultats dépendent des variables retenues — d'autres sélections produiraient d'autres clusters.
- Le niveau État masque les différences locales entre districts.
- Le cluster 'leaders' est petit (2 États) : signal fort mais statistiquement fragile.
- Solution à 2 clusters rejetée car elle isole surtout des profils atypiques sans segmentation lisible.

## Examples

- Choix de 4 clusters : meilleur compromis entre score silhouette (0,284) et interprétabilité métier des profils.
- log1p appliqué aux variables de volume pour éviter que les grands États écrasent les distances.
- Dashboard HTML : lecture interactive avec KPIs, visualisation PCA, carte des clusters et comparaison de modèles.

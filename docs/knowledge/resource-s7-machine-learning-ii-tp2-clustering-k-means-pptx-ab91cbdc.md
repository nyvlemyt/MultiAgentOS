---
id: resource-s7-machine-learning-ii-tp2-clustering-k-means-pptx-ab91cbdc
slug: resource-s7-machine-learning-ii-tp2-clustering-k-means-pptx-ab91cbdc
source_key: 'sha256:ab91cbdc76f01d463328b7d43dfda2617d6a9eed3e25fe036ab1e93c8de6aeb8'
part_of: resource-s7-machine-learning-ii-0632fee9
order: 5
manifest: null
derived_from: 'sha256:ab91cbdc76f01d463328b7d43dfda2617d6a9eed3e25fe036ab1e93c8de6aeb8'
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
  - k-means
  - clustering
  - machine-learning
  - segmentation
  - scikit-learn
  - data-pipeline
  - hyperparameter-tuning
  - normalisation
  - imputation
domain: machine-learning
---
# S7 - Machine Learning II — TP2 — Clustering K_means.pptx

## Goal

Segmenter les 50 États américains selon leur niveau d'adoption des bus scolaires électriques (ESB) en appliquant un pipeline K-Means complet en 5 étapes : compréhension métier → exploration → préparation → sélection du modèle → évaluation.

## Prerequisites

- Dataset data.xlsx avec variables numériques par État américain (feuille 'State-level data', ligne agrégat #TOTAL exclue)
- Python + scikit-learn (KMeans, SimpleImputer, StandardScaler)
- Notions de base : distance euclidienne, moyenne, écart-type

## Steps

**step**: 1
**title**: Compréhension métier
**detail**: Définir l'objectif : regrouper les États par profil similaire pour adapter les politiques publiques. Choisir K-Means car interprétable (centroïdes lisibles par des décideurs), scalable sur 50+ États × nombreuses variables, et non supervisé (aucune étiquette préalable disponible).
**step**: 2
**title**: Exploration des données
**detail**: Charger data.xlsx. Supprimer la ligne '#TOTAL' (agrégat). Profiler chaque variable : type, % de valeurs manquantes. Règle de seuil : conserver les variables numériques avec NA ≤ 40 %, exclure les autres. Exclure la colonne '1a. State' (identifiant non numérique).
**step**: 3
**title**: Préparation & Split
**detail**: Découper en Train 60 % / Validation 20 % / Test 20 %. Imputer les NA avec SimpleImputer(strategy='median') — fit sur train uniquement, transform sur val et test. Normaliser avec StandardScaler (μ=0, σ=1) — fit sur train uniquement, transform sur val et test. Ce schéma 'fit-sur-train-seulement' évite toute fuite de données.
**step**: 4
**title**: Choix & Réglage du modèle (Grid Search)
**detail**: Tester k ∈ {2, 3, 4, 5}, init ∈ {k-means++, random}, n_init ∈ {10, 25, 50}, algorithm=Lloyd. Pour chaque combinaison, calculer sur l'ensemble de validation : Intra-SSE (Σ dist²(xᵢ,cₖ)), Intra-RMSE (√(SSE/n)), Inter-min-distance (distance minimale entre centroïdes), Ratio Séparation/Compacité (inter_mean / intra_RMSE). Critère de sélection : maximiser val_sep_comp_ratio → puis val_inter_min → puis minimiser val_intra_RMSE. Exclure les k produisant un cluster vide ou de taille < 2 sur validation. Exemple : k=3 donne le meilleur ratio (~1,85) devant k=4 (~1,6) et k=2 (~1,1).
**step**: 5
**title**: Évaluation & Conclusion métier
**detail**: Appliquer le modèle retenu sur l'ensemble test. Interpréter les centroïdes pour nommer les clusters. Formuler des recommandations actionnables par segment.

## Result

Trois clusters d'États identifiés : Cluster A 'Pionniers ESB' (forte adoption, flotte électrique significative — modèles à essaimer), Cluster B 'En transition' (adoption partielle, contexte hétérogène — politiques d'incitation à renforcer), Cluster C 'Retardataires' (faible adoption, contraintes budgétaires ou géographiques — cibler les aides prioritaires). Pipeline rigoureux garantissant des résultats fiables et reproductibles.

## Next

- Valider les segments auprès d'experts métier (cohérence géographique et politique des clusters)
- Compléter l'évaluation avec le Silhouette Score pour une vision complémentaire de la qualité des clusters
- Explorer des algorithmes alternatifs (DBSCAN pour détecter les États outliers, clustering hiérarchique pour visualiser les fusions)
- Mettre à jour le dataset annuellement pour suivre l'évolution des profils d'adoption

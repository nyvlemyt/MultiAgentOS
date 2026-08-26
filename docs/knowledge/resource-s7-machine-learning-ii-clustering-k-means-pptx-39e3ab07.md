---
id: resource-s7-machine-learning-ii-clustering-k-means-pptx-39e3ab07
slug: resource-s7-machine-learning-ii-clustering-k-means-pptx-39e3ab07
source_key: 'sha256:39e3ab071d64d8c695d464406ac881b2dd9952a82fbe03ef83a259d0395481e0'
part_of: S7 - Machine Learning II
order: 1
manifest: null
derived_from: 'sha256:39e3ab071d64d8c695d464406ac881b2dd9952a82fbe03ef83a259d0395481e0'
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
  - machine-learning
  - clustering
  - k-means
  - python
  - sklearn
  - data-preprocessing
  - hyperparameter-tuning
  - unsupervised-learning
domain: Data Science
---
# S7 - Machine Learning II — Clustering K_means.pptx

## Goal

Segmenter les 50 États américains selon leur profil d'adoption des bus scolaires électriques (ESB) en appliquant une démarche complète de clustering K-means en 5 étapes.

## Prerequisites

- Connaissances de base en Python et scikit-learn
- Notions de statistiques descriptives (moyenne, écart-type)
- Dataset State-level data (data.xlsx, sheet 'State-level data')
- Bibliothèques : pandas, numpy, sklearn (KMeans, SimpleImputer, StandardScaler)

## Steps

**step**: 1
**title**: Compréhension métier
**detail**: Définir l'objectif : regrouper des États selon leur similarité de profil ESB. Justifier le choix de K-means : non supervisé (pas d'étiquette), interprétable (centroïdes lisibles), scalable sur 50+ États × nombreuses variables. Questions métier : quels États se ressemblent ? Comment adapter les politiques publiques par groupe ? Quels États sont outliers ?
**step**: 2
**title**: Exploration des données
**detail**: Charger data.xlsx (sheet 'State-level data'). Supprimer la ligne agrégat #TOTAL. Identifier les variables : colonne 'State' = identifiant (exclure du modèle), variables numériques (float64) retenues si NA ≤ 40 %, exclues si NA > 40 %.
**step**: 3
**title**: Préparation & Split
**detail**: ① Filtrage : supprimer #TOTAL, sélectionner variables numériques avec NA ≤ 40 %. ② Split : Train 60 % / Validation 20 % / Test 20 %. ③ Imputation : SimpleImputer(strategy='median') — fit sur train uniquement, transform sur val et test. ④ Normalisation : StandardScaler (μ=0, σ=1) — fit sur train uniquement, transform sur val et test. Règle critique : ne jamais fitter l'imputer ni le scaler sur val/test pour éviter la fuite de données.
**step**: 4
**title**: Choix & Réglage du modèle (Grid Search)
**detail**: Tester KMeans avec grille : k ∈ {2,3,4,5}, init ∈ {k-means++, random}, n_init ∈ {10,25,50}, algorithm='Lloyd'. Pour chaque combinaison calculer sur l'ensemble de validation : Intra-SSE (Σ dist²(xᵢ,cₖ)), Intra-RMSE (√(SSE/n)), Inter-min dist (min distance entre centroïdes), Ratio Sep/Comp (inter_mean / intra_RMSE). Sélection : exclure k dégénérés (cluster vide ou taille < 2), puis maximiser ratio Sep/Comp, puis maximiser inter_min, puis minimiser intra_RMSE. Exemple : k=3 donne le meilleur ratio (~1.85) devant k=4 (~1.6), k=5 (~1.3), k=2 (~1.1).
**step**: 5
**title**: Évaluation & Conclusion métier
**detail**: Appliquer le modèle retenu sur le test set. Interpréter les centroïdes pour nommer les clusters : Cluster A 'Pionniers ESB' (forte adoption, servent de modèles), Cluster B 'En transition' (adoption partielle, politiques d'incitation à renforcer), Cluster C 'Retardataires' (faible adoption, contraintes budgétaires/géographiques, cibles prioritaires pour les aides).

## Result

Un pipeline K-means validé produisant 3 segments d'États interprétables par des décideurs publics, accompagné de métriques de qualité (ratio Sep/Comp, inter_min, intra_RMSE) et de recommandations de politique publique différenciées par profil.

## Next

- Tester d'autres algorithmes de clustering (DBSCAN, clustering hiérarchique) pour comparer
- Visualiser les clusters avec PCA ou t-SNE pour valider la séparation visuellement
- Analyser les outliers identifiés et étudier si un traitement spécifique s'impose
- Déployer le pipeline sur de nouvelles données annuelles pour un suivi temporel de l'adoption ESB

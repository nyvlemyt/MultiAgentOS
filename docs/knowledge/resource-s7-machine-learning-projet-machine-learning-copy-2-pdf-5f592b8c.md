---
id: resource-s7-machine-learning-projet-machine-learning-copy-2-pdf-5f592b8c
slug: resource-s7-machine-learning-projet-machine-learning-copy-2-pdf-5f592b8c
source_key: 'sha256:5f592b8cc2aac1ade42f92d6f2138baf19232b26976affbce8dc71bd2e737dd2'
part_of: S7 - machine learning
order: 16
manifest: null
derived_from: 'sha256:5f592b8cc2aac1ade42f92d6f2138baf19232b26976affbce8dc71bd2e737dd2'
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
  - machine-learning
  - classification
  - wine-quality
  - supervised-learning
  - preprocessing
  - model-evaluation
  - hyperparameter-tuning
  - python
  - scikit-learn
domain: machine-learning
---
# S7 - machine learning — projet_Machine_Learning__Copy_-2.pdf

## Problem

Prédire la qualité d'un vin (échelle 0-10, binarisée en bon/mauvais) à partir de ses caractéristiques physico-chimiques (acidité, pH, alcool, sucre résiduel, etc.) via un modèle de classification supervisée.

## Solution

Pipeline en quatre étapes séquentielles : (1) Prétraitement — charger les données, statistiques descriptives, gérer les valeurs manquantes et aberrantes, encoder les variables catégorielles, binariser la cible (qualité ≥ 7 → bon vin), analyser la distribution des classes et les corrélations, visualiser (matrice de corrélation, histogrammes, boxplots), sélectionner les variables par les méthodes vues en cours. (2) Modélisation — entraîner cinq modèles candidats : régression logistique, k-NN, arbre de décision, Naive Bayes, SVM ; justifier le choix selon leurs propriétés théoriques (linéaire vs non linéaire) et leur adaptabilité au type de données (distributions continues, bruit). (3) Évaluation — mesurer accuracy, précision, rappel, F1-score ; produire matrice de confusion, courbe ROC et AUC ; comparer les modèles et identifier le meilleur compromis biais/variance. (4) Optimisation des hyperparamètres — Grid Search (exhaustif) ou Random Search (rapide), validé par cross-validation k-fold.

## Variations

Cible flexible : classification multiclasse (note 0-10) ou binaire (≥ 7 = bon). Random Search préférable à Grid Search quand l'espace d'hyperparamètres est large. Le choix du modèle final dépend du compromis biais/variance observé à l'étape 3.

## Pitfalls

Déséquilibre de classes probable (les vins notés ≥ 7 sont minoritaires) — vérifier la distribution avant de modéliser et envisager un rééchantillonnage. Ne pas encoder les variables catégorielles = erreur silencieuse. Évaluer uniquement sur accuracy en cas de déséquilibre induit en erreur — privilégier F1-score et AUC. Fuite de données (data leakage) si la normalisation est appliquée avant le split train/test.

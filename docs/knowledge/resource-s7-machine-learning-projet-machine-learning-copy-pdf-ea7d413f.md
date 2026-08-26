---
id: resource-s7-machine-learning-projet-machine-learning-copy-pdf-ea7d413f
slug: resource-s7-machine-learning-projet-machine-learning-copy-pdf-ea7d413f
source_key: 'sha256:ea7d413faf3c878b94da8e84e2903978b1c4da658766c698907cc0ca3dbd0de2'
part_of: resource-s7-machine-learning-f79ea225
order: 17
manifest: null
derived_from: 'sha256:ea7d413faf3c878b94da8e84e2903978b1c4da658766c698907cc0ca3dbd0de2'
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
lane: workflows
schema_version: '1'
tags:
  - machine-learning
  - classification
  - wine-quality
  - supervised-learning
  - python
  - scikit-learn
  - hyperparameter-tuning
domain: data-science
---
# S7 - machine learning — projet_Machine_Learning__Copy_.pdf

## Problem

Prédire la qualité d'un vin (échelle 0-10, ou binaire bon/mauvais avec seuil qualité ≥ 7) à partir de caractéristiques physico-chimiques mesurables (acidité, pH, taux d'alcool, sucre résiduel, etc.) via un modèle de classification supervisée.

## Solution

Pipeline en quatre phases : (1) Prétraitement — charger les données, produire des statistiques descriptives, gérer les valeurs manquantes et aberrantes, encoder les variables catégorielles, binariser la cible (qualité ≥ 7 = bon vin), analyser la distribution des classes et les corrélations, visualiser (matrice de corrélation, histogrammes, boxplots), sélectionner les variables par méthodes du cours. (2) Modélisation — entraîner et comparer : régression logistique, k-NN, arbre de décision, Naive Bayes, SVM ; justifier le choix par les propriétés théoriques (linéaire vs non-linéaire) et l'adéquation aux distributions des données. (3) Évaluation — calculer accuracy, précision, rappel, F1-score ; tracer la matrice de confusion et la courbe ROC/AUC ; comparer les performances et identifier le meilleur compromis biais/variance. (4) Optimisation — affiner les hyperparamètres via Grid Search (exhaustif) et Random Search (aléatoire rapide) ; valider avec k-fold cross-validation.

## Variations

Cible multi-classe (0-10) possible si la distribution des classes est suffisamment équilibrée ; en cas de déséquilibre marqué, préférer la binarisation et privilégier F1-score/AUC plutôt que l'accuracy. Random Search recommandé quand l'espace d'hyperparamètres est large (gain de temps vs Grid Search exhaustif).

## Pitfalls

Déséquilibre des classes (vins de qualité ≥ 7 souvent minoritaires) : vérifier la distribution avant tout ; l'accuracy seule est trompeuse dans ce cas. Valeurs aberrantes sur les variables physico-chimiques peuvent biaiser les modèles sensibles à l'échelle (k-NN, SVM) — normaliser/standardiser obligatoire. Sélection de variables avant modélisation évite le sur-apprentissage. Livrables : rapport technique détaillé + notebook Python (Jupyter/Colab) avec code complet.

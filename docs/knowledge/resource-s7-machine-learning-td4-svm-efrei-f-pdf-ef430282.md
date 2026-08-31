---
id: resource-s7-machine-learning-td4-svm-efrei-f-pdf-ef430282
slug: resource-s7-machine-learning-td4-svm-efrei-f-pdf-ef430282
source_key: 'sha256:ef4302824a4a0eeca42cdf80262af9e7f8c23b83d93a16a149b6e858d3d3209a'
part_of: resource-s7-machine-learning-f79ea225
order: 5
manifest: null
derived_from: 'sha256:ef4302824a4a0eeca42cdf80262af9e7f8c23b83d93a16a149b6e858d3d3209a'
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
  - SVM
  - classification-binaire
  - hyperplan
  - marge
  - accuracy
  - machine-learning
  - exercice
domain: machine-learning
---
# S7 - machine learning — TD4_SVM_efrei_f.pdf

## Goal

Évaluer et comparer trois classifieurs linéaires (hyperplans) sur un jeu de 6 points en R² : calculer leurs prédictions, leur accuracy, puis sélectionner le meilleur par seuil d'accuracy et maximisation de la marge — démarche cœur de l'apprentissage SVM.

## Prerequisites

- Classification binaire supervisée (labels +1 / -1)
- Représentation d'un hyperplan dans R² sous forme canonique
- Notion de marge géométrique et de largeur de marge (formule 2/‖w‖)
- Calcul d'accuracy = (prédictions correctes) / (total de points)

## Steps

- **Étape 1 — Prédictions par classifieur.** Pour chaque point A–F et chaque hyperplan d1, d2, d3 : évaluer le signe de f(x) = w·x + b ; signe positif → classe +1, négatif → classe -1.
- **Étape 2 — Calcul de l'accuracy.** Comparer les prédictions aux vraies étiquettes pour d1, d2 et d3 ; calculer le ratio de bonnes classifications sur les 6 points.
- **Étape 3 — Filtrage par seuil.** Ne retenir que les classifieurs dont l'accuracy ≥ 90 % (soit ≥ 5 points correctement classés sur 6).
- **Étape 4a — Calcul de ‖w‖.** Pour chaque hyperplan di, extraire le vecteur de poids w et calculer sa norme euclidienne ‖w‖.
- **Étape 4b — Calcul des marges ri.** Appliquer la formule de la largeur de marge canonique : ri = 2 / ‖wi‖.
- **Étape 4c — Sélection finale.** Parmi les classifieurs passant le seuil de 90 %, conserver celui dont la marge ri est maximale — c'est le classifieur SVM optimal à marge maximale.

## Result

L'apprenant sait (1) prédire les labels via le signe de la fonction de décision, (2) mesurer la qualité d'un classifieur par accuracy, (3) calculer la marge géométrique d'un hyperplan canonique, et (4) appliquer le critère SVM : filtrer par performance puis maximiser la marge — principe fondateur des SVMs à marge dure.

## Next

- SVM à marge souple (soft-margin, paramètre C) pour données non linéairement séparables
- Kernel trick : projeter en espace de grande dimension pour séparer des données non linéaires
- Formulation duale du problème SVM et vecteurs de support
- Implémentation avec scikit-learn (SVC, LinearSVC)

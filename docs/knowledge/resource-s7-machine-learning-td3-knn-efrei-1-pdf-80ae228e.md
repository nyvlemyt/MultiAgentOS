---
id: resource-s7-machine-learning-td3-knn-efrei-1-pdf-80ae228e
slug: resource-s7-machine-learning-td3-knn-efrei-1-pdf-80ae228e
source_key: 'sha256:80ae228e1b3cd97a31e0fabd1c98c923e0ff3bf91aa37d3a81ad193e042712f8'
part_of: S7 - machine learning
order: 3
manifest: null
derived_from: 'sha256:80ae228e1b3cd97a31e0fabd1c98c923e0ff3bf91aa37d3a81ad193e042712f8'
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
  - KNN
  - classification
  - distance-euclidienne
  - standardisation
  - elbow-method
  - LOO-CV
  - ponderation
domain: Machine Learning
---
# S7 - machine learning — TD3_KNN_efrei (1).pdf

## Goal

Apprendre à classifier des points inconnus avec l'algorithme K-Nearest Neighbors (KNN) en maîtrisant ses variantes : distance euclidienne, pondération, normalisation, et sélection de k via la méthode Elbow.

## Prerequisites

- Notions de base en algèbre (distance entre deux points dans un espace 2D)
- Compréhension d'un tableau de données (features + label)
- Connaissance de la formule du z-score (standardisation)

## Steps

**step**: 1
**title**: Données d'entraînement
**detail**: 8 fruits étiquetés (A–H) avec 2 features : Taille (cm) et Poids (g). Pommes : A(4,110), B(4,120), C(5,130), D(5,115). Oranges : E(6,150), F(6,160), G(7,170), H(7,155). Objectif : classer q₁=(5.5,140) et q₂=(4.5,125).
**step**: 2
**title**: Classification par distance euclidienne (k=3 et k=5)
**detail**: Pour chaque point de requête, calculer d(q, xᵢ) = √((taille_q − taille_i)² + (poids_q − poids_i)²) pour les 8 voisins, trier par distance croissante, retenir les k plus proches, et attribuer la classe majoritaire. Ex : pour q₁ avec k=3, identifier les 3 fruits les plus proches et voter.
**step**: 3
**title**: KNN pondéré (k=3, appliqué à q₁)
**detail**: Chaque voisin i reçoit un poids wᵢ = 1 / dᵢᵖ (avec p=2 par défaut). Pour chaque classe c, sommer les poids de ses voisins : score(c) = Σ wᵢ pour i ∈ classe c. Choisir la classe avec le score le plus élevé. Les voisins proches pèsent beaucoup plus que les lointains.
**step**: 4
**title**: Effet d'échelle et standardisation (z-score)
**detail**: a) Calculer μ et σ de chaque feature sur le jeu d'entraînement : z = (x − μ) / σ. b) Transformer aussi q₁ avec les mêmes μ et σ. c) Reclasser q₁ avec k=3 sur les données standardisées. Le z-score évite qu'une feature à grande échelle (poids en grammes) écrase une feature à petite échelle (taille en cm).
**step**: 5
**title**: Bonnes pratiques pour choisir k
**detail**: 1) Privilégier un k impair pour éviter les égalités en classification binaire. 2) Tester plusieurs valeurs de k par validation croisée (LOO-CV ou k-fold) plutôt qu'en regardant l'erreur sur le jeu d'entraînement, qui serait biaisée.
**step**: 6
**title**: Méthode Elbow pour sélectionner k
**detail**: Utiliser Leave-One-Out Cross-Validation (LOO-CV) : pour chaque k, entraîner sur n−1 points, tester sur le point restant, répéter pour tous les points, calculer l'erreur moyenne. Tracer l'erreur en fonction de k. Le 'coude' (point où la courbe s'aplatit) indique le meilleur k : bon compromis biais/variance. Un k trop petit → surapprentissage (variance haute). Un k trop grand → sous-apprentissage (biais haut).

## Result

On sait classer un nouveau point avec KNN standard, KNN pondéré, et KNN sur données standardisées. On peut choisir k de manière rigoureuse via la courbe Elbow + LOO-CV plutôt qu'à la main.

## Next

- Implémenter KNN en Python avec scikit-learn (KNeighborsClassifier)
- Comparer KNN avec d'autres classifieurs (SVM, arbre de décision) sur le même dataset
- Explorer des métriques de distance alternatives (Manhattan, Minkowski) et leur impact sur la classification

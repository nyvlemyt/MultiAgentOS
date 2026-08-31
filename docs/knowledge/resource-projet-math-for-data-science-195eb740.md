---
id: resource-projet-math-for-data-science-195eb740
slug: resource-projet-math-for-data-science-195eb740
source_key: 'sha256:195eb740c51b1826be400004720f74d6058ba533e45d51a9c4d9d78cf34cfaef'
part_of: null
order: null
manifest: null
derived_from: 'sha256:195eb740c51b1826be400004720f74d6058ba533e45d51a9c4d9d78cf34cfaef'
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
  - PCA
  - ACP
  - NumPy
  - data-science
  - linear-algebra
  - image-processing
  - dimensionality-reduction
  - Boston-Housing
domain: mathematics / data science
---
# Projet – Math for Data Science

## Problem

Implémenter une ACP (Analyse en Composantes Principales) from scratch avec NumPy, l'appliquer à un dataset tabulaire (Boston Housing) et à des images, puis évaluer la qualité de reconstruction.

## Solution

**Exercice 1 — ACP sur Boston Housing**
1. Charger le jeu de données Boston Housing.
2. Prétraitement : centrer et réduire les features (moyenne 0, écart-type 1).
3. Calculer la matrice de covariance avec `np.cov`.
4. Extraire valeurs propres et vecteurs propres via `np.linalg.eig`.
5. Trier les vecteurs propres par valeurs propres décroissantes.
6. Projeter les données sur les k premières composantes principales.
7. Visualiser (scatter 2D des deux premières composantes, variance expliquée par composante).
8. Interpréter les composantes : quelles features contribuent le plus à chaque axe.
9. Reconstruire les données originales depuis la projection.
10. Calculer l'erreur de reconstruction (ex. MSE ou RMSE) et commenter l'impact du nombre de composantes retenues.

**Exercice 2 — Transformations d'image + ACP**
1. Charger l'image (ex. `PIL` ou `matplotlib.image`).
2. Rappeler et implémenter les transformations du chapitre 1 (rotation, translation, mise à l'échelle, cisaillement) uniquement avec NumPy (matrices de transformation homogènes).
3. Appliquer l'ACP sur les lignes (ou canaux) de l'image pour réduire la dimension.
4. Reconstruire l'image depuis les k premières composantes.
5. Comparer visuellement et métriquement (MSE/PSNR) l'image reconstruite vs originale en fonction de k.

## Variations

- Utiliser `np.linalg.svd` à la place de `np.linalg.eig` pour plus de stabilité numérique.
- Comparer la reconstruction Boston Housing avec `sklearn.decomposition.PCA` pour valider l'implémentation.
- Pour les images couleur (RGB), appliquer l'ACP canal par canal ou sur la version aplatie.
- Tracer la courbe 'variance expliquée cumulée vs nb de composantes' pour choisir k automatiquement (seuil 95 %).

## Pitfalls

- Oublier de centrer (et réduire) les données avant de calculer la covariance — les résultats seraient dominés par les features à grande échelle.
- `np.linalg.eig` peut retourner des vecteurs propres complexes pour des matrices mal conditionnées ; préférer `np.linalg.eigh` pour les matrices symétriques réelles.
- Ne pas trier les vecteurs propres par ordre décroissant de valeur propre avant projection.
- Reconstruction incorrecte : il faut rajouter la moyenne soustraite lors du prétraitement pour retrouver l'espace original.
- Sur les images, ne pas reshaper correctement (H×W×C vs H×W) entraîne des erreurs silencieuses de dimension.

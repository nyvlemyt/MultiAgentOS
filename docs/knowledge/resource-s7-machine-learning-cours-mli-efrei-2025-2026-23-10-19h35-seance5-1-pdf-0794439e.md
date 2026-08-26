---
id: >-
  resource-s7-machine-learning-cours-mli-efrei-2025-2026-23-10-19h35-seance5-1-pdf-0794439e
slug: >-
  resource-s7-machine-learning-cours-mli-efrei-2025-2026-23-10-19h35-seance5-1-pdf-0794439e
source_key: 'sha256:0794439edea6e52d12fc61269a7534b2aaea0d2031cbe6eca964333ce0979680'
part_of: resource-s7-machine-learning-f79ea225
order: 9
manifest: null
derived_from: 'sha256:0794439edea6e52d12fc61269a7534b2aaea0d2031cbe6eca964333ce0979680'
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
  - machine-learning
  - supervised-learning
  - regression
  - linear-regression
  - SVR
  - gradient-descent
  - regularization
  - polynomial-regression
domain: machine learning
---
# S7 - machine learning — cours_MLI_efrei_2025_2026_23_10_19h35_Seance5 1.pdf

## Summary

Chapitre V du cours MLI EFREI 2025-2026 couvrant l'apprentissage supervisé par régression : régression linéaire (simple et multiple), descente de gradient, régularisation L1/L2, régression polynomiale, et Support Vector Regression (SVR).

## Fields/API

**name**: Régression linéaire — modèle
**description**: h_w(x) = w^T x + b. w = poids, b = biais. La relation réelle : y = w^T x + b + ε, où ε suit une loi normale (théorème de la limite centrale).
**name**: Fonction de perte (MSE)
**description**: J(w) = 1/(2m) Σ (h_w(x) − y)². Minimiser J revient à rapprocher la prédiction de la valeur réelle.
**name**: Méthode analytique (forme close)
**description**: Résolution par formule matricielle : w = (X^T X)^{-1} X^T y. Nécessite d'ajouter une colonne de 1 à X pour inclure le biais.
**name**: Descente de gradient
**description**: Boucle : (1) prédictions, (2) calcul J(w,b), (3) gradients, (4) mise à jour w ← w − α·∇J, (5) répéter jusqu'à convergence.
**name**: Régularisation Ridge (L2)
**description**: J(w) = 1/(2m) Σ (h_w(x) − y)² + λ‖w‖². Pénalise les poids trop grands pour réduire le sur-apprentissage.
**name**: Régularisation Lasso (L1)
**description**: J(w) = 1/(2m) Σ (h_w(x) − y)² + λ‖w‖₁. Favorise la parcimonie (poids nuls).
**name**: Régression polynomiale
**description**: Extension de la régression linéaire : h_w(x) = w₁x + w₂x² + … + wₙxⁿ + b. La non-linéarité vient de l'augmentation de dimension ; les paramètres restent linéaires. Degré n = hyperparamètre.
**name**: SVR — principe
**description**: Variante du SVM pour prédire des valeurs continues. Cherche f(x) la plus plate possible avec erreurs dans une marge ε (tube ε). Points dans le tube : perte nulle. Points hors tube : pénalité proportionnelle à la distance.
**name**: SVR — terminologie clé
**description**: Noyau : projection en dimension supérieure. Hyperplan : modèle de prédiction. Tube ε : bande de tolérance ±ε. Vecteurs de support : points à la frontière ou hors du tube — seuls ceux-ci influencent l'hyperplan.
**name**: SVR — étapes
**description**: 1. Choisir noyau (linéaire, RBF, polynomial…). 2. Définir ε. 3. Tracer le tube. 4. Optimiser la fonction de coût (problème convexe). 5. Identifier les vecteurs de support.

## Constraints

- La régression linéaire suppose ε ~ N(0, σ²) (théorème de la limite centrale).
- La méthode analytique est coûteuse (inversion matricielle) pour de grandes dimensions ; préférer la descente de gradient.
- Ridge ne met pas les poids exactement à zéro ; Lasso peut le faire (sélection de variables).
- Le degré n de la régression polynomiale est un hyperparamètre : trop grand → sur-apprentissage, trop petit → sous-apprentissage.
- SVR est robuste aux outliers car seuls les points hors du tube influencent l'apprentissage.

## Examples

- Régression linéaire simple : prédire le salaire d'une personne (Y) en fonction des années d'études (X).
- Régression linéaire multiple : prédire la performance d'un athlète à partir de durée d'entraînement + âge + alimentation.
- Régression polynomiale : ajuster une courbe sur des données non linéaires que la droite de régression ne peut pas capturer.
- SVR avec noyau RBF : prédire des prix immobiliers avec tolérance d'erreur ε définie à ±5 000 €.

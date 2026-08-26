---
id: resource-s7-machine-learning-seance5-pdf-51ba4959
slug: resource-s7-machine-learning-seance5-pdf-51ba4959
source_key: 'sha256:51ba49597e1014bbb6c20716f57dc5303b3c6a90021a366d769ea8b010d8aeda'
part_of: S7 - machine learning
order: 22
manifest: null
derived_from: 'sha256:51ba49597e1014bbb6c20716f57dc5303b3c6a90021a366d769ea8b010d8aeda'
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
  - regression
  - linear-regression
  - SVR
  - gradient-descent
  - regularization
  - supervised-learning
domain: Machine Learning
---
# S7 - machine learning — seance5.pdf

## Summary

Cours sur l'apprentissage supervisé par régression : régression linéaire (simple et multiple), descente de gradient, régularisation L1/L2, régression polynomiale, et Support Vector Regression (SVR). Contexte académique EFREI Paris, niveau L3/M1 ingénieur.

## Fields/API

**name**: Régression linéaire simple
**description**: Modèle h(x) = wᵀx + b. Un seul attribut explicatif X pour prédire Y continu. Paramètres : poids w, biais b, erreur ε ~ N(0,σ²) d'après le théorème central limite.
**name**: Régression linéaire multiple
**description**: Même forme matricielle avec plusieurs variables explicatives. Résolution analytique via pseudo-inverse ou descente de gradient.
**name**: Fonction de perte (MSE)
**description**: J(w) = (1/2m) Σ(h_w(x) − y)². Minimiser J pour rapprocher prédictions des valeurs réelles.
**name**: Méthode analytique
**description**: Résolution en forme fermée via matrices (équation normale). Efficace pour petits datasets, coûteuse en mémoire pour grands datasets (inversion O(n³)).
**name**: Descente de gradient
**description**: Algorithme itératif : 1) prédictions, 2) calcul perte J, 3) calcul gradients ∂J/∂w et ∂J/∂b, 4) mise à jour w ← w − α·∂J/∂w, 5) répéter jusqu'à convergence. Learning rate α : trop petit → lent, trop grand → divergence.
**name**: Convexité et optima locaux
**description**: Sur une fonction convexe, la descente de gradient converge vers le minimum global. Sur une fonction non-convexe, elle converge vers un minimum local dépendant de l'initialisation θ₀.
**name**: Régularisation Ridge (L2)
**description**: J(w) = (1/2m)Σ(h_w(x)−y)² + λΣw². Pénalise les grands poids pour réduire le sur-apprentissage (overfitting). Appelé aussi Ridge regression.
**name**: Régularisation Lasso (L1)
**description**: J(w) = (1/2m)Σ(h_w(x)−y)² + λΣ|w|. Norme L1 ; favorise la parcimonie (poids nuls = sélection de features implicite).
**name**: Régression polynomiale
**description**: Extension de la régression linéaire : h_w(x) = w₁x + w₂x² + … + wₙxⁿ + b. La relation entre paramètres reste linéaire ; la non-linéarité vient de l'augmentation de dimension de l'espace des features. Degré n = hyperparamètre.
**name**: SVR — Support Vector Regression
**description**: Variante du SVM pour la régression. Cherche f(x) la plus plate possible tout en tolérant des erreurs ≤ ε. Tube ε autour de l'hyperplan : erreurs intra-tube ignorées (perte nulle), erreurs extra-tube pénalisées proportionnellement à la distance.
**name**: SVR — Terminologie clé
**description**: Noyau (kernel) : mapping vers espace de dimension supérieure (linéaire, polynomial, RBF…). Hyperplan : fonction de prédiction. Vecteurs de support : points à la frontière ou hors du tube — seuls eux influencent la solution finale.
**name**: SVR — Étapes algorithmiques
**description**: 1. Choisir le noyau selon la nature des données. 2. Fixer ε (tolérance). 3. Tracer le tube ε. 4. Optimiser la fonction de coût (problème convexe). 5. Identifier les vecteurs de support.
**name**: SVR — Robustesse
**description**: Robuste aux valeurs aberrantes car seuls les points hors du tube ε influencent l'apprentissage. Les outliers loin de la marge ont un impact nul sur l'hyperplan.

## Constraints

- Y doit être une variable continue pour la régression (pas de classification).
- La résolution analytique est impraticable pour de très grands datasets (inversion matricielle coûteuse).
- Le learning rate α doit être soigneusement calibré : trop grand → divergence, trop petit → convergence lente.
- La régression polynomiale de degré élevé risque le sur-apprentissage si non régularisée.
- SVR suppose que la fonction de coût est convexe — la solution est un optimum global garanti.
- Le paramètre ε du SVR est un hyperparamètre à valider par cross-validation.

## Examples

- Prédire la performance sportive d'un athlète à partir de la durée d'entraînement (régression linéaire simple).
- Prédire un salaire à partir des années d'études (régression linéaire simple, Y continu).
- Ajuster une courbe non-linéaire sur des données complexes via régression polynomiale de degré 3.
- Utiliser Ridge (L2) pour pénaliser les modèles avec de nombreux grands coefficients et éviter l'overfitting.
- Appliquer SVR avec noyau RBF pour prédire une valeur cible sur données non-linéaires avec tolérance ε = 0.1.

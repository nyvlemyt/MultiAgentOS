---
id: >-
  resource-s7-machine-learning-cours-mli-efrei-2025-2026-12-11-2025-seance6-3-pdf-22f71978
slug: >-
  resource-s7-machine-learning-cours-mli-efrei-2025-2026-12-11-2025-seance6-3-pdf-22f71978
source_key: 'sha256:22f719788b2d3244ecdef43a2c3e768725d253ebfde0376ddaf28e0c30cce6e3'
part_of: resource-s7-machine-learning-f79ea225
order: 8
manifest: null
derived_from: 'sha256:22f719788b2d3244ecdef43a2c3e768725d253ebfde0376ddaf28e0c30cce6e3'
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
doc_type: explanation
actionability: resource
lane: knowledge
schema_version: '1'
tags:
  - ensemble-learning
  - bagging
  - boosting
  - random-forest
  - adaboost
  - machine-learning
  - classification
domain: Machine Learning
---
# S7 - machine learning — cours_MLI_efrei_2025_2026_12_11_2025_Seance6-3.pdf

## Thesis

L'Ensemble Learning combine plusieurs modèles faibles pour produire un modèle fort, réduisant l'erreur globale en diminuant la variance (bagging) ou le biais (boosting).

## Context

Cours MLI EFREI 2025-2026, Chapitre VI. Jusqu'ici les méthodes apprenaient une seule hypothèse ; l'ensemble learning en apprend plusieurs et combine leurs prédictions. Deux grandes familles existent pour les ensembles homogènes (même algorithme de base) : Bagging et Boosting. Random Forest est l'exemple canonique du Bagging appliqué aux arbres de décision.

## Reasoning

Bagging (Bootstrap Aggregating, Breiman 1996) : on tire M sous-ensembles de taille N avec remise depuis les données d'entraînement, on entraîne un modèle sur chacun, puis on combine par vote majoritaire. L'effet principal est la réduction de variance — particulièrement utile pour les modèles instables comme les arbres de décision. Random Forest étend le Bagging en ajoutant un sous-échantillonnage aléatoire des features à chaque nœud (p features parmi d) : si peu de features non pertinentes, p ≈ √d ; si beaucoup, p élevé. Le nombre d'arbres L se détermine via l'erreur out-of-bag ou une règle empirique. Boosting (Schapire 1990, AdaBoost Freund & Schapire 1996) : au lieu de rééchantillonner, on repondère les exemples à chaque itération. Les exemples mal classés reçoivent un poids plus élevé, forçant le prochain apprenant faible à se concentrer dessus. Formules AdaBoost : poids initial w_i = 1/N ; erreur pondérée ε_t = Σ w_i · 1{h_t(x_i) ≠ y_i} ; poids de l'apprenant α_t = ½ ln((1−ε_t)/ε_t) (positif si ε_t < 0.5, nul si ε_t = 0.5, négatif si pire que l'aléatoire) ; mise à jour w_i^{t+1} = w_i^t · exp(−α_t y_i h_t(x_i)) ; classifieur final H(x) = sign(Σ α_t h_t(x)).

## Trade-offs

Bagging : réduit la variance, stable, parallélisable, mais ne réduit pas le biais — un modèle de base biaisé reste biaisé. Random Forest ajoute la décorrélation des arbres mais introduit deux hyperparamètres à tuner (L et p). Boosting : réduit biais ET variance, implémentation simple, bonne généralisation et sélection implicite de features ; en revanche, séquentiel (non parallélisable), sous-optimal en solution, et très sensible au bruit et aux outliers (les exemples aberrants reçoivent des poids croissants).

## See also

- arbres de décision
- réseaux de neurones
- cross-validation
- out-of-bag error
- feature importance / gain d'information

---
id: resource-s7-ml2-presentation-tp1-pptx-5efe49c8
slug: resource-s7-ml2-presentation-tp1-pptx-5efe49c8
source_key: 'sha256:5efe49c8dea9dc8c0caf21322eb6b43df50d3b9fc45f8613b4bf4dcb2c8a8ba1'
part_of: resource-s7-ml2-fa640f29
order: 20
manifest: null
derived_from: 'sha256:5efe49c8dea9dc8c0caf21322eb6b43df50d3b9fc45f8613b4bf4dcb2c8a8ba1'
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
  - random-forest
  - classification
  - imbalanced-data
  - sklearn
  - electric-school-buses
  - permutation-importance
  - PR-AUC
domain: Machine Learning
---
# S7 - ml2 — presentation_tp1.pptx

## Summary

Projet ML binaire (ADIF84, Mai 2026) : prédire l'adoption de bus scolaires électriques (ESB) par district américain. Dataset WRI ESB v9, 19 516 districts, déséquilibre fort 8 % positifs. RandomForestClassifier + GridSearchCV optimisé sur PR-AUC. Résultat test : PR-AUC 0.363 (baseline 0.080), ROC-AUC 0.810.

## Fields/API

**dataset**: WRI ESB Adoption Dataset v9 — données district-level jusqu'à décembre 2024 ; 87 colonnes avant sélection
**cible**: Has committed ESBs? (yes=1 / no=0) — classification binaire
**déséquilibre**: 92 % no / 8 % yes
**features_retenues**: Géographie (État, locale, région Census, lat/lon), taille du district (élèves, écoles, Title I, repas gratuit), socio-économie (revenu médian, pauvreté, démographie), environnement/santé (PM2.5, ozone, asthme), politiques publiques (EPA 2022/2023, WRI POD)
**features_exclues_fuite**: Colonnes 3a–3m (bus engagés/livrés/financés), 6a/6e (expressions d'intérêt), 1b–1o (identifiants textuels)
**pipeline_preprocessing**: Imputation médiane (numériques) + mode + OneHotEncoder (catégorielles) ; fit sur train uniquement
**split**: Train 60 % / Val 20 % / Test 20 % — split stratifié sur la cible
**modèle**: RandomForestClassifier (sklearn)
**baseline**: DummyClassifier(strategy='most_frequent') — prédit toujours 'no'
**grille_hyperparamètres**: n_estimators: [200, 500] | max_depth: [None, 10, 20] | min_samples_leaf: [1, 10, 25] | class_weight: [balanced, balanced_subsample] | max_features: sqrt
**sélection_modèle**: GridSearchCV + StratifiedKFold (5 folds), critère : average_precision
**meilleurs_hyperparamètres**: class_weight=balanced | max_depth=None | max_features=sqrt | min_samples_leaf=non précisé
**métriques_test**: **PR-AUC**: 0.363 (baseline 0.080)
**ROC-AUC**: 0.810 (baseline 0.500)
**F1_yes**: 0.205 (baseline 0.000)
**Balanced_Accuracy**: 0.558 (baseline 0.500)
**matrice_confusion**: VP=38 | FP=21 | FN=274
**top_permutation_importance**: - 4c. Number of schools in district (0.0622)
- 4b. Number of students in district (0.0471)
- 1p. Locale broad type — Rural (0.0231)
- 4h. Percent one race: White (0.0198)
- 1t. Longitude (0.0122)
- 4i. Percent race alone or multiracial: White (0.0116)

## Constraints

- Accuracy rejetée comme métrique principale — un modèle 'always no' atteint ~92 % sans détecter un seul positif
- Colonnes 3a–3m strictement absentes de toutes les features (y compris preprocessing) pour éviter la fuite
- Pipeline fit exclusivement sur le train ; jeu de test jamais touché avant évaluation finale
- Association ≠ causalité : le modèle identifie des corrélations, pas des causes
- Snapshot temporel décembre 2024 — pas de prédiction future
- Effets d'État probablement présents (certains États investissent davantage) — non contrôlés

## Examples

- Exemple d'usage décideur : prioriser les districts à fort score pour accompagnement ou financement ESB
- Piste d'amélioration testée : réintégrer 6a/6e (expressions d'intérêt) et comparer avec XGBoost/LightGBM
- Interprétation FN=274 : la majorité des districts adoptants sont manqués — rappel faible, conséquence directe du fort déséquilibre

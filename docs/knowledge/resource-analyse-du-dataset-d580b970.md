---
id: resource-analyse-du-dataset-d580b970
slug: resource-analyse-du-dataset-d580b970
source_key: 'sha256:d580b970155d9acd54831852aab750d3a7cda0e048342a9e84241631ff4dc3a5'
part_of: null
order: null
manifest: null
derived_from: 'sha256:d580b970155d9acd54831852aab750d3a7cda0e048342a9e84241631ff4dc3a5'
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
  - dataset
  - classification
  - random-forest
  - preprocessing
  - imbalanced-data
  - feature-engineering
  - environmental-equity
domain: Machine Learning
---
# **ANALYSE DU DATASET**

## Summary

Documentation complète du dataset Electric School Bus Adoption (WRI) utilisé pour un lab ML II. 19 517 districts scolaires américains, 87 colonnes, variable cible binaire (adoption ESB oui/non), taux d'adoption global 7,99 %. Couvre la sélection de la variable cible, le plan de prétraitement en 6 étapes, la stratégie Random Forest et les livrables attendus.

## Fields/API

**name**: Variable cible
**type**: Binaire (0/1)
**description**: '0a. Has committed ESBs?' — 0,005 % de valeurs manquantes, déséquilibre 92 %/8 %
**name**: Catégorie 1 — Géographie/Admin
**type**: Mixte
**description**: 20 colonnes : State, Locale broad type, Census Region, Lat/Lon — < 0,1 % manquants
**name**: Catégorie 2 — Flotte
**type**: Numérique/Texte
**description**: 2 colonnes : Total buses (50 % manquants → exclure), Contractor (93 % → exclure)
**name**: Catégorie 3 — Détails ESB
**type**: Mixte
**description**: 21 colonnes sur les bus électriques adoptés
**name**: Catégorie 4 — Socio-économique/Démo
**type**: Numérique
**description**: 21 colonnes : nb étudiants, revenu médian, % pauvreté, % ethnies — 5 à 33 % manquants
**name**: Catégories 5-6 — Pollution/Santé/Financement
**type**: Mixte
**description**: 22 colonnes : PM2.5, Ozone, taux d'asthme, éligibilité ARP/EPA — 0,1 à 33 % manquants

## Constraints

- Déséquilibre de classe sévère (92 %/8 %) → accuracy seule trompeuse ; utiliser F1-score, Recall, ROC-AUC
- class_weight='balanced' OBLIGATOIRE pour Random Forest
- StratifiedKFold(k=5) obligatoire pour la validation croisée
- Exclure features > 50 % manquants pour le modèle initial (Total buses, Contractor, Applied but not awarded)
- Ne pas utiliser les identifiants uniques (LEA IDs, adresses, URLs) comme features
- StandardScaler sur toutes les features numériques avant modélisation
- Imputation différenciée : median/most_frequent si < 10 % manquants ; MICE ou KNN si 10-40 % ; exclusion si > 40 %

## Examples

**title**: Pipeline StratifiedKFold + SMOTE
**code**: from sklearn.model_selection import StratifiedKFold
from imblearn.over_sampling import SMOTE
skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
smote = SMOTE(random_state=42)
for train_idx, test_idx in skf.split(X, y):
    X_train, X_test = X[train_idx], X[test_idx]
    y_train, y_test = y[train_idx], y[test_idx]
    X_train_resampled, y_train_resampled = smote.fit_resample(X_train, y_train)
**title**: Hyperparamètres Random Forest recommandés
**code**: n_estimators=200, max_depth=20, min_samples_split=5, min_samples_leaf=2, max_features='sqrt', class_weight='balanced'
**title**: Features engineered suggérées
**code**: ratio_students_poverty = (n_students * pct_poverty) / 100
pollution_index = normalize(PM2_5 + Ozone) / 2
# K-Means sur Lat/Lon pour clustering géographique
**title**: Objectifs de performance
**code**: F1-score > 0.70 | Recall > 0.65 | ROC-AUC > 0.85

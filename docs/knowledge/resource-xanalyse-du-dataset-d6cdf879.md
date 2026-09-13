---
id: resource-xanalyse-du-dataset-d6cdf879
slug: resource-xanalyse-du-dataset-d6cdf879
source_key: 'sha256:d6cdf879d20047c8d5f792a307a24ffff9e4fde23135f8f1831669f6677e918e'
part_of: null
order: null
manifest: null
derived_from: 'sha256:d6cdf879d20047c8d5f792a307a24ffff9e4fde23135f8f1831669f6677e918e'
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
# xANALYSE DU DATASET

## Summary

Documentation du dataset 'Electric School Bus Adoption' (WRI) utilisé en Lab ML II. Contient 19 517 districts scolaires américains × 87 colonnes. Variable cible binaire : adoption ESB (Yes/No), taux de positifs : 7,99 %. Couvre la sélection de features, le plan de prétraitement complet, la stratégie Random Forest avec gestion du déséquilibre de classes, et les livrables attendus.

## Fields/API

**name**: Source
**value**: World Resources Institute (WRI)
**name**: Lignes / Colonnes
**value**: 19 517 districts × 87 colonnes
**name**: Variable cible
**value**: '0a. Has committed ESBs?' — binaire (Yes=1 / No=0) — 0,005 % manquant
**name**: Taux d'adoption
**value**: 7,99 % (1 559 districts positifs) — déséquilibre 92 % / 8 %
**name**: Catégories de features
**value**: Géographie/admin (20), Flotte (2), Détails ESB (21), Socio-économique/démographique (21), Pollution/santé/financement/engagement (22)
**name**: Features prioritaires (< 0,1 % manquant)
**value**: State, Locale broad type, Census Region, Latitude/Longitude, Qualified for ARP funding, EPA prioritized district
**name**: Features à exclure (> 50 % manquant)
**value**: Total number of buses (50 %), Contractor (93 %), Applied but not awarded (91 %)
**name**: Encodage variable cible
**value**: Yes → 1 / No → 0
**name**: Encodage State
**value**: Target Encoding ou One-Hot Encoding (56 valeurs)
**name**: Encodage Locale broad type
**value**: Ordinal : Rural=0, Town=1, Suburban=2, Urban=3
**name**: Imputation < 10 % manquant
**value**: SimpleImputer — median (num) / most_frequent (cat)
**name**: Imputation 10–40 % manquant
**value**: IterativeImputer (MICE) ou KNNImputer k=5
**name**: Normalisation
**value**: StandardScaler (µ=0, σ=1) sur toutes les features numériques
**name**: Gestion déséquilibre
**value**: class_weight='balanced' (obligatoire) + SMOTE / ADASYN en option
**name**: Validation croisée
**value**: StratifiedKFold k=5 (garantit proportion 92/8 dans chaque fold)
**name**: Hyperparamètres Random Forest clés
**value**: n_estimators∈[100–500], max_depth∈[10–30], min_samples_split∈[2–20], min_samples_leaf∈[1–10], max_features∈['sqrt','log2',0.3], class_weight='balanced'
**name**: Métrique principale
**value**: F1-score (cible > 0,70) — accuracy seule trompeuse avec déséquilibre
**name**: Métriques secondaires
**value**: Recall (cible > 0,65), Precision, ROC-AUC (cible > 0,85), Matrice de confusion
**name**: Interprétabilité
**value**: feature_importances_ (Gini top-10), SHAP values (biais), Partial Dependence Plots
**name**: Features engineered
**value**: Ratio étudiants/pauvreté, Index pollution composite (PM2.5 + Ozone), Distance à la côte, Clustering K-Means sur Lat/Lon
**name**: Livrables
**value**: Notebook Jupyter (EDA + prétraitement + modélisation + évaluation), PowerPoint 10–15 slides, Dashboard Streamlit optionnel

## Constraints

- Ne pas utiliser l'accuracy seule comme métrique — déséquilibre 92/8 la rend trompeuse.
- class_weight='balanced' est OBLIGATOIRE pour Random Forest sur ce dataset.
- Exclure du modèle initial toute feature avec > 50 % de valeurs manquantes.
- Supprimer la seule ligne où la variable cible est manquante avant tout traitement.
- Ne pas inclure adresses, URLs, LEA IDs (identifiants non prédictifs).
- Pour le modèle initial, se limiter aux features avec < 10 % de données manquantes ; élargir ensuite par imputation.
- SMOTE / ADASYN s'appliquent uniquement sur le fold d'entraînement — jamais sur le fold de test.

## Examples

**label**: Pipeline StratifiedKFold + SMOTE
**code**: from sklearn.model_selection import StratifiedKFold
from imblearn.over_sampling import SMOTE
skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
smote = SMOTE(random_state=42)
for train_idx, test_idx in skf.split(X, y):
    X_train, X_test = X[train_idx], X[test_idx]
    y_train, y_test = y[train_idx], y[test_idx]
    X_train_res, y_train_res = smote.fit_resample(X_train, y_train)
**label**: Questions de recherche cibles
**items**: - Les districts défavorisés (pauvreté, minorités) adoptent-ils moins ? (équité environnementale)
- Californie et New York concentrent-ils les adoptants (340 et 98) — pourquoi ?
- Le statut 'Qualified for ARP funding' prédit-il l'adoption ?
- Districts à PM2.5 élevé adoptent-ils plus (conscience) ou moins (manque de ressources) ?
**label**: Angle différenciant
**description**: Si SHAP values montrent que 'Percent non-white' a un impact négatif élevé → biais structurel dans les politiques de financement → recommandation concrète aux décideurs publics.

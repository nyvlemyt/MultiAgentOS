---
id: resource-s7-machine-learning-tp1-efrei-v2025-2026-final-2025-pdf-952edaf0
slug: resource-s7-machine-learning-tp1-efrei-v2025-2026-final-2025-pdf-952edaf0
source_key: 'sha256:952edaf0a7b5551c9219b397db2205ce337d67896085e909080d29ce1ab5d066'
part_of: S7 - machine learning
order: 7
manifest: null
derived_from: 'sha256:952edaf0a7b5551c9219b397db2205ce337d67896085e909080d29ce1ab5d066'
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
  - decision-tree
  - scikit-learn
  - python
  - classification
  - churn-prediction
  - feature-engineering
  - pandas
  - jupyter
domain: machine learning
---
# S7 - machine learning — TP1_efrei_v2025_2026_final_2025.pdf

## Goal

Construire un classificateur par arbre de décision sur un dataset de churn bancaire (Churn_Modelling.csv) en Python, en couvrant le chargement des données, la séparation train/test, l'entraînement, l'évaluation et la normalisation.

## Prerequisites

- Python installé ou accès à Google Colab
- Bibliothèques : numpy, pandas, matplotlib, scikit-learn
- Fichier Churn_Modelling.csv disponible
- Notions de base sur les DataFrames pandas

## Steps

- Importer les bibliothèques : numpy, pandas, matplotlib, warnings.
- Charger le CSV avec pd.read_csv() puis convertir en numpy array via .values.
- Analyser les données : vérifier la shape et tracer un histogramme de la colonne 'Exited' (variable cible) avec .hist().
- Séparer les données en train (75 %) et test (25 %) avec train_test_split(random_state=1).
- Instancier et entraîner un DecisionTreeClassifier(criterion='entropy', random_state=0) sur le train set.
- Évaluer le modèle sur le test set : calculer accuracy_score et recall_score, puis en faire la moyenne pour comparer les algorithmes.
- Appliquer une normalisation StandardScaler sur les features (fit sur train, transform sur train et test).
- Répéter les étapes 5 et 6 sur les données normalisées et comparer les résultats avant/après normalisation.

## Result

Un notebook Python comparant un DecisionTreeClassifier avant et après normalisation StandardScaler, avec accuracy et recall moyens calculés sur le jeu de test.

## Next

- Tester d'autres algorithmes (Random Forest, SVM, KNN) via la même fonction de comparaison.
- Affiner le feature engineering (encodage des variables catégorielles Geography/Gender).
- Explorer la cross-validation pour une évaluation plus robuste.
- Consulter la documentation Keras pour ajouter un réseau de neurones comme troisième comparatif.

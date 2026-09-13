---
id: resource-s7-machine-learning-tp-regresssion-vf-pdf-3670a5aa
slug: resource-s7-machine-learning-tp-regresssion-vf-pdf-3670a5aa
source_key: 'sha256:3670a5aa65944ca7acfad0b7257e47a68d6add0d8d1c6da270b46d7ac74f18aa'
part_of: resource-s7-machine-learning-f79ea225
order: 6
manifest: null
derived_from: 'sha256:3670a5aa65944ca7acfad0b7257e47a68d6add0d8d1c6da270b46d7ac74f18aa'
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
  - regression
  - python
  - scikit-learn
  - supervised-learning
  - SVR
  - linear-regression
  - boston-housing
domain: Machine Learning
---
# S7 - machine learning — TP regrésssion_vf.pdf

## Goal

Appliquer la régression supervisée en Python sur deux datasets : estimer un salaire par régression linéaire simple, puis estimer des prix immobiliers (Boston Housing) par régression linéaire multiple et SVR.

## Prerequisites

- Python installé avec scikit-learn, pandas, numpy
- Notions de base en apprentissage supervisé
- Dataset salaire (expérience → salaire) et Boston Housing Dataset disponibles

## Steps

**part**: A — Régression linéaire simple (salaire vs expérience)
**steps**: - A.1 Importer le jeu de données (CSV salaire/expérience)
- A.2 Identifier les attributs (X = années d'expérience) et la cible (y = salaire)
- A.3 Répartir en jeu d'apprentissage et jeu de test (ex. train_test_split)
- A.4 Entraîner un modèle LinearRegression et prédire sur le jeu de test
- A.5 Évaluer les performances (MSE, R²)
**part**: B — Régression multiple et SVR (Boston Housing)
**steps**: - B.1 Importer le Boston Housing Dataset
- B.2 Afficher la description du dataset (describe())
- B.3 Convertir en DataFrame pandas
- B.4 Étudier la matrice de corrélation entre attributs
- B.5 Sélectionner les attributs les moins corrélés entre eux (réduction de multicolinéarité)
- B.6 Répartir en apprentissage et test
- B.7 Entraîner un modèle LinearRegression multiple et prédire
- B.8 Évaluer les performances (MSE, R²)
- B.9 Appliquer StandardScaler() pour normaliser les features
- B.10 Re-séparer apprentissage/test sur données normalisées et refaire la régression multiple
- B.11 Entraîner un modèle SVR sur les données normalisées
- B.12 Prédire sur un exemple normalisé
- B.13 Prédire sur un exemple en données brutes (après inverse_transform ou normalisation manuelle)
- B.14 Évaluer et comparer les performances des trois modèles

## Result

Trois modèles comparés sur Boston Housing : régression linéaire multiple (brute), régression linéaire multiple (normalisée), SVR (normalisé). On obtient des métriques MSE/R² permettant de choisir le meilleur modèle pour la prédiction de prix immobiliers.

## Next

- Tester d'autres hyperparamètres SVR (kernel RBF vs linéaire, C, epsilon)
- Introduire la validation croisée (cross_val_score) pour des scores plus robustes
- Explorer la régression polynomiale ou des méthodes ensemblistes (Random Forest Regressor)

---
id: >-
  resource-s5-python-pour-la-data-science-projet-python-data-science-pdf-16c37068
slug: >-
  resource-s5-python-pour-la-data-science-projet-python-data-science-pdf-16c37068
source_key: 'sha256:16c37068cfead27efb4e56b341d62521ba1f4bfba70230ae6dea0b3285a00323'
part_of: resource-s5-python-pour-la-data-science-f152995e
order: 2
manifest: null
derived_from: 'sha256:16c37068cfead27efb4e56b341d62521ba1f4bfba70230ae6dea0b3285a00323'
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
  - python
  - data-science
  - pandas
  - airbnb
  - eda
  - visualisation
  - sklearn
  - projet-etudiant
domain: data-science
---
# S5 - Python pour la Data Science — Projet Python Data Science.pdf

## Problem

Analyser les facteurs influençant les prix des logements Airbnb dans une grande ville, à partir de données réelles (Inside Airbnb), en couvrant nettoyage, exploration, agrégations SQL-like, visualisation et synthèse actionnable pour un propriétaire fictif.

## Solution

Pipeline en 4 phases : (1) Chargement + nettoyage Pandas (doublons, valeurs manquantes, normalisation, encodage catégoriel) → (2) Analyse exploratoire + visualisations Matplotlib/Seaborn (histogrammes prix, boxplots par type de logement, heatmap de corrélations) → (3) Agrégations SQL-like (groupby quartier/type, filtres, classements) → (4) Synthèse écrite + tableaux Pandas avec recommandations tarifaires. Bonus optionnel : modèle ML de régression (Linear Regression / Random Forest / Gradient Boosting via sklearn) pour prédire les prix et identifier les features les plus impactantes.

## Variations

- Ville au choix parmi Inside Airbnb (New York, Paris, Lisbonne…) ou dataset Kaggle 'Inside AirBnB - USA'.
- Bonus ML : encoder les variables catégoriques (One-Hot Encoding), normaliser les numériques, entraîner un modèle de régression, tracer prix réels vs prédits, extraire les feature importances.
- Agrégations possibles : moyenne/médiane des prix par quartier, proportion de logements avec Wi-Fi ou cuisine, classement des quartiers par nombre de logements disponibles.

## Pitfalls

- Valeurs manquantes dans les champs critiques (prix, type de logement, disponibilité) — définir un critère explicite de traitement (suppression vs imputation).
- Outliers de prix non traités faussent les distributions et les corrélations — justifier les seuils retenus.
- Variables catégoriques non encodées avant un éventuel modèle ML — appliquer One-Hot Encoding systématiquement.
- Rapport trop long : l'énoncé exige complétude ET concision — préférer tableaux et graphiques commentés à de longs paragraphes.

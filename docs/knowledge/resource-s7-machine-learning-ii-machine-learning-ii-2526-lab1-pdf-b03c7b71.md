---
id: resource-s7-machine-learning-ii-machine-learning-ii-2526-lab1-pdf-b03c7b71
slug: resource-s7-machine-learning-ii-machine-learning-ii-2526-lab1-pdf-b03c7b71
source_key: 'sha256:b03c7b711f12953166bab7407f7dc5bab9041db66b4123d8c678e4351eb06363'
part_of: S7 - Machine Learning II
order: 3
manifest: null
derived_from: 'sha256:b03c7b711f12953166bab7407f7dc5bab9041db66b4123d8c678e4351eb06363'
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
  - machine-learning
  - random-forest
  - classification
  - regression
  - electric-school-bus
  - lab
  - data-science
  - python
  - notebook
domain: machine-learning
---
# S7 - Machine Learning II — Machine Learning II 2526 Lab1.pdf

## Problem

Enrichir un tableau de bord existant sur les autobus scolaires électriques aux États-Unis en développant des modèles de machine learning (classification ou régression) à partir de données publiques.

## Solution

Suivre le pipeline CRISP-DM en 4 étapes lors de la séance 1 : (1) comprendre le problème métier (contexte du dashboard electricschoolbusinitiative.org), (2) explorer et comprendre les données disponibles sur le dataset US Electric School Bus Adoption, (3) préparer les données d'entraînement (nettoyage, encodage, split), (4) entraîner et comparer plusieurs configurations de Random Forest pour sélectionner les hyperparamètres les plus performants. Livrer un notebook + diapositives sur Moodle à la fin de chaque séance.

## Variations

- Classification (variable cible catégorielle, ex. type d'adoption par État) ou régression (variable cible continue, ex. nombre de bus commandés) selon le cas d'usage choisi.
- Un tableau de bord interactif (Streamlit, Dash, etc.) est optionnel mais valorisé.

## Pitfalls

- Ne pas confondre les données nationales et étatiques — le dataset distingue les deux niveaux géographiques.
- Le réglage fin (fine-tuning) des hyperparamètres du Random Forest (n_estimators, max_depth, min_samples_split, etc.) doit être documenté et justifié, pas juste testé en aveugle.
- Les critères d'évaluation portent sur la démarche (modélisation d'architecture, choix d'outils justifié, prototype démontrant la pertinence) — pas seulement sur la performance du modèle.
- L'évaluation finale a lieu lors des 2 dernières séances de 2026 : le notebook doit être propre et reproductible dès la séance 1.

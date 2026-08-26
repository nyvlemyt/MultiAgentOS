---
id: resource-s7-ml2-root-machine-learning-ii-2526-lab2-pdf-3a931a92
slug: resource-s7-ml2-root-machine-learning-ii-2526-lab2-pdf-3a931a92
source_key: 'sha256:3a931a92b853e556125be45b97511f7f4ff828ea4c78012b9795a7d3d375642b'
part_of: S7 - ml2
order: 23
manifest: null
derived_from: 'sha256:3a931a92b853e556125be45b97511f7f4ff828ea4c78012b9795a7d3d375642b'
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
  - clustering
  - k-means
  - lab
  - python
  - data-science
  - electric-school-bus
domain: Machine Learning
---
# S7 - ml2 — root_Machine Learning II 2526 Lab2.pdf

## Problem

Enrichir un tableau de bord existant sur les autobus scolaires électriques aux États-Unis en appliquant une segmentation non supervisée (clustering K-means) sur les données d'adoption.

## Solution

En séance 2 : (1) comprendre le problème métier à partir du dashboard electricschoolbusinitiative.org et du fichier technical-note-dataset ; (2) explorer et comprendre les données téléchargées depuis electricschoolbusinitiative.org/dataset-us-electric-school-bus-adoption ; (3) préparer le jeu d'entraînement (nettoyage, encodage, normalisation) ; (4) entraîner plusieurs configurations K-means (faire varier k et autres hyperparamètres), comparer via inertie / silhouette score, sélectionner le modèle optimal ; (5) livrer sur Moodle : diapositives + Notebook + fichier de données d'entraînement (+ dashboard optionnel).

## Variations

- Dashboard Moodle optionnel : visualisation interactive des clusters (ex. Tableau, Power BI, Streamlit) pour enrichir réellement le tableau de bord public.
- Comparaison d'algorithmes alternatifs (DBSCAN, agglomeratif) pour justifier le choix de K-means (critère B202).
- Approche éco-conception (critère B201) : réduire la dimensionnalité avant clustering (PCA) pour limiter le coût calcul.

## Pitfalls

- Oublier de normaliser les features avant K-means — l'algorithme est sensible aux échelles.
- Choisir k arbitrairement sans méthode (elbow curve ou silhouette) — pénalisant sur le critère B206.
- Livrer un Notebook sans cellules Markdown expliquant les choix — la compétence B202 (justifier le choix) doit être explicite.
- Ne pas joindre le fichier de données d'entraînement (livrable obligatoire distinct du Notebook).
- Confondre l'évaluation finale (2 dernières séances 2026) avec une simple remise — c'est une interrogation de TP notée.

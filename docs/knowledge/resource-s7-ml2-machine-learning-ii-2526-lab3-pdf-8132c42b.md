---
id: resource-s7-ml2-machine-learning-ii-2526-lab3-pdf-8132c42b
slug: resource-s7-ml2-machine-learning-ii-2526-lab3-pdf-8132c42b
source_key: 'sha256:8132c42b72e7a0057567bf5da21063dccdeca2fafc7582aee1bc5f578d3bf2a7'
part_of: resource-s7-ml2-fa640f29
order: 2
manifest: null
derived_from: 'sha256:8132c42b72e7a0057567bf5da21063dccdeca2fafc7582aee1bc5f578d3bf2a7'
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
  - hierarchical-clustering
  - electric-school-bus
  - data-science
  - lab
  - school-project
domain: Machine Learning
---
# S7 - ml2 — Machine Learning II 2526 Lab3.pdf

## Problem

Enrichir un tableau de bord sur les autobus scolaires électriques aux États-Unis en développant des modèles de segmentation (clustering hiérarchique) à partir de données publiques.

## Solution

Suivre le pipeline CRISP-DM en 4 étapes pour la séance 2 : (1) comprendre le problème métier à partir du dashboard electricschoolbusinitiative.org et de la note technique PDF ; (2) explorer et comprendre les données téléchargées depuis le dataset public ; (3) préparer les données d'entraînement (nettoyage, sélection de variables) ; (4) entraîner plusieurs variantes du modèle hiérarchique, comparer les paramètres (linkage, distance, nombre de clusters) et sélectionner le plus approprié. Livrer slides + notebook + fichier de données sur Moodle à la fin de la séance.

## Variations

- Le tableau de bord développé (Power BI, Streamlit, Dash, etc.) est un livrable optionnel qui peut renforcer la note.
- Les paramètres du modèle à comparer incluent typiquement : méthode de linkage (ward, complete, average, single), métrique de distance (euclidienne, cosinus, Manhattan) et nombre de clusters final lu sur le dendrogramme.
- La comparaison peut s'appuyer sur des indices internes (silhouette, Davies-Bouldin) pour justifier le choix final.

## Pitfalls

- Ne pas normaliser les variables numériques avant le clustering hiérarchique fausse les distances et biaise les clusters.
- Omettre la justification du choix de paramètres fait perdre des points sur B202 (sélection et justification des outils).
- Rendre le notebook sans les slides ou sans le fichier de données entraîne un livrable incomplet (3 fichiers obligatoires sur Moodle).
- Confondre clustering hiérarchique agglomératif et divisif : le cours vise le mode agglomératif (bottom-up), le plus courant.

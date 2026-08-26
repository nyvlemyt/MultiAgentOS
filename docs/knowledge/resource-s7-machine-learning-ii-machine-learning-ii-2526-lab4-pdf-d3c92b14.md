---
id: resource-s7-machine-learning-ii-machine-learning-ii-2526-lab4-pdf-d3c92b14
slug: resource-s7-machine-learning-ii-machine-learning-ii-2526-lab4-pdf-d3c92b14
source_key: 'sha256:d3c92b149d875f4707865fa5fd1bb7110209b41622ea114c64d5f02d726e1809'
part_of: resource-s7-machine-learning-ii-0632fee9
order: 4
manifest: null
derived_from: 'sha256:d3c92b149d875f4707865fa5fd1bb7110209b41622ea114c64d5f02d726e1809'
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
  - apriori
  - association-rules
  - machine-learning
  - electric-school-bus
  - data-preparation
  - lab-session
  - ADIF84
domain: machine-learning
---
# S7 - Machine Learning II — Machine Learning II 2526 Lab4.pdf

## Problem

Enrichir le tableau de bord des autobus scolaires électriques aux États-Unis (electricschoolbusinitiative.org) avec de la découverte d'associations : identifier des patterns cachés dans les données d'adoption à l'échelle nationale et étatique, en utilisant l'algorithme Apriori.

## Solution

Séance 5 — pipeline en 4 étapes : (1) Compréhension du problème métier : lire le fichier 'technical-note-dataset-electric-school-bus-adoption-united-states.PDF' et cadrer les règles d'association pertinentes (ex. : quelles caractéristiques coexistent dans les districts ayant adopté les bus électriques). (2) Compréhension des données : explorer le dataset disponible sur electricschoolbusinitiative.org/dataset-us-electric-school-bus-adoption, analyser distributions, valeurs manquantes, cardinalités. (3) Préparation des données d'entraînement : transformer le dataset en format transactionnel (one-hot ou liste d'itemsets) compatible avec Apriori. (4) Choix et réglage fin du modèle : tester plusieurs combinaisons de paramètres (support minimal, confiance, lift) et sélectionner la configuration la plus appropriée au contexte métier.

## Variations

Comparer au moins deux jeux de paramètres Apriori (ex. : support 0.05 vs 0.10, confiance 0.6 vs 0.8) et documenter l'impact sur le nombre de règles générées et leur pertinence métier. Un tableau de bord de visualisation des règles (réseau ou matrice) est optionnel mais valorisé.

## Pitfalls

Livrables obligatoires à déposer sur Moodle en fin de séance : (1) diapositives, (2) notebook, (3) fichier de données d'entraînement — le dashboard est optionnel. L'évaluation (2 dernières séances 2026) porte sur trois compétences B/B : B201 (architecture en composants + éco-conception), B202 (choix d'outils justifié), B206 (prototype démontrant la pertinence — penser au TRL). Ne pas se limiter à faire tourner le modèle : justifier explicitement les choix techniques et interpréter les règles dans le contexte métier des bus scolaires électriques.

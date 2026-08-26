---
id: resource-s5-structure-de-donnees-lab-5-melvyn-pommier-pdf-0750ae47
slug: resource-s5-structure-de-donnees-lab-5-melvyn-pommier-pdf-0750ae47
source_key: 'sha256:0750ae472feb4a40bd9c74f45c2a484ddf785c714e07b73fec341ba21d28a944'
part_of: S5 - Structure de données
order: 6
manifest: null
derived_from: 'sha256:0750ae472feb4a40bd9c74f45c2a484ddf785c714e07b73fec341ba21d28a944'
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
  - queue
  - FIFO
  - simulation
  - python
  - data-structures
  - scheduling
domain: computer-science
---
# S5 - Structure de données — Lab 5 Melvyn Pommier.pdf

## Goal

Simuler une file d'attente FCFS pour la gestion de patients en salle d'attente et calculer les temps d'attente moyens.

## Prerequisites

- bases Python (listes, classes, méthodes)
- notion de file (FIFO)

## Steps

- Créer une classe Queue avec un tableau interne (liste Python) et deux méthodes : enqueue (ajout en queue) et dequeue (retrait en tête) — respect du principe FIFO.
- Définir les données patients : liste de tuples (nom, heure_arrivée, durée_consultation).
- Initialiser current_time = 0 pour piloter l'horloge simulée.
- Pour chaque patient dans l'ordre d'arrivée : l'enqueue dans la file.
- Boucle de simulation : dequeue le premier patient ; si current_time < heure_arrivée, avancer current_time à heure_arrivée ; calculer temps_attente = current_time - heure_arrivée ; avancer current_time de durée_consultation ; calculer temps_global = current_time - heure_arrivée.
- Accumuler temps_attente et temps_global dans des listes, puis calculer les moyennes.

## Result

Le programme affiche, pour chaque patient, son temps d'attente et son temps global, puis les deux moyennes (temps_attente_moyen, temps_global_moyen) sur l'ensemble de la simulation.

## Next

- Ajouter des tests unitaires sur enqueue/dequeue et les calculs de temps
- Étendre à une file avec priorités (patients urgents)
- Comparer avec collections.deque (Python stdlib) pour la performance

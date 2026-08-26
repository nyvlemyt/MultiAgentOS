---
id: resource-s6-optimisation-et-complexite-projet-pdf-0bde2458
slug: resource-s6-optimisation-et-complexite-projet-pdf-0bde2458
source_key: 'sha256:0bde24585e02c20d5f493eac4ad3ab8d880692074168765a085a97684ac1dcd0'
part_of: S6 - Optimisation et complexité
order: 8
manifest: null
derived_from: 'sha256:0bde24585e02c20d5f493eac4ad3ab8d880692074168765a085a97684ac1dcd0'
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
  - optimisation
  - recherche-opérationnelle
  - CPLEX
  - OPL
  - programmation-linéaire
  - projet
domain: optimisation combinatoire
---
# S6 - Optimisation et complexité — Projet.pdf

## Problem

Réaliser un projet complet d'optimisation combinatoire : choisir un problème classique (KP, BPP, AP, SP, TSP, VRP), le modéliser mathématiquement et le résoudre avec IBM CPLEX Optimizer via le langage OPL.

## Solution

Suivre un pipeline en 4 étapes : (1) définir le problème choisi, (2) réaliser une revue de littérature, (3) établir la formulation mathématique (variables, contraintes, fonction objectif), (4) implémenter et résoudre avec CPLEX Studio IDE en langage OPL — d'abord sur de petites instances, puis en montant en charge pour interpréter les résultats de scalabilité.

## Variations

- Knapsack Problem (KP) : maximiser la valeur d'objets sous contrainte de capacité.
- Bin Packing Problem (BPP) : minimiser le nombre de conteneurs pour ranger des objets.
- Assignment Problem (AP) : affecter des ressources à des tâches à coût minimal.
- Scheduling Problem (SP) : ordonnancer des tâches sur des machines avec contraintes de temps.
- Traveling Salesman Problem (TSP) : trouver le circuit le plus court visitant toutes les villes.
- Vehicle Routing Problem (VRP) : planifier les tournées d'une flotte de véhicules.

## Pitfalls

- Négliger la montée en charge (étape 2) : les petites instances passent toujours ; ce sont les grandes qui révèlent les limites du modèle.
- Formulation mathématique incomplète : oublier des contraintes (capacité, intégrité des variables) fausse les résultats CPLEX.
- Revue de littérature trop superficielle : elle doit motiver les choix de modélisation, pas juste lister des papiers.
- Rapport trop long ou trop dense : l'objectif explicite est d'être complet ET concis ; soigner la lisibilité.
- Oublier de rendre le code source en même temps que le rapport (les deux sont obligatoires).

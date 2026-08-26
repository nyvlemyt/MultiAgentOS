---
id: resource-s5-mathematiques-pour-l-informatique-projet-efrei-pdf-0abdc12a
slug: resource-s5-mathematiques-pour-l-informatique-projet-efrei-pdf-0abdc12a
source_key: 'sha256:0abdc12acdfb704800d0a0400827868f437a0d9ab42eb461cfcc3e9253834cd7'
part_of: S5 - Mathématiques pour l'informatique
order: 1
manifest: null
derived_from: 'sha256:0abdc12acdfb704800d0a0400827868f437a0d9ab42eb461cfcc3e9253834cd7'
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
  - graphes
  - algorithmique
  - métro
  - Bellman-Ford
  - Prim
  - ACPM
  - connexité
  - plus-court-chemin
  - projet-étudiant
  - Python
domain: mathématiques pour l'informatique
---
# S5 - Mathématiques pour l'informatique — Projet Efrei.pdf

## Problem

Implémenter un programme de navigation dans le métro parisien en appliquant des algorithmes de théorie des graphes sur un fichier de données réel (metro.txt).

## Solution

Construire un graphe non orienté G(V,E) depuis metro.txt, puis implémenter trois modules : (1) vérification de connexité avec correction manuelle si nécessaire, (2) calcul du plus court chemin via Bellman-Ford avec affichage de l'itinéraire complet (lignes, directions, changements, durée estimée), (3) extraction de l'arbre couvrant de poids minimum via l'algorithme de Prim.

## Variations

- Bonus PCC : affichage graphique de la carte (metrofr.png) avec clic sur stations de départ/arrivée et tracé du chemin sur le plan.
- Bonus ACPM : affichage de l'ACPM sur la carte après clic sur une zone, avec coordonnées depuis pospoints.txt.
- Interface graphique dynamique pour visualiser l'ACPM en temps réel.
- Langages acceptés : Python, Java, C, OCaml ou autre.

## Pitfalls

- Certaines stations sont dupliquées dans metro.txt (ex. 'Arts et Métiers') car elles correspondent à des points de correspondance entre lignes — chaque occurrence représente un sommet distinct selon la ligne.
- Le fichier metro.txt date de 1998-2002 : des stations récentes sont absentes, ce qui est acceptable.
- Le graphe peut être incomplet (liaisons manquantes) ; la connexité doit être vérifiée en premier et les liaisons manquantes ajoutées manuellement en justifiant l'algorithme utilisé.
- Le rapport ne doit pas dépasser 10 pages (description des structures de données, algorithmes choisis, procédures principales).
- Rendu sur Moodle au format nom1_nom2_nom3.zip avant le 15/11/2024 à 23h59, avec rapport PDF + code + script/Makefile.

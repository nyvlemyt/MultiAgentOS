---
id: resource-td1-chap-1-optimisation-647cf9a3
slug: resource-td1-chap-1-optimisation-647cf9a3
source_key: 'sha256:647cf9a3cc72d969e712bad3480769d1234eb02e08974bf7eb73c6c0fe79a651'
part_of: null
order: null
manifest: null
derived_from: 'sha256:647cf9a3cc72d969e712bad3480769d1234eb02e08974bf7eb73c6c0fe79a651'
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
  - linear-programming
  - LP-formulation
  - decision-variables
  - objective-function
  - constraints
  - minimisation
  - maximisation
  - operations-research
  - S6
domain: operations-research
---
# TD1 – CHAP 1 – Optimisation

## Goal

Savoir modéliser un problème d'optimisation linéaire (PL) à partir d'un énoncé tabulaire : identifier les variables de décision, écrire la fonction objectif (min ou max) et formaliser les contraintes sous forme standard.

## Prerequisites

- Algèbre de base : inégalités, systèmes linéaires
- Notion de variable de décision et de domaine admissible
- Cours CHAP 1 – Optimisation (S6 – Optimisation et complexité)

## Steps

- Ex 1 – Minimisation coût (linge) : 2 variables (Lot A = x1, Lot B = x2), 3 contraintes ≥ sur quantités minimales (draps, couettes, oreillers). Min Z = 200x1 + 400x2.
- Ex 2 – Maximisation profit (bijoux) : 2 variables (Bijoux 1 = x1, Bijoux 2 = x2), 3 contraintes ≤ sur ressources (diamants, zircones, saphirs). Max Z = 40x1 + 50x2.
- Ex 3 – Maximisation coût (production) : 3 variables (Pr1, Pr2, Pr3), 3 contraintes ≤ (usinage, assemblage, finition). Max Z = 6x1 + 7x2 + 8x3. Note : l'énoncé source contient une coquille (8*x2 au lieu de 8*x3).
- Ex 4 – Minimisation profit (chaises) : 2 variables (CH1, CH2), contraintes mixtes (≤ sciage, ≥ assemblage, ≥ sablage). Min Z = 300x1 + 200x2.
- Ex 5 – Maximisation profit (chocolats) : 3 variables (Luxe, Spéciale, Ordinaire), 3 contraintes ≤ sur ingrédients (chocolat noir, blanc, cerise). Max Z = 3x1 + 2x2 + 1.5x3.
- Ex 8 – Minimisation coût de transport (réseau 4 villes × 3 entrepôts) : deux formulations présentées selon l'axe d'orientation des variables (par destination ou par origine). Formulation finale : MinZ = 25x1 + 15x2 + 20x3 avec x1/x2/x3 = quantités envoyées depuis Bordeaux/Biarritz/Toulouse. Note : la première formulation de l'énoncé indique 'Max' alors que l'objectif est 'Min' — incohérence à corriger.

## Result

L'étudiant sait extraire variables de décision, sens d'optimisation et contraintes depuis un tableau de données, et les transcrire en programme linéaire standard, y compris pour des problèmes de transport multi-origines/destinations.

## Next

- Résolution graphique pour 2 variables — méthode des sommets du domaine admissible
- Méthode du simplexe pour ≥ 3 variables
- Dualité et interprétation économique des variables duales

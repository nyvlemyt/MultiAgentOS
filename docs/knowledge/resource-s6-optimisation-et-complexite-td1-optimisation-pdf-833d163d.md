---
id: resource-s6-optimisation-et-complexite-td1-optimisation-pdf-833d163d
slug: resource-s6-optimisation-et-complexite-td1-optimisation-pdf-833d163d
source_key: 'sha256:833d163d761863a3fcae3736982ca473263c7d3b408e7e1864fa5a0b9667b865'
part_of: S6 - Optimisation et complexité
order: 11
manifest: null
derived_from: 'sha256:833d163d761863a3fcae3736982ca473263c7d3b408e7e1864fa5a0b9667b865'
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
  - programmation-linéaire
  - modélisation
  - optimisation
  - LP
  - contraintes
  - fonction-objectif
  - maximisation
  - minimisation
  - problème-de-transport
domain: mathématiques-appliquées
---
# S6 - Optimisation et complexité — TD1 - Optimisation .pdf

## Goal

Apprendre à traduire un problème d'optimisation concret en programme linéaire : identifier les variables de décision, formuler la fonction objectif (max ou min) et écrire les contraintes sous forme d'inégalités linéaires.

## Prerequisites

- Notions d'inégalités et de systèmes d'équations linéaires
- Vocabulaire de base : variable de décision, contrainte, fonction objectif, programme linéaire
- Cours S6 — Optimisation et complexité (Marwa HARZI, ALSM62)

## Steps

**id**: 1
**titre**: Minimisation de coût — achat de linge hospitalier (Hôpital de Nice)
**variables**: x = nb lots A achetés, y = nb lots B achetés
**objectif**: min Z = 200x + 400y
**contraintes**: - 2x + 3y ≥ 80  (draps)
- 4x + 12y ≥ 220  (couettes)
- 8x + 6y ≥ 250  (oreillers)
- x, y ≥ 0 entiers
**id**: 2
**titre**: Maximisation de recette — bijoutier (2 types de bijoux)
**variables**: x = nb bijoux type 1 (40€), y = nb bijoux type 2 (50€)
**objectif**: max Z = 40x + 50y
**contraintes**: - 10x + 10y ≤ 50  (diamants)
- 10x + 20y ≤ 80  (zircones)
- 20x + 10y ≤ 80  (saphirs)
- x, y ≥ 0
**id**: 3
**titre**: Maximisation de bénéfice — 3 produits, 3 ateliers
**variables**: x1, x2, x3 = quantités de Pr1, Pr2, Pr3 produites
**objectif**: max Z = 6x1 + 7x2 + 8x3
**contraintes**: - x1 + 2x2 + x3 ≤ 100  (usinage, 100h)
- 3x1 + 4x2 + 2x3 ≤ 120  (assemblage, 120h)
- 2x1 + 6x2 + 4x3 ≤ 200  (finition, 200h)
- x1, x2, x3 ≥ 0
**id**: 4
**titre**: Maximisation de profit — chaises CH1/CH2 sur temps morts
**variables**: x = nb CH1 (300€), y = nb CH2 (200€)
**objectif**: max Z = 300x + 200y
**contraintes**: - x + 2y ≤ 20  (sciage)
- 2x + y ≤ 22  (assemblage)
- x + y ≤ 12  (sablage)
- x, y ≥ 0
**id**: 5
**titre**: Maximisation de profit — 3 assortiments de chocolats
**variables**: x1, x2, x3 = nb boites luxe, spéciale, ordinaire
**objectif**: max Z = 3x1 + 2x2 + 1.5x3
**contraintes**: - 0.45x1 + 0.56x2 + 0.45x3 ≤ 33.6  (chocolat noir)
- 0.67x1 + 0.34x2 + 0.22x3 ≤ 25.2  (chocolat blanc)
- 0.34x1 + 0.084x2 ≤ 10.08  (chocolat cerise)
- x1, x2, x3 ≥ 0
**id**: 6
**titre**: Maximisation de marge — 4 modèles de tables (menuiserie + finition)
**variables**: x1, x2, x3, x4 = quantités produites de chaque modèle de table
**objectif**: max Z = 60x1 + 100x2 + 90x3 + 200x4
**contraintes**: - 4x1 + 9x2 + 7x3 + 10x4 ≤ 7000  (menuiserie, 7000h sur 6 mois)
- x1 + x2 + 3x3 + 40x4 ≤ 4000  (finition, 4000h sur 6 mois)
- x1, x2, x3, x4 ≥ 0
**id**: 7
**titre**: Maximisation de marge sur coûts variables — 2 produits, 3 machines
**variables**: x1 = nb Pr1 (marge 25% × 320€ = 80€), x2 = nb Pr2 (marge 20% × 500€ = 100€)
**objectif**: max Z = 80x1 + 100x2
**contraintes**: - 20x1 + 30x2 ≤ 18 000 min  (M1 = 300h)
- 50x1 + 50x2 ≤ 30 000 min  (M2 = 500h)
- 10x1 + 40x2 ≤ 12 000 min  (M3 = 200h)
- x1, x2 ≥ 0
**note**: Convertir les capacités en minutes (×60) pour cohérence avec les temps unitaires exprimés en minutes.
**id**: 8
**titre**: Problème de transport — approvisionnement au moindre coût
**structure**: 3 usines (Bordeaux 25u, Biarritz 15u, Toulouse 20u) → 4 clients (Pau 20u, Bayonne 12u, Bordeaux-client 9u, Libourne 14u)
**variables**: xij = quantité transportée de l'usine i vers le client j
**objectif**: min Z = ΣΣ cij × xij  (coûts unitaires donnés dans la matrice)
**contraintes**: - Σj xij ≤ capacité de l'usine i  (contrainte d'offre pour chaque usine i)
- Σi xij = demande du client j  (contrainte de demande pour chaque client j)
- xij ≥ 0

## Result

Pour chaque exercice : un triplet complet (variables de décision, fonction objectif, ensemble de contraintes linéaires) constituant le programme linéaire prêt à être résolu. La modélisation suit toujours le même patron : nommer les inconnues → écrire l'objectif → lister les contraintes de ressources → ajouter la contrainte de non-négativité.

## Next

- Résolution graphique pour les PL à 2 variables (ex. 2 et 4)
- Méthode du simplexe pour les PL à ≥ 3 variables (ex. 3, 5, 6, 7)
- Algorithme de transport (coin nord-ouest, méthode MODI) pour l'exercice 8
- Analyse de sensibilité et interprétation des variables d'écart

---
id: resource-s6-optimisation-et-complexite-presentation-pdf-9718f3a5
slug: resource-s6-optimisation-et-complexite-presentation-pdf-9718f3a5
source_key: 'sha256:9718f3a548be11c91d0395d86492221f025e6642cdc00c71cd1ce144e5e26404'
part_of: S6 - Optimisation et complexité
order: 7
manifest: null
derived_from: 'sha256:9718f3a548be11c91d0395d86492221f025e6642cdc00c71cd1ce144e5e26404'
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
doc_type: reference
actionability: resource
lane: knowledge
schema_version: '1'
tags:
  - TSP
  - optimisation combinatoire
  - complexité
  - recherche opérationnelle
  - PuLP
  - CBC
  - MTZ
  - heuristiques
  - NP-difficile
domain: optimisation et complexité algorithmique
---
# S6 - Optimisation et complexité — Presentation.pdf

## Summary

Le problème du voyageur de commerce (TSP) consiste à trouver le plus court circuit hamiltonien dans un graphe complet pondéré. C'est un problème NP-difficile canonique, présent en logistique, bio-informatique, circuits imprimés et robotique. Trois familles d'approches existent : exactes (PLNE, Branch & Bound), heuristiques (plus proche voisin, 2-opt) et métaheuristiques (recuit simulé, algorithmes génétiques, colonies de fourmis). Une implémentation via PuLP + solveur CBC avec formulation MTZ (Miller–Tucker–Zemlin) pour éliminer les sous-tours permet une résolution optimale en moins de 2 secondes pour 30 villes ; au-delà de ~40 villes, les heuristiques deviennent nécessaires.

## Fields/API

**name**: Définition
**value**: Trouver la permutation π des villes minimisant la distance totale d'un circuit visitant chaque ville exactement une fois. Données : ensemble de villes + matrice de distances.
**name**: Complexité
**value**: NP-difficile. Aucune solution polynomiale connue à ce jour malgré de nombreuses tentatives.
**name**: Approches exactes
**value**: PLNE (Programmation Linéaire en Nombres Entiers), Branch & Bound. Garantissent l'optimalité mais sont exponentielles en temps.
**name**: Approches heuristiques
**value**: Plus proche voisin, 2-opt. Rapides, donnent de bons résultats sans garantie d'optimalité.
**name**: Approches métaheuristiques
**value**: Recuit simulé, algorithmes génétiques, algorithmes à colonies de fourmis. Efficaces sur les grandes instances.
**name**: Formulation mathématique — variables
**value**: Matrice binaire x_{ij} ∈ {0,1} : vaut 1 si l'arc (i→j) est emprunté. Variables auxiliaires MTZ u_i pour éliminer les sous-tours.
**name**: Formulation mathématique — contraintes
**value**: Départ : chaque ville est quittée exactement une fois. Visite : chaque ville est atteinte exactement une fois. MTZ : contraintes d'ordre éliminant les sous-tours (cycles qui ne couvrent pas toutes les villes).
**name**: Formulation mathématique — objectif
**value**: Minimiser ∑_{i,j} d_{ij} · x_{ij} (somme des distances des arcs empruntés).
**name**: Implémentation de référence
**value**: Python + PuLP + solveur CBC. Génération aléatoire de villes et matrice de distances. Construction automatique du modèle. Visualisation interactive : graphe complet + bouton affichage chemin optimal (arêtes rouges pointillées avec flèches).
**name**: Performances observées
**value**: Résolution optimale en < 2 secondes pour 30 villes avec CBC. Limite pratique : ~40 villes pour la méthode exacte.

## Constraints

- Au-delà de ~40 villes, CBC devient trop lent : basculer vers des heuristiques (2-opt, insertion).
- La formulation MTZ peut être remplacée par DFJ (Dantzig–Fulkerson–Johnson) pour de meilleures performances sur certaines instances.
- Contraintes réelles non couvertes par le TSP de base : limites de temps, capacité des véhicules, distances asymétriques (A/R différentes), ordres de priorité.
- La visualisation interactive devient difficile à lire pour de très grands graphes (solution suggérée : clusterisation).

## Examples

- Logistique : optimisation de tournées de livraison.
- Bio-informatique : ordonnancement de séquences ADN.
- Fabrication : ordonnancement des perçages sur circuits imprimés.
- Robotique : planification de trajectoires optimales.

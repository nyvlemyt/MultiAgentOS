---
id: resource-s6-optimisation-et-complexite-rapport-pdf-b64c09b2
slug: resource-s6-optimisation-et-complexite-rapport-pdf-b64c09b2
source_key: 'sha256:b64c09b25054a142684111a924b787df94274fb7cd81e4d3795a04c9de98fd5b'
part_of: resource-s6-optimisation-et-complexite-7bceb175
order: 9
manifest: null
derived_from: 'sha256:b64c09b25054a142684111a924b787df94274fb7cd81e4d3795a04c9de98fd5b'
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
  - optimisation-combinatoire
  - programmation-lineaire
  - NP-difficile
  - MTZ
  - PuLP
  - CBC
  - heuristiques
  - metaheuristiques
domain: algorithmique
---
# S6 - Optimisation et complexité — Rapport.pdf

## Summary

Rapport académique (ING1 APP LSI3, 2024-2025) sur le problème du voyageur de commerce (TSP). Le TSP consiste à trouver la permutation π d'un ensemble de n villes minimisant la distance totale d'un tour complet. C'est un problème NP-difficile résolu ici par une approche exacte : formulation linéaire en nombres entiers avec contraintes MTZ (Miller-Tucker-Zemlin) pour l'élimination des sous-tours, implémentée en Python avec PuLP/CBC. Résultats : solution optimale en < 2 s pour 30 villes ; visualisation dynamique via NetworkX/Matplotlib. Limite : au-delà de 30 villes, des heuristiques ou métaheuristiques deviennent nécessaires.

## Fields/API

**name**: Définition
**value**: Étant donné n villes et une matrice de distances d(i,j), trouver la permutation π minimisant la somme totale des distances du tour (cycle hamiltonien).
**name**: Complexité
**value**: NP-difficile. Le nombre de solutions croît en (n-1)!/2, rendant l'exploration exhaustive impraticable dès ~20 villes.
**name**: Variables de décision
**value**: x(i,j) ∈ {0,1} — vaut 1 si le trajet va de i à j. u(i) — variable auxiliaire entière pour l'élimination des sous-tours (MTZ), définie pour les villes 2..n.
**name**: Fonction objectif
**value**: Minimiser Σ d(i,j) · x(i,j) sur toutes les paires (i,j), i≠j.
**name**: Contraintes MTZ
**value**: (1) Chaque ville quittée exactement une fois : Σ_j x(i,j) = 1 ∀i. (2) Chaque ville visitée exactement une fois : Σ_i x(i,j) = 1 ∀j. (3) Élimination des sous-tours : u(i) - u(j) + n·x(i,j) ≤ n-1 pour i,j ≥ 2, i≠j.
**name**: Stack technique
**value**: Python · PuLP (modélisation) · CBC (solveur backend) · NetworkX + Matplotlib (visualisation dynamique du graphe et du chemin optimal).
**name**: Approches alternatives
**value**: Méthodes exactes (Branch & Bound, DFJ) — optimales mais lentes sur grands cas. Heuristiques (plus proche voisin, insertion, 2-opt) — rapides, bonne qualité. Métaheuristiques (recuit simulé, algorithmes génétiques, colonies de fourmis, recherche tabou) — meilleures sur très grands cas.
**name**: Résultats mesurés
**value**: Solution optimale certifiée, temps < 2 s pour n = 30 villes. Visualisation interactive : réseau complet + chemin optimal en arêtes rouges pointillées avec flèches, distance totale et ordre affichés.
**name**: Limite connue
**value**: CBC efficace jusqu'à ~30 villes ; au-delà, basculer vers heuristiques ou métaheuristiques.

## Constraints

- Formulation exacte (MTZ) garantit un cycle hamiltonien unique sans sous-tours.
- x(i,j) ∈ {0,1} — variables binaires entières.
- u(i) ∈ ℤ, 1 ≤ u(i) ≤ n-1 pour i ≥ 2.
- Scalabilité limitée : approche exacte non recommandée au-delà de ~30 villes sans matériel dédié ou reformulation.

## Examples

- Instance aléatoire n=30 : matrice de distances générée automatiquement, CBC trouve l'optimum en < 2 s.
- Visualisation : graphe complet affiché, bouton pour superposer le chemin optimal (arêtes rouges pointillées + flèches directionnelles + distance totale).
- Amélioration proposée : comparer formulation DFJ vs MTZ sur des instances de taille croissante.

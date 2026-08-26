---
id: resource-s6-optimisation-et-complexite-chap-1-optimisation-pdf-d8005d8b
slug: resource-s6-optimisation-et-complexite-chap-1-optimisation-pdf-d8005d8b
source_key: 'sha256:d8005d8b785950847dd69ba3556d1561c8311cf266ab31ad48afe0f662fcf2ea'
part_of: S6 - Optimisation et complexité
order: 13
manifest: null
derived_from: 'sha256:d8005d8b785950847dd69ba3556d1561c8311cf266ab31ad48afe0f662fcf2ea'
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
  - optimisation
  - programmation-linéaire
  - modélisation
  - complexité
  - algorithmique
  - recherche-opérationnelle
domain: mathématiques appliquées
---
# S6 - Optimisation et complexité — chap 1 - Optimisation .pdf

## Summary

Introduction au cours ALSM62 (L3 APP-LSI, Efrei 2024/2025) sur l'optimisation et la complexité. Couvre la définition et la classification des problèmes d'optimisation (mono- vs multi-objectif), les éléments de conception d'un problème (décideurs, objectifs, contraintes, caractéristiques), et la programmation linéaire — définition, modélisation en 3 étapes, deux exemples complets (maximisation de profit et minimisation de coût), et les méthodes de résolution (graphique, simplexe, heuristiques).

## Fields/API

**name**: Optimisation — définition
**value**: Branche des mathématiques visant à minimiser ou maximiser une fonction objectif (de coût) soumise à des contraintes, à l'aide de variables de décision.
**name**: Problème mono-objectif
**value**: Un seul objectif → une solution optimale unique. Résolution graphique possible si ≤ 3 variables de décision; sinon méthodes algorithmiques.
**name**: Problème multi-objectif (MOO)
**value**: Plusieurs objectifs simultanés (min f1, f2, …, fn). Peut être ramené au mono-objectif par agrégation pondérée F = w1·f1 + w2·f2 + … + wn·fn.
**name**: Éléments clés d'un problème d'optimisation
**value**: Décideurs (DM), objectif(s), contraintes de faisabilité, caractéristiques (linéaire/non-linéaire, déterministe/stochastique, statique/dynamique, combinatoire/continu).
**name**: Espace réalisable D
**value**: Région délimitée par les contraintes gi(x) ≤ 0. Toute solution x ∈ D est réalisable; l'objectif est de trouver x* ∈ D qui optimise f.
**name**: Programmation linéaire — principe
**value**: Fonction objectif linéaire + contraintes toutes linéaires. Maximiser si l'objectif est un avantage (bénéfice, revenu), minimiser si c'est un inconvénient (coût, consommation).
**name**: Modélisation LP — 3 étapes
**value**: 1. Identifier les variables de décision. 2. Exprimer la fonction objectif (max/min). 3. Formuler les contraintes comme équations/inéquations linéaires (+ contraintes de non-négativité).
**name**: Exemple maximisation (CERFA)
**value**: Max Z = 50x1 + 60x2 sous x1 + 2x2 ≤ 8 (machine MA), 2x1 + 2x2 ≤ 10 (MP1), 9x1 + 4x2 ≤ 36 (MP2), x1, x2 ≥ 0.
**name**: Exemple minimisation (ferme)
**value**: Min Z = 20x1 + 40x2 sous 2x1 + x2 ≥ 16 (Elt1), x1 + x2 ≥ 12 (Elt2), x1 + 3x2 ≥ 18 (Elt3), x1, x2 ≥ 0.
**name**: Méthodes de résolution LP
**value**: Graphique (≤ 2–3 variables), Simplexe / méthode de Dantzig (1947, général), heuristiques et méta-heuristiques (pour problèmes complexes).
**name**: Problèmes classiques cités
**value**: Bin packing (BPP), Sac à dos (KP), Affectation (AP), Ordonnancement (SP), Voyageur de commerce (TSP), Routage de véhicules (CVRP).

## Constraints

- Les contraintes de non-négativité (xi ≥ 0) sont obligatoires pour éviter des solutions physiquement inacceptables.
- La résolution graphique n'est applicable qu'à 2 ou 3 variables de décision au maximum.
- En programmation linéaire, la fonction objectif ET toutes les contraintes doivent être strictement linéaires.
- En multi-objectif, l'agrégation pondérée requiert que le décideur fournisse les poids (w1, …, wn) a priori.

## Examples

**label**: Maximisation de profit (CERFA)
**description**: Entreprise fabriquant 2 produits avec 3 ressources limitées. Variables: x1 (Pdt1), x2 (Pdt2). Objectif: Max Z = 50x1 + 60x2. Contraintes de capacité machine et matières premières.
**label**: Minimisation de coût alimentaire (ferme)
**description**: Agriculteur cherchant la combinaison d'aliments AA/AB la moins chère satisfaisant des besoins nutritifs minimaux. Variables: x1 (AA), x2 (AB). Objectif: Min Z = 20x1 + 40x2.

---
id: resource-s6-optimisation-et-complexite-chapitre3-opti-pdf-6296bc71
slug: resource-s6-optimisation-et-complexite-chapitre3-opti-pdf-6296bc71
source_key: 'sha256:6296bc710e3d5b4b9b2f0b846d9b4cecbfab50b14e3a92112bbedbde2df67c2e'
part_of: S6 - Optimisation et complexité
order: 1
manifest: null
derived_from: 'sha256:6296bc710e3d5b4b9b2f0b846d9b4cecbfab50b14e3a92112bbedbde2df67c2e'
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
  - simplex
  - programmation-lineaire
  - optimisation
  - algorithme
  - maximisation
  - minimisation
  - variables-ecart
  - variables-artificielles
  - methode-M
  - pivotage
  - tableau-simplexe
domain: recherche-operationnelle
---
# S6 - Optimisation et complexité — Chapitre3  - Opti.pdf

## Goal

Résoudre un programme linéaire (PL) par la méthode du simplexe — cas maximisation avec contraintes ≤, puis cas minimisation et contraintes mixtes (≥, =) via variables artificielles et méthode M.

## Prerequisites

- Savoir formuler un PL en forme canonique (inégalités)
- Notion de point extrême d'un polyèdre convexe
- Opérations élémentaires sur les matrices (divisions, combinaisons linéaires de lignes)

## Steps

**num**: 1
**title**: Mise en forme standard
**body**: Transformer toutes les inégalités en égalités en ajoutant des variables d'écart (slack variables) pour les contraintes ≤ (variable positive qui absorbe l'écart). Pour une contrainte ≥ avec second membre positif, soustraire une variable d'écart. Si le second membre est négatif, multiplier la contrainte par -1 et inverser l'inégalité avant de procéder. Résultat : toutes les contraintes deviennent des égalités, toutes les variables ≥ 0.
**num**: 2
**title**: Construction du tableau initial
**body**: Identifier la solution de base de départ : les variables d'écart forment la base initiale (coefficient 1 dans leur contrainte respective, 0 ailleurs). Le vecteur b donne les valeurs des variables de base. Si une variable d'écart donnerait une valeur négative (contrainte ≥), la solution de départ est non réalisable → introduire des variables artificielles (voir étape 2-bis).
**num**: 2-bis
**title**: Variables artificielles et méthode M (contraintes ≥ ou =)
**body**: Ajouter une variable artificielle tᵢ à chaque contrainte dont la base initiale n'est pas réalisable. Dans la fonction objectif de maximisation, lui affecter un coût -M (M très grand positif) : Max z = … - M·t₁ - M·t₂ - … Cela pénalise fortement toute solution conservant tᵢ > 0 et force leur sortie de la base avant convergence. Une variable artificielle sortie de la base est ignorée dans les itérations suivantes.
**num**: 3
**title**: Choix de la variable entrante (colonne pivot)
**body**: Dans la dernière ligne du tableau (ligne des coûts réduits), repérer le coefficient le plus élevé (maximisation) : la variable correspondante entre dans la base. Cette colonne est la colonne pivot.
**num**: 4
**title**: Choix de la variable sortante (ligne pivot)
**body**: Calculer le rapport bᵢ / aᵢⱼ pour chaque ligne où aᵢⱼ > 0 (coefficient de la colonne pivot strictement positif). La ligne avec le rapport minimum détermine la variable sortante. L'élément à l'intersection ligne/colonne pivot est le pivot.
**num**: 5
**title**: Pivotage
**body**: 1) Diviser toute la ligne pivot par la valeur du pivot (→ pivot devient 1). 2) Pour chaque autre ligne, annuler l'élément de la colonne pivot en appliquant la règle du rectangle : a′ = a − (b × c) / pivot, où b est l'élément de la même ligne dans la colonne pivot, et c l'élément de la même colonne dans la ligne pivot. Les lignes/colonnes avec 0 à l'intersection ne changent pas.
**num**: 6
**title**: Test d'optimalité et itérations
**body**: Lire la nouvelle solution de base (variables hors base = 0, variables en base = valeur du vecteur b). Vérifier la dernière ligne : s'il reste des coefficients positifs (maximisation), recommencer à l'étape 3. S'il n'y a plus aucun coefficient positif, la solution courante est optimale.

## Result

Deux solutions optimales illustrées par les exemples du cours : (1) Cas maximisation — Max z = 300x₁ + 500x₂ avec 3 contraintes ≤ ; solution optimale (x₁*, x₂*) = (2, 6), z* = 3600, atteinte en 2 itérations via les bases intermédiaires z=0 → z=3000 → z=3600. (2) Cas minimisation/mixte — Max z = 4x₁ + 5x₂ avec contraintes ≥, = et négatif ; après introduction des variables artificielles t₁, t₂ et méthode M, solution optimale x₁=2, x₂=3, z=23.

## Next

- Méthode en deux phases (alternative à la méthode M pour gérer les variables artificielles)
- Analyse de sensibilité (étude de la robustesse de la solution optimale aux variations des coefficients)
- Dualité en programmation linéaire

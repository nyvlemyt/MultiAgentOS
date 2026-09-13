---
id: resource-s6-optimisation-et-complexite-td1-complexite-pdf-b2ebeee3
slug: resource-s6-optimisation-et-complexite-td1-complexite-pdf-b2ebeee3
source_key: 'sha256:b2ebeee32c62601f20ea95fb96a872be8ec495e0004b71a4f4e7623cb5e59d96'
part_of: resource-s6-optimisation-et-complexite-7bceb175
order: 12
manifest: null
derived_from: 'sha256:b2ebeee32c62601f20ea95fb96a872be8ec495e0004b71a4f4e7623cb5e59d96'
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
  - algorithmic-complexity
  - big-o
  - recursion
  - dynamic-programming
  - fibonacci
  - binomial-coefficient
  - hamiltonian-cycle
  - NP-completeness
  - memoization
domain: computer-science
---
# S6 - Optimisation et complexité — TD1 Complexite.pdf

## Goal

Analyser la complexité temporelle d'algorithmes itératifs et récursifs, comprendre la mémoïsation et la programmation dynamique, et introduire la notion de NP-complétude via le cycle hamiltonien.

## Prerequisites

- Notions de boucles et de récursivité
- Définition intuitive de la notation O(·)
- Bases des graphes (sommets, arêtes, cycles)

## Steps

**title**: Boucles simples — trois patrons de complexité
**content**: 1. Boucles imbriquées indépendantes (i de 1 à n, j de 1 à n) : n×n instructions → O(n²). 2. Boucles imbriquées avec j dépendant de i (j de i à n) : somme triangulaire n+(n-1)+…+1 = n(n+1)/2 → O(n²). 3. Boucle exponentielle (i := i*2 jusqu'à n) : i double à chaque itération, soit ⌊log₂n⌋ tours → O(log n).
**title**: Fonctions récursives — équations de récurrence
**content**: 1. somme(T, n) : un seul appel récursif avec n-1, T(n) = T(n-1)+O(1) → O(n). 2. fact(n) : idem, T(n) = T(n-1)+O(1) → O(n).
**title**: Suite de Fibonacci — du naïf à l'optimal
**content**: Termes : 0, 1, 1, 2, 3, 5, 8, 13, 21, 34. L'arbre d'appels de fibo(5) montre de nombreux sous-problèmes recalculés. Récurrence du nombre d'appels : c(n) = c(n-1)+c(n-2)+1, avec c(0)=c(1)=1. Cela implique c(n) ≈ φⁿ (φ = nombre d'or), donc complexité naïve O(2ⁿ). Mémoïsation : stocker les résultats déjà calculés réduit la complexité à O(n). Terme général (formule de Binet) : uₙ = (φⁿ − ψⁿ)/√5. Via exponentiation rapide de matrices 2×2, on atteint O(log n).
**title**: Coefficient binomial — récursif vs programmation dynamique
**content**: C(n,1)=n, C(n,2)=n(n-1)/2. Algorithme récursif via C(n,k)=C(n-1,k-1)+C(n-1,k) avec C(n,0)=C(n,n)=1 : complexité exponentielle similaire à Fibonacci naïf. Algorithme itératif (triangle de Pascal) : remplir un tableau 2D ligne par ligne → complexité temporelle O(n²) et spatiale O(n²) (optimisable à O(n) en ne gardant qu'une ligne).
**title**: Cycle hamiltonien — NP-complétude
**content**: Algorithme exact : tester toutes les permutations des n sommets → O(n!). Vérification d'un cycle donné : O(n) (polynomial) → le problème est dans NP. Réduction : on réduit un problème NP-connu (ex. TSP) au cycle hamiltonien en sens polynomial pour montrer qu'il est NP-difficile. Comme le problème est dans NP ET NP-difficile → NP-complet. TSP se réduit polynomialement au cycle hamiltonien (graphe complet avec poids 0/1), ce qui confirme la NP-complétude. Oui, le cycle hamiltonien est aussi NP-Hard (au sens où tout problème NP s'y réduit).

## Result

L'étudiant sait identifier le patron de complexité d'une boucle ou d'une récursion, appliquer la mémoïsation pour passer d'exponentiel à polynomial, construire le triangle de Pascal en programmation dynamique, et argumenter la NP-complétude d'un problème via réduction polynomiale.

## Next

- TD2 : tris comparatifs et preuves de borne inférieure Ω(n log n)
- Algorithmes de plus courts chemins (Dijkstra, Bellman-Ford) comme exemples de programmation dynamique
- Introduction formelle aux classes P, NP, co-NP et réductions polynomiales

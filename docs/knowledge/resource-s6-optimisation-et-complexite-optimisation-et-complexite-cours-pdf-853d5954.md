---
id: >-
  resource-s6-optimisation-et-complexite-optimisation-et-complexite-cours-pdf-853d5954
slug: >-
  resource-s6-optimisation-et-complexite-optimisation-et-complexite-cours-pdf-853d5954
source_key: 'sha256:853d595492b35f1893a41e70bd64653348a692da373acd00378a13a24d9e6d36'
part_of: resource-s6-optimisation-et-complexite-7bceb175
order: 6
manifest: null
derived_from: 'sha256:853d595492b35f1893a41e70bd64653348a692da373acd00378a13a24d9e6d36'
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
  - algorithmic-complexity
  - big-o
  - NP-completeness
  - complexity-classes
  - optimization
  - decision-problems
  - algorithms
  - computer-science
domain: computer science
---
# S6 - Optimisation et complexité — Optimisation et complexité Cours.pdf

## Summary

Cours de complexité algorithmique (Efrei Paris 2024-2025). Couvre la notation Big O et le comportement asymptotique de T(n), les classes de complexité canoniques (O(1) à O(n!)), la distinction problème d'optimisation / problème de décision, et la taxonomie P / NP / NP-Complet / NP-Hard avec leurs critères de preuve. Sert de socle pour choisir la bonne famille de méthodes de résolution (exacte, heuristique, méta-heuristique).

## Fields/API

**name**: Opération élémentaire
**definition**: Unité atomique de calcul : +, −, *, /, %, comparaisons (≥ ≤ > <), appel de fonction.
**name**: n
**definition**: Taille des données en entrée de l'algorithme.
**name**: T(n)
**definition**: Nombre d'opérations élémentaires en fonction de n. Peut s'analyser en pire cas, meilleur cas ou cas moyen.
**name**: Complexité temporelle
**definition**: Mesure du nombre d'opérations en fonction de n. C'est la métrique principale du cours.
**name**: Complexité spatiale
**definition**: Mesure de la mémoire allouée en fonction de n. Secondaire mais non négligeable.
**name**: Notation O(f(n))
**definition**: T(n) = O(f(n)) s'il existe des constantes c > 0 et n₀ tels que pour tout n ≥ n₀ : T(n) ≤ c · f(n). On exprime toujours la borne la plus petite possible.
**name**: Notation Θ(f(n))
**definition**: T(n) = Θ(f(n)) s'il existe c₁, c₂ > 0 et n₀ tels que pour tout n ≥ n₀ : c₁·f(n) ≤ T(n) ≤ c₂·f(n). Borne asymptotique serrée.
**name**: Classes de complexité (tableau)
**definition**: O(1) Constante — opération élémentaire | O(log n) Logarithmique — recherche dichotomique | O(n) Linéaire — recherche linéaire | O(n log n) Linéarithmique — MergeSort, QuickSort | O(n²) Quadratique — tri par insertion/sélection | O(n³) Cubique — multiplication de matrices | O(nᵏ) Polynomial — famille générale | O(kⁿ) Exponentielle — coloration de graphe | O(n!) Factorielle — cycle hamiltonien. Les classes exponentielle et factorielle caractérisent les problèmes difficiles.
**name**: Problème d'optimisation
**definition**: Maximiser ou minimiser une fonction de coût (ou de gain). Ex. : plus court chemin, clique maximum.
**name**: Problème de décision
**definition**: Répondre oui/non. Ex. : n est-il premier ? Existe-t-il un chemin de coût < k ?
**name**: Classe P
**definition**: Problèmes de décision résolubles en temps polynomial déterministe. Ex. : recherche linéaire, dichotomique, ACPM, plus court chemin (Dijkstra).
**name**: Classe NP
**definition**: Problèmes dont toute solution candidate peut être VÉRIFIÉE (et non résolue) en temps polynomial déterministe (certificat + vérificateur). Ex. : somme d'un sous-ensemble, factorisation d'entiers. P ⊆ NP.
**name**: Classe NP-Complet
**definition**: Problèmes dans NP tels que tout problème NP se réduit à eux en temps polynomial (réduction polynomiale). Ex. : SAT, voyageur de commerce, 21 problèmes de Karp.
**name**: Classe NP-Hard
**definition**: Problèmes au moins aussi difficiles que les NP-Complets, mais pas nécessairement dans NP (pas forcément vérifiables en temps polynomial). Ex. : problème de l'arrêt (Halting), K-means, coloration de graphe.
**name**: Formules de sommes utiles
**definition**: Σᵢ₌₀ⁿ i = n(n+1)/2 | Σᵢ₌₀ⁿ i² = n(n+1)(2n+1)/6 | Σᵢ₌₀ⁿ 2ⁱ = 2ⁿ⁺¹ − 1 | Σᵢ₌₁ⁿ log_b(xᵢ) = log_b(∏xᵢ). Formes générales avec borne inférieure k disponibles dans le cours.
**name**: Méthodes de résolution selon classe
**definition**: Problème polynomial → résolution exacte rapide (Simplex, gradient). Problème NP-Complet/NP-Hard non pratique en taille → heuristiques (construction, recherche locale, décomposition), méta-heuristiques (Tabou, Recuit Simulé, ACO, PSO, Génétiques), méthodes exactes exponentielles (Branch & Bound, Branch & Cut, Prog. Dynamique), IA (RL, Supervised, Unsupervised, Transfer Learning).

## Constraints

- Toujours exprimer O(f(n)) avec le plus petit f possible — T(n)=n est O(n), pas O(n²), même si les deux sont formellement vrais.
- La complexité temporelle s'analyse par défaut dans le pire cas sauf mention explicite.
- Règles de calcul de T(n) : séquence → addition ; branchement conditionnel → max ; boucle → somme des T(n)ᵢ ; récursion → récurrence à résoudre (méthode de l'arbre d'appel ou maître).
- Preuve NP : montrer que toute solution se VÉRIFIE en temps polynomial.
- Preuve NP-Complet : (1) prouver ∈ NP + (2) réduction polynomiale depuis un problème NP-Complet connu.
- Preuve NP-Hard : réduction polynomiale depuis un problème NP-Hard connu (pas besoin de preuve NP).
- Un problème NP-Hard n'est pas nécessairement dans NP (peut être non vérifiable en temps polynomial).

## Examples

**label**: Puissance récursive
**detail**: Puissance(a, n) : T(0)=1, T(n)=T(n−1)+cst → T(n)=n → O(n). Chaque étape ajoute une multiplication.
**label**: Exponentiation rapide
**detail**: Exponentiation_Rapide(a, n) : T(n paire)=T(n/2)+cst, T(n impaire)=T((n−1)/2)+2cst → l'exposant est divisé par 2 à chaque itération → T(n)=log₂(n) → O(log n).
**label**: Tri Fusion (MergeSort)
**detail**: Tri_Fusion(tableau, n) : T(1)=cst, T(n)=2T(n/2)+n. Résolution par arbre d'appel : à chaque niveau k la fusion coûte n au total, la hauteur de l'arbre est log₂(n) → T(n)=n·log₂(n) → O(n log n).
**label**: Preuve NP-Complet : Voyageur de commerce
**detail**: (1) Vérifier en temps polynomial qu'un circuit donné visite tous les sommets et a un coût ≤ k (∈ NP). (2) Réduire depuis Hamiltonien (NP-Complet connu) → NP-Complet.
**label**: NP-Hard sans preuve NP : Halting Problem
**detail**: Décider si un programme s'arrête est NP-Hard mais pas dans NP (non vérifiable en temps polynomial en général).

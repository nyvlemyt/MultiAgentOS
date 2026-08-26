---
id: resource-s5-structure-de-donnees-lab-3-stack-exercises-pdf-016a26d5
slug: resource-s5-structure-de-donnees-lab-3-stack-exercises-pdf-016a26d5
source_key: 'sha256:016a26d58d7c9197c40ca9f72cf05786c8f5851229766fbdd451db46e74a4de2'
part_of: S5 - Structure de données
order: 3
manifest: null
derived_from: 'sha256:016a26d58d7c9197c40ca9f72cf05786c8f5851229766fbdd451db46e74a4de2'
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
  - stack
  - data-structures
  - C
  - algorithms
  - parentheses
  - infix
  - postfix
  - expression-parsing
domain: computer-science
---
# S5 - Structure de données — Lab 3 Stack Exercises.pdf

## Goal

Appliquer les piles (stacks) pour résoudre deux problèmes classiques : vérification d'expressions parenthésées et évaluation d'expressions arithmétiques via la notation postfixe.

## Prerequisites

- Connaître la structure de données pile (push/pop/peek) et son implémentation en C
- Comprendre la notation infixe des expressions arithmétiques
- Bases du langage C (chaînes de caractères, boucles, fonctions)

## Steps

**title**: Ex 1.1 — Vérifier l'équilibre des parenthèses simples ()
**detail**: Parcourir l'expression caractère par caractère. Empiler chaque '(' rencontré. À chaque ')' : si la pile est vide → violation de la condition 2 (parenthèse fermante sans ouvrante). Sinon dépiler. Après le dernier caractère, si la pile n'est pas vide → violation de la condition 1 (trop de '('). Exemple : '7 - (( x * ((x + y)) / (j-3) +y) / (4 – 2.5))' doit laisser la pile vide à la fin.
**title**: Ex 1.2 — Généraliser aux trois types de délimiteurs () [] {}
**detail**: Même algorithme, mais empiler le caractère ouvrant réel ('(', '[', '{'). À chaque fermant (')' ']' '}') : vérifier que le sommet de pile est le délimiteur ouvrant correspondant. Si non → erreur de type (ex : '[' en attente mais ')' reçu). Exemple valide : '7 - { [ x * [ ( x + y) / (j – 3) ] + y ] / (4 – 2.5) }'.
**title**: Ex 2.1 — Convertir une expression infixe en postfixe (algorithme Shunting-yard)
**detail**: Parcourir l'expression token par token. Règles : (a) opérande → écrire directement en sortie ; (b) opérateur → dépiler vers la sortie tout opérateur de la pile de priorité ≥ à l'opérateur courant, puis empiler l'opérateur courant ; (c) '(' → empiler ; (d) ')' → dépiler vers la sortie jusqu'à trouver '(', jeter la parenthèse. En fin de parcours, vider la pile vers la sortie. Résultat : '((a + b) * (c – (d -e))) / (f+g)' → 'ab+ cde--* fg+/'.
**title**: Ex 2.2 — Évaluer l'expression postfixe
**detail**: Parcourir l'expression postfixe token par token. Règles : (a) opérande → empiler sa valeur numérique ; (b) opérateur → dépiler deux opérandes (d'abord le droit, puis le gauche), appliquer l'opérateur, empiler le résultat. À la fin, le sommet de pile contient le résultat final. L'avantage clé : aucune parenthèse ni règle de priorité à gérer à l'évaluation.

## Result

À l'issue des quatre exercices, on dispose de quatre fonctions C indépendantes illustrant deux usages fondamentaux des piles : (1) validation de structure syntaxique et (2) évaluation d'expressions arithmétiques sans parenthèses. Ces patterns réapparaissent dans les compilateurs, les interpréteurs et les calculatrices.

## Next

- Implémenter la gestion des opérateurs unaires (négation) dans la conversion infixe→postfixe
- Étendre à des expressions avec variables et table de symboles
- Explorer les files (queues) et les arbres d'expression comme structures alternatives
- Étudier l'algorithme de Dijkstra complet (Shunting-yard) avec gestion de la précédence et de l'associativité

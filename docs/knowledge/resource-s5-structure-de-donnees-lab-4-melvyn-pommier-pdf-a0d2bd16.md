---
id: resource-s5-structure-de-donnees-lab-4-melvyn-pommier-pdf-a0d2bd16
slug: resource-s5-structure-de-donnees-lab-4-melvyn-pommier-pdf-a0d2bd16
source_key: 'sha256:a0d2bd164ddd75bbdc5b9f6d5536c70a81f66e2a8523837431627f5831c50fd7'
part_of: S5 - Structure de données
order: 4
manifest: null
derived_from: 'sha256:a0d2bd164ddd75bbdc5b9f6d5536c70a81f66e2a8523837431627f5831c50fd7'
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
  - recursion
  - algorithms
  - data-structures
  - python
  - CS-fundamentals
domain: computer-science
---
# S5 - Structure de données — Lab 4 Melvyn Pommier.pdf

## Summary

Lab 4 du cours S5 Structure de données : quatre exercices de récursivité progressifs. Chaque exercice illustre un patron récursif fondamental avec ses cas de base, ses appels récursifs et ses justifications d'implémentation.

## Fields/API

**exercice_1_multiplication_recursive**: **énoncé**: Multiplier deux entiers sans l'opérateur `*`.
**cas_de_base**: b == 0 → retourner 0.
**logique**: Si b > 0 : additionner a récursivement b fois. Si b < 0 : résoudre pour -b puis inverser le signe du résultat.
**exercice_2_affichage_1_a_30**: **énoncé**: Afficher les entiers de 1 à 30 en ordre croissant avec une fonction récursive.
**cas_de_base**: current > end → arrêter.
**logique**: Afficher current, puis appeler récursivement avec current+1. Paramètres : current (départ) et end (limite) → réutilisable pour toute plage.
**exercice_3_tours_de_hanoi**: **énoncé**: Afficher les mouvements pour résoudre les Tours de Hanoï à n disques.
**règles**: - Un seul disque déplacé à la fois.
- Aucun disque sur un disque plus petit.
- Trois poteaux : from_peg, to_peg, aux_peg.
**cas_de_base**: n == 1 → déplacer directement from_peg → to_peg.
**étapes_récursives**: - 1. Déplacer n-1 disques de from_peg vers aux_peg.
- 2. Déplacer le disque le plus grand de from_peg vers to_peg.
- 3. Déplacer n-1 disques de aux_peg vers to_peg.
**exemple**: towers_of_hanoi(3, 'A', 'C', 'B') produit 7 mouvements.
**note**: Les poteaux changent de rôle à chaque niveau de récursion.
**exercice_4_validation_expression_algebrique**: **énoncé**: Vérifier récursivement si une chaîne est une expression algébrique valide.
**grammaire**: **expr**: term | term '+' term
**term**: factor | factor '*' factor
**factor**: lettre | '(' expr ')'
**implémentation**: **fonctions**: - expr()
- term()
- factor()
**index_pos**: Suit la position courante dans la chaîne ; retourne -1 en cas d'échec de règle.
**parenthèses**: Ouvrante → appel récursif à expr() pour valider le contenu ; fermante obligatoire pour poursuivre.

## Constraints

- Toute multiplication par 0 doit retourner 0 (cas de base exercice 1).
- La boucle d'affichage doit s'arrêter dès que current > end pour éviter une récursion infinie.
- Les Tours de Hanoï requièrent exactement 2^n − 1 mouvements pour n disques.
- L'index pos ne doit jamais dépasser len(chaîne) ; retourner -1 signale une règle non satisfaite.

## Examples

- multiply(4, -3) → -12 (cas négatif : résoudre multiply(4,3)=12 puis inverser)
- display(1, 30) → affiche 1 2 3 … 30
- towers_of_hanoi(3, 'A', 'C', 'B') → 7 lignes de mouvements A→C, A→B, C→B, …
- is_valid_expr('A+B*C') → True ; is_valid_expr('A++B') → False

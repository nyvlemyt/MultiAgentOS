---
id: >-
  resource-s7-convex-optimisation-controle-blanc-convex-optimization-pdf-8ae7306e
slug: >-
  resource-s7-convex-optimisation-controle-blanc-convex-optimization-pdf-8ae7306e
source_key: 'sha256:8ae7306ee68960f89616a290d3a76804b0584c78f4e5d97aeadee77f367b7879'
part_of: resource-s7-convex-optimisation-b4dcec0f
order: 2
manifest: null
derived_from: 'sha256:8ae7306ee68960f89616a290d3a76804b0584c78f4e5d97aeadee77f367b7879'
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
  - convex-optimization
  - linear-programming
  - simplex
  - gradient-descent
  - newton-method
  - convexity
  - exam
  - s7
domain: mathematics
---
# S7 - convex optimisation — Controle blanc - Convex Optimization.pdf

## Summary

Contrôle blanc de 2h30 sur l'optimisation convexe (barème 40 pts, sans document). Couvre 7 exercices : définitions fondamentales, analyse de convexité, modélisation et résolution d'un programme linéaire (graphique + simplexe), simplexe à 3 variables, descente de gradient sur f(x,y)=x²+4y², méthode de Newton, et méthode de pénalité.

## Fields/API

**name**: Exercice 1 — Questions de cours (8 pts)
**description**: Définitions : fonction objectif, ensemble admissible, solution admissible/optimale ; ensemble convexe et fonction convexe (définition par la corde) ; propriété 'en or' des fonctions convexes (tout minimum local est global) ; programme linéaire comme cas particulier convexe (objectif linéaire ⊂ convexe, polyèdre admissible convexe) ; rôle du pas α en descente de gradient (trop petit = convergence lente, trop grand = divergence/oscillation) ; 3 critères d'arrêt (‖∇f‖ < ε, |f(x⁺)−f(x)| < ε, nb max itérations) ; Newton utilise la Hessienne (convergence quadratique, mais coût O(n³)/itération) ; SGD = gradient sur mini-batch, utilisé en ML grande échelle.
**name**: Exercice 2 — Convexité (8 pts)
**description**: Partie A (4 pts) — classification de 8 fonctions : (1) f=3x−5 : convexe ET concave (affine) ; (2) f=eˣ : convexe (f''=eˣ>0) ; (3) f=x³ : ni l'un ni l'autre (f''=6x change de signe) ; (4) f=ln x : concave (f''=−1/x²<0) ; (5) f=(x⁴+2x²)/(x²+3… à compléter selon la forme exacte) ; (6) f(x,y)=x²/2+3y²+2x : convexe (Hessienne ≻ 0) ; (7) f=|x−2| : convexe (valeur absolue de fonction affine) ; (8) f=x·ln x : convexe (f''=1/x>0). Partie B (4 pts) — preuves : (1) hyperplan {x∈ℝⁿ : aᵀx=b} est convexe (combinaison convexe satisfait l'égalité) ; (2) somme f+g de deux fonctions convexes est convexe (par additivité de l'inégalité de corde).
**name**: Exercice 3 — Modélisation et résolution complète (10 pts)
**description**: Usine P1/P2, 3 ateliers (A:4h, B:12h, C:18h), profits 3k€ et 5k€. (1) Variables x₁,x₂≥0 ; max 3x₁+5x₂ s.c. x₁≤4, 2x₂≤12, 3x₁+2x₂≤18. (2) Forme canonique : c=[-3,-5]ᵀ (min −obj), A et b définis par les 3 contraintes. (3) Forme standard : ajout de variables d'écart s₁,s₂,s₃. (4) Résolution graphique : sommets (0,0),(4,0),(4,3),(2,6),(0,6) — optimum en (2,6) : profit=3·2+5·6=36k€. (5) Vérification par tableau du simplexe.
**name**: Exercice 4 — Simplexe 3 variables (6 pts)
**description**: max 5x₁+5x₂+3x₃ s.c. 4x₁+3x₂−2x₃≤30, x₁−3x₂+2x₃≤15, 3x₁+6x₂+x₃≤60, x₁,x₂,x₃≥0. Résolution complète par tableau du simplexe (TD2 exercice 4).
**name**: Exercice 5 — Descente de gradient (5 pts)
**description**: f(x,y)=x²+4y². (1) ∇f=(2x, 8y). (2) Depuis x⁽⁰⁾=(2,1), α=1/10 : x⁽¹⁾=(2−0.4, 1−0.8)=(1.6, 0.2) ; x⁽²⁾=(1.6−0.32, 0.2−0.16)=(1.28, 0.04). (3) Convergence vers (0,0) : ∇f=0 ssi x=y=0, minimum global car f convexe. (4) Bonus α=1/4 : y⁽¹⁾=1−2·1=−1, y⁽²⁾=−1+2=1 → oscillations perpétuelles. Illustre la divergence/oscillation pour α trop grand (α > 1/(2L) où L=8 ici).
**name**: Exercice 6 — Méthode de Newton (3 pts)
**description**: f(x)=x²−6x+11. (1) Itération Newton : x⁺=x−f'(x)/f''(x). (2) Depuis x⁽⁰⁾=0 : f'(0)=−6, f''(0)=2 → x⁽¹⁾=0−(−6/2)=3. Convergence en 1 itération car f est quadratique (Newton exact sur les quadratiques). (3) Dimension n : x⁺=x−[∇²f(x)]⁻¹∇f(x).
**name**: Exercice 7 — Méthode de pénalité (2 pts)
**description**: min (x−3)² s.c. x≤1. (1) Une fonction de pénalité P doit satisfaire : P(x)=0 si x admissible, P(x)>0 sinon, P continue. (2) Pénalité valide : P(x)=max(0, x−1)² ; problème pénalisé : min (x−3)²+μ·max(0,x−1)² pour μ>0.

## Constraints

- Durée : 2h30
- Calculatrice autorisée, documents interdits
- Barème total : 40 points
- Toutes les réponses doivent être justifiées
- Tableaux du simplexe à rédiger complets

## Examples

- Exercice 3 optimum : x₁=2, x₂=6, profit=36k€ (vérifié graphiquement et par simplexe)
- Exercice 5 bonus : α=1/4 produit des oscillations sur y car α > 1/(2·Lmax) avec Lmax=8
- Exercice 6 : Newton converge en 1 itération depuis x⁽⁰⁾=0 vers x*=3 (f quadratique)

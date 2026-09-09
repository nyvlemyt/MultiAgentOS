---
id: resource-s7-convex-optimisation-cours-complet-convex-optimization-pdf-aa37251f
slug: resource-s7-convex-optimisation-cours-complet-convex-optimization-pdf-aa37251f
source_key: 'sha256:aa37251f0e33628578053bcac46464687b231006f2940760def1fc53b4572e56'
part_of: resource-s7-convex-optimisation-b4dcec0f
order: 9
manifest: null
derived_from: 'sha256:aa37251f0e33628578053bcac46464687b231006f2940760def1fc53b4572e56'
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
  - convexité
  - programmation-linéaire
  - simplexe
  - descente-de-gradient
  - Newton
  - mathématiques
  - S7
domain: mathématiques appliquées
---
# S7 - convex optimisation — Cours complet - Convex Optimization.pdf

## Summary

Cours complet d'optimisation convexe en trois chapitres : (1) fondements — formulation d'un problème, ensembles et fonctions convexes, résultat central (minimum local = global) ; (2) programmation linéaire — formes canonique/standard, géométrie polytopale, algorithme du simplexe pas à pas ; (3) optimisation sans contrainte — gradient, descente de gradient (pas, critères d'arrêt, variantes SGD/steepest), méthode de Newton (Hessienne, convergence quadratique), méthodes de pénalité pour ramener un problème contraint au cas sans contrainte. Inclut annexes : dérivées utiles, glossaire FR↔EN, checklist anti-pièges.

## Fields/API

**name**: Problème d'optimisation (forme générale)
**value**: min f(x) s.c. gᵢ(x) ≤ bᵢ, i=1…m, x∈ℝⁿ. Vocabulaire : fonction objectif, variables, contraintes, ensemble admissible 𝒟, solution admissible, solution optimale x*. max f = −min(−f).
**name**: Méthode de modélisation [exam]
**value**: 3 questions dans l'ordre : (1) Quelles quantités cherche-t-on ? → variables (les définir explicitement). (2) Que veut-on optimiser ? → fonction objectif + sens (min/max). (3) Quelles limites ? → contraintes, y compris positivité (xᵢ ≥ 0 souvent oubliée).
**name**: Ensemble convexe — définition
**value**: C ⊆ ℝⁿ convexe ⟺ ∀x,y∈C, ∀λ∈[0,1] : λx+(1−λ)y ∈ C. Intuition : ni creux, ni trou, ni bosse rentrante. Propriétés à démontrer : demi-espace {x : a⊤x ≤ b} est convexe ; intersection d'ensembles convexes est convexe.
**name**: Fonction convexe — 4 caractérisations
**value**: (1) Corde [exam] : f(λx+(1−λ)y) ≤ λf(x)+(1−λ)f(y). (2) Épigraphe : f convexe ⟺ epi(f) ensemble convexe. (3) Dérivée seconde [exam] : f″(x) ≥ 0 partout (1D) ; Hessienne H semi-définie positive (nD). (4) Midpoint : f((x+y)/2) ≤ (f(x)+f(y))/2 + continuité ⟹ convexe.
**name**: Quel critère de convexité utiliser ? [exam]
**value**: Linéaire/affine → convexe et concave directement. 1 variable dérivable → signe de f″. Plusieurs variables → Hessienne ou décomposition en somme de convexes. Non dérivable (|x|, max…) → définition par la corde.
**name**: Résultat central
**value**: Tout minimum local d'une fonction convexe est un minimum global. Un problème convexe = objectif convexe + ensemble admissible convexe (les deux conditions sont nécessaires).
**name**: Squelette des preuves de convexité [exam]
**value**: Toujours : «Soient x, y et λ∈[0,1]…» puis transformer le membre gauche vers le droit. 4 familles : (1) Égalité directe (fonctions linéaires). (2) Inégalité triangulaire (|x|). (3) D−G ≥ 0 après développement (x²). (4) Majorer un max (max(0,x)).
**name**: Programme linéaire — définition et formes
**value**: Objectif + contraintes toutes linéaires ⟹ problème convexe (fonction linéaire convexe ; contrainte a⊤x ≤ b = demi-espace convexe). Forme canonique : max c⊤x s.c. Ax ≤ b, x ≥ 0. Forme standard : chaque inégalité → égalité via variable d'écart sᵢ ≥ 0 (slack). Écart nul = contrainte saturée.
**name**: Géométrie du PL
**value**: Ensemble admissible = polytope convexe. Théorème clé : si l'objectif a un maximum, il est atteint sur (au moins) un sommet. Résolution graphique (2D) : tracer contraintes, identifier région admissible, faire glisser droites de niveau dans le sens de l'objectif, lire le dernier contact.
**name**: Algorithme du simplexe [exam!!] — recette
**value**: (1) Passer en forme standard (ajouter variables d'écart). (2) Tableau initial (origine, z=0). (3) Variable entrante = plus grand coefficient strictement positif de la ligne z. Pas de positif → STOP. (4) Variable sortante = ligne du plus petit ratio b/coeff (sur coeff > 0 uniquement). (5) Pivotage (Gauss) sur toutes les lignes y compris z. (6) Répéter. (7) Lecture : variable en base = valeur b ; hors base = 0 ; case b de la ligne z = −z*.
**name**: Pièges simplexe
**value**: Entrante = plus grand coeff positif de z (pas en valeur absolue). Ratios sur coefficients > 0 uniquement. Pivoter aussi la ligne z. En cas d'égalité de candidats : prendre le premier. Vérifier la solution finale dans les contraintes d'origine.
**name**: Gradient
**value**: ∇f(x) = (∂f/∂x₁, …, ∂f/∂xₙ). Pointe dans la direction de plus forte montée. Condition d'optimalité (f convexe) : ∇f(x*) = 0 ⟺ x* minimum global (mentionner la convexité pour la réciproque).
**name**: Descente de gradient [exam!!]
**value**: x^(k+1) = x^(k) − α∇f(x^(k)). Critères d'arrêt : ‖∇f‖ < seuil ; nb max d'itérations ; variation négligeable. Rôle du pas α : trop petit → convergence lente ; adapté → rapide ; trop grand → oscillation/divergence. Piège : réévaluer le gradient au nouveau point à chaque itération.
**name**: Variantes descente de gradient
**value**: Steepest descent : pas optimal αₖ recalculé à chaque itération (mini-problème 1D) ; déplacements successifs orthogonaux. SGD : gradient approché sur un seul exemple (ou mini-batch) ; utile quand n est grand (ML). Non-convexe : méthodes applicables mais plus de garantie globale.
**name**: Méthode de Newton [exam]
**value**: x^(k+1) = x^(k) − H_f(x^(k))⁻¹ ∇f(x^(k)). En 1D : x^(k+1) = x^(k) − f′/f″ (pas f/f′ !) . En pratique : résoudre Hd = ∇f plutôt qu'inverser H. Convergence quadratique (moins d'itérations) mais chaque itération plus coûteuse. Si f quadratique : converge en 1 itération.
**name**: Méthodes de pénalité
**value**: Transformer min f(x) s.c. gᵢ(x) ≤ bᵢ en min f(x) + P(x). Conditions sur P [exam] : (1) continue (idéalement convexe et diff.) ; (2) P(x) ≥ 0 ; (3) P(x) = 0 ⟺ x admissible. Exemple : P(x) = Σ (max(0, gᵢ(x)−bᵢ))². Le carré rend le raccord différentiable (compatible descente de gradient).
**name**: Checklist anti-pièges (annexe C)
**value**: • Convexe = courbure (bol), pas le sens de variation. • Linéaire = convexe ET concave. • Non dérivable ≠ non convexe. • Modélisation : définir variables, penser positivité, écrire ≤. • Simplexe : voir champ dédié. • Gradient : réévaluer à chaque itération. • Newton : f′/f″ (pas f/f′). • ∇f=0 ⟺ min global : vrai parce que f est convexe.
**name**: Glossaire FR ↔ EN (annexe B)
**value**: ensemble admissible = feasible set ; solution admissible = feasible solution ; variable d'écart = slack variable ; pas = step size / learning rate ; droite de niveau = level line ; en base / hors base = in base / out of base.

## Constraints

- Les passages marqués [exam] ou [exam!!] sont directement testés en exercice — priorité de révision.
- Un problème convexe requiert objectif convexe ET ensemble admissible convexe.
- Newton minimisation : la formule est x − f′/f″, jamais x − f/f′ (qui cherche un zéro de f, pas un minimum).
- Ratios du simplexe : uniquement sur les coefficients strictement positifs de la colonne entrante.
- La ligne z subit le pivotage comme toutes les autres lignes du tableau.
- ∇f(x*) = 0 ⟺ minimum global est valable parce que f est convexe — toujours le mentionner explicitement.
- Descente de gradient : réévaluer ∇f au point courant à chaque itération (le gradient est une fonction, pas une constante).

## Examples

- Modélisation — confiseur (TD1) : max 6x₁+7x₂ s.c. 2x₁ ≤ 400, 3x₁+2x₂ ≤ 900, x₁+4x₂ ≤ 700, x₁,x₂ ≥ 0.
- Convexité — tableau d'exemples : 7x et 2y−3x → linéaires (convexes+concaves) ; sin x → ni l'un ni l'autre (f″ change de signe) ; |x| → convexe (corde + inégalité triangulaire) ; −x ln x → concave (f″ = −1/x < 0 sur x>0) ; x²+y² → convexe (somme de convexes ou Hessienne = I).
- Simplexe complet : départ (0,0), z=0 → sommet (10/3, 0), z=20 → sommet (3,1), z*=21 (x₁*=3, x₂*=1, x₄=2 ressource restante).
- Descente de gradient (TD3) : f(x,y,z)=x²+2y²+3z², x⁽⁰⁾=(1,1,1), α=1/10 → x⁽¹⁾=(0.8, 0.6, 0.4) → x⁽²⁾=(0.64, 0.36, 0.16).
- Newton sur f(x)=x²−6x+11 : x⁽⁰⁾=0, f′=2x−6, f″=2 → x⁽¹⁾=0−(−6)/2=3, f′(3)=0. Convergence en 1 itération (f quadratique).
- Pénalité : P(x) = Σ (max(0, gᵢ(x)−bᵢ))² — nul si admissible, quadratiquement croissant si violation, différentiable.

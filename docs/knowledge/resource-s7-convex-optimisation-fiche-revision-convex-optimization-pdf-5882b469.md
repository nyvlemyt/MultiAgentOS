---
id: >-
  resource-s7-convex-optimisation-fiche-revision-convex-optimization-pdf-5882b469
slug: >-
  resource-s7-convex-optimisation-fiche-revision-convex-optimization-pdf-5882b469
source_key: 'sha256:5882b4692a44d171bd7ba43b66a73a26d9b6c02d21d9c8cbe4794c39b3becb16'
part_of: resource-s7-convex-optimisation-b4dcec0f
order: 10
manifest: null
derived_from: 'sha256:5882b4692a44d171bd7ba43b66a73a26d9b6c02d21d9c8cbe4794c39b3becb16'
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
  - penalty-methods
  - optimization
domain: mathematics / optimization
---
# S7 - convex optimisation — Fiche revision - Convex Optimization.pdf

## Summary

Fiche de révision complète sur l'optimisation convexe : vocabulaire de modélisation, caractérisations de la convexité (ensemble, fonction, Hessienne, corde), programmation linéaire (forme canonique/standard, algorithme du simplexe), et méthodes d'optimisation sans contrainte (descente de gradient, méthode de Newton, pénalité). Couvre les pièges d'examen et une checklist anti-erreurs.

## Fields/API

**1_vocabulaire**: **description**: Blocs de base d'un problème d'optimisation
**entries**: **fonction_objectif_f**: Ce qu'on minimise ou maximise (fonction de coût si min).
**ensemble_admissible_D**: Ensemble des points satisfaisant toutes les contraintes.
**solution_admissible**: Un point x ∈ D.
**solution_optimale_x***: Solution admissible qui optimise f.
**modelisation_3_questions**: 1. Quelles quantités cherche-t-on ? → variables x₁…xₙ (définir explicitement). 2. Que veut-on optimiser ? → objectif (min ou max). 3. Quelles limites ? → contraintes (utiliser ≤, ne pas oublier xᵢ ≥ 0).
**2_convexite**: **ensemble_convexe**: C convexe ⟺ ∀x,y ∈ C, ∀λ ∈ [0,1] : λx+(1−λ)y ∈ C (tout segment reste dans C).
**fonction_convexe**: Forme un bol — la corde entre deux points du graphe est AU-DESSUS (pas lié à 'monter'). Concave = dôme.
**quatre_caracterisations**: **f_lineaire**: Convexe ET concave simultanement.
**1_variable_2x_derivable**: f″ ≥ 0 → convexe ; f″ ≤ 0 → concave ; signe variable → ni l'un ni l'autre.
**plusieurs_variables**: Hessienne semi-définie positive (diagonale : tous coeffs ≥ 0), ou somme de fonctions convexes.
**non_derivable**: Définition par la corde : f(λx+(1−λ)y) ≤ λf(x)+(1−λ)f(y).
**resultats_cles**: - Problème convexe = objectif convexe + ensemble admissible convexe.
- Gold property : minimum local ⟹ minimum global (pour f convexe).
- Somme de fonctions convexes = convexe.
- Demi-espace {x : aᵀx ≤ b} est convexe (preuve par combinaison convexe).
- Intersection de convexes est convexe → ensemble admissible d'un PL est convexe.
- Épigraphe convexe ⟺ f convexe ; f concave ⟺ −f convexe.
**3_programmation_lineaire**: **forme_canonique**: max cᵀx  s.c.  Ax ≤ b,  x ≥ 0.
**forme_standard**: Inégalités → égalités en ajoutant une variable d'écart ≥ 0 par contrainte. Ex : 2x₁+x₂ ≤ 7 → 2x₁+x₂+x₃ = 7, x₃ ≥ 0.
**geometrie**: Ensemble admissible = polytope convexe. L'optimum (s'il existe) est atteint sur un sommet.
**algorithme_simplexe_etapes**: - 1. Écrire la forme standard.
- 2. Tableau initial : variables d'écart en base (une par ligne), originales hors base (= 0). Ligne z = coefficients de l'objectif.
- 3. Entrante = colonne du plus grand coefficient positif de la ligne z. Si aucun → STOP, optimum atteint.
- 4. Sortante = ligne du plus petit ratio b/coeff (seulement coeffs > 0 de la colonne entrante).
- 5. Pivotage (Gauss) : ligne pivot ÷ pivot, puis annuler le reste de la colonne (Lᵢ ← Lᵢ − aᵢ·Lpivot, y compris ligne z).
- 6. Retour en 3.
- 7. Lecture : variables en base = leur valeur dans b ; hors base = 0 ; case b de la ligne z affiche −z*.
**4_optimisation_sans_contrainte**: **gradient**: ∇f = (∂f/∂x₁, …, ∂f/∂xₙ) — pointe vers la plus forte montée. Condition 1er ordre (f convexe) : ∇f(x*) = 0 ⟺ minimum global.
**descente_de_gradient**: **formule**: x⁽ᵏ⁺¹⁾ = x⁽ᵏ⁾ − α·∇f(x⁽ᵏ⁾)
**etapes**: 1. Calculer la formule générale de ∇f (une fois). 2. L'évaluer au point courant (RE-évaluer à chaque itération — piège majeur). 3. Mettre à jour : point − α × vecteur gradient.
**arret**: ‖∇f‖ < seuil, ou nb max d'itérations, ou évolution trop lente.
**pas_alpha**: Petit = précis mais lent ; grand = rapide mais imprécis, voire divergent.
**variantes**: **steepest_descent**: α optimal recalculé à chaque itération (mini-problème 1D). Deux déplacements successifs orthogonaux.
**SGD**: En ML, f = (1/n)Σfᵢ ; gradient approché sur un exemple ou mini-batch → moins cher.
**non_convexe**: Fonctionne mais minimum local ≠ forcément global.
**methode_de_newton**: **principe**: Minimiser = annuler le gradient. Newton trouve un zéro en approximant par la tangente (Taylor ordre 1).
**formule_1D**: x⁽ᵏ⁺¹⁾ = x⁽ᵏ⁾ − f′(x⁽ᵏ⁾) / f″(x⁽ᵏ⁾)
**formule_nD**: x⁽ᵏ⁺¹⁾ = x⁽ᵏ⁾ − H_f(x⁽ᵏ⁾)⁻¹ · ∇f(x⁽ᵏ⁾)
**avantage**: Approximation quadratique → moins d'itérations que gradient.
**inconvenient**: Chaque itération coûte cher (inversion de matrice, via système linéaire).
**methodes_de_penalite**: **principe**: Transformer min f(x) s.c. gᵢ(x) ≤ bᵢ en min [f(x) + P(x)] sans contrainte.
**conditions_sur_P**: 1. Continue (convexe différentiable = idéal). 2. P(x) ≥ 0 partout. 3. P(x) = 0 ⟺ x admissible.
**exemple_type**: P(x) = Σ (max(0, gᵢ(x)−bᵢ))². Résoudre ensuite par descente de gradient ou Newton.
**5_derivees_utiles**: **(xⁿ)′**: nxⁿ⁻¹
**(ln x)′**: 1/x
**(eˣ)′**: eˣ
**(uv)′**: u′v + uv′

## Constraints

- Convexe = bol (courbure), pas 'ça monte'. e⁻ˣ descend et est convexe.
- Linéaire = convexe ET concave simultanément.
- |x| est convexe partout ; non-dérivabilité en 0 → utiliser la définition par la corde.
- Modélisation : définir explicitement les variables, ne pas oublier xᵢ ≥ 0 et utiliser ≤ (jamais <).
- Simplexe entrante : plus grand coefficient POSITIF de la ligne z uniquement.
- Simplexe sortante : ratios b/coeff sur coeffs STRICTEMENT POSITIFS de la colonne entrante uniquement.
- Simplexe : ne pas oublier de pivoter la ligne z ; lecture finale : hors base = 0, b de la ligne z = −z*.
- Descente de gradient : ré-évaluer ∇f au nouveau point à CHAQUE itération (piège classique).
- ∇f = 0 ⟺ minimum global UNIQUEMENT parce que f est convexe.

## Examples

**label**: Convexité — table des fonctions types
**cases**: **f**: 7x, 2y−3x
**verdict**: Convexe ET concave
**raison**: Linéaire
**f**: sin x
**verdict**: Ni l'un ni l'autre
**raison**: f″ = −sin x change de signe
**f**: |x|
**verdict**: Convexe
**raison**: Corde (inégalité triangulaire), non dérivable en 0
**f**: x·log(1/x) = −x·ln x
**verdict**: Concave
**raison**: f″ = −1/x < 0 sur x > 0
**f**: x² + y²
**verdict**: Convexe
**raison**: Somme de convexes / Hessienne = I₂
**label**: Simplexe — exemple complet (cours)
**problem**: max 6x₁+3x₂  s.c.  2x₁+x₂ ≤ 7,  2x₁+3x₂ ≤ 11,  3x₁+x₂ ≤ 10,  x ≥ 0
**iterations**: 2
**solution**: x₁* = 3, x₂* = 1, z* = 21 (aucun coeff positif restant dans la ligne z)
**label**: Descente de gradient — exemple complet (TD3)
**problem**: f(x,y,z) = x²+2y²+3z², x⁰ = (1,1,1), α = 0.1
**gradient**: ∇f = (2x, 4y, 6z)
**it1**: ∇f(1,1,1) = (2,4,6) → x⁽¹⁾ = (0.8, 0.6, 0.4)
**it2**: ∇f(x⁽¹⁾) = (1.6, 2.4, 2.4) → x⁽²⁾ = (0.64, 0.36, 0.16)
**sanity**: On se rapproche du minimum (0,0,0) sans changement de signe — cohérent avec une fonction bol.
**label**: Méthode de Newton — 1D
**problem**: f(x) = x²−4x+5, f′(x) = 2x−4, f″(x) = 2, x⁰ = 0
**it1**: x⁽¹⁾ = 0 − (−4)/2 = 2, f′(2) = 0 → minimum trouvé en une itération
**note**: Normal : f quadratique, l'approximation quadratique de Newton est exacte.

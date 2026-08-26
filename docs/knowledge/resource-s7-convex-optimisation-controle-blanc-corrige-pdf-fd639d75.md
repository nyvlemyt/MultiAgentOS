---
id: resource-s7-convex-optimisation-controle-blanc-corrige-pdf-fd639d75
slug: resource-s7-convex-optimisation-controle-blanc-corrige-pdf-fd639d75
source_key: 'sha256:fd639d7548dfc62c1c1125e847c5326c3ef5e0dcbd978f4fe432f90c63c41059'
part_of: S7 - convex optimisation
order: 1
manifest: null
derived_from: 'sha256:fd639d7548dfc62c1c1125e847c5326c3ef5e0dcbd978f4fe432f90c63c41059'
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
  - penalty-method
  - exam-corrige
domain: mathématiques / recherche opérationnelle
---
# S7 - convex optimisation — Controle blanc - CORRIGE.pdf

## Summary

Corrigé détaillé d'un contrôle blanc sur l'optimisation convexe (niveau ingénieur). Couvre : définitions fondamentales (ensemble admissible, convexité, optimalité globale), classification de 8 fonctions usuelles, preuves de convexité (hyperplan, somme), modélisation et résolution complète d'un programme linéaire (forme canonique, standard, résolution graphique, simplexe 2 et 3 variables), descente de gradient (pas, critères d'arrêt, SGD, divergence), méthode de Newton (1D et nD), et méthode de pénalité.

## Fields/API

**fonction_objectif**: Fonction réelle à minimiser/maximiser ; appelée fonction de coût en minimisation.
**ensemble_admissible**: Ensemble D des points respectant toutes les contraintes. Solution admissible : x ∈ D. Solution optimale : solution admissible qui optimise f sur D.
**convexite_ensemble**: C convexe ssi ∀x,y ∈ C, ∀λ∈[0,1] : λx+(1−λ)y ∈ C (tout segment entre deux points reste dans C).
**convexite_fonction**: f convexe ssi ∀x,y, ∀λ∈[0,1] : f(λx+(1−λ)y) ≤ λf(x)+(1−λ)f(y) (la corde est au-dessus du graphe).
**propriete_min_local_global**: Tout minimum local d'une fonction convexe est un minimum global → un algorithme de descente ne peut pas rester piégé dans un creux sous-optimal.
**programme_lineaire**: Objectif linéaire + contraintes linéaires → convexe : (i) fonction linéaire est convexe ; (ii) intersection de demi-espaces (convexes) est convexe.
**forme_canonique**: max c⊤x  s.c. Ax ≤ b, x ≥ 0.
**forme_standard**: Ajout d'une variable d'écart par contrainte d'inégalité pour transformer ≤ en =.
**pas_gradient**: α contrôle l'amplitude du déplacement : trop petit → convergence lente ; trop grand → oscillations ou divergence.
**criteres_arret**: (i) ‖∇f‖ < ε choisi ; (ii) nombre max d'itérations atteint ; (iii) variation entre deux itérations successives inférieure à un seuil.
**newton_vs_gradient**: Newton utilise la Hessienne H (2e ordre) → convergence en moins d'itérations, mais coût par itération élevé (calcul + inversion de H, en pratique résolution du système linéaire H·d = ∇f).
**sgd**: Quand n est très grand, approximation du gradient sur un exemple (ou mini-batch) tiré aléatoirement à chaque itération.
**fonction_penalite**: P doit être (i) continue, (ii) positive P(x) ≥ 0, (iii) nulle exactement sur l'ensemble admissible P(x)=0 ⟺ x admissible.

## Constraints

**convexite_fonctions_usuelles**: - 3x−5 : convexe ET concave (affine — égalité dans la définition)
- e^x : convexe (f''=e^x > 0 partout)
- x³ : ni convexe ni concave (f''=6x change de signe en 0)
- ln x : concave (f''=−1/x² < 0 sur x>0)
- x⁴+2x² : convexe (f''=12x²+4 > 0 partout)
- x²+3y²+2x : convexe (Hessienne diag(2,6) semi-définie positive ; terme 2x disparaît à la dérivée seconde)
- |x−2| : convexe (non dérivable en 2 → preuve par inégalité triangulaire sur la corde)
- x·ln x : convexe (f''=1/x > 0 sur x>0 ; opposée de x·log(1/x) qui est concave)
**convexite_ensembles**: - Hyperplan {x : a⊤x=b} : convexe (preuve directe par linéarité : a⊤(λx+(1−λ)y) = λb+(1−λ)b = b)
- Somme de fonctions convexes : convexe ((f+g)(z) ≤ λ(f+g)(x)+(1−λ)(f+g)(y) par sommation des inégalités)
**simplexe_regles**: - Variable entrante : colonne avec le coefficient positif le plus élevé dans la ligne z.
- Variable sortante : ratio b/coeff avec minimum positif — sur les coefficients strictement positifs uniquement (coefficients négatifs ou nuls interdits au ratio).
- Égalité des coefficients d'entrée : convention — prendre la première variable.
- Pivot : élimination de Gauss-Jordan sur toutes les lignes y compris la ligne z.
- Optimum : plus aucun coefficient positif dans la ligne z.
**optimalite_premier_ordre**: ∇f(x*) = 0 ⟺ minimum global pour une fonction convexe différentiable.
**newton_1d**: x^(k+1) = x^(k) − f'(x^(k)) / f''(x^(k))  (recherche du zéro de f').
**newton_nd**: x^(k+1) = x^(k) − H_f(x^(k))^{−1} · ∇f(x^(k)),  résolu en pratique via H_f · d = ∇f.

## Examples

**ex3_programme_lineaire_2vars**: **probleme**: max 3x1+5x2  s.c. x1≤4 (atelier A), 2x2≤12 (atelier B), 3x1+2x2≤18 (atelier C), x1,x2≥0.
**forme_canonique**: c=(3,5)⊤, A=[[1,0],[0,2],[3,2]], b=(4,12,18)⊤.
**forme_standard**: Variables d'écart x3,x4,x5 : x1+x3=4, 2x2+x4=12, 3x1+2x2+x5=18.
**sommets_et_valeurs**: (0,0)→0 ; (4,0)→12 ; (4,3)→27 ; (2,6)→36 ; (0,6)→30.
**optimum**: x1*=2, x2*=6, z*=36 k€. Variable x3=2 (2h restantes atelier A).
**simplexe**: 3 tableaux de pivot. Entrées successives : x2 (coeff 5), puis x1 (coeff 3). Base finale {x3,x2,x1}. Ligne z finale : 0 0 0 −3/2 −1 | −36.
**ex4_simplexe_3vars**: **probleme**: max 5x1+5x2+3x3  s.c. 4x1+3x2−2x3≤30, x1−3x2+2x3≤15, 3x1+6x2+x3≤60, xi≥0.
**iterations**: 4 tableaux. Entrées : x1 (égalité 5/5, convention 1re), puis x3 (coeff 11/2), puis x2 (coeff 19/2).
**optimum**: x1*=9, x2*=4, x3*=9, z*=92. Vérification : 36+12−18=30 ✓, 9−12+18=15 ✓, 27+24+9=60 ✓, 45+20+27=92 ✓. Les trois contraintes sont saturées.
**ex5_descente_gradient**: **fonction**: f(x,y) = x²+4y²,  ∇f = (2x, 8y),  H = diag(2,8) semi-définie positive → f convexe.
**iterations**: Départ (2,1), α=0.1 → it.1 : (2,1)−0.1·(4,8)=(1.6; 0.2) → it.2 : (1.6;0.2)−0.1·(3.2;1.6)=(1.28; 0.04). Convergence vers (0,0).
**bonus_divergence**: Avec α=1/4 : y^(k+1) = y^(k) − (1/4)·8·y^(k) = −y^(k) → oscillation permanente 1→−1→1→… : le pas est trop grand pour la direction y (coefficient de courbure 4).
**ex6_newton**: **fonction**: f(x) = x²−6x+5,  f'=2x−6,  f''=2.
**iteration**: Depuis x⁰=0 : x¹ = 0 − (−6)/2 = 3. Optimum atteint en 1 itération car f est quadratique (approximation quadratique de Newton exacte).
**formule_nd**: x^(k+1) = x^(k) − H_f(x^(k))^{−1} ∇f(x^(k)), résolu via système linéaire H_f·d=∇f.
**ex7_penalite**: **contrainte**: x ≤ 1  (équivalent x−1 ≤ 0).
**penalite_proposee**: P(x) = (max(0, x−1))²  — continue (carré lisse le raccord en x=1), positive (carré ≥ 0), nulle ssi x≤1.
**probleme_penalise**: min_{x∈ℝ}  (x−3)² + (max(0, x−1))²  (sans contrainte, soluble par descente de gradient ou Newton).

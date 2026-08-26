---
id: >-
  resource-s7-mathematics-for-data-science-gxbd54-exercices-td-tp-students-2-pdf-357d5e12
slug: >-
  resource-s7-mathematics-for-data-science-gxbd54-exercices-td-tp-students-2-pdf-357d5e12
source_key: 'sha256:357d5e12be9ab851f0c6656fb7f1f1e2e8bb39b78289818062378e0eccf85b79'
part_of: S7 - Mathematics for Data Science
order: 1
manifest: null
derived_from: 'sha256:357d5e12be9ab851f0c6656fb7f1f1e2e8bb39b78289818062378e0eccf85b79'
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
  - linear-algebra
  - probability
  - statistics
  - calculus
  - numpy
  - python
  - data-science
  - PCA
  - gradient-descent
  - hypothesis-testing
  - confidence-intervals
domain: Mathematics for Data Science
---
# S7 - Mathematics for Data Science — GXBd54-exercices_TD_TP_students-2.pdf

## Summary

Recueil de 21 exercices couvrant 7 parties des mathématiques pour la data science : algèbre linéaire (matrices, vecteurs, systèmes linéaires), géométrie analytique (normes, produits scalaires, bases orthonormées), décomposition de matrices (PCA), calcul différentiel et optimisation (dérivées partielles, descente de gradient), probabilités (urnes, variables aléatoires, lois), modélisation statistique (TCL, intervalles de confiance), et inférence statistique (tests d'hypothèses, comparaison de deux populations). Chaque exercice combine théorie (calcul à la main) et implémentation Python/NumPy.

## Fields/API

**name**: Partie 1 — Algèbre linéaire
**exercises**: - Ex1
- Ex2
- Ex3
- Ex4
**topics**: - Ex1 : Convertir un tableau NumPy 1D en vecteur-colonne (reshape).
- Ex2 : Produit matrice×vecteur, produit matrice×matrice, déterminant — dans une feuille de calcul puis NumPy.
- Ex3 : Addition de matrices de dimensions différentes (A 2×3, B 3×2 → impossible) ; produit C(3×2)×D(2×3) et vérification de D×C ; transposition et produits E×E^T et E^T×E.
- Ex4 : Résolution d'un système 3×3 par élimination gaussienne à la main, puis numpy.linalg.solve — comparaison des résultats.
**name**: Partie 2 — Géométrie analytique
**exercises**: - Ex5
- Ex6
- Ex7
- Ex8
**topics**: - Ex5 : Vecteur unitaire v̂ = v/‖v‖ pour v=(2,−4,3) en Python.
- Ex6 : Produit intérieur (dot product) codé manuellement vs np.dot.
- Ex7 : Angle θ entre deux vecteurs via cos θ = (a·b)/(‖a‖‖b‖).
- Ex8 : Vérification d'une base orthonormée pour u=(1,0,1), v=(1,1,0), w=(0,1,1) dans R³ ; proposition de normalisation si nécessaire.
**name**: Partie 3 — Décomposition des matrices
**exercises**: - Ex9
**topics**: - Ex9 : ACP (PCA) sur Iris ou Wine dataset — histogrammes de chaque variable, étapes du cours à reproduire.
**name**: Partie 4 — Calcul et optimisation
**exercises**: - Ex10
- Ex11
- Ex12
**topics**: - Ex10 : Dérivées partielles ∂f/∂x et ∂f/∂y pour f=(x²−1)(y+2), f=e^(x+y+1), f=e^(−x)sin(x+y).
- Ex11 : Règle de la chaîne récursive pour ∂f/∂w avec x=x(r,s,w), y=y(r,s,w), w=w(u,v).
- Ex12 : Descente de gradient pour f(x)=x³−4x²+8 — fonction, dérivée, algorithme (paramètres : x_current, x_old, epsilon, lr), visualisation du chemin sur la courbe.
**name**: Partie 5 — Probabilité
**exercises**: - Ex13
- Ex14
- Ex15
**topics**: - Ex13 : Urne (13 billes : 6 noires, 3 blanches, 4 rouges), tirage de 4 sans remise — P(E∩F), P_F(E), P_E(F) ; indépendance de E et F.
- Ex14 : Variable aléatoire uniforme X sur {−3,−2,1,4} — loi, E(X), V(X) ; variable Y=(X+1)², loi de Y, E(Y) par deux méthodes.
- Ex15 : Variable à densité f(x)=x+1 si |x|≤k, 0 sinon — calcul de k, E(X), E(X²), fonction de répartition, loi de Y=X², E(Y).
**name**: Partie 6 — Modélisation statistique
**exercises**: - Ex16
- Ex17
- Ex18
**topics**: - Ex16 : TCL — calories journalières (μ=2700, σ=800, n=500) ; distribution de X̄_n ; P(X̄_n > 2750).
- Ex17 : Niveaux de confiance pour trois intervalles donnés (constantes 2.14, 1.85, 1.96).
- Ex18 : IC 95% pour la pluviométrie annuelle moyenne en Australie (1983–2002, 20 valeurs, paramètres inconnus).
**name**: Partie 7 — Inférence statistique
**exercises**: - Ex19
- Ex20
- Ex21
**topics**: - Ex19 : Test unilatéral sur le diamètre de bagues plastiques (μ₀=12.1mm, σ=0.04, n=64, x̄=12.095, α=10%).
- Ex20 : Test sur le poids moyen de cobayes (H₀: μ=300g, α=5%) ; lien avec IC bilatéral.
- Ex21 : Comparaison de deux éoliennes (E2p vs E3p, n=9 chacune) — estimations ponctuelles, IC 95%, test d'égalité des variances (Levene/F), test de différence des moyennes (α=1%), recommandation.

## Constraints

- Les calculs matriciels (Ex2, Ex3) doivent d'abord être réalisés dans une feuille de calcul avant Python.
- Ex4 : résolution à la main obligatoire avant numpy.linalg.solve.
- Ex9 (PCA) : histogrammes de chaque variable requis ; suivre les étapes du cours.
- Ex12 : visualisation du chemin de la descente de gradient sur la courbe de f obligatoire.
- Ex13 : tirage sans remise — la combinatoire doit tenir compte de cette contrainte.
- Ex18 : paramètres μ et σ² inconnus — utiliser la loi de Student.
- Ex21 : tester l'égalité des variances avant le test de comparaison des moyennes.

## Examples

- Ex1 : arr.reshape(-1, 1) convertit un vecteur 1D NumPy en vecteur-colonne.
- Ex5 : v=(2,−4,3), ‖v‖=√(4+16+9)=√29, v̂=(2/√29, −4/√29, 3/√29).
- Ex12 : f(x)=x³−4x²+8, f'(x)=3x²−8x ; gradient descent converge vers le minimum local autour de x≈2.67.
- Ex16 : X̄_n ~ N(2700, (800/√500)²) ≈ N(2700, 35.78²) ; P(X̄_n>2750) ≈ P(Z>1.40) ≈ 0.0808.
- Ex19 : Z_obs=(12.095−12.1)/(0.04/8)=−1.0 ; région critique unilatérale à 10% → z_α=1.28 → ne pas rejeter H₀.

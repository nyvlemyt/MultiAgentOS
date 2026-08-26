---
id: >-
  resource-s5-probabilite-et-statistique-statistiques-descriptives-adda51-pdf-c755a61b
slug: >-
  resource-s5-probabilite-et-statistique-statistiques-descriptives-adda51-pdf-c755a61b
source_key: 'sha256:c755a61b6b33da555dbb200604f730ad516a241a4e5520545d3ae2752cc0de62'
part_of: resource-s5-probabilite-et-statistique-491ffea1
order: 5
manifest: null
derived_from: 'sha256:c755a61b6b33da555dbb200604f730ad516a241a4e5520545d3ae2752cc0de62'
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
  - statistiques-descriptives
  - variable-statistique
  - effectif
  - fréquence
  - moyenne
  - médiane
  - mode
  - variance
  - écart-type
  - quartiles
  - histogramme
  - représentation-graphique
domain: mathématiques
---
# S5 - Probabilité et statistique — Statistiques Descriptives ADDA51.pdf

## Summary

Cours de statistiques descriptives (S5 ADDA51) couvrant le vocabulaire fondamental (population, individu, variable statistique), les types de variables (qualitative nominale/ordinale ; quantitative discrète/continue), le calcul des effectifs et fréquences (partiels et cumulés), les paramètres de position (mode, médiane, moyenne) et de dispersion (étendue, quartiles, variance, écart-type), ainsi que les représentations graphiques adaptées à chaque type de variable (barre, camembert, bâtons, histogramme, boîte à moustaches).

## Fields/API

**population Ω**: Ensemble des individus ou objets sur lequel porte l'étude. Un échantillon est un sous-ensemble représentatif utilisé quand la population est trop grande.
**individu ω**: Tout élément de la population Ω (unité statistique).
**variable statistique X**: Application X : Ω → C ; C est l'ensemble des modalités (valeurs observées ou mesurées sur les individus).
**variable qualitative nominale**: Modalités sans ordre naturel (ex. : couleur des yeux, nationalité). Représentation : diagramme en barre ou camembert.
**variable qualitative ordinale**: Modalités ordonnées hiérarchiquement (ex. : « pas du tout », « un peu », « beaucoup »). Représentation : diagramme en barre.
**variable quantitative discrète**: Modalités numériques isolées (ex. : nombre d'enfants). Représentation : diagramme en bâtons.
**variable quantitative continue**: Modalités formant un continuum ; regroupées en classes [a ; b[ d'amplitude b − a. Représentation : histogramme.
**effectif partiel nᵢ**: nᵢ = Card{ω ∈ Ω : X(ω) = xᵢ} — nombre d'individus prenant la valeur xᵢ.
**effectif total N**: N = Card(Ω) = Σ nᵢ.
**effectif cumulé Nᵢ**: Nᵢ = n₁ + n₂ + … + nᵢ — somme des effectifs jusqu'à xᵢ inclus.
**fréquence partielle fᵢ**: fᵢ = nᵢ / N. Propriété : Σ fᵢ = 1.
**fréquence cumulée Fᵢ**: Fᵢ = f₁ + f₂ + … + fᵢ — proportion d'individus dont la valeur est ≤ xᵢ.
**mode M₀ (discret)**: Modalité d'effectif (ou fréquence) le plus élevé. Non unique si ex-æquo.
**mode M₀ (continu — interpolation)**: Classe modale = classe d'effectif maximum. Formule : M₀ = Lᵢ + (Δ₁ / (Δ₁ + Δ₂)) × aᵢ, avec Lᵢ = borne inférieure, aᵢ = amplitude, Δ₁ = n₀ − n₁ (classe précédente), Δ₂ = n₀ − n₂ (classe suivante).
**médiane Me (discret — n impair 2k+1)**: Valeur du terme de rang k+1 dans la série ordonnée.
**médiane Me (discret — n pair 2k)**: Moyenne conventionnelle des termes de rang k et k+1 ; valeur non observée.
**médiane Me (continu — interpolation linéaire)**: Classe médiane = première classe dont Nᵢ ≥ N/2. Me = Lᵢ + ((N/2 − Nᵢ₋₁) / nᵢ) × aᵢ.
**moyenne x̄ (discrète)**: x̄ = (1/N) Σ nᵢ xᵢ = Σ fᵢ xᵢ.
**moyenne x̄ (continue)**: x̄ = (1/N) Σ nᵢ cᵢ = Σ fᵢ cᵢ, où cᵢ est le centre de la classe i. Perte de précision par rapport aux données brutes.
**étendue e**: e = x_max − x_min.
**quartiles Q1, Q2, Q3**: Valeurs divisant la série ordonnée en 4 quarts égaux : 25 % des valeurs < Q1 ; Q2 = médiane ; 75 % des valeurs < Q3. Écart interquartile = Q3 − Q1 (contient 50 % des valeurs).
**variance Var(X) (discrète)**: Var(X) = (1/N) Σ nᵢ (xᵢ − x̄)² = Σ fᵢ (xᵢ − x̄)². Théorème de König-Huygens : Var(X) = (1/N) Σ nᵢ xᵢ² − x̄².
**variance Var(X) (continue)**: Var(X) = (1/N) Σ nᵢ (cᵢ − x̄)² = (1/N) Σ nᵢ cᵢ² − x̄².
**écart-type σ(X)**: σ(X) = √Var(X). Faible → valeurs concentrées autour de x̄ ; élevé → valeurs dispersées.
**diagramme en barre**: Variables qualitatives. Modalités en abscisse, effectifs/fréquences en ordonnée. Hauteur ∝ effectif ; barres épaisses (distinctes des bâtons).
**diagramme circulaire (camembert)**: Variables qualitatives. Angle secteur de la modalité i = (nᵢ / N) × 360°.
**diagramme en bâtons**: Variables quantitatives discrètes. Un bâton par modalité, hauteur ∝ effectif.
**histogramme**: Variables quantitatives continues (données en classes). Surface du rectangle ∝ effectif. Amplitudes égales : ordonnée = effectif. Amplitudes inégales : ordonnée = densité dᵢ = nᵢ / aᵢ.
**boîte à moustaches (Tukey)**: Représente sur un même graphe les valeurs extrêmes, Q1, médiane, Q3 (et éventuellement d'autres quantiles). Permet la comparaison visuelle de distributions.

## Constraints

- Σ fᵢ = 1 toujours ; vérification indispensable après calcul des fréquences partielles.
- Le mode continu (interpolation) et la médiane sur classes sont des valeurs estimées, non observées directement.
- Médiane sur effectif pair : la valeur médiane conventionnelle (moyenne des deux termes centraux) n'est pas une valeur observée.
- La moyenne et la variance calculées sur classes utilisent les centres cᵢ ; cela induit une perte de précision irréductible.
- Histogramme à amplitudes inégales : utiliser la densité dᵢ = nᵢ/aᵢ en ordonnée pour que la surface reste proportionnelle à l'effectif.
- Variables qualitatives → barre ou camembert uniquement (ni bâtons ni histogramme).
- Variables quantitatives discrètes → bâtons ; variables quantitatives continues → histogramme.

## Examples

- Enfants par famille (N=200, discret) : tableau x=[0..6], n=[18,32,66,41,32,9,2]. Mode = 2 (n=66) ; N_cumulé(x≤2) = 116 ; f(x=2) = 66/200 = 0,33 ; F(x≤2) = 0,58.
- Notes d'étudiants en classes (N=50) : classe modale [10;12[, x̄ = 503/50 = 10,06, Var(x) = 6361,5/50 − 10,06² ≈ 26,03, σ ≈ 5,10.
- Médiane continue (notes, N=50) : 18 individus ont note < 8, 30 ont note < 12 → classe médiane [8;12[. Me = 8 + (25−18)/(30−18) × 4 ≈ 10,33.
- Quartiles sur série ordonnée (N=12 : 4,4,5,6,7,9,12,15,18,18,20,20) : Q1 = 5 (3e terme, 12×0,25=3), Q3 = 18 (9e terme, 12×0,75=9), écart interquartile = 13.
- Angle camembert : modalité avec nᵢ=50 sur N=200 → secteur = (50/200) × 360° = 90°.
- Étendue (série : 4,4,6,7,9,12,15,18,20,20) : e = 20 − 4 = 16.

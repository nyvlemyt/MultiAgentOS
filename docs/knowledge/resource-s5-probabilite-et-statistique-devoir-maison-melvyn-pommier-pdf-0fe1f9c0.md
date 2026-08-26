---
id: >-
  resource-s5-probabilite-et-statistique-devoir-maison-melvyn-pommier-pdf-0fe1f9c0
slug: >-
  resource-s5-probabilite-et-statistique-devoir-maison-melvyn-pommier-pdf-0fe1f9c0
source_key: 'sha256:0fe1f9c0cac48d738a262ec9aeef7274888c08b98925c39a91fba6d3ca6496c8'
part_of: S5 - Probabilité et statistique
order: 4
manifest: null
derived_from: 'sha256:0fe1f9c0cac48d738a262ec9aeef7274888c08b98925c39a91fba6d3ca6496c8'
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
  - probabilité
  - statistiques
  - variable-aléatoire-continue
  - loi-exponentielle
  - loi-normale
  - densité-probabilité
  - espérance
  - intégration
  - statistiques-descriptives
domain: mathématiques
---
# S5 - Probabilité et statistique — Devoir maison Melvyn Pommier.pdf

## Summary

Devoir maison S5 — probabilités et statistiques (Melvyn Pommier, octobre 2024). Cinq exercices couvrant : normalisation de densités continues, calcul de probabilités par intégration (loi exponentielle, densités polynomiales), calcul d'espérances par linéarité, loi normale N(μ,σ²) avec standardisation et lecture de table, et statistiques descriptives (moyenne, médiane, mode, variance, écart-type) sur données brutes avec diagrammes.

## Fields/API

**name**: Condition de normalisation d'une densité
**description**: Toute densité f doit vérifier ∫_{-∞}^{+∞} f(x)dx = 1 et f(x)≥0. Permet de déterminer la constante inconnue (λ, k, a) par résolution de cette équation.
**name**: Loi exponentielle X ~ Exp(1/100)
**description**: f(x) = (1/100)e^{−x/100} pour x≥0, 0 sinon. Constante λ=1/100. P(50≤X≤150) = e^{−0.5}−e^{−1.5} ≈ 0.3834. P(X<100) = 1−e^{−1} ≈ 0.6321.
**name**: Densité f(x) = 1/(2√x) sur ]0,1[
**description**: k = 1/2. E(X) = 1/3. E(X²) = 1/5. Par linéarité : E(5X²−3X+1) = 5·(1/5)−3·(1/3)+1 = 1.
**name**: Densité f(x) = a(4x−2x²) sur ]0,2[
**description**: ∫_0^2 (4x−2x²)dx = 8/3, donc a = 3/8. P(X>1) = (3/8)·(4/3) = 1/2.
**name**: Loi normale N(20, 5²) — consommation de lait
**description**: Standardisation z=(x−μ)/σ. P(X<10): z=−2 → 2.28%. P(X>30): z=+2 → 2.28%. Médiane = μ = 20 L. Quantile P(X≤x)=0.67: z≈0.44 → x = 20+0.44×5 = 22.2 L.
**name**: Statistiques descriptives — âge (n=20)
**description**: Données : âges de 12 à 75 ans. Moyenne x̄=36. Médiane=(30+35)/2=32.5. Modes : {25, 30, 50} (effectif 3 chacun). Variance=214. Écart-type≈14.63.
**name**: Statistiques descriptives — loisirs (n=20)
**description**: 4 catégories (Sport, Cinéma, Théâtre, Lecture), effectif 5 chacune (25% chacune). Distribution uniforme → mode indéterminé (tous modaux).

## Constraints

- Densité valide : f(x)≥0 partout et intégrale totale = 1 (condition nécessaire et suffisante).
- Changement de variable u=x/100 : dx=100du, les bornes se transforment proportionnellement.
- Linéarité de l'espérance : E(aX²+bX+c) = aE(X²)+bE(X)+c, applicable à toute v.a. intégrable.
- Standardisation loi normale : z=(x−μ)/σ, valide uniquement pour X~N(μ,σ²) avec σ>0.
- Variance échantillon utilisée ici : (1/n)·Σ(xi−x̄)², formule population (diviseur n, non n−1).

## Examples

- Ex.1 — Loi exponentielle : ∫_50^{150} (1/100)e^{−x/100}dx = [−e^{−u}]_{0.5}^{1.5} = e^{−0.5}−e^{−1.5} ≈ 0.3834.
- Ex.2 — Densité √x : k déterminé par ∫_0^1 k/√x dx = k·[2√x]_0^1 = 2k = 1 ⟹ k=1/2.
- Ex.3 — Densité polynomiale : a·∫_0^2(4x−2x²)dx = a·(8/3) = 1 ⟹ a=3/8 ; P(X>1)=1/2 par symétrie du résultat.
- Ex.4 — Normale N(20,25) : seuil 33% supérieur → P(X≤x)=0.67, table donne z≈0.44, d'où x=22.2 L.
- Ex.5 — Stats âges : Σxi/20 = 720/20 = 36 ; variance = 4280/20 = 214 ; σ=√214≈14.63.

---
id: resource-s7-ml2-corrige-pdf-4f9a9fa7
slug: resource-s7-ml2-corrige-pdf-4f9a9fa7
source_key: 'sha256:4f9a9fa7ae33bbf0e8f178d865e32237e5669ce894b15fda3be6b07e2d3b4c1e'
part_of: resource-s7-ml2-fa640f29
order: 14
manifest: null
derived_from: 'sha256:4f9a9fa7ae33bbf0e8f178d865e32237e5669ce894b15fda3be6b07e2d3b4c1e'
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
  - machine-learning
  - k-means
  - clustering
  - CAH
  - DBSCAN
  - apriori
  - anomaly-detection
  - z-score
  - silhouette
  - corrigé
domain: machine-learning
---
# S7 - ml2 — corrige.pdf

## Summary

Corrigé détaillé (calculs vérifiés par programme) d'un contrôle blanc de Machine Learning II couvrant : classification vs clustering, K-means (SSE, convergence, choix de K), CAH liens simple/complet, algorithme Apriori (support/confiance/lift), DBSCAN (noyau/bordure/bruit), détection d'anomalies par z-score et LOF, et score de silhouette.

## Fields/API

**name**: Classification vs clustering
**definition**: Classification = supervisée : classes connues à l'avance, apprentissage sur exemples étiquetés. Clustering = non supervisé : groupes découverts par similarité, sans étiquettes.
**name**: Standardisation
**definition**: z = (x − μ) / σ. Obligatoire pour les algorithmes à base de distance : sans elle, une variable à grande amplitude écrase les autres.
**name**: Principe Apriori (anti-monotonie du support)
**definition**: Si X ⊆ Y alors s(X) ≥ s(Y). Contraposée : si un itemset est non fréquent, tous ses sur-ensembles sont non fréquents et peuvent être élagués.
**name**: Limites de K-means
**definition**: Échoue sur clusters de tailles/densités très différentes, formes non globulaires, présence d'aberrants. Alternatives : DBSCAN (formes quelconques + bruit), CAH lien simple (formes allongées).
**name**: Statuts DBSCAN
**definition**: Noyau : ≥ MinPts points dans son rayon Eps (lui inclus). Bordure : non noyau mais dans le voisinage d'un noyau. Bruit : ni noyau ni bordure, hors de tout cluster.
**name**: Lift
**definition**: lift(X→Y) = c(X→Y) / s(Y). > 1 : association positive ; = 1 : indépendance ; < 1 : association négative. Corrige le biais d'une confiance élevée due à la seule fréquence de Y.
**name**: Complexité CAH
**definition**: Espace O(n²) (matrice de proximité), temps O(n³) réductible à O(n² log n). Impraticable pour de grands n, contrairement à K-means (linéaire).
**name**: Effet de masquage (z-score)
**definition**: L'anomalie elle-même gonfle la moyenne et l'écart-type estimés ; son z-score est sous-évalué et peut passer sous le seuil. Remèdes : estimateurs robustes (médiane/MAD) ou détection itérative.
**name**: LOF vs distance au k-ième voisin
**definition**: La distance absolue au k-ième voisin rate les anomalies locales dans des zones de densité mixte. LOF compare la densité d'un point à celle de ses voisins : un point entouré de voisins très denses ressort avec un ratio élevé même s'il est proche en absolu.
**name**: Choix de K dans K-means
**definition**: La SSE décroît mécaniquement avec K (SSE = 0 pour K = n) : la minimiser ne sélectionne rien. Méthodes : coude de la courbe SSE(K) ou maximum de la silhouette moyenne.
**name**: CAH — liens simple vs complet
**definition**: Lien simple (MIN) : distance entre clusters = paire la plus proche → favorise les chaînes. Lien complet (MAX) : paire la plus éloignée → favorise les groupes compacts, étire les hauteurs de fusion. Les deux premières fusions coïncident sur des singletons (MIN = MAX), mais les partitions finales peuvent différer.

## Constraints

- K-means converge vers un optimum local dépendant de l'initialisation → exécutions multiples (n_init), garder la SSE minimale.
- Apriori : générer les candidats de taille k par fusion des itemsets fréquents de taille k-1 partageant le même préfixe ; élaguer si un sous-ensemble n'est pas dans F_{k-1}. Un candidat survivant à l'élagage peut encore être éliminé au comptage.
- SSE : toujours sommer les carrés des distances, pas les distances brutes.
- CAH : mettre à jour la matrice de distances après chaque fusion (erreur classique : ne comparer que les paires impliquant le dernier cluster formé).
- Arrêt K-means : les centroïdes ne bougent plus (ou les affectations n'évoluent plus).
- DBSCAN : déclarer la convention de voisinage (point inclus dans son propre voisinage).
- Lift : calculer avec des fractions (supports), pas des comptes bruts.

## Examples

**label**: K-means — itération 1 (μ1=(1,2), μ2=(6,5), 6 points)
**detail**: C1={P1,P2,P3}, C2={P4,P5,P6}. Nouveaux centroïdes : μ1=(1,67 ; 2), μ2=(7 ; 6). Itération 2 : aucune affectation ne change → arrêt. SSE finale = C1 : 2,667 + C2 : 4 = 6,667.
**label**: CAH lien simple — 5 points A–E
**detail**: Étape 1 : fusion {A,B} à h=1. Étape 2 : fusion {C,D} à h=1. Étape 3 : d({A,B},{C,D})=min(4,5,3,4)=3 → fusion à h=3. Étape 4 : fusion avec E à h=5 (d(D,E)).
**label**: CAH lien complet — mêmes données
**detail**: Étapes 1–2 identiques (singletons). Étape 3 : d({A,B},{C,D})=max(4,5,3,4)=5 → fusion à h=5. Étape 4 : fusion avec E à h=max(10,9,6,5)=10.
**label**: Apriori — 5 transactions, minsup=3
**detail**: F1={A,B,C} (D éliminé, σ=2). F2={{A,B},{A,C},{B,C}} (σ=3 chacun). F3=∅ (σ(A,B,C)=2<3). Règles A→B et B→C : s=0,6 ; c=0,75 ; lift=0,9375 < 1 → association négative malgré 75 % de confiance.
**label**: DBSCAN — Eps=1,5, MinPts=3
**detail**: Q1–Q3 : noyaux (3–4 voisins). Q4 : bordure via Q3. Q5–Q8 : noyaux (4 voisins). Q9(4,6) : bruit (1 seul voisin). Clusters : {Q1,Q2,Q3,Q4} et {Q5,Q6,Q7,Q8}.
**label**: Z-score avec masquage — données [8,8,9,9,9,10,10,25]
**detail**: Moyenne=11, σ=5,339. z(25)=2,62 < 3 → non détecté. Sans 25 : moyenne≈9, σ≈0,79 → z(25)≈20. Effet de masquage démontré.
**label**: Silhouette du point Q1(1,1) dans C1
**detail**: a = d(Q1,Q2) = 1. b = moyenne distances vers C2 = (4 + 4,123 + 5)/3 = 4,374. s = (b−a)/max(a,b) = 1 − 1/4,374 = 0,771 (vérifié scikit-learn : 0,7714). Point bien classé.

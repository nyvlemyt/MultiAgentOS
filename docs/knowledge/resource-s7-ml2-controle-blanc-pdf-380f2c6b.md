---
id: resource-s7-ml2-controle-blanc-pdf-380f2c6b
slug: resource-s7-ml2-controle-blanc-pdf-380f2c6b
source_key: 'sha256:380f2c6b1d735b1c6656b858306337494d51188c448e548c9e19ae533f3d0af2'
part_of: resource-s7-ml2-fa640f29
order: 13
manifest: null
derived_from: 'sha256:380f2c6b1d735b1c6656b858306337494d51188c448e548c9e19ae533f3d0af2'
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
  - clustering
  - k-means
  - dbscan
  - hierarchical-clustering
  - association-rules
  - anomaly-detection
  - apriori
  - exam
  - unsupervised-learning
domain: machine-learning
---
# S7 - ml2 — controle_blanc.pdf

## Summary

Contrôle blanc Machine Learning II (juin 2026, /20, 2 h, calculatrice autorisée). Cinq exercices couvrant le clustering non supervisé et les règles d'association : questions de cours sur classification vs clustering, standardisation, Apriori, limites de K-means, DBSCAN, complexité CAH, effet de masquage ; exercice K-means sur 6 points avec calcul de SSE et choix de K ; CAH agglomératif (lien simple et complet) sur 5 objets avec dendrogramme ; règles d'association sur 5 transactions (support/confiance/lift) ; DBSCAN sur 9 points puis z-score et LOF pour la détection d'anomalies. Bonus : coefficient de silhouette.

## Fields/API

**name**: Exercice 1 — Questions de cours (4 pts, 8 × 0,5 pt)
**desc**: (1) Différence fondamentale classification vs clustering. (2) Pourquoi standardiser avant K-means + formule z = (x − μ) / σ. (3) Principe Apriori et propriété anti-monotone du support. (4) Deux situations d'échec de K-means (clusters non convexes, tailles déséquilibrées) + alternative (ex. DBSCAN). (5) Définitions point noyau / bordure / bruit dans DBSCAN. (6) Confiance élevée ≠ règle intéressante → mesure lift et lecture (lift > 1 = corrélation positive). (7) Complexité O(n²) en espace et O(n² log n) en temps pour la CAH agglomératif. (8) Effet de masquage dans les approches statistiques de détection d'anomalies.
**name**: Exercice 2 — K-means (5 pts)
**desc**: 6 points : P1(1,2), P2(2,1), P3(2,3), P4(6,5), P5(7,7), P6(8,6). K=2, centroïdes initiaux μ1=P1=(1,2), μ2=P4=(6,5). (1 — 2 pts) Tableau complet des distances euclidiennes à μ1 et μ2, affectation de chaque point, recalcul des nouveaux centroïdes. (2 — 1 pt) Deuxième itération jusqu'à convergence et justification de l'arrêt. (3 — 1 pt) Calcul de la SSE finale = Σ||xi − μk||². (4 — 0,5 pt) Optimalité globale non garantie ; précaution pratique : multi-démarrage ou k-means++. (5 — 0,5 pt) SSE → 0 quand K = n ; raison de ne pas maximiser K ; méthode du coude ou score de silhouette pour choisir K.
**name**: Exercice 3 — Clustering hiérarchique agglomératif (4 pts)
**desc**: 5 objets A, B, C, D, E avec matrice de distances entières. A-B=1, A-C=4, A-D=5, A-E=10, B-C=3, B-D=4, B-E=9, C-D=1, C-E=6, D-E=5. (1 — 2 pts) CAH en lien simple (MIN) : ordre des fusions (distances croissantes), mise à jour de la matrice, dendrogramme avec hauteurs exactes. (2 — 1,5 pt) Même démarche en lien complet (MAX). (3 — 0,5 pt) Couper chaque dendrogramme pour obtenir 2 clusters : partitions résultantes et commentaire sur la différence MIN vs MAX (chaînage vs compacité).
**name**: Exercice 4 — Règles d'association (4 pts)
**desc**: 5 transactions : T1={A,B,C}, T2={A,B}, T3={A,B,C,D}, T4={B,C}, T5={A,C,D}. minsup = 3 transactions (60 %). (1 — 1 pt) Support de chaque article individuel → F1. (2 — 1 pt) Candidats C2 par paires de F1, comptage des supports → F2. (3 — 1 pt) Candidats C3 via Fk−1 × Fk−1 (fusion + élagage Apriori), comptage, conclusion sur F3 ; calcul du nombre de comptages évités vs énumération naïve sur 4 articles. (4 — 1 pt) Règle A→B et règle B→C : support (fraction), confiance (fraction), lift (fraction) ; interprétation de l'intérêt de chaque règle.
**name**: Exercice 5 — DBSCAN et anomalies (3 pts + bonus 1 pt)
**desc**: (1 — 1,5 pt) 9 points Q1(1,1)…Q9(4,6), Eps=1,5, MinPts=3 (point inclus dans son propre voisinage) : liste des voisins de chaque point, statut noyau/bordure/bruit, clusters finaux. (2 — 1 pt) Série {8,9,10,9,8,10,9,25} : moyenne μ, écart-type population σ, z-score de 25 ; décision avec seuil |z|>3 et commentaire sur la puissance du test. (3 — 0,5 pt) Comparaison score distance-au-k-ième-voisin vs LOF sur un point p adjacent à un cluster dense : pourquoi kNN-dist rate p et pourquoi LOF, basé sur les densités relatives locales, le détecte. Bonus : coefficient de silhouette du point (1,1) pour C1={(1,1),(1,2)}, C2={(5,1),(5,2),(6,1)}.

## Constraints

- Distance euclidienne par défaut sauf mention contraire.
- Toutes les réponses doivent être justifiées ; les calculs intermédiaires doivent être détaillés.
- Le point compte dans son propre voisinage lors du calcul de voisinage DBSCAN.
- Calculatrice autorisée ; durée conseillée 2 h.
- Barème total sur 20 points (+ 1 point bonus).
- minsup exprimé en nombre absolu de transactions (3) et en pourcentage (60 %).

## Examples

- K-means itération 1 : d(P2, μ1)=√2≈1,41 vs d(P2, μ2)=√41≈6,40 → P2 affecté à C1 ; d(P5, μ1)=√61≈7,81 vs d(P5, μ2)=√8≈2,83 → P5 affecté à C2.
- CAH lien simple : première fusion C-D à distance 1, puis A-B à distance 1, puis {A,B}-{C,D} à distance min(A-C,A-D,B-C,B-D)=3.
- Support de A = 4/5 = 0,8 (T1,T2,T3,T5) ; support de D = 2/5 = 0,4 (T3,T5) → D exclu de F1 avec minsup=0,6.
- Règle A→B : support=supp(A∩B)=3/5, confiance=3/4, lift=(3/5)/((4/5)×(4/5))=15/16<1 → corrélation légèrement négative.
- z-score de 25 : μ=(8+9+10+9+8+10+9+25)/8=11, σ=√(variance_population), z=(25−11)/σ ; si |z|≤3, 25 non détecté → illustration de l'effet de masquage par outlier.

---
id: resource-s7-ml2-cours-ml2-pdf-0704ee5b
slug: resource-s7-ml2-cours-ml2-pdf-0704ee5b
source_key: 'sha256:0704ee5bc1f5e4c02ca6c66be725fb5a3bfcb6798b13223da5c316f0263c8a9a'
part_of: S7 - ml2
order: 15
manifest: null
derived_from: 'sha256:0704ee5bc1f5e4c02ca6c66be725fb5a3bfcb6798b13223da5c316f0263c8a9a'
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
  - CAH
  - DBSCAN
  - association-rules
  - apriori
  - anomaly-detection
  - LOF
  - unsupervised-learning
  - data-mining
  - exam-prep
domain: machine-learning
---
# S7 - ml2 — cours_ml2.pdf

## Summary

Cours complet de révision Machine Learning II (ADIF84) couvrant l'apprentissage non supervisé : clustering (K-means, CAH, DBSCAN), règles d'association (Apriori, support, confiance, lift) et détection d'anomalies (z-score, k-PPV, LOF, reconstruction). Inclut formulaire complet, exemples chiffrés vérifiés par programme, checklist anti-pièges et glossaire FR/EN. Référence d'examen — marqueurs [exam] signalent les points les plus probables au contrôle.

## Fields/API

**name**: Standardisation (z-score)
**formula**: z = (x − μ) / σ → moyenne 0, écart-type 1
**rule**: Obligatoire avant tout algorithme à base de distance (K-means, CAH, DBSCAN). Ne rend pas les données gaussiennes.
**name**: Distance euclidienne
**formula**: d(p, q) = √Σ(p_i − q_i)²
**rule**: Formule universelle du cours ; poser le calcul sans sauter d'étape.
**name**: K-means — algorithme
**formula**: SSE = Σ_i Σ_{x∈C_i} dist(m_i, x)²  ;  centroïde m_i = (1/|C_i|) Σ_{x∈C_i} x
**rule**: Recette : (1) choisir K, (2) initialiser K centroïdes, (3) affecter tous les points, (4) recalculer centroïdes, (5) répéter 3–4 jusqu'à convergence. Ordre affecter PUIS recalculer (batch). Convergence vers optimum local → exécutions multiples (n_init). Complexité O(n·K·I·d).
**name**: Choisir K — coude et silhouette
**formula**: s(i) = (b(i) − a(i)) / max(a(i), b(i))  ;  a = cohésion intra-cluster, b = séparation vers cluster voisin le plus proche
**rule**: Méthode du coude : chercher le genou de la courbe SSE vs K, PAS le minimum (toujours le plus grand K). Silhouette : maximiser la moyenne. Davies-Bouldin (min), Calinski-Harabasz (max) à connaître de nom.
**name**: Limites de K-means
**formula**: —
**rule**: Échoue pour clusters de tailles, densités ou formes différentes (croissants, anneaux) et en présence d'aberrants. Bisecting K-means moins sensible à l'initialisation. K-means++ utilisé par défaut dans scikit-learn.
**name**: CAH agglomérative — critères de lien
**formula**: MIN : min d(p,q) p∈C_i,q∈C_j | MAX : max d(p,q) | Moyenne : Σ d / (|C_i|·|C_j|) | Ward : ΔSSE causée par la fusion
**rule**: Recette : matrice n×n → fusionner les 2 clusters les plus proches → mettre à jour (comparer TOUTES les paires) → répéter. Complexité O(n²) espace, O(n³) temps. Pas de K à fixer à l'avance (couper le dendrogramme après coup). MIN = chaînage/bruit ; MAX = casse gros clusters ; Ward ≈ K-means hiérarchique.
**name**: DBSCAN
**formula**: Noyau : |voisinage_Eps| ≥ MinPts (point lui-même inclus) ; Bordure : voisin d'un noyau ; Bruit : ni l'un ni l'autre
**rule**: Recette : étiqueter noyau/bordure/bruit → éliminer bruit → connecter noyaux voisins → rattacher bordures. Forces : formes quelconques, bruit identifié explicitement, K automatique. Faiblesses : densités très différentes, haute dimension, O(n²). Heuristique Eps : coude de la courbe k-ième PPV.
**name**: Règles d'association — mesures
**formula**: s(X) = σ(X)/N | s(X→Y) = σ(X∪Y)/N | c(X→Y) = σ(X∪Y)/σ(X) | lift(X→Y) = c(X→Y)/s(Y) = s(X∪Y)/(s(X)·s(Y))
**rule**: Lift > 1 : corrélés positivement ; = 1 : indépendants ; < 1 : corrélation négative. Lift symétrique. Confiance élevée SANS lift élevé = mirage (piège n°1). Calculs avec supports en fraction, pas en comptes.
**name**: Algorithme Apriori
**formula**: Anti-monotonie : X ⊆ Y ⇒ s(X) ≥ s(Y) | Non fréquent ⇒ tous les sur-ensembles non fréquents | Fusion F_{k-1}×F_{k-1} : préfixe commun de k-1 éléments
**rule**: Recette : (1) F_1 = singletons fréquents, (2) générer L_{k+1} par fusion, (3) élaguer si un sous-ensemble de taille k est non fréquent, (4) compter, (5) F_{k+1} = candidats ≥ minsup. Un k-itemset génère 2^k − 2 règles. Anti-monotonie confiance AU SEIN d'un même itemset : c(ABC→D) ≥ c(AB→CD) ≥ c(A→BCD).
**name**: Détection d'anomalies — z-score
**formula**: z = (x − μ) / σ ; seuil usuel |z| > 3
**rule**: Les anomalies faussent μ et σ (effet de masquage) → estimateurs robustes (médiane, MAD) ou retrait itératif.
**name**: Détection — distance k-PPV
**formula**: Score = d(x, x^(k)) = distance au k-ième plus proche voisin
**rule**: Simple, O(n²). Rate les anomalies groupées (k petit) et les densités variables (LOF corrige ce cas).
**name**: Détection — LOF (densité locale)
**formula**: density(x,k) = (Σ_{y∈N(x,k)} dist(x,y)/k)^{-1} | LOF ≈ densité_moyenne_voisins / densité_point
**rule**: LOF ≈ 1 : normal ; LOF >> 1 : anomalie locale. Gère les densités variables. Coûteux O(n²), sensible aux paramètres, perd son sens en haute dimension.
**name**: Détection — reconstruction
**formula**: Erreur = ‖x − x̂‖ (ACP ou auto-encodeur)
**rule**: Les données normales vivent près d'une structure de dimension réduite. Erreur élevée = objet atypique.
**name**: Évaluation clustering sans étiquettes
**formula**: SSE, silhouette, Davies-Bouldin (↓), Calinski-Harabasz (↑)
**rule**: Avec étiquettes : entropie, pureté. Pour anomalies avec étiquettes : précision/rappel/F1/ROC-AUC (exactitude trompeuse — classe rare).

## Constraints

- Clustering ≠ classification supervisée : pas d'étiquettes connues a priori, ne jamais parler de 'classes' avant d'avoir exécuté le clustering.
- Standardiser AVANT K-means / CAH / DBSCAN ; savoir justifier (variables d'échelles différentes dominent la distance euclidienne).
- SSE = somme des distances AU CARRÉ ; oublier le carré est l'erreur la plus fréquente.
- K-means : ordre batch strict — affecter TOUS les points, PUIS recalculer les centroïdes. Critère d'arrêt = centroïdes stables, pas SSE = 0.
- Le centroïde n'est généralement PAS un point du jeu de données.
- Choisir K : chercher le COUDE de SSE vs K, pas le minimum (absurde, toujours le plus grand K).
- Silhouette : calcul avec distances simples (PAS au carré) ; b(i) = cluster voisin le plus proche, pas tous les autres clusters confondus.
- CAH : mettre à jour la matrice à CHAQUE fusion ; comparer TOUTES les paires, pas seulement celles impliquant le nouveau cluster.
- DBSCAN : convention sklearn — le point lui-même est compté dans son voisinage. La bordure appartient à un cluster, seul le bruit est exclu. Un point bordure atteignable depuis 2 clusters est affecté à l'un selon l'ordre de parcours.
- Apriori : non fréquent ⇒ tous les SUR-ensembles éliminés (pas les sous-ensembles). Fusion F_{k-1}×F_{k-1} requiert préfixe commun de k-1 éléments. Candidat généré non élagué peut encore être éliminé par le comptage.
- Support règle = σ(X∪Y)/N (diviser par N, pas par σ(X) — ça, c'est la confiance).
- Lift : calculer avec supports en FRACTION. Confiance élevée sans lift élevé = association non intéressante.
- z-score : effet de masquage possible — l'anomalie gonfle μ et σ qui servent à la juger.
- LOF élevé = point moins dense que ses voisins = anomalie locale. Angle mort : densité perd son sens en haute dimension.
- Les aberrants faussent les clusters / centroïdes / paramètres du modèle censés les détecter — toujours mentionner cette limite.
- K-means trouve TOUJOURS K clusters même dans du bruit uniforme : trouver des clusters ne prouve pas qu'ils existent.

## Examples

**label**: K-means déroulé (K=2, 6 points)
**description**: A(1,1) B(2,1) C(4,3) D(5,4) E(1,2) F(5,3), centroïdes initiaux μ1=A μ2=C. Itération 1 : C1={A,B,E} C2={C,D,F} → μ1=(1.33,1.33) μ2=(4.67,3.33). Itération 2 : aucun changement d'affectation → convergence. SSE finale = 2.667.
**label**: CAH MIN vs MAX (5 points)
**description**: A(1,2) B(2,2) C(4,1) D(5,1) E(7,3). MIN : {A,B} et {C,D} à hauteur 1, puis {A,B,C,D} à 2.236 (d(B,C)), puis E à 2.828. MAX : {A,B} et {C,D} à 1, puis {C,D,E} à 3.606, puis fusion finale à 6.083 (d(A,E)). Les deux critères donnent des arbres différents.
**label**: DBSCAN (Eps=1.2, MinPts=3)
**description**: A(1,1) B(1,2) C(2,1) D(2,2) E(3,2) F(6,6). A,B,C,D = noyaux (3-4 voisins) ; E = bordure (via D, seulement 2 voisins) ; F = bruit (1 voisin). Cluster unique {A,B,C,D,E}.
**label**: Apriori fil rouge (minsup=3/5 transactions)
**description**: F1={Pain,Lait,Couches,Bière} (Cola et Oeufs éliminés). F2={{Pain,Lait},{Pain,Couches},{Lait,Couches},{Bière,Couches}} ({Pain,Bière} et {Lait,Bière} support=2). F3 : seul candidat {Pain,Lait,Couches} support=2 < 3 → éliminé. Gain : 41 candidats naïfs → 13 avec élagage.
**label**: Lift (règle Bière→Couches)
**description**: σ({Bière,Couches})=3, s=3/5=0.6. c(Bière→Couches)=3/3=1.0 ; c(Couches→Bière)=3/4=0.75. s(Couches)=4/5=0.8. lift(Bière→Couches)=1.0/0.8=1.25 > 1 (positif). lift(Lait→Couches)=0.75/0.8=0.9375 < 1 (négatif malgré confiance 0.75).
**label**: Silhouette — 4 points 2 clusters
**description**: C1={(0,0),(0,1)}, C2={(3,0),(3,1)}. Point (0,0) : a=1 (distance à (0,1)) ; b=(3+3.162)/2=3.081. s=1−1/3.081=0.675. Bon clustering.
**label**: z-score — effet de masquage
**description**: Mesures : 10,12,11,13,12,11,40. μ=15.571, σ=10.012 → z(40)=2.44 < 3 : non détecté! Sans 40 : μ=11.5, σ=0.96 → z=29.7. La valeur aberrante gonfle μ et σ qui servent à la juger.
**label**: LOF k=2 (4 points dont un isolé)
**description**: A(0,0) B(0,1) C(1,0) D(5,5). Densités : A=1.0, B=C=0.828, D=0.156. Densité relative de D ≈ 0.19 → LOF inverse ≈ 5.3 : fortement anormal.

---
id: resource-s7-ml2-fiche-revision-pdf-47aafb9d
slug: resource-s7-ml2-fiche-revision-pdf-47aafb9d
source_key: 'sha256:47aafb9d8a99c56c597136a6b9693878e5297b370b26ccbddd8a1f4ce89312dd'
part_of: resource-s7-ml2-fa640f29
order: 19
manifest: null
derived_from: 'sha256:47aafb9d8a99c56c597136a6b9693878e5297b370b26ccbddd8a1f4ce89312dd'
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
  - cah
  - dbscan
  - apriori
  - anomaly-detection
  - unsupervised-learning
  - association-rules
  - standardisation
domain: machine learning
---
# S7 - ml2 — fiche_revision.pdf

## Summary

Fiche de révision condensée ML II (juin 2026). Couvre les 5 familles de tâches non supervisées et supervisées du cours : clustering (K-means, CAH, DBSCAN), règles d'association (Apriori) et détection d'anomalies, avec formules clés, complexités, forces/faiblesses et 10 réflexes d'examen.

## Fields/API

**cadre_general**: **description**: Taxonomie des tâches ML du cours
**entries**: **tache**: Classification
**type**: prédictif
**cible**: catégorielle
**algo**: Random Forest
**tp**: TP1
**tache**: Régression
**type**: prédictif
**cible**: continue
**algo**: RF régression
**tp**: —
**tache**: Clustering
**type**: descriptif
**cible**: aucune
**algo**: K-means, CAH, DBSCAN
**tp**: TP2/3/5
**tache**: Associations
**type**: descriptif
**cible**: aucune
**algo**: Apriori
**tp**: TP4
**tache**: Anomalies
**type**: descriptif
**cible**: aucune
**algo**: stat., k-PPV, LOF
**tp**: ch.4
**regle_universelle**: Standardiser avant tout algo à distance : z = (x − μ) / σ. Distance euclidienne : d(p,q) = √Σ(pᵢ − qᵢ)².
**k_means**: **algorithme**: - Choisir K
- Initialiser K centroïdes
- Affecter chaque point au centroïde le plus proche
- Recalculer centroïde = moyenne du cluster
- Répéter 3–4 jusqu'à stabilité
**sse**: SSE = Σᵢ Σ_{x∈Cᵢ} dist(mᵢ, x)² — diminue à chaque itération ; optimum LOCAL
**choisir_k**: Coude sur la courbe SSE(K) ou maximum de la silhouette
**silhouette**: s = (b − a) / max(a, b) ; a = dist. moy. intra-cluster, b = dist. moy. au cluster voisin le plus proche ; s ≈ 1 = bon
**problemes_et_remedes**: **probleme**: Mauvaise initialisation
**remede**: Exécutions multiples (n_init)
**probleme**: Tailles différentes, densités différentes, formes non globulaires, points aberrants
**remede**: Utiliser CAH sur échantillon ou bisecting K-means
**probleme**: Cluster vide
**remede**: Recréer avec le point le plus coûteux (SSE)
**complexite**: O(n · K · I · d) — rapide, scalable
**exemple**: A(1,1) B(2,1) C(4,3) D(5,4) E(1,2) F(5,3), init A et C → converge en 2 itérations vers {A,B,E} (μ₁=(1.33;1.33)) et {C,D,F} (μ₂=(4.67;3.33)), SSE = 2.667
**cah**: **algorithme**: - Calculer matrice de distances
- Fusionner les 2 clusters les plus proches
- Mettre à jour la matrice
- Répéter — résultat = dendrogramme
**lecture_dendrogramme**: Hauteur = distance de fusion ; couper pour choisir le nombre de clusters
**liens**: **lien**: MIN (single)
**formule**: plus proche paire
**force**: formes allongées
**faiblesse**: bruit, chaînage
**lien**: MAX (complete)
**formule**: paire la plus éloignée
**force**: robuste au bruit
**faiblesse**: casse les gros clusters
**lien**: Moyenne
**formule**: moyenne des paires
**force**: compromis
**faiblesse**: biais globulaire
**lien**: Ward
**formule**: augmentation SSE à la fusion
**force**: proche de K-means
**faiblesse**: biais globulaire
**complexite**: Espace O(n²), temps O(n³) ou O(n² log n)
**limites**: Fusions irréversibles ; pas d'objectif global
**dbscan**: **parametres**: - Eps (rayon)
- MinPts (dont le point lui-même dans son voisinage)
**statuts**: **statut**: Noyau
**condition**: ≥ MinPts voisins dans Eps
**dans_cluster**: true
**statut**: Bordure
**condition**: non-noyau mais voisin d'un noyau
**dans_cluster**: true
**statut**: Bruit
**condition**: ni noyau ni bordure
**dans_cluster**: false
**clusters**: Groupes de noyaux connectés + leurs bordures
**choisir_eps**: Coude de la courbe des distances au k-ième voisin
**forces**: - Formes quelconques
- Bruit identifié automatiquement
- K non requis
**faiblesses**: - Densités variables mal gérées
- Haute dimension
**regles_association**: **metriques**: **support**: s(X→Y)  = σ(X∪Y) / N
**confiance**: c(X→Y)  = σ(X∪Y) / σ(X)
**lift**: lift(X→Y) = c(X→Y) / s(Y) — lift>1 : positif ; =1 : indépendant ; <1 : négatif
**apriori**: **principe**: Anti-monotonie : X ⊆ Y ⇒ s(X) ≥ s(Y). Si X non fréquent, tous ses sur-ensembles sont non fréquents.
**algorithme**: - F1 = items fréquents
- Candidats Lₖ₊₁ par fusion de paires de Fₖ partageant k−1 premiers items
- Élaguer si un sous-ensemble de taille k est non fréquent
- Compter les supports
- Garder ceux ≥ minsup
**generation_regles**: Un itemset fréquent Z génère 2^|Z| − 2 règles (même support, confiances différentes) ; élagage possible par confiance décroissante : c(ABC→D) ≥ c(AB→CD) ≥ c(A→BCD)
**exemple**: 5 transactions, minsup=3 → F1 = {Pain,Lait,Couches,Bière} ; paires fréquentes : {Pain,Lait},{Pain,Couches},{Lait,Couches},{Bière,Couches} ; triple candidat {Pain,Lait,Couches} : support=2 → éliminé. Règles : c(Bière→Couches)=1.0 lift=1.25 ✓ ; c(Lait→Couches)=0.75 lift=0.94<1 → sans intérêt.
**detection_anomalies**: **approches**: **approche**: Statistique
**score**: z = (x−μ)/σ, anomalie si |z|>3
**force**: Solide si distribution connue
**angle_mort**: Params faussés par l'anomalie (masquage)
**approche**: Distance (k-PPV)
**score**: Distance au k-ième plus proche voisin
**force**: Simple
**angle_mort**: Densités variables ; anomalies groupées
**approche**: Densité (LOF)
**score**: densité(x,k) / densité voisins
**force**: Anomalies locales
**angle_mort**: Coût O(n²), haute dimension
**approche**: Clustering
**score**: Distance au centroïde ; bruit DBSCAN
**force**: Réutilise les algos
**angle_mort**: Aberrants faussent les clusters
**approche**: Reconstruction
**score**: ‖x − x̂‖ (ACP, auto-encodeur)
**force**: Haute dimension
**angle_mort**: Hypothèse de structure sous-jacente
**lof_formule**: density(x,k) = 1 / (dist. moyenne aux k-PPV) ; LOF ≈ 1 = normal, LOF >> 1 = anomalie
**distinction**: Bruit = erreur non intéressante ; anomalie = objet rare potentiellement intéressant
**evaluation**: Précision / Rappel / F1 / AUC — jamais l'exactitude seule (classes déséquilibrées)
**10_reflexes_examen**: - 1. Standardiser avant K-means / CAH / DBSCAN (et savoir pourquoi).
- 2. K-means : affecter PUIS recalculer ; SSE au carré ; optimum local.
- 3. Coude = inflexion de SSE(K), jamais «K qui minimise la SSE».
- 4. Silhouette : b = cluster voisin le plus proche ; distances NON au carré.
- 5. CAH : recalculer toute la matrice après chaque fusion ; hauteur dendrogramme = distance de fusion.
- 6. DBSCAN : énoncer la convention de comptage (point inclus dans son voisinage) ; bordure = dans le cluster, bruit = non.
- 7. Support : diviser par N ; confiance : diviser par σ(antécédent).
- 8. Apriori élague les SUR-ensembles des non-fréquents ; un candidat survivant peut mourir au comptage.
- 9. Confiance forte sans lift > 1 = règle sans intérêt.
- 10. z-score : moyenne et sigma calculés AVEC l'anomalie (masquage — à mentionner).

## Constraints

- Standardiser systématiquement avant tout algo à distance.
- K-means : optimum local uniquement — relancer n_init fois.
- L'exactitude seule est insuffisante pour évaluer la détection d'anomalies (classes déséquilibrées).
- Lift > 1 est nécessaire pour qu'une règle d'association soit réellement positive.
- CAH : fusions irréversibles, pas d'optimum global garanti.
- DBSCAN : le point est compté dans son propre voisinage (convention à préciser).

## Examples

**context**: K-means
**description**: 6 points A(1,1) B(2,1) C(4,3) D(5,4) E(1,2) F(5,3), init centroïdes A et C
**result**: Convergence en 2 itérations → clusters {A,B,E} μ=(1.33;1.33) et {C,D,F} μ=(4.67;3.33), SSE=2.667
**context**: Apriori
**description**: 5 transactions, minsup=3 : Pain=4, Lait=4, Couches=4, Bière=3, Cola=2, Œufs=1
**result**: F1={Pain,Lait,Couches,Bière} ; paires fréquentes à support 3 : 4 itemsets ; triple {Pain,Lait,Couches} éliminé (support=2). Comptage naïf=41, élagué=13. c(Bière→Couches)=1.0 lift=1.25 ✓ ; c(Lait→Couches)=0.75 lift=0.94 → rejeté.

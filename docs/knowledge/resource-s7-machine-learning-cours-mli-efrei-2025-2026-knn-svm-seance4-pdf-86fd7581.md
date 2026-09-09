---
id: >-
  resource-s7-machine-learning-cours-mli-efrei-2025-2026-knn-svm-seance4-pdf-86fd7581
slug: >-
  resource-s7-machine-learning-cours-mli-efrei-2025-2026-knn-svm-seance4-pdf-86fd7581
source_key: 'sha256:86fd758179f185110f99773a05788ccc0c73a57335ddd5686d3508b85f31e1c0'
part_of: resource-s7-machine-learning-f79ea225
order: 10
manifest: null
derived_from: 'sha256:86fd758179f185110f99773a05788ccc0c73a57335ddd5686d3508b85f31e1c0'
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
  - KNN
  - SVM
  - classification
  - distance-metrics
  - kernel
  - hyperplan
  - vaste-marge
  - slack-variables
domain: Machine Learning
---
# S7 - machine learning — cours_MLI_efrei_2025_2026_KNN_SVM_Seance4.pdf

## Summary

Fiche de référence sur deux algorithmes de classification fondés sur la distance : KNN (K-Nearest Neighbors) et SVM (Support Vector Machine). KNN est un lazy learner non-paramétrique classant un point selon la majorité des k voisins les plus proches. SVM trouve l'hyperplan à vaste marge séparant les classes, avec variantes linéaire séparable (hard margin), non séparable (slack variables + paramètre C) et non linéaire (kernel trick). Couvre formules de distance, choix de k, formulation d'optimisation primale SVM et extension multiclasse One-vs-All.

## Fields/API

**name**: KNN — Principe
**value**: Lazy learner non-paramétrique : aucune phase d'entraînement. Un nouveau point est classé selon la majorité des k voisins les plus proches (classification) ou leur moyenne (régression). Analogue à 'résoudre un problème en s'inspirant d'une situation similaire déjà vécue'.
**name**: KNN — Démarche (4 étapes)
**value**: 1. Choisir k. 2. Calculer la distance entre le nouveau point et tous les points du dataset. 3. Trier et sélectionner les k plus proches voisins. 4. Attribuer l'étiquette majoritaire (classification) ou la moyenne (régression).
**name**: KNN — Choix de k
**value**: k faible → biais faible, variance élevée, surapprentissage, sensible au bruit. k élevé → biais élevé, variance faible, sous-apprentissage. Pratique : démarrer à k=3 ou k=5, affiner par validation croisée ou méthode du coude (Elbow method).
**name**: KNN — Métriques de distance
**value**: Euclidienne (la plus courante) : d_E(x,y) = √Σ(xᵢ−yᵢ)². Manhattan (suivi des axes) : d_M(x,y) = Σ|xᵢ−yᵢ|. Hamming (données catégorielles) : d_H(x,y) = Σ 1(xᵢ≠yᵢ). Le choix doit être rigoureux, pas intuitif.
**name**: KNN — Avantages / Inconvénients
**value**: Avantages : simple, sans entraînement, applicable en classification et régression, non-paramétrique. Inconvénients : coût computationnel élevé à l'inférence (calcul sur tout le dataset), stockage intégral des données, sensible au bruit, dégradation en haute dimension (curse of dimensionality).
**name**: SVM — Principe général
**value**: Trouve l'hyperplan H de dimension N−1 (dans un espace N-D) séparant les classes avec la marge maximale M = 2/‖w‖. Les points les plus proches de H sont les vecteurs de support. Frontière de décision : f(x) = w⊤x + b = 0.
**name**: SVM linéaire séparable — Formulation primale
**value**: min_(w,b) ½‖w‖²  sous contrainte : yᵢ(w⊤xᵢ + b) ≥ 1, ∀i. Minimiser ‖w‖ revient à maximiser la marge. Méthode de résolution : optimisation sous contrainte par lagrangien (dual).
**name**: SVM non séparable — Slack variables (soft margin)
**value**: Variables d'écart ξᵢ ≥ 0 mesurant l'écart à la contrainte. Formulation : min_(w,b,ξ) ½‖w‖² + C·Σξᵢ  sous yᵢ(w⊤xᵢ+b) ≥ 1−ξᵢ, ξᵢ≥0, ∀i. Interprétation : ξᵢ=0 → dans la marge dure ; 0<ξᵢ<1 → bien classé mais dans la marge ; ξᵢ≥1 → mal classé.
**name**: SVM — Paramètre C (compromis marge/erreur)
**value**: C grand → forte pénalisation des erreurs (Σξᵢ), marge plus petite, risque de surapprentissage. C petit → tolère davantage d'erreurs, marge plus grande, plus robuste au bruit, risque de sous-apprentissage si trop petit.
**name**: SVM non linéaire — Kernel trick
**value**: Quand les données ne sont pas linéairement séparables, on les projette dans un espace de dimension supérieure via une fonction noyau (kernel) F. Exemple : F(x,y) = x²+y² projette les données 2D en 3D où elles deviennent linéairement séparables.
**name**: SVM multiclasse — One-vs-All
**value**: Un SVM binaire entraîné par classe k (classe k vs. toutes les autres). Prédiction finale : j = argmaxₖ hₖ(x) où hₖ est la fonction de décision du k-ième SVM. Exemple : 3 SVM pour rouge/bleu/vert → chacun distingue sa couleur du reste.

## Constraints

- KNN : k impair recommandé pour la classification binaire afin d'éviter les égalités de vote.
- SVM hard margin : applicable uniquement si les données sont linéairement séparables ; sinon utiliser soft margin.
- SVM soft margin : ξᵢ ≥ 0 obligatoire ∀i ; C > 0 est un hyperparamètre à régler par validation croisée.
- Hamming : métrique valide uniquement pour features catégorielles (comptage de différences), non applicable à des features continues.
- Kernel non linéaire : le choix du noyau ne doit pas être basé sur des intuitions — valider empiriquement.
- Choix de k (KNN) et C (SVM) : ne jamais décider par intuition ; utiliser systématiquement la validation croisée ou la méthode du coude.

## Examples

- KNN binaire : k=3, voisins = {rouge, rouge, bleu} → classé rouge. Avec k=5 et {rouge, rouge, bleu, bleu, bleu} → classé bleu.
- SVM linéaire (application cours) : 3 hyperplans candidats d1=75%, d2=100%, d3=100% ; seuil >90% → retenir d2 et d3 ; choisir celui avec la plus grande marge r=2/‖w‖.
- SVM non linéaire (application cours) : kernel F=x², transformation des vecteurs, puis sélection identique par accuracy et marge maximale.
- SVM multiclasse couleurs : 3 SVM — rouge vs reste, bleu vs reste, vert vs reste ; classe prédite = argmax des scores hₖ(x).
- Slack variable interprétée : ξ=0.4 → point correctement classé mais dans la zone de marge ; ξ=1.2 → point du mauvais côté de l'hyperplan (erreur de classification).

---
id: resource-s7-machine-learning-seance6-pdf-5290ad31
slug: resource-s7-machine-learning-seance6-pdf-5290ad31
source_key: 'sha256:5290ad3171a19087cc9285a91d2d0f377a22179b915150aee5a94a0979057e60'
part_of: resource-s7-machine-learning-f79ea225
order: 23
manifest: null
derived_from: 'sha256:5290ad3171a19087cc9285a91d2d0f377a22179b915150aee5a94a0979057e60'
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
  - ensemble-learning
  - bagging
  - boosting
  - random-forest
  - adaboost
  - classification
domain: Machine Learning
---
# S7 - machine learning — seance6.pdf

## Summary

L'Ensemble Learning combine plusieurs modèles (hypothèses) pour réduire l'erreur de prédiction. Deux grandes familles existent pour les ensembles homogènes (même algorithme, données variées) : le Bagging (rééchantillonnage bootstrap, vote majoritaire) et le Boosting (pondération adaptative des exemples mal classés, vote pondéré). Random Forest est l'exemple canonique de Bagging appliqué aux arbres de décision ; AdaBoost est l'algorithme de référence du Boosting.

## Fields/API

**name**: Ensemble Learning — principe général
**description**: Sélectionner M hypothèses et combiner leurs prédictions (vote majoritaire ou vote pondéré). Permet de réduire drastiquement la probabilité de mal classer un exemple par rapport à un modèle unique.
**name**: Types d'apprenants différents
**description**: Algorithmes différents, hyperparamètres différents, ou sous-ensembles de données différents. Ensembles homogènes : même algorithme, données modifiées (Bagging ou Boosting).
**name**: Bagging (Bootstrap Aggregation — Breiman 1996)
**description**: Tirage avec remise de N exemples (bootstrap) répété M fois → M modèles entraînés sur M échantillons indépendants → vote majoritaire. Réduit la variance des modèles instables (arbres de décision, réseaux de neurones).
**name**: Random Forest
**description**: Bagging + Random Feature Selection (RFS) appliqué aux arbres de décision. Deux hyperparamètres clés : L (nombre d'arbres) et p (nombre de features aléatoires par nœud). Valeurs populaires de p : 1, log₂(d), √d. Si peu de features non pertinentes → p faible (≈ √d) ; si beaucoup → p élevé. Détecter la convergence via l'erreur out-of-bag.
**name**: Boosting — apprenants forts vs faibles
**description**: Apprenant faible : précision > 0,5 (mieux qu'aléatoire). Apprenant fort : précision arbitrairement élevée. Théorème : un ensemble d'apprenants faibles peut construire un apprenant fort.
**name**: AdaBoost (Freund & Schapire 1996)
**description**: Algorithme : (1) Initialiser poids égaux pour tous les exemples. (2) À chaque itération t : entraîner classificateur faible hₜ, augmenter le poids des exemples mal classés. (3) Vote pondéré final des T classificateurs (poids αₜ proportionnel à la performance de hₜ). Formule finale : H(x) = sign(Σ αₜ hₜ(x)).
**name**: Avantages / Inconvénients du Boosting
**description**: Avantages : implémentation simple, sélection implicite de features, bonne généralisation. Inconvénients : optimisation séquentielle (non globalement optimale), sensibilité aux données bruitées et aux outliers.

## Constraints

- Bagging suppose l'indépendance des modèles — la variance est réduite mais le biais reste inchangé.
- Boosting est séquentiel : chaque apprenant dépend du précédent, ce qui empêche la parallélisation native.
- Random Forest : la valeur optimale de p dépend du ratio features pertinentes/non pertinentes — à estimer via gain d'information ou autre mesure d'importance avant tuning.
- AdaBoost est sensible aux outliers : un exemple bruité peut concentrer l'ensemble du poids sur lui seul.

## Examples

- Prévisions météorologiques : 5 modèles produisent des prédictions différentes, on combine par vote pour obtenir la prévision finale.
- Random Forest sur un dataset d dimensions : p = √d features aléatoires par nœud, L arbres, résultat = vote majoritaire (classification) ou moyenne (régression).
- AdaBoost avec stumps de décision : après 3 rounds, l'hypothèse finale combine 3 stumps avec des poids αₜ reflétant leur précision respective.

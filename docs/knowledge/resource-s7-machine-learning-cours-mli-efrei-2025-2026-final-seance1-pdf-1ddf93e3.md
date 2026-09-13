---
id: >-
  resource-s7-machine-learning-cours-mli-efrei-2025-2026-final-seance1-pdf-1ddf93e3
slug: >-
  resource-s7-machine-learning-cours-mli-efrei-2025-2026-final-seance1-pdf-1ddf93e3
source_key: 'sha256:1ddf93e3447b6effad3742130a8d95604ad814ef12966cc746b0a20be646f387'
part_of: resource-s7-machine-learning-f79ea225
order: 12
manifest: null
derived_from: 'sha256:1ddf93e3447b6effad3742130a8d95604ad814ef12966cc746b0a20be646f387'
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
  - supervised-learning
  - unsupervised-learning
  - semi-supervised
  - reinforcement-learning
  - data-preprocessing
  - loss-functions
  - bias-variance
  - overfitting
  - classification
  - regression
  - metrics
  - feature-selection
  - normalisation
domain: machine-learning
---
# S7 - machine learning — cours_MLI_efrei_2025_2026_final_seance1.pdf

## Summary

Cours introductif Machine Learning I (EFREI Paris, 2025-2026, Blaiech / Tay). Couvre les définitions fondamentales de l'IA et du ML, les quatre paradigmes d'apprentissage, le pipeline ML en 6 étapes, le prétraitement des données (nettoyage, normalisation, sélection de features), les fonctions de perte et de coût, les métriques d'évaluation (classification et régression), la notion de risque réel vs empirique, et le compromis biais-variance avec overfitting/underfitting.

## Fields/API

**name**: Définitions IA
**value**: Minsky : science permettant aux machines de faire ce qui nécessite de l'intelligence chez l'humain. Feigenbaum : partie de l'informatique concevant des systèmes intelligents. Turing : ce qui rend indistinguable tâche humaine / machine. Darwin : ce qui permet la survie par adaptation à l'environnement.
**name**: Machine Learning
**value**: Capacité des ordinateurs à apprendre à effectuer des tâches sans être explicitement programmés. Formellement : un programme apprend de l'expérience E par rapport à une classe de tâches T et une mesure de performance P si sa performance sur T (mesurée par P) s'améliore avec E.
**name**: Pipeline ML (6 étapes)
**value**: 1. Comprendre et définir les objectifs. 2. Collecter / prétraiter / visualiser / analyser les données. 3. Concevoir l'approche (choix et entraînement du modèle). 4. Évaluer la performance (métriques). 5. Revenir à l'étape 2 si nécessaire. 6. Déploiement, utilisation et interprétation des résultats.
**name**: Types de ML
**value**: Supervisé : apprentissage sur exemples étiquetés {(xi, yi)}, estimation de f: X→Y. Non supervisé : seuls les xi sont disponibles, on cherche la structure interne (clustering). Semi-supervisé : petite partie étiquetée + grande partie non étiquetée → pseudo-labels → raffinement. Par renforcement : agent perçoit l'environnement, agit, reçoit récompense/punition, maximise la récompense cumulative.
**name**: Régression vs Classification
**value**: Régression : Y est un sous-ensemble de R^d (quantitatif, continu) — perte quadratique. Classification : Y est un ensemble discret non ordonné (qualitatif) — perte 0-1, Hinge (binaire), Cross-Entropy (multi-classe). Exemples régression : prix, chiffre d'affaires. Exemples classification : images, détection d'objets.
**name**: Prétraitement : Data Cleaning
**value**: 60 % du temps d'un data scientist. Opérations : filtrage, traitement des valeurs manquantes, traitement des exceptions/erreurs/outliers, combinaison multi-sources, consolidation. Problèmes fréquents : incomplétude, bruit, incohérence.
**name**: Normalisation des données
**value**: Standardisation (z-score) : x' = (x − μ) / σ → moyenne 0, écart-type 1. À utiliser si distribution gaussienne approchée ou variables d'unités très différentes. Min-max scaling : x' = (x − x_min) / (x_max − x_min) → ramène dans [0,1]. Préféré pour algorithmes basés sur la distance (k-NN, réseaux de neurones, gradient).
**name**: Feature Selection
**value**: Filter methods : score statistique par feature (Pearson, Chi-square, Mutual Information) — tri puis sélection indépendante du modèle. Wrapper methods : recherche combinatoire évaluée par un modèle prédictif (ex. RFE). Embedded methods : sélection intégrée à la construction du modèle via régularisation (Lasso, Ridge).
**name**: Fonctions de perte L(Y, f(X))
**value**: Quadratique : (Y − f(X))². L1 (déviation absolue) : |Y − f(X)|, robuste aux outliers. 0-1 : 0 si y = f(x), 1 sinon. Hinge : max(0, 1 − y·f(x)). Binary Cross-Entropy : −[Y·log(f(X)) + (1−Y)·log(1−f(X))]. Multi-classe : Cross-Entropy.
**name**: Risque réel vs empirique
**value**: Risque réel R(f) = E_{(X,Y)}[L(Y,f(X))] = ∫ L(y,f(x))p(x,y)dxdy. Non minimisable directement (p(X,Y) inconnu). Risque empirique R_emp(f) = (1/N) Σ L(yi, f(xi)) — minimisé sur les données d'entraînement disponibles. Objectif : f* = argmin_{f∈H} R(f); en pratique : f̂ = argmin_{f∈H} R_emp(f).
**name**: Sélection de modèle
**value**: Approche de base (N grand) : split aléatoire D = D_train ∪ D_val ∪ D_test. Entraîner sur D_train, sélectionner sur D_val, tester une seule fois sur D_test. Validation croisée K-fold (N petit/moyen) : diviser en K parties égales, entraîner sur K−1, évaluer sur la k-ième, moyenner les K erreurs → erreur de validation croisée.
**name**: Métriques classification
**value**: Matrice de confusion : TP, TN, FP, FN. Accuracy = (TP+TN)/(P+N). Error rate = (FP+FN)/(P+N). Recall (sensibilité) = TP/P. Spécificité = TN/N. Precision = TP/(TP+FP). F1 = 2·precision·recall/(precision+recall). Fβ = (1+β²)·precision·recall / (β²·precision+recall).
**name**: Métriques régression
**value**: MAE (Mean Absolute Error) : moyenne des |yi − ŷi|, robuste aux outliers. MSE (Mean Squared Error) : moyenne des (yi − ŷi)², pénalise fortement les grandes erreurs. R² (coefficient de détermination) : 1 = modèle parfait, 0 = pas mieux que la moyenne, <0 = pire que la moyenne.
**name**: Biais-Variance
**value**: Erreur totale = Biais² + Variance + Erreur irréductible. Biais : différence entre prédiction moyenne et valeur cible (modèle trop simple). Variance : sensibilité aux fluctuations des données d'entraînement (modèle trop complexe). Faible biais + faible variance = bon modèle. Faible biais + forte variance = overfitting. Fort biais + faible variance = underfitting.
**name**: Overfitting vs Underfitting
**value**: Underfitting : modèle trop simple, train error élevée, test error élevée. Solution : augmenter la complexité, ajouter des variables, plus d'itérations. Overfitting : modèle trop complexe, train error ≈ 0, test error élevée. Solution : réduire la complexité, régularisation (Dropout, L1/L2), augmenter les données d'entraînement.

## Constraints

- Le risque réel R(f) ne peut pas être minimisé directement car la distribution jointe p(X,Y) est inconnue dans presque toutes les applications pratiques.
- D_test ne doit être utilisée qu'une seule fois (après sélection définitive du modèle sur D_val).
- La standardisation z-score n'est optimale que si les données suivent approximativement une distribution gaussienne.
- Le risque empirique seul n'est pas approprié pour la sélection de modèles : si H est suffisamment grand, R_emp(f) → 0 mais l'erreur de généralisation reste élevée (overfitting).
- Il est généralement impossible pour un modèle de minimiser simultanément biais et variance (compromis inévitable).

## Examples

- Supervisé — météo : features (Weather, Temperature, Wind Speed) + label (Enjoy Sports) → modèle prédit Yes/No pour nouvelles observations.
- Non supervisé — clustering consommation : regroupement de produits (raquette, basket, console) par plage horaire et volume d'achat sans étiquette préalable.
- Semi-supervisé — données étiquetées (Sunny/Warm → Yes) + données non étiquetées (Rainy/Cold → ?) : génération de pseudo-labels puis raffinement itératif.
- Normalisation z-score : une feature de température en °C (μ=20, σ=5) → valeur 25 devient x'=(25−20)/5=1.
- Validation croisée 5-fold sur dataset moyen : chaque fold sert tour à tour de validation, erreur finale = moyenne des 5 erreurs de validation.
- Overfitting DL : réseau profond entraîné trop longtemps sur peu de données → train accuracy 99%, test accuracy 60% → solution : Dropout + augmentation de données.

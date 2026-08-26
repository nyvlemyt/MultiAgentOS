---
id: >-
  resource-s7-machine-learning-cours-mli-efrei-2025-2026-final-seance2-pdf-8545140a
slug: >-
  resource-s7-machine-learning-cours-mli-efrei-2025-2026-final-seance2-pdf-8545140a
source_key: 'sha256:8545140adee3b9f4c8e120b976821570350af5f448ba6652a2924acc1b7cdd03'
part_of: S7 - machine learning
order: 11
manifest: null
derived_from: 'sha256:8545140adee3b9f4c8e120b976821570350af5f448ba6652a2924acc1b7cdd03'
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
doc_type: explanation
actionability: resource
lane: knowledge
schema_version: '1'
tags:
  - decision-tree
  - logistic-regression
  - ID3
  - C4.5
  - information-gain
  - entropy
  - ROC
  - AUC
  - softmax
  - classification
  - supervised-learning
domain: machine-learning
---
# S7 - machine learning — cours_MLI_efrei_2025_2026_final_Seance2.pdf

## Thesis

Les arbres de décision et la régression logistique sont deux familles d'algorithmes de classification supervisée fondamentaux : les premiers partitionnent l'espace des features par des tests hiérarchiques interprétables ; la seconde transforme une combinaison linéaire en probabilité via la sigmoïde, avec extension multi-classes via softmax.

## Context

Cours MLI EFREI Paris 2025-2026 (Séance 2). Prérequis : notions d'algèbre linéaire, probabilités élémentaires, concept de dataset train/test. Deux algorithmes emblématiques présentés en séquence : arbres (ID3 → C4.5) puis régression logistique (binaire → multi-classes → évaluation ROC/AUC).

## Reasoning

**Arbres de décision — structure.** Un arbre est un graphe orienté dont les nœuds sont de trois types : racine (contient l'ensemble d'apprentissage D), nœuds de division (splitting nodes, portent une règle S_N : x → {left, right}), feuilles (portent une prédiction P_N = λ_i ou un vecteur de probabilités de classe). La prédiction d'une instance x = traversée de la racine à une feuille en évaluant chaque règle de division.

**ID3 — construction par gain d'information.** L'algorithme est récursif : (1) si tous les exemples de E appartiennent à la même classe → créer une feuille étiquetée ; (2) sinon choisir le test T_i qui maximise le gain d'information gain(T) = I(p,n) − E(T), où I(p,n) est l'entropie du nœud courant et E(T) l'entropie moyenne pondérée des sous-partitions. L'entropie d'une partition à k classes s'écrit I(partition) = −Σ p_i log₂(p_i). Le test retenu induit une partition de E ; l'algorithme s'applique récursivement à chaque sous-ensemble. Exemple Iris : Petal length ≤ 2.45 isole setosa ; Petal width ≥ 1.75 sépare virginica de versicolor.

**C4.5 — corrections de ID3.** Deux problèmes résolus : (a) *Biais vers les attributs à forte cardinalité* (ex. identifiant unique d'un patient : E(T)=0 mais sans pouvoir prédictif) → normalisation par SplitInfo(T) = −Σ (||T_i||/||T||) log₂(||T_i||/||T||), d'où GainRatio(T) = gain(T)/SplitInfo(T). (b) *Attributs continus* → discrétisation automatique : tri des exemples selon A, test de seuils A > (a_i + a_{i+1})/2 pour toutes valeurs consécutives.

**Régression logistique — principe.** Pour z = wx + b, le modèle applique la sigmoïde : P(Y=1|x) = e^z/(1+e^z), P(Y=0|x) = 1/(1+e^z). La classe prédite est celle de probabilité maximale. La fonction de perte est la log-vraisemblance négative (entropie croisée binaire) : J(w) = −(1/m) Σ [y ln h_w(x) + (1−y) ln(1−h_w(x))]. Optimisation par descente de gradient.

**Softmax — extension multi-classes.** Attribue une probabilité à chaque classe, la somme valant 1. Exemple : {grape: 0.09, orange: 0.22, apple: 0.68, banana: 0.01} → prédit apple.

**ROC et AUC — évaluation seuil-indépendante.** TPR = TP/(TP+FN) (sensibilité), FPR = FP/(FP+TN). La courbe ROC trace TPR vs FPR pour tous les seuils possibles. L'AUC (aire sous la courbe) mesure la capacité du modèle à ordonner correctement les positifs devant les négatifs, indépendamment du seuil : AUC=1 → parfait ; AUC=0.5 → aléatoire.

## Trade-offs

**Arbre de décision vs régression logistique.** Les arbres sont très interprétables (règles if/else lisibles), mais tendent à sur-apprendre (overfitting) sur des données bruitées et produisent des frontières de décision en escaliers. La régression logistique est plus robuste et donne des probabilités calibrées, mais ne capture que des frontières linéaires (dans l'espace original). **ID3 vs C4.5.** ID3 favorise artificiellement les attributs à grand nombre de valeurs distinctes ; C4.5 corrige cela via GainRatio mais au prix d'un hyperparamètre supplémentaire (SplitInfo peut être très faible pour certains tests, rendant GainRatio instable). **Seuil de classification.** La régression logistique exige de choisir un seuil ; ROC/AUC découple l'évaluation de ce choix, ce qui est crucial en contexte déséquilibré (médecine, fraude).

## See also

- Random Forest (ensemble d'arbres)
- Gradient Boosting / XGBoost
- SVM (frontières non linéaires)
- Réseaux de neurones (softmax comme couche finale)
- Matrice de confusion et métriques F1/précision/rappel

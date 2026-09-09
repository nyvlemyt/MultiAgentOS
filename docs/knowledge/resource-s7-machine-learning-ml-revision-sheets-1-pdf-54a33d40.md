---
id: resource-s7-machine-learning-ml-revision-sheets-1-pdf-54a33d40
slug: resource-s7-machine-learning-ml-revision-sheets-1-pdf-54a33d40
source_key: 'sha256:54a33d40bbd9a284f14a2da3fc2f9d43b15cd9ed67bc3d9657221a2ac1688a0e'
part_of: resource-s7-machine-learning-f79ea225
order: 15
manifest: null
derived_from: 'sha256:54a33d40bbd9a284f14a2da3fc2f9d43b15cd9ed67bc3d9657221a2ac1688a0e'
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
  - classification
  - regression
  - supervised-learning
  - ensemble-learning
  - SVM
  - KNN
  - naive-bayes
  - decision-tree
  - gradient-descent
  - formulas
  - metrics
  - EFREI
domain: machine-learning
---
# S7 - machine learning — ml_revision_sheets (1).pdf

## Summary

Fiches de révision Machine Learning EFREI 2025-2026 couvrant les types d'apprentissage, métriques d'évaluation, et huit familles d'algorithmes (Arbres de décision, Régression logistique, Naive Bayes, KNN, SVM, Régression linéaire, SVR, Ensemble Learning) avec leurs formules clés, hyperparamètres, avantages et limites.

## Fields/API

**types_apprentissage**: **supervisé**: Données étiquetées (X,Y) — classification (Y discret) ou régression (Y continu)
**non_supervisé**: Données non étiquetées — clustering, réduction de dimension
**par_renforcement**: Agent + Environnement — maximiser récompenses cumulées
**feature_engineering**: **standardisation**: z = (x − µ) / σ
**normalisation**: x_norm = (x − x_min) / (x_max − x_min)
**metriques_classification**: **accuracy**: (TP+TN) / (TP+TN+FP+FN)
**precision**: TP / (TP+FP)
**recall**: TP / (TP+FN)
**f1**: 2 · Precision · Recall / (Precision + Recall)
**TPR**: TP / (TP+FN)
**FPR**: FP / (FP+TN)
**AUC**: 1 = parfait, 0.5 = aléatoire
**metriques_regression**: **MAE**: (1/n) Σ |y_i − ŷ_i|
**MSE**: (1/n) Σ (y_i − ŷ_i)²
**RMSE**: √MSE
**R2**: 1 − Σ(y_i − ŷ_i)² / Σ(y_i − ȳ)²
**arbres_decision**: **structure**: Nœud racine → Nœuds internes → Feuilles (décisions)
**ID3_entropie**: H(S) = −Σ p_i log₂(p_i)
**ID3_gain**: Gain(S,A) = H(S) − Σ (|Sv|/|S|) H(Sv) → choisir attribut à gain maximal
**C45_split_info**: SplitInfo = −Σ (|Ti|/|T|) log₂(|Ti|/|T|)
**C45_gain_ratio**: GainRatio = Gain(T) / SplitInfo(T) — corrige le biais vers attributs à nombreuses valeurs
**regression_logistique**: **sigmoide**: σ(z) = 1/(1+e^−z) = e^z/(1+e^z), avec z = w^T x + b
**binaire**: P(Y=1|x) = σ(w^T x + b); P(Y=0|x) = 1 − P(Y=1|x)
**multiclasse_softmax**: P(Y=k|x) = e^zk / Σ_j e^zj
**naive_bayes**: **theoreme_bayes**: P(C_k|x) = P(x|C_k) · P(C_k) / P(x)
**hypothese_naive**: Indépendance conditionnelle: P(x|C_k) = Π_i P(x_i|C_k)
**classification**: ŷ = argmax_k P(C_k) · Π_i P(x_i|C_k)
**gaussien**: P(x_i|C_k) = (1/√(2πσ²_k)) · exp(−(x_i − µ_k)² / (2σ²_k))
**KNN**: **principe**: Lazy learner — classification par vote majoritaire des k plus proches voisins
**distance_euclidienne**: d_E = √Σ(x_i − y_i)²
**distance_manhattan**: d_M = Σ|x_i − y_i|
**distance_hamming**: d_H = Σ 1(x_i ≠ y_i)
**choix_k**: k petit → overfitting (sensible au bruit); k grand → underfitting; utiliser validation croisée, k impair
**SVM**: **principe**: Trouver l'hyperplan optimal séparant les classes avec marge maximale
**hyperplan**: w^T x + b = 0
**distance_hyperplan**: d(x,H) = |w^T x + b| / ||w||
**marge**: M = 2 / ||w||
**optimisation**: min (1/2)||w||² + C Σξ_i, s.c. y_i(w^T x_i + b) ≥ 1 − ξ_i
**parametre_C**: C grand → peu d'erreurs, marge étroite; C petit → plus d'erreurs, marge large
**kernels**: **lineaire**: K = x^T y
**polynomial**: K = (x^T y + c)^d
**RBF**: K = exp(−γ||x−y||²)
**regression_lineaire**: **modele**: h_w(x) = w^T x + b; y = w^T x + b + ε
**cout_MSE**: J(w) = (1/2m) Σ (h_w(x^(i)) − y^(i))²
**descente_gradient**: w^(t+1) = w^(t) − α · ∂J/∂w; ∂J/∂w = (1/m) X^T(Xw + b1 − y)
**solution_analytique**: w = (X^T X)^−1 X^T y
**regularisation_ridge_L2**: J = (1/2m) Σ(h_w − y)² + λ Σ w_j²
**regularisation_lasso_L1**: J = (1/2m) Σ(h_w − y)² + λ Σ|w_j|
**polynomiale**: h_w(x) = w_1 x + w_2 x² + ... + w_n x^n + b (linéaire en paramètres, non-linéaire en x)
**SVR**: **principe**: Variante du SVM pour la régression — f(x) aussi plate que possible, erreurs dans tube ε
**tube_epsilon**: y_i = ⟨w, x_i⟩ + b ± ε; points dans le tube → perte nulle; hors tube → pénalité proportionnelle
**robustesse**: Robuste aux valeurs aberrantes
**kernels**: Mêmes que SVM: Linéaire, Polynomial, RBF
**ensemble_learning**: **principe**: Combiner plusieurs modèles pour réduire l'erreur
**types**: Homogènes (même algo, données différentes) ou Hétérogènes (algos différents)
**bagging**: **etapes**: 1. Tirer M échantillons bootstrap (avec remise) → 2. Entraîner M modèles → 3. Combiner par vote majoritaire
**effet**: Réduit la variance
**random_forest**: **principe**: Bagging + sélection aléatoire de features
**parametres**: L = nombre d'arbres; p = features par nœud (≈ √d)
**adaboost**: **principe**: 1. Pondération adaptative des exemples → 2. Focus sur exemples mal classés → 3. Vote pondéré des classifieurs faibles
**classifieur_final**: f(x) = Σ_t α_t h_t(x)
**algorithme**: Poids initiaux uniformes; pour t=1 à T: entraîner h_t pondéré → calculer ε_t → α_t = (1/2) ln((1−ε_t)/ε_t) → augmenter poids des mal classés → H(x) = sign(Σ α_t h_t(x))
**avantages**: Simple, bonne généralisation
**inconvenients**: Sensible au bruit

## Constraints

**overfitting**: Modèle trop complexe → mémorise; solution: validation croisée, régularisation
**underfitting**: Modèle trop simple → ne capture pas le signal
**KNN_complexite**: Coût O(n·d) à l'inférence
**naive_bayes_hypothese**: Suppose l'indépendance conditionnelle des features (rarement vraie en pratique)
**regression_logistique_limite**: Frontière de décision linéaire
**SVM_hyperparams**: Sensible au choix de C et du kernel
**random_forest_limite**: Boîte noire (faible interprétabilité)
**adaboost_limite**: Sensible au bruit et aux outliers
**descente_gradient_lr**: α petit → convergence lente; α grand → peut diverger

## Examples

**tableau_comparatif**: **Arbre de décision**: **avantages**: Interprétable
**limites**: Overfitting
**Régression Logistique**: **avantages**: Probabilités
**limites**: Linéaire
**Naive Bayes**: **avantages**: Rapide, peu de données
**limites**: Hypothèse indépendance
**KNN**: **avantages**: Non paramétrique
**limites**: Coût O(nd)
**SVM**: **avantages**: Haute dimension, kernels
**limites**: Hyperparamètres
**Régression Linéaire**: **avantages**: Simple, solution analytique
**limites**: Linéaire
**SVR**: **avantages**: Robuste aux outliers
**limites**: Hyperparamètres
**Random Forest**: **avantages**: Stable, parallélisable
**limites**: Boîte noire
**AdaBoost**: **avantages**: Bonne généralisation
**limites**: Sensible au bruit
**formules_essentielles**: **entropie**: H = −Σ p_i log₂(p_i)
**sigmoide**: σ(z) = 1/(1+e^−z)
**softmax**: P(k) = e^zk / Σ_j e^zj
**bayes**: P(C|x) = P(x|C)P(C) / P(x)
**euclidienne**: d = √Σ(x_i − y_i)²
**marge_SVM**: M = 2/||w||
**gradient**: w ← w − α∇J
**adaboost_alpha**: α_t = (1/2) ln((1−ε_t)/ε_t)

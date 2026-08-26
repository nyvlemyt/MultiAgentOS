---
id: resource-s7-machine-learning-ml-revision-extended-pdf-30f9d3e8
slug: resource-s7-machine-learning-ml-revision-extended-pdf-30f9d3e8
source_key: 'sha256:30f9d3e891f4abfe65a8943157603af587674139d3036f9a195dfcd6856ce02c'
part_of: S7 - machine learning
order: 14
manifest: null
derived_from: 'sha256:30f9d3e891f4abfe65a8943157603af587674139d3036f9a195dfcd6856ce02c'
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
  - evaluation-metrics
  - decision-tree
  - naive-bayes
  - knn
  - svm
  - svr
  - ensemble-learning
  - linear-regression
  - logistic-regression
  - random-forest
  - adaboost
  - overfitting
  - feature-engineering
domain: machine learning
---
# S7 - machine learning — ml_revision_extended.pdf

## Summary

Fiche de révision du cours ML I EFREI 2025-2026 : définitions fondamentales, métriques d'évaluation (classification et régression), et formules canoniques pour dix algorithmes classiques — arbres de décision (ID3/C4.5), régression logistique, Naive Bayes gaussien, KNN, SVM/SVR avec kernels, régression linéaire avec régularisation, Bagging, Random Forest et AdaBoost.

## Fields/API

**name**: Types d'apprentissage
**content**: Supervisé {(x_i, y_i)} → Classification (Y discret) ou Régression (Y continu). Non supervisé {x_i} → Clustering, réduction de dimension (PCA, t-SNE). Semi-supervisé : peu d'étiquettes + pseudo-labels. Par renforcement : agent explore et adapte via récompenses/punitions.
**name**: Processus ML (6 étapes)
**content**: 1. Définir les objectifs. 2. Collecter/prétraiter/visualiser. 3. Choisir et entraîner le modèle. 4. Évaluer (métriques). 5. Itérer. 6. Déployer.
**name**: Feature Engineering
**content**: Standardisation Z-score : z = (x−µ)/σ → centre en 0, écart-type 1. Normalisation Min-Max : x_norm = (x−x_min)/(x_max−x_min) → [0,1]. Sélection : Filter (corrélation, Chi-2, MI), Wrapper (RFE), Embedded (Lasso, Ridge).
**name**: Overfitting / Underfitting
**content**: Overfitting : modèle trop complexe, mémorise le bruit, train↓↓ test↑. Remède : régularisation, plus de données, simplifier. Underfitting : modèle trop simple, train↑ test↑. Remède : plus de features, modèle plus complexe. Validation croisée K-Fold : diviser en K parties, entraîner sur K−1, tester sur 1, moyenner.
**name**: Métriques de classification
**content**: Matrice de confusion : TP, FP, FN, TN. Accuracy = (TP+TN)/(TP+TN+FP+FN). Precision = TP/(TP+FP). Recall = TP/(TP+FN). Specificity = TN/(TN+FP). F1 = 2·P·R/(P+R). ROC : courbe TPR vs FPR. AUC=1 parfait, ≈0.9 bon, =0.5 aléatoire.
**name**: Métriques de régression
**content**: MAE = (1/n)Σ|y_i−ŷ_i| (robuste aux outliers). MSE = (1/n)Σ(y_i−ŷ_i)². RMSE = √MSE. R² = 1 − Σ(y_i−ŷ_i)²/Σ(y_i−ȳ)² : 1=parfait, 0=pas mieux que la moyenne, <0=pire.
**name**: Arbres de décision — ID3 / C4.5
**content**: Entropie : H(S) = −Σp_i·log₂(p_i). H=0 pur, H_max classes équiréparties. Gain d'information : Gain(S,A) = H(S) − Σ(|S_v|/|S|)·H(S_v). Choisir l'attribut à gain maximal. C4.5 : GainRatio = Gain(T)/SplitInfo(T) pour pénaliser les attributs à forte cardinalité. Attributs continus : tester les seuils (a_i+a_{i+1})/2.
**name**: Régression Logistique
**content**: Sigmoïde : σ(z) = 1/(1+e^{−z}) ∈ (0,1), σ(0)=0.5. z = w^T x + b. Binaire : P(Y=1|x)=σ(z). Multi-classe : Softmax P(Y=k|x) = e^{z_k}/Σe^{z_j}. Perte : Binary Cross-Entropy J(w) = −(1/m)Σ[y·ln(ĥ)+(1−y)·ln(1−ĥ)]. Optimisation : descente de gradient.
**name**: Naive Bayes
**content**: Théorème de Bayes : P(C_k|x) = P(x|C_k)·P(C_k)/P(x). Hypothèse naïve : P(x|C_k) = Πᵢ P(x_i|C_k). Décision : ŷ = argmax_k P(C_k)·ΠP(x_i|C_k). NB Gaussien pour variables continues : P(x_i|C_k) = (1/√(2πσ²_k))·exp(−(x_i−µ_k)²/(2σ²_k)). LDA : σ₀=σ₁ → frontière linéaire. QDA : σ₀≠σ₁ → frontière quadratique.
**name**: KNN (K-Nearest Neighbors)
**content**: Lazy learner : pas d'entraînement explicite. Étapes : 1) choisir k, 2) calculer distances, 3) sélectionner k voisins, 4) vote majoritaire (classification) ou moyenne (régression). Distances : Euclidienne √Σ(x_i−y_i)², Manhattan Σ|x_i−y_i|, Minkowski (Σ|x_i−y_i|^p)^{1/p}, Hamming pour catégoriel. k petit : biais↓, variance↑, overfitting. k grand : biais↑, variance↓, underfitting. Bonnes pratiques : démarrer à k=3 ou 5, choisir impair, valider par K-Fold.
**name**: SVM (Support Vector Machine)
**content**: Hyperplan : f(x)=w^T x+b=0. Marge : M=2/||w||. Cas séparable : min (1/2)||w||² s.c. y_i(w^T x_i+b)≥1. Cas non séparable (marge souple) : min (1/2)||w||²+C·Σξ_i ; C grand → overfitting, C petit → underfitting. Kernels : Linéaire (x^T y), Polynomial ((x^T y+c)^d), RBF exp(−γ||x−y||²), Sigmoïde tanh(αx^T y+c). Multiclasse : One-vs-All (K classifieurs) ou One-vs-One (K(K−1)/2 classifieurs, vote).
**name**: Régression Linéaire
**content**: Modèle : h_w(x)=w^T x+b. Coût MSE : J(w,b)=(1/2m)Σ(h_w(x_i)−y_i)². Solution analytique : w*=(X^T X)^{−1}X^T y (nécessite X^T X inversible). Descente de gradient : w_{t+1}=w_t−α·∂J/∂w. α petit=lent mais stable, α grand=peut diverger. Ridge (L2) : J=MSE+λΣw_j² (réduit poids, garde features). Lasso (L1) : J=MSE+λΣ|w_j| (peut annuler des poids → sélection de features). Polynomiale : h=w_1 x+w_2 x²+…+w_n x^n+b (non-linéaire en x, linéaire en w).
**name**: SVR (Support Vector Regression)
**content**: Variante du SVM pour la régression. Objectif : trouver f(x)=⟨w,x⟩+b plate avec erreurs dans un tube ε. Perte ε-insensible : 0 si dans le tube, pénalité proportionnelle sinon. Avantage : robuste aux outliers. Mêmes kernels que SVM.
**name**: Ensemble Learning
**content**: Combiner plusieurs modèles pour réduire l'erreur. Bagging : M échantillons bootstrap (avec remise), entraîner M modèles indépendants, vote majoritaire → réduit la variance. Random Forest = Bagging + sélection aléatoire de √d ou log₂(d) features par nœud. AdaBoost : poids initiaux uniformes 1/n ; à chaque itération t : entraîner h_t, calculer erreur ε_t=Σ_{mal classés} w_i, calculer α_t=(1/2)ln((1−ε_t)/ε_t), augmenter poids des mal classés ; classifieur final H(x)=sign(Σ α_t h_t(x)). Avantages AdaBoost : bonne généralisation, sélection de features. Limites : sensible au bruit, séquentiel.
**name**: Tableau comparatif des modèles
**content**: Arbre décision : interprétable / overfitting. Régression log. : probabilités, rapide / linéaire. Naive Bayes : très rapide / hypothèse d'indépendance. KNN : non-paramétrique / coût O(n·d). SVM : haute dimension, kernels / hyperparamètres. Régression lin. : analytique, simple / linéaire. SVR : robuste outliers / hyperparamètres. Random Forest : stable, parallélisable / boîte noire. AdaBoost : bonne généralisation / sensible au bruit.

## Constraints

- Solution analytique régression linéaire : X^T X doit être inversible (pas de multicolinéarité parfaite).
- Naive Bayes : hypothèse d'indépendance conditionnelle rarement exacte en pratique, mais souvent suffisante.
- KNN : malédiction de la dimension — performances dégradées en haute dimension ; coût de prédiction O(n·d).
- SVM : C contrôle le compromis biais/variance (grand C = overfitting, petit C = underfitting).
- Descente de gradient : α trop grand peut diverger ; α trop petit converge lentement.
- AdaBoost : très sensible aux outliers et au bruit (les mal classés reçoivent des poids croissants).
- K-Fold : répéter K fois et moyenner les erreurs pour une estimation fiable de la performance.

## Examples

- Formules essentielles regroupées : Entropie H=−Σp_i·log₂(p_i) ; Gain(S,A)=H(S)−Σ(|S_v|/|S|)H(S_v) ; Sigmoïde σ(z)=1/(1+e^{−z}) ; Softmax P(k)=e^{z_k}/Σe^{z_j} ; Bayes P(C|x)=P(x|C)P(C)/P(x) ; Marge SVM M=2/||w|| ; Gradient w←w−α∇J ; OLS w*=(X^T X)^{−1}X^T y ; AdaBoost α_t=(1/2)ln((1−ε_t)/ε_t) ; F1=2PR/(P+R) ; R²=1−SS_res/SS_tot.
- Choix de k en KNN : commencer à k=3 (impair pour éviter ex-æquo), ajuster par validation croisée ; si k=1 → overfitting fort, si k=n → underfitting.
- Interprétation AUC : modèle aléatoire AUC=0.5 (diagonale ROC), bon modèle AUC≈0.9, modèle parfait AUC=1.
- Random Forest : avec d=20 features, chaque nœud tire aléatoirement √20≈4 ou log₂(20)≈4 features candidats avant de choisir le meilleur split.

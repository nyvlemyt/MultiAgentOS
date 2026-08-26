---
id: resource-s7-machine-learning-ml-course-notes-1-1-pdf-07078748
slug: resource-s7-machine-learning-ml-course-notes-1-1-pdf-07078748
source_key: 'sha256:07078748681a7ed7dbb1ae42e22b8d6066c9e6595f8bfa794987c481bdeedabb'
part_of: S7 - machine learning
order: 13
manifest: null
derived_from: 'sha256:07078748681a7ed7dbb1ae42e22b8d6066c9e6595f8bfa794987c481bdeedabb'
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
  - feature-engineering
  - decision-tree
  - SVM
  - naive-bayes
  - KNN
  - ensemble-learning
  - gradient-descent
  - evaluation-metrics
domain: machine-learning
---
# S7 - machine learning — ml_course_notes (1)-1.pdf

## Summary

Notes de cours complètes de Machine Learning I (EFREI Paris, 2025-2026). Couvre les quatre paradigmes d'apprentissage, le feature engineering, les métriques d'évaluation, et huit familles d'algorithmes (arbres de décision ID3/C4.5, régression logistique, Naïve Bayes, KNN, SVM/SVR, régression linéaire, Ensemble Learning). Inclut toutes les formules clés et un tableau comparatif final des modèles.

## Fields/API

**name**: Types d'apprentissage
**description**: Supervisé (labels connus, classification ou régression) · Non supervisé (clustering, pas de labels) · Semi-supervisé (peu d'exemples étiquetés + masse non étiquetée) · Renforcement (agent, récompense/punition, exploration/exploitation)
**name**: Processus ML standard
**description**: 6 étapes : définition du problème → collecte/prétraitement (nettoyage, split Train-Val-Test) → choix et entraînement du modèle → évaluation (métriques) → itération → déploiement
**name**: Feature engineering
**description**: Feature selection : Filter (Pearson, Chi², Info mutuelle) · Wrapper (RFE) · Embedded (Lasso, Ridge). Standardisation Z-score : z=(x−µ)/σ. Normalisation Min-Max : x_norm=(x−x_min)/(x_max−x_min). Objectif : réduire dimensionnalité, éviter surapprentissage
**name**: Overfitting vs Underfitting
**description**: Underfitting : modèle trop simple, erreur train ET test élevées → augmenter complexité. Overfitting : modèle trop complexe, erreur train très faible, erreur test élevée → régularisation + plus de données. K-Fold Cross-Validation : diviser D en K sous-ensembles, entraîner sur K−1, évaluer sur le k-ième, moyenner les erreurs
**name**: Métriques classification
**description**: Confusion matrix : TP, TN, FP, FN. Accuracy=(TP+TN)/(P+N). Precision=TP/(TP+FP). Recall=TP/(TP+FN). Specificity=TN/(TN+FP). F1=2·(Precision·Recall)/(Precision+Recall). Fβ=(1+β²)·(P·R)/(β²·P+R). ROC curve : TPR vs FPR pour tous les seuils. AUC=1 parfait, ≈0.9 bon, =0.5 aléatoire
**name**: Métriques régression
**description**: MAE=Σ|yᵢ−ŷᵢ|/n (robuste aux outliers). MSE=Σ(yᵢ−ŷᵢ)²/n (pénalise les grandes erreurs). RMSE=√MSE. R²=1−SSres/SStot : 1=parfait, 0=pas mieux que la moyenne, <0=pire que la moyenne
**name**: Arbres de décision
**description**: Structure : nœud racine → nœuds internes (règles de split) → feuilles (prédictions). ID3 : maximiser le gain d'information gain(T)=I(p,n)−E(T), entropie H=−Σpᵢlog₂pᵢ. C4.5 (Quinlan 1994) : GainRatio=gain(T)/SplitInfo(T), normalise pour éviter le biais vers attributs à nombreuses valeurs. Gère les attributs continus par recherche de seuil (aᵢ+aᵢ₊₁)/2
**name**: Régression logistique
**description**: Modèle de classification via sigmoïde σ(z)=1/(1+e⁻ᶻ) avec z=wᵀx+b. Binaire : P(Y=1|x)=σ(wᵀx+b). Perte : Binary Cross-Entropy (log-vraisemblance négative). Multi-classe : Softmax P(Y=k|x)=e^zk/Σe^zj. Paramètres appris par descente de gradient
**name**: Naïve Bayes
**description**: Théorème de Bayes : P(A|B)=P(B|A)·P(A)/P(B). Hypothèses : indépendance des features, contribution égale. Décision : ŷ=argmax_k P(Cₖ)·Πᵢ P(xᵢ|Cₖ). Variables continues : distribution gaussienne p(x|C=k)∝exp(−(x−µₖ)²/2σₖ²). LDA si σ₀=σ₁, QDA sinon
**name**: KNN
**description**: Lazy learner, pas de phase d'entraînement. Étapes : choisir k → calculer distances → trier → vote majoritaire (classification) ou moyenne (régression). Distances : Euclidienne, Manhattan, Minkowski, Hamming (catégoriel). k faible=biais faible/variance élevée/risque overfitting. k grand=biais élevé/variance faible/risque underfitting. Bonnes pratiques : k impair, valider par cross-validation ou méthode du coude
**name**: SVM
**description**: Objectif : hyperplan à marge maximale M=2/‖w‖. Support vectors = points les plus proches de l'hyperplan. Cas séparable : min ½‖w‖² s.c. yᵢ(wᵀxᵢ+b)≥1. Marge souple : min ½‖w‖²+CΣξᵢ, C grand→petite marge/risque overfitting, C petit→grande marge/risque underfitting. Kernel trick : projeter en dimension supérieure (linéaire, polynomial, RBF, sigmoïde). Multiclasse : OvA (un SVM/classe) ou OvO (un SVM/paire, vote majoritaire)
**name**: Régression linéaire
**description**: Modèle : ŷ=wᵀx+b, erreur suit N(0,σ²). Perte MSE : J(w,b)=1/2m·Σ(ŷ−y)². Solution analytique : w*=(XᵀX)⁻¹Xᵀy. Descente de gradient : w←w−α·∂J/∂w. α petit=convergence lente/stable ; α grand=risque divergence. Régularisation Ridge (L2) et Lasso (L1) contrôlée par λ. Régression polynomiale : extension non-linéaire, reste linéaire en w
**name**: SVR
**description**: Variante SVM pour régression. Tube ε : zone de tolérance autour de f(x), perte nulle à l'intérieur, pénalité proportionnelle à l'extérieur. Robuste aux outliers. Même kernels que SVM. Optimisation convexe
**name**: Ensemble Learning
**description**: Bagging (Breiman 1996) : bootstrap (tirage avec remise) + vote majoritaire → réduit variance. Random Forest = Bagging + sélection aléatoire de p features par nœud (√d populaire). Boosting : pondération adaptative des exemples mal classés. AdaBoost : αₜ=½·ln((1−εₜ)/εₜ), classifieur final f(x)=Σαₜhₜ(x). Avantages : sélection auto de features, bonne généralisation. Inconvénients : sensible au bruit
**name**: Tableau comparatif des modèles
**description**: Arbre décision : interprétable, pas de normalisation requise / instable, overfitting. Régression logistique : simple, rapide / linéaire uniquement. Naïve Bayes : très rapide, peu de données / indépendance rarement vraie. KNN : non-paramétrique / coût O(n·d), sensible bruit. SVM : efficace haute dim. / hyperparams, pas adapté grands datasets. Régression linéaire : solution analytique / linéaire uniquement. SVR : robuste outliers / hyperparams. Random Forest : stable, parallèle / boîte noire. AdaBoost : bonne généralisation / sensible bruit

## Constraints

- Les hypothèses d'indépendance de Naïve Bayes sont rarement vérifiées en pratique
- La solution analytique (XᵀX)⁻¹Xᵀy nécessite que XᵀX soit inversible
- KNN stocke l'intégralité du jeu de données en mémoire ; complexité prédiction O(n·d)
- SVM avec kernel RBF nécessite une normalisation des features
- AdaBoost est une optimisation séquentielle (non globalement optimale) et sensible aux données bruitées
- La régression polynomiale reste linéaire en w ; la non-linéarité vient de l'augmentation de dimension de x
- K-Fold cross-validation conseillée quand le dataset est de taille petite ou moyenne

## Examples

- Formules essentielles : H=−Σpᵢlog₂pᵢ · σ(z)=1/(1+e⁻ᶻ) · Softmax P(k)=e^zk/Σe^zj · Bayes P(C|x)=P(x|C)·P(C)/P(x) · d_E=√Σ(xᵢ−yᵢ)² · Descente gradient w←w−α∇J(w) · w*=(XᵀX)⁻¹Xᵀy · Marge SVM M=2/‖w‖ · F1=2·PR/(P+R) · R²=1−SSres/SStot
- Naïve Bayes Gaussien : P(C=0)=0.6, P(C=1)=0.4, µ₀=0/σ₀=1, µ₁=2/σ₁=1. Pour x=1.2 : p(1.2|C=0)≈0.194, p(1.2|C=1)≈0.290 → P(C=0|1.2)≈0.501, P(C=1|1.2)≈0.499 → classe 0 (au bord de la frontière)
- Dataset Iris : if Petal_length≤2.45 → setosa ; elif Petal_width≥1.75 → virginica ; else → versicolor

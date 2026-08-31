---
id: resource-df-pd-read-csv-votre-fichier-csv-6e2b0bef
slug: resource-df-pd-read-csv-votre-fichier-csv-6e2b0bef
source_key: 'sha256:6e2b0bef2f758c18b132485d26ad72d146c84b184606fd9617dbe2feb0b0e5c8'
part_of: null
order: null
manifest: null
derived_from: 'sha256:6e2b0bef2f758c18b132485d26ad72d146c84b184606fd9617dbe2feb0b0e5c8'
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
doc_type: tutorial
actionability: resource
lane: knowledge
schema_version: '1'
tags:
  - PCA
  - ACP
  - python
  - sklearn
  - dimensionality-reduction
  - data-analysis
  - matplotlib
  - pandas
  - numpy
domain: data science
---
# df = pd.read_csv("votre_fichier.csv")

## Goal

Appliquer une ACP complète en Python : standardisation, calcul des composantes, sélection du nombre d'axes (coude, cumulée, Kaiser), visualisations (scree plot, biplot, cercle des corrélations) et interprétation.

## Prerequisites

- Python installé avec numpy, pandas, matplotlib, scikit-learn
- Notions de base en algèbre linéaire (valeurs propres, variance)
- Un jeu de données : soit Wine de sklearn (offline), soit un CSV personnel avec ≥6 colonnes numériques

## Steps

**step**: 1
**title**: Imports
**code**: import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
**step**: 2
**title**: Charger les données
**detail**: Option A (offline) : from sklearn.datasets import load_wine ; wine = load_wine() ; df = pd.DataFrame(wine.data, columns=wine.feature_names). Option B (CSV) : df = pd.read_csv('fichier.csv') puis df = df.select_dtypes(include=[np.number]).
**step**: 3
**title**: Préparer et standardiser
**code**: X = df.select_dtypes(include=[np.number]).copy()
X = X.dropna()
feature_names = X.columns.tolist()
scaler = StandardScaler()
Z = scaler.fit_transform(X)  # centré-réduit, shape (n, p)
**detail**: Vérifier n, p et la liste feature_names avant de continuer.
**step**: 4
**title**: Lancer l'ACP
**code**: pca = PCA()
scores = pca.fit_transform(Z)
eigvals = pca.explained_variance_
ratio  = pca.explained_variance_ratio_
cum    = ratio.cumsum()
**step**: 5
**title**: Scree plot (courbe des éboulis)
**code**: plt.plot(range(1, len(ratio)+1), ratio*100, marker='o')
plt.xlabel('Composante'); plt.ylabel('Variance (%)')
plt.title('Scree plot'); plt.show()
**interpretation**: Repérer le coude : les axes avant le coude sont retenus.
**step**: 6
**title**: Variance cumulée
**code**: plt.plot(range(1, len(cum)+1), cum*100, marker='o')
plt.axhline(80, linestyle='--')
plt.title('Variance cumulée'); plt.show()
**interpretation**: Choisir le plus petit K atteignant 70–90 % (seuil courant : 80 %).
**step**: 7
**title**: Critère de Kaiser
**code**: R = np.corrcoef(Z, rowvar=False)
eigvals_R, _ = np.linalg.eigh(R)
eigvals_R = eigvals_R[::-1]
print('λ > 1 :', (eigvals_R > 1.0).sum())
**interpretation**: Garder les composantes avec λ > 1. Comparer avec coude et cumulée.
**step**: 8
**title**: Biplot (PC1 vs PC2)
**code**: loadings = pca.components_.T * np.sqrt(pca.explained_variance_)
# Tracer individus (scatter) + flèches variables (arrow) sur PC1/PC2.
**interpretation**: Flèches longues = variables bien expliquées. Flèches proches = variables corrélées. Flèches opposées = corrélation négative. Groupes d'individus visibles.
**step**: 9
**title**: Cercle des corrélations
**code**: # Tracer un cercle unité + flèches (loadings[:, :2]) + labels.
**interpretation**: Près du bord = bien expliquée par PC1–PC2. Près de l'origine = peu expliquée (chercher PC3/PC4). Angles entre flèches ≈ corrélations.
**step**: 10
**title**: Re-fitter avec K composantes (optionnel)
**code**: K = 3
pcaK = PCA(n_components=K).fit(Z)
scoresK = pcaK.transform(Z)

## Result

Un pipeline ACP complet : données standardisées, nombre d'axes choisi par trois critères convergents (coude, 80 % cumulé, Kaiser λ>1), biplot et cercle des corrélations produits et interprétés, modèle final re-fitté avec K composantes.

## Next

- Clustering (K-means, CAH) sur les scores ACP réduits
- ACP supervisée ou LDA si étiquettes disponibles
- Tester d'autres seuils (70 %, 90 %) et comparer le K résultant
- Explorer PC3/PC4 pour les variables mal expliquées dans le plan PC1–PC2

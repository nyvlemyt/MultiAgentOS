---
id: resource-s5-python-pour-la-data-science-tp-numpy-pdf-e4c09d55
slug: resource-s5-python-pour-la-data-science-tp-numpy-pdf-e4c09d55
source_key: 'sha256:e4c09d5569c5751908f056654743e17d44ff07fb24a66032777d2cbc1fcc0ed8'
part_of: S5 - Python pour la Data Science
order: 4
manifest: null
derived_from: 'sha256:e4c09d5569c5751908f056654743e17d44ff07fb24a66032777d2cbc1fcc0ed8'
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
  - numpy
  - python
  - data-science
  - tableaux
  - algèbre-linéaire
  - performance
domain: Data Science
---
# S5 - Python pour la Data Science — TP NumPy.pdf

## Goal

Maîtriser les fondamentaux de NumPy : création et manipulation de tableaux, opérations mathématiques vectorisées, algorithmes personnalisés (plus proche voisin, corrélation de Pearson), et comparaison de performance Python pur vs NumPy.

## Prerequisites

- Python de base (boucles, fonctions, listes)
- NumPy installé (`pip install numpy`)
- Notions élémentaires de statistiques (moyenne, variance, écart-type, corrélation)

## Steps

**title**: Exercice 1 — Création et manipulation de tableaux
**actions**: - Créer un tableau de 10 entiers : `arr = np.arange(10)`
- Reshaper en matrice 2×5 : `mat = arr.reshape(2, 5)`
- Inverser l'ordre des colonnes : `mat[:, ::-1]`
- Somme par colonne : `mat.sum(axis=0)`
- Filtrer les impairs : `arr[arr % 2 != 0]`
**title**: Exercice 2 — Opérations mathématiques
**actions**: - Tableau aléatoire 3×3 d'entiers 1–20 : `np.random.randint(1, 21, (3, 3))`
- Min / max : `arr.min()`, `arr.max()`
- Normalisation min-max : `(arr - arr.min()) / (arr.max() - arr.min())`
- Statistiques : `arr.mean()`, `arr.var()`, `arr.std()`
- Remplacer impairs par leur carré : `arr[arr % 2 != 0] **= 2`
- Masque booléen : `arr > 10`
**title**: Exercice 3 — Plus proche voisin
**actions**: - Implémenter `find_nearest(arr, x)` : calculer `np.abs(arr - x)`, puis `arr[np.argmin(...)]`
- Principe : la différence absolue vectorisée évite toute boucle Python
**title**: Exercice 4 — Matrice de corrélation manuelle
**actions**: - Implémenter `correlation_matrix(data)` sans `np.corrcoef`
- Pour chaque paire de colonnes (i, j) : appliquer la formule de Pearson : `r = Σ[(xi − x̄)(yi − ȳ)] / sqrt(Σ(xi−x̄)² · Σ(yi−ȳ)²)`
- Centrer les colonnes avec `.mean(axis=0)`, calculer numérateur et dénominateur via produits scalaires NumPy
**title**: Exercice 5 — Benchmark Python pur vs NumPy
**actions**: - Calculer Σi pour i=0..1 000 000 avec une boucle Python, encadrée par `time.perf_counter()`
- Recalculer avec `np.arange(1_000_001).sum()`
- Afficher et comparer les deux durées : NumPy doit être ~10–100× plus rapide

## Result

À l'issue du TP, l'étudiant sait créer, transformer et filtrer des tableaux NumPy, appliquer des opérations statistiques vectorisées, coder des algorithmes numériques personnalisés (recherche du plus proche voisin, corrélation de Pearson), et mesurer l'écart de performance entre Python pur et NumPy sur un calcul intensif.

## Next

- Passer à Pandas pour la manipulation de DataFrames tabulaires
- Explorer `np.linalg` pour la décomposition de matrices (SVD, valeurs propres)
- Appliquer ces bases à un pipeline de Machine Learning avec scikit-learn

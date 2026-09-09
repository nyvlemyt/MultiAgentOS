---
id: resource-s7-machine-learning-seance4-pdf-132dbc44
slug: resource-s7-machine-learning-seance4-pdf-132dbc44
source_key: 'sha256:132dbc44e16156bc5040c6d5fbe69f4c6f22cb447e16c245452b36219bddfcab'
part_of: resource-s7-machine-learning-f79ea225
order: 21
manifest: null
derived_from: 'sha256:132dbc44e16156bc5040c6d5fbe69f4c6f22cb447e16c245452b36219bddfcab'
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
  - classification
  - distance-metrics
  - supervised-learning
domain: Machine Learning
---
# S7 - machine learning — seance4.pdf

## Summary

K-Nearest Neighbors (KNN) est un algorithme de classification (et régression) non-paramétrique dit « paresseux » : il n'entraîne aucun modèle, il mémorise l'intégralité du jeu de données et classe un nouvel exemple par vote majoritaire parmi ses k voisins les plus proches. Le choix de k et de la métrique de distance sont les deux leviers principaux.

## Fields/API

**Définition**: Algorithme lazy learner : pas de phase d'entraînement ; classification par vote majoritaire (ou moyenne pour la régression) des k voisins les plus proches dans l'espace des features.
**Démarche en 4 étapes**: - 1. Choisir k (nombre de voisins).
- 2. Calculer la distance entre le nouveau point et tous les points existants.
- 3. Trier les distances, sélectionner les k plus proches.
- 4. Attribuer l'étiquette la plus fréquente parmi ces k voisins.
**Métriques de distance**: **Euclidienne**: d_E(x,y) = sqrt(Σ(x_i − y_i)²) — distance en ligne droite, la plus courante.
**Manhattan**: d_M(x,y) = Σ|x_i − y_i| — distance en suivant les axes à angle droit.
**Hamming**: d_H(x,y) = Σ 1(x_i ≠ y_i) — compte le nombre de différences, pour données catégorielles.
**Choix de k**: **k faible**: Biais faible, variance élevée → risque de surapprentissage (overfitting), sensible au bruit.
**k élevé**: Biais élevé, variance faible → risque de sous-apprentissage (underfitting), moins sensible au bruit.
**Bonne pratique**: Commencer avec k=3 ou k=5 ; affiner par validation croisée ou méthode du coude (Elbow method). Ne pas baser le choix sur l'intuition.
**Avantages**: - Simple à implémenter.
- Aucune phase d'entraînement.
- Utilisable en classification et en régression.
- Non-paramétrique (aucune hypothèse sur la distribution).
**Inconvénients**: - Coût computationnel élevé à l'inférence (calcul de toutes les distances).
- Nécessite de stocker l'intégralité du jeu de données.
- Sensible au bruit.
- Performances dégradées quand le nombre de features augmente (malédiction de la dimensionnalité).

## Constraints

- Le choix de la métrique de distance doit être rigoureux et non basé sur l'intuition.
- La métrique Hamming est réservée aux données catégorielles.
- k doit être validé empiriquement (cross-validation ou Elbow method), pas arbitrairement.

## Examples

- Choisir un restaurant : on préfère un endroit similaire à un qu'on a apprécié → vote parmi les k expériences passées les plus proches.
- Résolution de problème : face à une situation similaire à une déjà résolue, on réutilise la même approche.
- Classification binaire avec k=3 : si 2 voisins sur 3 appartiennent à la classe A, le point est classé A.

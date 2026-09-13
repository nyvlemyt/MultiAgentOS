---
id: resource-s7-ml2-ch4-anomaly-detection-fr-pdf-b7ab0b41
slug: resource-s7-ml2-ch4-anomaly-detection-fr-pdf-b7ab0b41
source_key: 'sha256:b7ab0b41e474aac072d4840b79b1a530598a5aace590788efc02b7457b4d7712'
part_of: resource-s7-ml2-fa640f29
order: 12
manifest: null
derived_from: 'sha256:b7ab0b41e474aac072d4840b79b1a530598a5aace590788efc02b7457b4d7712'
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
  - anomaly-detection
  - outlier
  - clustering
  - DBSCAN
  - LOF
  - statistical
  - density
  - distance
  - reconstruction
  - autoencoder
  - PCA
  - machine-learning
domain: machine-learning
---
# S7 - ml2 — ch4_anomaly_detection FR.pdf

## Summary

Vue d'ensemble des techniques de détection d'anomalies (valeurs aberrantes) issues du chapitre 9 de *Introduction à l'exploration de données* (Tan et al., 2e éd.). Une anomalie est un point de données considérablement différent du reste, relativement rare, et dont la détection peut être critique (ex. appauvrissement couche d'ozone). Quatre familles de méthodes sont présentées : statistiques, basées sur la reconstruction, sur la proximité, et sur le clustering.

## Fields/API

**Définition anomalie**: Point de données significativement éloigné du reste ; rare par nature ; à distinguer du bruit (non intéressant, ne produit pas nécessairement de valeurs inhabituelles).
**Causes**: 1. Données de classes différentes mélangées. 2. Variation naturelle. 3. Erreurs de données.
**Sortie : étiquette vs score**: Certaines méthodes produisent un label binaire (normal/anomalie) ; d'autres un score continu permettant le classement et une interprétation statistique. Les scores d'anomalie doivent présenter une queue de distribution.
**Approches statistiques**: **principe**: Une anomalie est un point de faible probabilité sous un modèle de distribution paramétrique (ex. gaussienne).
**forces**: Fondements mathématiques solides, très efficace si la distribution est connue.
**faiblesses**: Distribution souvent inconnue, difficile en haute dimension, les anomalies faussent les paramètres estimés.
**Approches basées sur la distance (kNN)**: **principe**: Score d'aberration = distance au k-ième plus proche voisin.
**complexité**: O(n²)
**forces**: Simple.
**faiblesses**: Coûteux, sensible aux paramètres k, sensible aux variations de densité, distance perd son sens en haute dimension.
**Approches basées sur la densité**: **principe**: Score d'aberration = inverse de la densité locale. La densité relative compare la densité d'un point à celle de ses voisins.
**LOF (Local Outlier Factor)**: Calcule pour chaque point le rapport moyen entre sa densité locale et celle de ses k plus proches voisins. Détecte des anomalies dans des zones de densité hétérogène, contrairement au kNN pur.
**forces**: Simple.
**faiblesses**: O(n²), sensible aux paramètres, densité perd son sens en haute dimension.
**Approches basées sur le clustering**: **principe**: Un point est une anomalie s'il n'appartient pas clairement à un cluster (distance au centroïde, faible densité locale, mauvaise connectivité).
**DBSCAN**: **définition densité**: Nombre de points dans un rayon Eps.
**types de points**: Point central (≥ MinPts voisins dans Eps), point frontière (voisin d'un central sans être central), point de bruit (ni central ni frontière = anomalie).
**algorithme**: 1. Étiqueter tous les points. 2. Éliminer le bruit. 3. Relier les points centraux à distance ≤ Eps. 4. Former les clusters de points centraux connexes. 5. Attribuer les points frontières à leur cluster voisin.
**forces**: Gère les formes et tailles variées, résistant au bruit.
**faiblesses**: Densités variables, données multidimensionnelles.
**forces_clustering**: Simple, nombreuses techniques utilisables.
**faiblesses_clustering**: Choix du nombre de clusters difficile, anomalies peuvent fausser les clusters.
**Approches basées sur la reconstruction**: **principe**: Projeter les données dans un espace de dimension inférieure (ACP, auto-encodeur) puis mesurer l'erreur de reconstruction ‖x − x̂‖. Les points avec une forte erreur sont des anomalies.
**auto-encodeur**: Réseau neuronal multicouche encodeur-décodeur ; même nombre de neurones en entrée et en sortie que d'attributs.
**forces**: Aucune hypothèse sur la distribution, nombreuses méthodes de réduction applicables.
**faiblesses**: Erreur calculée dans l'espace original — problématique en haute dimension.
**Évaluation**: **supervisé (labels disponibles)**: Précision, rappel, taux de faux positifs (= taux de fausses alarmes).
**non supervisé**: Mesures internes (erreur de reconstruction, gain), histogrammes des scores d'anomalie.

## Constraints

- Les anomalies sont rares — un cas sur mille est courant sur de grands jeux de données.
- Le contexte est déterminant (ex. température glaciale en juillet = anomalie contextuelle).
- DBSCAN requiert deux hyperparamètres : Eps (rayon) et MinPts (seuil de voisinage).
- kNN et LOF sont en O(n²) — coûteux sur de grands jeux.
- La distance et la densité perdent leur sens en haute dimension (malédiction de la dimensionnalité).
- Les anomalies peuvent biaiser l'estimation des paramètres dans les approches statistiques et les centroïdes dans le clustering.
- Bruit ≠ anomalie : le bruit n'est pas intéressant et ne produit pas nécessairement de valeurs inhabituelles.

## Examples

- Données ozone (Nimbus 7) : concentrations anormalement basses écartées automatiquement comme valeurs aberrantes — cas réel d'anomalie ignorée.
- Poids 200 livres pour un enfant de 2 ans : erreur de données, anomalie évidente.
- DBSCAN avec Eps=10, MinPts=4 : les points de bruit sont directement les anomalies détectées.
- LOF : p1 et p2 détectés comme anomalies car leur densité locale est faible par rapport à leurs voisins, alors que kNN ne le signalerait pas.
- Auto-encodeur : un point mal reconstruit (grande erreur ‖x − x̂‖) est classé anomalie sans hypothèse distributionnelle.

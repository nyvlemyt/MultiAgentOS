---
id: resource-s7-ml2-ch2-cluster-analysis-fr-pdf-f22c1034
slug: resource-s7-ml2-ch2-cluster-analysis-fr-pdf-f22c1034
source_key: 'sha256:f22c103409fa7126ba5236c4246f084e9aae1bc0c11bd4e999618a40c9a6a45c'
part_of: resource-s7-ml2-fa640f29
order: 10
manifest: null
derived_from: 'sha256:f22c103409fa7126ba5236c4246f084e9aae1bc0c11bd4e999618a40c9a6a45c'
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
  - clustering
  - k-means
  - hierarchical-clustering
  - data-mining
  - unsupervised-learning
  - machine-learning
domain: Machine Learning
---
# S7 - ml2 — ch2_cluster_analysis FR.pdf

## Summary

Référence complète sur l'analyse de clusters : définition et taxonomie (types de regroupements, types de clusters), algorithme K-means (SSE, initialisation, K-means++, Bisecting K-means, limites), clustering hiérarchique agglomératif (MIN/MAX/moyenne/Ward, dendrogramme, complexité), et validité. Source : cours Data Mining ch.7, Tan, Steinbach, Karpatne, Kumar.

## Fields/API

**Cluster (définition)**: Ensemble d'objets tel que les membres d'un groupe sont similaires entre eux et différents des membres des autres groupes. Objectif dual : minimiser les distances intra-cluster, maximiser les distances inter-cluster.
**Types de regroupements**: Partitionnel (sous-ensembles non chevauchants et exhaustifs) vs Hiérarchique (groupes imbriqués organisés en arbre, visualisé par dendrogramme). Exclusif vs non-exclusif (fuzzy clustering : chaque point appartient à chaque cluster avec un poids ∈ [0,1], somme des poids = 1). Partiel vs complet.
**Types de clusters**: Bien séparés (chaque point plus proche de tous les membres de son cluster que de tout point extérieur) ; Basés sur prototype (plus proche du centroïde ou médoïde de son cluster que de tout autre centre) ; Contigus/transitifs (plus proche d'au moins un membre du cluster que de tout point extérieur) ; Basés sur la densité (région dense séparée par des régions de faible densité — adapté aux formes irrégulières et aux données bruitées) ; Définis par fonction objectif (minimisation/maximisation d'un critère global ou local, NP-difficile en général).
**K-means**: Algorithme partitionnel itératif. K doit être fixé à l'avance. Chaque cluster est associé à un centroïde. Étapes : (1) initialiser K centroïdes ; (2) affecter chaque point au centroïde le plus proche ; (3) recalculer les centroïdes (moyenne des points du cluster) ; répéter jusqu'à stabilisation des centroïdes. Variante d'arrêt : « jusqu'à ce que peu de points changent de groupe ». Complexité : O(n · K · I · d) — n points, K clusters, I itérations, d attributs.
**Fonction objectif SSE (K-means)**: SSE = Σ_i Σ_{x∈Ci} dist(mi, x)² où mi est le centroïde du cluster Ci. K-means minimise la SSE à chaque itération et converge vers un minimum local ou global. Un clustering optimal minimise la SSE globale ; un mauvais choix de centroïdes initiaux produit un minimum sous-optimal.
**Problème des centroïdes initiaux**: Les centroïdes initiaux sont souvent tirés aléatoirement → résultats variables d'une exécution à l'autre. Si K clusters réels existent et ont la même taille n, la probabilité de sélectionner exactement un centroïde par cluster est K!/K^K (ex. K=10 → p ≈ 0,00036). Solutions : exécutions multiples, K-means++, clustering hiérarchique pour l'initialisation, Bisecting K-means.
**K-means++ (initialisation améliorée)**: Sélection probabiliste séquentielle : (1) choisir un premier point aléatoirement comme centroïde C1 ; (2) pour chaque point xi, calculer d²(xi, Cj_le_plus_proche) ; (3) sélectionner le prochain centroïde avec une probabilité proportionnelle à cette distance au carré ; répéter jusqu'à K centroïdes. Garantit un ratio d'approximation O(log k) en espérance. Plus lent que l'init aléatoire mais systématiquement meilleur en SSE.
**Bisecting K-means**: Variante hiérarchique divisive : partir d'un seul cluster, le bissecter répétitivement (en sélectionnant le cluster à diviser selon un critère, souvent SSE). Moins sujet aux problèmes d'initialisation. Peut produire un résultat partitionnel ou hiérarchique.
**Limites de K-means**: Difficultés lorsque les clusters ont des tailles très différentes (le grand cluster attire des points du petit), des densités très différentes, ou des formes non globulaires (annulaires, allongées). Sensible aux valeurs aberrantes. Solution de contournement : sur-segmenter en nombreux petits clusters puis assembler en post-traitement.
**Clustering hiérarchique agglomératif**: Bottom-up : commence avec N singletons, fusionne itérativement les deux clusters les plus proches selon une matrice de proximité, jusqu'à 1 cluster (ou k). La séquence de fusions est enregistrée dans un dendrogramme. Couper le dendrogramme à un niveau donné produit le nombre de clusters souhaité. Complexité : O(N²) en espace, O(N³) en temps (réductible à O(N² log N)).
**Métriques de liaison inter-clusters**: MIN (lien simple) : distance = distance entre les deux points les plus proches de chaque cluster → gère les formes non-elliptiques, très sensible au bruit et aux valeurs aberrantes. MAX (lien complet) : distance = distance entre les deux points les plus éloignés → moins sensible au bruit, tend à fragmenter les grands clusters et préfère les formes globulaires. Moyenne du groupe : moyenne de toutes les distances paires entre les deux clusters → compromis MIN/MAX, préférence modérée pour les formes globulaires. Distance entre centroïdes. Méthode de Ward : augmentation de la SSE résultant de la fusion de deux clusters → analogue hiérarchique de K-means, robuste au bruit, préférence marquée pour les amas globulaires et de taille similaire.
**Validité du cluster**: Absence de mesure universelle analogue à la précision/rappel de la classification supervisée. Objectifs : éviter de détecter des structures dans du bruit, comparer des algorithmes ou des partitions. Considérée comme la partie la plus difficile de l'analyse de clusters.

## Constraints

- K-means : K doit être spécifié avant l'exécution.
- K-means : convergence garantie vers un minimum local (pas nécessairement global) ; les résultats dépendent de l'initialisation.
- K-means : probabilité d'initialisation aléatoire correcte chute exponentiellement avec K.
- K-means : inefficace sur clusters de tailles, densités ou formes très hétérogènes, et en présence de valeurs aberrantes.
- Clustering hiérarchique : les fusions sont irréversibles — aucune correction possible après une mauvaise fusion.
- Clustering hiérarchique : aucune fonction objectif globale n'est directement minimisée.
- Clustering hiérarchique : complexité O(N³) prohibitive sur de grands jeux de données sans optimisation.
- Le nombre de clusters est subjectif et dépend de l'échelle d'observation.
- Le choix de la mesure de proximité est central et dépend des données (dimensionnalité, rareté, type d'attribut, autocorrélation) et de l'application.

## Examples

- Application financière : regroupement d'actions par fluctuations de prix similaires → clusters sectoriels (technologie, finance, énergie/pétrole).
- K-means 2D : convergence illustrée en 6 itérations à partir de centroïdes aléatoires sur un jeu de points bidimensionnel.
- Mauvaise initialisation K-means (10 clusters) : deux centroïdes initiaux dans le même cluster naturel entraînent un clustering sous-optimal persistant sur toutes les itérations suivantes.
- Limites K-means (formes) : sur des clusters annulaires concentriques, K-means (2 clusters) coupe les anneaux verticalement au lieu de les séparer, car il optimise des distances euclidiennes à des centroïdes.
- Classification hiérarchique (6 points, 4 méthodes) : MIN, MAX, moyenne du groupe et Ward produisent des dendrogrammes et des groupes imbriqués distincts, illustrant les compromis bruit/forme/globalité.

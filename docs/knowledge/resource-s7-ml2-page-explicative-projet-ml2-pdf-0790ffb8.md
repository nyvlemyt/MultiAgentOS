---
id: resource-s7-ml2-page-explicative-projet-ml2-pdf-0790ffb8
slug: resource-s7-ml2-page-explicative-projet-ml2-pdf-0790ffb8
source_key: 'sha256:0790ffb8b2490c9d26335ce191972b6a8bcf7dd89a8aedce4b8a8f8f67d6f7f3'
part_of: S7 - ml2
order: 4
manifest: null
derived_from: 'sha256:0790ffb8b2490c9d26335ce191972b6a8bcf7dd89a8aedce4b8a8f8f67d6f7f3'
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
  - data-science
  - projet-etudiant
  - classification
  - clustering
  - notebook
  - decision-support
domain: education
---
# S7 - ml2 — Page explicative Projet ML2.pdf

## Summary

Projet Machine Learning II (ADIF84) : le student joue le rôle d'un data scientist sur un dataset d'autobus scolaires électriques US. Chaque séance couvre une méthode ML différente (Random Forest, K-means, clustering hiérarchique, Apriori, DBSCAN) avec un livrable triple : notebook technique, tableau de bord optionnel, slides décideur.

## Fields/API

**name**: Méthodes ML couvertes
**value**: Random Forest (classification), K-means (groupes similaires), Clustering hiérarchique (structure), Apriori (associations), DBSCAN (anomalies)
**name**: Livrables par séance
**value**: 1) Notebook : préparation données, application modèle, test de paramètres, comparaison et choix. 2) Tableau de bord (optionnel) : visualisation compréhensible par non-expert. 3) Slides décideur : problème, méthode simple, résultats clés, intérêt pour la décision.
**name**: Exigence clé : réglage fin
**value**: Tester plusieurs paramètres et justifier le choix retenu avec une métrique explicite (ex. 'k=5 retenu car meilleur score de silhouette'). Un seul test sans justification est insuffisant.
**name**: Erreurs éliminatoires
**value**: Algorithme sans explication, absence d'interprétation, pas de comparaison de modèles, visualisations sans message métier.
**name**: Critères d'un bon projet
**value**: Question métier claire, choix justifiés, analyse rigoureuse, visualisation pertinente, explication simple accessible à un décideur non-technique.

## Constraints

- Démarche expérimentale obligatoire : plusieurs paramètres testés, pas un seul run.
- Chaque résultat doit être interprété en termes métier ('à quoi ça sert ?'), pas seulement présenté.
- Les slides ciblent un décideur, non un expert ML — simplifier sans appauvrir.

## Examples

- Bon : 'k = 5 retenu car meilleur score de silhouette parmi k ∈ {2,3,4,5,6}'
- Mauvais : 'Nous avons choisi k = 5' (sans justification ni comparaison)

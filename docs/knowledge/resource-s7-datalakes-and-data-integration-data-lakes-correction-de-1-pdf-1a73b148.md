---
id: >-
  resource-s7-datalakes-and-data-integration-data-lakes-correction-de-1-pdf-1a73b148
slug: >-
  resource-s7-datalakes-and-data-integration-data-lakes-correction-de-1-pdf-1a73b148
source_key: 'sha256:1a73b148fb207bdea8c4b0e4006fd140dd7a28e6a578af4dc1b2c3fe0c63ad1c'
part_of: resource-s7-datalakes-and-data-integration-013c4eca
order: 8
manifest: null
derived_from: 'sha256:1a73b148fb207bdea8c4b0e4006fd140dd7a28e6a578af4dc1b2c3fe0c63ad1c'
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
  - data-lake
  - data-warehouse
  - schema-on-read
  - blob-storage
  - file-storage
  - airflow
  - dvc
  - critical-path
  - DAG
  - EST
  - LST
  - slack-time
  - confidence-interval
  - normal-distribution
  - workflow-orchestration
domain: Data Engineering
---
# S7 - Datalakes and Data Integration — Data_Lakes___Correction_DE-1.pdf

## Summary

Correction d'un devoir écrit 2024-2025 sur les Data Lakes et l'intégration de données. Couvre : (1) concepts fondamentaux Data Lake vs Data Warehouse, schema-on-read, Blob vs File Storage, DVC vs Airflow ; (2) calcul de chemins critiques sur DAG (EST, LST, slack, preuve d'existence) ; (3) statistiques appliquées : moyenne, variance, intervalle de confiance Student, loi normale pour temps d'exécution de workflows.

## Fields/API

**name**: Data Lake vs Data Warehouse
**description**: Data Lake : données brutes (structurées, semi-structurées, non structurées), schema-on-read, cible data scientists/ingénieurs. Data Warehouse : données structurées et transformées selon schéma prédéfini, schema-on-write, cible analystes business/décideurs.
**name**: Schema-on-Read
**description**: Le schéma est interprété uniquement au moment de la lecture, pas au stockage. Exemple : fichiers JSON IoT stockés bruts ; un ingénieur extrait température, un analyste cherche des anomalies, un data scientist croise avec d'autres sources — chacun applique son propre schéma sans modifier le stockage d'origine.
**name**: Blob Storage vs File Storage
**description**: Blob Storage : objets plats dans des conteneurs, sans hiérarchie native, accès via API REST/SDK, optimisé pour stockage massif (images, vidéos, logs, sauvegardes). File Storage : structure hiérarchique de dossiers, montable via SMB/NFS, opérations POSIX, pour applications nécessitant un système de fichiers traditionnel.
**name**: DVC vs Airflow
**description**: DVC : versionnement des données et pipelines ML, reproductibilité, traçabilité. Airflow : orchestrateur généraliste de workflows via DAGs, planification, monitoring, gestion des erreurs, connecteurs cloud natifs. Pour remplir un Data Lake via appels API séquentiels, Airflow est préférable (orchestration) ; DVC est inadapté (son focus est le versionnement).
**name**: Architecture Data Lake — couches
**description**: Raw layer (stockage brut, ex. Blob Storage pour images), Staging layer (enrichissement : labels via API predict, segmentation via API segment, métriques), Curated layer (transformation en format exploitable : parquet + références aux objets binaires, après validation qualité). L'API Gateway expose les endpoints : ingest, raw, staging, curated.
**name**: Chemin critique (Critical Path)
**description**: Le chemin critique d'un DAG est le chemin de la source au puits avec la durée totale maximale. Exemple : 3 branches, durées 28/30/20 → chemin critique = branche 2 (30 unités). Si G est fini, CP(G) ≠ ∅ (le maximum d'une fonction réelle sur un ensemble fini est atteint). Si G ⊆ G', alors L(G') ≥ L(G) (agrandir l'ensemble de chemins ne peut qu'augmenter ou maintenir le maximum).
**name**: EST / LST / Slack
**description**: EST (Earliest Start Time) : date au plus tôt. LST (Latest Start Time) : date au plus tard sans retarder le projet. Slack = LST − EST. Slack = 0 ⟹ tâche sur le chemin critique. Hypothèse : toutes les tâches précédentes doivent être terminées pour démarrer (sinon EST peut être plus faible pour la tâche finale). Exemple tableau : A(EST=0,LST=0), F(5,5), G(10,10), H(20,20), E(25,25) tous slack=0 ; I(5,15) et J(10,20) slack=10.
**name**: Statistiques — temps d'exécution d'une tâche
**description**: Moyenne empirique : d̂(v) = (1/n)·Σ X(i). Variance empirique : s²v = (1/(n-1))·Σ(X(i)−d̂(v))². Exemple : n=5, valeurs [1.45, 1.86, 1.55, 1.58, 1.42] → d̂(v)=1.572 s, s²v=0.03037 s². Intervalle de confiance à 95% (loi de Student, σ inconnu) : IC = [d̂(v) ± t_{n-1,α/2} · sv/√n]. Avec t_{4,0.025}=2.776 : IC=[1.356 s, 1.788 s].
**name**: Orchestration — loi normale des workflows
**description**: Pour un DAG linéaire de 100 tâches indépendantes (μ=1s, σ=0.2s chacune) : E[temps total]=100s, σ²_total=100×0.04=4, σ_total=2s. P(T>105) = P(Z>2.5) = 0.0062. Sur 1000 workflows, X ~ B(1000, 0.0062), E[X]=6.2 ≈ 6 workflows dépassent 105 s.

## Constraints

- L'intervalle de confiance Student s'applique quand σ est inconnu et n petit (ici n=5, ddl=4).
- La preuve CP(G)≠∅ suppose P(G) fini ; si les chemins sont infinis, le maximum n'est pas garanti atteint.
- La propriété L(G')≥L(G) pour G⊆G' suppose que les poids des tâches communes restent identiques.
- Le calcul EST/LST dépend de l'hypothèse de jonction (toutes les tâches précédentes terminées vs une seule suffit) : résultats différents pour la tâche terminale.
- Airflow est recommandé pour pipelines d'intégration Data Lake avec appels API séquentiels ; DVC est inadapté pour ce cas d'usage (orienté versionnement, pas orchestration).

## Examples

- Chemin critique : DAG à 3 branches → A→F→G→H→E=30 unités (critique), A→B→C→D→E=28, A→I→J→E=20.
- Pour que toutes les branches soient critiques (durée=30) : augmenter B de 5→7, I de 5→10, J de 5→10.
- Workflow de 100 tâches : 1000 exécutions → ~6 workflows dépassent 105 s (calcul via normalisation + binomiale).
- Blob Storage pour images raw : scalabilité, accès par identifiant unique, optimisé pour binaires volumineux, organisation par conteneurs (date, source, catégorie).

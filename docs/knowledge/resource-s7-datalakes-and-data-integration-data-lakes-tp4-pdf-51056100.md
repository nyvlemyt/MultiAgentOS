---
id: resource-s7-datalakes-and-data-integration-data-lakes-tp4-pdf-51056100
slug: resource-s7-datalakes-and-data-integration-data-lakes-tp4-pdf-51056100
source_key: 'sha256:51056100d404459ed50bc8ac7d9d90b4549512761786ae2ccc2e76452901d3d3'
part_of: resource-s7-datalakes-and-data-integration-013c4eca
order: 13
manifest: null
derived_from: 'sha256:51056100d404459ed50bc8ac7d9d90b4549512761786ae2ccc2e76452901d3d3'
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
lane: workflows
schema_version: '1'
tags:
  - airflow
  - etl
  - data-lake
  - docker
  - dag
  - s3
  - mysql
  - mongodb
  - pipeline
  - orchestration
domain: data-engineering
---
# S7 - Datalakes and Data Integration — Data_Lakes___TP4.pdf

## Goal

Construire et exécuter un pipeline ETL complet avec Apache Airflow en Docker, orchestrant un flux Raw (S3) → Staging (MySQL) → Curated (MongoDB) sur le dataset WikiText V2.

## Prerequisites

- Docker et docker-compose installés
- Fonctions ETL du TP3 (extraction HuggingFace → S3, nettoyage → MySQL, tokenisation → MongoDB)
- Accès AWS CLI configuré
- MongoDB Compass ou CLI disponible

## Steps

**step**: 1
**title**: Démarrer Airflow via Docker
**detail**: Exécuter `docker-compose build` puis `docker-compose up -d` pour initialiser et lancer tous les services Airflow.
**step**: 2
**title**: Accéder à l'interface Web
**detail**: Ouvrir http://localhost:8080 ; identifiants par défaut : user=airflow / password=airflow (modifiables dans docker-compose.yml).
**step**: 3
**title**: Créer le fichier DAG
**detail**: Dans le répertoire `dags/`, créer `data_lake_pipeline.py`. Importer les fonctions TP3 et les brancher sur trois PythonOperator : `extract_data` (HuggingFace → bucket raw S3), `transform_data` (nettoyage → MySQL), `load_data` (tokenisation → MongoDB).
**step**: 4
**title**: Définir le DAG et les dépendances
**detail**: Déclarer `default_args` (owner, start_date, retries=1, depends_on_past=False), instancier le DAG avec `schedule_interval=None`, puis chaîner : `extract_task >> transform_task >> load_task`.
**step**: 5
**title**: Activer et déclencher le DAG
**detail**: Dans l'UI Web, activer le DAG `data_lake_pipeline` puis le déclencher manuellement. Consulter les journaux de chaque tâche pour valider l'exécution.
**step**: 6
**title**: Valider les données dans chaque couche
**detail**: Raw : `aws s3 ls s3://<bucket-raw>/` via AWS CLI. Staging : connexion MySQL pour inspecter les données nettoyées. Curated : MongoDB Compass ou CLI pour vérifier les données tokenisées.

## Result

Un DAG Airflow opérationnel orchestre le flux complet Raw → Staging → Curated. Les logs confirment le succès de chaque tâche et les données sont vérifiables dans S3, MySQL et MongoDB.

## Next

TP5 : extraction de données en temps réel depuis des API REST et intégration dans un Data Lake avec un cluster Elasticsearch.

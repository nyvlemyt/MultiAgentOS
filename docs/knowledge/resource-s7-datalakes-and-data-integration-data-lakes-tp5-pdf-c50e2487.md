---
id: resource-s7-datalakes-and-data-integration-data-lakes-tp5-pdf-c50e2487
slug: resource-s7-datalakes-and-data-integration-data-lakes-tp5-pdf-c50e2487
source_key: 'sha256:c50e248720cf35f0ac4348160eab8c31e735a0158a4754114535da11ba39350c'
part_of: S7 - Datalakes and Data Integration
order: 14
manifest: null
derived_from: 'sha256:c50e248720cf35f0ac4348160eab8c31e735a0158a4754114535da11ba39350c'
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
  - elasticsearch
  - api
  - data-pipeline
  - etl
  - python
  - docker
  - hackernews
  - airflow
domain: data-engineering
---
# S7 - Datalakes and Data Integration — Data_Lakes___TP5.pdf

## Goal

Construire un pipeline ETL complet qui extrait des articles depuis l'API HackerNews, les transforme et les indexe dans un cluster Elasticsearch local.

## Prerequisites

- Docker et Docker Compose installés
- Python 3.x disponible avec pip
- Fichiers Dockerfile et docker-compose.yml fournis par le cours
- Connaissance de base de Python et des requêtes HTTP

## Steps

**step**: 1
**title**: Configuration de l'environnement
**actions**: - Lancer les conteneurs : `docker-compose build` puis `docker-compose up -d`
- Vérifier qu'Elasticsearch répond sur http://localhost:9200 (curl -X GET http://localhost:9200)
- Installer les dépendances Python : `pip install requests elasticsearch`
**step**: 2
**title**: Extraction des données brutes (API HackerNews)
**actions**: - Consulter la documentation HackerNews API (github.com/HackerNews/API)
- Appeler GET /v0/topstories.json pour obtenir une liste d'identifiants d'articles
- Pour chaque ID, appeler GET /v0/item/<ID>.json pour récupérer les détails
- Stocker les réponses JSON brutes dans un bucket 'raw'
- Implémenter le script avec argparse pour paramétrer le nombre d'articles à extraire (ex. --n 50)
**step**: 3
**title**: Transformation et indexation dans Elasticsearch
**actions**: - Créer l'index 'hackernews' avec un mapping explicite via curl PUT http://localhost:9200/hackernews (champs : id:integer, title:text, content:text, url:keyword, score:integer, timestamp:date)
- Écrire un script Python pour transformer chaque document JSON brut : extraire id, title, url, score, timestamp (converti en ISO 8601)
- Insérer les documents transformés dans l'index via le client Python Elasticsearch
- Vérifier l'insertion : `curl -X GET "http://localhost:9200/hackernews/_search?q=*&pretty"`
**step**: 4
**title**: (Facultatif) Automatisation avec Airflow
**actions**: - Créer un DAG dans dags/hackernews.py enchaînant extraction API → insertion Elasticsearch
- Paramétrer le DAG pour se déclencher toutes les 5 minutes (schedule_interval='*/5 * * * *')
- Lancer et surveiller le DAG depuis l'interface web Airflow

## Result

Un pipeline ETL fonctionnel : les 50 derniers articles HackerNews sont indexés dans Elasticsearch et interrogeables via l'API REST du cluster. En option, le pipeline tourne en continu via un DAG Airflow toutes les 5 minutes.

## Next

- Explorer les requêtes full-text Elasticsearch (match, bool, aggregations)
- Ajouter une étape de déduplication pour éviter de ré-indexer des articles déjà présents
- Enrichir le mapping avec des champs supplémentaires (auteur, nombre de commentaires)
- Monitorer le DAG Airflow et gérer les erreurs de l'API (rate limiting, articles supprimés)

---
id: >-
  resource-s7-datalakes-and-data-integration-documentation-technique-projet-datalakes-chang-breton-pdf-081ca8f5
slug: >-
  resource-s7-datalakes-and-data-integration-documentation-technique-projet-datalakes-chang-breton-pdf-081ca8f5
source_key: 'sha256:081ca8f5f7b144af31d0f4fedd3e62144ca68ca97e2c6702eb33efaf21cef34b'
part_of: S7 - Datalakes and Data Integration
order: 16
manifest: null
derived_from: 'sha256:081ca8f5f7b144af31d0f4fedd3e62144ca68ca97e2c6702eb33efaf21cef34b'
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
lane: resources
schema_version: '1'
tags:
  - datalake
  - data-integration
  - kafka
  - yolov8
  - deepstream
  - medallion-architecture
  - fastapi
  - dvc
  - docker
  - parquet
  - mysql
domain: data-engineering
---
# S7 - Datalakes and Data Integration — Documentation_Technique_Projet_Datalakes_Chang_Breton.pdf

## Summary

Architecture technique d'un système de détection de personnes en temps réel (DeepStream + YOLOv8) couplé à un datalake medallion (Raw/Staging/Curated), orchestré par DVC et exposé via FastAPI. Projet étudiant I3-APP-BDML (Chang, Breton).

## Fields/API

**detection**: **tools**: - NVIDIA DeepStream 7.0
- YOLOv8s
**output**: Flux JSON continu (images + métadonnées : timestamp, localisation, confiance) → Kafka topic
**ingestion**: **tool**: Apache Kafka
**format**: JSON
**role**: Buffer temps réel, gestion des pics d'activité, garantie d'intégrité
**datalake_layers**: **raw**: **source**: Kafka
**format**: JSON
**transformation**: Aucune — schema-on-read
**staging**: **cleaning**: - format des dates
- taux de confiance
- dimensions image
**format**: Parquet
**rationale**: Performances en lecture analytique intermédiaire
**curated**: **enrichment**: - KPIs agrégés
- détections/min
- confiance par classe
**format**: MySQL
**rationale**: Intégration reporting (PowerBI)
**orchestration**: **tool**: DVC
**pipeline_stages**: - transfert raw
- nettoyage → staging
- enrichissement → curated
**features**: - suivi des dépendances
- reproductibilité complète
**api**: **framework**: FastAPI
**endpoints**: - /raw
- /staging
- /curated
**performance**: **techniques**: - multiprocessing (parallélisation)
- vectorisation NumPy
- mise en cache
**deployment**: **tool**: Docker
**scope**: Tous les composants principaux

## Constraints

- Dépendance matérielle : caméra intégrée + GPU compatible DeepStream
- MySQL en couche gold lie l'exploitation analytique à un SGBDR relationnel (couplage fort PowerBI)
- DVC suppose une pipeline bien définie — modifications ad hoc difficiles sans redéfinition des stages
- Projet étudiant : niveau de production et SLA non spécifiés

## Examples

- Détection temps réel → JSON Kafka → couche Raw (brut) → Staging Parquet (nettoyé) → Curated MySQL (agrégé + KPIs) → API FastAPI /curated
- Endpoint /staging retourne les données nettoyées au format Parquet prêtes pour analyse intermédiaire
- DVC orchestre le transfert Raw→Staging→Curated avec traçabilité des dépendances entre étapes

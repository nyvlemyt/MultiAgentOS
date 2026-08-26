---
id: >-
  resource-s7-datalakes-and-data-integration-rapport-datalake-senechal-morgan-logerot-jules-costa-thomas-i3appbdml-pdf-b91ad963
slug: >-
  resource-s7-datalakes-and-data-integration-rapport-datalake-senechal-morgan-logerot-jules-costa-thomas-i3appbdml-pdf-b91ad963
source_key: 'sha256:b91ad963a4794e5ac650b26403aad133aedd1aef9fada84ddbdf5b6708926459'
part_of: resource-s7-datalakes-and-data-integration-013c4eca
order: 19
manifest: null
derived_from: 'sha256:b91ad963a4794e5ac650b26403aad133aedd1aef9fada84ddbdf5b6708926459'
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
  - airflow
  - localstack
  - fastapi
  - python
  - docker
  - k-means
  - etl
  - s3
  - orchestration
  - météo
domain: data-engineering
---
# S7 - Datalakes and Data Integration — Rapport_DataLake_SENECHAL_Morgan_LOGEROT_Jules_COSTA_Thomas_I3APPBDML.pdf

## Summary

Architecture complète d'un Data Lake météorologique mondial : ingestion via REST Countries + OpenWeather APIs → 3 couches S3 LocalStack (Raw/Staging/Curated) → orchestration Airflow DAG toutes les 6 h → clustering K-Means → API FastAPI 7 endpoints. Stack : Python, Docker Compose, Polars, Numba, scikit-learn. Pipeline complet exécuté en 14 s sur MacBook Air M2.

## Fields/API

**data_sources**: - REST Countries API (gratuite) — fournit la liste country/city des capitales mondiales
- OpenWeather API (gratuite, plafond 1 000 req/jour) — météo temps réel par capitale
**data_lake_layers**: **raw**: Fichiers CSV horodatés weather_data_{current_date}.csv ; données quasi-brutes issues des APIs, converties depuis JSON
**staging**: Fusion de tous les fichiers Raw en global_weather_data.csv ; suppression valeurs manquantes, feature engineering, normalisation
**curated**: weather_clusters.csv (données Staging + colonne cluster_name issue du K-Means) + weather_clusters.png (visualisation clusters)
**data_fields_collected**: - country
- city
- longitude
- latitude
- temperature
- température ressentie
- pression atmosphérique
- humidité
- vitesse et direction du vent
- couverture nuageuse
- visibilité
- horaires lever/coucher du soleil
**airflow_dag**: **name**: openweather_data_lake
**schedule**: toutes les 6 h (06h, 12h, 18h, 00h)
**tasks**: - initialize_buckets — crée les buckets S3 Raw/Staging/Curated si absents
- data_to_raw — ingestion API → CSV horodaté → bucket Raw
- raw_to_staging — fusion + nettoyage → global_weather_data.csv → bucket Staging
- staging_to_curated — K-Means clustering → weather_clusters.csv + .png → bucket Curated
**api_endpoints**: - GET  /buckets                          — liste les buckets disponibles
- GET  /buckets/{bucket}/files           — liste les fichiers d'un bucket
- GET  /buckets/{bucket}/files/{file}    — télécharge un fichier spécifique
- POST /buckets/{bucket}/files           — upload un fichier dans un bucket
- DELETE /buckets/{bucket}/files/{file}  — supprime un fichier
- POST /weather/custom                   — ajoute données météo par coordonnées GPS (lat/lon) → user_input_data_{date}.csv en Raw puis intégré en Staging
- GET  /health                           — health check de l'API
**tech_stack**: **language**: Python
**data_processing**: - pandas
- polars (remplace pandas en Raw pour performance)
- numpy
**ml**: scikit-learn KMeans (clustering climatique)
**jit_compiler**: Numba (JIT sur les transformations de preprocessing)
**async**: asyncio/async-await pour requêtes API parallèles
**api_framework**: FastAPI + Uvicorn (ASGI)
**orchestration**: Apache Airflow (DAGs)
**storage**: LocalStack S3 (émulation AWS locale sans coût)
**containerisation**: Docker + Docker Compose
**frontend**: HTML / JavaScript / CSS (interface graphique pour l'API)
**source_scripts**: **src/data-recovery.py**: Ingestion APIs → Raw ; async, Polars, logs d'erreurs dans src/logs/
**src/data-preprocessing.py**: Raw → Staging ; Numba JIT, feature engineering
**src/data-classifications.py**: Staging → Curated ; K-Means + export PNG
**src/api.py**: API FastAPI (7 endpoints)
**dags/openweather_data_lake.py**: DAG Airflow : scheduling, dépendances, appel des 3 scripts src/
**data_analysis/data_exploration.ipynb**: Notebook exploration initiale (normalisation noms de capitales entre APIs)

## Constraints

- OpenWeather API gratuite : plafond 1 000 requêtes/jour
- Données converties en CSV dès l'ingestion (pas de JSON brut en Raw) — schéma de lecture imposé à cette couche
- LocalStack requiert Docker ; simule S3 mais ne remplace pas AWS en production
- Gain Numba marginal sur petits volumes ; scalabilité prévue pour grands datasets
- Noms de capitales à normaliser manuellement entre REST Countries et OpenWeather (divergences orthographiques découvertes en exploration)

## Examples

- Fichier Raw : weather_data_2024-03-15.csv — colonnes country, city, lat, lon, temp, feels_like, humidity, wind_speed, clouds, visibility, sunrise, sunset
- Fichier Curated : weather_clusters.csv = colonnes Staging + cluster_name (groupe climatique K-Means)
- Endpoint custom : POST lat=48.85&lon=2.35 → génère user_input_data_2024-03-15.csv en Raw → agrégé dans global_weather_data.csv en Staging
- Pipeline complet (4 tâches Airflow, ~195 capitales) : exécution en 14 s sur MacBook Air M2

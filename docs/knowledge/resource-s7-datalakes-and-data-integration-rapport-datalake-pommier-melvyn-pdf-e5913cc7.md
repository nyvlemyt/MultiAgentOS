---
id: >-
  resource-s7-datalakes-and-data-integration-rapport-datalake-pommier-melvyn-pdf-e5913cc7
slug: >-
  resource-s7-datalakes-and-data-integration-rapport-datalake-pommier-melvyn-pdf-e5913cc7
source_key: 'sha256:e5913cc7992810644f5ee6a0a9ec7de719688978502706334cdc24a679c31353'
part_of: resource-s7-datalakes-and-data-integration-013c4eca
order: 18
manifest: null
derived_from: 'sha256:e5913cc7992810644f5ee6a0a9ec7de719688978502706334cdc24a679c31353'
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
  - s3
  - mysql
  - mongodb
  - fastapi
  - machine-learning
  - gbfs
  - spatial-join
  - python
  - scikit-learn
  - numba
  - localstack
domain: data-engineering
---
# S7 - Datalakes and Data Integration — Rapport_DataLake_POMMIER_Melvyn.pdf

## Summary

Documentation technique du projet Vélib' Data Lake (EFREI M1, juillet 2026) : ingestion planifiée de l'API GBFS Vélib' (~1 500 stations, toutes les 15 min) et d'un GeoJSON d'arrondissements parisiens, architecture trois zones raw (LocalStack S3) / staging (MySQL 8) / curated (MongoDB 7), orchestration Airflow 2.10 TaskFlow, API FastAPI 7 endpoints + dashboard, clustering K-Means + RandomForestRegressor (MAE ≈ 0,09 / R² ≈ 0,83), et benchmark /ingest vs /ingest_fast (×1,61 à batch=1, ×19,61 à batch=100).

## Fields/API

**sources**: **nom**: Vélib' Métropole GBFS
**type**: API REST sans clé
**fréquence**: toutes les 15 min (Airflow)
**contenu**: station_status (disponibilité temps réel) + station_information (référentiel)
**nom**: Arrondissements de Paris
**type**: GeoJSON, licence ODbL (opendata.paris.fr)
**fréquence**: statique, ingérée une fois
**contenu**: 20 polygones géospatiaux avec attributs
**zones**: **raw**: LocalStack S3 — payloads bruts horodatés partitionnés par date (schema-on-read, recalcul possible depuis l'origine)
**staging**: MySQL 8 — données tabulaires typées, contrainte d'unicité (station_id, snapshot_ts), INSERT IGNORE, SQL pour jointures et agrégations
**curated**: MongoDB 7 — un document par station (profil horaire 24 h, sous-doc cluster, sous-doc prédiction), bulk_write pour les upserts
**pipelines**: **velib_ingestion**: toutes les 15 min — fetch_status + fetch_information en parallèle, retries HTTP x3 + backoff exponentiel + timeout 20 s, retries Airflow x2, validation structure GBFS avant écriture S3
**seed_file_ingestion**: une fois — dépose le GeoJSON en raw, clé S3 fixe (relançable sans risque, re-dépose depuis l'image Docker si absent)
**datalake_pipeline**: toutes les heures — TaskGroup staging (load_stations + load_status + load_arrondissements) → TaskGroup curated (build_profiles + train_model + network_stats) → report consolidé ; idempotent via processed_files
**ml**: **clustering**: K-Means sur profil horaire moyen 24 h standardisé (heure locale Paris, pas UTC) — 4 labels heuristiques : Résidentiel (départs matinaux), Zone d'emploi (arrivées matinales), Faible activité, Usage mixte/continu
**regression**: RandomForestRegressor, target occupancy_ratio = vélos/capacité — features : heure sin/cos, jour semaine, flag week-end, capacité, lat/lon, code arrondissement (issu jointure spatiale), ratio électrique ; split temporel 80/20 (les 20 % snapshots les plus récents en test) ; MAE ≈ 0,09 / R² ≈ 0,83
**spatial_join**: ray casting point-dans-polygone, 3 implémentations équivalentes : (1) Python pur (référence lisible, /ingest), (2) NumPy vectorisé + pré-filtre boîte englobante (Airflow), (3) Numba @njit compilé au démarrage avec repli NumPy si absent (/ingest_fast)
**api**: **endpoints**: - /raw
- /staging
- /curated
- /health (état + latence des 3 services)
- /stats (comptages S3/MySQL/MongoDB)
- /ingest
- /ingest_fast
- / (dashboard HTML)
- /docs (Swagger auto)
**codes_erreur**: **404**: objet S3 inexistant
**422**: payload invalide (Pydantic) — listes blanches sur noms de tables/collections, jamais d'interpolation SQL depuis l'entrée utilisateur
**503**: service du lake injoignable (nom de zone dans le message)
**vide**: rows: [] avec explication au lieu d'une 500 si table pas encore créée
**stack**: **orchestration**: Airflow 2.10, LocalExecutor, style TaskFlow (@dag/@task, XCom implicite — seuls petits dicts transitent, données dans le lake)
**api**: FastAPI + Uvicorn + Pydantic
**ml_geo**: scikit-learn (K-Means, RandomForestRegressor, joblib), NumPy, Numba — pas Shapely/GeoPandas
**packaging**: package Python datalake partagé importé par les DAGs ET par l'API (zéro duplication)

## Constraints

- Idempotence multicouche : table processed_files + contrainte unicité (station_id, snapshot_ts) + INSERT IGNORE + upserts MongoDB — relancer un DAG ou rejouer un batch ne corrompt rien
- Validation /ingest (Pydantic) : bornes géo, compteurs ≥ 0, mécanique + électrique ≤ total, batch ≤ 10 000
- Parsing séparé du chargement : fonctions parse_* pures (dict → liste de dicts), testables sans infra ; un enregistrement corrompu est rejeté et loggé sans bloquer le fichier
- Démarrage à froid ML : si données insuffisantes → log warning + trained: false, le DAG ne plante pas
- Split temporel ML obligatoire (pas aléatoire) pour éviter le data leakage temporel
- Heure locale Paris (UTC+2) pour les profils horaires ML — un décalage UTC fausse les libellés de clusters
- 46 tests unitaires purs (sans infrastructure), dont équivalence des 3 implémentations spatial join vérifiée sur 500 points aléatoires + points de contrôle réels
- Modèle sérialisé dans s3://artifacts, métriques historisées dans curated.model_registry, rechargé par l'API avec cache 5 min

## Examples

**label**: Payload GBFS station_status (pièges : liste de dicts hétérogènes à déplier, epochs Unix, compteurs potentiellement incohérents)
**value**: {"station_id": 213688169, "num_bikes_available": 4, "num_bikes_available_types": [{"mechanical": 3}, {"ebike": 1}], "num_docks_available": 30, "is_installed": 1, "is_renting": 1, "is_returning": 1, "last_reported": 1783862587}
**label**: Benchmark /ingest vs /ingest_fast (Apple M3 Pro, stack Docker, 10 répétitions après warm-up)
**value**: batch=1 : 50,5 ms vs 31,4 ms → ×1,61 (+38 %) — gain uniquement caches (index géo, pools connexions) ; batch=100 : 2 000,8 ms vs 102,0 ms → ×19,61 (+95 %) — /ingest linéaire en allers-retours (100 PUT S3, 200 INSERT, 100 update_one), /ingest_fast coût quasi constant par batch
**label**: Leviers /ingest_fast par étage
**value**: Raw S3: 1 put_object/batch vs 1/enreg. | Staging MySQL: executemany + 1 commit vs 2 INSERT/commit par enreg. | Spatial: Numba JIT + index précalculé vs Python pur rechargé | ML: 1 predict() sur matrice complète vs 1/enreg. | MongoDB: 1 bulk_write vs 1 update_one/enreg. | Clients: pools réutilisés vs recréés
**label**: Points de contrôle jointure spatiale
**value**: Louvre → 1er arr. ✓ | Tour Eiffel → 7e arr. ✓ | Sacré-Cœur → 18e arr. ✓ | Château de Vincennes → hors Paris ✓

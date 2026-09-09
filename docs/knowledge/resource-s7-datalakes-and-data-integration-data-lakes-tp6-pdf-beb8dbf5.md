---
id: resource-s7-datalakes-and-data-integration-data-lakes-tp6-pdf-beb8dbf5
slug: resource-s7-datalakes-and-data-integration-data-lakes-tp6-pdf-beb8dbf5
source_key: 'sha256:beb8dbf5a68128f546a8057908854c31673643bb66a1fb614946b730abd1f8f8'
part_of: resource-s7-datalakes-and-data-integration-013c4eca
order: 15
manifest: null
derived_from: 'sha256:beb8dbf5a68128f546a8057908854c31673643bb66a1fb614946b730abd1f8f8'
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
  - fastapi
  - api-gateway
  - datalake
  - s3
  - mysql
  - mongodb
  - python
  - rest
  - pydantic
  - uvicorn
domain: data-engineering
---
# S7 - Datalakes and Data Integration — Data_Lakes___TP6.pdf

## Goal

Construire une API Gateway FastAPI exposant les trois couches d'un Data Lake (raw/staging/curated) via des endpoints RESTful distincts connectés à S3, MySQL et MongoDB.

## Prerequisites

- Python 3.8+ installé
- Connaissances de base HTTP (GET, POST, PUT, DELETE)
- Accès configuré à un bucket S3 (boto3 + credentials AWS)
- Instance MySQL avec données staging issues du TP précédent
- Instance MongoDB avec documents issus du TP4
- pip install fastapi uvicorn pydantic boto3 mysql-connector-python pymongo

## Steps

**step**: 1
**title**: Initialiser l'application FastAPI
**detail**: Créer src/api.py. Instancier FastAPI(). Définir les modèles Pydantic pour la validation des entrées/sorties. Lancer avec `uvicorn main:app --reload` (dev) ou `--workers 4` (prod).
**step**: 2
**title**: Exercice 1 — Endpoint /health
**detail**: Ajouter une route GET /health qui retourne un JSON avec : `api_status` (online/offline), `timestamp` (datetime courant), `connections` (dict avec clés s3/mysql/mongodb et leur état de connexion). Tester via curl, Postman ou le Swagger intégré (/docs).
**step**: 3
**title**: Exercice 2 — Endpoint /raw/ (couche S3)
**detail**: Configurer boto3 avec les credentials S3. Implémenter GET /raw/ qui lit les objets du bucket et les retourne en JSON. Ajouter un query parameter `limit` pour paginer les résultats. Valider le format JSON retourné.
**step**: 4
**title**: Exercice 3 — Endpoint /staging/ (couche MySQL)
**detail**: Configurer la connexion MySQL (mysql-connector-python ou SQLAlchemy). Implémenter GET /staging/ qui exécute une requête SQL sur la table staging et retourne les résultats sérialisés en JSON. Tester l'endpoint.
**step**: 5
**title**: Exercice 4 — Endpoint /curated/ (couche MongoDB)
**detail**: Configurer la connexion pymongo. Implémenter GET /curated/ qui retourne les documents stockés dans MongoDB lors du TP4. Tester l'endpoint et valider la structure des documents retournés.

## Result

Une API Gateway opérationnelle avec 4 endpoints (/health, /raw/, /staging/, /curated/) exposant les trois couches du Data Lake via une interface RESTful unifiée, avec documentation Swagger auto-générée accessible sur /docs.

## Next

- Ajouter une authentification (OAuth2 / API key) sur les endpoints sensibles
- Mettre en place un middleware de logging et de rate-limiting
- Conteneuriser l'API avec Docker et l'intégrer dans la pipeline CI/CD du Data Lake
- Ajouter des endpoints POST/PUT/DELETE pour permettre l'écriture dans chaque couche

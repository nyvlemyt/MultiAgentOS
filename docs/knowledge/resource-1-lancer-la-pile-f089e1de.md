---
id: resource-1-lancer-la-pile-f089e1de
slug: resource-1-lancer-la-pile-f089e1de
source_key: 'sha256:f089e1dec78a2acf7199513fbd943204776e7a5a8a67138a63e9605f1d3c437d'
part_of: null
order: null
manifest: null
derived_from: 'sha256:f089e1dec78a2acf7199513fbd943204776e7a5a8a67138a63e9605f1d3c437d'
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
lane: knowledge
schema_version: '1'
tags:
  - elasticsearch
  - kibana
  - docker
  - nosql
  - geospatial
  - full-text-search
  - aggregations
  - ELK-stack
  - bulk-import
  - jq
domain: data-engineering
---
# 1. lancer la pile

## Goal

Découvrir Elasticsearch + Kibana de bout en bout : déployer la stack localement avec Docker, indexer 7 669 séismes USGS au format GeoJSON, puis explorer les données par recherche textuelle, filtres, agrégations et carte géographique.

## Prerequisites

- Docker Desktop installé et lancé, avec au moins 2 Go de RAM alloués à Docker (Elasticsearch réserve 1 Go sur la JVM)
- Ports 9200 (Elasticsearch) et 5601 (Kibana) libres sur la machine
- Fichier source earthquakes.json au format GeoJSON (un document par séisme)
- jq installé pour transformer le GeoJSON en format _bulk NDJSON attendu par Elasticsearch

## Steps

- Écrire un docker-compose.yml avec deux services : elasticsearch:8.15.0 (discovery.type=single-node, xpack.security.enabled=false pour usage local uniquement, ES_JAVA_OPTS=-Xms1g -Xmx1g, port 9200) et kibana:8.15.0 (ELASTICSEARCH_HOSTS=http://elasticsearch:9200, port 5601, depends_on elasticsearch avec condition service_healthy).
- Lancer la pile avec `docker compose up -d`, puis vérifier qu'Elasticsearch répond : `curl localhost:9200` doit retourner un JSON avec le tagline « You Know, for Search ». Kibana met ~1 minute de plus ; accessible sur http://localhost:5601.
- Créer l'index avec un mapping explicite via `curl -X PUT localhost:9200/seismes` : mag (float), place (text + sous-champ keyword), time (date epoch_millis), magType (keyword), tsunami (integer), location (geo_point). Le type geo_point est indispensable pour la carte Kibana — Elasticsearch ne le devine pas seul.
- Transformer le GeoJSON en NDJSON _bulk avec jq : chaque séisme devient deux lignes (action {"index":{}} + document avec champs aplatis dont location:{lon, lat} extrait de geometry.coordinates). Écrire le résultat dans bulk.ndjson.
- Importer avec `curl -H 'Content-Type: application/x-ndjson' -X POST localhost:9200/seismes/_bulk --data-binary @bulk.ndjson`. La réponse attendue : {"errors": false, "items": 7669}. Vérifier avec `curl localhost:9200/_cat/indices/seismes?v` (statut green, docs.count 7669, store.size ~1,5 Mo).
- Tester les quatre types de requêtes : (1) match sur place pour recherche textuelle avec scoring de pertinence ; (2) range + sort sur mag pour filtrer et trier les séismes forts ; (3) agrégations stats/terms (magnitude min/max/avg, répartition par magType, alertes tsunami) avec size:0 pour ne récupérer que les calculs ; (4) geo_bounding_box pour restreindre la recherche à une zone géographique et combiner avec une agrégation avg.
- Visualiser dans Kibana : Maps → Add layer → Documents → index seismes, champ location → carte mondiale des séismes. Colorer les points selon la magnitude sans écrire de code.

## Result

Stack Elasticsearch + Kibana opérationnelle en local via Docker. 7 669 séismes indexés (1,5 Mo). Requêtes répondant en 24–115 ms : 2 009 séismes en Alaska, 664 de magnitude ≥ 4 (max 8,3 en mer d'Okhotsk), magnitude moyenne globale 1,625, 15 alertes tsunami, 3 870 séismes en Californie (moyenne 1,12). Carte interactive dans Kibana sans code supplémentaire.

## Next

- Tester un cluster multi-nœuds pour observer la résilience lors de la perte d'un nœud (shards et réplicas).
- Explorer ES|QL, le nouveau langage de requête SQL-like d'Elasticsearch.
- Coupler avec MongoDB selon le pattern entreprise : MongoDB pour les lectures/écritures applicatives, Elasticsearch pour indexer une copie à des fins de recherche et d'analyse.
- Réactiver xpack.security.enabled=true et configurer TLS + mots de passe avant tout déploiement non local.

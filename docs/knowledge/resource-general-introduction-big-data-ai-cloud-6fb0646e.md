---
id: resource-general-introduction-big-data-ai-cloud-6fb0646e
slug: resource-general-introduction-big-data-ai-cloud-6fb0646e
source_key: 'sha256:6fb0646e9dd317b1a268d947d10d6f5e948c00c38a7978f88689dbd324cf7472'
part_of: null
order: null
manifest: null
derived_from: 'sha256:6fb0646e9dd317b1a268d947d10d6f5e948c00c38a7978f88689dbd324cf7472'
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
  - big-data
  - ai
  - cloud
  - data-warehouse
  - data-lake
  - nosql
  - scaling
  - olap
  - oltp
  - aws
  - azure
domain: Data Engineering & AI
---
# General Introduction — Big Data, AI & Cloud

## Summary

Panorama des concepts fondamentaux Big Data, IA et Cloud : définitions, architectures de stockage, paradigmes de scaling et services cloud majeurs (AWS, Azure).

## Fields/API

**name**: 5 Vs du Big Data
**definition**: Volume (Go→To→Po), Velocity (vitesse de génération/traitement), Variety (structuré / semi / non-structuré), Veracity (qualité variable), Value (utilité décisionnelle).
**name**: Limites des SGBD relationnels
**definition**: Schéma fixe, scaling vertical uniquement, optimisés OLTP — inadaptés à l'analyse massive et au scaling horizontal.
**name**: SQL vs NoSQL
**definition**: SQL : schéma fixe, scalabilité verticale (MySQL, PostgreSQL). NoSQL : schéma flexible, scalabilité horizontale (MongoDB, Cassandra, Redis).
**name**: OLTP vs OLAP
**definition**: OLTP : transactions courantes, petits volumes, données actuelles. OLAP : analyses complexes, volumes massifs, données historiques (Data Warehouse).
**name**: Scaling vertical vs horizontal
**definition**: Vertical : plus de puissance sur une seule machine — simple mais coûteux et borné. Horizontal : ajout de nœuds dans un cluster — préféré pour le Big Data (faible coût, haute dispo).
**name**: Data locality
**definition**: Principe : déplacer le traitement vers la donnée (et non l'inverse) pour réduire le trafic réseau. Fondement de Hadoop MapReduce.
**name**: Data Warehouse
**definition**: Stockage centralisé de données historiques nettoyées pour l'analyse OLAP. Distinct des bases OLTP.
**name**: Data Lake
**definition**: Réservoir brut, schema-on-read. Conserve toutes les données (utilisées ou non) à faible coût. Supporte BI, data science et ML.
**name**: Architecture Bronze / Silver / Gold
**definition**: Bronze = données brutes. Silver = données nettoyées et structurées. Gold = données prêtes pour l'analyse ou le ML.
**name**: AI / ML / Deep Learning
**definition**: AI : simulation de l'intelligence humaine (règles ou données). ML : apprentissage statistique. DL : ML via réseaux de neurones profonds. DL ⊂ ML ⊂ AI.
**name**: Données → Information → Insight
**definition**: Data : faits bruts. Information : données contextualisées. Insight : compréhension utile à la décision.
**name**: Unités Big Data
**definition**: 1 TB = 10³ GB · 1 PB = 10³ TB · 1 EB = 10³ PB. Croissance mondiale : +30–40 %/an ; plusieurs zettabytes attendus annuellement d'ici 2030.
**name**: Cloud vs HDFS
**definition**: Cloud : maintenance gérée, pay-as-you-go, scalabilité illimitée, haute résilience. HDFS : cluster on-premise, maintenance lourde.
**name**: Services AWS Big Data
**definition**: S3 (stockage objets) · Glue (ETL serverless) · Athena (SQL sur S3) · EMR (Hadoop/Spark managé) · Lake Formation (gestion Data Lake).
**name**: Services Azure Big Data
**definition**: Blob Storage (objets) · Data Lake Storage (analytique hiérarchique) · Synapse Analytics (entrepôt cloud) · Databricks (Spark collaboratif).

## Constraints

- Les SGBD relationnels ne sont pas adaptés au scaling horizontal ni aux schémas variables.
- Le scaling vertical est borné physiquement et coûteux à grande échelle.
- Un Data Lake sans gouvernance peut devenir un 'data swamp' (non couvert ici — limite du document source).
- HDFS requiert un cluster dédié et une maintenance opérationnelle significative.

## Examples

- Sources Big Data : réseaux sociaux (interactions, images, vidéos) et IoT (capteurs, géolocalisation).
- Pipeline typique : ingestion brute → couche Bronze → nettoyage Silver → agrégation Gold → BI/ML.
- Data locality en pratique : Hadoop MapReduce envoie le code de traitement sur le nœud qui héberge le bloc de données, évitant le transfert réseau.

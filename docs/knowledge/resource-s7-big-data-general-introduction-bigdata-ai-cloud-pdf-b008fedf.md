---
id: resource-s7-big-data-general-introduction-bigdata-ai-cloud-pdf-b008fedf
slug: resource-s7-big-data-general-introduction-bigdata-ai-cloud-pdf-b008fedf
source_key: 'sha256:b008fedf22a3fec6ab2ad2208058f5614419a286d26e858b664726444977c973'
part_of: resource-s7-big-data-70f04b2b
order: 5
manifest: null
derived_from: 'sha256:b008fedf22a3fec6ab2ad2208058f5614419a286d26e858b664726444977c973'
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
  - cloud
  - AI
  - data-lake
  - NoSQL
  - data-warehouse
  - distributed-systems
  - AWS
  - Azure
domain: Data Engineering & Cloud
---
# S7 - big data — General_Introduction_BigData_AI_Cloud.pdf

## Summary

Introduction générale aux concepts fondamentaux du Big Data, de l'IA et du Cloud : les 5 V, les architectures de stockage (SQL/NoSQL, Data Warehouse, Data Lake), les modes de scaling, et les services cloud AWS/Azure dédiés à l'analytique et au ML.

## Fields/API

**name**: Les 5 V du Big Data
**value**: Volume (Go→To→Po), Velocity (vitesse de génération/traitement), Variety (structuré/semi/non-structuré), Veracity (fiabilité variable), Value (extraction d'information utile)
**name**: SQL vs NoSQL
**value**: SQL : schéma fixe, scalabilité verticale, OLTP. Exemples : MySQL, PostgreSQL. NoSQL : schéma flexible, scalabilité horizontale, données semi/non-structurées. Exemples : MongoDB, Cassandra, Redis
**name**: OLTP vs OLAP
**value**: OLTP : transactions courantes, petits volumes, données actuelles. OLAP : analyses complexes, volumes massifs, données historiques (Data Warehouse)
**name**: Scaling vertical vs horizontal
**value**: Vertical : augmenter la puissance d'une machine (CPU/RAM) — simple mais limité et coûteux. Horizontal : ajouter des nœuds dans un cluster — flexible, haute disponibilité, méthode privilégiée pour le Big Data
**name**: Data Locality
**value**: Déplacer le traitement vers la donnée (pas l'inverse) pour réduire le trafic réseau. Principe clé de Hadoop MapReduce
**name**: Data Lake
**value**: Réservoir brut sans schéma prédéfini (schema-on-read). Couches : Bronze (brut) → Silver (nettoyé/structuré) → Gold (prêt pour ML/BI)
**name**: AI / ML / Deep Learning
**value**: AI : champ global (règles + apprentissage). ML : apprentissage statistique à partir de données. DL : ML via réseaux de neurones profonds
**name**: Data → Information → Insight
**value**: Data : faits bruts. Information : données contextualisées. Insight : compréhension actionnelle pour la décision
**name**: Unités Big Data
**value**: 1 TB = 10³ GB · 1 PB = 10³ TB · 1 EB = 10³ PB. Croissance +30–40 %/an ; plusieurs zettabytes/an prévus d'ici 2030
**name**: AWS Big Data Services
**value**: S3 (stockage objet) · Glue (ETL serverless) · Athena (SQL sur S3) · EMR (Hadoop/Spark managé) · Lake Formation (gestion Data Lake)
**name**: Azure Big Data Services
**value**: Blob Storage · Data Lake Storage (hiérarchique/analytique) · Synapse Analytics (entrepôt cloud) · Databricks (Spark collaboratif)
**name**: Cloud vs HDFS
**value**: Cloud : maintenance gérée, pay-as-you-go, scalabilité illimitée, haute résilience. HDFS : cluster auto-géré, maintenance lourde

## Constraints

- Les bases relationnelles classiques ne supportent pas le scaling horizontal et sont conçues pour l'OLTP, pas l'analyse massive
- Le scaling vertical est physiquement plafonné — le Big Data requiert le scaling horizontal
- Un Data Lake sans gouvernance devient un 'Data Swamp' (non abordé ici mais implication des avantages listés)
- Le cloud est désormais le socle de référence pour l'entraînement, le stockage et le déploiement IA

## Examples

- Sources Big Data : réseaux sociaux (interactions, images, vidéos) + IoT (capteurs, géolocalisation)
- Pipeline typique : ingestion brute → couche Bronze → nettoyage Silver → agrégation Gold → ML/BI
- Data locality : Hadoop envoie le code MapReduce sur le nœud qui héberge les blocs HDFS concernés

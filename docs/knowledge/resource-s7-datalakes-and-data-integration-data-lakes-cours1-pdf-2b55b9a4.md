---
id: resource-s7-datalakes-and-data-integration-data-lakes-cours1-pdf-2b55b9a4
slug: resource-s7-datalakes-and-data-integration-data-lakes-cours1-pdf-2b55b9a4
source_key: 'sha256:2b55b9a42cd06d7f786d3743a9380b4d7a1a1b603c78f3f14014099580c25502'
part_of: S7 - Datalakes and Data Integration
order: 2
manifest: null
derived_from: 'sha256:2b55b9a42cd06d7f786d3743a9380b4d7a1a1b603c78f3f14014099580c25502'
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
doc_type: explanation
actionability: resource
lane: knowledge
schema_version: '1'
tags:
  - data-lake
  - data-warehouse
  - schema-on-read
  - bronze-silver-gold
  - data-engineering
  - machine-learning
  - etl
  - pipeline
  - data-integration
domain: data engineering
---
# S7 - Datalakes and Data Integration — Data_Lakes_Cours1.pdf

## Thesis

Un Data Lake inverse la logique du Data Warehouse : on stocke d'abord toutes les données brutes (schema-on-read), puis on structure à la lecture selon le besoin analytique — ce qui le rend indispensable pour les usages ML, le Big Data hétérogène et l'évolution rapide des cas d'usage.

## Context

Les Data Warehouses (fin des années 1980) imposent un schéma avant ingestion (schema-on-write) : les données sont nettoyées et conformées avant chargement, garantissant cohérence et performance BI mais rendant coûteuse toute nouvelle source ou dimension. Dans les années 2000, l'explosion du volume (logs, IoT, transactions), de la diversité de formats (JSON, images, audio, texte libre) et des besoins ML sur données brutes a rendu cette rigidité insoutenable. Hadoop, puis le stockage objet cloud (AWS S3, Azure ADLS, GCS), ont rendu le modèle Data Lake viable économiquement à grande échelle : stockage commodity facturé à l'usage, scalabilité horizontale (ajout de nœuds plutôt que migration serveur).

## Reasoning

Un Data Lake repose sur trois principes fondamentaux. (1) Schema-on-read : les données sont ingérées sans transformation préalable ; le schéma est appliqué à la lecture selon le besoin, permettant de conserver des données dont l'usage futur est inconnu. (2) Scalabilité horizontale : infrastructure distribuée, capacité ajustée à la demande, coût de stockage objet très inférieur aux entrepôts managés. (3) Organisation en zones successives reliées par des pipelines ETL/ELT : Raw/Bronze (données brutes fidèles, horodatées, avec métadonnées de provenance) → Staging/Silver (nettoyage, harmonisation des formats, règles qualité) → Curated/Gold (agrégations, métriques, optimisation colonnaire pour requêtes analytiques). Le ML s'intègre de plus en plus dans ces pipelines : de Raw à Staging — OCR, transcription audio, détection de langue, extraction d'entités nommées, parsing de formats semi-structurés ; de Staging à Curated — classification, clustering, génération d'embeddings, feature engineering automatisé, scoring qualité. Chaque zone répond à des profils distincts : Bronze = data engineers (debug pipelines), data scientists (exploration brute), conformité/audit ; Silver = analystes métier, data scientists (feature engineering, entraînement), BI détaillé ; Gold = direction (dashboards stratégiques), BI KPIs consolidés, applications métier via API.

## Trade-offs

Data Lake vs Data Warehouse sur quatre axes clés. Schéma : flexibilité schema-on-read (nouvelle dimension sans modifier le modèle) contre cohérence garantie schema-on-write (tout nouveau besoin impose une refonte ETL). Coût : stockage objet commodity très bon marché contre infrastructure spécialisée élevée pour gros volumes. Performance : variable selon préparation des données et formats utilisés contre requêtes SQL optimisées (indexation, partitionnement, moteur dédié). Qualité : risque majeur de 'data swamp' (marécage inexploitable) sans gouvernance et pipelines rigoureux, contre qualité garantie par les processus ETL en amont. Adéquation par cas d'usage : le Data Lake excelle pour ML, Big Data exploratoire et archivage à faible coût ; le Data Warehouse reste supérieur pour la BI, les dashboards et les KPIs avec requêtes SQL performantes.

## See also

- ETL vs ELT patterns
- Apache Spark (batch processing)
- Apache Kafka (streaming)
- format Parquet (colonnaire)
- Delta Lake / Lakehouse architecture
- Data Mesh
- Data Catalog & gouvernance

---
id: resource-s7-big-data-1-bigdata-questions-docx-92f52549
slug: resource-s7-big-data-1-bigdata-questions-docx-92f52549
source_key: 'sha256:92f525494adc8e50a99d99ab08425c45401f133ccd666d8d4c4c563e88de56b5'
part_of: S7 - big data
order: 1
manifest: null
derived_from: 'sha256:92f525494adc8e50a99d99ab08425c45401f133ccd666d8d4c4c563e88de56b5'
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
  - nosql
  - data-lake
  - cloud
  - AI
  - machine-learning
  - distributed-systems
  - OLAP
  - OLTP
  - data-warehouse
domain: Data Engineering & AI
---
# S7 - big data — 1_BigData_Questions.docx

## Summary

Catalogue de 23 questions-clés couvrant les fondamentaux du Big Data (5 V, scaling, localité des données), les architectures de stockage (OLTP/OLAP, Data Warehouse, Data Lake, couches Bronze/Silver/Gold), les bases NoSQL, l'IA/ML/Deep Learning, et les services cloud majeurs (AWS, Azure) pour l'analytique.

## Fields/API

**name**: Big Data — définition & 5 V
**description**: Volume, Vélocité, Variété, Véracité, Valeur. Flux massifs issus des réseaux sociaux, IoT, capteurs. Unités : GB → TB → PB → EB.
**name**: Limites des SGBDR traditionnels
**description**: Conçus pour des données structurées à volume modéré ; peinent à scaler horizontalement et à gérer la variété (JSON, images, logs).
**name**: SGBDR vs NoSQL
**description**: SGBDR : schéma fixe, ACID, SQL. NoSQL : schéma flexible (document, colonne, graphe, clé-valeur), scaling horizontal natif, cohérence éventuelle.
**name**: OLTP vs OLAP
**description**: OLTP : transactions courtes, lecture/écriture unitaire, base opérationnelle. OLAP : agrégations analytiques, lecture massive, Data Warehouse orienté décision.
**name**: Data Warehouse vs Data Lake
**description**: Data Warehouse : données structurées, schéma défini à l'écriture, optimisé OLAP. Data Lake : données brutes (toute forme), schéma à la lecture, stockage économique pour ML et analytique.
**name**: Couches Bronze / Silver / Gold
**description**: Bronze = raw ingestion. Silver = données nettoyées/enrichies. Gold = agrégats prêts pour la BI et le ML.
**name**: Scaling vertical vs horizontal
**description**: Vertical : augmenter CPU/RAM d'un seul nœud — limité et coûteux. Horizontal : ajouter des nœuds — linéairement extensible, adapté au Big Data.
**name**: Data locality
**description**: Principe distribué : déplacer le calcul vers la donnée (pas l'inverse) pour minimiser le trafic réseau — fondement de Hadoop/HDFS.
**name**: IA, ML, Deep Learning
**description**: IA = domaine global (cognition-based ou data-driven). ML ⊂ IA : apprentissage statistique sur données. Deep Learning ⊂ ML : réseaux de neurones profonds, très gourmand en données.
**name**: Données → Information → Insights
**description**: Données : faits bruts. Information : données contextualisées. Insights : conclusions actionnables tirées de l'analyse.
**name**: Cloud vs HDFS on-premise
**description**: Cloud (S3, ADLS, GCS) : élasticité, paiement à l'usage, séparation stockage/calcul, pas de gestion de cluster. HDFS : couplage calcul/stockage, maintenance lourde.
**name**: Services AWS Big Data
**description**: S3 (stockage objet), Glue (ETL serverless), Athena (requêtes SQL sur S3), EMR (Spark/Hadoop managé), Lake Formation (gouvernance Data Lake).
**name**: Services Azure Big Data
**description**: Blob Storage (stockage objet), Azure Data Lake Storage Gen2 (hiérarchique, analytique), Synapse Analytics (OLAP + Spark), Azure Databricks.
**name**: Pourquoi l'IA n'est pas un simple hype
**description**: Contrairement aux AI Winters (manque de données et de puissance), la convergence Big Data + GPU + cloud fournit enfin la matière première et l'infrastructure nécessaires.

## Constraints

- Source = liste de questions de cours (niveau L3/M1 ingénieur) — pas un corpus de réponses développées.
- Couverture théorique et conceptuelle ; pas d'exemples de code ni de benchmarks chiffrés.
- Services cloud listés à titre illustratif ; offres évoluent rapidement.

## Examples

- Q: Pourquoi les réseaux sociaux sont-ils une source majeure de Big Data ? → Génération continue de posts, likes, images, vidéos (volume + vélocité + variété).
- Q: Différence Data Lake / Data Warehouse ? → Lake = stockage brut schéma-on-read ; Warehouse = structuré schéma-on-write, optimisé requêtes analytiques.
- Q: Qu'est-ce que la data locality ? → Envoyer le code vers le nœud qui détient la donnée, pas l'inverse — réduit le réseau dans HDFS/Spark.

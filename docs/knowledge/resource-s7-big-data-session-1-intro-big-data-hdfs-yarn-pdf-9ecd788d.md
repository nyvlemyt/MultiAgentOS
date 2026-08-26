---
id: resource-s7-big-data-session-1-intro-big-data-hdfs-yarn-pdf-9ecd788d
slug: resource-s7-big-data-session-1-intro-big-data-hdfs-yarn-pdf-9ecd788d
source_key: 'sha256:9ecd788d058fa0ee49442f21b96d01150e2c943cb950718cc1ea1a55376240bf'
part_of: S7 - big data
order: 9
manifest: null
derived_from: 'sha256:9ecd788d058fa0ee49442f21b96d01150e2c943cb950718cc1ea1a55376240bf'
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
  - hadoop
  - hdfs
  - yarn
  - data-lake
  - data-warehouse
  - distributed-systems
  - mapreduce
domain: Data Engineering
---
# S7 - big data — Session 1 Intro Big Data - HDFS - YARN.pdf

## Summary

Introduction au Big Data et à l'écosystème Hadoop : sources et volumes de données, les 5V, distinction Data Warehouse / Data Lake, architecture Hadoop (HDFS + YARN), et principes du scaling horizontal.

## Fields/API

**Big Data — 5V**: **Volume**: Quantité massive de données (exabytes quotidiens)
**Velocity**: Vitesse de génération et de traitement
**Variety**: Diversité des formats (structuré, non structuré, graphe, logs, IoT)
**Veracity**: Fiabilité et qualité de la donnée
**Value**: Utilité extraite des données pour la décision
**Data Warehouse**: Base de données relationnelle optimisée pour l'analyse SQL rapide ; schéma défini à l'avance ; données nettoyées et transformées ; source unique de vérité pour le reporting BI.
**Data Lake**: Dépôt centralisé stockant données brutes structurées et non structurées à n'importe quelle échelle, sans transformation préalable ; couches Bronze (raw) → Silver (filtré/augmenté) → Gold (agrégats métier).
**Scaling horizontal**: Distribution des données sur un cluster de machines commodity (CPU, RAM, disques) ; le code (traitement) est déplacé là où résident les données (data locality).
**Hadoop**: **Définition**: Plateforme open-source de stockage et traitement distribué de très grands datasets sur clusters de machines standard.
**Origine**: Inspiré des papiers Google GFS + MapReduce (2003-2004) ; projet lancé par Doug Cutting en 2006.
**Composants principaux**: HDFS (stockage) + YARN (ordonnancement des ressources)
**HDFS**: **Rôle**: Système de fichiers virtuel distribué ; découpe les fichiers en blocs de 128 MB répartis sur les nœuds.
**Réplication**: Chaque bloc est répliqué 3× sur des machines différentes (tolérance aux pannes).
**Architecture**: Master/Slave — NameNode (maître, métadonnées en RAM : fsimage) + DataNodes (esclaves, stockage et accès aux blocs).
**NameNode**: Conserve la carte des blocs (quel bloc appartient à quel fichier, où il est stocké) ; point de défaillance unique (SPOF) sans HA.
**High Availability**: 2 NameNodes (Active + Standby) ; le Standby prend le relais en cas de panne et assure aussi le checkpointing.
**Flux d'écriture**: Client → NameNode (métadonnées + liste DataNodes) → pipeline DataNode 1→2→3 + ACK remontants → confirmation au NameNode.
**Forces**: Haut débit sur gros fichiers, résilience, hardware bon marché.
**Limites**: Pas adapté aux accès faible latence (ms) ni aux millions de petits fichiers (surcharge métadonnées NameNode).
**YARN**: **Rôle**: Gestion des ressources cluster (CPU, RAM, GPU) et ordonnancement des jobs.
**Architecture**: Master/Slave — ResourceManager (maître) + NodeManagers (esclaves).
**Containers**: Unités d'allocation de ressources (combinaison prédéfinie de cœurs CPU + mémoire).
**ApplicationMaster**: Premier container alloué par le ResourceManager ; planifie et gère l'application, détermine les ressources nécessaires par étape.
**UI**: Interface web sur le port 8088 du nœud ResourceManager (statut des applications Spark, MapReduce…).
**Usages**: Permet à MapReduce, Spark, Hive, HBase de cohabiter sur le même cluster.
**Data Lakes AWS**: Fondation S3 + Lake Formation + Glue + Athena + EMR ; durabilité 11 nines, construction en jours.
**Data Lakes Azure**: Azure Blob Storage + Azure Data Lake Storage Gen2.

## Constraints

- Le Secondary NameNode n'est PAS un NameNode de failover — il effectue des opérations administratives (checkpointing) pour soulager le NameNode principal.
- Sans HA, le NameNode est un SPOF : sa perte rend HDFS indisponible.
- HDFS ne convient pas aux accès très faible latence ni aux millions de petits fichiers.
- Les locations de blocs NE sont PAS stockées dans fsimage ; elles sont reconstruites au démarrage via les rapports des DataNodes.

## Examples

- Réplication HDFS : /data/file.log composé de 4 blocs (B1-B4), chaque bloc répliqué sur 3 DataNodes distincts (ex. B1 sur nœuds A, B, C).
- Couches Data Lake : données brutes S3 (Bronze) → nettoyage/enrichissement (Silver) → agrégats métier pour BI (Gold).
- YARN alloue un container ApplicationMaster à Spark, qui négocie ensuite des containers exécuteurs pour ses tâches.

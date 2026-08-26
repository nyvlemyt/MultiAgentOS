---
id: resource-s7-big-data-introduction-hadoop-hdfs-yarn-pdf-c2cf6012
slug: resource-s7-big-data-introduction-hadoop-hdfs-yarn-pdf-c2cf6012
source_key: 'sha256:c2cf6012580bd18826f3e1262006597eb93d24b80effdae9d3fd738599ae4b4f'
part_of: S7 - big data
order: 8
manifest: null
derived_from: 'sha256:c2cf6012580bd18826f3e1262006597eb93d24b80effdae9d3fd738599ae4b4f'
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
  - hadoop
  - hdfs
  - yarn
  - big-data
  - distributed-systems
  - data-lake
  - data-warehouse
  - mapreduce
domain: Data Engineering
---
# S7 - big data — Introduction_Hadoop_HDFS_YARN.pdf

## Summary

Introduction au framework Hadoop et à son écosystème Big Data : contexte (5 V, sources, unités), distinction Data Lake / Data Warehouse, architecture HDFS (NameNode/DataNode, blocs 128 MB, réplication ×3, HA) et YARN (ResourceManager/NodeManager, containers, ApplicationMaster). Hadoop est open-source, conçu pour le stockage et le traitement distribués horizontaux sur commodity hardware.

## Fields/API

**Big Data 5 V**: Volume · Velocity · Variety · Veracity · Value
**Unités de données**: GB (10³) → TB (10¹²) → PB (10¹⁵) → EB (10¹⁸) ; production journalière > 1 exabyte
**Data Warehouse**: Base relationnelle optimisée SQL, schéma défini à l'avance, données nettoyées, source unique de vérité, orientée BI/reporting
**Data Lake**: Dépôt centralisé de données brutes structurées ET non structurées, schema-on-read, couches Bronze (raw) → Silver (nettoyé) → Gold (agrégats métier)
**Hadoop**: Plateforme open-source (Doug Cutting, 2006) de stockage et traitement distribués ; inspirée des papiers Google GFS + MapReduce (2003-2004) ; séparation stockage / compute
**HDFS — blocs**: Taille par défaut 128 MB ; chaque bloc répliqué 3× sur des nœuds distincts
**HDFS — NameNode**: Maître : conserve les métadonnées (carte des blocs) en RAM + sur disque (fsimage) ; point de défaillance unique sans HA
**HDFS — Secondary NameNode**: N'est PAS un failover ; effectue le checkpointing du NameNode
**HDFS — HA**: 2 NameNodes (Active + Standby) ; le Standby prend le relais en cas de panne et assure aussi le checkpointing
**HDFS — DataNode**: Esclave : stocke et sert les blocs ; remonte l'état au NameNode
**HDFS — Write pipeline**: Client → NameNode (métadonnées) → DataNode 1 → 2 → 3 en pipeline ; ACK remonte jusqu'au client ; client notifie le NameNode à la fin
**HDFS — Forces**: Haut débit sur gros fichiers, résilience, commodity hardware
**HDFS — Limites**: Latence élevée (pas temps-réel), mauvais sur millions de petits fichiers (surcharge NameNode)
**YARN**: Yet Another Resource Negotiator ; gère CPU/RAM/GPU du cluster ; permet à plusieurs frameworks (MapReduce, Spark, Hive…) de coexister
**YARN — ResourceManager**: Maître : alloue les ressources sous forme de containers (CPU + mémoire prédéfinis) ; UI web sur port 8088
**YARN — NodeManager**: Esclave : gère les containers sur chaque nœud worker
**YARN — ApplicationMaster**: 1er container alloué par le ResourceManager ; planifie et pilote l'application
**Scaling horizontal vs vertical**: Vertical = upgrade d'une seule machine (limité) ; Horizontal = ajout de nœuds commodity + data locality (déplacer le code vers les données)

## Constraints

- HDFS n'est pas adapté aux accès basse latence (< quelques ms)
- Des millions de petits fichiers surchargent le NameNode (métadonnées en RAM)
- Sans HA, le NameNode est un SPOF (Single Point of Failure)
- Le Secondary NameNode NE remplace PAS le NameNode en cas de panne
- HDFS est implémenté en Java et simule un système de fichiers au-dessus de ext3/ext4/xfs

## Examples

- Fichier /data/file.log découpé en blocs B1…B4 (128 MB chacun), chaque bloc stocké sur 3 DataNodes différents ; le NameNode conserve la carte B1→{A,B,C}, B2→{C,D,E}…
- Data Lake AWS : S3 (fondation) + Lake Formation (sécurité) + Glue (ETL) + Athena/EMR (requêtes) — durabilité 11 nines
- YARN : une application Spark reçoit des containers du ResourceManager ; l'ApplicationMaster planifie les stages ; les NodeManagers exécutent les tâches

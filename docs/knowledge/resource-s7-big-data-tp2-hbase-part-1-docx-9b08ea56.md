---
id: resource-s7-big-data-tp2-hbase-part-1-docx-9b08ea56
slug: resource-s7-big-data-tp2-hbase-part-1-docx-9b08ea56
source_key: 'sha256:9b08ea5602e3d8f08ddf93001ceeeb68c69ca6d67019bd64084ad8c6645dd650'
part_of: resource-s7-big-data-70f04b2b
order: 28
manifest: null
derived_from: 'sha256:9b08ea5602e3d8f08ddf93001ceeeb68c69ca6d67019bd64084ad8c6645dd650'
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
  - hbase
  - hadoop
  - big-data
  - nosql
  - docker
  - hdfs
  - distributed-storage
  - row-key-design
domain: Big Data / Systèmes distribués
---
# S7 - big data — tp2 HBASE - part 1.docx

## Goal

Comprendre l'architecture interne d'HBase (write path, read path, compactions, row-key design) en pratique sur un cluster Hadoop Dockerisé.

## Prerequisites

- Cluster Docker opérationnel avec hadoop-master, hadoop-worker1, hadoop-worker2
- Scripts start-hadoop.sh et start-hbase.sh disponibles sur le master
- Notions de base HDFS et ligne de commande bash

## Steps

**part**: 1 — Démarrage et processus
**actions**: - docker start hadoop-master hadoop-worker1 hadoop-worker2
- docker exec -it hadoop-master bash
- ./start-hadoop.sh && start-hbase.sh
- jps
**findings**: **Hadoop**: - NameNode (métadonnées HDFS)
- SecondaryNameNode (sauvegarde métadonnées)
- ResourceManager (allocation ressources cluster)
**HBase**: - HMaster (coordination régions, supervision cluster)
- HRegionServer (stockage + lecture/écriture)
- HQuorumPeer (ZooKeeper intégré — synchronisation)
**part**: 2 — Création de table et row key composite
**actions**: - hbase shell
- create 'iot', 'data'
- put 'iot', 'sensor1#20251017T0900', 'data:temperature', '22.5'
- put 'iot', 'sensor2#20251017T0900', 'data:temperature', '20.0'
- put 'iot', 'sensor1#20251017T0910', 'data:temperature', '23.1'
- scan 'iot'
**findings**: **tri**: Ordre lexicographique du row key : sensor1 < sensor2, puis timestamps croissants pour un même capteur.
**pourquoi_composite**: Regrouper les mesures d'un capteur + tri chronologique automatique via le timestamp dans la clé.
**part**: 3 — Row key design : timestamp inversé
**actions**: - put 'iot', 'sensor1#9999999999999-20251017T0900', 'data:temperature', '22.5'
**findings**: **avantage_timestamp_inverse**: Retourner les lectures les plus récentes en premier (ordre décroissant naturel sans scan complet).
**piège_timestamp_seul**: Si toutes les lignes commencent par le timestamp, les écritures simultanées se concentrent sur la même région → hot spot, goulot d'étranglement.
**part**: 4 — Write path : MemStore → HFile
**actions**: - hdfs dfs -ls /hbase/data/default/iot
- hdfs dfs -ls /hbase/data/default/iot/<region-id>/data/
- flush 'iot'
- hdfs dfs -ls /hbase/data/default/iot/<region-id>/data/
**findings**: **avant_flush**: Dossier data vide — données uniquement en MemStore (RAM).
**après_flush**: Un fichier HFile apparaît (ex: 35a1d87f...). Données persistées sur HDFS.
**MemStore_vs_HFile**: MemStore = RAM, rapide, non persistant. HFile = disque HDFS, persistant, trié, optimisé lecture.
**WAL**: Avant toute écriture en MemStore, l'opération est journalisée dans le Write-Ahead Log. En cas de crash, le WAL permet de rejouer les écritures perdues (durability guarantee).
**part**: 5 — Read path et BlockCache
**actions**: - get 'iot', 'sensor1#20251017T0900'  -- x2
**findings**: **1er_get**: ~0.56 s — lecture depuis disque (HFile), chargement en BlockCache.
**2e_get**: ~0.02 s — lecture depuis BlockCache (mémoire). Pas de relecture disque.
**part**: 6 — Compactions
**actions**: - for i in 1..100 — put 'iot', "sensor1#20251017T09#{i}" ... end
- flush 'iot'  -- répété 5 fois
- hdfs dfs -ls /hbase/data/default/iot/<region-id>/data/
- major_compact 'iot'
- hdfs dfs -ls /hbase/data/default/iot/<region-id>/data/
**findings**: **pourquoi_compaction**: Fusionner les multiples HFiles pour réduire leur nombre, optimiser espace disque et performances de lecture.
**effet_major_compact**: Les anciens marqueurs de suppression (tombstones) et les versions obsolètes sont définitivement effacés. Un seul HFile consolidé remplace tous les anciens.

## Result

**architecture_globale**: HMaster orchestre sans stocker ; RegionServers stockent et servent les données ; ZooKeeper synchronise le cluster ; HDFS persiste les HFiles.
**cycle_écriture**: WAL (durabilité) → MemStore (rapidité) → flush → HFile (persistance HDFS) → compaction (consolidation).
**cycle_lecture**: BlockCache consulté en premier ; si miss → HFile lu et résultat mis en cache.
**row_key_design**: Clé composite sensorId#timestamp garantit colocalisation et tri. Timestamp inversé inverse l'ordre naturel. Timestamp pur en tête → hot spot à éviter.

## Next

- HBase Java/Python API (CRUD programmatique)
- Filtres HBase (SingleColumnValueFilter, PrefixFilter)
- Stratégies avancées de row key : salting, hashing pour répartir les hot spots
- Réplication et haute disponibilité HBase

---
id: resource-s7-big-data-hbase-questions-docx-717ee080
slug: resource-s7-big-data-hbase-questions-docx-717ee080
source_key: 'sha256:717ee080380d6a5dae5fc980b1d0a0f274fd3a93e6b1b00158cec4254bab5e4f'
part_of: S7 - big data
order: 6
manifest: null
derived_from: 'sha256:717ee080380d6a5dae5fc980b1d0a0f274fd3a93e6b1b00158cec4254bab5e4f'
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
  - hbase
  - big-data
  - nosql
  - hdfs
  - zookeeper
  - regionserver
  - distributed-storage
  - column-family
  - row-key
  - wal
  - compaction
domain: Big Data
---
# S7 - big data — HBase_Questions.docx

## Summary

HBase est une base NoSQL distribuée au-dessus de HDFS. L'HMaster orchestre sans stocker ; les RegionServers stockent les données découpées en Régions ; ZooKeeper coordonne le cluster. Une cellule est identifiée par (RowKey, ColumnFamily, ColumnQualifier, Timestamp). Écriture : WAL → MemStore → flush HFile → compaction. Lecture : MemStore → BlockCache → HFiles (index + Bloom filters). La cohérence forte est garantie par un seul RegionServer propriétaire de chaque ligne.

## Fields/API

**name**: HMaster
**type**: composant
**description**: Chef d'orchestre : répartit et réassigne les Régions sur les RegionServers. Ne stocke pas de données. Redondant (active/standby) ; sans lui, l'accès au meta est impossible.
**name**: RegionServer
**type**: composant
**description**: Serveur de stockage réel. Contient plusieurs Régions (issues de tables différentes possibles). Chaque Région contient des MemStores et des HFiles.
**name**: Région
**type**: composant
**description**: Portion horizontale d'une table (intervalle de clés de ligne). Se splitte automatiquement en deux quand elle devient trop grande pour répartir la charge.
**name**: ZooKeeper
**type**: composant
**description**: Centre de coordination : surveille la vivacité des RegionServers (ephemeral znodes), gère l'élection du HMaster actif, stocke la localisation de hbase:meta.
**name**: ColumnFamily (CF)
**type**: modèle de données
**description**: Groupe de colonnes stockées ensemble dans les mêmes fichiers. Chaque CF = un Store dans la Région, contenant plusieurs HFiles. Limiter à 1–2 CF par table (chaque CF alourdit les flushes et compactions).
**name**: Cellule
**type**: modèle de données
**description**: Unité atomique. Identifiée de manière unique par : RowKey + ColumnFamily + ColumnQualifier + Timestamp.
**name**: RowKey
**type**: modèle de données
**description**: Clé de ligne : détermine l'ordre des données, la distribution entre Régions et le risque de hotspot. Facteur de performance le plus critique.
**name**: WAL (Write-Ahead Log)
**type**: stockage
**description**: Journal écrit sur HDFS avant toute écriture en mémoire. Garantit la durabilité : en cas de crash, les données non flushées sont rejouées.
**name**: MemStore
**type**: stockage
**description**: Cache en RAM qui absorbe les écritures. Quand il est plein → flush vers un nouveau HFile sur HDFS.
**name**: HFile
**type**: stockage
**description**: Fichier de stockage persistant sur HDFS. Immuable (HDFS est write-once). Structuré en blocs avec index et Bloom filters. Jamais modifié sur place.
**name**: BlockCache
**type**: cache
**description**: Cache RAM des blocs HFile les plus consultés. Accélère les lectures répétées. Si miss → lecture HFile via index + Bloom filters.
**name**: hbase:meta
**type**: métadonnées
**description**: Table système qui mappe chaque intervalle de RowKeys à son RegionServer. Localisation stockée dans ZooKeeper. Consultée par le client à chaque lecture/écriture.
**name**: Minor Compaction
**type**: maintenance
**description**: Fusion de quelques petits HFiles d'un Store. Réduit le nombre de fichiers et accélère les lectures, sans supprimer définitivement les données obsolètes.
**name**: Major Compaction
**type**: maintenance
**description**: Fusion de TOUS les HFiles d'un Store. Supprime définitivement les anciennes versions et les tombstones. Coûteux en I/O, à planifier hors charge.

## Constraints

- Limiter le nombre de Column Families à 1–2 : chaque CF multiplie les I/O lors des flushes et compactions.
- La RowKey doit être courte, compacte et distribuer uniformément la charge pour éviter les hotspots.
- Ne pas utiliser de timestamps croissants naïfs comme RowKey : ils créent un hotspot sur la dernière région.
- Les HFiles sont immuables : toute mise à jour crée un nouvel HFile, les suppressions utilisent des tombstones nettoyés lors des major compactions.
- La cohérence forte est garantie uniquement ligne par ligne (une ligne = un seul RegionServer propriétaire).
- Le HMaster est un point critique pour la gestion des métadonnées : déployer en mode active/standby obligatoire en production.

## Examples

**title**: Chemin d'écriture complet
**body**: Client → localise région via hbase:meta → RegionServer écrit dans WAL (HDFS) → écrit dans MemStore (RAM) → flush MemStore plein → nouvel HFile sur HDFS → compactions périodiques fusionnent les HFiles.
**title**: Chemin de lecture complet
**body**: Client → localise région via hbase:meta → RegionServer vérifie MemStore (données fraîches) → BlockCache (blocs chauds) → HFiles sur HDFS (via index + Bloom filters) → retourne la valeur la plus récente.
**title**: Anti-hotspot : salting
**body**: RowKey brute : '2026-08-26_user42' → hotspot sur la région courante. Avec salting : hash(user42) % N + '_2026-08-26_user42' → distribution uniforme sur N régions.
**title**: Illusion de mutabilité
**body**: UPDATE user42 name='Alice' → pas de modification sur place. HBase écrit un nouvel HFile avec la nouvelle valeur + timestamp. La lecture retourne la version au timestamp le plus élevé. L'ancienne version est supprimée lors de la prochaine major compaction.
**title**: Détection de panne RegionServer
**body**: RegionServer tombe → son ephemeral znode ZooKeeper expire → HMaster détecte la perte → réassigne toutes les Régions orphelines sur d'autres RegionServers.

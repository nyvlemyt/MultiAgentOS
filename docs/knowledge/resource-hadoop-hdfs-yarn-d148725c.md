---
id: resource-hadoop-hdfs-yarn-d148725c
slug: resource-hadoop-hdfs-yarn-d148725c
source_key: 'sha256:d148725c33907572f3835b2058247876d4b99bed50cddf589e5971146114239c'
part_of: null
order: null
manifest: null
derived_from: 'sha256:d148725c33907572f3835b2058247876d4b99bed50cddf589e5971146114239c'
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
  - distributed-storage
  - mapreduce
  - cluster
  - namenode
  - datanode
domain: Big Data & Distributed Systems
---
# Hadoop, HDFS & YARN

## Summary

Hadoop est un framework Apache open-source pour le stockage et le traitement distribué de données massives sur cluster de machines standard. Il repose sur trois piliers : HDFS (stockage par blocs répliqués), YARN (gestion des ressources et ordonnancement), MapReduce (calcul parallèle au plus près des données). La tolérance aux pannes est assurée par réplication automatique (3 copies par défaut) et par la surveillance des heartbeats des DataNodes par le NameNode.

## Fields/API

**name**: Bloc HDFS
**description**: Unité fondamentale de stockage. Taille par défaut : 128 Mo (anciennement 64 Mo). Chaque fichier est découpé en blocs distribués sur plusieurs DataNodes.
**name**: NameNode
**description**: Nœud maître HDFS. Stocke uniquement les métadonnées : hiérarchie des fichiers, localisation des blocs, droits, facteur de réplication. Fichiers internes : fsimage (image complète persistante) + edits (journal des modifications). Ne manipule jamais les données réelles.
**name**: DataNode
**description**: Stocke physiquement les blocs. Envoie des heartbeats réguliers au NameNode. Effectue lecture, écriture et réplication sur demande du client ou du NameNode.
**name**: Secondary NameNode
**description**: Assistant administratif — fusionne périodiquement fsimage + edits pour éviter un journal trop volumineux. N'est PAS un failover automatique. Pour une vraie haute disponibilité : deux NameNodes actif/passif + ZooKeeper.
**name**: HDFS Fédération
**description**: Plusieurs NameNodes indépendants partageant les mêmes DataNodes. Améliore la scalabilité horizontale et isole les espaces de noms.
**name**: Lecture HDFS
**description**: Client → NameNode (demande de localisation des blocs) → client se connecte directement aux DataNodes concernés pour lire.
**name**: Écriture HDFS
**description**: Client → DataNode 1 → DataNode 2 → DataNode 3 (pipeline de réplication). Chaque DataNode confirme la bonne réception avant de passer au bloc suivant.
**name**: YARN — ResourceManager
**description**: Composant maître de YARN. Attribue les ressources (CPU, mémoire) aux applications, surveille l'utilisation globale du cluster, coordonne les NodeManagers.
**name**: YARN — NodeManager
**description**: S'exécute sur chaque nœud. Gère les ressources locales et exécute les conteneurs d'applications sous supervision du ResourceManager.
**name**: YARN — ApplicationMaster
**description**: Instancié par application soumise. Négocie les ressources avec le ResourceManager et supervise l'exécution des tâches sur les NodeManagers.
**name**: MapReduce
**description**: Modèle de calcul parallèle open-source inspiré du papier Google (2004). Exécute les traitements là où les données résident (localité des données) pour minimiser les transferts réseau.

## Constraints

- HDFS est 'write once, read many' : un fichier écrit n'est pas modifié — simplifie la cohérence mais interdit les mises à jour partielles.
- Petits fichiers : chaque fichier génère une entrée en mémoire NameNode ; un grand nombre de petits fichiers surcharge le NameNode et dégrade les performances.
- Réplication par défaut × 3 : consommation disque réelle = 3× la taille des données brutes.
- Le NameNode unique est un SPOF — nécessite la configuration HA (actif/passif + ZooKeeper) en production.
- Le Secondary NameNode n'assure PAS le failover automatique : confusion fréquente, il faut HDFS HA pour la haute disponibilité réelle.

## Examples

- Tolérance aux pannes : DataNode 1 tombe → le NameNode détecte l'absence de heartbeat → il ordonne la re-réplication des blocs manquants depuis DataNode 2 ou 3 vers un autre nœud sain.
- Écriture en pipeline : un bloc de 128 Mo est envoyé au DN1, qui le copie vers DN2, qui le copie vers DN3 ; chaque étape valide la réception avant de passer au bloc suivant.
- Frameworks s'appuyant sur YARN sans que l'utilisateur l'adresse directement : Apache Spark, Hive, Pig.
- Cloud inspirés des principes HDFS : Amazon S3, Google Cloud Storage, Azure Data Lake — stockage distribué, réplication, scalabilité horizontale.
- Origine du nom : 'Hadoop' est le nom du jouet éléphant en peluche du fils de Doug Cutting, créateur du framework.

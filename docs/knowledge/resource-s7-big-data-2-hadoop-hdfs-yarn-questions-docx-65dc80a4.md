---
id: resource-s7-big-data-2-hadoop-hdfs-yarn-questions-docx-65dc80a4
slug: resource-s7-big-data-2-hadoop-hdfs-yarn-questions-docx-65dc80a4
source_key: 'sha256:65dc80a4dcca30ec2e4e2f0866612793c3124f7653a5896ab408cbe5d000dc46'
part_of: S7 - big data
order: 2
manifest: null
derived_from: 'sha256:65dc80a4dcca30ec2e4e2f0866612793c3124f7653a5896ab408cbe5d000dc46'
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
  - namenode
  - datanode
  - resourcemanager
  - fault-tolerance
domain: big-data
---
# S7 - big data — 2_Hadoop_HDFS_YARN_Questions.docx

## Summary

Référence rapide sur l'écosystème Hadoop : définitions, rôles des composants HDFS (NameNode, DataNode, Secondary NameNode, HA, Federation) et YARN (ResourceManager, NodeManager, ApplicationMaster). Couvre les principes de tolérance aux pannes, le modèle write-once-read-many et la gestion des ressources cluster.

## Fields/API

**name**: Hadoop
**value**: Framework open-source Java de traitement distribué. Trois piliers : stockage (HDFS), calcul (MapReduce/YARN), gestion de cluster. Nom issu du jouet éléphant du fils de Doug Cutting. Implémentation libre du papier Google MapReduce (2004), popularisé par son modèle commodity hardware + tolérance aux pannes native.
**name**: Tolérance aux pannes Hadoop
**value**: Réplication de chaque bloc sur plusieurs DataNodes (défaut : 3 copies). Le NameNode détecte les DataNodes défaillants via heartbeats et relance la réplication si une copie disparaît.
**name**: Bloc HDFS
**value**: Unité de stockage HDFS. Taille par défaut : 128 Mo (anciennement 64 Mo). Un fichier est découpé en blocs indépendants répartis sur les DataNodes.
**name**: Modèle write-once-read-many
**value**: HDFS optimise les lectures séquentielles massives (batch). Les fichiers ne sont pas modifiables après écriture (pas de random write). Inadapté aux petits fichiers (surcharge mémoire du NameNode : 1 entrée de métadonnée par fichier/bloc).
**name**: NameNode
**value**: Nœud maître HDFS. Stocke le namespace (arborescence) et la carte bloc→DataNode en mémoire RAM. Ne stocke pas les données elles-mêmes. Point de défaillance unique (SPOF) sans HA.
**name**: DataNode
**value**: Nœud worker HDFS. Stocke les blocs sur disque local. Envoie des heartbeats et des block reports au NameNode. Effectue la réplication pipeline lors des écritures.
**name**: Secondary NameNode
**value**: NOM TROMPEUR — n'est pas un backup du NameNode. Son rôle : fusionner périodiquement le journal d'éditions (EditLog) avec le snapshot filesystem (FsImage) pour réduire le temps de redémarrage du NameNode.
**name**: HDFS Federation
**value**: Permet de déployer plusieurs NameNodes indépendants partageant le même pool de DataNodes. Objectif : passage à l'échelle horizontal du namespace (un seul NameNode est limité par la RAM).
**name**: High Availability (HA) HDFS
**value**: Paire Active/Standby NameNode synchronisée via un journal partagé (JournalNodes) et coordonnée par ZooKeeper. En cas de panne de l'Active, le Standby prend le relais automatiquement (failover).
**name**: Opérations lecture/écriture HDFS
**value**: Lecture : le client demande les localisations des blocs au NameNode, puis lit directement les DataNodes les plus proches. Écriture : le client envoie les données au premier DataNode, qui les réplique en pipeline vers les DataNodes suivants.
**name**: Services cloud inspirés HDFS
**value**: Amazon S3, Azure Data Lake Storage (ADLS), Google Cloud Storage (GCS) reprennent les principes de stockage distribué objet à grande échelle.
**name**: YARN
**value**: Yet Another Resource Negotiator. Couche de gestion des ressources et d'ordonnancement des jobs introduite dans Hadoop 2. Découple la gestion des ressources du framework de calcul (plus seulement MapReduce).
**name**: ResourceManager (YARN)
**value**: Arbitre global des ressources du cluster. Alloue des containers (CPU + RAM) aux applications. Composants internes : Scheduler (allocation) + ApplicationsManager (suivi des ApplicationMasters).
**name**: NodeManager (YARN)
**value**: Agent par nœud worker. Lance et surveille les containers. Rapporte la santé et les ressources disponibles au ResourceManager via heartbeats.
**name**: ApplicationMaster (YARN)
**value**: Coordinateur par application (une instance par job). Négocie les containers auprès du ResourceManager et pilote l'exécution des tâches sur les NodeManagers. Exécuté lui-même dans un container.
**name**: Interaction utilisateur avec YARN
**value**: Les utilisateurs passent rarement par YARN directement : ils utilisent des frameworks de haut niveau (Apache Spark, Hive, Flink) qui soumettent leurs jobs à YARN en arrière-plan.

## Constraints

- HDFS inadapté aux petits fichiers : le NameNode stocke 1 entrée mémoire par fichier/bloc — des millions de petits fichiers saturent sa RAM.
- Le NameNode est un SPOF sans configuration HA — sa perte rend le cluster HDFS inaccessible.
- Le modèle write-once interdit les modifications en place ; seules les opérations append sont supportées depuis Hadoop 2.
- YARN ne remplace pas le scheduling applicatif interne : il alloue des containers, l'ApplicationMaster gère le reste.
- La Secondary NameNode n'assure PAS la continuité de service — elle ne remplace pas le NameNode en cas de panne.

## Examples

- Fichier de 1 Go découpé en 8 blocs de 128 Mo, chacun répliqué sur 3 DataNodes → 3 Go consommés mais tolérance à 2 pannes simultanées.
- Job Spark soumis via YARN : ResourceManager lance un ApplicationMaster Spark dans un container, qui négocie ensuite des containers pour les executors.
- Secondary NameNode planifié toutes les heures : fusionne EditLog + FsImage pour que le NameNode redémarre en secondes au lieu de minutes.

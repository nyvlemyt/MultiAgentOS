---
id: resource-64-mib-67108864-bytes-4cbf2b5c
slug: resource-64-mib-67108864-bytes-4cbf2b5c
source_key: 'sha256:4cbf2b5c82c46a3887f921304be5d9d8b40f74405da3618ff6af0ed8424eb398'
part_of: null
order: null
manifest: null
derived_from: 'sha256:4cbf2b5c82c46a3887f921304be5d9d8b40f74405da3618ff6af0ed8424eb398'
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
  - hdfs
  - hadoop
  - bigdata
  - docker
  - replication
  - blocks
  - namenode
  - datanode
  - fault-tolerance
  - distributed-storage
domain: Big Data & Distributed Systems
---
# 64 MiB = 67108864 bytes

## Goal

Manipuler un cluster Hadoop dockerisé (1 NameNode + 2 DataNodes) pour comprendre par la pratique les concepts fondamentaux d'HDFS : organisation en blocs, facteur de réplication, tolérance aux pannes et stockage physique des métadonnées.

## Prerequisites

- Docker installé et fonctionnel sur la machine hôte
- Cluster Hadoop 3.x démarré via docker-compose (hadoop-master, hadoop-worker1, hadoop-worker2)
- Fichier ratings.csv (MovieLens 32M) copié dans le container : `docker cp ./ratings.csv hadoop-master:/root/data/ratings.csv`, ou fichier purchases.txt déjà présent dans le container
- Accès shell au container : `docker exec -it hadoop-master bash`

## Steps

**title**: 1. Créer l'espace de travail HDFS
**commands**: - hdfs dfs -mkdir -p /tp/hdfs/input
- hdfs dfs -mkdir -p /tp/hdfs/output
- hdfs dfs -put ./data/ratings.csv /tp/hdfs/input
- hdfs dfs -ls -h /tp/hdfs/input/
**note**: Le chemin du fichier source doit être relatif à la position courante dans le container. Erreur classique : omettre `./data/` et pointer directement `ratings.csv`.
**observed**: ratings.csv confirmé présent ; taille logique = 877 076 222 octets (~836 Mo).
**title**: 2. Lire et explorer les données sans rapatriement local
**commands**: - hdfs dfs -head /tp/hdfs/input/ratings.csv
- hdfs dfs -tail /tp/hdfs/input/ratings.csv
- hdfs dfs -cat /tp/hdfs/input/ratings.csv | head -n 20
**note**: `-head` = premières lignes, `-tail` = dernières lignes, `-cat` = flux complet. Aucune copie locale nécessaire : lecture directe depuis HDFS.
**title**: 3. Inspecter les métadonnées : blocs, localisations, réplication
**commands**: - hdfs fsck /tp/hdfs/input/ratings.csv -files -blocks -locations
**observed**: 7 blocs, taille moyenne ~125 Mo/bloc, facteur de réplication configuré à 2 mais effectif à 1 (cluster réduit), tous les réplicas sur un seul DataNode (172.18.0.3:9866).
**title**: 4. Explorer via l'interface Web du NameNode
**url_pattern**: http://localhost:9870 (Hadoop 3.x) ou http://localhost:50070 (Hadoop 2.x)
**path**: Utilities → Browse the file system → /tp/hdfs/input/ratings.csv
**observed**: 7 blocs (~134 Mo chacun), réplication visible dans la section Availability, blocs hébergés sur hadoop-worker1 et hadoop-worker2 (facteur réel = 2).
**title**: 5. Modifier le facteur de réplication d'un fichier
**commands**: - hdfs dfs -stat "%n repl=%r" /tp/hdfs/input/ratings.csv
- hdfs dfs -setrep -w 3 /tp/hdfs/input/ratings.csv
- hdfs dfs -stat "%n repl=%r" /tp/hdfs/input/ratings.csv
- hdfs fsck /tp/hdfs/input/ratings.csv -files -blocks -locations
**note**: L'option `-w` attend la fin de la ré-réplication avant de rendre la main. Le changement est par fichier, pas global.
**title**: 6. Démo taille de bloc : uploader avec un block size personnalisé
**commands**: - hdfs dfs -Ddfs.blocksize=67108864 -put /data/purchases.txt /tp/hdfs/input/Purchases_64MiB.txt
- hdfs dfs -stat "%n blockSize=%o" /tp/hdfs/input/purchases_64MiB.txt
- hdfs fsck /tp/hdfs/input/Purchases_64MiB.txt -files -blocks
**observed**: 64 MiB = 67 108 864 bytes. purchases.txt (211 Mo) → 4 blocs avec 64 MiB vs moins de blocs avec la taille par défaut (~128 Mo). La taille logique du fichier ne change pas ; seul le découpage physique varie. Trade-off : plus de blocs = plus de parallélisme mais plus de métadonnées côté NameNode.
**note**: La taille de bloc est fixée à la création du fichier. Modifier `dfs.blocksize` dans `hdfs-site.xml` n'affecte que les fichiers créés après la modification.
**title**: 7. Simuler une panne d'un DataNode
**commands**: - docker stop hadoop-worker2
- hdfs dfsadmin -report
- hdfs fsck /tp/hdfs/input/purchases.txt -files -blocks -locations
- hdfs dfs -cat /tp/hdfs/input/purchases.txt | head -n 5
- docker start hadoop-worker2
- hdfs dfsadmin -report
**observed**: Pendant l'arrêt : 1 Live / 1 Dead datanode, 13 blocs under-replicated, mais la lecture reste possible grâce aux réplicas sur hadoop-worker1. Après redémarrage : 2 Live datanodes, 0 Dead, 0 under-replicated (récupération automatique).
**title**: 8. Localiser les fichiers physiques (lecture seule)
**commands**: - grep -A1 dfs.namenode.name.dir $HADOOP_HOME/etc/hadoop/hdfs-site.xml
- grep -A1 dfs.datanode.data.dir $HADOOP_HOME/etc/hadoop/hdfs-site.xml
**observed**: NameNode stocke le namespace dans `/root/hdfs/namenode` (fsimage + edits). DataNodes stockent les blocs dans `/root/hdfs/datanode`. Ne jamais éditer ces fichiers manuellement : toute modification directe contourne la logique de cohérence du cluster et corrompt le namespace.

## Result

À l'issue du TP : cluster HDFS opérationnel avec compréhension pratique de (1) l'upload/lecture de fichiers volumineux, (2) l'organisation en blocs et la signification de la taille de bloc, (3) le facteur de réplication et sa modification à chaud, (4) la tolérance aux pannes par réplication multi-DataNode, (5) la séparation des responsabilités NameNode (métadonnées) vs DataNodes (données brutes).

## Next

- Continuer avec MapReduce sur le même cluster (partie suivante du TP BigData)
- Expérimenter avec des tailles de bloc différentes (32 MiB, 256 MiB) et mesurer l'impact sur le nombre de blocs et les performances de lecture
- Explorer les commandes `hdfs dfs -getmerge` pour récupérer et fusionner des sorties MapReduce
- Activer la haute disponibilité du NameNode (HA mode avec ZooKeeper) pour éliminer le SPOF

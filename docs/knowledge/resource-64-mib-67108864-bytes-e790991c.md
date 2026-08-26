---
id: resource-64-mib-67108864-bytes-e790991c
slug: resource-64-mib-67108864-bytes-e790991c
source_key: 'sha256:e790991cfb4a2f14ccbb2ed8314e96d254233b6ebbdd88efe14487d28ba679e4'
part_of: null
order: null
manifest: null
derived_from: 'sha256:e790991cfb4a2f14ccbb2ed8314e96d254233b6ebbdd88efe14487d28ba679e4'
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
  - big-data
  - distributed-filesystem
  - block-size
  - replication
  - docker
  - fault-tolerance
  - namenode
  - datanode
domain: big-data
---
# 64 MiB = 67108864 bytes

## Goal

Manipuler HDFS en pratique : uploader des fichiers volumineux, explorer les métadonnées (blocs, réplication, DataNodes), modifier le block size et le facteur de réplication, simuler une panne de DataNode, et comprendre la séparation NameNode (métadonnées) vs DataNode (données réelles).

## Prerequisites

- Cluster Hadoop 3.x dockerisé démarré : 1 NameNode (hadoop-master) + 2 DataNodes (hadoop-worker1, hadoop-worker2) — suivre https://insatunisia.github.io/TP-BigData/tp1/ jusqu'à la fin de la section HDFS
- Dataset MovieLens 32M (ratings.csv, ~836 Mo) copié dans le container via `docker cp`, ou fichier purchases.txt (~211 Mo) déjà présent dans /root/ du container
- Accès shell au container hadoop-master (docker exec ou session ouverte)

## Steps

**title**: 1 — Créer l'espace de travail HDFS et uploader le fichier
**commands**: - hdfs dfs -mkdir -p /tp/hdfs/input
- hdfs dfs -mkdir -p /tp/hdfs/output
- hdfs dfs -put ./data/ratings.csv /tp/hdfs/input
- hdfs dfs -ls -h /tp/hdfs/input/
**note**: Erreur courante : 'No such file or directory' si le chemin local est incorrect (ratings.csv est dans ./data/, pas dans ./). Résultat attendu : taille logique 877 076 222 octets (~836 Mo).
**title**: 2 — Lire les données sans copier le fichier en local
**commands**: - hdfs dfs -head /tp/hdfs/input/ratings.csv
- hdfs dfs -tail /tp/hdfs/input/ratings.csv
- hdfs dfs -cat  /tp/hdfs/input/ratings.csv | head -n 20
**note**: -head affiche le début, -tail la fin, -cat streame l'intégralité. Aucun transfert vers le système local requis.
**title**: 3 — Inspecter blocs, localisations et réplication via fsck
**commands**: - hdfs fsck /tp/hdfs/input/ratings.csv -files -blocks -locations
- hdfs dfs -stat "%n  size=%b  repl=%r  blockSize=%o" /tp/hdfs/input/ratings.csv
**note**: ratings.csv → 7 blocs, taille moyenne ~125 Mo par bloc, facteur de réplication déclaré = 2 (peut être effectivement 1 si un seul DataNode actif au moment de l'upload).
**title**: 4 — Explorer via l'UI Web du NameNode
**access**: http://localhost:9870 (Hadoop 3.x) ou http://localhost:50070 (Hadoop 2.x) → Utilities → Browse the file system → /tp/hdfs/input/ratings.csv
**note**: L'UI affiche : ~134 Mo par bloc, 7 blocs (Block 0 à Block 6), réplicas présents sur hadoop-worker1 et hadoop-worker2 → facteur de réplication effectif = 2.
**title**: 5 — Modifier le facteur de réplication par fichier
**commands**: - hdfs dfs -stat "%n repl=%r" /tp/hdfs/input/ratings.csv
- hdfs dfs -setrep -w 3 /tp/hdfs/input/ratings.csv
- hdfs dfs -stat "%n repl=%r" /tp/hdfs/input/ratings.csv
- hdfs fsck /tp/hdfs/input/ratings.csv -files -blocks -locations
**note**: Le flag -w attend la fin de la re-réplication avant de rendre la main. Les blocs migrent automatiquement vers le 3e DataNode disponible.
**title**: 6 — Créer un fichier avec block size 64 MiB (67108864 bytes)
**commands**: - hdfs dfs -Ddfs.blocksize=67108864 -put /root/purchases.txt /tp/hdfs/input/Purchases_64MiB.txt
- hdfs dfs -stat "%n blockSize=%o" /tp/hdfs/input/Purchases_64MiB.txt
- hdfs fsck /tp/hdfs/input/Purchases_64MiB.txt -files -blocks
**note**: purchases.txt (211 Mo) → 4 blocs avec 64 MiB vs 2 blocs avec le défaut 128 MiB. La taille logique du fichier est inchangée. Trade-off : plus de blocs = plus de parallélisme MapReduce, mais plus de métadonnées sur le NameNode. La taille de bloc est fixée à la création — modifier dfs.blocksize dans hdfs-site.xml n'affecte que les fichiers futurs.
**title**: 7 — Simuler une panne de DataNode et vérifier la tolérance aux pannes
**commands**: - docker stop hadoop-worker2
- hdfs dfsadmin -report
- hdfs fsck /tp/hdfs/input/purchases.txt -files -blocks -locations
- hdfs dfs -cat /tp/hdfs/input/purchases.txt | head -n 5
- docker start hadoop-worker2
- hdfs dfsadmin -report
**note**: Pendant l'arrêt : 1 Live / 1 Dead datanode, ~13 blocs under-replicated signalés par fsck, mais la lecture continue via les réplicas restants sur worker1. Après redémarrage : 2 Live, 0 Dead, 0 under-replicated — le cluster se re-réplique automatiquement.
**title**: 8 — Localiser les fichiers physiques de métadonnées (culture)
**commands**: - grep -A1 dfs.namenode.name.dir $HADOOP_HOME/etc/hadoop/hdfs-site.xml
- grep -A1 dfs.datanode.data.dir  $HADOOP_HOME/etc/hadoop/hdfs-site.xml
**note**: NameNode stocke fsimage/edits dans /root/hdfs/namenode. DataNodes stockent les blocs binaires dans /root/hdfs/datanode. Ne jamais éditer manuellement : cela contourne la logique de cohérence gérée exclusivement par le NameNode et peut corrompre le cluster.

## Result

À l'issue du TP : (1) fichiers uploadés et vérifiés dans HDFS (/tp/hdfs/input/), (2) maîtrise des commandes d'exploration sans copie locale (head/tail/cat/stat/fsck), (3) compréhension empirique du découpage en blocs et de la réplication multi-DataNode, (4) capacité à modifier block size (-D) et facteur de réplication (-setrep) à la volée, (5) validation de la tolérance aux pannes d'un DataNode par redondance des réplicas, (6) distinction claire NameNode (cerveau : métadonnées namespace) vs DataNode (bras : blocs de données réels).

## Next

Partie MapReduce du TP Big Data — écrire et soumettre des jobs MapReduce (ex. comptage de mots, agrégation de ratings) sur les fichiers déjà présents dans /tp/hdfs/input/.

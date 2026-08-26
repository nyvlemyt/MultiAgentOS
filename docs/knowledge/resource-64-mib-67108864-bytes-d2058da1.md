---
id: resource-64-mib-67108864-bytes-d2058da1
slug: resource-64-mib-67108864-bytes-d2058da1
source_key: 'sha256:d2058da15fcb2e5b63010d92573f18e47f093d5d9884275f62eef25089d915d0'
part_of: null
order: null
manifest: null
derived_from: 'sha256:d2058da15fcb2e5b63010d92573f18e47f093d5d9884275f62eef25089d915d0'
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
  - docker
  - block-size
  - replication
  - fault-tolerance
  - namenode
  - datanode
  - distributed-storage
domain: big-data
---
# 64 MiB = 67108864 bytes

## Goal

Manipuler HDFS en pratique : uploader des fichiers, lire leurs métadonnées (blocs, localisation, réplication), modifier le facteur de réplication, comparer des tailles de bloc, et simuler une panne de DataNode — tout sur un cluster Hadoop dockerisé (1 NameNode + 2 DataNodes).

## Prerequisites

- Docker installé et fonctionnel
- Cluster Hadoop 3.x démarré via https://insatunisia.github.io/TP-BigData/tp1/ (partie HDFS uniquement, sans MapReduce)
- Dataset MovieLens 32M (ratings.csv) téléchargé depuis grouplens.org, OU fichier purchases.txt déjà présent dans le container
- Commande docker cp disponible pour copier le fichier dans hadoop-master:/root/data/

## Steps

**title**: Créer l'espace de travail HDFS et uploader le fichier
**commands**: - hdfs dfs -mkdir -p /tp/hdfs/input
- hdfs dfs -mkdir -p /tp/hdfs/output
- hdfs dfs -put ratings.csv /tp/hdfs/input
- hdfs dfs -ls -h /tp/hdfs/input/
**check**: Q1 — Le fichier est présent ; noter sa taille logique affichée par -ls -h.
**title**: Lire et explorer les données sans rapatrier le fichier
**commands**: - hdfs dfs -head /tp/hdfs/input/ratings.csv
- hdfs dfs -tail /tp/hdfs/input/ratings.csv
- hdfs dfs -cat /tp/hdfs/input/ratings.csv | head -n 20
**check**: Q2-Q3 — Confirmer qu'on peut afficher des extraits en place ; distinguer le rôle de -head, -tail et -cat.
**title**: Inspecter les métadonnées de blocs (fsck)
**commands**: - hdfs fsck /tp/hdfs/input/ratings.csv -files -blocks -locations
- hdfs dfs -stat "%n size=%b repl=%r blockSize=%o" /tp/hdfs/input/ratings.csv
**check**: Q4-Q7 — Relever : nombre de blocs, taille de bloc, DataNodes hébergeant chaque réplica, facteur de réplication.
**title**: Explorer via l'UI Web du NameNode
**url**: http://localhost:9870 (Hadoop 3.x) ou http://localhost:50070 (Hadoop 2.x)
**path**: Utilities → Browse the file system → /tp/hdfs/input/ratings.csv
**check**: Q8-Q9 — Retrouver réplication, taille de bloc, nombre de blocs et DataNodes par bloc via l'interface graphique.
**title**: Changer le facteur de réplication par fichier
**commands**: - hdfs dfs -stat "%n repl=%r" /tp/hdfs/input/ratings.csv
- hdfs dfs -setrep -w 3 /tp/hdfs/input/ratings.csv
- hdfs dfs -stat "%n repl=%r" /tp/hdfs/input/ratings.csv
- hdfs fsck /tp/hdfs/input/ratings.csv -files -blocks -locations
**check**: Q10-Q11 — Vérifier que le facteur est passé à 3 et observer la redistribution des blocs sur les DataNodes.
**title**: Démontrer l'effet de la taille de bloc (block size)
**commands**: - hdfs dfs -stat "%n blockSize=%o" /tp/hdfs/input/ratings.csv
- hdfs dfs -Ddfs.blocksize=67108864 -put /data/purchases.txt /tp/hdfs/input/Purchases_64MiB.txt
- hdfs dfs -stat "%n blockSize=%o" /tp/hdfs/input/Purchases_64MiB.txt
- hdfs fsck /tp/hdfs/input/Purchases_64MiB.txt -files -blocks
**note**: 64 MiB = 67108864 bytes. La taille de bloc est fixée à la création du fichier (ou via dfs.blocksize global dans hdfs-site.xml, qui n'affecte que les fichiers créés après). Moins de blocs = moins de parallélisme ; plus de blocs = plus de métadonnées — trade-off.
**check**: Q12-Q13 — Comparer le nombre de blocs entre version par défaut et version 64 MiB ; confirmer que la taille logique du fichier est inchangée.
**title**: Simuler une panne de DataNode (tolérance aux pannes)
**commands**: - docker stop hadoop-worker2
- hdfs dfsadmin -report
- hdfs fsck /tp/hdfs/input/purchases.txt -files -blocks -locations
- hdfs dfs -cat /tp/hdfs/input/purchases.txt | head -n 5
- docker start hadoop-worker2
- hdfs dfsadmin -report
**check**: Q14-Q17 — Confirmer que le fichier reste lisible pendant la panne grâce à la réplication ; observer les Live/Dead datanodes et les under-replicated blocks dans fsck ; vérifier la résorption après redémarrage.
**title**: Localiser physiquement les fichiers de métadonnées (culture)
**commands**: - grep -A1 dfs.namenode.name.dir $HADOOP_HOME/etc/hadoop/hdfs-site.xml
- grep -A1 dfs.datanode.data.dir $HADOOP_HOME/etc/hadoop/hdfs-site.xml
**note**: Ne jamais éditer ces fichiers manuellement : le NameNode stocke fsimage et edits logs (namespace) ; les DataNodes stockent les blocs de données bruts. Toute modification manuelle corromprait le namespace ou les blocs sans que HDFS le détecte.
**check**: Q18-Q19 — Distinguer ce que stocke le NameNode (namespace/métadonnées) vs les DataNodes (blocs de données).

## Result

À l'issue du TP, l'étudiant sait : uploader et lire des fichiers HDFS, interroger les métadonnées de blocs via CLI et UI Web, modifier le facteur de réplication à chaud, comprendre le trade-off de la taille de bloc, et observer empiriquement la résilience aux pannes d'un DataNode grâce à la réplication.

## Next

TP MapReduce — traitement distribué des fichiers déjà ingérés dans HDFS (suite naturelle du même cluster).

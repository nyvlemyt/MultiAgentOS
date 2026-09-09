---
id: resource-s7-big-data-70f04b2b
slug: resource-s7-big-data-70f04b2b
source_key: 'sha256:70f04b2b9ce7a36346dd9789f5efcb6a4d2b587f87aa87916dc85f452b1cf109'
part_of: null
order: null
manifest: null
derived_from: 'sha256:70f04b2b9ce7a36346dd9789f5efcb6a4d2b587f87aa87916dc85f452b1cf109'
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
  - hbase
  - spark
  - pyspark
  - docker
  - mapreduce
  - cloud
  - ai
  - movielens
domain: Data Engineering
---
# S7 - big data

## Summary

Ensemble pédagogique du semestre 7 couvrant l'écosystème Big Data : fondamentaux théoriques (Big Data, Cloud, IA), infrastructure distribuée (Hadoop, HDFS, YARN), bases de données NoSQL colonnes (HBase), traitement distribué en mémoire (Spark/PySpark), et un projet fil rouge sur le dataset MovieLens. Comprend cours, TPs, exercices et consignes de présentation.

## Fields/API

**name**: Fondamentaux Big Data & Cloud
**docs**: - General_Introduction_BigData_AI_Cloud.docx/.pdf
- Session 1 Intro Big Data - HDFS - YARN.pdf
**contenu**: Introduction aux 3V (Volume, Vélocité, Variété), positionnement Cloud et IA, panorama des cas d'usage.
**name**: Hadoop / HDFS / YARN
**docs**: - Hadoop_HDFS_YARN.docx
- Introduction_Hadoop_HDFS_YARN.pdf
- tp hdfs.docx/.pdf
- cours — tp hdfs.docx
- 2_Hadoop_HDFS_YARN_Questions.docx
**contenu**: Architecture HDFS (NameNode/DataNode, blocs, réplication), YARN (ResourceManager/NodeManager, scheduling), commandes shell HDFS, travaux pratiques.
**name**: HBase
**docs**: - Session 2 Course - HBase.pdf
- Session 3 Course - HBase.pdf
- HBase_Questions.docx
- tp2 HBASE - part 1.docx
**contenu**: Modèle de données colonnaire, architecture (HMaster, RegionServer), opérations CRUD, questions de révision et TP guidé.
**name**: Spark & PySpark
**docs**: - Spark fundamentals and RDD.pdf
- session 3 Spark fundamentals and RDD.pdf
- session 4 Spark DFs.pdf
- Exercises_PySpark.docx
**contenu**: RDD (création, transformations, actions), DataFrames Spark, Spark SQL, exercices PySpark progressifs.
**name**: Docker
**docs**: - Session 2 Docker.pdf
**contenu**: Bases de la conteneurisation Docker dans le contexte Big Data (images, conteneurs, volumes, réseau).
**name**: Installation & environnement
**docs**: - installation_big_data.docx/.pdf
**contenu**: Guide pas-à-pas pour monter l'environnement local : Hadoop, HBase, Spark en mode pseudo-distribué.
**name**: Projet MovieLens
**docs**: - project movielens BDML 2025.pdf
- projet_big_data_movielens_consignes — *.docx/.pdf
- technical-note-dataset-electric-school-bus-adoption-united-states.pdf
**contenu**: Projet de fin de semestre : pipeline Big Data sur le dataset MovieLens (recommandation films). Consignes, livrables, guidelines de présentation. Le PDF sur les bus électriques semble être une note technique dataset annexe.
**name**: Questions de révision
**docs**: - 1_BigData_Questions.docx
- 2_Hadoop_HDFS_YARN_Questions.docx
- HBase_Questions.docx
**contenu**: Banques de questions théoriques et pratiques pour chaque module : Big Data général, HDFS/YARN, HBase.

## Constraints

- Environnement cible : cluster pseudo-distribué local (pas cloud managé) pour les TPs.
- Langage principal des exercices : PySpark (Python).
- Projet MovieLens évalué avec soutenance — guidelines de présentation incluses.
- 28 documents au total ; certains existent en double format (.docx + .pdf).

## Examples

- TP HDFS : créer un répertoire, uploader un fichier, vérifier la réplication avec `hdfs dfs -ls` et `hdfs fsck`.
- TP HBase part 1 : créer une table, insérer des lignes via le shell HBase, scanner avec filtres.
- Exercices PySpark : charger un CSV en RDD, appliquer map/filter/reduceByKey, convertir en DataFrame et exécuter une requête SQL.
- Projet MovieLens : ingérer les ratings dans HDFS, traiter avec Spark, exposer des recommandations.

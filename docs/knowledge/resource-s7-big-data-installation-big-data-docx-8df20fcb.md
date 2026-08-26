---
id: resource-s7-big-data-installation-big-data-docx-8df20fcb
slug: resource-s7-big-data-installation-big-data-docx-8df20fcb
source_key: 'sha256:8df20fcbc1495295cbfb2cdd54323e4708c2d106950b7499c5d810ccbbada14a'
part_of: S7 - big data
order: 15
manifest: null
derived_from: 'sha256:8df20fcbc1495295cbfb2cdd54323e4708c2d106950b7499c5d810ccbbada14a'
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
doc_type: howto
actionability: area
lane: workflows
schema_version: '1'
tags:
  - hive
  - hadoop
  - big-data
  - hdfs
  - mysql
  - hiveserver2
  - beeline
  - installation
  - cluster
domain: Big Data / Data Engineering
---
# S7 - big data — installation_big_data.docx

## Problem

Installer et faire fonctionner Apache Hive 3.1.3 sur un cluster Hadoop multi-nœuds (Docker ou bare-metal), avec un metastore MySQL et accès via HiveServer2 depuis des conteneurs distants.

## Solution

Installation en 9 étapes séquentielles sur hadoop-master uniquement : (0) pré-check HDFS+YARN → (1) téléchargement et extraction de Hive dans /usr/local/hive → (2) variables d'environnement dans ~/.bashrc → (3) création des répertoires HDFS /tmp et /user/hive/warehouse avec chmod 1777 → (4) configuration hive-site.xml (metastore MySQL, moteur MapReduce/YARN, HiveServer2 sur port 10000) → (5) installation MySQL + création de la base metastore + utilisateur hive + ajout du driver JDBC mysql-connector-j-8.0.33 dans $HIVE_HOME/lib → (6) résolution du conflit Guava en copiant la version Hadoop dans lib/ Hive et supprimant l'ancienne → (7) initialisation du schéma via schematool -initSchema -dbType mysql → démarrage de HiveServer2 en arrière-plan et connexion via beeline.

## Variations

- Accès depuis un autre conteneur Docker sur le même réseau : `beeline -u "jdbc:hive2://hadoop-master:10000/default"` (le hostname hadoop-master doit être résolvable).
- Sans MySQL (non recommandé en prod) : utiliser Derby embarqué en retirant les propriétés javax.jdo.option.Connection* et en fixant le dbType sur derby lors du schematool.
- Démarrage MySQL sans systemd (conteneur) : `service mysql start` + `update-rc.d mysql defaults` au lieu de systemctl.

## Pitfalls

- HDFS safe mode bloque toutes les écritures : vérifier avec `hdfs dfsadmin -safemode get` et lever avec `hdfs dfsadmin -safemode leave` avant d'aller plus loin.
- Conflit de version Guava (Hive 3.1.3 embarque guava-19, Hadoop 3.x utilise guava-27+) : l'erreur se manifeste au lancement de hive ou de schematool ; corriger en copiant la jar Hadoop dans lib/ Hive et supprimant l'ancienne.
- Erreur 'root not allowed to impersonate anonymous' : setter hive.server2.enable.doAs à false dans hive-site.xml.
- Permissions insuffisantes sur /tmp ou /user/hive/warehouse : les deux chemins HDFS doivent avoir le sticky-bit 1777.
- Driver JDBC absent : copier mysql-connector-java-8.0.33.jar dans $HIVE_HOME/lib/ avant d'initialiser le schéma, sinon schematool échoue avec ClassNotFoundException.
- Les variables d'environnement ne s'appliquent que sur hadoop-master ; ne pas répliquer l'installation Hive sur les workers.

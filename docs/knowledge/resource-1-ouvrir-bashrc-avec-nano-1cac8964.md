---
id: resource-1-ouvrir-bashrc-avec-nano-1cac8964
slug: resource-1-ouvrir-bashrc-avec-nano-1cac8964
source_key: 'sha256:1cac89647b936e1a3e46a73ad608a456f0ed05214bfa24bc3738870f41cfd9bf'
part_of: null
order: null
manifest: null
derived_from: 'sha256:1cac89647b936e1a3e46a73ad608a456f0ed05214bfa24bc3738870f41cfd9bf'
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
  - hdfs
  - mysql
  - hiveserver2
  - beeline
  - big-data
  - cluster
domain: big data
---
# 1. Ouvrir ~/.bashrc avec nano

## Problem

Installer et faire fonctionner Apache Hive 3.1.3 sur un cluster Hadoop (Docker ou bare-metal), avec MySQL comme metastore et HiveServer2 pour l'accès externe.

## Solution

Étape 0 — Pré-checks : `jps`, `hdfs dfs -ls /`, `yarn node -list` sur hadoop-master. Si HDFS en safe mode : `hdfs dfsadmin -safemode leave`.

Étape 1 — Installer Hive sur hadoop-master uniquement :
```
apt update && apt install -y wget tar nano
cd /opt
wget https://archive.apache.org/dist/hive/hive-3.1.3/apache-hive-3.1.3-bin.tar.gz
tar -xzf apache-hive-3.1.3-bin.tar.gz
mv apache-hive-3.1.3-bin /usr/local/hive
```

Étape 2 — Variables d'environnement dans `~/.bashrc` :
```
export HIVE_HOME=/usr/local/hive
export PATH=$PATH:$HIVE_HOME/bin:$HIVE_HOME/sbin
export HADOOP_HOME=/usr/local/hadoop
export HADOOP_CONF_DIR=$HADOOP_HOME/etc/hadoop
```
Puis `source ~/.bashrc`. Vérifier : `hive --version` et `beeline --version`.

Étape 3 — Préparer HDFS :
```
hdfs dfs -mkdir -p /tmp
hdfs dfs -mkdir -p /user/hive/warehouse
hdfs dfs -chmod 1777 /tmp
hdfs dfs -chmod 1777 /user/hive/warehouse
```

Étape 4 — Créer `$HIVE_HOME/conf/hive-site.xml` avec : connexion JDBC MySQL (`jdbc:mysql://localhost:3306/metastore`), user/password `hive`/`hivepass`, warehouse dir `/user/hive/warehouse`, moteur d'exécution `mr` (MapReduce sur YARN), HiveServer2 sur port 10000, `hive.server2.enable.doAs=false`, `datanucleus.autoCreateSchema=true`.

Étape 5 — Metastore MySQL :
```
apt install -y mysql-server && service mysql start
mysql -u root -p
  CREATE DATABASE metastore;
  CREATE USER 'hive'@'%' IDENTIFIED BY 'hivepass';
  GRANT ALL PRIVILEGES ON metastore.* TO 'hive'@'%';
  FLUSH PRIVILEGES;
```
Télécharger `mysql-connector-j-8.0.33.jar` et le copier dans `$HIVE_HOME/lib/`.

Étape 6 — Résoudre le conflit Guava Hadoop/Hive :
```
# Copier la version Guava de Hadoop dans Hive, supprimer l'ancienne
cp /usr/local/hadoop/share/hadoop/common/lib/guava-*.jar /usr/local/hive/lib/
rm /usr/local/hive/lib/guava-19.0.jar 2>/dev/null || true
```

Étape 7 — Initialiser le schéma :
```
cd /usr/local/hive
./bin/schematool -initSchema -dbType mysql
```
Test CLI : `hive` puis `SHOW DATABASES;`.

Étape 8 — Démarrer HiveServer2 et se connecter :
```
hiveserver2 &
beeline -u "jdbc:hive2://localhost:10000/default"
# depuis un autre conteneur sur le même réseau Docker :
beeline -u "jdbc:hive2://hadoop-master:10000/default"
```

## Variations

- Accès depuis un autre conteneur Docker : utiliser le hostname `hadoop-master` et le port 10000 (même réseau Docker requis).
- Si MySQL ne démarre pas avec `systemctl` (Docker sans systemd) : utiliser `service mysql start` + `update-rc.d mysql defaults`.
- Test complet : créer une base `mon_projet`, une table `employes` (CSV délimité), charger via `LOAD DATA INPATH`, requêter avec `SELECT`, `AVG`, `COUNT`.

## Pitfalls

- HDFS safe mode bloque toutes les opérations : toujours vérifier avec `hdfs dfsadmin -safemode leave` avant de commencer.
- Conflit Guava : Hive 3.1.3 embarque guava-19.0 ; Hadoop 3.x utilise guava-27+. Ne pas remplacer = ClassCastException au démarrage.
- Driver JDBC MySQL absent de `$HIVE_HOME/lib/` = erreur de connexion au metastore au `schematool`.
- Permissions HDFS manquantes sur `/tmp` ou `/user/hive/warehouse` (doivent être 1777) = erreurs d'écriture lors des requêtes.
- Erreur 'root not allowed to impersonate anonymous' : mettre `hive.server2.enable.doAs=false` dans `hive-site.xml`.
- Hive doit être installé uniquement sur hadoop-master, pas sur les workers.

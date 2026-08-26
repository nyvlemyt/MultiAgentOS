---
id: resource-s7-nosql-lab3-cassandra-pdf-56f5d7d9
slug: resource-s7-nosql-lab3-cassandra-pdf-56f5d7d9
source_key: 'sha256:56f5d7d976312cb812adb34ad1e5f615821d6c624e7c6974ad7ef2b347ac8134'
part_of: S7 - nosql
order: 6
manifest: null
derived_from: 'sha256:56f5d7d976312cb812adb34ad1e5f615821d6c624e7c6974ad7ef2b347ac8134'
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
  - cassandra
  - nosql
  - cql
  - keyspace
  - partitioning
  - clustering-columns
  - udt
  - collections
  - counter
  - ttl
domain: databases
---
# S7 - nosql — Lab3-Cassandra.pdf

## Goal

Maîtriser les fondamentaux de Cassandra Query Language (CQL) en construisant progressivement un modèle de données vidéo : keyspace, tables, requêtes, index secondaires, colonnes de clustering, types complexes (SET/LIST/MAP/UDT), compteurs et données temporelles.

## Prerequisites

- Cassandra installé et démarré (cqlsh accessible)
- Notions de bases relationnelles (SQL de base)
- Comprendre que Cassandra n'a pas de JOINs — le modèle de données suit les requêtes, pas l'inverse

## Steps

**step**: 1
**title**: Créer le keyspace
**body**: CREATE KEYSPACE demoVideo WITH REPLICATION = {'class': 'SimpleStrategy', 'replication_factor': 1}; USE demoVideo; — Le keyspace est l'équivalent de la base de données ; SimpleStrategy convient pour un nœud unique ou le dev.
**step**: 2
**title**: Créer la table videos et insérer des données
**body**: CREATE TABLE videos (id int, name text, runtime int, year int, PRIMARY KEY (id)); — Insertion possible via INSERT INTO ou COPY ... FROM 'file.csv'.
**step**: 3
**title**: Requêtes de base et limite des index
**body**: SELECT count(*) vérifie le nombre de lignes. Filtrer sur une colonne non-clé (ex. year > 2014) produit une erreur car Cassandra interdit le scan complet sans index. Solution : CREATE INDEX IndexName ON KeyspaceName.TableName(ColumnName); — mais les index secondaires sont coûteux en production.
**step**: 4
**title**: Comprendre le stockage physique et la partition composite
**body**: Cassandra stocke les données par partition. Une PRIMARY KEY composite ((name, year)) fait de name+year la clé de partition — toutes les lignes d'une même partition sont co-localisées. Conséquence : CREATE TABLE videos_by_name_year (name text, year int, runtime int, PRIMARY KEY ((name, year))); permet de retrouver un film précis mais pas tous les films d'une année.
**step**: 5
**title**: Upsert Cassandra
**body**: Un INSERT sur une clé existante écrase silencieusement la ligne (pas d'erreur de doublon). C'est le comportement UPSERT natif de Cassandra — à connaître pour éviter les pertes de données silencieuses.
**step**: 6
**title**: Colonnes de clustering et tri
**body**: PRIMARY KEY ((year), name) : year = clé de partition, name = colonne de clustering (tri intra-partition). Par défaut ASC ; pour DESC : WITH CLUSTERING ORDER BY (name DESC). Permet : SELECT * FROM videos_by_year WHERE year = 2014 AND name >= 'Interstellar'; — la comparaison fonctionne sur les colonnes de clustering.
**step**: 7
**title**: ALTER TABLE
**body**: ALTER TABLE t ADD col text; / ALTER TABLE t DROP col; — La colonne PRIMARY KEY ne peut pas être modifiée. TRUNCATE t; vide la table sans la supprimer.
**step**: 8
**title**: Colonnes multi-valuées : SET, LIST, MAP
**body**: SET<TEXT> : collection non ordonnée sans doublon. LIST<TEXT> : ordonnée par position, accès par index. MAP<TEXT,TEXT> : paires clé-valeur ordonnées par clé. Exemples — ALTER TABLE videos ADD tags SET<TEXT>; UPDATE videos SET tags = tags + {'tag3'} WHERE id=1; DELETE tags FROM videos WHERE id=1;
**step**: 9
**title**: UDT (User Defined Type)
**body**: CREATE TYPE address (street text, city text, zip_code int, phones set<text>); — Permet d'imbriquer des structures complexes dans une colonne. Exemple pratique : créer un UDT video_encoding {encoding, height, width, bit_rates} puis l'importer via COPY depuis un CSV.
**step**: 10
**title**: Compteurs
**body**: CREATE TABLE videos_count_by_tag (tag TEXT, added_year INT, video_count counter, PRIMARY KEY (tag, added_year)); UPDATE videos_count_by_tag SET video_count = video_count + 1 WHERE tag='MyTag' AND added_year=2015; — Un UPDATE sur une clé inexistante crée automatiquement la ligne (comportement UPSERT du counter).
**step**: 11
**title**: Données temporelles : TIMESTAMP et TTL
**body**: Chaque valeur porte un timestamp automatique (ms). writetime(col) retourne le timestamp d'écriture. On peut imposer un timestamp manuel : INSERT INTO user ... USING TIMESTAMP 10; ou UPDATE ... USING TIMESTAMP 12. TTL (Time To Live) : UPDATE user USING TTL 60 SET name='user10' WHERE id=2; — la valeur disparaît après 60 s. ttl(col) retourne les secondes restantes.

## Result

On dispose d'un modèle de données vidéo complet en CQL : keyspace, tables normalisées par requête, index secondaires, colonnes de clustering, types complexes (SET/LIST/MAP/UDT), compteur atomique, et gestion du temps (TIMESTAMP/TTL). On comprend pourquoi Cassandra interdit le filtrage sans index et comment concevoir le schéma autour des requêtes plutôt que des entités.

## Next

- Concevoir un modèle de données pour un autre domaine (e-commerce, IoT) en appliquant la règle query-first
- Explorer la gestion de la cohérence (CONSISTENCY LEVEL : ONE, QUORUM, ALL) et ses compromis CAP
- Mettre en place un cluster multi-nœuds avec NetworkTopologyStrategy et replication_factor > 1
- Étudier Cassandra Lightweight Transactions (IF NOT EXISTS) pour les cas nécessitant de la conditionnalité

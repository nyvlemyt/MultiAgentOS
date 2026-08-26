---
id: resource-s7-big-data-project-movielens-bdml-2025-pdf-e5e373a2
slug: resource-s7-big-data-project-movielens-bdml-2025-pdf-e5e373a2
source_key: 'sha256:e5e373a24c7d70a3ab670df88608e9f691bfe9700e54bdabca27d21d063b6d89'
part_of: S7 - big data
order: 18
manifest: null
derived_from: 'sha256:e5e373a24c7d70a3ab670df88608e9f691bfe9700e54bdabca27d21d063b6d89'
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
lane: workflows
schema_version: '1'
tags:
  - spark
  - hive
  - etl
  - hadoop
  - movielens
  - big-data
  - parquet
  - batch-processing
  - pyspark
  - hql
domain: data-engineering
---
# S7 - big data — project movielens BDML 2025.pdf

## Goal

Build a full ETL pipeline on the MovieLens ml-25m dataset using Apache Spark, then run analytical queries with both Spark SQL and Hive, and finally package everything as two batch scripts (spark-etl.py, hive-etl.hql) executable on a Hadoop cluster.

## Prerequisites

- Access to a running Hadoop cluster with HDFS
- Apache Spark installed and configured on the cluster
- Hive CLI available on the cluster
- MovieLens ml-25m dataset files: genome-scores.csv, genome-tags.csv, links.csv, movies.csv, ratings.csv, tags.csv
- Python environment with PySpark
- Basic knowledge of DataFrame API and SQL

## Steps

- EXTRACT — Load all ml-25m CSV files from HDFS into Spark DataFrames; explore schema and row counts for each file (movies: 62 423 rows, ratings: 25 000 095 rows).
- TRANSFORM — Join and process DataFrames to produce a 'silver' dataset with columns: movie_id, movie_name, release_year (extracted from title string), genre (one row per genre per movie), num_ratings, avg_rating.
- LOAD — Write the silver dataset to HDFS as Parquet (preferred) or CSV; take screenshots of the write command and output directory listing.
- SPARK ANALYSIS — Load the silver Parquet into a new DataFrame, register as a temp view, then run four SQL queries: (1) best movie per year, (2) best movie per genre, (3) best action movie per year, (4) best romance per year. Capture code + output screenshots.
- HIVE TABLES — Using Hive CLI, create two external tables pointing to the original CSV files on HDFS: one for movies, one for ratings. Define correct schemas and LOCATION paths.
- HIVE TRANSFORM — Write a Hive INSERT … SELECT query (or CREATE TABLE AS SELECT) to produce the same silver schema as step 2, stored as a managed Hive table.
- HIVE ANALYSIS — Run the same four analytical queries (best per year, per genre, best action per year, best romance per year) as HiveQL; capture screenshots.
- BATCH SCRIPTS — Consolidate the Spark ETL + analysis into spark-etl.py and the Hive ETL + analysis into hive-etl.hql; submit spark-etl.py via spark-submit and hive-etl.hql via hive -f on the cluster.
- SUBMISSION — Assemble one PDF containing all code screenshots, output screenshots, and brief explanations; submit by 14 January 2026 midnight (work in pairs).

## Result

Two executable scripts (spark-etl.py, hive-etl.hql) that reproduce the full pipeline on any compatible Hadoop cluster, plus a silver Parquet dataset and four analytical query results demonstrating best-movie rankings by year, genre, action, and romance.

## Next

- Add partitioning on release_year in the Parquet/Hive output for faster range queries
- Explore the genome-scores.csv relevance scores to build a content-based movie recommender
- Migrate the Spark job to structured streaming to handle real-time rating updates

---
id: resource-doc-fb8bbc59-fb8bbc59
slug: resource-doc-fb8bbc59-fb8bbc59
source_key: 'sha256:fb8bbc59aafbcc360942dc40ead0a2d72b67de42fb4d566f88c68b2c87443163'
part_of: null
order: null
manifest: null
derived_from: 'sha256:fb8bbc59aafbcc360942dc40ead0a2d72b67de42fb4d566f88c68b2c87443163'
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
  - pyspark
  - spark
  - rdd
  - big-data
  - exercises
  - python
  - hadoop
  - docker
  - colab
domain: data-engineering
---
# .

## Goal

Learn PySpark RDD fundamentals by running hands-on exercises in either a Docker-simulated Hadoop cluster or Google Colab, covering creation, transformation, actions, and pair RDDs.

## Prerequisites

- Basic Python knowledge
- Either: Docker with hadoop-master/hadoop-worker1/hadoop-worker2 images available, OR a Google Colab account
- No prior Spark experience required

## Steps

**title**: Start the environment
**variants**: **docker**: - docker start hadoop-master && docker start hadoop-worker1 && docker start hadoop-worker2
- docker exec -it hadoop-master bash
- Run: pyspark
**colab**: - from pyspark.sql import SparkSession
- spark = SparkSession.builder.appName('MonApp').getOrCreate()
- sc = spark.sparkContext  # use sc in all exercises
**title**: Level -1 — Basic RDD operations
**exercises**: - 1. Create RDD from [1..5], map to double each value, collect and print.
- 2. Create integer RDD, filter odd numbers, count remaining elements.
- 3. Union [1,2,3,4,5] and [3,4,5,6,7], then distinct to remove duplicates.
- 4. Use reduce to sum all elements of an integer RDD.
- 5. Compare map vs flatMap on sentences: map produces nested lists, flatMap flattens words; compare counts.
- 6. Use aggregate to compute: element sum, sum of squares, and element count.
**title**: Level 2 — Performance and pair RDDs
**exercises**: - 7. Persist an RDD mid-pipeline (after filter/map) and benchmark with vs without persist().
- 8. Word count from a text file: split lines → map to (word, 1) → reduceByKey to count occurrences.
- 9. Pair RDD rdd=[('a',1),('b',2),('a',3),('b',4),('a',5),('c',6)]: compare groupByKey (groups values into iterables) vs reduceByKey (aggregates inline — more efficient, avoids full shuffle).

## Result

Learner can create and manipulate PySpark RDDs using core transformations (map, flatMap, filter, union, distinct) and actions (collect, count, reduce, aggregate), understand persistence trade-offs, perform word count, and choose between groupByKey and reduceByKey for pair RDD aggregation.

## Next

- Spark DataFrames and SparkSQL (structured API layer above RDDs)
- Spark Streaming / Structured Streaming for real-time pipelines
- Tuning partitions, broadcast variables, and accumulators
- Deploying Spark jobs on a real cluster (YARN, Kubernetes)

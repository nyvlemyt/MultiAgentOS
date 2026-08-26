---
id: resource-s7-big-data-spark-fundamentals-and-rdd-pdf-43e47576
slug: resource-s7-big-data-spark-fundamentals-and-rdd-pdf-43e47576
source_key: 'sha256:43e47576d379d32de18b0027ed723ac1bf5fc91a411fed96b7ce4496f7311f69'
part_of: S7 - big data
order: 13
manifest: null
derived_from: 'sha256:43e47576d379d32de18b0027ed723ac1bf5fc91a411fed96b7ce4496f7311f69'
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
  - spark
  - rdd
  - pyspark
  - big-data
  - mapreduce
  - distributed-computing
  - pair-rdd
  - hadoop
  - aws-emr
  - lazy-evaluation
domain: big data & distributed computing
---
# S7 - big data — Spark fundamentals and RDD.pdf

## Summary

Apache Spark is an open-source, in-memory distributed computation framework that supersedes Hadoop MapReduce by caching intermediate results in memory, supporting multi-language APIs (Python, Scala, Java, R), and expressing pipelines as DAGs of lazy transformations. The core abstraction is the RDD (Resilient Distributed Dataset): an immutable, partitioned, fault-tolerant collection operated via lazy transformations (returning new RDDs) and eager actions (triggering execution and returning values or writing to storage). Pair RDDs extend this model with key-value semantics for grouping, joining, and aggregating. Spark runs standalone, on YARN/Hadoop, or managed via Amazon EMR.

## Fields/API

**core_concepts**: **Driver Program**: Entry point of a Spark application; holds main(); defines distributed datasets and applies operations on the cluster; can be a Spark shell.
**SparkContext (sc)**: Represents a connection to the computing cluster. Auto-created in the shell; must be created explicitly in batch programs via SparkSession.
**SparkSession**: High-level entry point since Spark 2.x: `spark = SparkSession.builder.appName('X').getOrCreate(); sc = spark.sparkContext`.
**RDD**: Resilient Distributed Dataset — immutable, partitioned collection distributed across cluster nodes. Created from external sources (HDFS, S3, JSON, text) or by transforming an existing RDD.
**DAG / Lineage Graph**: Directed Acyclic Graph tracking RDD dependencies. Used to schedule execution order and re-compute lost partitions after node failure.
**Job**: A Spark action (collect, first, etc.) triggers a job.
**Stage**: DAGScheduler splits a job into stages — groups of transformations executable without a full shuffle (e.g. map + filter in one stage).
**Task**: One parallel unit of work within a stage; one task per partition.
**Spark UI**: http://[ip]:4040 — real-time monitoring of jobs, stages, and tasks.
**Spark History Server**: Post-execution job history web UI.
**rdd_creation**: **sc.textFile(path)**: Create RDD from file on HDFS, S3, or local FS; each line is one element.
**sc.parallelize(collection)**: Create RDD from an in-memory Python/Scala/Java collection.
**sc.parallelize(range(n))**: Create RDD from a numeric range.
**rdd_transformations**: **map(func)**: Apply func to every element; returns new RDD of same size.
**filter(func)**: Keep only elements where func returns True.
**flatMap(func)**: Like map but func returns 0..N items per input (func must return a sequence).
**sample(withReplacement, fraction, seed)**: Random sample of a fraction of the data.
**distinct()**: Remove duplicate elements.
**union(other)**: Union of two RDDs (keeps duplicates).
**intersection(other)**: Elements present in both RDDs.
**subtract(other)**: Elements in this RDD not present in other.
**cartesian(other)**: All (a, b) pairs from both RDDs.
**rdd_actions**: **reduce(func)**: Aggregate all elements with a commutative and associative func.
**collect()**: Return all elements to the driver as a list (use only on small results).
**count()**: Number of elements.
**first()**: First element (triggers scan of only the first partition).
**take(n)**: First n elements.
**takeSample(withReplacement, num, seed)**: Random sample of num elements.
**top(num)**: Top num elements (largest by natural or custom order).
**fold(zero)(func)**: Like reduce but with an initial zero value.
**aggregate(zeroValue, seqOp, combOp)**: Reduce into a different result type; seqOp merges element into accumulator, combOp merges two accumulators.
**takeOrdered(n, ordering)**: First n elements by natural or custom comparator.
**saveAsTextFile(path)**: Write each element as a text line to HDFS, S3, or local FS.
**persistence**: **rdd.persist()**: Mark RDD to be kept in memory (or disk) after first computation so subsequent actions reuse it instead of recomputing.
**rdd.cache()**: Shorthand for persist() with MEMORY_ONLY storage level.
**rdd.unpersist()**: Release cached data and free memory.
**StorageLevel.MEMORY_AND_DISK**: Spill partitions to disk when memory is insufficient.
**pair_rdd_transformations_single**: **reduceByKey(func)**: Combine values sharing the same key with func (commutative + associative). More efficient than groupByKey for aggregations (local combine before shuffle).
**groupByKey()**: Group all values per key into an iterable — shuffles everything; prefer reduceByKey when possible.
**combineByKey(createCombiner, mergeValue, mergeCombiners, partitioner)**: General per-key aggregation into a different result type.
**mapValues(func)**: Apply func to each value; key is unchanged.
**flatMapValues(func)**: Apply func returning an iterator to each value; emits one (key, item) pair per iterator element. Used for tokenization.
**keys()**: RDD of just the keys.
**values()**: RDD of just the values.
**sortByKey(ascending, keyfunc)**: Sort pair RDD by key.
**pair_rdd_transformations_two**: **subtractByKey(other)**: Remove pairs whose key appears in other.
**join(other)**: Inner join: keeps only keys present in both RDDs; produces (key, (v1, v2)).
**rightOuterJoin(other)**: All keys from other; values from left wrapped in Some/None.
**leftOuterJoin(other)**: All keys from this RDD; values from other wrapped in Some/None.
**cogroup(other)**: Group iterables of values from both RDDs by shared key: (key, ([v1…], [v2…])).
**pair_rdd_actions**: **countByKey()**: Return a dict of {key: count}.
**collectAsMap()**: Collect as a Map for O(1) lookup (last value wins for duplicate keys).
**lookup(key)**: Return list of all values for the given key.
**deployment**: **YARN**: Default resource manager on Hadoop clusters. Flow: client → ResourceManager → ApplicationMaster (on a NodeManager) → negotiates containers → dispatches tasks to NodeManagers.
**Amazon EMR**: Managed AWS cluster platform for Spark/Hadoop. Uses EC2 as worker nodes; scales up/down elastically. Pre-installed stack (Hive, Spark, Hadoop, Pig, HUE). Integrates with S3 (via EMRFS), DynamoDB, Kinesis. Node roles: master (coordination), core (compute + HDFS storage), task (compute only, optional).
**Storage options on EMR**: HDFS (in-cluster), EMRFS (S3 as HDFS), local instance store (ephemeral EC2 disk).
**Databricks**: Managed Spark environment (community.cloud.databricks.com) — recommended for learning.
**Local install**: PySpark on Windows not recommended; Ubuntu preferred.

## Constraints

- RDDs are immutable — transformations always produce a new RDD, never modify in-place.
- Transformations are lazy: no computation occurs until an action is triggered.
- Actions force evaluation of all upstream transformations in the DAG.
- Memory is finite: Spark may skip in-memory caching on single-pass workloads or when data exceeds available RAM (spills to disk).
- reduce() requires a commutative and associative function to produce correct results in a parallel setting.
- groupByKey() shuffles all values across the network; prefer reduceByKey() or combineByKey() for aggregations to reduce I/O.
- RDDs are recomputed from scratch on every action unless explicitly persisted.
- API versions shown: Spark 3.x (latest cited: 3.2.0, October 2021); examples in PySpark (Python) and Scala.

## Examples

- text_RDD = sc.textFile('README.md'); lower_RDD = text_RDD.map(lambda l: l.lower()); lower_RDD.collect()
- sc.parallelize([1,2,3,4]).reduce(lambda x, y: x + y)  # → 10
- rdd.persist(StorageLevel.MEMORY_AND_DISK)  # reuse across multiple actions without recomputation
- pairs = lines.map(lambda l: (l.split(' ')[0], l))  # pair RDD: first word → full line
- rdd.reduceByKey(lambda x, y: x + y)  # sum values per key: {(1,2),(3,4),(3,6)} → {(1,2),(3,10)}
- rdd.mapValues(lambda x: x + 1)  # {(1,2),(3,4),(3,6)} → {(1,3),(3,5),(3,7)}
- storeAddress.join(storeRating)  # inner join: Starbucks dropped (no rating)
- storeAddress.leftOuterJoin(storeRating)  # all addresses kept; Starbucks rating → None
- rdd.sortByKey(ascending=True, keyfunc=lambda x: str(x))  # sort pair RDD as strings

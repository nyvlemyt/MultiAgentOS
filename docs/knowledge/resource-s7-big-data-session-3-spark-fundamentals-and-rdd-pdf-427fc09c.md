---
id: resource-s7-big-data-session-3-spark-fundamentals-and-rdd-pdf-427fc09c
slug: resource-s7-big-data-session-3-spark-fundamentals-and-rdd-pdf-427fc09c
source_key: 'sha256:427fc09c826281f502bee94eb6509be2e0fe82fb2022ffa2b946fdf202171b41'
part_of: resource-s7-big-data-70f04b2b
order: 23
manifest: null
derived_from: 'sha256:427fc09c826281f502bee94eb6509be2e0fe82fb2022ffa2b946fdf202171b41'
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
  - hadoop
  - distributed-computing
  - pair-rdd
  - aws-emr
  - yarn
domain: data engineering
---
# S7 - big data — session 3 Spark fundamentals and RDD.pdf

## Summary

Apache Spark fundamentals reference: architecture concepts (Driver, SparkContext, DAG), the full RDD transformation and action API, pair RDD operations, YARN execution model, and Amazon EMR deployment. Covers PySpark, Scala, and Java interfaces for Spark 3.x.

## Fields/API

**SparkContext**: Entry point to any Spark cluster. Auto-created in the interactive shell; must be created explicitly in batch programs. Represents the connection to the computing cluster. SparkUI available at http://<ip>:4040.
**Driver Program**: Process running the application main() function. Launches parallel operations on the cluster via SparkContext and defines distributed datasets.
**RDD (Resilient Distributed Dataset)**: Immutable, fault-tolerant, distributed collection of objects partitioned across cluster nodes. 'Resilient' = recovers from node failures by re-running lost partitions from lineage. Created from HDFS, S3, HBase, JSON, text files, or by transforming another RDD.
**Transformation**: Lazy operation on an RDD that returns a new RDD — never modifies in place. Not executed until an action is called. Forms the edges of the DAG lineage graph.
**Action**: Terminal operation that triggers DAG execution. Returns a result to the driver program or writes to external storage (HDFS, S3, etc.).
**Persist / Cache**: rdd.persist() or rdd.cache() stores partitions in memory across multiple actions. StorageLevel.MEMORY_AND_DISK spills to disk when RAM is full. rdd.unpersist() releases. Without persist, each action recomputes the full lineage.
**DAG (Lineage Graph)**: Spark tracks the dependency chain between RDDs. Used to optimize execution (lazy evaluation, stage batching) and to recover lost partitions without a full recompute.
**Lazy Evaluation**: Transformations are recorded but not executed at call time. Execution is deferred until an action forces it — only the data actually needed is loaded into memory (e.g., first() reads one line only).
**RDD Transformations (standard)**: **map(func)**: Applies func to every element; returns new RDD of same size
**filter(func)**: Returns elements where func is true
**flatMap(func)**: Like map but func returns 0…n items per input element (returns Seq, not single item)
**sample(withReplacement, fraction, seed)**: Random sample; fraction in [0,1]
**distinct()**: Removes duplicate elements
**union(other)**: Union of two RDDs (duplicates kept)
**intersection(other)**: Elements present in both RDDs
**subtract(other)**: Elements in source not in other
**cartesian(other)**: All (a, b) pairs across both RDDs
**RDD Actions (standard)**: **reduce(func)**: Aggregates with a commutative and associative func
**collect()**: Returns all elements as an array to the driver — use only on small results
**count()**: Number of elements in the dataset
**first()**: First element (equivalent to take(1))
**take(n)**: First n elements as an array
**takeSample(withReplacement, num, seed)**: Random sample of num elements
**top(num)**: Top num elements (descending natural order)
**fold(zero)(func)**: Like reduce but with an initial zero value
**aggregate(zeroValue, seqOp, combOp)**: Like reduce but can return a different type; seqOp merges element into accumulator, combOp merges two accumulators
**takeOrdered(n, [ordering])**: First n elements by natural or custom order
**saveAsTextFile(path)**: Writes each element (toString) as a line to local FS, HDFS, or any Hadoop-supported FS
**Pair RDD Creation**: Data structured as (key, value) tuples. sc.parallelize([('a',3),('b',4)]) or lines.map(lambda l: (l.split(' ')[0], l)).
**Pair RDD Transformations (one RDD)**: **reduceByKey(func)**: Combines values with same key using func — preferred over groupByKey for aggregations
**groupByKey()**: Groups all values per key into an iterable — shuffles all data, expensive
**combineByKey(createCombiner, mergeValue, mergeCombiners, partitioner)**: Custom per-key aggregation; can return a type different from the value type
**mapValues(func)**: Applies func to values only; keys pass through unchanged
**flatMapValues(func)**: func returns an iterator; each item becomes a (same_key, item) pair — useful for tokenization
**keys()**: RDD of keys only
**values()**: RDD of values only
**sortByKey([ascending, numPartitions, keyfunc])**: Sorts pairs by key; keyfunc allows custom sort key
**Pair RDD Transformations (two RDDs)**: **subtractByKey(other)**: Keeps pairs from source whose key does NOT appear in other
**join(other)**: Inner join — only keys present in both RDDs
**leftOuterJoin(other)**: All keys from left; right value is Some(v) or None
**rightOuterJoin(other)**: All keys from right; left value is Some(v) or None
**cogroup(other)**: Groups values from both RDDs by key into (Iterable_left, Iterable_right)
**Pair RDD Actions**: **countByKey()**: Count of elements per key returned as a map
**collectAsMap()**: Collects result as a Map for easy driver-side lookup
**lookup(key)**: Returns a list of all values associated with the given key
**Spark Job Execution Model**: Action → Job → DAGScheduler splits job into Stages (sets of transformations without a shuffle boundary) → each Stage = parallel Tasks, one per RDD partition. Visible in SparkUI at port 4040.
**YARN Integration Flow**: Spark client → ResourceManager (RM) allocates ApplicationMaster (AM) on a NodeManager → AM negotiates task containers with RM → AM dispatches to NodeManagers → NMs report task progress to AM → AM reports to RM → RM reports to client.
**Amazon EMR Node Types**: **Master node**: Coordinates data distribution and task scheduling; monitors cluster health. Every cluster has exactly one.
**Core node**: Runs tasks AND stores data in HDFS. Multi-node clusters need at least one.
**Task node**: Runs tasks only; no HDFS storage. Optional; used for elastic scaling.
**EMR Storage Options**: - HDFS (in-cluster)
- EMRFS — S3 treated as HDFS via the Hadoop S3 connector
- Local instance store — ephemeral disk attached to EC2 nodes
**Spark vs MapReduce Summary**: 10–100× faster due to in-memory caching; supports arbitrary DAGs not just map+reduce; native Python/Scala/R/Java APIs with interactive shells; lazy evaluation reduces disk passes; Spark may skip caching on single-pass operations.

## Constraints

- RDDs are immutable — never modify in place; always return a new RDD from a transformation.
- Transformations are lazy — no computation occurs until an action is called.
- collect() loads all data into driver memory — only safe after a filter reduces the dataset to a manageable size.
- reduce() function must be commutative and associative for correct parallel execution.
- groupByKey() shuffles all values to the reducer — prefer reduceByKey() or combineByKey() when the operation allows it to reduce network I/O.
- Spark does not always cache in memory: if data exceeds available RAM it may spill to disk (with MEMORY_AND_DISK) or recompute each time (default).
- SparkContext must be explicitly instantiated in batch programs; it is auto-created only in the interactive shell.
- Per YARN architecture: the ApplicationMaster process runs on a NodeManager, not on the client machine.

## Examples

- text_rdd = sc.textFile('README.md')  # RDD from file
- nums_rdd = sc.parallelize(range(10))  # RDD from local collection
- lower_rdd = text_rdd.map(lambda line: line.lower())  # transformation (lazy)
- text_rdd.first()  # action — triggers DAG execution
- text_rdd.persist(); text_rdd.first(); text_rdd.unpersist()  # persist across actions
- pairs = lines.map(lambda l: (l.split(' ')[0], l))  # create pair RDD
- counts = pairs.reduceByKey(lambda x, y: x + y)  # aggregate by key
- rdd.sortByKey(ascending=True, keyfunc=lambda x: str(x))  # custom sort
- rdd.aggregate((0,0), lambda acc,v: (acc[0]+v, acc[1]+1), lambda a,b: (a[0]+b[0], a[1]+b[1]))  # sum + count in one pass
- pairs.filter(lambda kv: len(kv[1]) < 20)  # filter on value field of pair RDD
- storeAddress.join(storeRating)  # inner join — only stores with both address and rating

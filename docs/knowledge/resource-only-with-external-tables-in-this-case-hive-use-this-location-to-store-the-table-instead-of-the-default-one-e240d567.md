---
id: >-
  resource-only-with-external-tables-in-this-case-hive-use-this-location-to-store-the-table-instead-of-the-default-one-e240d567
slug: >-
  resource-only-with-external-tables-in-this-case-hive-use-this-location-to-store-the-table-instead-of-the-default-one-e240d567
source_key: 'sha256:e240d56731ce35bcbfcda581b82b661fd354e327c3016c7e4a2705ffd0c7740d'
part_of: null
order: null
manifest: null
derived_from: 'sha256:e240d56731ce35bcbfcda581b82b661fd354e327c3016c7e4a2705ffd0c7740d'
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
  - hive
  - sql
  - dataframes
  - pyspark
  - hdfs
  - catalyst
  - tungsten
domain: big data
---
# only with external tables, in this case hive use this location to store the table instead of the default one

## Summary

Comprehensive reference for Spark SQL, DataFrames, and Hive integration covering the DataFrame API (creation, transformations, actions), SQL query interface, optimization engines (Catalyst, Tungsten), and Hive table management including internal vs external tables with HDFS location control.

## Fields/API

**name**: SparkSession
**type**: entry point
**description**: Primary entry point since Spark 2.0. Replaces SQLContext and HiveContext. Created via SparkSession.builder.master(...).appName(...).config(...).getOrCreate(). Enable Hive support with .enableHiveSupport().
**name**: DataFrame creation
**type**: API
**description**: From Python list via createDataFrame(data, schema); from RDD via spark.createDataFrame(rdd, schema); from CSV via spark.read.csv(path, inferSchema=True, header=True); from Hive table via spark.table('tablename').
**name**: Schema definition
**type**: API
**description**: Manual schema via StructType([StructField('Name', StringType(), True), ...]). Types: StringType, IntegerType, DoubleType, etc.
**name**: Transformations (lazy)
**type**: operations
**description**: select, drop, filter/where, distinct, orderBy/sort, groupBy, agg (avg/min/max/count), join (inner/outer/left/right), UDF via udf(lambda, ReturnType). Return new DataFrames, not computed immediately.
**name**: Actions (eager)
**type**: operations
**description**: show(), count(), printSchema(), collect(). Force execution of the transformation chain.
**name**: Join types
**type**: API
**description**: df.join(df2, 'key') — inner (default); 'outer' — full outer; 'left' — left outer; 'right' — right outer.
**name**: SQL interface
**type**: API
**description**: df.createOrReplaceTempView('name') then spark.sql('SELECT ...') or sqlCtx.sql('...'). createTempView/createOrReplaceTempView scope to SparkSession; createOrReplaceGlobalTempView scopes to Spark application.
**name**: Missing data (DataFrameNaFunctions)
**type**: API
**description**: df.na.drop(how, thresh, subset) — remove null rows; df.na.fill(value, subset) — replace nulls; df.na.replace(to_replace, value, subset) — substitute values. dropna/fillna are aliases.
**name**: Write formats
**type**: API
**description**: df.write.csv(path); df.write.parquet(path, mode, partitionBy, compression); df.write.saveAsTable(name, format, mode, partitionBy) — writes to Hive table (default format: parquet). mode values: append, overwrite, error, ignore.
**name**: Catalyst Optimizer
**type**: optimizer
**description**: Powers Spark SQL and DataFrame API. Compiles logical plans into physical plans using rule-based and cost-based optimization. Achieves ~75% reduction in execution time.
**name**: Tungsten
**type**: optimizer
**description**: CPU and memory optimization layer. Uses runtime code generation, cache locality exploitation, and off-heap memory management (bypasses JVM GC). Achieves >75% reduction in memory usage.
**name**: Hive table types
**type**: concept
**description**: Internal (default): Hive manages HDFS directories; DROP deletes files. External: LOCATION clause specifies custom HDFS path; DROP removes only metadata, files remain. Recommended: use external tables.
**name**: Hive LOCATION clause
**type**: DDL
**description**: Only applicable to EXTERNAL tables. Overrides the default warehouse location (/user/hive/warehouse). Syntax: CREATE EXTERNAL TABLE ... LOCATION '/hdfs/path/to/dir';
**name**: Hive LOAD DATA
**type**: DDL
**description**: LOAD DATA INPATH 'hdfs://...' OVERWRITE INTO TABLE t — moves data from HDFS into Hive. LOAD DATA LOCAL INPATH 'local/path' OVERWRITE INTO TABLE t — copies from local filesystem into Hive.
**name**: Hive types
**type**: schema
**description**: Numeric: TINYINT(1B), SMALLINT(2B), INT(4B), BIGINT(8B), FLOAT(4B), DOUBLE(8B). Temporal: TIMESTAMP (ns precision), DATE (YYYYMMDD). Text: STRING. Complex: ARRAY, MAP, STRUCT. Other: BOOLEAN, BINARY.
**name**: Hive execution engine
**type**: config
**description**: Set via hive.execution.engine. Default: mr (MapReduce). Change to spark to use Spark as execution backend.
**name**: Hive Metastore
**type**: component
**description**: Stores table-to-HDFS-directory mappings, column definitions, and schema. Can be backed by any RDBMS (MySQL, PostgreSQL). Accessed via HiveServer2/Beeline/HUE. Read by spark.table().
**name**: Koalas
**type**: library
**description**: Pandas DataFrame API on top of Spark. Allows data scientists to use familiar pandas syntax on distributed datasets without learning the Spark API. docs: koalas.readthedocs.io

## Constraints

- Hive LOCATION clause is only valid for EXTERNAL tables — internal tables always use /user/hive/warehouse.
- Hive does not support UPDATE in practice because HDFS is an immutable filesystem; Hive is schema-on-read, not RDBMS.
- SQLContext and HiveContext are deprecated since Spark 2.0 — use SparkSession (with .enableHiveSupport() for Hive integration).
- Transformations are lazy and do not trigger computation; only actions (show, collect, count) execute the plan.
- DROP on an internal table deletes the underlying HDFS files; DROP on an external table deletes only the metastore entry.

## Examples

**label**: External Hive table with custom LOCATION
**code**: CREATE EXTERNAL TABLE IF NOT EXISTS ratings (
  userID INT, movieID INT, rating INT, time INT)
ROW FORMAT DELIMITED FIELDS TERMINATED BY ','
LOCATION '/user/training/hiveratings';
LOAD DATA INPATH 'hdfs://node02:8020/user/training/ratings.csv' OVERWRITE INTO TABLE ratings;
**label**: Read Hive table as Spark DataFrame
**code**: ratings = spark.table('movieratings')
df = ratings.na.drop().groupBy('movieid').agg(avg('rating').alias('avg'), count('rating').alias('cnt'))
df.filter(df.cnt > 10).sort('avg', ascending=False).show()
**label**: Define schema with StructType
**code**: from pyspark.sql.types import *
mySchema = StructType([
  StructField('Name', StringType(), True),
  StructField('Age', IntegerType(), True),
  StructField('Salary', DoubleType(), True),
  StructField('Sport', StringType(), True),
])
df2 = spark.createDataFrame(rdd, schema=mySchema)
**label**: Group + multi-aggregate
**code**: from pyspark.sql import functions as F
df2.groupBy('Sport').agg(
  F.avg('Salary').alias('Avg Salary'),
  F.min('Salary').alias('Min Salary'),
  F.max('Salary').alias('Max Salary')
).show()
**label**: Write DataFrame to Parquet with overwrite
**code**: df.select([df.movieID, df.movie]).write.parquet('/output/movies', mode='overwrite')
**label**: SQL temp view query
**code**: df.createOrReplaceTempView('income')
spark.sql('SELECT city, avg(revenue) as avg FROM income GROUP BY city ORDER BY avg DESC LIMIT 5').show()

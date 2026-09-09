---
id: resource-s7-big-data-session-3-course-hbase-pdf-f2aea177
slug: resource-s7-big-data-session-3-course-hbase-pdf-f2aea177
source_key: 'sha256:f2aea177451ac1c2145570ae524e305b40ae0313871d256bafbb6e6393e4abe2'
part_of: resource-s7-big-data-70f04b2b
order: 12
manifest: null
derived_from: 'sha256:f2aea177451ac1c2145570ae524e305b40ae0313871d256bafbb6e6393e4abe2'
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
  - hbase
  - hadoop
  - nosql
  - distributed-database
  - column-store
  - hdfs
  - big-data
domain: Data Engineering
---
# S7 - big data — Session 3 Course  - HBase.pdf

## Summary

Apache HBase is a distributed, non-relational, column-oriented database modeled after Google's Bigtable, running on HDFS. It provides low-latency, strongly consistent random reads/writes at scale — the operational complement to Hadoop's batch stack. Core use cases: user/profile stores, IoT time-series, clickstreams, metrics/counters, ML feature stores.

## Fields/API

**data_model**: **row_key**: Lexicographically sorted; design drives performance. Anti-pattern: monotonic keys cause write hotspots. Best practices: salting/prefixing, reversal, compound keys (high-cardinality first), keep compact.
**column_family**: Declared at table creation; data stored/managed/compacted together. Best practice: 1–2 CFs max — each CF adds I/O overhead on flush/compaction.
**column_qualifier**: Dynamic — added per row on the fly. Not predefined.
**cell**: Uniquely identified by (Row Key, Column Family, Column Qualifier, Timestamp). Supports multiple versioned timestamps per cell.
**architecture_components**: **hbase_master**: Control plane. Assigns/unassigns regions to RegionServers; handles DDL (CREATE, ALTER, DROP); orchestrates splits, merges, compactions. Supports active-standby HA.
**region_server**: Data plane. Hosts regions, serves client read/write. Contains per-region: MemStore (write buffer in RAM), WAL (durability log), StoreFiles/HFiles (immutable HDFS files).
**region**: Horizontal partition — contiguous sorted row-key range. Belongs to one RegionServer at a time. Splits automatically as table grows.
**store**: One per column family inside a region. Hierarchy: Region → Store (per CF) → StoreFiles (HFiles) → Blocks.
**hfile**: Immutable sorted data file on HDFS. Contains multi-level indexes + Bloom filters. MemStore flushes to a new HFile when full; compactions merge HFiles.
**block**: Smallest storage/caching unit inside an HFile (~64 KB). Contains key-value pairs, indexes, Bloom filters. Cached in BlockCache (RAM).
**zookeeper**: Coordination layer. Tracks live RegionServers (ephemeral znodes), manages Master election, stores hbase:meta location. Failure detection via expired ephemeral znodes.
**hbase_meta**: System catalog table mapping row keys to RegionServers. Location stored in ZooKeeper; clients cache it after bootstrap.
**wal**: Per-RegionServer append-only log on HDFS. Every write logged before acknowledgment — crash recovery source.
**memstore**: In-memory write cache; one per CF per region. Sorted lexicographically before flush to HFile.
**block_cache**: RAM cache for frequently read HFile blocks. LRU eviction.
**write_path**: 1. Client queries ZK → gets hbase:meta location. 2. Client scans hbase:meta → finds target RegionServer. 3. Client writes directly to RegionServer. 4. RegionServer appends to WAL. 5. RegionServer inserts into MemStore. 6. MemStore flushes to new HFile when full. 7. Background compactions merge/sort HFiles.
**read_path**: 1. Client resolves RegionServer via ZK → hbase:meta (cached). 2. RegionServer checks MemStore (recent writes). 3. Checks BlockCache (hot data). 4. Falls back to HFiles using Bloom filters + indexes. 5. Strongly consistent because one RegionServer owns the row.
**compaction**: **minor**: Merges a small subset of HFiles into one larger HFile. Runs frequently. Low overhead.
**major**: Merges ALL HFiles of a store into one. Applies tombstones (deletes) and TTL/version retention. Heavy I/O + CPU.
**hbase_vs_rdbms**: **schema**: HBase: sparse, schema-less (only CFs predefined). RDBMS: strict, predefined schema.
**joins**: HBase: none built-in (denormalize or use MapReduce). RDBMS: core optimized feature.
**transactions**: HBase: row-level atomicity only. RDBMS: full ACID across tables.
**indexes**: HBase: row key + Bloom filters. RDBMS: rich secondary indexes.
**use_case**: HBase: write-heavy, read-by-key, massive semi-structured/sparse data. RDBMS: complex queries, joins, strict integrity.
**hbase_vs_hive**: **primary_use**: HBase: low-latency key-value ops. Hive: batch SQL analytics.
**latency**: HBase: milliseconds. Hive: minutes/hours.
**data_model**: HBase: sparse column-oriented dynamic. Hive: schema-on-read over static files.
**consistency**: HBase: strong per-row. Hive: depends on underlying files.
**immutability_model**: HDFS is write-once. HBase simulates mutability by writing new data to WAL + MemStore, flushing to new HFiles, then compacting to retain only latest versions. No in-place edits ever.

## Constraints

- Strong consistency is row-scoped only — no cross-row or cross-table ACID transactions.
- Row key design is the #1 performance lever — monotonic keys cause write hotspots.
- Column families should be kept to 1–2; each CF multiplies flush/compaction I/O overhead.
- HFiles are immutable — deletes are tombstone markers resolved only at major compaction.
- ZooKeeper is a hard dependency for cluster coordination and meta lookup.

## Examples

- Cell address: (user:42, profile:email, 1690000000) → 'alice@example.com'
- Region split: keys A→F (Region 1), G→M (Region 2), N→Z (Region 3).
- Row key anti-pattern: timestamp prefix → all writes hit the last region (hotspot). Fix: reverse the timestamp or salt with a random prefix.
- Two CFs (info, metrics) on one table → every region has two stores, two MemStores, two flush streams.
- Client read flow: ZK → hbase:meta → RegionServer → MemStore/BlockCache/HFile.

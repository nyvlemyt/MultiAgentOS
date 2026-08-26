---
id: resource-s7-big-data-session-2-course-hbase-pdf-97e2282e
slug: resource-s7-big-data-session-2-course-hbase-pdf-97e2282e
source_key: 'sha256:97e2282e5fa7a16a7bde551864e6642c260428cfa51162a5a65b9a39de774b1c'
part_of: S7 - big data
order: 10
manifest: null
derived_from: 'sha256:97e2282e5fa7a16a7bde551864e6642c260428cfa51162a5a65b9a39de774b1c'
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
  - column-oriented
  - big-data
  - hdfs
  - bigtable
  - architecture
domain: big-data
---
# S7 - big data — Session 2 Course  - HBase.pdf

## Summary

Apache HBase is a distributed, non-relational, column-oriented database modeled after Google's Bigtable (2006), running on HDFS. It provides strongly consistent, low-latency random reads/writes over very large tables — filling the gap Hadoop's batch stack cannot: operational, key-based access at scale. Strong consistency is guaranteed by routing all operations for a single row through exactly one RegionServer at a time.

## Fields/API

**core_components**: **HBase Master**: Control plane — assigns/unassigns Regions to RegionServers, handles DDL (CREATE/ALTER/DROP), orchestrates splits, merges, and compactions. Supports active-standby HA.
**RegionServer**: Data plane — hosts Regions, serves client reads and writes. Contains per-Region: MemStore (write buffer), WAL (durability log), and StoreFiles/HFiles (immutable HDFS data files).
**Region**: Horizontal partition of a table by row key — a contiguous, sorted key range. Splits automatically as the table grows. Each Region belongs to exactly one RegionServer at a time.
**Store**: One Store per Column Family per Region. Hierarchy: Region → Store (CF) → StoreFiles (HFiles) → Blocks (64 KB chunks with indexes and Bloom filters).
**ZooKeeper**: Coordination nervous system — tracks live RegionServers via ephemeral znodes (liveness detection on session death), manages Master leader election, stores the location of hbase:meta.
**hbase:meta**: System catalog table mapping row-key ranges to RegionServers. Location stored in ZooKeeper. Clients scan it on bootstrap and cache the result.
**WAL (Write-Ahead Log)**: Append-only per-RegionServer log on HDFS. Every write is persisted here before acknowledgment — the crash-recovery guarantee.
**MemStore**: In-memory write cache (one per Column Family per Region). Data is sorted lexicographically here before being flushed to a new HFile when the size threshold is exceeded.
**BlockCache**: In-memory read cache. Stores frequently accessed 64 KB HFile blocks (LRU eviction). Accelerates repeated reads without disk I/O.
**HFiles (StoreFiles)**: Immutable, sorted data files on HDFS. Contain multi-level indexes and Bloom filters for efficient lookups. Written by MemStore flushes; merged and pruned by compaction.
**data_model**: **Column Family (CF)**: Declared at table creation time. All data in a CF is stored, compacted, and cached together. Best practice: keep to 1–2 CFs per table.
**Column Qualifier**: Dynamic — added per row at write time with no upfront schema declaration.
**Cell**: Uniquely identified by (Row Key, Column Family, Column Qualifier, Timestamp). Multiple timestamped versions per cell are supported.
**Row Key**: Lexicographically sorted bytes. The primary — often only — access path. Row key design is the #1 performance lever; it must match access patterns and avoid write hotspots.
**compaction_types**: **Minor Compaction**: Merges a small subset of HFiles into one larger HFile. Runs frequently; low I/O overhead.
**Major Compaction**: Merges ALL HFiles of a Store into a single HFile. Applies delete tombstones, TTL policies, and max-version pruning. High I/O and CPU cost.
**storage_sequence**: Write → WAL (HDFS, append-only) → MemStore (RAM, sorted) → flush → HFile (HDFS, immutable) → background compaction → fewer/larger HFiles

## Constraints

- No cross-row or cross-table transactions — only row-level atomicity and strong consistency.
- No native joins — requires denormalization, application-level joins, or batch-framework joins (e.g., MapReduce).
- HDFS is write-once; HBase never edits HFiles in-place — apparent mutability is achieved via WAL + MemStore + compaction creating new immutable state.
- Number of Column Families must be minimal (1–2 recommended); each CF multiplies I/O overhead during region flushes and compactions.
- Monotonic row keys (e.g., pure timestamps) cause write hotspots on the last region — use salting, reversal, or compound keys.
- Row keys are stored with every cell — keep them as compact as possible to avoid storage amplification.
- One RegionServer owns a given row at a time — guarantees consistency but means a single hot key cannot be parallelised across servers.

## Examples

**typical_use_cases**: - User/profile stores
- IoT time-series data
- Clickstreams and feeds
- Metrics and counters
- ML feature stores
**row_key_design_patterns**: **Salting**: Prepend a random or hash-derived prefix to distribute writes evenly across regions.
**Reversal**: Reverse a timestamp or domain string (e.g., com.example → elpmaxe.moc) so related keys cluster without monotonic hotspotting.
**Compound key**: Combine multiple attributes; put the highest-cardinality attribute first.
**region_split_example**: Region 1: keys A–F | Region 2: G–M | Region 3: N–Z
**write_path_summary**: Client → ZooKeeper (locate hbase:meta) → hbase:meta (find owning RegionServer) → RegionServer: WAL write → MemStore insert → periodic flush → new HFile → background compaction
**read_path_summary**: Client → ZooKeeper → hbase:meta → RegionServer: MemStore check → BlockCache check → HFiles (Bloom filter + index-guided) → strongly consistent result
**hbase_vs_rdbms**: **prefer_HBase**: Massive scale, sparse/semi-structured data, write-heavy or read-by-key workloads.
**prefer_RDBMS**: Complex queries, joins, strict data integrity, cross-table ACID transactions.
**hbase_vs_hive**: **HBase**: Millisecond latency · key-value ops · strong per-row consistency · dynamic schema
**Hive**: Minute/hour latency · batch SQL analytics · schema-on-read over static files · native SQL joins

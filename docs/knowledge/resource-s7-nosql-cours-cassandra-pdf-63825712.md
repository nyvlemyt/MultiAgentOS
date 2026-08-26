---
id: resource-s7-nosql-cours-cassandra-pdf-63825712
slug: resource-s7-nosql-cours-cassandra-pdf-63825712
source_key: 'sha256:63825712916700f9cc8c201d725606d1ed18f7bf6ae253597b0b3035f7502cf3'
part_of: S7 - nosql
order: 1
manifest: null
derived_from: 'sha256:63825712916700f9cc8c201d725606d1ed18f7bf6ae253597b0b3035f7502cf3'
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
  - cassandra
  - nosql
  - distributed-systems
  - cap-theorem
  - consistency
  - cql
  - replication
domain: database
---
# S7 - nosql — Cours-Cassandra.pdf

## Summary

Apache Cassandra is a distributed, highly scalable NoSQL database (Apache project) built for large volumes of structured data with no single point of failure. It sits at the AP corner of the CAP theorem (Availability + Partition-tolerance), making strong consistency optional and tunable per operation via Consistency Levels (CL). Writes are acknowledged by a configurable number of replicas; the rest sync asynchronously. Data is modelled in Keyspaces and Tables/ColumnFamilies and queried through CQL (Cassandra Query Language) via the cqlsh shell.

## Fields/API

**name**: Architecture
**value**: Read and Write Everywhere — any client can connect to any node in any data center to read or write. No master node; Cassandra is the fastest NoSQL database for write operations.
**name**: CAP position
**value**: AP: Cassandra guarantees Availability and Partition-tolerance. Consistency is sacrificed by default and recovered partially through tunable Consistency Levels.
**name**: CAP theorem
**value**: A distributed system can have at most 2 of: Consistency (all nodes have the same data at the same time), Availability (every request gets a response), Partition-tolerance (system continues despite network splits).
**name**: Replication Factor (RF)
**value**: Number of nodes to which data is physically copied. RF=3 means 3 replicas exist across the cluster.
**name**: Consistency Level — ONE
**value**: A single node must acknowledge the read/write. The other RF-1 nodes receive data asynchronously. Fastest option; weakest consistency guarantee.
**name**: Consistency Level — QUORUM
**value**: A majority of replicas must acknowledge: (RF / 2) + 1 nodes. With RF=3 → 2 nodes must ACK; the third syncs asynchronously. Balanced speed/consistency.
**name**: Consistency Level — ALL
**value**: Every replica must acknowledge. Strongest consistency; effectively disables partition-tolerance and reduces availability. Not recommended for general use.
**name**: CQL (Cassandra Query Language)
**value**: SQL-like language for schema definition, data insertion, and querying. Accessed via the cqlsh interactive shell.
**name**: Keyspace
**value**: Top-level namespace in Cassandra, analogous to a database in RDBMS. Created with CREATE KEYSPACE.
**name**: Table / ColumnFamily
**value**: Data container within a Keyspace. Created with CREATE TABLE or CREATE COLUMNFAMILY, with column definitions and options.

## Constraints

- QUORUM formula: (Replication Factor / 2) + 1 — must be an integer (floor division).
- CL=ALL should only be used when use-case strictly demands it; it removes availability and partition-tolerance.
- Consistency Level is specified per-operation (per INSERT / SELECT), giving the developer full control.
- Cassandra is an AP system by design — achieving C requires sacrificing A or P.

## Examples

- INSERT INTO table (column1, ...) VALUES (value1, ...) USING CONSISTENCY ONE
- INSERT INTO table (column1, ...) VALUES (value1, ...) USING CONSISTENCY QUORUM
- INSERT INTO table (column1, ...) VALUES (value1, ...) USING CONSISTENCY ALL
- CREATE KEYSPACE <identifier> WITH <properties>
- CREATE TABLE <tablename> ('<column-definition>', '<column-definition>') (WITH <option> AND <option>)

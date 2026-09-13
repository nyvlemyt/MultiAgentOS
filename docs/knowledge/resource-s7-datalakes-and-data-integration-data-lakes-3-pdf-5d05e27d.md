---
id: resource-s7-datalakes-and-data-integration-data-lakes-3-pdf-5d05e27d
slug: resource-s7-datalakes-and-data-integration-data-lakes-3-pdf-5d05e27d
source_key: 'sha256:5d05e27dabc7a0117718ff793ff046bc0fe2223ab83acb8b64f3e2eaddfc0c9a'
part_of: resource-s7-datalakes-and-data-integration-013c4eca
order: 4
manifest: null
derived_from: 'sha256:5d05e27dabc7a0117718ff793ff046bc0fe2223ab83acb8b64f3e2eaddfc0c9a'
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
doc_type: explanation
actionability: resource
lane: knowledge
schema_version: '1'
tags:
  - data-lake
  - sql
  - nosql
  - mysql
  - mongodb
  - blob-storage
  - file-storage
  - polyglot-persistence
  - staging
  - curated
  - pipeline
  - data-integration
domain: data-engineering
---
# S7 - Datalakes and Data Integration — Data_Lakes___3.pdf

## Thesis

Integrating SQL databases (Staging zone) and NoSQL document databases (Curated zone) into a Data Lake overcomes the fundamental limits of pure blob/file storage — no schema validation, no efficient querying, no concurrency control — by applying the 'polyglot persistence' principle: each zone uses the storage technology it excels at.

## Context

Data Lakes are structured in three zones — Raw (Bronze), Staging (Silver), Curated (Gold) — traditionally backed by blob storage such as S3. Blob storage stores data as flat key-identified binary objects (no directory hierarchy), scales to petabytes, and is accessed via REST API; it is ideal for raw ingestion at low cost. File storage organises data in hierarchical directories accessed via NFS/SMB, offers natural navigation and concurrent-write locking, but scales less well. At industrial scale, a pipeline relying solely on CSV files in S3 hits practical walls: a 2-million-row file must be fully downloaded and loaded into memory for any query or null-check, two concurrent writers can corrupt the file, and there is no mechanism to reject malformed rows at write time.

## Reasoning

SQL relational databases (MySQL, PostgreSQL) are the natural fit for the Staging zone because that zone's job is precisely what SQL does best: enforcing a declared schema (NOT NULL, UNIQUE, typed columns), validating data with in-database GROUP BY / COUNT queries without loading it into Python memory, ensuring atomic batch inserts via ACID transactions (commit() rolls back on error), and accelerating lookups with indexes. NoSQL document databases (MongoDB) are the natural fit for the Curated zone: enriched records — tokenised text paired with variable metadata (tokenizer name, model version, processing timestamp) — are stored as flexible BSON/JSON documents whose schema can evolve (add a 'tokenizer_version' field tomorrow) without ALTER TABLE migrations; the aggregation pipeline ($group, $expr, nested-field filters) handles analytical queries directly in the database; and horizontal scaling by adding nodes suits the volume growth expected from a curated dataset. The combination — S3 for Raw, MySQL for Staging, MongoDB for Curated — is called polyglot persistence: no single technology is forced to cover all use cases.

## Trade-offs

SQL: rigid schema is a strength for validation but a constraint when upstream data is heterogeneous; scaling is primarily vertical (bigger server); storing nested documents (JSON arrays of tokens + metadata) is unnatural and requires workarounds. NoSQL/MongoDB: no standardised query language across vendors (MongoDB Query Language ≠ CQL ≠ DynamoDB API); multi-document ACID transactions were added recently and carry a performance cost; the absence of an enforced schema shifts governance complexity to the application layer. Pure blob/file storage: operationally simple and cheapest per GB, especially with tiered storage classes (hot / cool / archive); but it is purely write-once append-only, requires full-file downloads for any query, and provides no concurrency protection — acceptable for Raw ingestion, insufficient for Staging validation or Curated enrichment.

## See also

- TP2 pipeline (LocalStack S3, Bronze→Silver→Gold in blob storage)
- TP3 pipeline (HuggingFace datasets → Python cleaner → MySQL Staging → distilbert tokeniser → MongoDB Curated)
- HuggingFace `datasets` library (wikitext-2-raw-v1)
- Annexe A: blob storage internals (hashing, replication, append-only writes)
- Annexe B: file storage internals (NFS/SMB, POSIX ACL, RAID, distributed FS: HDFS, Lustre, GlusterFS)

---
id: resource-s7-nosql-project-nosql-pdf-5a5bc1e9
slug: resource-s7-nosql-project-nosql-pdf-5a5bc1e9
source_key: 'sha256:5a5bc1e974633a60c82d50d765b9d878fe47931d51c15389db3cf4e9dbe17935'
part_of: S7 - nosql
order: 9
manifest: null
derived_from: 'sha256:5a5bc1e974633a60c82d50d765b9d878fe47931d51c15389db3cf4e9dbe17935'
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
doc_type: howto
actionability: area
lane: workflows
schema_version: '1'
tags:
  - nosql
  - database
  - research
  - project
  - technology-evaluation
  - data-analytics
domain: data engineering
---
# S7 - nosql — Project-NoSQL.pdf

## Problem

Discover, install, and evaluate a NoSQL technology not covered in labs (not MongoDB, Cassandra, Neo4j, or Redis), and assess whether a company could adopt it.

## Solution

1. Pick a target technology from candidates such as HBase, Elastic/Kibana, CockroachDB, Kafka, Spark, Couchbase, DynamoDB, CosmosDB, Cloud Spanner, or OpenTSDB (full landscape: mattturck.com/landscape/mad2025.pdf). 2. Install it locally or on a cloud provider. 3. Explore its core features and data model. 4. Design and run a concrete use case (data analytics on a public dataset from Kaggle, MovieLens, or openData; OR a performance/resiliency benchmark — e.g., partition scaling, node failure). 5. Document strengths and weaknesses in a written report. 6. Prepare a live demonstration on your laptop for the defense session.

## Variations

- Performance angle: increase partition count and measure throughput; kill replicated nodes to demonstrate resiliency.
- Analytics angle: load a public dataset and run aggregation/query pipelines to show the technology's query expressiveness.
- Ingestion angle: stream data through the system (relevant for Kafka, Spark) to showcase throughput and fault tolerance.

## Pitfalls

- Choosing a technology too close to the excluded ones (MongoDB-compatible APIs, Redis-backed systems) may not satisfy the 'novel' requirement.
- Skipping a real use case and only documenting installation leaves strengths/weaknesses undemonstrated.
- Cloud-only setups risk demo failure if there is no internet during the defense — prefer a local install or have an offline fallback.
- Report submitted after June 24th, 2026 23h59 is out of deadline.

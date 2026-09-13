---
id: resource-s7-bdd-avancees-cm3-nosql-pdf-93537dce
slug: resource-s7-bdd-avancees-cm3-nosql-pdf-93537dce
source_key: 'sha256:93537dce4b3197c4c46d77303bb18a7715ca509eae2efb05d0d7e309e076418c'
part_of: resource-s7-bdd-avancees-03c845ab
order: 6
manifest: null
derived_from: 'sha256:93537dce4b3197c4c46d77303bb18a7715ca509eae2efb05d0d7e309e076418c'
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
  - nosql
  - databases
  - distributed-systems
  - cap-theorem
  - data-models
  - sharding
  - replication
  - acid-vs-base
domain: data-engineering
---
# S7 - BDD Avancées — CM3-NOSQL.pdf

## Summary

Survey of NoSQL databases: motivations (Big Data, horizontal scaling, impedance mismatch with RDBMS), data distribution strategies (sharding + replication), the four NoSQL data models (key-value, document, column-oriented, graph), the ACID→BASE shift, and the CAP theorem. Includes pros/cons of NoSQL vs RDBMS.

## Fields/API

**why_nosql**: **description**: Relational DBs were not built for distributed applications
**drivers**: - Exponential data growth (×2 every ~2 years)
- Need to distribute computation and data across many servers
- Joins are expensive and RDBMS scale vertically (up), not horizontally (out)
- Impedance mismatch: high hardware/maintenance cost
- Weak performance, availability, and partition tolerance when distributed
**what_is_nosql**: **full_name**: Not Only SQL (more accurate: Non-Relational Databases)
**definition**: Storage/retrieval mechanism with less constrained consistency models than RDBMS; queries go through application API rather than SQL
**data_distribution**: **sharding**: **definition**: Different data on different nodes
**rules**: - Place data close to where it is accessed
- Keep load even across all nodes
- Put together data that may be read in sequence (same aggregate unit → same node)
**pros**: Improves both reads and writes; horizontal scalability
**cons**: More machines → lower individual reliability; resilience decreases
**replication**: **master_worker**: **description**: One authoritative master handles all writes; workers sync and handle reads
**pros**: Scale reads by adding workers; workers serve reads even if master fails
**cons**: Master is a write bottleneck; write unavailability on master failure; slow propagation → inconsistency; bad for write-heavy workloads
**peer_to_peer**: **description**: All nodes equal weight; any node can read and write
**pros**: Survives any single node failure; easy to add nodes for performance
**cons**: Slow change propagation → inconsistency; write-write conflicts when same record updated on different nodes simultaneously
**nosql_vs_rdbms**: **schema**: Schema-less; no NULLs, no forced datatypes, no joins; schema logic moved to application layer
**consistency**: Relaxed ACID → BASE (Basically Available, Soft-State, Eventual Consistency)
**query**: No strong ad-hoc query support; queries via API; intelligence in application
**design_goal**: Speed and growth over guaranteed transactional accuracy
**data_models**: **key_value**: **description**: Distributed hashmap; value is opaque (string, object, blob)
**operations**: PUT / GET / DELETE
**use_case**: Fast access, session management
**examples**: - DynamoDB
- Redis
- Azure Table Storage
- Voldemort (LinkedIn)
- BerkeleyDB
**document_oriented**: **description**: Extends key-value with rich JSON/XML documents; each field has a typed value (string, date, binary, array); hierarchical structure avoids joins
**use_case**: Semi-structured, hierarchically related data
**examples**: - MongoDB
- CouchDB
- RavenDB
**column_oriented**: **description**: Evolution of key-value; rows have dynamic column sets (no NULLs); query key format: key/family:title[/time]; supports versioning via timestamps
**use_case**: Very high performance and scalable analytics
**examples**: - HBase (Hadoop)
- Cassandra (Facebook/Twitter)
- BigTable (Google)
**graph**: **description**: Nodes, relationships, and properties based on graph theory; indeterminate number of relationships between entities
**use_case**: Social networks, highly interconnected data
**examples**: - Neo4j
- InfiniteGraph
- OrientDB
**cap_theorem**: **properties**: **consistency**: All replicas hold the same data version; every client sees the same view regardless of node
**availability**: System remains operational on node failure; all clients can always read and write
**partition_tolerance**: System remains operational despite network splits between nodes
**rule**: A distributed system can guarantee at most 2 of the 3 properties simultaneously
**nuance**: Original Brewer (2001) statement: if faults cannot be bounded and any server can receive requests and you must serve every request, perfect consistency is impossible
**nosql_benefits**: - Elastic scaling: scale out across cheap commodity nodes
- Less DBA overhead: automatic repair, simpler models
- Built for Big Data volumes
- Flexible schema: no costly schema-change management
- Lower cost per GB / transaction vs proprietary RDBMS hardware
**nosql_drawbacks**: - Support: open-source startups, reputation not yet established vs mature RDBMS vendors
- Maturity: still implementing basic feature sets
- Administration: still requires effort despite 'no admin' goal
- Expertise gap: far fewer trained NoSQL developers than RDBMS developers
- Analytics/BI: not designed for ad-hoc queries; tooling still catching up

## Constraints

- BASE (Eventual Consistency) means temporary inconsistencies are possible and expected
- Key-value stores: data is opaque to the DB engine — no querying without the key
- NoSQL transactions must be handled at the application layer, not the DB layer
- CAP theorem forces a design tradeoff: CA, CP, or AP — never all three

## Examples

- Key-value: Dog_12 → 'Name_$#_Stella~~Mood_$#_Happy~~DOB_$#_2007-04-01'
- Document: Dog_12 → JSON with nested bark array containing comments sub-documents
- Column: dog_12 / Dog:Name / t=25 → Stella; dog_12 / Dog:Mood / t=11 → Angry, t=45 → Happy (versioned)
- Graph: Dog_12 node --barks→ Bark_59 node --comment_to→ Comment_83 node

---
id: resource-s6-base-de-donnees-fb2fe2f1
slug: resource-s6-base-de-donnees-fb2fe2f1
source_key: 'sha256:fb2fe2f18e6e95d48d6a724758f07d3dbd8d7a19bb84183a660e8bd4da196838'
part_of: null
order: null
manifest: null
derived_from: 'sha256:fb2fe2f18e6e95d48d6a724758f07d3dbd8d7a19bb84183a660e8bd4da196838'
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
  - database
  - SQL
  - entity-association
  - normalization
  - views
  - 3NF
  - relational-model
domain: Computer Science / Database Engineering
---
# S6 - Base de données

## Summary

Course materials for a university database module (S6 level) covering the full relational database stack: entity-association (EA) modeling, SQL querying, relational views, normalization up to 3NF, and practical lab work.

## Fields/API

**name**: Cours1_intro-EA.pdf
**description**: Introduction to entity-association (EA) modeling — entities, attributes, relationships, cardinalities, conceptual schema design.
**name**: Cours3_Sql.pdf
**description**: SQL fundamentals — DDL (CREATE, ALTER, DROP), DML (SELECT, INSERT, UPDATE, DELETE), joins, aggregations, subqueries.
**name**: Cours4_lesVues.pdf
**description**: Database views — CREATE VIEW syntax, use cases (abstraction, security), updatable vs. read-only views.
**name**: TD2_BDD.pdf
**description**: Practical worksheet on relational database design — schema translation exercises from EA diagrams to relational tables.
**name**: TD2_Exercice3_3FN.docx
**description**: Exercise on Third Normal Form (3NF) — identifying functional dependencies, detecting anomalies, decomposing relations.
**name**: TD2_Exercice3_3FN_FormatRelationnel.docx
**description**: Companion exercise: expressing 3NF decompositions in standard relational notation.
**name**: TutorialFX.pdf
**description**: Tutorial document — likely a guided walkthrough of a database tool or JavaFX-based DB front-end (exact scope inferred from filename).
**name**: tp4 bd.pdf
**description**: Lab session 4 — hands-on SQL or schema practice, building on prior course content.

## Constraints

- Source is a table of contents only — no body text is available; field descriptions are inferred from filenames and standard S6 database curriculum.
- TutorialFX content is ambiguous; could be JavaFX + JDBC integration or a generic DB tutorial.

## Examples

- EA modeling: Entity 'Student' with attribute 'studentId' linked to 'Course' via 'Enrolls' relationship (cardinality N:M).
- 3NF decomposition: relation R(A,B,C) with B→C split into R1(A,B) and R2(B,C) to eliminate transitive dependency.
- SQL view: CREATE VIEW active_students AS SELECT * FROM students WHERE status = 'active';

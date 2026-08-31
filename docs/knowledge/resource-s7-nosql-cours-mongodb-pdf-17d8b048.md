---
id: resource-s7-nosql-cours-mongodb-pdf-17d8b048
slug: resource-s7-nosql-cours-mongodb-pdf-17d8b048
source_key: 'sha256:17d8b048d3cdae238eec724904baf083ad292c3b60eeb16e79e7d9017ac2aa8e'
part_of: resource-s7-nosql-a014403d
order: 2
manifest: null
derived_from: 'sha256:17d8b048d3cdae238eec724904baf083ad292c3b60eeb16e79e7d9017ac2aa8e'
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
  - mongodb
  - nosql
  - document-model
  - bson
  - json
  - database
  - collections
domain: databases
---
# S7 - nosql — Cours-MongoDB.pdf

## Summary

MongoDB is an open-source, schema-less, document-oriented DBMS. Data is stored as BSON (binary JSON) documents grouped into collections, themselves grouped into databases. Documents within the same collection can have different fields. MongoDB supports rich queries over nested structures, indexing, and geo-spatial queries. It sits at the top of NoSQL rankings and has drivers for most languages (C, C++, Python, Java, PHP, etc.).

## Fields/API

**name**: Database
**description**: Top-level container; equivalent to a relational database.
**name**: Collection
**description**: Group of documents; equivalent to a relational table or view. No enforced schema.
**name**: Document
**description**: JSON/BSON record with key-value pairs; equivalent to a relational row. Fields can hold scalars, arrays, or nested sub-documents.
**name**: Field
**description**: Named attribute inside a document; equivalent to a relational column.
**name**: _id
**description**: Mandatory unique identifier automatically added to each document if not supplied.
**name**: Embedded Document
**description**: Nested sub-document used in place of a JOIN to represent related entities inline.
**name**: Shard
**description**: Horizontal partition unit; equivalent to a relational partition.
**name**: Index
**description**: Same concept as in relational DBs; supported on any field including nested ones.

## Constraints

- Documents are stored in BSON (binary JSON); supported types: String, Integer, Double, Date, Byte Array, Boolean, Null, BSON Object, BSON Array.
- No schema enforced: two documents in the same collection can have entirely different keys.
- Joins are replaced by embedded documents; the model is therefore unsuitable for highly interconnected (graph-like) data.
- MapReduce-based queries can be slow compared to relational aggregations.
- Best suited for content management, event management, and e-commerce catalogs with flexible schemas.

## Examples

**label**: Book document with nested authors and publisher
**code**: {
  _id: "123",
  title: "MongoDB: The Definitive Guide",
  authors: [
    { _id: "kchodorow", name: "Kristina Chodorow" },
    { _id: "mdirold",   name: "Mike Dirolf" }
  ],
  published_date: ISODate("2010-09-24"),
  pages: 216,
  language: "English",
  publisher: {
    name: "O'Reilly Media",
    founded: 1980,
    locations: ["CA", "NY"]
  }
}
**label**: User document in a users collection
**code**: {
  "_id": "c9167a15625045fb439c7078",
  "username": "Dupont",
  "firstname": "Jean",
  "lastname": "Dupont"
}
**label**: Heterogeneous documents in the same collection (no schema enforcement)
**code**: { name: 'Jean',    city: 'Paris', hobby: ['Football','Movies'] }
{ name: 'Patrick', city: 'Paris', profession: 'Professor', tel: '0123456789' }
**label**: Relational-to-MongoDB mapping cheat-sheet
**code**: RDBMS Table/View  → MongoDB Collection
RDBMS Row         → MongoDB Document (JSON/BSON)
RDBMS Column      → MongoDB Field
RDBMS Join        → Embedded Document
RDBMS Partition   → Shard

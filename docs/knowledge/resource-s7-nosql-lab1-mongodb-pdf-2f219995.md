---
id: resource-s7-nosql-lab1-mongodb-pdf-2f219995
slug: resource-s7-nosql-lab1-mongodb-pdf-2f219995
source_key: 'sha256:2f219995c8dbfda4e7a271b465459a69eb2f4ea7232823288969c5a8ac3091bb'
part_of: S7 - nosql
order: 5
manifest: null
derived_from: 'sha256:2f219995c8dbfda4e7a271b465459a69eb2f4ea7232823288969c5a8ac3091bb'
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
doc_type: tutorial
actionability: resource
lane: knowledge
schema_version: '1'
tags:
  - mongodb
  - nosql
  - crud
  - aggregation
  - geospatial
  - indexing
  - security
  - administration
  - lab
domain: databases
---
# S7 - nosql — Lab1-MongoDB.pdf

## Goal

Acquire hands-on proficiency with MongoDB: insert documents, query with operators, run aggregation pipelines, build geospatial indexes, and manage users and backups — all against a live `library` and `geodb` database.

## Prerequisites

- MongoDB server running locally (mongod)
- mongo shell accessible on PATH
- Basic JSON and JavaScript syntax
- earthquakes.json dataset available for Part 2

## Steps

**step**: 1
**title**: Insert documents
**detail**: Switch to the `library` db (`use library`). Insert a Book document with an array `Author` field and a CD document with a nested `Tracklist` array using `db.media.insert()`.
**step**: 2
**title**: Basic queries & projections
**detail**: `db.media.find()` returns all docs. Pass a filter `{Artist:'Nirvana'}` to narrow results. Second argument controls projection: `{Title:1}` includes only Title; `{Title:0}` excludes it. Dot-notation queries nested arrays: `{'Tracklist.Title':'In Bloom'}`. Use `.pretty()` for readable output. `findOne()` returns a single document.
**step**: 3
**title**: Cursor modifiers: sort, limit, skip
**detail**: `.sort({Title:1})` ascending, `{Title:-1}` descending. `.limit(10)` caps results. `.skip(20)` offsets. Chain all three: `.sort({Title:-1}).limit(10).skip(20)`.
**step**: 4
**title**: Aggregation helpers: count & distinct
**detail**: `db.media.count()` counts all docs. `find({…}).count()` counts a filtered set; pass `true` to `count()` to respect `.skip()`. `distinct('field')` returns unique values across the collection, including nested paths like `'Tracklist.Title'`.
**step**: 5
**title**: Group aggregation (legacy db.media.group)
**detail**: `db.media.group({key:{Title:true}, initial:{Total:0}, reduce:function(items,prev){prev.Total+=1}})` groups documents by Title and counts occurrences. Parameters: `key` = grouping field, `initial` = accumulator seed, `reduce` = per-document function, `cond` = optional filter.
**step**: 6
**title**: Comparison & logical operators
**detail**: Range queries use `$gt,$lt,$gte,$lte`; inequality `$ne`; set membership `$in,$nin`. Example: `find({Released:{$gte:1990,$lt:2010}})`. Combine with `$or` array: `find({$or:[{Title:'Toy Story 3'},{ISBN:'987-…'}]})`. Mix field filters with `$or` freely.
**step**: 7
**title**: Array projection operators: $slice, $size, $exists
**detail**: `{Cast:{$slice:3}}` returns first 3 cast members; `$slice:-3` returns last 3; `$slice:[20,10]` skips 20 then takes 10. `{$size:2}` matches arrays of exactly 2 elements. `{$exists:true/false}` tests field presence.
**step**: 8
**title**: Index creation
**detail**: `db.media.ensureIndex({Title:1})` creates ascending index; `-1` for descending. Index nested paths: `{'Tracklist.Title':1}`. Force index with `.hint({field:direction})` — the index must exist first or MongoDB returns an error. List all indexes with `db.media.getIndexes()`.
**step**: 9
**title**: Update & delete
**detail**: `update(filter, newDoc, upsert, multi)`: set `upsert=true` to create if absent; `multi=true` to update all matches. Use `$set:{field:val}` to add/change a field without replacing the document; `$unset:{field:1}` to remove it. Delete matching docs with `remove({filter})`; all docs with `remove({})`; drop entire collection with `drop()`.
**step**: 10
**title**: Part 2 — Import & explore geoDB
**detail**: Import earthquakes JSON: `mongoimport --type json -d geodb -c earthquakes --file earthquakes.json`. Practice: count all documents, show first 5, view 6th document, count distinct `status` values.
**step**: 11
**title**: Data cleaning with forEach
**detail**: Add computed fields with `find().forEach(fn)` + `save()`. Example: add `properties.iso_date` by converting `properties.time` (Unix ms) with `new Date(…)`. Split a string field into an array with `str.split(',')`. Remove empty strings from arrays with `$pullAll:{field:['']}` and `{multi:true}`.
**step**: 12
**title**: Geospatial indexing & queries
**detail**: Normalize `geometry.coordinates` to GeoJSON format (remove altitude into a separate `depth` field). Create a `2dsphere` index on the `geometry` attribute. Query with `$geoWithin` and `$center` for a radius search (e.g., earthquakes within 1000 m of a point). Refer to docs.mongodb.org/manual/reference/operator/query-geospatial/ for full operator list.
**step**: 13
**title**: Aggregation pipeline
**detail**: Pipeline syntax: `db.col.aggregate([{$op1:{}},{$op2:{}},...])`. Key operators — `$match` (filter, like WHERE), `$project` (field selection), `$sort`, `$unwind` (explode array → one doc per element), `$group` (group by `_id` + accumulators `$sum,$avg`), `$lookup` (left join, v3.2+), `$out` (write result to collection). Chain stages: output of each stage feeds the next. `_id:null` in `$group` aggregates over the whole collection.
**step**: 14
**title**: Backup & restore
**detail**: `mongodump` creates BSON snapshots under `./dump/<db>/<collection>.bson`. Scope with `--db` and `--collection` flags. `mongorestore` reloads them; use `--drop` to clear existing data first. Restore a single collection: `mongorestore -d library -c media --drop`.
**step**: 15
**title**: Security: authentication & RBAC
**detail**: Create admin user with `db.addUser()` (legacy) or `db.createUser({user,pwd,roles:[…]})`. Restart mongod to enforce auth. Authenticate per session: `db.auth('user','pwd')`. Roles are scoped per database (`read`, `readWrite`). Create custom roles with `db.createRole({role,privileges,roles})`, grant/revoke with `grantPrivilegesToRole` / `grantRolesToRole`. Remove users with `db.dropUser()` or `db.dropAllUsers()`.

## Result

A functional MongoDB workflow covering the full lifecycle: schema-free document insertion, rich query operators, aggregation pipelines, geospatial indexing, iterative data cleaning, backup/restore, and role-based access control — validated against both a media library and a real earthquake dataset.

## Next

- Explore replica sets and write-concern levels for high availability
- Study sharding strategies for horizontal scaling
- Migrate legacy `db.group()` calls to the modern `$group` aggregation pipeline
- Apply `$lookup` to join the earthquake collection with a regions collection

---
id: resource-s7-bdd-avancees-tutorial-neo4j-pdf-cdb85d72
slug: resource-s7-bdd-avancees-tutorial-neo4j-pdf-cdb85d72
source_key: 'sha256:cdb85d727cf6147cd84747322f8a8288ac58446c41ddc9ef14c255db9fbe3afd'
part_of: resource-s7-bdd-avancees-03c845ab
order: 9
manifest: null
derived_from: 'sha256:cdb85d727cf6147cd84747322f8a8288ac58446c41ddc9ef14c255db9fbe3afd'
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
lane: resources
schema_version: '1'
tags:
  - neo4j
  - nosql
  - graph-database
  - installation
  - setup
domain: databases
---
# S7 - BDD Avancées — Tutorial Neo4j.pdf

## Problem

Install and start a Neo4j Community Server locally on Linux, Mac, or Windows.

## Solution

1. Download Neo4j Community Edition 4.4.5 from the official download center (tar for Linux/Mac, zip for Windows).
2. Extract the archive.
3. Start the server: on Linux/Mac run `./neo4j console`; on Windows run `neo4j.bat console` (or `neo4j console` if the .bat form errors).
4. Open the browser UI at http://localhost:7474/browser/.
5. Log in with default credentials — username: `neo4j`, password: `neo4j`.

## Variations

None documented in this source.

## Pitfalls

Windows only — Java not found at the expected path (`C:\Program Files (x86)\Java\jdk1.8.0_181\bin\java.exe`). Fix: open `NEO4J_HOME\bin\Neo4j-Management\Get-Java.ps1` and set the `$javaPath` variable to the actual JDK location, e.g. `$javaPath = 'C:\Program Files\Java\jdk1.8.0_181'`. Reference issue: https://github.com/neo4j/neo4j/issues/12057.

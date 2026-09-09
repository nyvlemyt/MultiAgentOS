---
id: resource-introduction-6ad18555
slug: resource-introduction-6ad18555
source_key: 'sha256:6ad1855568c6e771d138e59075a590a8b24b7cb671c04069f7f9c53bdd53dd73'
part_of: null
order: null
manifest: null
derived_from: 'sha256:6ad1855568c6e771d138e59075a590a8b24b7cb671c04069f7f9c53bdd53dd73'
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
  - java
  - sqlite
  - mvc
  - jdbc
  - architecture
  - academic-project
  - database
domain: software-engineering
---
# Introduction

## Thesis

A Java + SQLite application for managing a programmer database, structured with MVC architecture, built as a final academic project.

## Context

L3 academic project (Java introduction course, January 2025) by Simon Girard, Melvyn Pommier, and Vincent Pierro. The application provides a menu-driven interface backed by SQL queries against a local SQLite database.

## Reasoning

MVC was chosen to separate concerns (Model = data/business rules, View = UI, Controller = coordination), making each layer independently modifiable. SQLite was preferred over MySQL, PostgreSQL, and MongoDB because it requires no server installation, no network configuration, integrates trivially via JDBC, and performs well at the small scale of an academic dataset.

## Trade-offs

SQLite is ideal for local, small-scale data but would not scale to multi-user or networked production use. MySQL/PostgreSQL would be necessary for enterprise scale; MongoDB would suit unstructured data. The current UI is command-line only — a GUI, advanced menu filters, and statistical visualizations were identified as future improvements but cut due to time constraints.

## See also

- mvc-pattern
- jdbc-sqlite-integration
- java-intro-course

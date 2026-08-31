---
id: resource-s7-bdd-avancees-cm1-ord-pdf-da4470a6
slug: resource-s7-bdd-avancees-cm1-ord-pdf-da4470a6
source_key: 'sha256:da4470a69b7c22ba621da09feb243899027427b33791ca3b6a4ace9cc36ef705'
part_of: resource-s7-bdd-avancees-03c845ab
order: 4
manifest: null
derived_from: 'sha256:da4470a69b7c22ba621da09feb243899027427b33791ca3b6a4ace9cc36ef705'
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
  - ER diagram
  - relational model
  - SQL
  - object-relational
  - inheritance
  - inclusion constraint
  - cardinality
  - weak entity
  - SQL3
  - Oracle
domain: Advanced Databases
---
# S7 - BDD Avancées — CM1-ORD.pdf

## Summary

Catalog of rules for converting Entity-Relationship (ER) conceptual models to relational database schemas. Covers all cardinality cases (1:1, 1:N, N:M) for binary, unary, and ternary relationships; weak entities; inclusion constraints enforced via triggers; and inheritance mapping strategies (vertical vs. horizontal). Includes SQL3 / Oracle object-type syntax for native inheritance.

## Fields/API

**Simple entity**: Becomes one table; underlined ER attribute → primary key.
**1:1 binary relationship**: Three design options: (1) merge both entities into one table; (2) FK of entity B added to entity A's table; (3) FK of entity A added to entity B's table.
**1:N binary relationship**: FK of the one-side entity is placed in the many-side table.
**N:M binary relationship**: Three tables: one per entity (no FK for this relationship) + one junction table whose PK = concatenation of both entity PKs; intersection attributes go in the junction table.
**Unary 1:1 / 1:N relationship**: One table; self-referencing FK column added (e.g., Backup Number, Manager).
**Unary N:M relationship**: Two tables: entity table + junction table (same rule as binary N:M). General rule: #tables = #entity types + 1.
**Ternary relationship**: Four tables: one per entity + one junction table whose PK = concatenation of all three entity PKs (optional date attribute may be added).
**Weak entity**: Cannot be identified independently; its PK = (owner-entity PK, local id). Must always be associated with exactly one owner entity.
**Inclusion constraint**: Business rule requiring that a tuple in table A must have a matching tuple in a related table B. Implemented with FK + ALTER TABLE + BEFORE INSERT trigger; the trigger selects the required combination and raises raise_application_error when NO_DATA_FOUND.
**Inheritance — vertical mapping (separate tables)**: Superclass → one table with its own attributes; each subclass → one table with subclass-only attributes and a FK to the superclass PK. Easy to extend the superclass; requires joins to reconstruct full objects.
**Inheritance — horizontal mapping (duplicated columns)**: No superclass table; each subclass table contains its own attributes plus all superclass attributes duplicated. Fast single-table queries; schema changes must be replicated across all subclass tables.
**SQL3 object types (Oracle CREATE TYPE)**: CREATE TYPE … AS OBJECT defines a supertype; subtypes use UNDER keyword. NOT FINAL allows further subclassing; FINAL prevents it. Object tables: CREATE TABLE … OF <TYPE>. PK/UNIQUE constraints are defined only on the supertype table — they are not automatically enforced on subtype tables.

## Constraints

- Standard relational DBMS do not natively support inheritance; a vertical or horizontal mapping strategy must be chosen explicitly at design time.
- In SQL3/Oracle vertical mapping, PKconstraints are declared only on the supertype table (STAFF), not on subtype tables (TEACHER), so duplicate rows can be inserted into subtype tables as shown in the lecture example.
- Inclusion constraints spanning three or more tables cannot be expressed with FK alone; a BEFORE INSERT trigger on the junction table is required.
- For any N:M relationship regardless of degree (unary, binary, ternary), number of tables = number of distinct entity types + 1.
- Adding a date attribute to a ternary junction table PK is optional; include it when the same combination of three entities must be recordable more than once.
- A weak entity forces a composite PK and prohibits existence without its owner, which may complicate bulk inserts and deletes.

## Examples

- SALESPERSON / OFFICE (1:1): three full-column-list design options illustrated.
- SALESPERSON → CUSTOMER (1:N): SalespersonNumber placed as FK in CUSTOMER table.
- SALESPERSON / PRODUCT / SALE (binary N:M): SALE PK = (SalespersonNumber, ProductNumber); Quantity is intersection data.
- PRODUCT / COMPONENT (unary N:M): COMPONENT junction table PK = (ProductNumber, SubAssemblyNumber) + Quantity.
- SALESPERSON / CUSTOMER / PRODUCT / SALE (ternary): SALE PK = (SalespersonNumber, CustomerNumber, ProductNumber [, Date]).
- CINEMA / ROOM (weak entity): Room PK = (CinemaId, RoomId); Room cannot exist without Cinema.
- Inclusion constraint — internship wishlist: ALTER TABLE Student adds a composite FK (number, numInt) referencing Wishlist(numberStu, numberInt) to ensure a student's assigned internship exists in their wishlist.
- Inclusion constraint — software install: BEFORE INSERT trigger on INSTALL joins BUY and USE to verify the software and server share a common purchasing department; raises error -20100 otherwise.
- SQL3 inheritance — university staff: STAFF_TYPE (NOT FINAL) → TEACHER_TYPE UNDER STAFF_TYPE (FINAL); PK constraint on STAFF table only; duplicate TEACHER rows insertable because subtype table lacks its own uniqueness constraint.

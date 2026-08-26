---
id: resource-s6-base-de-donnees-tp4-bd-pdf-21367d9c
slug: resource-s6-base-de-donnees-tp4-bd-pdf-21367d9c
source_key: 'sha256:21367d9c20427f7b4ecec2b01cd16d5aa278a07b7c66f66b986e9a278424fdfb'
part_of: S6 - Base de données
order: 8
manifest: null
derived_from: 'sha256:21367d9c20427f7b4ecec2b01cd16d5aa278a07b7c66f66b986e9a278424fdfb'
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
  - sql
  - views
  - mysql
  - database
  - aggregation
  - with-check-option
domain: databases
---
# S6 - Base de données — tp4 bd.pdf

## Summary

Three SQL views from a car-rental schema: TotalKm (aggregate km per client), Achat10 (cars purchased in 2010), and Loc15 (rentals from 2015). Covers view creation, updatability rules, and WITH CHECK OPTION to enforce view-filter consistency on writes.

## Fields/API

**name**: TotalKm
**definition**: SELECT codeC, SUM(km) AS total_km FROM Location GROUP BY codeC
**type**: aggregate view
**updatable**: false
**note**: Contains a computed column (SUM), so MySQL does not allow DML through this view.
**name**: Achat10
**definition**: SELECT immat, marque, modele FROM Voiture WHERE achatA = '2010'
**type**: simple filter view
**updatable**: true
**note**: Single table, no computed columns — technically updatable in MySQL absent other constraints.
**name**: Loc15
**definition**: SELECT immat, codeC, annee, mois, numLoc, km FROM Location WHERE annee = '2015'
**type**: simple filter view
**updatable**: true
**note**: Without WITH CHECK OPTION, an UPDATE can silently move rows out of the view's scope (annee ≠ 2015). Adding WITH CHECK OPTION blocks any write that would violate annee = '2015'.

## Constraints

- A view is updatable in MySQL only when: (1) all projected columns come from a single base table and (2) none are computed/aggregated.
- WITH CHECK OPTION rejects any INSERT or UPDATE through the view whose resulting row would no longer satisfy the view's WHERE predicate.
- Dropping and recreating the view is required to add WITH CHECK OPTION retroactively (no ALTER VIEW … ADD CHECK OPTION syntax in standard MySQL).

## Examples

- SELECT * FROM TotalKm;  -- lists codeC + total km per client
- SELECT * FROM Achat10;  -- lists immat/marque/modele for year-2010 cars
- SELECT * FROM Loc15;    -- 90 rows initially
- UPDATE Loc15 SET annee = '2017' WHERE numLoc = 'A-133';  -- succeeds without CHECK OPTION, reduces view to 89 rows
- -- After recreating Loc15 WITH CHECK OPTION, the same UPDATE is rejected

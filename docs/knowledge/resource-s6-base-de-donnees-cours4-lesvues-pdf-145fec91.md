---
id: resource-s6-base-de-donnees-cours4-lesvues-pdf-145fec91
slug: resource-s6-base-de-donnees-cours4-lesvues-pdf-145fec91
source_key: 'sha256:145fec9106ac675f36064a1f2f95fff415e91362e1b5cfa6534453d9b4c70fe0'
part_of: S6 - Base de données
order: 3
manifest: null
derived_from: 'sha256:145fec9106ac675f36064a1f2f95fff415e91362e1b5cfa6534453d9b4c70fe0'
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
  - virtual-table
  - ddl
  - create-view
  - database
  - confidentiality
  - updatability
domain: Bases de données relationnelles
---
# S6 - Base de données — Cours4_lesVues.pdf

## Summary

Une vue SQL est une table virtuelle nommée définie par une requête SELECT. Elle peut être utilisée partout où une table réelle est acceptée (SELECT, INSERT, UPDATE, DELETE, GRANT). La suppression d'une vue ne supprime pas les données sous-jacentes.

## Fields/API

**création**: CREATE [OR REPLACE] VIEW nom-vue [(attr1, …, attrn)] AS <requête>
**utilisation**: SELECT … FROM nom-vue WHERE … — identique à une table réelle
**renommage**: RENAME TABLE ancien-nom TO nouveau-nom
**suppression**: DROP VIEW nom-vue  (données intactes)
**cas_usage**: - Effet macro : simplifier des requêtes complexes en les nommant
- Confidentialité : masquer des colonnes ou lignes sensibles
- Optimisation : éviter la duplication de logique
- Abstraction : stabiliser l'interface même si les tables physiques changent
- Performance : vues matérialisées / indexées (variante avancée)

## Constraints

**mise_à_jour_impossible_si_la_vue_contient**: - Un opérateur ensembliste (UNION, MINUS, INTERSECT)
- DISTINCT
- Une fonction d'agrégation comme attribut
- Une clause GROUP BY
- Une jointure (la vue doit reposer sur une seule table pour être modifiable)

## Examples

**create_view_exemplairePlus**: CREATE OR REPLACE VIEW exemplairePlus (num, vo, titre, real, support) AS SELECT numExemplaire, vo, titre, nomIndividu, codesupport FROM Exemplaire E, Film F, Individu WHERE E.numFilm = F.numFilm AND realisateur = numIndividu AND probleme IS NULL;

---
id: resource-s6-base-de-donnees-td2-exercice3-3fn-docx-7cdd725e
slug: resource-s6-base-de-donnees-td2-exercice3-3fn-docx-7cdd725e
source_key: 'sha256:7cdd725e8ad9931cf09668395ad1d63bf14c2dcbfcf6525716244e1dc325e636'
part_of: S6 - Base de données
order: 5
manifest: null
derived_from: 'sha256:7cdd725e8ad9931cf09668395ad1d63bf14c2dcbfcf6525716244e1dc325e636'
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
  - normalisation
  - 3FN
  - dépendances fonctionnelles
  - schéma relationnel
  - bases de données
  - décomposition
  - clé primaire composite
domain: bases de données relationnelles
---
# S6 - Base de données — TD2_Exercice3_3FN.docx

## Thesis

Une relation plate à clé composite doit être décomposée en 3FN en isolant chaque dépendance fonctionnelle partielle ou transitive dans sa propre table, ce qui élimine la redondance et garantit l'intégrité référentielle.

## Context

La relation initiale Projection(NumFilm, TitreFilm, DuréeFilm, NumSalle, NomSalle, CapacitéSalle, TypePlace, PrixPlace, DateProjection, HeureDeb) modélise la projection d'un film en salle avec plusieurs types de places (et prix). Sa clé primaire minimale est (NumFilm, NumSalle, DateProjection, HeureDeb, TypePlace), nécessaire pour distinguer chaque combinaison projection × type de place.

## Reasoning

Trois dépendances fonctionnelles partielles ou transitives violent la 3FN dans la relation initiale : (1) NumFilm → TitreFilm, DuréeFilm : les attributs du film ne dépendent que d'une partie de la clé → table Film. (2) NumSalle → NomSalle, CapacitéSalle : les attributs de la salle ne dépendent que d'une partie de la clé → table Salle. (3) TypePlace → PrixPlace : le prix dépend d'un attribut non-clé → table TypePlace. Ce qui reste de la projection pure (NumFilm, NumSalle, DateProjection, HeureDeb) forme la table Projection, et la table de jonction PlaceProjection(NumFilm, NumSalle, DateProjection, HeureDeb, TypePlace) encode les types de places proposés par séance.

## Trade-offs

La décomposition en 5 tables élimine toute redondance (titre du film, nom de la salle, prix d'un type de place ne sont stockés qu'une fois) mais requiert des jointures pour reconstituer l'information complète d'une séance. Les contraintes de clé étrangère garantissent l'intégrité : PlaceProjection référence Projection, Film, Salle et TypePlace. L'extensibilité est accrue : modifier le prix d'un type de place ou la capacité d'une salle ne touche qu'une seule ligne dans une seule table.

## See also

- 1FN — atomicité des valeurs
- 2FN — élimination des dépendances partielles
- BCNF — forme de Boyce-Codd, plus stricte que la 3FN
- modèle entité-association

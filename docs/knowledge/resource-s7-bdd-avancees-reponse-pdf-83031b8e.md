---
id: resource-s7-bdd-avancees-reponse-pdf-83031b8e
slug: resource-s7-bdd-avancees-reponse-pdf-83031b8e
source_key: 'sha256:83031b8ec4aa24c7741b84867c6d50fa5570f73bdf080025cb700f9b9b105eb7'
part_of: resource-s7-bdd-avancees-03c845ab
order: 10
manifest: null
derived_from: 'sha256:83031b8ec4aa24c7741b84867c6d50fa5570f73bdf080025cb700f9b9b105eb7'
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
  - SQL
  - normalisation
  - 3FN
  - dépendances fonctionnelles
  - modélisation relationnelle
  - base de données
domain: Base de données
---
# S7 - BDD Avancées — reponse.pdf

## Goal

Décomposer une relation non normalisée (Projection) en 3e Forme Normale (3FN) en identifiant les dépendances fonctionnelles et en créant les tables SQL correspondantes.

## Prerequisites

- Connaître les notions de clé primaire et clé étrangère
- Comprendre les dépendances fonctionnelles (DF)
- Savoir ce qu'est la 1FN et la 2FN
- Notions de base SQL (CREATE TABLE)

## Steps

**step**: 1
**title**: Identifier la clé primaire de la relation initiale
**detail**: La relation Projection(NumFilm, TitreFilm, DuréeFilm, NumSalle, NomSalle, CapacitéSalle, TypePlace, PrixPlace, DateProjection, HeureDeb) a pour clé primaire minimale : (NumFilm, NumSalle, DateProjection, HeureDeb, TypePlace). Cette clé est nécessaire car une même projection peut proposer plusieurs types de places.
**step**: 2
**title**: Lister toutes les dépendances fonctionnelles
**detail**: - NumFilm → TitreFilm, DuréeFilm (un film est identifié par son numéro)
- NumSalle → NomSalle, CapacitéSalle (une salle est identifiée par son numéro)
- TypePlace → PrixPlace (le prix dépend uniquement du type de place)
- (NumFilm, NumSalle, DateProjection, HeureDeb) → Projection (une projection est définie par cette combinaison)
**step**: 3
**title**: Détecter les violations de la 3FN
**detail**: Chaque attribut non-clé doit dépendre de la totalité de la clé primaire et de rien d'autre (pas de dépendance transitive). Ici, TitreFilm dépend uniquement de NumFilm (pas de la clé entière), NomSalle de NumSalle, PrixPlace de TypePlace → violations à corriger.
**step**: 4
**title**: Décomposer en tables normalisées
**detail**: Créer une table par groupe de dépendances :
- Film(NumFilm PK, TitreFilm, DuréeFilm)
- Salle(NumSalle PK, NomSalle, CapacitéSalle)
- TypePlace(TypePlace PK, PrixPlace)
- Projection(NumFilm, NumSalle, DateProjection, HeureDeb — PK composite, FK vers Film et Salle)
- PlaceProjection(NumFilm, NumSalle, DateProjection, HeureDeb, TypePlace — PK composite, FK vers Projection et TypePlace)
**step**: 5
**title**: Écrire les CREATE TABLE avec contraintes d'intégrité
**detail**: Déclarer explicitement les PRIMARY KEY et FOREIGN KEY pour chaque table. La table PlaceProjection porte une FK composite vers Projection et une FK simple vers TypePlace.

## Result

5 tables en 3FN : Film, Salle, TypePlace, Projection, PlaceProjection. Chaque table respecte les dépendances fonctionnelles sans redondance. Les contraintes référentielles sont explicites et robustes. La structure est normalisée et extensible.

## Next

- Vérifier la conformité en BCNF (Boyce-Codd Normal Form) si des dépendances entre attributs non-clés subsistent
- Rédiger les requêtes JOIN pour reconstruire la vue initiale à partir des 5 tables
- Étudier la normalisation en 4FN pour traiter les dépendances multivaluées

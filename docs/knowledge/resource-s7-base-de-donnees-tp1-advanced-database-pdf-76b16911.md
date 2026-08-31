---
id: resource-s7-base-de-donnees-tp1-advanced-database-pdf-76b16911
slug: resource-s7-base-de-donnees-tp1-advanced-database-pdf-76b16911
source_key: 'sha256:76b169119e48f8de7fc55c743255b6b491681fecc7e58872e2fca2a39a4209f1'
part_of: resource-s7-base-de-donnees-d1856687
order: 6
manifest: null
derived_from: 'sha256:76b169119e48f8de7fc55c743255b6b491681fecc7e58872e2fca2a39a4209f1'
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
  - E/R model
  - relational model
  - schema design
  - foreign keys
  - many-to-many
  - TP
domain: databases
---
# S7 - base de données — tp1-advanced database.pdf

## Summary

Compte-rendu de TP (S7) sur le passage modèle conceptuel E/R → modèle logique relationnel, illustré sur deux cas : boutique web (Customer/Item/Cart/Review) et base TV series (Series/Episode/Actor/Director/Transmission), avec 6 requêtes SQL annotées.

## Fields/API

**Web Store — tables principales**: **Customer**: informations client
**Item**: produits (CD/DVD)
**ShoppingCart**: panier d'achat
**ShoppingCartItem**: articles dans un panier (ligne de commande)
**Review**: avis laissés par les clients
**Type**: type de produit
**Category**: catégorie de produit
**TV Series — schéma complet**: **Series**: (series_id PK, title, genre, start_year, end_year)
**Episode**: (episode_id PK, episode_number, title, duration, Series_series_id FK, Director_director_id FK)
**Actor**: (actor_id PK, first_name, last_name, birth_date)
**Actor_Series**: (Actor_actor_id FK, Series_series_id FK) — table d'association M:N
**Director**: (director_id PK, first_name, last_name, hire_date)
**Transmission**: (transmission_id PK, Episode_episode_id FK, transmission_date, transmission_time)

## Constraints

- Toutes les relations inter-tables sont matérialisées par des clés étrangères (FK)
- Actor_Series implémente la cardinalité M:N acteurs ↔ séries sans attribut propre
- Episode est doublement référencée : par Series (appartenance) et Director (réalisation)
- Transmission dépend d'Episode ; une diffusion = un épisode + date + heure

## Examples

- Acteurs d'une série : SELECT a.* FROM Actor a JOIN Actor_Series acs ON a.actor_id=acs.Actor_actor_id JOIN Series s ON acs.Series_series_id=s.series_id WHERE s.title='Big Sister'
- Séries d'un acteur nommé : même triple JOIN, filtre sur Actor.first_name+last_name
- Acteurs multi-séries : GROUP BY actor_id HAVING COUNT(Series_series_id) > 1
- Nombre de diffusions du 1er épisode : JOIN Transmission→Episode→Series + filtre episode_number=1, GROUP BY date+heure
- Réalisateur le plus prolifique : COUNT(episode_id) GROUP BY director_id ORDER BY DESC FETCH FIRST 1 ROW ONLY

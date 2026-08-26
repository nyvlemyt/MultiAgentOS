---
id: resource-s7-bdd-avancees-advanced-db-project-pdf-844a45d6
slug: resource-s7-bdd-avancees-advanced-db-project-pdf-844a45d6
source_key: 'sha256:844a45d66e9242382ffc286a9ce04295526252cfef134b472b05aeba3425dd28'
part_of: S7 - BDD Avancées
order: 3
manifest: null
derived_from: 'sha256:844a45d66e9242382ffc286a9ce04295526252cfef134b472b05aeba3425dd28'
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
  - oracle
  - plsql
  - mongodb
  - nosql
  - sql
  - objet-relationnel
  - normalisation
  - triggers
  - immobilier
  - base-de-donnees
domain: database
---
# S7 - BDD Avancées — ADVANCED-DB-PROJECT.pdf

## Summary

Projet académique (Melvyn Pommier & N'Diaye Ball) implémentant une architecture de données hybride pour une agence immobilière. Repose sur Oracle (relationnel + PL/SQL + objet-relationnel) et MongoDB (NoSQL). 7 phases : modélisation, SQL, PL/SQL avancé, ORD, normalisation, MongoDB, requêtes avancées.

## Fields/API

**name**: Base relationnelle Oracle
**description**: 11 tables : STATUT, TYPE_BIEN, CLIENT, AGENT, ADRESSE, BIEN, MANDAT, VISITE, TRANSACTION, COMMISSION, PAIEMENT. Clés primaires/étrangères + contraintes CHECK (taux commission, surfaces, montants positifs, cohérence dates).
**name**: Triggers PL/SQL
**description**: 5 triggers métier : TRG_CALC_COMMISSION (calcul auto commission), TRG_CHECK_VISITE_DATE (visite ≥ début mandat), TRG_UPDATE_BIEN_STATUT (statut après transaction), TRG_NO_DELETE_CLIENT (intégrité référentielle), TRG_CHECK_PAIEMENT (cohérence paiements).
**name**: Package PKG_STATS
**description**: Centralise les indicateurs analytiques : chiffre d'affaires, nombre de transactions, total des commissions.
**name**: Objet-Relationnel (ORD)
**description**: Hiérarchie de types Oracle : BIEN_OBJ (racine) → APPARTEMENT_OBJ, MAISON_OBJ. Supporte polymorphisme (IS OF), accès typé (TREAT, VALUE).
**name**: Normalisation
**description**: Schéma en 1NF / 2NF / 3NF-BCNF. Formes supérieures volontairement exclues pour lisibilité et performance.
**name**: MongoDB
**description**: 3 collections : clients (préférences + historique visites imbriqués), biens, transactions (paiements intégrés). Évite les jointures coûteuses, schéma flexible.
**name**: Script d'exécution
**description**: 99_run_all.sql exécute l'intégralité du projet dans le bon ordre, sans intervention manuelle.

## Constraints

- Clés artificielles obligatoires pour la stabilité du modèle.
- Logique métier côté base (triggers) indépendante de l'application cliente.
- Montants strictement positifs, dates cohérentes, taux de commission valides (CHECK).
- Formes normales ≥ 4NF non appliquées (choix délibéré).
- MongoDB réservé aux données semi-structurées et orientées lecture.

## Examples

- TRG_CALC_COMMISSION se déclenche à l'INSERT sur TRANSACTION et calcule la commission selon le taux du mandat.
- IS OF (APPARTEMENT_OBJ) dans une requête ORD filtre uniquement les appartements depuis la table objet BIEN_OBJ.
- Collection MongoDB 'clients' embarque le tableau des visites directement dans le document, supprimant la jointure CLIENT ↔ VISITE.

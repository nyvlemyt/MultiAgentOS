---
id: resource-s7-bdd-avancees-advanced-db-project-3-pdf-3a3402fd
slug: resource-s7-bdd-avancees-advanced-db-project-3-pdf-3a3402fd
source_key: 'sha256:3a3402fdd768a83542893a6fdab7bc35eae003229493886b669f59bfbe4c46c3'
part_of: resource-s7-bdd-avancees-03c845ab
order: 2
manifest: null
derived_from: 'sha256:3a3402fdd768a83542893a6fdab7bc35eae003229493886b669f59bfbe4c46c3'
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
  - object-relational
  - normalisation
  - triggers
  - immobilier
  - architecture-hybride
domain: bases de données avancées
---
# S7 - BDD Avancées — ADVANCED-DB-PROJECT-3.pdf

## Summary

Projet académique (Melvyn POMMIER & N'Diaye BALL) modélisant une agence immobilière avec une architecture hybride : Oracle SQL/PL/SQL/objet-relationnel + MongoDB. 11 tables relationnelles, 5 triggers métier, 1 package statistiques, hiérarchie de types ORD, schéma normalisé 3NF/BCNF, et collections MongoDB pour les données semi-structurées.

## Fields/API

**environnement**: - Oracle Database (relationnel, PL/SQL, objet-relationnel)
- MongoDB (NoSQL)
**organisation_scripts**: **répertoire**: scripts/ structuré par phase fonctionnelle
**point_entrée**: 99_run_all.sql — exécute l'intégralité dans l'ordre correct
**modèle_relationnel**: **tables_count**: 11
**catégories**: **référence**: - STATUT
- TYPE_BIEN
**acteurs**: - CLIENT
- AGENT
**localisation**: - ADRESSE
**métier**: - BIEN
- MANDAT
- VISITE
- TRANSACTION
- COMMISSION
- PAIEMENT
**contraintes**: - clés primaires/étrangères
- CHECK taux de commission
- CHECK surfaces
- CHECK montants > 0
- cohérence temporelle des dates
**triggers_plsql**: **nom**: TRG_CALC_COMMISSION
**rôle**: Calcul automatique de la commission lors d'une transaction
**nom**: TRG_CHECK_VISITE_DATE
**rôle**: Interdit une visite avant le début du mandat
**nom**: TRG_UPDATE_BIEN_STATUT
**rôle**: Mise à jour automatique du statut du bien après transaction
**nom**: TRG_NO_DELETE_CLIENT
**rôle**: Empêche la suppression d'un client référencé
**nom**: TRG_CHECK_PAIEMENT
**rôle**: Vérification de la cohérence des paiements
**package_stats**: **nom**: PKG_STATS
**indicateurs**: - chiffre d'affaires
- nombre total de transactions
- montant total des commissions
**objet_relationnel**: **hiérarchie**: - BIEN_OBJ (racine)
- APPARTEMENT_OBJ
- MAISON_OBJ
**fonctionnalités**: - polymorphisme via IS OF
- accès typé via TREAT et VALUE
**normalisation**: **formes_appliquées**: - 1NF
- 2NF
- 3NF
- BCNF
**formes_exclues**: - 4NF à 6NF — complexité non justifiée dans ce contexte
**mongodb_collections**: **nom**: clients
**contenu**: préférences + historique des visites imbriqués
**nom**: biens
**contenu**: données de biens immobiliers
**nom**: transactions
**contenu**: paiements intégrés au document

## Constraints

- Le modèle relationnel reste la référence pour les données transactionnelles critiques ; MongoDB est complémentaire
- L'ORD est volontairement limité aux cas apportant une valeur conceptuelle réelle
- Les formes normales supérieures (4NF–6NF) sont explicitement écartées pour raisons de lisibilité et performance
- La logique métier est encapsulée côté base (triggers/packages) pour résister aux accès directs

## Examples

- Requête SQL pour calculer le CA global via PKG_STATS
- Requête MongoDB sur clients avec préférences imbriquées, évitant les jointures
- Utilisation de IS OF / TREAT pour requêter polymorphiquement APPARTEMENT_OBJ vs MAISON_OBJ
- Exécution complète du projet via 99_run_all.sql sans intervention manuelle

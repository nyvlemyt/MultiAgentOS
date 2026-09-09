---
id: resource-s7-bdd-avancees-advanced-db-project-2-pdf-d7e874dd
slug: resource-s7-bdd-avancees-advanced-db-project-2-pdf-d7e874dd
source_key: 'sha256:d7e874ddc2720700b0ca5e116b7bd359378a48cee2cefe3bcdae8809a3bba225'
part_of: resource-s7-bdd-avancees-03c845ab
order: 1
manifest: null
derived_from: 'sha256:d7e874ddc2720700b0ca5e116b7bd359378a48cee2cefe3bcdae8809a3bba225'
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
  - pl-sql
  - mongodb
  - nosql
  - sql
  - normalisation
  - objet-relationnel
  - triggers
  - packages
  - agence-immobilière
  - architecture-hybride
  - bdd-avancées
domain: database
---
# S7 - BDD Avancées — ADVANCED-DB-PROJECT-2.pdf

## Summary

Projet académique de bases de données avancées (Oracle + MongoDB) modélisant une agence immobilière. Architecture hybride : relationnel pour les transactions critiques, PL/SQL pour la logique métier côté base, objet-relationnel pour l'héritage, MongoDB pour les données semi-structurées orientées lecture.

## Fields/API

**environnement**: **description**: Technologies utilisées
**values**: - Oracle Database (relationnel + objet-relationnel)
- PL/SQL
- MongoDB (NoSQL)
**organisation_scripts**: **description**: Structure du répertoire scripts/ par phase fonctionnelle
**entry_point**: 99_run_all.sql — exécution complète dans l'ordre correct, sans intervention manuelle
**schema_relationnel**: **tables_total**: 11
**tables_reference**: - STATUT
- TYPE_BIEN
**tables_acteurs**: - CLIENT
- AGENT
**tables_localisation**: - ADRESSE
**tables_metier**: - BIEN
- MANDAT
- VISITE
- TRANSACTION
- COMMISSION
- PAIEMENT
**contraintes_integrite**: **mecanismes**: - clés primaires
- clés étrangères
- contraintes CHECK
**check_exemples**: - taux de commission valide
- surfaces cohérentes
- montants > 0
- cohérence temporelle des dates
**triggers**: **TRG_CALC_COMMISSION**: Calcul automatique de la commission lors d'une transaction
**TRG_CHECK_VISITE_DATE**: Interdiction d'une visite avant le début du mandat
**TRG_UPDATE_BIEN_STATUT**: Mise à jour automatique du statut du bien après transaction
**TRG_NO_DELETE_CLIENT**: Empêche la suppression d'un client référencé
**TRG_CHECK_PAIEMENT**: Vérification de la cohérence des paiements
**package_stats**: **nom**: PKG_STATS
**indicateurs**: - chiffre d'affaires
- nombre total de transactions
- montant total des commissions
**objet_relationnel**: **hierarchie**: - BIEN_OBJ (racine)
- APPARTEMENT_OBJ
- MAISON_OBJ
**operateurs**: - IS OF (polymorphisme)
- TREAT
- VALUE
**normalisation**: **formes_appliquees**: - 1NF
- 2NF
- 3NF
- BCNF
**formes_exclues**: 4NF–6NF — jugées sans bénéfice fonctionnel dans ce contexte, complexité inutile
**mongodb**: **collections**: - clients (préférences + historique visites imbriqués)
- biens
- transactions (paiements intégrés au document)
**cas_usage**: - données semi-structurées
- orientées consultation
- évolutives
**avantages**: - évite jointures coûteuses
- schéma flexible
- lectures optimisées

## Constraints

- Oracle est la source de vérité pour les données transactionnelles critiques — MongoDB est complémentaire, non substitutif
- Les triggers garantissent les règles métier indépendamment de l'application cliente
- L'objet-relationnel est limité aux cas où il apporte une réelle valeur conceptuelle (héritage de types de biens)
- Les clés artificielles sont préférées aux clés naturelles pour la stabilité du modèle
- Les formes normales supérieures à BCNF sont volontairement exclues (compromis rigueur/performance)

## Examples

- Calcul automatique d'une commission : TRG_CALC_COMMISSION se déclenche sur INSERT dans TRANSACTION et remplit COMMISSION sans code applicatif
- Polymorphisme objet : SELECT VALUE(b) FROM biens_obj b WHERE b IS OF (APPARTEMENT_OBJ) retourne uniquement les appartements typés
- Document MongoDB clients : { _id, nom, préférences: {budget, type}, historique_visites: [{bien_id, date}] } — pas de jointure nécessaire pour l'affichage client
- 99_run_all.sql enchaîne : schéma → contraintes → seed → triggers → packages dans l'ordre des dépendances

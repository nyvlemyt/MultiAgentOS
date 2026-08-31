---
id: resource-s6-gestion-de-projet-analyse-swot-glimpse-pdf-9a2bc434
slug: resource-s6-gestion-de-projet-analyse-swot-glimpse-pdf-9a2bc434
source_key: 'sha256:9a2bc4349a8ff0eeb2a8fd62557b2bfe902a55302db14648a78146e44c63caf2'
part_of: resource-s6-gestion-de-projet-20404db8
order: 3
manifest: null
derived_from: 'sha256:9a2bc4349a8ff0eeb2a8fd62557b2bfe902a55302db14648a78146e44c63caf2'
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
  - swot
  - gestion-de-projet
  - python
  - automatisation
  - sécurité
  - api
  - données
  - glimpse
domain: gestion de projet
---
# S6 - Gestion de projet — Analyse_SWOT_Glimpse.pdf

## Summary

Analyse SWOT du projet Glimpse (27/03/2025) — outil interne Python d'automatisation quotidienne de récupération, traitement, envoi et exploitation de données d'ordres journaliers, avec chiffrement GPG des données sensibles.

## Fields/API

**forces**: - Automatisation quotidienne fiable du pipeline complet
- Maîtrise end-to-end (récupération → traitement → envoi → réutilisation)
- Soutien d'un expert interne de l'API pour les champs complexes
- Chiffrement GPG du fichier .env et de la clé privée
- Stack maîtrisée : Python, VSCode, bibliothèques connues
**faiblesses**: - Développeur unique — aucun relais en cas d'indisponibilité
- Dépendance forte à un seul expert interne de l'API
**opportunités**: - Centralisation multi-entreprises pour comparatifs inter-entités
- Montée en compétences : API, traitement de données, sécurité, SQL
- Création de dashboards, exports, visualisations
- Ouverture à d'autres équipes si le projet est bien documenté
**menaces**: - Changement de l'API → rupture du pipeline
- Perte de la connaissance métier si l'expert interne quitte son poste
- Évolution des besoins métiers rendant le projet obsolète
- Risques sécurité / RGPD sur le traitement des données sensibles
**scores**: **strengths**: 4.8/5
**weaknesses**: 2.0/5
**opportunities**: 3.75/5
**threats**: 2.5/5

## Constraints

- Projet individuel — absence de bus factor mitigation
- Dépendance critique à un seul point de connaissance API interne
- Obligations RGPD sur la conservation et le traitement des données d'ordres

## Examples

- Chiffrement GPG du fichier .env pour sécuriser les credentials API
- Pipeline quotidien automatique : fetch → process → send → store
- Potentiel d'extension vers un dashboard de reporting multi-entreprises

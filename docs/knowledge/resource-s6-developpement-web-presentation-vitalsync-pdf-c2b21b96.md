---
id: resource-s6-developpement-web-presentation-vitalsync-pdf-c2b21b96
slug: resource-s6-developpement-web-presentation-vitalsync-pdf-c2b21b96
source_key: 'sha256:c2b21b9637f76afa88d32ba4ff5563129c422069616cf29f0156b514359dd386'
part_of: S6 - Développement Web
order: 1
manifest: null
derived_from: 'sha256:c2b21b9637f76afa88d32ba4ff5563129c422069616cf29f0156b514359dd386'
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
lane: resources
schema_version: '1'
tags:
  - vue.js
  - web-app
  - health-tracking
  - student-project
  - firebase
  - google-fit
  - gamification
domain: web development
---
# S6 - Développement Web — PRESENTATION_VITALSYNC.pdf

## Summary

VitalSync est une application web de suivi quotidien du bien-être (sommeil, humeur, activité, alimentation) réalisée par Pierre Chevily, Madavan Balassoupramanien, Melvyn Pommier et Simon Girard (ING1-APP LSI3) dans le cadre du module Développement Web (enseignant : Lazhar Hamel, 03/07/2025). Stack : Vue.js frontend, authentification Microsoft, Firebase pour la base de données temps réel.

## Fields/API

**name**: Fonctionnalités principales
**value**: Journal quotidien (coucher/réveil, qualité sommeil, humeur, activité, alimentation) · Graphiques d'évolution (humeur, sommeil, corrélation sport/moral) · Widgets d'ajout rapide depuis la page d'accueil · Historique exportable en CSV
**name**: Fonctionnalités supplémentaires
**value**: Firebase (persistance données temps réel) · Intégration Google Fit (sync activité et sommeil) · Dark mode · Multilingue · Module hydratation · Widget météo local · Défis quotidiens/hebdomadaires · Système de badges (gamification)
**name**: Stack technique
**value**: Vue.js (frontend), Microsoft Authentication, Firebase (backend/BDD temps réel)
**name**: Équipe
**value**: Pierre Chevily, Madavan Balassoupramanien, Melvyn Pommier, Simon Girard — ING1-APP LSI3
**name**: Contexte pédagogique
**value**: Module Développement Web, enseignant Lazhar Hamel. Choix parmi 3 sujets : Journal e-mails, Suivi de formation, Santé (VitalSync retenu pour sa richesse technique et la progression en compétences offerte).

## Constraints

- Authentification obligatoire via compte Microsoft
- Données persistées via Firebase (pas de back-end custom mentionné)
- Export historique limité au format CSV
- Intégration Google Fit pour synchronisation automatique uniquement (activité physique, sommeil)

## Examples

- Enregistrement rapide de la qualité du sommeil et de l'humeur depuis la page d'accueil via les widgets
- Visualisation graphique de l'évolution de l'humeur en corrélation avec l'activité physique
- Déverrouillage de badges selon la régularité des saisies quotidiennes

---
id: resource-s7-api-et-webservices-db2dc739
slug: resource-s7-api-et-webservices-db2dc739
source_key: 'sha256:db2dc7396ed1b5f05ed28e45ba3f90ccf567e5c462a386d4cfd041a6a09911a1'
part_of: null
order: null
manifest: null
derived_from: 'sha256:db2dc7396ed1b5f05ed28e45ba3f90ccf567e5c462a386d4cfd041a6a09911a1'
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
  - api
  - web-services
  - http
  - rest
  - postman
  - nodejs
  - security
  - jwt
  - authentication
domain: backend-development
---
# S7 - api et webservices

## Summary

Index du module S7 — APIs et Web Services. Regroupe 10 documents académiques couvrant trois axes : (1) fondamentaux HTTP via Postman, (2) sécurisation d'APIs REST (JWT, auth, HTTPS), (3) consommation d'API avec Node.js et affichage web. Inclut un rapport de projet signé BALL_POMMIER.

## Fields/API

**name**: HTTP Requests & Responses — Postman
**docs**: - PW_1 (EN)
- PW_1 (FR)
- Pratique HTTP
**topic**: Méthodes HTTP (GET, POST, PUT, DELETE), anatomie des requêtes/réponses, utilisation de Postman pour inspecter headers, body et codes de statut
**name**: Sécurisation API REST
**docs**: - TP Sécurisation api rest (pdf)
- TP Sécurisation d (docx)
- TP Sécurisation d (pdf)
- cours api sécurité
**topic**: Authentification JWT, gestion des tokens, HTTPS, middleware de vérification, hardening d'endpoints REST
**name**: Node.js & consommation d'API
**docs**: - TP_5_A Installation Node.js
- TP_5_B Node.js API + visualisation web
**topic**: Installation de Node.js, appels HTTP depuis Node (axios/fetch), injection du JSON dans une page web
**name**: Rapport de projet
**docs**: - rapport-api-BALL_POMMIER
**topic**: Synthèse et retour d'expérience sur l'ensemble des TPs du module

## Constraints

- Documents majoritairement en français (PW_1 disponible en EN et FR)
- Contexte académique — TPs guidés, étape par étape
- Périmètre limité à REST (pas GraphQL, pas gRPC, pas WebSocket)

## Examples

- TP Postman : envoyer une requête GET à une API publique, lire le code HTTP 200/404 et les headers Content-Type
- TP Sécurisation : protéger un endpoint Express avec un middleware JWT — génération du token, vérification, rejet 401 si invalide
- TP Node.js : appeler une API météo depuis Node.js et injecter le résultat JSON dans le DOM d'une page HTML

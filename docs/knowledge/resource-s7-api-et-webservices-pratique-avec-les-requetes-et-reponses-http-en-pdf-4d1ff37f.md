---
id: >-
  resource-s7-api-et-webservices-pratique-avec-les-requetes-et-reponses-http-en-pdf-4d1ff37f
slug: >-
  resource-s7-api-et-webservices-pratique-avec-les-requetes-et-reponses-http-en-pdf-4d1ff37f
source_key: 'sha256:4d1ff37f5b7a0473a27bb6fc3df7797fa41e4dda7db550c9510669a1ab7ecd01'
part_of: resource-s7-api-et-webservices-db2dc739
order: 3
manifest: null
derived_from: 'sha256:4d1ff37f5b7a0473a27bb6fc3df7797fa41e4dda7db550c9510669a1ab7ecd01'
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
lane: workflows
schema_version: '1'
tags:
  - http
  - rest-api
  - postman
  - requêtes
  - réponses
  - status-codes
  - json
domain: web-apis
---
# S7 - api et webservices — Pratique avec les Requêtes et Réponses HTTP en.pdf

## Goal

Pratiquer les méthodes HTTP (GET, POST, PUT, DELETE) et lire les réponses avec Postman sur une API publique (jsonplaceholder).

## Prerequisites

- Postman installé
- Accès internet
- Notions de base sur les URL

## Steps

- Tâche 1 — GET : envoyer une requête GET sur l'API ; vérifier le code 200 OK ; lire le corps JSON (tableau d'objets avec champs userId, id, title, body).
- Tâche 2 — En-têtes HTTP : ajouter/inspecter les en-têtes de la requête ; constater que la réponse reste 200 OK et le contenu identique à la tâche 1.
- Tâche 3a — POST : envoyer un POST avec body JSON (title, body, userId) ; attendre 201 Created ; vérifier que le serveur ajoute un champ id dans la réponse.
- Tâche 3b — PUT : envoyer un PUT pour modifier une ressource existante ; vérifier 200 OK et que le body JSON reflète les nouvelles valeurs.
- Tâche 3c — DELETE : envoyer un DELETE sur une ressource ; vérifier 200 OK.
- Tâche 4a — Erreur 404 : cibler une ressource inexistante ; constater 404 avec corps vide.
- Tâche 4b — Erreur 500/503 : envoyer un body JSON malformé → 500 ; utiliser une méthode HTTP invalide (FOO) → 503.

## Result

L'apprenant sait utiliser Postman pour exercer les quatre méthodes REST, lit et interprète les codes de statut courants (200, 201, 404, 500, 503), et comprend la structure JSON clé-valeur des réponses d'API.

## Next

- Construire sa propre API REST simple (Express, FastAPI…)
- Apprendre l'authentification HTTP (Bearer token, OAuth)
- Explorer la documentation OpenAPI / Swagger

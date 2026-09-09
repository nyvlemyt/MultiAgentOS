---
id: >-
  resource-s7-api-et-webservices-pw-1-pratique-avec-les-requetes-et-reponses-http-en-utilisant-postman-pdf-b1c45386
slug: >-
  resource-s7-api-et-webservices-pw-1-pratique-avec-les-requetes-et-reponses-http-en-utilisant-postman-pdf-b1c45386
source_key: 'sha256:b1c45386a88cadfae92926f88141d719fbcae6f73f2823cb2a191c2869193dff'
part_of: resource-s7-api-et-webservices-db2dc739
order: 2
manifest: null
derived_from: 'sha256:b1c45386a88cadfae92926f88141d719fbcae6f73f2823cb2a191c2869193dff'
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
  - api
  - postman
  - rest
  - requêtes
  - réponses
  - get
  - post
  - put
  - delete
  - status-codes
domain: API & Web Services
---
# S7 - api et webservices — PW_1___Pratique_avec_les_Requêtes_et_Réponses_HTTP_en_Utilisant_Postman.pdf

## Goal

Acquérir une expérience pratique des requêtes et réponses HTTP en utilisant Postman pour interagir avec une API REST publique (JSONPlaceholder).

## Prerequisites

- Postman installé et compte créé (gratuit)
- Accès internet pour joindre https://jsonplaceholder.typicode.com
- Notions de base sur les API REST

## Steps

**step**: 1
**title**: Configurer Postman
**detail**: Télécharger et installer Postman. Créer une nouvelle collection nommée 'API Protocols Practice'. Créer une première requête nommée 'GET Posts'.
**step**: 2
**title**: Tâche 1 — Requête GET
**detail**: Méthode GET sur https://jsonplaceholder.typicode.com/posts. Observer le statut 200 OK et le corps JSON contenant une liste de publications (tableaux d'objets avec clés id, title, body, userId). Analyser la structure clé-valeur JSON.
**step**: 3
**title**: Tâche 2 — En-têtes HTTP
**detail**: Dans l'onglet Headers, ajouter l'en-tête 'User-Agent: PostmanRuntime/7.28.0'. Renvoyer la requête GET. Observer que la réponse peut rester identique mais comprendre le rôle des en-têtes pour les API plus complexes.
**step**: 4
**title**: Tâche 3 — Requête POST (création)
**detail**: Méthode POST sur https://jsonplaceholder.typicode.com/posts. Corps raw JSON : {"title": "New Post", "body": "This is the body of the new post.", "userId": 1}. Réponse attendue : 201 Created avec un id attribué par le serveur.
**step**: 5
**title**: Tâche 3 — Requête PUT (mise à jour)
**detail**: Méthode PUT sur https://jsonplaceholder.typicode.com/posts/1. Corps JSON : {"id": 1, "title": "Updated Post", "body": "This post has been updated.", "userId": 1}. Réponse attendue : 200 OK avec les données mises à jour.
**step**: 6
**title**: Tâche 3 — Requête DELETE (suppression)
**detail**: Méthode DELETE sur https://jsonplaceholder.typicode.com/posts/1. Réponse attendue : 200 OK ou 204 No Content confirmant la suppression.
**step**: 7
**title**: Tâche 4 — Codes de statut et gestion des erreurs
**detail**: GET sur /posts/9999 → 404 Not Found. Tester une méthode invalide (FOO) → 405 Method Not Allowed. Envoyer un corps malformé en POST → 400 Bad Request.
**step**: 8
**title**: Tâche 5 — Rédiger un rapport
**detail**: Documenter chaque méthode utilisée, les codes de statut observés, la structure des réponses, les défis rencontrés. Inclure des captures d'écran Postman. Réfléchir au rôle de HTTP dans la conception d'API robustes.

## Result

L'apprenant sait construire et envoyer des requêtes GET, POST, PUT et DELETE avec Postman, lire et interpréter les codes de statut HTTP (200, 201, 204, 400, 404, 405), ajouter des en-têtes personnalisés, et produire un rapport structuré sur ses interactions avec une API REST.

## Next

- Explorer l'authentification HTTP (Bearer token, Basic Auth) dans Postman
- Tester des API avec paramètres de requête et variables d'environnement Postman
- Automatiser les tests avec les scripts de test Postman (pre-request scripts, assertions)

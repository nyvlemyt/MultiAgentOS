---
id: >-
  resource-s7-api-et-webservices-pw-1-hands-on-with-http-requests-and-responses-using-postman-pdf-54af57a8
slug: >-
  resource-s7-api-et-webservices-pw-1-hands-on-with-http-requests-and-responses-using-postman-pdf-54af57a8
source_key: 'sha256:54af57a85fd488753af6914bfee91688d6bd18bf012c3b3adfbc504405c7ca17'
part_of: resource-s7-api-et-webservices-db2dc739
order: 1
manifest: null
derived_from: 'sha256:54af57a85fd488753af6914bfee91688d6bd18bf012c3b3adfbc504405c7ca17'
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
  - postman
  - api
  - rest
  - get
  - post
  - put
  - delete
  - status-codes
  - headers
domain: API & Web Services
---
# S7 - api et webservices — PW_1___Hands_On_with_HTTP_Requests_and_Responses_Using_Postman.pdf

## Goal

Comprendre les requêtes et réponses HTTP en pratique en utilisant Postman pour interagir avec une API REST publique (JSONPlaceholder).

## Prerequisites

- Postman installé et compte créé (gratuit)
- Notions de base sur ce qu'est une API REST
- Accès internet pour atteindre jsonplaceholder.typicode.com

## Steps

**step**: 1
**title**: Setup Postman
**actions**: - Ouvrir Postman et se connecter
- Créer une nouvelle collection nommée 'API Protocols Practice'
- Créer une première requête nommée 'GET Posts' dans cette collection
**step**: 2
**title**: Task 1 — Requête GET : lire des ressources
**actions**: - Méthode : GET
- URL : https://jsonplaceholder.typicode.com/posts
- Cliquer Send
- Observer : status 200 OK, corps en JSON (tableau de posts avec id, title, body, userId)
**step**: 3
**title**: Task 2 — Headers HTTP
**actions**: - Dans l'onglet Headers, ajouter la clé User-Agent avec une valeur arbitraire (ex. PostmanRuntime/7.28.0)
- Renvoyer la requête GET
- Observer : la réponse peut ne pas changer visuellement, mais les headers influencent le comportement des APIs complexes
**step**: 4
**title**: Task 3a — Requête POST : créer une ressource
**actions**: - Méthode : POST
- URL : https://jsonplaceholder.typicode.com/posts
- Onglet Body > raw > JSON
- Corps : { "title": "New Post", "body": "This is the body of the new post.", "userId": 1 }
- Cliquer Send
- Observer : status 201 Created, réponse contient un id attribué par le serveur
**step**: 5
**title**: Task 3b — Requête PUT : modifier une ressource
**actions**: - Méthode : PUT
- URL : https://jsonplaceholder.typicode.com/posts/1
- Corps JSON : { "id": 1, "title": "Updated Post", "body": "This post has been updated.", "userId": 1 }
- Cliquer Send
- Observer : status 200 OK, corps reflète les données mises à jour
**step**: 6
**title**: Task 3c — Requête DELETE : supprimer une ressource
**actions**: - Méthode : DELETE
- URL : https://jsonplaceholder.typicode.com/posts/1
- Cliquer Send
- Observer : status 200 OK ou 204 No Content
**step**: 7
**title**: Task 4 — Gestion des erreurs et codes de statut
**actions**: - GET sur https://jsonplaceholder.typicode.com/posts/9999 → 404 Not Found
- Requête avec méthode invalide (ex. FOO) → 405 Method Not Allowed
- POST avec corps malformé → 400 Bad Request
**step**: 8
**title**: Task 5 — Rédiger un rapport de synthèse
**actions**: - Décrire chaque méthode HTTP utilisée (GET, POST, PUT, DELETE)
- Inclure exemples de requêtes, codes de statut et structure des réponses
- Joindre des captures d'écran Postman
- Réfléchir au rôle de HTTP dans la conception d'APIs robustes

## Result

L'apprenant sait construire et envoyer des requêtes HTTP (GET/POST/PUT/DELETE) avec Postman, lire et interpréter les réponses (code de statut, corps JSON, headers), et reproduire les codes d'erreur courants (400, 404, 405).

## Next

- Explorer l'authentification HTTP (Bearer token, API Key) dans Postman
- Utiliser les variables d'environnement Postman pour gérer les URLs et tokens
- Découvrir les tests automatisés dans Postman (onglet Tests, assertions JS)
- Passer à une vraie API protégée pour mettre en pratique l'authentification

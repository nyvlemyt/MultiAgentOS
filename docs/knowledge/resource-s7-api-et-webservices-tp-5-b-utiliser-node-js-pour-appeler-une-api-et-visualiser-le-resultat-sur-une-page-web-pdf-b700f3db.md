---
id: >-
  resource-s7-api-et-webservices-tp-5-b-utiliser-node-js-pour-appeler-une-api-et-visualiser-le-resultat-sur-une-page-web-pdf-b700f3db
slug: >-
  resource-s7-api-et-webservices-tp-5-b-utiliser-node-js-pour-appeler-une-api-et-visualiser-le-resultat-sur-une-page-web-pdf-b700f3db
source_key: 'sha256:b700f3db0519565212146f77c9574427e4c8487965e35faaa780c02f43e110dc'
part_of: resource-s7-api-et-webservices-db2dc739
order: 8
manifest: null
derived_from: 'sha256:b700f3db0519565212146f77c9574427e4c8487965e35faaa780c02f43e110dc'
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
  - node.js
  - spring-boot
  - express
  - ejs
  - rest-api
  - java
  - web
  - http-client
domain: web development
---
# S7 - api et webservices — TP_5_B___Utiliser_Node_js_pour_Appeler_une_API_et_Visualiser_le_Résultat_sur_une_Page_Web.pdf

## Goal

Appeler une API REST développée avec Spring Boot depuis un serveur Node.js/Express, et afficher les résultats dans une page web rendue avec le moteur de templates EJS.

## Prerequisites

- Java et Spring Boot configurés sur la machine
- Node.js installé
- Connaissances de base en Java, Spring Boot, Node.js et HTML/CSS

## Steps

**title**: Créer et lancer l'API Spring Boot
**details**: Générer un projet via Spring Initializr (start.spring.io) avec la dépendance Spring Web. Ajouter un contrôleur @RestController exposant deux endpoints : GET /api/data (retourne une List<String>) et GET /api/info (retourne une String). Lancer l'application sur le port 8080.
**title**: Initialiser le projet Node.js
**details**: Créer un dossier tp-nodejs-api, exécuter npm init -y, puis installer les dépendances : npm install express ejs node-fetch.
**title**: Créer le serveur Express (server.js)
**details**: Configurer Express avec EJS comme view engine (app.set('view engine', 'ejs')). Servir les fichiers statiques depuis /public. Définir deux routes : GET / → render('index') et GET /api/data → fetch http://localhost:8080/api/data, puis render('api', { data }). Gérer les erreurs avec un bloc try/catch renvoyant un status 500. Écouter sur process.env.PORT || 3000.
**title**: Créer les vues EJS
**details**: Dans le dossier views/ : (1) index.ejs — page d'accueil avec un lien vers /api/data ; (2) api.ejs — affiche les résultats via une boucle EJS <% data.forEach(function(item) { %><li><%= item %></li><% }); %> avec un lien retour vers /.
**title**: Ajouter les styles CSS
**details**: Créer public/styles.css avec des styles de base : body centré en Arial, h1 en #333, liens en #007BFF, liste sans puce (list-style-type: none), items espacés de 10px.
**title**: Exécuter l'application
**details**: 1. Démarrer Spring Boot (port 8080). 2. Lancer node server.js. 3. Ouvrir http://localhost:3000 dans le navigateur.

## Result

Une application web fonctionnelle à deux couches : Spring Boot expose des endpoints REST sur le port 8080 ; Node.js/Express sert de couche intermédiaire (BFF) qui consomme ces APIs et affiche les données dans des pages HTML rendues côté serveur via EJS sur le port 3000.

## Next

- Ajouter d'autres endpoints Spring Boot (POST, PUT, DELETE) et les routes Node.js correspondantes
- Remplacer node-fetch par axios pour une gestion d'erreurs plus riche
- Paramétrer l'URL de l'API Spring Boot via une variable d'environnement plutôt qu'en dur
- Ajouter une couche d'authentification (JWT) entre Node.js et Spring Boot

---
id: resource-s7-api-et-webservices-tp-5-a-installation-de-node-js-pdf-e9637846
slug: resource-s7-api-et-webservices-tp-5-a-installation-de-node-js-pdf-e9637846
source_key: 'sha256:e96378460238c1f407b4d3406ba73c4c1f4a2286e79d581cd88787e03f1aa2c7'
part_of: S7 - api et webservices
order: 7
manifest: null
derived_from: 'sha256:e96378460238c1f407b4d3406ba73c4c1f4a2286e79d581cd88787e03f1aa2c7'
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
lane: resources
schema_version: '1'
tags:
  - node.js
  - npm
  - installation
  - javascript
  - backend
  - setup
domain: développement backend
---
# S7 - api et webservices — TP_5_A___Installation_de_Node_js.pdf

## Goal

Installer Node.js sur une machine locale, vérifier l'installation, créer et exécuter une première application JavaScript, puis installer un module npm.

## Prerequisites

- Un ordinateur sous Windows, macOS ou Linux
- Accès à Internet

## Steps

**step**: 1
**title**: Télécharger Node.js
**actions**: - Aller sur https://nodejs.org
- Choisir la version LTS (recommandée) pour plus de stabilité
- Télécharger le fichier d'installation correspondant à votre OS
**step**: 2
**title**: Installer Node.js selon l'OS
**actions**: - Windows : exécuter le fichier .msi et suivre les instructions
- macOS : exécuter le fichier .pkg et suivre les instructions
- Linux (Debian/Ubuntu) : curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash - && sudo apt-get install -y nodejs
**step**: 3
**title**: Vérifier l'installation
**actions**: - Ouvrir un terminal
- Vérifier Node.js : node -v (ex: v18.16.0)
- Vérifier npm : npm -v (ex: 8.19.3)
**step**: 4
**title**: Créer un projet Node.js simple
**actions**: - mkdir premier_projet_node && cd premier_projet_node
- Créer app.js : echo "console.log('Hello, Node.js!');" > app.js
- Exécuter : node app.js
- Résultat attendu : Hello, Node.js!
**step**: 5
**title**: Installer un module npm
**actions**: - npm install express
- Un dossier node_modules apparaît dans le répertoire du projet
**step**: 6
**title**: Désinstallation (facultatif)
**actions**: - Windows : panneau de configuration → désinstaller Node.js
- macOS/Linux : supprimer les fichiers associés ou utiliser le gestionnaire de paquets

## Result

Node.js et npm sont installés et fonctionnels. Un premier script JavaScript s'exécute via Node, et un paquet tiers (Express) est installé avec npm.

## Next

- Créer un serveur HTTP simple avec le module http natif de Node.js
- Utiliser Express pour créer une API REST basique
- Initialiser un projet avec npm init et gérer les dépendances via package.json

---
id: resource-s7-api-et-webservices-rapport-api-ball-pommier-pdf-33af09ba
slug: resource-s7-api-et-webservices-rapport-api-ball-pommier-pdf-33af09ba
source_key: 'sha256:33af09baedb9eb787781d6366e4b426ed5044512222b018e6efd20a413ea31c9'
part_of: resource-s7-api-et-webservices-db2dc739
order: 10
manifest: null
derived_from: 'sha256:33af09baedb9eb787781d6366e4b426ed5044512222b018e6efd20a413ea31c9'
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
doc_type: explanation
actionability: resource
lane: knowledge
schema_version: '1'
tags:
  - api
  - backend
  - e-commerce
  - architecture
  - authentification
  - REST
  - client-serveur
domain: développement web
---
# S7 - api et webservices — rapport-api-BALL_POMMIER.pdf

## Thesis

Un site e-commerce repose essentiellement sur la qualité de son API backend : c'est elle qui orchestre utilisateurs, produits, commandes et paiements. Le frontend n'est qu'une vitrine ; la logique métier et la cohérence des données vivent côté serveur.

## Context

Projet académique S7 (API & Web Services) réalisé par Pommier Melvyn et Ball N'Diaye. Objectif : concevoir une API backend complète pour un site de commerce en ligne, avec une interface web minimale servant aux tests. L'équipe a volontairement choisi de concentrer l'effort sur le backend plutôt que sur le design du frontend.

## Reasoning

Trois enjeux structurants ont guidé les décisions techniques : (1) Organisation du code — séparer clairement routes, modules et fichiers pour maintenir la lisibilité à mesure que l'API grandit. (2) Sécurité — mettre en place un système d'authentification pour protéger les routes sensibles et éviter les accès non autorisés. (3) Cohérence des données — modéliser correctement les relations entre entités (utilisateurs ↔ produits ↔ paniers ↔ commandes) pour que les informations restent intègres à travers les opérations. La communication frontend/backend a été validée par des tests réguliers des endpoints, permettant de détecter et corriger les erreurs rapidement.

## Trade-offs

Privilégier le backend produit une API robuste et une logique métier solide, mais laisse l'interface utilisateur volontairement sommaire. Les améliorations identifiées pour une V2 sont : (a) frontend plus travaillé, (b) tests automatisés, (c) gestion plus avancée des paiements et des livraisons. Ce choix est cohérent pour un contexte académique centré sur les web services, mais serait insuffisant pour un déploiement production où l'UX compte autant que la solidité de l'API.

## See also

- architecture client-serveur
- REST API design
- authentification JWT/session
- modélisation relationnelle
- tests d'endpoints

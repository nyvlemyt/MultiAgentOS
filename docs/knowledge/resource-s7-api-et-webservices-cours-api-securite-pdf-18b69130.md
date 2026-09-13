---
id: resource-s7-api-et-webservices-cours-api-securite-pdf-18b69130
slug: resource-s7-api-et-webservices-cours-api-securite-pdf-18b69130
source_key: 'sha256:18b691306d8d9b115d04dc7e0e596e52a58f71174458f93dbe0f57904e80f662'
part_of: resource-s7-api-et-webservices-db2dc739
order: 9
manifest: null
derived_from: 'sha256:18b691306d8d9b115d04dc7e0e596e52a58f71174458f93dbe0f57904e80f662'
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
  - api-security
  - authentication
  - oauth2
  - jwt
  - encryption
  - tls
  - injection
  - csrf
  - xss
domain: security
---
# S7 - api et webservices — cours api sécurité.pdf

## Summary

Vue d'ensemble des mécanismes de sécurité applicables aux API REST : authentification par clé, délégation OAuth 2.0, tokens JWT, chiffrement symétrique/asymétrique, TLS, et protection contre les attaques courantes (SQLi, CSRF, XSS).

## Fields/API

**API Key**: **description**: Chaîne unique fournie à chaque client, incluse dans chaque requête HTTP.
**avantages**: Facile à mettre en place.
**limites**: Clé exposée dans les requêtes ; persistante (pas de durée de vie automatique).
**OAuth 2.0**: **description**: Protocole d'autorisation par token. L'utilisateur ne partage jamais son mot de passe.
**flux**: - Le client redirige l'utilisateur vers le serveur d'authentification.
- L'utilisateur s'authentifie et consent au partage de données.
- Le serveur délivre un access token.
- Le client utilise le token pour accéder à l'API.
**durée_token**: Limitée ; régénéré périodiquement.
**JWT (JSON Web Token)**: **description**: Format de token léger avec signature intégrée.
**structure**: **Header**: Type de token + algorithme de signature.
**Payload**: Claims : informations sur l'utilisateur (rôle, identifiant, etc.).
**Signature**: Garantit l'intégrité du contenu.
**Chiffrement**: **symétrique**: Même clé pour chiffrer et déchiffrer (ex. : AES).
**asymétrique**: Clé publique pour chiffrer, clé privée pour déchiffrer (ex. : RSA).
**TLS (Transport Layer Security)**: **description**: Protocole qui sécurise les échanges réseau entre client et serveur.
**Injection SQL**: **description**: Injection de code malveillant dans une requête SQL.
**prévention**: Utiliser des requêtes paramétrées / ORM.
**CSRF (Cross-Site Request Forgery)**: **description**: Requête frauduleuse envoyée au nom d'un utilisateur authentifié sans son consentement.
**prévention**: Token CSRF inclus et vérifié à chaque requête sensible.
**XSS (Cross-Site Scripting)**: **description**: Injection de code JavaScript dans une page web.
**prévention**: - Valider les entrées utilisateur.
- Échapper les caractères spéciaux HTML.

## Constraints

- L'API Key est persistante — une compromission exige une révocation manuelle.
- OAuth 2.0 requiert un serveur d'authentification tiers ou interne.
- JWT : le payload n'est pas chiffré par défaut (encodé en Base64), donc ne pas y stocker de secrets sensibles sans JWE.
- TLS est un prérequis pour que tout mécanisme d'authentification soit réellement sécurisé (sinon les tokens/clés transitent en clair).

## Examples

- API Key : `GET /data HTTP/1.1\nAuthorization: ApiKey abc123xyz`
- OAuth 2.0 : flux utilisé par 'Se connecter avec Google' pour accorder l'accès à une app tierce sans exposer le mot de passe Google.
- JWT : `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwicm9sZSI6ImFkbWluIn0.<signature>`
- CSRF : token caché dans un formulaire HTML, vérifié côté serveur avant tout traitement POST.

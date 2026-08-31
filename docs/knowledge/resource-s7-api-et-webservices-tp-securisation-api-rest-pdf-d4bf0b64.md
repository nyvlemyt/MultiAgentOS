---
id: resource-s7-api-et-webservices-tp-securisation-api-rest-pdf-d4bf0b64
slug: resource-s7-api-et-webservices-tp-securisation-api-rest-pdf-d4bf0b64
source_key: 'sha256:d4bf0b64d5878f153394fc33544d2cf8a0db10b1a7825b5d56a348a0b3f1cdc9'
part_of: resource-s7-api-et-webservices-db2dc739
order: 4
manifest: null
derived_from: 'sha256:d4bf0b64d5878f153394fc33544d2cf8a0db10b1a7825b5d56a348a0b3f1cdc9'
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
  - rest-api
  - jwt
  - authentication
  - authorization
  - rate-limiting
  - xss
  - sql-injection
  - https
  - api-key
domain: security
---
# S7 - api et webservices — TP Sécurisation api rest .pdf

## Summary

Synthèse des mécanismes de sécurisation d'une API REST : authentification par clé API, JWT, protection contre les injections et XSS, rate limiting, et bonnes pratiques générales. Source : TP académique (EFREI S7 API & Webservices).

## Fields/API

**name**: Authentification par clé API
**value**: Agit comme un mot de passe partagé unique. Faiblesses : pas d'expiration, pas de périmètre, lisible en clair si non chiffrée. Renforcements : HTTPS obligatoire, rotation/expiration, scopes par clé, stockage en hash côté serveur, HMAC/timestamp anti-rejeu, rate limiting + journalisation.
**name**: JWT — signé vs chiffré
**value**: JWS (signé) : garantit l'intégrité et l'origine, mais le contenu reste lisible. JWE (chiffré) : contenu confidentiel, illisible sans clé. Les deux peuvent être combinés. Le payload JWT ne doit contenir que des données minimales non sensibles — les données sensibles restent côté serveur.
**name**: Injection SQL vs XSS
**value**: SQL injection : cible le serveur, exécute des commandes sur la BDD via des entrées non filtrées. XSS : cible le navigateur, injecte du JavaScript dans la page d'un utilisateur. Les deux exploitent des entrées non validées mais sur des couches différentes (serveur vs client).
**name**: Validation côté client vs serveur
**value**: La validation côté client est contournable (outil, requête manuelle). Seul le serveur contrôle réellement les données reçues — la validation serveur est obligatoire et non substituable.
**name**: Rate Limiting
**value**: Empêche la surcharge et les DoS en plafonnant les requêtes par unité de temps. En architecture distribuée : compteur centralisé (Redis), identifiant unique (clé, user, IP), algorithme adapté (token bucket, sliding window), contrôle au niveau du proxy/API Gateway, journalisation des dépassements.
**name**: Authentification vs Autorisation
**value**: Authentification = vérifier l'identité (qui est l'utilisateur). Autorisation = déterminer les droits d'accès (que peut-il faire). Deux étapes distinctes et complémentaires.
**name**: HTTPS
**value**: Assure confidentialité, intégrité et authentification du serveur via certificat. Empêche l'interception et la modification des données en transit. Prérequis de base pour toute API exposée.
**name**: Défense en profondeur
**value**: Combiner plusieurs mécanismes car chacun couvre un risque distinct : authentification (identité), autorisation (droits), validation/filtrage (injections), rate limiting (abus). Aucun mécanisme seul ne suffit.

## Constraints

- Ne jamais exposer de données sensibles dans un JWT non chiffré.
- La validation des entrées doit toujours être reproduite côté serveur, jamais uniquement côté client.
- HTTPS est un prérequis, non une option.
- Stocker les clés API uniquement sous forme de hash côté serveur.
- En architecture distribuée, le rate limiting doit s'appuyer sur un store partagé (ex. Redis), pas sur la mémoire locale du processus.

## Examples

- Clé API avec scope limité + HMAC timestamp → réduit le risque de rejeu et de sur-exposition.
- JWT contenant uniquement `user_id` et `role`, sans email ni données personnelles.
- Requête paramétrée (prepared statement) pour prévenir l'injection SQL.
- En-têtes HTTP : `Content-Security-Policy`, `X-XSS-Protection` pour mitiger les XSS.
- Token bucket Redis partagé entre plusieurs instances d'API Gateway pour un rate limiting cohérent.

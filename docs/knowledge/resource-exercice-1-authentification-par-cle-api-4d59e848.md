---
id: resource-exercice-1-authentification-par-cle-api-4d59e848
slug: resource-exercice-1-authentification-par-cle-api-4d59e848
source_key: 'sha256:4d59e84832818e4921e9eb7407bbedfbc5a9ffdd8d44eb492e95771463859aec'
part_of: null
order: null
manifest: null
derived_from: 'sha256:4d59e84832818e4921e9eb7407bbedfbc5a9ffdd8d44eb492e95771463859aec'
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
  - jwt
  - xss
  - sql-injection
  - rate-limiting
  - https
  - rest-api
domain: security
---
# Exercice 1 : Authentification par clé API

## Summary

Synthèse d'un TP sur la sécurisation des API REST couvrant cinq thèmes : authentification par clé API, JWT et rôles, injections et XSS, rate limiting, et bonnes pratiques générales (authn vs authz, HTTPS, défense en profondeur).

## Fields/API

**name**: Clé API — faiblesses
**value**: Mot de passe unique partagé, sans expiration ni périmètre. Réutilisable par quiconque l'intercepte. Souvent transmise en clair si HTTPS absent.
**name**: Clé API — renforcement
**value**: HTTPS obligatoire ; rotation et expiration ; scopes par utilisateur/IP ; stockage serveur en hash uniquement ; signature HMAC + timestamp anti-rejeu ; rate limiting + journalisation.
**name**: JWT signé (JWS) vs chiffré (JWE)
**value**: JWS : intégrité et origine garanties, contenu lisible. JWE : contenu illisible sans clé. Les deux peuvent être combinés (signer puis chiffrer).
**name**: Données sensibles dans un JWT
**value**: Déconseillé : le JWT standard n'est pas chiffré, peut être stocké en navigateur ou dans les logs. Contenir uniquement des informations minimales non confidentielles ; données sensibles côté serveur ou sous JWE.
**name**: Injection SQL vs XSS
**value**: SQL injection : cible le serveur, exécute des commandes sur la base de données. XSS : cible le navigateur, exécute du JavaScript dans la page de l'utilisateur. Les deux exploitent des entrées non filtrées sur des couches différentes.
**name**: Validation côté client
**value**: Insuffisante seule : contournable par requête manuelle ou outil. La validation serveur est obligatoire car c'est le seul point de contrôle réel des données reçues.
**name**: Bonnes pratiques anti-injection/XSS
**value**: Valider et filtrer les entrées côté serveur ; requêtes paramétrées (SQL) ; échappement avant affichage (XSS) ; en-têtes HTTP de sécurité (CSP, X-XSS-Protection).
**name**: Rate limiting — rôle
**value**: Empêche la surcharge du serveur et les attaques DoS en limitant le nombre de requêtes par intervalle. Garantit la disponibilité pour tous les utilisateurs.
**name**: Rate limiting — architecture distribuée
**value**: Compteurs centralisés dans une base partagée (ex. Redis) ; identifiant unique (clé API, user, IP) ; algorithmes token bucket ou sliding window ; contrôle au niveau du proxy/API Gateway ; journalisation des dépassements.
**name**: Authentification vs Autorisation
**value**: Authentification : vérifier l'identité (qui est l'utilisateur). Autorisation : vérifier les droits (ce qu'il peut faire).
**name**: Rôle de HTTPS
**value**: Confidentialité et intégrité des échanges client-serveur ; authentification du serveur via certificat ; empêche l'interception et la modification des données en transit.
**name**: Défense en profondeur
**value**: Combiner : authentification (identité) + autorisation (droits) + validation/filtrage (injections) + rate limiting (abus). Chaque mécanisme couvre un risque distinct ; leur combinaison constitue la défense en profondeur.

## Constraints

- La validation côté client ne remplace jamais la validation serveur.
- Un JWT standard ne doit jamais contenir de données sensibles (non chiffré par défaut).
- Les clés API doivent être stockées sous forme de hash côté serveur, jamais en clair.
- HTTPS est un prérequis à tout mécanisme d'authentification par clé API.
- En architecture distribuée, le compteur de rate limiting doit être centralisé (sinon contournable par changement de nœud).

## Examples

- Rotation de clé API : générer une nouvelle clé, invalider l'ancienne, notifier le client — sans changer le reste de l'API.
- JWT minimal : payload contient uniquement `sub` (identifiant utilisateur), `role`, `exp` — aucun mot de passe, email, ni donnée personnelle.
- Requête paramétrée SQL (Python) : `cursor.execute('SELECT * FROM users WHERE id = ?', (user_id,))` — jamais de concaténation de chaînes.
- Rate limiting Redis : incrémenter une clé `ratelimit:<api_key>:<minute>` avec TTL 60 s ; bloquer si valeur > seuil.
- En-tête CSP : `Content-Security-Policy: default-src 'self'` — bloque les scripts injectés depuis des origines externes.

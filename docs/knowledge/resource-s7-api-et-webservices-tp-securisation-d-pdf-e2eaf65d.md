---
id: resource-s7-api-et-webservices-tp-securisation-d-pdf-e2eaf65d
slug: resource-s7-api-et-webservices-tp-securisation-d-pdf-e2eaf65d
source_key: 'sha256:e2eaf65d814504c23eb233b0e8aa7ec464d6e5c25932fbb0c4106e8b60d0579a'
part_of: resource-s7-api-et-webservices-db2dc739
order: 6
manifest: null
derived_from: 'sha256:e2eaf65d814504c23eb233b0e8aa7ec464d6e5c25932fbb0c4106e8b60d0579a'
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
# S7 - api et webservices — TP Sécurisation d.pdf

## Summary

Synthèse d'un TP universitaire sur la sécurisation d'API REST, couvrant cinq thèmes : clé API, JWT, injections/XSS, rate limiting, et bonnes pratiques générales d'authentification/autorisation.

## Fields/API

**name**: Clé API — faiblesses
**value**: Mot de passe unique partagé sans expiration ni périmètre. Transmise en clair si HTTP. Expose au rejeu et à l'usurpation si leakée (code, logs, réseau).
**name**: Clé API — renforcements
**value**: HTTPS obligatoire ; rotation + expiration des clés ; scope par utilisateur/IP ; stockage côté serveur en hash uniquement ; signature HMAC + timestamp anti-rejeu ; rate limiting + journalisation.
**name**: JWT signé (JWS) vs chiffré (JWE)
**value**: JWS : intégrité et authenticité garanties, contenu lisible. JWE : contenu confidentiel, illisible sans clé. Combinaison possible (signer puis chiffrer).
**name**: Données sensibles dans un JWT
**value**: Interdit : le JWT standard n'est pas chiffré, il peut être stocké en navigateur ou dans des logs. Ne contenir que des informations minimales et non confidentielles ; données sensibles restent côté serveur ou dans un JWE.
**name**: Injection SQL vs XSS
**value**: SQL injection : cible le serveur, exécute des commandes sur la base de données. XSS : cible le navigateur, injecte du JavaScript dans la page d'un autre utilisateur. Les deux exploitent des entrées non filtrées sur des couches différentes.
**name**: Bonnes pratiques anti-injection/XSS
**value**: Validation + filtrage côté serveur (la validation client est contournable). Requêtes paramétrées contre SQL injection. Échappement du contenu avant affichage contre XSS. En-têtes HTTP : CSP, X-XSS-Protection.
**name**: Rate limiting — rôle
**value**: Protège la disponibilité en empêchant la surcharge par un utilisateur ou un script (DoS). Garantit l'accès aux ressources pour tous les utilisateurs.
**name**: Rate limiting — architecture distribuée
**value**: Centraliser le comptage dans un store partagé (ex. Redis) ; identifier par clé API, utilisateur ou IP ; algorithme token bucket ou sliding window ; contrôle au niveau du proxy/API Gateway ; journaliser les dépassements et ajuster les seuils.
**name**: Authentification vs Autorisation
**value**: Authentification : vérifie l'identité (qui est l'utilisateur). Autorisation : détermine les droits d'accès (ce que l'utilisateur peut faire).
**name**: HTTPS — rôle
**value**: Assure confidentialité et intégrité des échanges client-serveur ; authentifie le serveur via certificat. Empêche interception et modification des données en transit.
**name**: Défense en profondeur
**value**: Combiner plusieurs mécanismes car chacun couvre un risque distinct : authentification (identité), autorisation (droits), validation/filtrage (injections), rate limiting (abus). L'ensemble forme une défense en profondeur.

## Constraints

- La validation côté client seule est insuffisante : elle peut être contournée par des requêtes manuelles ou des outils externes.
- Un JWT non chiffré (JWS seul) ne doit jamais contenir de données confidentielles.
- Le rate limiting distribué requiert un store centralisé partagé entre toutes les instances — un compteur local par instance est inefficace.
- HTTPS est un prérequis, pas une option : toute clé ou token transmis en HTTP est compromis.

## Examples

- Stockage de clé API : sauvegarder SHA-256(clé) côté serveur, envoyer la clé brute uniquement à la création.
- Rate limiting Redis : incrémenter un compteur clé `ratelimit:{userId}:{minute}` avec TTL de 60 s, bloquer si > seuil.
- Requête paramétrée SQL (Python) : `cursor.execute('SELECT * FROM users WHERE id = ?', (user_id,))` — jamais d'interpolation de chaîne.
- En-tête CSP minimal : `Content-Security-Policy: default-src 'self'; script-src 'self'`.

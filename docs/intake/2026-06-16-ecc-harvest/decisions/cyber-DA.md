# ECC Harvest — décisions cluster `cyber:api-security` (lot DA)

Doer: lot DA (8 skills). Worktree `maos-ecc`. Méthode: intake-audit barre LARGE (T1, library).
Source cyber: `mukul975/Anthropic-Cybersecurity-Skills` (Apache-2.0). Cible: `packages/skills/library/<slug>/SKILL.md`.
Dedup contre `our-assets-index.md` + recoupe `mas-sec-reviewer` / CLAUDE.md §5 (posture API, rate-limit, allowlist réseau).
Nature du lot: skills **DÉFENSIFS** (blue-team) de sécurité API — détection, mitigation, secure-implement.
Le frontmatter source porte `subdomain: api-security` + `frameworks` NIST-CSF/MITRE-ATTACK (et NIST-AI-RMF/ATLAS
pour `implementing-api-key-security-controls`) : mappings préservés dans la metadata MAS.
Garde-fou défensif appliqué à chaque skill : lentille détection+mitigation+durcissement gardée ;
tout payload offensif exécutable (scanner actif BOPLA, etc.) reframé en guidance défensive, jamais en exploit.
Sanitize: 0 secret réel, 0 PII, 0 `@anthropic-ai/sdk` dans les 8 sources. Recadrage transverse §11 : tout
chiffre = quota d'abonnement, jamais $/€ (les sources n'utilisaient pas de cash, recadrage léger).

---

## detecting-api-enumeration-attacks
- **décision**: adapt
- **raison**: détection défensive BOLA/IDOR (OWASP API1:2023) — repérage des trois formes d'énumération (IDs séquentiels, UUID moissonnés-puis-réutilisés, tampering `user_id`) via signaux SIEM (IDs distincts/fenêtre, mix 200/401/403, vélocité > baseline, accès hors scope). Nourrit la lentille posture-API de `mas-sec-reviewer` + §5.
- **dedup**: non — `mas-sec-reviewer` est une gate générique §5; aucun skill de détection d'énumération API dans notre surface. Angle distinct = forme d'attaque dans les logs, pas autorisation per-task.
- **garde-fou défensif**: le Python source parse des logs hors-ligne (détecteur), pas un client d'attaque; reformulé explicitement read-only/offline.
- **chemin library**: `packages/skills/library/detecting-api-enumeration-attacks/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` NIST-CSF/MITRE-ATTACK préservé + Prompt Defense Baseline; 7 sections §12 réécrites défensives; 0 secret, 0 sdk, 0 chiffre cash).


## detecting-broken-object-property-level-authorization
- **décision**: adapt (scanner actif strippé → audit défensif)
- **raison**: détection+mitigation BOPLA (OWASP API3:2023) — Excessive Data Exposure (champs sensibles `password_hash`/`ssn`/`role` qui fuient en réponse) + Mass Assignment (injection `role`/`is_admin`/`balance` dans le body). Détection = comparaison champs-réponse vs allowlist par rôle + revue schéma (`additionalProperties:false`) + flag introspection GraphQL.
- **dedup**: non — distinct de `detecting-api-enumeration-attacks` (object-level) et de `mas-sec-reviewer` (gate générique). Angle = autorisation au niveau propriété.
- **garde-fou défensif (§5)**: la source embarque un SCANNER ACTIF qui envoie des mutations PUT/PATCH/POST. Machinerie reframée en guidance: audit read-only des réponses + revue schéma sur systèmes possédés; AUCUNE requête mutante sortante depuis MAOS vers un système tiers (§5 gate/interdit). Le test de mutation reste l'affaire du propriétaire.
- **chemin library**: `packages/skills/library/detecting-broken-object-property-level-authorization/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` NIST-CSF/MITRE-ATTACK préservé + Prompt Defense Baseline; 7 sections §12 défensives; mitigation = allowlists serializer read/write; 0 secret, 0 sdk, 0 cash).

## detecting-shadow-api-endpoints
- **décision**: adapt
- **raison**: inventaire+gouvernance défensifs des shadow/zombie APIs (endpoints hors du set documenté/sécurisé). Trois méthodes sur actifs possédés: diff trafic-observé vs spec OpenAPI, mining des routes en source (Express/Flask/Django/Spring), énumération des surfaces cloud (API GW, Lambda URLs, ALB). Risk-rank par auth-absente/trafic/sources/méthodes-write/tokens-sensibles. Gouvernance gateway (404 des routes non-enregistrées).
- **dedup**: non — angle attack-surface/inventaire absent de notre surface; complète `mas-sec-reviewer` (quelle surface API un projet externe expose réellement) + §5.
- **garde-fou défensif**: découverte = réconciliation owner-scoped de SES PROPRES logs/source/cloud, jamais du probing de systèmes tiers; explicité dans Principles + Red Flags.
- **chemin library**: `packages/skills/library/detecting-shadow-api-endpoints/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` préservé + Prompt Defense Baseline; 7 sections §12 défensives; 0 secret, 0 sdk, 0 cash).

## implementing-api-abuse-detection-with-rate-limiting
- **décision**: adapt
- **raison**: rate limiting défensif comme contrôle anti-abus — token bucket / sliding window / limiteur adaptatif (score comportemental client → threat level → resserrement+blocage temporaire). Store distribué (Redis) + Lua atomique (limites tenues cross-instances). Défend brute-force/credential-stuffing/scraping/épuisement. 429 + Retry-After + X-RateLimit-* systématiques; limite per-credential.
- **dedup**: non — chevauche `implementing-api-rate-limiting-and-throttling` mais angle distinct (DÉTECTION d'abus + adaptatif threat-level vs throttling/quotas par tier). Complète `mas-sec-reviewer` + §5.
- **garde-fou défensif**: skill = construire le limiteur, PAS générer de charge; "no load test against a system you do not own" explicité. DDoS mentionné = ce qu'on PRÉVIENT, jamais ce qu'on cause.
- **chemin library**: `packages/skills/library/implementing-api-abuse-detection-with-rate-limiting/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` préservé + Prompt Defense Baseline; 7 sections §12 défensives; 0 secret, 0 sdk, 0 cash).

## implementing-api-gateway-security-controls
- **décision**: adapt
- **raison**: durcissement défensif de la couche gateway (Kong/AWS API GW/Azure APIM/Apigee/Envoy) comme point d'enforcement central — JWT/OAuth2 TTL court, rate-limit per-credential, validation OpenAPI (`additionalProperties:false`), IP-allowlist admin, mTLS, headers sécu (HSTS/CSP/nosniff), WAF, logging d'événements sécu (alarmes 401/403/429/5xx). Defense in depth: gateway nécessaire, pas suffisant — backends autorisent/valident aussi.
- **dedup**: non — angle edge-enforcement centralisé absent de notre surface; complète `mas-sec-reviewer` + §5 (posture API, allowed_hosts, headers). Recoupe rate-limit mais ici c'est la config gateway complète.
- **garde-fou défensif**: skill = configurer les contrôles, pas rechercher des bypass; erreurs non-verbeuses pour ne pas fuiter l'architecture; "not the sole layer" martelé.
- **chemin library**: `packages/skills/library/implementing-api-gateway-security-controls/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` préservé + Prompt Defense Baseline; 7 sections §12 défensives; placeholders ARN/cert d'exemple uniquement; 0 secret réel, 0 sdk, 0 cash).

## implementing-api-key-security-controls
- **décision**: adapt
- **raison**: durcissement défensif du cycle de vie des clés API — génération 256-bit préfixée (`sk_live_`/`sk_test_`) pour détecter les fuites, stockage hash-SHA256-only (jamais plaintext), scoping endpoints/IP/rate, rotation grace-window zéro-downtime, révocation immédiate cache-invalidante, détection de fuite (GitHub secret scanning/gitleaks) + auto-révocation. Porte des tags AI-security (NIST-AI-RMF + MITRE ATLAS) → prioritaire pour `mas-sec-reviewer`.
- **dedup**: non — gestion de secrets/credentials API absente de notre surface; complète §5 (handling secrets) + `mas-sec-reviewer`.
- **recadrage §11**: note explicite — MAOS s'authentifie via abonnement, jamais via clé committée; ce skill protège les clés d'un PROJET EXTERNE, pas une PAYG MAOS. Aucun `ANTHROPIC_API_KEY`.
- **garde-fou défensif**: protection de credentials, jamais harvest/abus; clés hors URL, jamais plaintext.
- **chemin library**: `packages/skills/library/implementing-api-key-security-controls/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` NIST-CSF/MITRE-ATTACK/NIST-AI-RMF/ATLAS préservé + Prompt Defense Baseline; 7 sections §12 défensives; préfixes d'exemple = placeholders, 0 secret réel, 0 sdk, 0 cash).

## implementing-api-rate-limiting-and-throttling
- **décision**: adapt
- **raison**: implémentation défensive rate limiting/throttling — algos token-bucket/sliding-window/fixed-window, scopes par user/IP/endpoint + quotas tiered (free/premium/enterprise) + plancher auth-endpoint plus strict. Distribué via store partagé + Lua atomique (limites tenues cross-instances), 429 + Retry-After + X-RateLimit-* systématiques. Ne pas trust `X-Forwarded-For` non-validé.
- **dedup**: chevauche `implementing-api-abuse-detection-with-rate-limiting` — gardés distincts: ICI = ALGOS + quotas multi-tier + mécanique d'enforcement distribué; LÀ = DÉTECTION comportementale + adaptatif threat-level. Cadrage explicite dans l'Overview.
- **garde-fou défensif**: skill = construire le limiteur, pas générer de charge; "no load test against a system you don't own".
- **chemin library**: `packages/skills/library/implementing-api-rate-limiting-and-throttling/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` préservé + Prompt Defense Baseline; 7 sections §12 défensives; 0 secret, 0 sdk, 0 cash).

## implementing-api-schema-validation-security
- **décision**: adapt
- **raison**: validation de schéma défensive (OpenAPI 3.x / JSON Schema comme contrat sécu) — `additionalProperties:false` bloque le mass assignment, champs typés/bornés/pattern-allowlist/enum bloquent injection+DoS, validation des RÉPONSES contre un schéma de sortie bloque la fuite de données, `readOnly` forcé côté serveur. Enforcement double couche (gateway blocking + modèles in-app stricts) + shift-left CI (lint Spectral + contract tests Dredd). Table d'anti-patterns.
- **dedup**: non — recoupe la validation OAS de `implementing-api-gateway-security-controls` mais angle distinct = le contrat de schéma lui-même (request+response, anti-patterns, shift-left), pas la config gateway. Complète `mas-sec-reviewer` + §5.
- **garde-fou défensif**: skill = spécifier/câbler la validation, jamais crafter des payloads d'injection; "complète, ne remplace pas" les requêtes paramétrées + output encoding; erreurs non-verbeuses.
- **chemin library**: `packages/skills/library/implementing-api-schema-validation-security/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` préservé + Prompt Defense Baseline; 7 sections §12 défensives; 0 secret, 0 sdk, 0 cash).

---

### Récap
- 8/8 keepers (tous `adapt`). 0 reject. Lot 100% défensif (blue-team API-security).
- Garde-fou défensif appliqué partout: lentille détection+mitigation+secure-implement gardée;
  tout angle offensif strippé — notamment `detecting-broken-object-property-level-authorization`
  dont le SCANNER ACTIF (mutations PUT/PATCH/POST) a été reframé en audit read-only sur systèmes
  possédés (aucune requête mutante sortante MAOS vers tiers, §5). Détecteurs (énumération, shadow)
  cadrés read-only/offline/owner-scoped.
- Frameworks préservés dans la metadata: NIST-CSF + MITRE-ATTACK sur les 8;
  `implementing-api-key-security-controls` ajoute NIST-AI-RMF + MITRE-ATLAS (signal AI-security
  → prioritaire pour la doctrine sécurité-agent de `mas-sec-reviewer`).
- Recadrage §11 transverse: 0 chiffre cash (les sources n'en avaient pas), tuning = quota d'abonnement.
  Note explicite sur `implementing-api-key-security-controls`: MAOS s'authentifie par abonnement,
  jamais via clé committée; le skill protège les clés d'un projet externe.
- Tous nourrissent `mas-sec-reviewer` + la lentille §5 (posture API, rate-limit, allowed_hosts, secrets).
- Garde-fous techniques: 0 `@anthropic-ai/sdk`, 0 secret réel/PII dans les 8 outputs (préfixes/ARN/cert = placeholders).

# ECC Harvest — décisions cluster `cyber:web-application-security` (lot X)

Doer: lot web-application-security (8 source slugs). Worktree `maos-ecc`. Méthode: intake-audit, barre défensive (T1, library, OWASP/CWE/MITRE préservés).
Source: `mukul975/Anthropic-Cybersecurity-Skills` (Apache-2.0), clone read-only `/tmp/cybersec-inspect/skills/<slug>/SKILL.md`. Cible: `packages/skills/library/<slug>/SKILL.md`.

## Garde-fou appliqué (transverse aux 8)

Ces skills sont des **playbooks de test de vulnérabilité / d'évaluation de sécurité sur sa propre application autorisée** — donc majoritairement défensifs. Décision de cadrage uniforme:

- **KEEP**, recadré « authorized-scope-only »: aucune cible sans autorisation écrite; toute requête active contre une cible réelle = `risk:high` (et `risk:blocking` pour SSRF / batch-auth-bypass / flooding) gatée humain (§5).
- **Strip des payloads d'exploitation fonctionnels** des sources → on garde la **méthode + l'oracle (matrice/contraintes/schéma) + la remédiation** (encodage contextuel, CSP, autorisation server-side, allowlists, rate-limiting, rotation de secrets). Les boucles `curl`/`ffuf`/`hashcat`/`jwt_tool`, les scripts de forge de token, les payloads XSS vivants (cookie-theft/keylogger/exfil), les requêtes DoS GraphQL et les arrays de brute-force ont été retirés.
- **§11**: tout chiffre = unités de quota d'abonnement, jamais $/€. Tout secret découvert = *smell à rotater*, jamais à réutiliser. Aucune mention `@anthropic-ai/sdk` (absente des sources, non réintroduite).
- **§12**: chaque keeper = ligne 1 `---`, commentaire source, summary L1, metadata complet (frameworks OWASP/CWE/NIST/MITRE préservés depuis le frontmatter source + enrichis CWE pertinents), `## Prompt Defense Baseline` VERBATIM, puis les 7 sections §12 (Overview / When to Use / Principles+source / Process / Rationalizations / Red Flags / Verification Criteria).
- Sanitize secrets/PII/internal: 8/8 sources clean (les seules valeurs « secrètes » des sources étaient des placeholders d'exploit, retirés).

L'audit pouvait dire `reject` (critère KILL: arme pure sans valeur défensive). Aucune des 8 ne tombe dans ce cas — ce sont des évaluations sécurité défendables. Une seule paire est un doublon → fold.

---

## testing-for-broken-access-control
- **décision**: adapt (keep, recadrage défensif)
- **raison**: discipline OWASP A01 — matrice endpoint×rôle comme oracle, vérification autorisation server-side sur 4 axes (escalade verticale, IDOR horizontal, function-level, isolation multi-tenant) + mass-assignment. Forte valeur défensive: alimente `mas-sec-reviewer` et la doctrine §5. Payloads `curl`/`ffuf` d'escalade retirés; matrice + méthode + remédiation (middleware d'autorisation centralisé, ownership checks, allowlists, audit logging) gardés.
- **dedup**: non — distinct de `bypassing-authentication-with-forced-browsing` (auth) et `exploiting-idor-vulnerabilities` (offensif déjà en lib); ici = posture défensive matrice-oracle complète.
- **chemin library**: `packages/skills/library/testing-for-broken-access-control/SKILL.md`
- **état**: écrit, conforme §12 (8 sections, Prompt Defense Baseline VERBATIM, 0 payload, 0 secret, 0 sdk).

## testing-for-business-logic-vulnerabilities
- **décision**: adapt (keep, recadrage défensif)
- **raison**: OWASP A04 Insecure Design — flaws invisibles aux scanners (prix client-trusted, quantités négatives/overflow, skip d'étapes, race conditions sur ressources limitées, abus coupon/referral). Oracle = workflow documenté + contraintes. Payloads de manipulation financière (`curl` prix/total, boucles de race-flooding) retirés; carte de workflow + remédiation server-authoritative (calcul server-side, transactions atomiques, idempotency keys, single-use, rate-limit) gardés.
- **dedup**: non — pas de skill « business logic » défensif existant en lib; complémentaire de broken-access-control (axe règles métier vs axe autorisation).
- **chemin library**: `packages/skills/library/testing-for-business-logic-vulnerabilities/SKILL.md`
- **état**: écrit, conforme §12.

## testing-for-sensitive-data-exposure
- **décision**: adapt (keep, recadrage défensif)
- **raison**: OWASP A02 — fuite de secrets (bundles JS, source maps), sur-exposition d'API (hash de mot de passe, SSN, carte complète, ids internes), PII non-masquée, transport faible, storage navigateur insécure, `.git` exposé. **Alignement §11 fort**: un secret trouvé = smell à rotater, pas à réutiliser. Pipelines de grep de secrets et `git-dumper` (exfiltration) retirés → détection + remédiation (rotation, filtrage de champs, masking, `no-store`, TLS, secret-scanning CI).
- **dedup**: non — `detecting-aws-credential-exposure-with-trufflehog` est cloud-spécifique; `implementing-secret-scanning-with-gitleaks` est build-time; ici = balayage exposition côté web-app à l'exécution.
- **chemin library**: `packages/skills/library/testing-for-sensitive-data-exposure/SKILL.md`
- **état**: écrit, conforme §12.

## testing-for-xss-vulnerabilities-with-burpsuite
- **décision**: adapt (keep — garde-fou explicite: « authorized testing — strip live payloads to detection+CSP/output-encoding remediation »)
- **raison**: OWASP A03 injection — réflexion/stockage/sink DOM + contexte de sortie. **Recadrage de sécurité clé**: détection via *canary inerte non-exécutant* (pas de payload fonctionnel) → prouve le gap sans livrer d'exploit. Payloads vivants (`<script>alert>`, `<img onerror>`, cookie-theft, keylogger, screenshot, gadgets de bypass CSP) **retirés**; classification source→sink + remédiation (encodage contextuel, CSP nonce strict, DOMPurify, cookies HttpOnly/Secure, nosniff) gardés.
- **dedup**: non — pas de skill XSS défensif en lib (les `defending-against-*` couvrent SSRF/proto-pollution/race/template/type-juggling/websocket, pas XSS).
- **chemin library**: `packages/skills/library/testing-for-xss-vulnerabilities-with-burpsuite/SKILL.md`
- **état**: écrit, conforme §12; design « inert canary, no weaponized output » inscrit dans Principles + Red Flags + Verification.

## testing-for-json-web-token-vulnerabilities
- **décision**: **fold** → `testing-jwt-token-security` (canonique)
- **raison**: doublon quasi-identique. Mêmes attaques que la canonique: `alg:none` (+casings), confusion d'algorithme RS256→HS256, injection `kid`/`jku`/`x5u`, brute-force de secret HMAC faible, claim tampering. La canonique `testing-jwt-token-security` est **plus riche** (ajoute la profondeur de claim-manipulation ET le test de lifetime/revocation `exp`/`nbf`/logout/password-change), donc elle absorbe celle-ci.
- **dedup**: oui — DUP confirmé par lecture comparée des deux bodies.
- **chemin library**: aucun (foldé). Cible du fold: `testing-jwt-token-security`. Tracé dans le frontmatter (`folds: [...]`) et un commentaire `<!-- folds: ... -->` de la canonique.
- **état**: foldé, pas de fichier propre écrit (conforme à la consigne dedup).

## testing-jwt-token-security
- **décision**: adapt (keep, recadrage défensif — **canonique JWT** du lot)
- **raison**: surface JWT/JWS/JWE — toutes les fautes côté *vérification* (trust de l'en-tête `alg`, clé publique comme secret HMAC, secret faible, pointeurs de clé `kid`/`jku`/`x5u`, claims non-vérifiés, expiry/revocation manquants). Reçoit le fold de `testing-for-json-web-token-vulnerabilities`. Scripts de forge `jwt_tool`/PyJWT et commandes `hashcat`/`john` retirés → revue de config + remédiation (allowlist d'algorithme rejetant `none`, gestion de clés asymétriques, secrets 256-bit+ aléatoires, validation/ignore de `kid`/`jku`/`x5u`, validation complète des claims, expiry court + revocation). Secret faible découvert = smell à rotater (§11).
- **dedup**: absorbe `testing-for-json-web-token-vulnerabilities`. Distinct de `exploiting-jwt-algorithm-confusion-attack` (offensif, déjà en lib) et `implementing-jwt-signing-and-verification` (build-time); ici = évaluation défensive + remédiation de la vérification.
- **chemin library**: `packages/skills/library/testing-jwt-token-security/SKILL.md`
- **état**: écrit, conforme §12; `folds: [testing-for-json-web-token-vulnerabilities]` en metadata + commentaire source de fold.

## testing-api-security-with-owasp-top-10
- **décision**: adapt (keep, recadrage défensif)
- **raison**: passe de largeur structurée par l'OWASP API Security Top 10 (2023) — API1 BOLA … API10 unsafe consumption. Cartographie de surface (spec + endpoints + versions) puis checklist d'enforcement server-side. Boucles `ffuf` de brute-force, payloads SSRF vers 169.254.169.254, boucles de flooding OTP retirés → détection + remédiation. **SSRF (API7) et probes de consommation/sensitive-flow (API4/API6) marqués `risk:high|blocking`** (atteignent l'infra interne) — gate humain.
- **dedup**: non — c'est la passe transverse Top-10; pointe vers les skills focalisés (`testing-jwt-token-security`, `performing-graphql-security-assessment`) pour la profondeur. Les `testing-api-for-*` existants en lib couvrent un seul risque chacun; celui-ci les chapeaute.
- **chemin library**: `packages/skills/library/testing-api-security-with-owasp-top-10/SKILL.md`
- **état**: écrit, conforme §12; SSRF/rate-bypass flaggés blocking dans Process + Red Flags + Verification.

## performing-graphql-security-assessment
- **décision**: adapt (keep, recadrage défensif)
- **raison**: risques propres à GraphQL — fuite d'introspection en prod (+ GraphiQL/Playground), autorisation au niveau **champ** (pas type), injection via arguments (sinks SQL/NoSQL/SSRF/stored-XSS), DoS depth/complexity/fragment-cycle/batch, et **batching** qui bypass le rate-limit per-HTTP-request sur login/OTP. Payloads d'injection vivants, requêtes DoS imbriquées/largeur/fragment-cycle, arrays de brute-force batch retirés → détection + remédiation (désactiver introspection prod, field-level auth, resolvers paramétrés + egress allowlist, depth/complexity limits, rate-limit batch). **Batch-auth-bypass + SSRF marqués `risk:high|blocking`** — gate humain.
- **dedup**: non — `performing-graphql-introspection-attack` et `performing-graphql-depth-limit-attack` (offensifs, déjà en lib) couvrent un vecteur chacun; ici = évaluation défensive complète GraphQL, complément de profondeur du Top-10 API.
- **chemin library**: `packages/skills/library/performing-graphql-security-assessment/SKILL.md`
- **état**: écrit, conforme §12.

---

## Bilan lot X

- 8 source slugs couverts (aucun omis).
- **7 keepers** écrits en `packages/skills/library/` (adapt/recadrage défensif).
- **1 fold** (`testing-for-json-web-token-vulnerabilities` → `testing-jwt-token-security`).
- 0 reject (aucune arme pure: ce sont des évaluations sécurité sur app autorisée).
- Garde-fous: authorized-scope-only, payloads d'exploit strippés, SSRF/batch-auth-bypass/flooding = `risk:high|blocking` §5, secrets = smells à rotater §11, frameworks OWASP/CWE/NIST/MITRE préservés, Prompt Defense Baseline VERBATIM, 0 `@anthropic-ai/sdk`.
- HARD respecté: aucune édition de `ledger.tsv`, aucun `git add/commit/push`, écritures limitées aux 7 dossiers library du lot + ce shard.

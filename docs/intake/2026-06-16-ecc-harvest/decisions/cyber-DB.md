# ECC Harvest — décisions cluster `cyber:api-security` (lot DB)

Doer : lot DB (8 skills). Worktree `maos-ecc` (branche `phase/ecc-harvest`). Méthode : `intake-audit`, barre LARGE T1 défensif.
Source : `mukul975/Anthropic-Cybersecurity-Skills` (clone read-only, Apache-2.0), sous-domaine frontmatter `api-security`. Cible : `packages/skills/library/<slug>/SKILL.md`.

Garde-fou défensif (non négociable) : lentille blue-team — détection, mitigation, implémentation sécurisée, TESTS de sécurité AUTORISÉS uniquement. Rejet (KILL) de toute arme/ciblage de masse/DoS/évasion à usage malveillant. Cadrage systématique « test-then-harden » : le livrable est le rapport de finding + la remédiation, jamais l'exploitation.

Recadrage transverse : MAOS = abonnement (§11), PAS de coût per-token PAYG ; tout chiffre = unités de quota, jamais $/€. Les findings critiques/blocking routent vers `mas-sec-reviewer` (§5). État MAOS dans `data/` (§8).

Sanitize (regex secrets/PII/internal) : 8/8 sources clean. `@anthropic-ai/sdk` : absent des 8 sources (aucun import). `frameworks` préservés depuis le frontmatter source (NIST CSF + MITRE ATT&CK).

Dedup : aucune collision de noms ECC↔cyber (cf. `cybersec-clusters.md` §collisions = vide). Le cluster `cyber:api-security` est distinct du cluster `skill:core-token` déjà traité (lentille posture/test API vs gouvernance quota).

Bilan lot DB : **8 keepers / 8** (0 reject). Toutes les 8 sont défensives sous la lentille test-then-harden : 3 implémentation/secure-config (SPM, 42Crunch, Apigee), 1 inventaire/attack-surface (auth écrite requise), 4 tests de sécurité autorisés (Postman, auth, BOLA, mass-assignment) — livrable = finding + remédiation. Aucune n'est weaponization/DoS/évasion. La plus dual-use (`testing-api-authentication-weaknesses`, JWT forge/brute-force) est gardée mais le corps §12 boosté recadre fermement vers test-then-harder et retire la spécificité weaponisable (pas de wordlist de brute-force dans le corps).

---

## implementing-api-security-posture-management
- **décision** : adapt (keeper, library)
- **raison** : posture défensive continue (API-SPM) — inventaire vivant de toutes les API (internal/external/partner/shadow/deprecated), évaluation des contrôles par endpoint (auth, TLS, rate-limit, CORS, headers, validation), score de risque composite *déterministe* (gaps × sévérité × multiplicateur de classification + pénalités doc/données sensibles, normalisé 0–100), enforcement de policies déclaratives shift-left. Lentille monitoring blue-team qui nourrit `mas-sec-reviewer` + gating §5. Aucune exploitation.
- **dedup** : non — `mas-sec-reviewer` est un *gate* par tâche ; ici on construit la *surface de visibilité* (inventaire + scoring continu) que le gate consomme. Distinct aussi de `context-budget` (surface de prompt, pas surface API).
- **chemin library** : `packages/skills/library/implementing-api-security-posture-management/SKILL.md`
- **état** : boosté, conforme exemplar (ligne 1 = `---`, commentaire source, summary L1, metadata complet + `frameworks` NIST/MITRE, 8 sections = Prompt Defense Baseline + 7 §12, 0 `@anthropic-ai/sdk`, 0 secret). Scoring recadré déterministe (économie quota §11) ; regex données sensibles = flag de catégorie, jamais persistance de la valeur (§5/§8).

## implementing-api-security-testing-with-42crunch
- **décision** : adapt (keeper, library)
- **raison** : tests de sécurité API pilotés par le contrat — API Audit statique d'une définition OpenAPI (score 0–100, 300+ checks), Conformance Scan dynamique contre l'API en vie (OWASP API Top 10), enforcement runtime via API Protect, le tout câblé shift-left en CI/CD avec gate min-score fail-closed. Lentille secure-design : durcir le contrat puis vérifier puis enforcer. Livrable = finding + remédiation, jamais exploitation.
- **dedup** : non — `42Crunch` audite la *spec* (contract-as-control) en amont ; `implementing-api-security-posture-management` inventorie et score la *surface runtime*. Complémentaires (statique-spec vs continu-surface), pas redondants.
- **chemin library** : `packages/skills/library/implementing-api-security-testing-with-42crunch/SKILL.md`
- **état** : boosté, conforme exemplar (ligne 1 = `---`, commentaire source, summary L1, metadata + `frameworks`, 8 sections, 0 sdk, 0 secret). Tokens 42Crunch = secrets référencés depuis le CI store, jamais inline (§5). Cadrage « target autorisé uniquement » explicite dans When-NOT + Red Flags.

## implementing-api-threat-protection-with-apigee
- **décision** : adapt (keeper, library)
- **raison** : protection défensive shield-right sur passerelle Apigee — PreFlow fail-closed (auth → SpikeArrest rate-limit → JSON/XML Threat Protection bornant la structure contre DoS/XXE → regex anti-injection → CORS), strip des headers de fingerprint + ajout headers de sécurité en réponse, Advanced API Security pour détection d'abus + deny IP. Périmètre protecteur sur passerelle *possédée*, jamais arme.
- **dedup** : non — `Apigee` configure un *perimeter runtime* (gateway policies) ; `42Crunch` audite la *spec/contract* ; `SPM` inventorie/score la *fleet*. Trois couches distinctes (contrat / passerelle / posture).
- **chemin library** : `packages/skills/library/implementing-api-threat-protection-with-apigee/SKILL.md`
- **état** : boosté, conforme exemplar (ligne 1 = `---`, commentaire source, summary L1, metadata + `frameworks` — 5 techniques ATT&CK dont T1078.004/T1530 préservées du source, 8 sections, 0 sdk, 0 secret). Cadrage « gateway possédée, pas de bypass » dans When-NOT + Red Flags. Frameworks NIST/MITRE préservés.

## performing-api-inventory-and-discovery
- **décision** : adapt (keeper, library)
- **raison** : visibilité défensive de la surface d'attaque (OWASP API9:2023) — catalogue complet des API *de l'org* (documentées + shadow + zombie), via 4 lanes (HAR passif, probing actif autorisé sur domaines possédés, extraction d'endpoints depuis le JS, inventaire cloud-gateway), normalisation + diff contre le catalogue documenté, flag des endpoints sans auth. Autorisation écrite = prérequis dur (gate §5). Map-then-flag, jamais exploitation.
- **dedup** : non — fournit l'*inventaire d'entrée* que `SPM` score en continu. SPM suppose l'inventaire ; ce skill le construit. Complémentaires.
- **chemin library** : `packages/skills/library/performing-api-inventory-and-discovery/SKILL.md`
- **état** : boosté, conforme exemplar (ligne 1 = `---`, commentaire source, summary L1, metadata + `frameworks`, 8 sections, 0 sdk, 0 secret). Recadrage défensif fort : autorisation écrite scoped = prérequis explicite (Principle 1 + Red Flags), artifacts dans `data/` (§8), secrets découverts flaggés par catégorie jamais stockés, pas d'exfiltration « pour prouver l'impact ».

## performing-api-security-testing-with-postman
- **décision** : adapt (keeper, library)
- **raison** : suite de régression sécurité répétable Postman/Newman couvrant OWASP API Top 10 — environnements multi-rôles (unauth/user/admin), auth dynamique via pre-request script (jamais de token en dur), assertions BOLA/broken-auth/data-exposure/BFLA/mass-assignment/rate-limit, exécution Newman en CI/CD avec fail-on-failure = gate de merge. Lentille « assertions, pas exploits ». Staging autorisé uniquement.
- **dedup** : non — orchestration de tests *assertion-based intégrés CI* (régression continue) ; distinct des testing-* mono-vuln (BOLA/auth/mass-assignment) qui sont la *méthode d'audit profonde* d'une vuln donnée. Postman = harnais de régression, les testing-* = playbooks d'audit.
- **chemin library** : `packages/skills/library/performing-api-security-testing-with-postman/SKILL.md`
- **état** : boosté, conforme exemplar (ligne 1 = `---`, commentaire source, summary L1, metadata + `frameworks`, 8 sections, 0 sdk, 0 secret). Recadrage : « l'assertion EST le finding, pas l'exfiltration » (Rationalizations + Red Flags) ; staging autorisé only ; honor Newman exit code ; reports dans `data/`.

## testing-api-authentication-weaknesses
- **décision** : adapt (keeper, library — recadrage défensif lourd, la plus dual-use du lot)
- **raison** : assessment d'auth API sous autorisation écrite + durcissement (OWASP API2:2023) — identification du mécanisme, scan endpoints sans auth, analyse *config* JWT (rejet alg:none, signature asymétrique, claims exp/iss/aud/iat/sub, pas de données sensibles en payload), cycle de vie des tokens (révocation logout/password-change, rotation refresh, pas de token en URL), policy mot de passe + résistance énumération. Lentille test-then-harden : chaque finding = remédiation.
- **dedup** : non — couvre spécifiquement la couche *authentification* (API2) ; BOLA = autorisation objet (API1), mass-assignment = propriété objet (API3), Postman = harnais de régression. Pas de chevauchement de profondeur.
- **chemin library** : `packages/skills/library/testing-api-authentication-weaknesses/SKILL.md`
- **garde-fou** : source la plus offensive (forge JWT alg:none, modification de claims, **brute-force de secret HMAC avec wordlist**, énumération). Sous la lentille « authorized security TESTING » du garde-fou, gardée — MAIS le corps §12 boosté **retire toute spécificité weaponisable** : pas de wordlist de brute-force, pas de forge-for-access (preuve = UNE assertion de control-gap, ex. alg:none accepté), pas de credential-stuffing. Principle 1 note explicitement l'omission délibérée. Le livrable est la config-assessment + le plan de durcissement (RS256, secret ≥256-bit, blacklist de révocation, TTL court + rotation, messages d'erreur uniformes).
- **état** : boosté, conforme exemplar (ligne 1 = `---`, commentaire source, summary L1, metadata + `frameworks`, 8 sections, 0 sdk, 0 secret). Autorisation écrite = gate §5 (Principle 1 + Red Flags) ; findings critiques → `mas-sec-reviewer`.

## testing-api-for-broken-object-level-authorization
- **décision** : adapt (keeper, library)
- **raison** : test BOLA/IDOR REST+GraphQL sous autorisation écrite + durcissement (OWASP API1:2023) — énumération des params object-ID, baseline 2 comptes de test fournis, vérification de l'autorisation par-objet via accès cross-account sur GET/PUT/PATCH/DELETE, parameter pollution, body-ID override, batch arrays, nested paths, method switching, GraphQL node IDs. Lentille test-then-harden : la preuve = UNE assertion (200 sur l'objet d'autrui) + remédiation server-side.
- **dedup** : non — couvre l'autorisation niveau-objet (API1) ; auth = API2, mass-assignment = API3. Spécifique.
- **chemin library** : `packages/skills/library/testing-api-for-broken-object-level-authorization/SKILL.md`
- **garde-fou** : recadrage défensif — comptes de test FOURNIS uniquement (jamais de vrais users), pas d'énumération séquentielle pour harvester, pas d'exfiltration « pour prouver l'échelle » (la preuve = une assertion). Fix = authz par-objet server-side + tests CI, pas juste des IDs opaques.
- **état** : boosté, conforme exemplar (ligne 1 = `---`, commentaire source, summary L1, metadata + `frameworks`, 8 sections, 0 sdk, 0 secret). Autorisation écrite = gate §5 ; findings critiques → `mas-sec-reviewer` ; reports dans `data/`.

## testing-api-for-mass-assignment-vulnerability
- **décision** : adapt (keeper, library)
- **raison** : test mass-assignment / auto-binding sous autorisation écrite (non-prod) + durcissement (OWASP API3:2023) — énumération des endpoints writable + champs attendus, injection de champs privilégiés (role/is_admin/balance/price/ownership/account-status + shapes Rails/Django/Mongoose/Spring), vérification du binding *par persistance* (re-fetch), confirmation. Lentille test-then-harden : preuve = UN champ privilégié persisté + remédiation allowlist/DTO ; revert de l'état injecté.
- **dedup** : non — couvre l'autorisation niveau-propriété d'objet (API3) ; BOLA = niveau-objet (API1), auth = API2. Spécifique.
- **chemin library** : `packages/skills/library/testing-api-for-mass-assignment-vulnerability/SKILL.md`
- **garde-fou** : recadrage défensif — non-prod autorisé only (les tests mutent la donnée), **revert obligatoire** de tout état privilégié posé (role/balance), preuve par persistance pas par 200, pas d'escalade via le rôle obtenu. Fix = allowlist/DTO server-side, jamais blocklist.
- **état** : boosté, conforme exemplar (ligne 1 = `---`, commentaire source, summary L1, metadata + `frameworks`, 8 sections, 0 sdk, 0 secret). Autorisation écrite = gate §5 ; findings critiques → `mas-sec-reviewer` ; reports dans `data/`.

---

## Bilan & cohérence cluster

8 keepers / 8, 0 reject. Le cluster `cyber:api-security` forme une chaîne défensive cohérente : **inventaire** (discovery) → **posture** (SPM) → **contrat** (42Crunch) → **passerelle** (Apigee) → **régression CI** (Postman) → **audits mono-vuln** (auth API2 / BOLA API1 / mass-assignment API3). Aucun chevauchement de profondeur ; chaque skill occupe une couche/risque OWASP distinct. Tous recadrés test-then-harden, autorisation écrite comme gate §5, findings critiques → `mas-sec-reviewer`, état dans `data/` (§8), quota-units jamais $/€ (§11), frameworks NIST CSF + MITRE ATT&CK préservés du frontmatter source. Sanitize 8/8 clean, 0 import `@anthropic-ai/sdk`.

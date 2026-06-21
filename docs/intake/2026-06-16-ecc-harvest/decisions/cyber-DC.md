# ECC Harvest — décisions cluster `cyber:api-security` (lot DC)

Doer: lot DC (12 skills, à **dominante offensive** → recadrage DÉFENSIF obligatoire). Worktree `maos-ecc`.
Source cyber: `mukul975/Anthropic-Cybersecurity-Skills` (Apache-2.0). Cible: `packages/skills/library/<slug>/SKILL.md`.
Méthode: intake-audit lifecycle complet, le garde-fou défensif comme **critère KILL explicite**.

Nature du lot: skills aux titres **offensifs** (`exploiting-…`, `performing-…attack`, `testing-…flaws`).
Garde-fou non-négociable appliqué à chacun: on ne garde QUE la valeur défensive — comment l'attaque fonctionne →
**comment la DÉTECTER (signatures/logs/règles WAF) et la MITIGER (config/code sécurisé)** pour blue-team / test autorisé.
Tout payload d'exploitation copiable (boucles de SQLi/SSRF/brute-force, forge de JWT, flooders DoS, PoC CSWSH exfiltrant,
JKU/KID-injection prête à tirer) est **strippé** et remplacé par une explication défensive. KILL pour tout skill qui serait
un pur outil prêt-à-tirer sans valeur détection/mitigation, ou qui faciliterait mass-targeting / DoS / évasion de détection
à fin malveillante. Documents de CONNAISSANCE uniquement, jamais d'exploit exécutable.

Frameworks source: `nist_csf` (PR.PS-01/ID.RA-01/PR.DS-10/DE.CM-01) + `mitre_attack` (T1190, T1059, T1552.001, T1068,
T1548, T1110, T1027, T1070, T1055…) — préservés dans la metadata MAS.
Recoupe `mas-sec-reviewer` + CLAUDE.md §5 (posture API, gate réseau `allowed_hosts`, actions risquées).
Sanitize: 0 secret réel, 0 PII, 0 `@anthropic-ai/sdk` dans les 12 sources (les chaînes `' OR 1=1`, `169.254.169.254`,
`/etc/passwd` sont des indicateurs/signatures, pas des secrets — conservées uniquement quand elles servent la détection).
Recadrage transverse §11: tout chiffre = quota d'abonnement, jamais $/€ (sources sans cash, recadrage léger).

Bilan: **12 keepers / 0 reject.** Aucun skill n'est un pur outil sans valeur défensive — chacun embarque remédiation +
mappings NIST/MITRE, et la plupart des indicateurs de détection. Les trois à pente DoS/abus
(`performing-api-rate-limiting-bypass`, `performing-graphql-depth-limit-attack`, `performing-api-fuzzing-with-restler`)
ont passé le KILL test parce que leur cœur reste durcissement+détection ; leurs boucles d'attaque ont été retirées.

---

## exploiting-api-injection-vulnerabilities
- **décision**: adapt (recadrage défensif lourd)
- **raison**: SQLi/NoSQLi/OS-command/LDAP/SSRF via paramètres, headers et bodies d'API (OWASP API8/API7:2023). La source fournit des boucles d'exploitation Python copiables (`test_sql_injection`, `test_ssrf`, `test_command_injection`) — **strippées**. On garde le cœur bleu : signatures de détection (chaînes d'erreur SQL, latence time-based, opérateurs `$` en JSON, egress vers `169.254.169.254`/CIDR internes, métacaractères shell) + mitigation (requêtes paramétrées, type-check rejetant les objets-opérateurs, allow-list de sortie bloquant link-local/metadata = gate §5 `allowed_hosts`, jamais d'input vers un shell, WAF en défense-en-profondeur).
- **garde-fou KILL**: NON déclenché — remédiation + mappings NIST/MITRE + indicateurs présents ; valeur blue-team forte. Les payloads sont retirés du corps boosté.
- **dedup**: non — recoupe `mas-sec-reviewer`/§5 (allowed_hosts) mais apporte les signatures de détection injection absentes de notre surface.
- **chemin library**: `packages/skills/library/exploiting-api-injection-vulnerabilities/SKILL.md`
- **état**: keeper boosté §12 conforme (ligne1 `---`, commentaire source, summary L1, metadata+frameworks, Prompt Defense Baseline verbatim, 7 sections détection+mitigation, 0 `@anthropic-ai/sdk`, 0 secret, 0 payload exécutable). Re-audit: si OWASP API Top-10 révisé.


## exploiting-broken-function-level-authorization
- **décision**: adapt (recadrage défensif lourd)
- **raison**: BFLA / élévation verticale (OWASP API5:2023) — utilisateurs simples atteignant des fonctions admin par appel direct, swap de méthode, mass-assignment (`role`/`is_admin`), params cachés, versions fantômes (`/v2`, `/internal`), bypass de path. La source liste des wordlists d'endpoints admin + une matrice d'attaque rôle×endpoint copiable — **strippée**. On garde la conception défensive : RBAC au niveau route deny-by-default, check sur chaque méthode, allow-list des propriétés écrivables, parité de version/path, logs d'audit immuables, et surtout une **matrice de tests authz CI** comme fix durable. Détection : 2xx sur endpoint privilégié avec token non-admin, écritures sur champ `role`, suppression de logs d'audit.
- **garde-fou KILL**: NON déclenché — remédiation riche + NIST/MITRE (T1068/T1548) ; valeur blue-team forte. Wordlists/boucles offensives retirées.
- **dedup**: non — recoupe §5 (gating cross-privilège) mais formalise la doctrine RBAC + détection BFLA, absente de notre surface.
- **chemin library**: `packages/skills/library/exploiting-broken-function-level-authorization/SKILL.md`
- **état**: keeper boosté §12 conforme (ligne1 `---`, commentaire source, summary L1, metadata+frameworks, Prompt Defense Baseline verbatim, 7 sections, 0 sdk, 0 secret, 0 exploit exécutable). Re-audit: si OWASP API Top-10 révisé.

## exploiting-excessive-data-exposure-in-api
- **décision**: adapt (recadrage défensif)
- **raison**: exposition de données excessive / BOPLA (OWASP API3:2023) — l'API sérialise des objets DB complets et compte sur le frontend pour masquer hash de mot de passe, fragments SSN, IP internes, scores de risque, secrets ; plus fuite via objets user imbriqués, headers de debug, stack traces. Source = scanners de patterns sensibles + diff UI/réponse (peu d'exploit pur). On garde la mitigation : DTO/view-models whitelistant les champs par endpoint×rôle, strip à la sérialisation, field-level authz GraphQL, suppression headers debug/traces, tests de schéma de réponse. Détection : noms de champs sensibles / patterns PII dans les bodies, erreurs verbeuses.
- **garde-fou KILL**: NON déclenché — quasi-défensif d'origine ; remédiation + NIST/MITRE (T1027/T1070). Recoupe directement la revue secret/PII de `mas-sec-reviewer`.
- **dedup**: partiel — `mas-sec-reviewer` couvre la fuite de secret ; ici on ajoute la doctrine response-shaping (DTO/field-authz) côté API.
- **chemin library**: `packages/skills/library/exploiting-excessive-data-exposure-in-api/SKILL.md`
- **état**: keeper boosté §12 conforme (ligne1 `---`, commentaire source, summary L1, metadata+frameworks, Prompt Defense Baseline verbatim, 7 sections, 0 sdk, 0 secret réel, 0 exploit). Re-audit: si OWASP API Top-10 révisé.

## exploiting-jwt-algorithm-confusion-attack
- **décision**: adapt (recadrage défensif lourd)
- **raison**: confusion d'algorithme/clé JWT — verifier qui fait confiance au header `alg` → downgrade RS256→HS256 (signature HMAC avec la clé publique RSA comme secret), `alg:none`, injection `kid`/`jku`/`x5u`. La source était la **plus armée** du lot : fonctions `forge_hs256_with_public_key`, `forge_none_algorithm`, génération de JWKS attaquant, payloads d'injection kid (path-traversal + SQLi) — **toutes strippées** (corps boosté = 0 code de forge). On garde la vérité défensive : pin de l'algorithme dans `verify()`, séparation des types de clé, rejet de `none`, `kid` résolu contre un keyset serveur, `jku`/`x5u` jamais fetchés depuis le token (allow-list = §5), EdDSA, validation exp/aud. Détection : `alg` anormal, `kid` avec `../`/URL/SQL, `jku` hors allow-list.
- **garde-fou KILL**: NON déclenché — malgré la charge offensive, la valeur détection+mitigation est forte ; remédiation explicite + NIST/MITRE. Strip = condition du keep (skill armé → doc de connaissance, vérif par assertion de rejet, jamais par forge).
- **dedup**: non — l'auth JWT et son durcissement ne sont pas couverts ailleurs ; recoupe §5 sur l'allow-list JWKS.
- **chemin library**: `packages/skills/library/exploiting-jwt-algorithm-confusion-attack/SKILL.md`
- **état**: keeper boosté §12 conforme (ligne1 `---`, commentaire source, summary L1, metadata+frameworks, Prompt Defense Baseline verbatim, 7 sections, 0 sdk, 0 secret, **0 code de forge**). Re-audit: si nouvelle classe de confusion JWT publiée.

## performing-jwt-none-algorithm-attack
- **décision**: adapt (recadrage défensif)
- **raison**: bypass de signature JWT via `alg:none` (et variantes de casse). La source embarquait une classe-outil `JWTNoneAttack` (forge + test de variantes) — **strippée** — mais aussi déjà des sections Mitigation + Detection Indicators réutilisées telles quelles. On garde : pin de l'allow-list d'algorithme à la vérification (rend `none` impossible), rejet du segment de signature vide, claims obligatoires (exp/iat/sub), patching lib. Détection : header `alg=none`/casse, token à deux segments base64, changement brusque d'`alg`, claims d'escalade sur token non signé.
- **garde-fou KILL**: NON déclenché — valeur défensive native forte ; remédiation + indicateurs déjà fournis par la source. Outil de forge retiré.
- **dedup**: chevauche `exploiting-jwt-algorithm-confusion-attack` (même contrôle : pin de l'algorithme) mais reste distinct (vecteur `none` pur + indicateurs de log dédiés) → gardé, fix commun cité.
- **chemin library**: `packages/skills/library/performing-jwt-none-algorithm-attack/SKILL.md`
- **état**: keeper boosté §12 conforme (ligne1 `---`, commentaire source, summary L1, metadata+frameworks, Prompt Defense Baseline verbatim, 7 sections, 0 sdk, 0 secret, 0 code de forge). Re-audit: si nouvelle variante de bypass `none` publiée.

## performing-api-fuzzing-with-restler
- **décision**: adapt (recadrage défensif — pente DoS maîtrisée)
- **raison**: fuzzing stateful RESTler. Pente DoS (RESTler crée/supprime des milliers de ressources) — passé le **KILL test** car le cœur reste défensif : c'est un outil de durcissement de SA PROPRE API en staging/CI. On garde la valeur sécurité = les checkers (UseAfterFree → invalider tokens au delete ; NamespaceRule → isolation tenant ; LeakageRule/500 → erreurs génériques) chacun mappé à un fix, + les garde-fous d'exécution sûre (staging only, autorisation écrite, time-budget, GC, `allowed_hosts` §5). Reframe : findings = hypothèses à corriger, jamais recettes d'exploit. Wiring CI = régression sécurité.
- **garde-fou KILL**: ÉVALUÉ et NON déclenché — pas un outil de mass-targeting : scope staging+autorisé, blast-radius borné, valeur blue-team (durcissement+régression). Aucune boucle de flood/credential-stuffing dans le corps.
- **dedup**: non — aucun fuzzer/outil de test sécurité API dans notre surface ; recoupe §5 sur le traffic sortant.
- **chemin library**: `packages/skills/library/performing-api-fuzzing-with-restler/SKILL.md`
- **état**: keeper boosté §12 conforme (ligne1 `---`, commentaire source, summary L1, metadata+frameworks, Prompt Defense Baseline verbatim, 7 sections détection+mitigation, 0 sdk, 0 secret). Re-audit: si RESTler déprécié / OWASP API révisé.

## performing-api-rate-limiting-bypass
- **décision**: adapt (recadrage défensif lourd — pente abus/DoS maîtrisée)
- **raison**: bypass de rate-limit (OWASP API4:2023). La source était la **plus abusive** du lot : boucle de credential-stuffing (`test_account_rotation_bypass`), flooder async distribué (`distributed_rate_limit_test`), rotation X-Forwarded-For et parameter-pollution prêts à tirer — **tous strippés** (corps boosté = 0 code de flood/brute-force). On garde la **taxonomie des bypass comme checklist de durcissement** : identité dérivée à l'edge de confiance (strip des headers de forwarding clients), clé sur identité authentifiée pas l'IP, canonicalisation de path, couverture uniforme méthodes/versions, compteurs atomiques (Redis INCR), backoff/lockout sur login/reset/MFA. Détection : headers de forwarding au tier app, bursts d'échecs de login, requêtes quasi-identiques à param junk.
- **garde-fou KILL**: ÉVALUÉ de près — la source frôlait le « pur outil mass-targeting/DoS ». NON déclenché **uniquement après strip total** des boucles : ce qui reste est une doctrine de durcissement+détection à valeur blue-team réelle (remédiation + NIST/MITRE T1110). Sans le strip ç'aurait été reject.
- **dedup**: non — le rate-limiting applicatif et son durcissement ne sont pas couverts ; recoupe §5 (gate réseau) sur la confiance des headers.
- **chemin library**: `packages/skills/library/performing-api-rate-limiting-bypass/SKILL.md`
- **état**: keeper boosté §12 conforme (ligne1 `---`, commentaire source, summary L1, metadata+frameworks, Prompt Defense Baseline verbatim, 7 sections, 0 sdk, 0 secret, **0 code de flood/brute-force**). Re-audit: si OWASP API Top-10 révisé.

## performing-graphql-depth-limit-attack
- **décision**: adapt (recadrage défensif — pente DoS maîtrisée)
- **raison**: DoS GraphQL par requêtes récursives/profondes + amplification (aliases, cycles de fragments, duplication, batch). La source embarquait des générateurs de requêtes d'attaque (`generate_nested_query`, `generate_alias_query`, classe `GraphQLDepthTester`) — **strippés** — mais aussi déjà des sections Mitigation + Detection Indicators réutilisées. On garde : depth-limit (5–10), analyse de complexité/coût avec budget max, cap aliases/batch/duplication, rejet des cycles de fragments, timeout par requête, rate-limit par coût. Détection : requêtes trop profondes/complexes, pics de latence/CPU corrélés à un pattern.
- **garde-fou KILL**: ÉVALUÉ et NON déclenché — bien que DoS-orienté, la source fournit nativement la mitigation complète ; le keep est défensif (durcissement+détection). Générateurs d'attaque retirés.
- **dedup**: chevauche `performing-graphql-introspection-attack` (même famille GraphQL) mais reste distinct (focus depth/complexity DoS) → gardé.
- **chemin library**: `packages/skills/library/performing-graphql-depth-limit-attack/SKILL.md`
- **état**: keeper boosté §12 conforme (ligne1 `---`, commentaire source, summary L1, metadata+frameworks, Prompt Defense Baseline verbatim, 7 sections, 0 sdk, 0 secret, 0 générateur d'attaque). Re-audit: si OWASP API Top-10 / GraphQL cheat sheet révisé.

## performing-graphql-introspection-attack
- **décision**: adapt (recadrage défensif lourd)
- **raison**: exposition de schéma GraphQL via introspection + reconstruction par suggestions d'erreur + champs/mutations sensibles + field-authz manquante. La source contenait un brute-forcer de champs (`bruteforce_field`), un brute-force de login par alias (`alias_brute_force_login`), et des générateurs DoS (deep/wide/batch/circular) — **tous strippés**. On garde l'hygiène de schéma : introspection OFF en prod, suggestions d'erreur OFF, **field-level authorization** (le vrai contrôle, pas l'obscurité), suppression des champs secrets du schéma client, sécurisation des mutations, + couplage aux limites depth/complexity. Détection : requêtes `__schema`/`__type` en prod, probing « did you mean », tentatives d'auth par batch d'aliases.
- **garde-fou KILL**: NON déclenché — forte valeur défensive (hygiène + authz) ; remédiation + NIST/MITRE (T1110). Code d'énumération/brute-force/DoS retiré.
- **dedup**: chevauche `performing-graphql-depth-limit-attack` (couplage cité) mais distinct (exposition schéma + authz vs DoS de coût) → gardé.
- **chemin library**: `packages/skills/library/performing-graphql-introspection-attack/SKILL.md`
- **état**: keeper boosté §12 conforme (ligne1 `---`, commentaire source, summary L1, metadata+frameworks, Prompt Defense Baseline verbatim, 7 sections, 0 sdk, 0 secret, 0 code d'énumération). Re-audit: si OWASP GraphQL cheat sheet révisé.

## performing-soap-web-service-security-testing
- **décision**: adapt (recadrage défensif lourd)
- **raison**: sécurité SOAP/WSDL (encore répandu en entreprise/finance/santé) — XXE, XML bombs (Billion Laughs), XML/SQL/XPath injection, SOAPAction spoofing, bypass WS-Security. La source embarquait une classe `SOAPSecurityTester` avec payloads XXE/SQLi + tests de spoofing — **strippés**. On garde la config défensive : parser XML refusant DTD + entités externes (tue XXE + XML bombs d'un coup), caps d'expansion/taille, requêtes paramétrées, SOAPAction lié au body, WS-Security validée (signature/timestamp/token + anti-rejeu), WSDL restreint, faults génériques. Détection : `<!DOCTYPE`/`<!ENTITY` dans les bodies, XML lent/surdimensionné, erreurs SQL, mismatch SOAPAction.
- **garde-fou KILL**: NON déclenché — remédiation riche + NIST/MITRE ; valeur blue-team forte sur une surface legacy sous-testée. Payloads d'attaque retirés.
- **dedup**: non — SOAP/WS-Security/XXE non couverts ailleurs ; complète la doctrine injection (REST) côté XML.
- **chemin library**: `packages/skills/library/performing-soap-web-service-security-testing/SKILL.md`
- **état**: keeper boosté §12 conforme (ligne1 `---`, commentaire source, summary L1, metadata+frameworks, Prompt Defense Baseline verbatim, 7 sections, 0 sdk, 0 secret, 0 payload XXE/injection). Re-audit: si guidance OWASP XXE/WS-Security révisée.

## testing-oauth2-implementation-flaws
- **décision**: adapt (recadrage défensif lourd)
- **raison**: failles OAuth2/OIDC menant à l'account takeover — validation redirect_uri laxiste (prefix), `state` absent/non-validé (CSRF), PKCE non-imposé ou downgradé en `plain`, scope escalation, tokens non liés au client/audience, codes d'autorisation rejouables, implicit flow déprécié. La source listait des payloads de bypass redirect_uri + boucles d'attaque PKCE/scope/replay — **strippés**. On garde les contrôles : exact-match redirect_uri, `state` vérifié côté client, PKCE S256 obligatoire, scope borné au consentement, codes single-use TTL court, validation aud/iss/nonce, implicit OFF, refresh lié au client. Détection : anomalies redirect_uri, replay de code, tokens en URL.
- **garde-fou KILL**: NON déclenché — remédiation riche + NIST/MITRE ; valeur blue-team forte (auth = surface critique). Boucles d'attaque retirées.
- **dedup**: non — OAuth/OIDC hardening non couvert ; complète la doctrine JWT (validation de token) côté flux d'autorisation.
- **chemin library**: `packages/skills/library/testing-oauth2-implementation-flaws/SKILL.md`
- **état**: keeper boosté §12 conforme (ligne1 `---`, commentaire source, summary L1, metadata+frameworks, Prompt Defense Baseline verbatim, 7 sections, 0 sdk, 0 secret, 0 boucle d'attaque). Re-audit: si OAuth 2.1 finalisé / OWASP révisé.

## testing-websocket-api-security
- **décision**: adapt (recadrage défensif lourd)
- **raison**: sécurité WebSocket — pas d'auth à l'upgrade, CSWSH (serveur ignorant l'Origin → page attaquante exploite les cookies de la victime), authz seulement au handshake et pas par message, payloads de frame non sanitisés (SQLi/XSS/SSRF/command), DoS par flood/frame géante/épuisement de connexions. La source embarquait un **PoC HTML CSWSH exfiltrant** vers `attacker.com`, des boucles d'injection et des flooders async — **tous strippés**. On garde les contrôles : validation Origin allow-list, auth par token (pas cookie), authz par message + au reconnect, validation des payloads, rate-limit volume/taille/connexions, trim des données de frame. Détection : Origins hors allow-list, bursts de messages, frames surdimensionnées, indicateurs d'injection dans les frames.
- **garde-fou KILL**: ÉVALUÉ — la source contenait un PoC d'exfiltration (détection-évasion/vol de données). NON déclenché **après strip total** du PoC : ce qui reste est durcissement+détection blue-team. Sans le strip, candidat reject.
- **dedup**: non — surface temps-réel/WebSocket non couverte ; réutilise les contrôles anti-injection des couches REST/SOAP.
- **chemin library**: `packages/skills/library/testing-websocket-api-security/SKILL.md`
- **état**: keeper boosté §12 conforme (ligne1 `---`, commentaire source, summary L1, metadata+frameworks, Prompt Defense Baseline verbatim, 7 sections, 0 sdk, 0 secret, **0 PoC/flood**). Re-audit: si guidance OWASP WebSocket révisée.

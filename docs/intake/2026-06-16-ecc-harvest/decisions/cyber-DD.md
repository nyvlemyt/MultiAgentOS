# ECC Harvest — décisions cluster `cyber:web-application-security` (lot DD)

Doer: lot DD (8 skills à titre **offensif** → recadrés DÉFENSIVEMENT). Worktree `maos-ecc`.
Source: `mukul975/Anthropic-Cybersecurity-Skills` (clone read-only `--depth 1`, 2026-06-18), Apache-2.0, auteur frontmatter `mahipal`.
Cible: `packages/skills/library/<slug>/SKILL.md`. Méthode: intake-audit avec **garde-fou défensif comme critère KILL explicite**.

## Garde-fou appliqué (non-négociable)
Chaque source est une recette de pentest avec payloads armés. On ne garde QUE la valeur bleue : mécanisme d'attaque → **DÉTECTER (signatures WAF/log)** + **MITIGER (code/config sécurisés)** + implémentation sûre pour blue-team autorisée. Payloads armés STRIPPÉS vers explication défensive. KILL si arme pure sans valeur défensive, ou ciblage-de-masse/DoS/évasion-malveillante. Ces 8 cartographient le durcissement de NOTRE app (Next.js/web) + `mas-sec-reviewer` + §5.

## Recadrage transverse
- MAOS = abonnement (§11) : tout chiffre = unités de quota, jamais $/€. (Les sources n'en contenaient pas — CVSS conservés, ce sont des scores de sévérité, pas du cash.)
- `frameworks` (NIST CSF + MITRE ATT&CK) préservés dans la metadata de chaque keeper.
- Sanitize secrets/PII/`@anthropic-ai/sdk` : 8/8 sources clean (les `target.example.com`, tokens `eyJ...`, `APP_SECRET` étaient déjà des placeholders ; tous strippés au profit d'explications défensives).
- Outils offensifs (ffuf, ysoserial, NoSQLMap, subjack, Burp Intruder…) retirés des keepers : seuls subsistent les outils de DÉTECTION/durcissement (WAF, scanners SAST/DAST en CI, SRI, CSP, en-têtes serveur).

---

## bypassing-authentication-with-forced-browsing
- **décision**: adapt (recadrage défensif intégral)
- **raison**: forced browsing / broken access control (OWASP A01). Valeur bleue forte : cartographie directement le durcissement de notre `apps/web` Next.js (authz en middleware, pas par route) + `mas-sec-reviewer` + §5 (pas d'accès hors sandbox projet). La source enseignait l'énumération (ffuf/gobuster, bypass méthode/encoding) ; on garde le mécanisme pour le DÉTECTER (signatures WAF/log : bursts 401/403/404, sondes `/.git` `/.env` `*.bak` `/actuator/*`, anomalies de méthode) et le MITIGER (default-deny+allowlist, normalisation exacte avant authz, deny-serve fichiers backup/VCS, désactiver Actuator/debug, IP-restrict admin).
- **dedup**: non — `mas-sec-reviewer` est une gate générique per-task ; aucun skill de durcissement web/access-control dans notre surface. Angle distinct (DETECT+MITIGATE A01).
- **strippé**: payloads ffuf/gobuster/curl d'énumération, headers method-override armés, sondes Actuator offensives → remplacés par config serveur + signatures de détection.
- **chemin library**: `packages/skills/library/bypassing-authentication-with-forced-browsing/SKILL.md`
- **frameworks préservés**: NIST CSF PR.PS-01/ID.RA-01/PR.DS-10/DE.CM-01 ; MITRE T1190/T1083/T1087.
- **état**: neuf (frontmatter MAS T1/library + Prompt Defense Baseline verbatim ; 7 sections §12 réécrites détection+mitigation ; 0 payload armé, 0 `@anthropic-ai/sdk`, 0 secret réel).

## exploiting-broken-link-hijacking
- **décision**: adapt (recadrage défensif intégral)
- **raison**: broken-link hijacking / subdomain takeover (supply-chain, OWASP A06/A08). Valeur bleue : renforce directement §5 `allowed_hosts` + hygiène supply-chain de notre surface DNS/assets. La source enseignait le claim de ressources expirées (whois, subjack, nuclei takeovers) ; on garde le mécanisme pour le DÉTECTER (scan CNAME dangling, monitoring liens morts, fingerprints `NoSuchBucket`/GitHub Pages) et le MITIGER (supprimer le DNS AVANT la dé-provision, Subresource Integrity, CSP `script-src`/`connect-src`, provenance des dépendances, self-host critique).
- **dedup**: non — aucun skill DNS/supply-chain dans notre surface ; complète `mas-sec-reviewer` et §5 `allowed_hosts` sous un angle distinct (réf. externes dangereuses).
- **strippé**: étapes de claim/takeover (register domain, `aws s3 mb`, repo GitHub Pages PoC, subjack/nuclei offensifs) → remplacées par scan défensif + ordre de décommission + SRI/CSP.
- **chemin library**: `packages/skills/library/exploiting-broken-link-hijacking/SKILL.md`
- **frameworks préservés**: NIST CSF PR.PS-01/ID.RA-01/PR.DS-10/DE.CM-01 ; MITRE T1190/T1059.007/T1505.003/T1083/T1195.
- **état**: neuf (frontmatter MAS T1/library + Prompt Defense Baseline verbatim ; 7 sections §12 détection+mitigation ; 0 étape de takeover, 0 sdk, 0 secret).

## exploiting-http-request-smuggling
- **décision**: adapt (recadrage défensif intégral)
- **raison**: HTTP request smuggling / desync (OWASP A05). Valeur bleue : durcissement de toute chaîne proxy/CDN → origine que MAOS opère (forme de déploiement typique). La source enseignait CL.TE/TE.CL/H2.CL avec requêtes armées (bypass admin, capture d'utilisateurs, cache poisoning) ; on garde le mécanisme pour le DÉTECTER (signatures WAF/log : requêtes avec CL+TE simultanés, TE obfusqué, CRLF en en-têtes HTTP/2, anomalies de timing/cache) et le MITIGER (rejeter l'ambigu, normaliser au edge, HTTP/2 bout-en-bout, parsers cohérents, reuse de connexion sûr).
- **dedup**: non — aucun skill de durcissement proxy/HTTP dans notre surface ; complète `mas-sec-reviewer`. Angle distinct (couche transport HTTP, pas applicatif).
- **strippé**: requêtes de smuggling armées (CL.TE/TE.CL prefix, capture de cookies, escalade XSS), `smuggler.py`/`h2cSmuggler`/Turbo Intruder → remplacés par règles de rejet + normalisation + signatures.
- **chemin library**: `packages/skills/library/exploiting-http-request-smuggling/SKILL.md`
- **frameworks préservés**: NIST CSF PR.PS-01/ID.RA-01/PR.DS-10/DE.CM-01 ; MITRE T1190/T1059.007/T1505.003/T1083.
- **état**: neuf (frontmatter MAS T1/library + Prompt Defense Baseline verbatim ; 7 sections §12 détection+mitigation ; 0 requête de smuggling, 0 sdk, 0 secret).

## exploiting-idor-vulnerabilities
- **décision**: adapt (recadrage défensif intégral)
- **raison**: IDOR / BOLA (OWASP A01, API1) — bug d'access-control API le plus fréquent. Valeur bleue forte : durcissement de notre propre surface API + renforce §5 (isolation sandbox cross-projet : un agent ne touche pas hors projet actif). La source enseignait la manipulation d'id (horizontal/vertical, body/GraphQL/bulk, énumération ffuf) ; on garde le mécanisme pour le DÉTECTER (signatures log : énumération séquentielle, un principal touchant N ids distincts, accès cross-tenant) et le MITIGER (authz par-objet server-side sur CHAQUE CRUD, requêtes scopées `WHERE owner=`, UUIDv4 en defence-in-depth jamais comme contrôle, rate-limit).
- **dedup**: non — `mas-sec-reviewer` est générique ; aucun skill d'authz objet/BOLA dans notre surface. Recoupe le durcissement mass-assignment (champs d'ownership) mais angle distinct (lecture+écriture par id).
- **strippé**: curls d'accès non-autorisé, Burp Authorize, énumération ffuf des ids, DELETE sur données d'autrui → remplacés par checks d'ownership + requêtes scopées + signatures de détection.
- **chemin library**: `packages/skills/library/exploiting-idor-vulnerabilities/SKILL.md`
- **frameworks préservés**: NIST CSF PR.PS-01/ID.RA-01/PR.DS-10/DE.CM-01 ; MITRE T1190/T1059.007/T1505.003/T1083.
- **état**: neuf (frontmatter MAS T1/library + Prompt Defense Baseline verbatim ; 7 sections §12 détection+mitigation ; 0 accès non-autorisé démontré, 0 sdk, 0 secret).

## exploiting-insecure-deserialization
- **décision**: adapt (recadrage défensif intégral)
- **raison**: insecure deserialization → RCE (OWASP A08). Valeur bleue : secure-coding de nos propres frontières de sérialisation (cookies, cache, queue) + signal §5 (RCE = risk:high/blocking). La source était la plus armée du lot (ysoserial/PHPGGC/ysoserial.net, pickle `__reduce__` RCE, YAML `!!python/object/apply:os.system`) ; on garde le mécanisme pour le DÉTECTER (signatures de marqueurs : Java `rO0AB`/`0xACED0005`, PHP `O:`/`a:`, .NET `/wE`, pickle `0x80` ; inventaire des libs gadget ; callbacks OOB en test) et le MITIGER (ne jamais désérialiser du non-fiable, JSON/Protobuf, allowlists/JEP 290, HMAC, ViewState MAC, `yaml.safe_load`, patch gadgets).
- **dedup**: non — aucun skill de désérialisation sûre dans notre surface ; complète `mas-sec-reviewer` (gate) avec la mécanique secure-code.
- **strippé**: TOUS les générateurs de payload RCE (ysoserial CommonsCollections, PHPGGC Laravel/RCE, ysoserial.net, pickle `__reduce__`, YAML os.system) → remplacés par sinks à éliminer + allowlists + HMAC + signatures de détection. C'était l'item le plus sensible : zéro chaîne d'exécution conservée.
- **chemin library**: `packages/skills/library/exploiting-insecure-deserialization/SKILL.md`
- **frameworks préservés**: NIST CSF PR.PS-01/ID.RA-01/PR.DS-10/DE.CM-01 ; MITRE T1190/T1059.007/T1505.003/T1083.
- **état**: neuf (frontmatter MAS T1/library + Prompt Defense Baseline verbatim ; 7 sections §12 détection+mitigation ; 0 gadget/payload RCE, 0 sdk, 0 secret).

## exploiting-mass-assignment-in-rest-apis
- **décision**: adapt (recadrage défensif intégral)
- **raison**: mass assignment / auto-binding (OWASP API6, A08). Valeur bleue : secure-coding de nos write-paths API (Next.js/ORM). La source enseignait l'injection de champs (`role`/`isAdmin`/`balance`/`owner_id`, Arjun/param-miner) ; on garde le mécanisme pour le DÉTECTER (diff body vs allowlist, alerte sur écriture de champs restreints) et le MITIGER (allowlist jamais denylist : strong_parameters/serializer fields/`$fillable`/DTO Spring ; DTO découplant input du modèle ; authz field-level sur attributs sensibles).
- **dedup**: non — aucun skill d'auto-binding sûr chez nous ; complète `mas-sec-reviewer`. Recoupe IDOR sur les champs d'ownership (chevauchement signalé dans les deux skills) mais angle distinct (binding d'écriture vs accès par id).
- **strippé**: curls d'injection privilege/financial, scripts d'automatisation mass-assignment, nuclei templates → remplacés par allowlists + DTO + authz field-level + signatures de détection.
- **chemin library**: `packages/skills/library/exploiting-mass-assignment-in-rest-apis/SKILL.md`
- **frameworks préservés**: NIST CSF PR.PS-01/ID.RA-01/PR.DS-10/DE.CM-01 ; MITRE T1190/T1059.007/T1505.003/T1083/T1068.
- **état**: neuf (frontmatter MAS T1/library + Prompt Defense Baseline verbatim ; 7 sections §12 détection+mitigation ; 0 payload d'injection, 0 sdk, 0 secret).

## exploiting-nosql-injection-vulnerabilities
- **décision**: adapt (recadrage défensif intégral)
- **raison**: NoSQL injection (OWASP A03) — type confusion (objet où string attendu). Valeur bleue : secure-coding de notre data-layer. La source enseignait l'opérateur-injection armé ($ne auth bypass, $regex blind extraction, $where JS/RCE, NoSQLMap) ; on garde le mécanisme pour le DÉTECTER (signatures WAF/log : champ scalaire reçu en objet/array, clés `$`-préfixées, `$where`/JS, patterns blind) et le MITIGER (validation de type stricte, coercition vers primitif, APIs driver paramétrées, strip clés `$`/`.`, désactiver `$where`/server-side JS, DB least-privilege).
- **dedup**: non — aucun skill de requête NoSQL sûre chez nous ; complète `mas-sec-reviewer` sous l'angle injection data-layer.
- **strippé**: curls de bypass d'auth (`{$ne:""}`), extraction blind `$regex`, `$where` sleep/exfil, NoSQLMap/nosqli → remplacés par validation de type + coercition + paramétrage + signatures de détection.
- **chemin library**: `packages/skills/library/exploiting-nosql-injection-vulnerabilities/SKILL.md`
- **frameworks préservés**: NIST CSF PR.PS-01/ID.RA-01/PR.DS-10/DE.CM-01 ; MITRE T1190/T1059.007/T1505.003/T1083/T1055.
- **état**: neuf (frontmatter MAS T1/library + Prompt Defense Baseline verbatim ; 7 sections §12 détection+mitigation ; 0 payload d'injection, 0 sdk, 0 secret).

## exploiting-oauth-misconfiguration
- **décision**: adapt (recadrage défensif intégral)
- **raison**: OAuth 2.0 / OIDC misconfiguration (OWASP A07). Valeur bleue : durcissement de tout flux auth/SSO que MAOS intègre. La source enseignait le vol de code/token (bypass redirect_uri, fuite implicit/Referer, code reuse, scope escalation, account-link takeover) ; on garde le mécanisme pour le DÉTECTER (audit `.well-known`, signatures log : mismatch redirect, réutilisation de code, callbacks sans state, élargissement de scope au refresh) et le MITIGER (redirect_uri exact-match sans wildcard, PKCE S256 obligatoire, state cryptographique lié à la session, codes single-use, scope minimal, flow code+PKCE vs implicit, email vérifié avant linking, secrets côté serveur, révocation au changement de credential).
- **dedup**: non — aucun skill OAuth/OIDC dans notre surface ; complète `mas-sec-reviewer`. Recoupe broken-link-hijacking (sous-domaine takeoverable en redirect) mais angle distinct (config du flow auth).
- **strippé**: liste de bypass redirect armés, vol de code/token via Referer, réutilisation de code, substitution de token cross-client, étapes d'account-link takeover → remplacés par checklist de config stricte + signatures de détection.
- **chemin library**: `packages/skills/library/exploiting-oauth-misconfiguration/SKILL.md`
- **frameworks préservés**: NIST CSF PR.PS-01/ID.RA-01/PR.DS-10/DE.CM-01 ; MITRE T1190/T1059.007/T1505.003/T1083.
- **état**: neuf (frontmatter MAS T1/library + Prompt Defense Baseline verbatim ; 7 sections §12 détection+mitigation ; 0 étape de vol de token, 0 sdk, 0 secret).

---

### Récap
- **8/8 keepers** (tous `adapt`, recadrage défensif intégral). **0 reject** — chaque source à titre offensif portait une valeur bleue claire (DETECT + MITIGATE) cartographiant le durcissement de notre propre surface web/API (Next.js/apps) + `mas-sec-reviewer` + §5 ; aucune n'était une arme pure, ni ciblage-de-masse/DoS/évasion, donc aucun critère KILL déclenché.
- **Couverture OWASP** : A01 (forced-browsing + IDOR), A03 (NoSQLi), A05 (request smuggling), A06/A08 (broken-link-hijacking, deserialization), A07 (OAuth), API6 (mass assignment). Chevauchements explicités : IDOR↔mass-assignment (champs d'ownership), broken-link↔OAuth (sous-domaine takeover en redirect).
- **Strip le plus lourd** : `exploiting-insecure-deserialization` (toutes les chaînes ysoserial/PHPGGC/pickle RCE retirées) ; aucune chaîne d'exécution conservée nulle part.
- **Garde-fous** : 0 `@anthropic-ai/sdk`, 0 secret/clé/PII réel, 0 payload armé dans les 8 outputs ; `frameworks` NIST CSF + MITRE ATT&CK préservés dans chaque metadata ; aucun chiffre $/€ (CVSS = sévérité, conservés).
- **Re-audit** : revalider si la source upstream publie de nouvelles versions, ou au prochain self-audit de phase (CLAUDE.md §13).

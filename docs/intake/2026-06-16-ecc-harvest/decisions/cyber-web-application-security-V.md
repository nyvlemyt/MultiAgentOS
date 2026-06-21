# ECC Harvest — décisions cluster `cyber:web-application-security` (LOT V)

Doer: lot V (9 skills offensifs-titrés, vague web-app-sec). Worktree `maos-ecc`, branche `phase/ecc-harvest`. Méthode: intake-audit, recadrage défensif obligatoire.
Source: `mukul975/Anthropic-Cybersecurity-Skills` (Apache-2.0, clone read-only). Cible: `packages/skills/library/<defensive-slug>/SKILL.md`.

## Recadrage transverse (guardrail du lot)

Ces 9 skills sont **offensifs** (attaque/exploitation). Per CLAUDE.md §5/§11, l'exploitation active est `risk: blocking` et toujours gatée. Politique appliquée à chaque item:
- **GARDER** la connaissance transférable (signatures de détection, secure-config, remédiation) ;
- **STRIPPER** tout payload d'exploit fonctionnel, tout scan réseau, tout vol de credential ;
- **RENOMMER** vers un slug défensif (detect/prevent/test-your-OWN-app) ;
- **Cadre autorisé**: application possédée / in-scope uniquement ; exploitation active = §5-gatée ;
- **REJET** si le cœur ne survit pas au strip (pure arme sans valeur défensive).

Sanitize (regex secrets/PII/internal): 9/9 sources clean. `@anthropic-ai/sdk`: absent des sources et des keepers. Chiffres = quota d'abonnement (§11), jamais $/€. `metadata.frameworks` préserve NIST CSF + MITRE ATT&CK (+ ATLAS/NIST-AI-RMF là où la source les portait).

Bilan: **9 adapt, 0 reject**. La connaissance défensive survit au strip dans les 9 cas — y compris le WAF-bypass, dont la lentille « vérifier la couverture de mon PROPRE WAF + WAF ≠ contrôle unique » est réelle (sinon il aurait été rejeté ; cf. note dédiée).

## Carte de renommage source → defensive-libslug

| source-slug | defensive-libslug |
|---|---|
| performing-blind-ssrf-exploitation | detecting-and-preventing-blind-ssrf |
| performing-csrf-attack-simulation | testing-own-app-for-csrf |
| performing-second-order-sql-injection | detecting-and-preventing-second-order-sqli |
| performing-http-parameter-pollution-attack | detecting-and-preventing-http-parameter-pollution |
| performing-directory-traversal-testing | testing-own-app-for-path-traversal |
| performing-clickjacking-attack-test | testing-own-app-for-clickjacking |
| performing-web-application-firewall-bypass | hardening-waf-against-bypass |
| performing-web-cache-deception-attack | detecting-and-preventing-web-cache-deception |
| performing-web-cache-poisoning-attack | detecting-and-preventing-web-cache-poisoning |

---

## performing-blind-ssrf-exploitation → detecting-and-preventing-blind-ssrf
- **décision**: adapt (recadrage défensif)
- **raison**: la connaissance des vecteurs SSRF (sinks de fetch, contournements d'encodage IP, DNS rebinding, endpoints métadonnées cloud) se retourne intégralement en posture de défense : valider l'**IP résolue** (pas la chaîne) contre un deny private/loopback/link-local/métadonnées + allowlist d'intention, pinner le DNS, restreindre les schémas (gopher/file/dict), imposer IMDSv2, prouver l'alerte egress. Payloads d'exploitation et scan interne strippés.
- **dedup**: nourrit `mas-sec-reviewer` + garde-fou réseau §5 (`allowed_hosts`) ; angle complémentaire (validation applicative du fetch sortant), pas un doublon.
- **frameworks préservés**: NIST CSF PR.PS-01/ID.RA-01/PR.DS-10/DE.CM-01 ; MITRE ATT&CK T1190/T1078.004 (et autres, mappés « à défendre »).
- **état**: keeper écrit, conforme (ligne 1 `---`, commentaire source, summary L1, metadata complet, Prompt Defense Baseline VERBATIM + 7 sections §12, 0 sdk, 0 secret, 0 payload).

## performing-csrf-attack-simulation → testing-own-app-for-csrf
- **décision**: adapt (recadrage défensif)
- **raison**: la simulation CSRF se retourne en check de couverture : token synchroniseur per-session **réellement validé** (cas négatifs : absent/vide/étranger/expiré rejetés), SameSite, Origin/Referer en défense-en-profondeur, header custom sur API JSON (défait le form text/plain), GET jamais state-changing (ferme le trou SameSite=Lax), ré-authentification sur actions sensibles. PoC auto-submit anti-victime strippé.
- **dedup**: non — `mas-sec-reviewer` revue d'endpoints mutateurs ; aucun skill équivalent en library.
- **frameworks préservés**: NIST CSF PR.PS-01/ID.RA-01/PR.DS-10/DE.CM-01 ; MITRE ATT&CK T1190.
- **état**: keeper écrit, conforme.

## performing-second-order-sql-injection → detecting-and-preventing-second-order-sqli
- **décision**: adapt (recadrage défensif)
- **raison**: le cœur (la donnée stockée est traitée comme sûre → ré-injectée sur un read ultérieur) est une leçon de défense pure : paramétrer **les reads autant que les writes**, cartographier les paires storage→trigger (vues admin, rapports, exports, flux password), least-privilege DB, encodage en sortie, détection d'anomalie de requête. Payloads UNION/extraction/SQLMap strippés.
- **dedup**: non — `mas-sec-reviewer` ; complémentaire des contrôles SQLi génériques (focalisé sur l'angle « trusted-data assumption »).
- **frameworks préservés**: NIST CSF PR.PS-01/ID.RA-01/PR.DS-10/DE.CM-01 ; MITRE ATT&CK T1190/T1055.
- **état**: keeper écrit, conforme.

## performing-http-parameter-pollution-attack → detecting-and-preventing-http-parameter-pollution
- **décision**: adapt (recadrage défensif)
- **raison**: la connaissance des divergences de parsing (Apache last-wins / Tomcat first-wins / ASP.NET concat / Express array) se retourne en exigence : aligner les couches (CDN/WAF/proxy/framework), **rejeter** les doublons de paramètres critiques (price/amount/role/redirect_uri/CSRF) plutôt que d'en choisir un, valider côté serveur sur la valeur normalisée, gérer les headers de forwarding dupliqués. Payloads de bypass WAF / override paiement / hijack OAuth strippés.
- **dedup**: non — `mas-sec-reviewer` ; se réfère mutuellement à `hardening-waf-against-bypass`.
- **frameworks préservés**: NIST CSF PR.PS-01/ID.RA-01/PR.DS-10/DE.CM-01 ; MITRE ATT&CK T1190/T1055.
- **état**: keeper écrit, conforme.

## performing-directory-traversal-testing → testing-own-app-for-path-traversal
- **décision**: adapt (recadrage défensif)
- **raison**: les variantes de traversal/LFI deviennent un check : **canonicaliser puis confiner** le chemin résolu dans un base-dir (pas un strip de `../`), allowlist de noms, normaliser tous les encodages (URL/double/UTF-8/backslash/`....//`) avant le contrôle, neutraliser le null-byte, désactiver wrappers PHP (`php://`, `data://`, `allow_url_*`), least-privilege FS, secrets hors web-root. Lecture de fichiers arbitraires et LFI→RCE strippés.
- **dedup**: non — `mas-sec-reviewer` + **renforce directement la règle §5 sandbox de chemin** (écritures/lectures confinées au `path` du projet actif).
- **frameworks préservés**: NIST CSF PR.PS-01/ID.RA-01/PR.DS-10/DE.CM-01 ; MITRE ATT&CK T1190/T1083.
- **état**: keeper écrit, conforme.

## performing-clickjacking-attack-test → testing-own-app-for-clickjacking
- **décision**: adapt (recadrage défensif)
- **raison**: le test d'overlay devient une revue d'en-têtes : `CSP: frame-ancestors 'none'/'self'` (contrôle primaire) + `X-Frame-Options: DENY/SAMEORIGIN` (fallback navigateurs anciens) sur **chaque** page sensible, ne pas s'appuyer sur le frame-busting JS (contournable : sandbox iframe, double-framing), gater les actions sensibles par ré-auth/confirmation non auto-submittable, SameSite=Strict. PoC d'overlay anti-victime strippé.
- **dedup**: non — `mas-sec-reviewer` revue d'en-têtes + flux de confirmation.
- **frameworks préservés**: NIST CSF PR.PS-01/ID.RA-01/PR.DS-10/DE.CM-01 ; MITRE ATT&CK T1190 ; **MITRE ATLAS AML.T0024/AML.T0035** + **NIST AI RMF MEASURE-2.8/MAP-5.1** (la source les portait — signal AI-security, cf. cybersec-clusters.md §ATLAS).
- **état**: keeper écrit, conforme.

## performing-web-application-firewall-bypass → hardening-waf-against-bypass
- **décision**: adapt (recadrage défensif lourd — survie de lentille évaluée)
- **raison**: c'est le cas-limite du lot (arme d'évasion pure). Le guardrail impose de tester si une lentille défensive **survit au strip**. Elle survit, mais étroitement : (1) les classes d'évasion publiées = checklist de couverture pour le WAF qu'on **opère soi-même** (normaliser l'encodage avant évaluation, inspecter JSON/XML + toutes méthodes, signatures + analyse comportementale, rejet de pollution de paramètres) ; (2) principe porteur explicite — **un WAF est défense-en-profondeur, jamais le contrôle unique** : l'origin doit être indépendamment paramétré/encodé/validé pour qu'un bypass dégrade la profondeur sans causer de brèche. Tous les payloads d'évasion concrets strippés ; note explicite « livrer un payload à un WAF tiers = hors scope, reject ».
- **dedup**: non — `mas-sec-reviewer` + garde-fou réseau §5 ; renvoie à `detecting-and-preventing-http-parameter-pollution`.
- **KILL envisagé**: si aucune lentille n'avait survécu → reject. Ici la lentille « hardening de mon propre WAF + WAF≠wall » est réelle → adapt. (L'audit *peut* dire reject ; il a évalué et tranché adapt avec justification.)
- **frameworks préservés**: NIST CSF PR.PS-01/ID.RA-01/PR.DS-10/DE.CM-01 ; MITRE ATT&CK T1190/T1027.
- **état**: keeper écrit, conforme (avec « Defensive-survival note » documentant la frontière).

## performing-web-cache-deception-attack → detecting-and-preventing-web-cache-deception
- **décision**: adapt (recadrage défensif)
- **raison**: la déception de cache devient une posture : réponses dynamiques/authentifiées en `Cache-Control: no-store/private` **honorées par le CDN**, normalisation de chemin **identique** CDN↔origin (suffixes, `;`, `%2F`, `%00`, `..%2f`), cache par intention (route/content-type) et non par devinette d'extension, rejet d'extensions inattendues sur routes dynamiques, `Vary: Cookie`, détection d'un HIT sur chemin authentifié. Chaîne d'attaque (cacher+récupérer le contenu d'une victime) strippée.
- **dedup**: non — `mas-sec-reviewer` + garde-fou réseau §5.
- **frameworks préservés**: NIST CSF PR.PS-01/ID.RA-01/PR.DS-10/DE.CM-01 ; MITRE ATT&CK T1190/T1078.004.
- **état**: keeper écrit, conforme.

## performing-web-cache-poisoning-attack → detecting-and-preventing-web-cache-poisoning
- **décision**: adapt (recadrage défensif)
- **raison**: l'empoisonnement devient une revue : aucun input non-keyed mais reflété (headers de forwarding X-Forwarded-Host/-Proto, X-Original-URL, Host:port ; params non-keyed UTM/JSONP/fat-GET) ne doit atteindre une réponse cachée ; tout input qui influence la réponse doit être **dans la clé de cache** (Vary/config) ou **strippé avant origin** ; base URLs hardcodées (pas dérivées des headers) ; normalisation de la clé (ordre/cloaking) ; détection de reflet. Procédure d'empoisonnement strippée ; rappel cache-buster obligatoire sur scope possédé pour ne pas toucher de vrais users.
- **dedup**: non — `mas-sec-reviewer` + garde-fou réseau §5 ; complémentaire de la déception (poisoning = tous les users ; deception = données d'une victime).
- **frameworks préservés**: NIST CSF PR.PS-01/ID.RA-01/PR.DS-10/DE.CM-01 ; MITRE ATT&CK T1190.
- **état**: keeper écrit, conforme.

---

## Re-audit

- Re-audit du lot si la source `mukul975/Anthropic-Cybersecurity-Skills` est mise à jour de façon majeure, ou si un agent domaine « web-app pentest » est explicitement scopé en ROADMAP (alors revisiter la frontière exploitation-active via `config/permissions.json`, jamais en codant l'exploit).
- `hardening-waf-against-bypass` : re-audit prioritaire au prochain self-audit de phase-gate — confirmer que la frontière défensive tient et qu'aucun usage offensif n'a dérivé.

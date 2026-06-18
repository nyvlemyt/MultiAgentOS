# ECC Harvest — décisions cluster `cyber:web-application-security`, lot DE

Doer: lot DE (8 skills à titre offensif → **recadrage DÉFENSIF obligatoire**). Worktree `maos-ecc`, branche `phase/ecc-harvest`.
Source: `mukul975/Anthropic-Cybersecurity-Skills` (clone read-only `--depth 1`, Apache-2.0, auteur `mahipal`). Sources lues dans `/tmp/cybersec-inspect/skills/<slug>/SKILL.md`.

**Méthode**: intake-audit, barre = *garde-fou défensif* (CLAUDE.md §5/§11/§12). Critère KILL explicite : une skill purement offensive, sans valeur DÉTECTION/MITIGATION transférable au blue-team, ou dont la lentille défensive duplique déjà un keeper/asset existant, est **rejetée**. Chaque keeper est reframé vers DÉTECTER (signatures WAF/ModSecurity + logs) + MITIGER (code/config sûrs) + implémentation sécurisée pour notre stack Next.js/Node + `mas-sec-reviewer`. Les payloads weaponisés (RCE, gadgets, chaînes d'exfil) sont strippés ; on ne garde que la mécanique de détection et le pattern de code sûr.

**Sanitize** (regex secrets/PII/internal): 8/8 sources clean. `@anthropic-ai/sdk`: absent des sources. Recadrage transverse §11: tout chiffre de coût = unités de quota d'abonnement, jamais $/€ (non pertinent ici — skills sans coût).

**Frameworks préservés** depuis le frontmatter d'origine : `nist_csf`, `mitre_attack` (et `nist_ai_rmf`/`atlas_techniques` pour modsecurity).

**Bilan lot DE : 7 keepers, 1 reject.**

---

## defending-against-prototype-pollution  *(source: exploiting-prototype-pollution-in-javascript)*
- **décision**: adapt (recadrage défensif)
- **raison**: classe propre à JavaScript/Node — donc risque de **première main** sur notre cockpit Next.js 15 + parsing JSON. Forte valeur défensive : DÉTECTION (clés `__proto__`/`constructor`/`prototype` dans body/query/fragment = signal d'attaque quasi-certain, signature WAF/ModSecurity + log) + MITIGATION (`Object.create(null)`, `Object.freeze(Object.prototype)`, strip des 3 clés avant tout deep-merge, `Map` pour données user-controlled, pin/patch lodash/merge-deep). Mappe directement §5 (input non-fiable ne doit jamais atteindre un sink exec/auth) + `mas-sec-reviewer`.
- **strip**: chaînes RCE EJS/Pug/Handlebars, gadgets DOM-XSS (`innerHTML`/`transport_url`), `ppfuzz`/nuclei offensifs → réduits à une mention « patcher les deps vulnérables ». Conservé : signatures de détection + patterns de code sûr.
- **dedup**: non — aucune skill JS-prototype existante ; complète secure-coding sans le dupliquer.
- **chemin library**: `packages/skills/library/defending-against-prototype-pollution/SKILL.md`
- **état**: boosté conforme (ligne 1 `---`, commentaire source, summary L1, metadata+frameworks, Prompt Defense Baseline verbatim, 7 sections §12 = Overview/Principles[cite source]/Process[detect+mitigate]/Rationalizations/Red Flags/Verification, 0 `@anthropic-ai/sdk`, 0 secret, 0 payload weaponisé).

## defending-against-race-conditions  *(source: exploiting-race-condition-vulnerabilities)*
- **décision**: adapt (recadrage défensif)
- **raison**: TOCTOU / limit-overrun mappe **directement** notre risque interne : les compteurs `budgets`/quota (TOKEN_STRATEGY §8) et tout job worker mutant l'état SQLite partagé. Un check-then-act non atomique laisserait des dispatch-ticks parallèles dépasser le plafond d'abonnement §11. Forte valeur défensive : DÉTECTION (signature log = N requêtes state-changing quasi-simultanées sur une session/ressource + alarme limit-overrun + réconciliation d'invariant) + MITIGATION (`SELECT FOR UPDATE`, UPDATE conditionnel atomique, idempotency keys, optimistic concurrency via colonne `version`, lock distribué si multi-instance).
- **strip**: scripts Turbo-Intruder single-packet/last-byte-sync, threading offensif, racepwn → réduits à la *signature de trafic* à détecter. Conservé : patterns de concurrence sûrs.
- **dedup**: non — distinct du rate-limiting ; complète la garde budget §11 sans la dupliquer (elle ne traite pas la concurrence aujourd'hui).
- **chemin library**: `packages/skills/library/defending-against-race-conditions/SKILL.md`
- **état**: boosté conforme (8 sections, frameworks préservés, 0 sdk, 0 secret, 0 payload weaponisé).

## defending-against-ssrf  *(source: exploiting-server-side-request-forgery)*
- **décision**: adapt (recadrage défensif)
- **raison**: mappe **directement** §5 (`config/permissions.json#allowed_hosts`, network calls gated) — la défense SSRF *est* cet allowlist fait rigoureusement. Cible : tout fetch sortant user-supplied (webhook, import-URL, link preview, avatar). Forte valeur : DÉTECTION (log de l'IP résolue + alerte sur ranges privés/loopback/link-local 169.254/16/metadata, signatures encoding-tricks octal/hex/decimal/IPv6 + schémas file/gopher/dict) + MITIGATION (allowlist sur IP résolue fail-closed, block ranges privés, DNS resolve-then-pin anti-rebinding, schémas http/https only, proxy sortant contrôlé, IMDSv2 + rôle least-privilege).
- **strip**: payloads de vol de creds IAM cloud, gopher→Redis RCE, SSRFmap/interactsh offensifs, scans réseau internes → réduits aux *signatures à détecter*. Conservé : design allowlist/filtre SSRF.
- **dedup**: non — opérationnalise §5 sans le dupliquer (§5 énonce la règle ; cette skill donne le contrôle technique).
- **chemin library**: `packages/skills/library/defending-against-ssrf/SKILL.md`
- **état**: boosté conforme (8 sections, frameworks préservés inc. T1078.004, 0 sdk, 0 secret, 0 payload weaponisé).

## exploiting-sql-injection-with-sqlmap
- **décision**: reject
- **raison**: ce n'est pas une *classe de vulnérabilité* à défendre mais un **mode d'emploi de bout en bout d'un framework offensif** (sqlmap : `--dbs`/`--dump`, crack de hashes `--passwords`, `--os-cmd` RCE, `--file-read /etc/passwd`, tamper-scripts d'évasion WAF). C'est l'opération d'une arme, pas un savoir bleu. La seule lentille défensive transférable — requêtes paramétrées, moindre privilège DB, détection WAF d'injection — est **déjà couverte** par notre keeper `implementing-web-application-logging-with-modsecurity` (signatures CRS 942xxx SQLi) et la posture secure-coding ; l'inclure dupliquerait sans rien ajouter et conserverait une charge offensive (drivers d'exfil, évasion WAF) contraire au garde-fou.
- **KILL**: weapon pur (driver d'exploitation/exfil + évasion WAF), valeur défensive dup-no-better de modsecurity + secure-coding.
- **dedup**: oui — détection injection = modsecurity (CRS) ; mitigation = parameterized queries (secure-coding, déjà doctrine).
- **chemin library**: aucun.
- **état**: rejeté. **Re-audit**: non — la détection/mitigation SQLi est déjà chez nous (modsecurity + secure-coding) ; rouvrir seulement si une skill *purement défensive* « secure database access / SQLi detection » sans driver offensif est explicitement scopée.

## defending-against-template-injection  *(source: exploiting-template-injection-vulnerabilities)*
- **décision**: adapt (recadrage défensif)
- **raison**: cause racine = input user du côté template de la frontière data/template ; concerne nos templates email/report, pages d'erreur, et vues React (CSTI→XSS). Forte valeur : DÉTECTION (signature probe `{{7*7}}`/`${7*7}`/`#{}`/`<%= %>`, le résultat arithmétique reflété = tell ; WAF/ModSecurity + fingerprint d'internals moteur) + MITIGATION (jamais concaténer input dans le template, env sandboxé / moteur logic-less, allowlist de variables exposées, React = données échappées pas `dangerouslySetInnerHTML`, OS user least-privilege). Mappe §5 (input non-fiable ≠ sink exec).
- **strip**: chaînes RCE Jinja2 MRO/`__subclasses__`/`cycler`/`lipsum`, Freemarker `Execute`, Velocity/Smarty/ERB/Pebble RCE, tplmap/SSTImap `--os-shell` → réduits au seul *tell de détection*. Conservé : patterns de rendu sûr.
- **dedup**: non — distinct de prototype-pollution et du XSS réfléchi simple ; couvre le couple SSTI+CSTI propre à notre surface de rendu.
- **chemin library**: `packages/skills/library/defending-against-template-injection/SKILL.md`
- **état**: boosté conforme (8 sections, frameworks préservés, 0 sdk, 0 secret, 0 payload weaponisé).

## defending-against-type-juggling  *(source: exploiting-type-juggling-vulnerabilities)*
- **décision**: adapt (recadrage défensif + transfert PHP→JS/TS)
- **raison**: source PHP (`==`, `strcmp` NULL, magic hashes `0e`), mais la *leçon racine* est agnostique et frappe notre stack TS/JS (`==` coerce, checks truthy acceptent trop). Forte valeur secure-coding : DÉTECTION (signature type-anomaly = champ auth en JSON `true`/`0`/`null`/`[]`, password en array, magic-hash `0e...` ; lint CI `eqeqeq`/Psalm) + MITIGATION (`===` strict sur tout chemin auth, validation de type au boundary via schema/zod, comparaison hash constant-time `crypto.timingSafeEqual`/`password_verify`, autorisation par valeur exacte pas truthy). Mappe §5 + `mas-sec-reviewer`.
- **strip**: drivers de bypass automatisés (Burp Intruder, scripts Python d'essai de payloads, phpggc) → les tables magic-hash sont gardées **uniquement comme justification** du danger de `==`, pas comme kit. Aucun driver offensif conservé.
- **dedup**: non — aucune skill secure-comparison existante ; recadrée sur notre langage (TS) tout en préservant l'origine PHP.
- **chemin library**: `packages/skills/library/defending-against-type-juggling/SKILL.md`
- **état**: boosté conforme (8 sections, frameworks préservés, 0 sdk, 0 secret, 0 payload weaponisé).

## defending-against-websocket-attacks  *(source: exploiting-websocket-vulnerabilities)*
- **décision**: adapt (recadrage défensif)
- **raison**: MAOS exploite un canal temps-réel worker↔web (SSE aujourd'hui, potentiellement WS) — donc CSWSH, message-injection, channel-IDOR sont des risques de première main. Forte valeur : DÉTECTION (log Origin du handshake + alerte sur upgrade cross-origin = CSWSH ; signatures injection dans payloads ; IDOR/flood) + MITIGATION (valider Origin + token CSRF au upgrade, **autoriser chaque message** pas juste la connexion, sanitize payloads server-side, WSS only, rate-limit par connexion, invalidation socket au logout, tokens per-message). Mappe §5.
- **strip**: PoC HTML CSWSH d'exfil (`fetch` vers attacker server), driver Python d'injection/IDOR/flood, scripts wscat/websocat offensifs → réduits aux *signatures à détecter*. Conservé : design canal sécurisé.
- **dedup**: non — aucune skill canal temps-réel existante ; complète §5 pour la surface streaming.
- **chemin library**: `packages/skills/library/defending-against-websocket-attacks/SKILL.md`
- **état**: boosté conforme (8 sections, frameworks préservés, 0 sdk, 0 secret, 0 payload weaponisé).

## implementing-web-application-logging-with-modsecurity  *(source: idem)*
- **décision**: adapt (déjà défensif — boost §12)
- **raison**: skill **nativement bleue** (WAF ModSecurity + OWASP CRS, detection + audit logging). C'est le **bras DÉTECTION** de tout le cluster : chaque autre keeper nomme une signature WAF/log qui vit ici (clés prototype-pollution, probes SSTI `{{7*7}}`, URLs SSRF metadata/private-range, upgrades WS cross-origin, SQLi 942xxx). Contrepartie opérationnelle de §5 + alimente `mas-sec-reviewer`. Process: DetectionOnly→paranoia→audit RelevantOnly→tune FP→blocking→SIEM.
- **strip**: rien d'offensif dans la source ; ajout d'un garde-fou explicite « configure des WAF que TU opères, jamais pour évader/attaquer un WAF tiers ».
- **dedup**: non — c'est le socle de détection que les 6 autres keepers référencent ; aucun équivalent existant.
- **chemin library**: `packages/skills/library/implementing-web-application-logging-with-modsecurity/SKILL.md`
- **état**: boosté conforme (8 sections, frameworks préservés inc. `nist_ai_rmf`+`atlas_techniques`+T1083, 0 sdk, 0 secret).

---

## Synthèse lot DE

| slug source | décision | chemin library |
|---|---|---|
| exploiting-prototype-pollution-in-javascript | adapt | defending-against-prototype-pollution |
| exploiting-race-condition-vulnerabilities | adapt | defending-against-race-conditions |
| exploiting-server-side-request-forgery | adapt | defending-against-ssrf |
| exploiting-sql-injection-with-sqlmap | **reject** | — (dup modsecurity+secure-coding ; weapon) |
| exploiting-template-injection-vulnerabilities | adapt | defending-against-template-injection |
| exploiting-type-juggling-vulnerabilities | adapt | defending-against-type-juggling |
| exploiting-websocket-vulnerabilities | adapt | defending-against-websocket-attacks |
| implementing-web-application-logging-with-modsecurity | adapt | implementing-web-application-logging-with-modsecurity |

**7 keepers, 1 reject.** Tous les keepers : ligne 1 `---`, commentaire source verbatim, summary L1 ≤200 tok, metadata complet + `frameworks` préservés, Prompt Defense Baseline verbatim, 7 sections §12 (Overview/Principles[cite source]/Process=detect+mitigate/Rationalizations/Red Flags/Verification), recadrés DÉFENSIVEMENT (DÉTECTER + MITIGER + implémentation sûre), payloads weaponisés strippés, 0 `@anthropic-ai/sdk`, 0 secret/PII. Mapping transverse: §5 (input non-fiable ≠ sink exec/auth, allowed_hosts), Next.js/Node, `mas-sec-reviewer`.

# ECC Harvest — décisions cluster `cyber:mobile-security` (lot CC)

Doer: lot CC (6 skills sources). Worktree `maos-ecc`, branche `phase/ecc-harvest`. Méthode: intake-audit, tier T2 (bibliothèque verticale défensive).
Source: `mukul975/Anthropic-Cybersecurity-Skills` (Apache-2.0, clone read-only). Cible: `packages/skills/library/<defensive-slug>/SKILL.md`.
Recadrage transverse: MAOS = abonnement (§11), PAS de coût per-token PAYG → tout chiffre = quota d'abonnement, jamais $/€. Tests own-app autorisés sur device de test ; toute action active sur device est §5-gated. Aucun secret, aucun `@anthropic-ai/sdk` (absent des sources), aucun payload d'exploit fonctionnel.

## Garde-fou DEFENSIVE-REFRAME

Le lot mélange des skills à titre offensif (`exploiting-*`, `performing-*bypass`, `intercepting-*`) et des skills déjà défensifs (`testing-*`). Tous les `exploiting/performing/intercepting` ont été recadrés en test own-app + durcissement, RENOMMÉS, avec les payloads RETIRÉS (détection + secure-config + remédiation uniquement). Chaque corps porte la `## Prompt Defense Baseline` VERBATIM + 7 sections §12. Les frameworks natifs (OWASP MASVS/MASTG, CWE, MITRE ATT&CK, NIST CSF/AI-RMF, ATLAS) ont été préservés dans `metadata.frameworks`. Bilan: **6 keepers, 0 reject** — chaque source a survécu à une lentille défensive own-app.

## Dedup intents ↔ deeplinks

Les deeplinks (schémas URI custom, App Links/Universal Links) sont un sous-ensemble de la surface intent Android, MAIS chaque source porte une technique unique :
- **deeplinks**: points d'entrée par lien externe, vérification d'association de domaine (`assetlinks.json` / `apple-app-site-association`), spécificités iOS, chargement d'URL en WebView, hijacking par enregistrement concurrent.
- **intents**: surface IPC complète — composants exportés (activities/services/receivers/content providers), surface d'attaque Drozer, sécurité des broadcasts, mutabilité des PendingIntent, SQLi/traversal des content providers.

Chevauchement réel mais techniques disjointes → **gardés distincts**, avec renvoi croisé dans les deux corps (« deep links = sous-ensemble link-entry des intents »).

---

## exploiting-deeplink-vulnerabilities
- **décision**: adapt (recadrage défensif + renommage)
- **slug library**: `testing-own-app-for-deeplink-vulnerabilities`
- **raison**: lentille de test own-app du surface deep-link (énumération des schémas/hosts, vérification d'association de domaine App Links/Universal Links, validation des paramètres, sécurité WebView, résistance au hijacking). Payloads d'injection retirés ; sortie = finding mappé MASVS-PLATFORM/MASTG + CWE-601/939/927/749 + remédiation. Actions actives device §5-gated.
- **frameworks préservés**: MASVS-PLATFORM, MASTG, OWASP-Mobile-M4, CWE, MITRE ATT&CK (T1059/T1056/T1036), NIST CSF.
- **dedup**: distinct de `testing-android-intents` (sous-ensemble link-entry, renvoi croisé).
- **état**: keeper. KILL applicables: app non possédée / sans autorisation écrite → out of scope ; demande de payload fonctionnel → refus. Re-audit: si le repo source >6 mois stale ou si OWASP MASVS sort une révision majeure.

## exploiting-insecure-data-storage-in-mobile
- **décision**: adapt (recadrage défensif + renommage)
- **slug library**: `testing-own-app-for-insecure-data-storage`
- **raison**: lentille de durcissement data-at-rest own-app (OWASP M9 / MASVS-STORAGE). Inventaire des sinks (SharedPreferences/SQLite/plist/keychain/backup/logs/clipboard), vérification absence de plaintext, garde de la clé séparée du chiffrement, classe de protection keychain correcte, exclusion backup. Recettes d'extraction retirées ; sortie = finding MASVS-STORAGE + CWE-312/522/359 + remédiation.
- **frameworks préservés**: MASVS-STORAGE, MASTG, OWASP-Mobile-M9, CWE, ATLAS (AML.T0057), NIST AI-RMF, MITRE ATT&CK, NIST CSF.
- **dedup**: aucune collision (cluster propre).
- **état**: keeper. KILL: extraction sur device de production / app non possédée → out of scope ; recette d'extraction → refus. Re-audit: idem (repo stale / révision MASVS).

## performing-mobile-app-certificate-pinning-bypass
- **décision**: adapt (recadrage défensif + renommage) — lentille défensive a SURVÉCU
- **slug library**: `hardening-mobile-app-certificate-pinning`
- **raison**: la connaissance des points de bypass (hooks Frida/Objection sur TrustManagerImpl, OkHttp CertificatePinner, NSURLSession delegate, SecTrustEvaluate) mappe one-to-one sur des points de durcissement → utilisée pour LAYER les défenses (pinning multi-couche, validation en code natif, CT, anti-instrumentation/anti-Frida + détection root/jailbreak, rotation de pins). Vérification = tenter un bypass sur SON PROPRE build sur device de test et confirmer que les connexions pinées échouent / que la détection de tampering se déclenche. Scripts de bypass fonctionnels RETIRÉS ; sortie = plan de durcissement + détection mappé MASVS-NETWORK + CWE-295. Si une requête n'a aucune lentille défensive (bypass pur d'app tierce) → REJECT explicite dans le corps.
- **frameworks préservés**: MASVS-NETWORK, MASTG, OWASP-Mobile-M5, CWE-295/296/940, MITRE ATT&CK (incl. T1027), NIST CSF.
- **dedup**: complémentaire de `assessing-own-mobile-app-traffic` (on proxy son propre build pour vérifier le pinning) — renvoi croisé.
- **état**: keeper. KILL: bypass d'app non possédée → REJECT ; demande de script de bypass universel → refus. Re-audit: idem.

## intercepting-mobile-traffic-with-burpsuite
- **décision**: adapt (recadrage défensif + renommage)
- **slug library**: `assessing-own-mobile-app-traffic`
- **raison**: lentille d'évaluation du trafic own-app via proxy d'interception (Burp/mitmproxy) sur device de test — vérification TLS partout (pas de cleartext), headers de sécurité (HSTS/CSP), absence de PII/credentials/tokens en transit ou dans les corps d'erreur, tokens pas dans l'URL. CA de test installée uniquement pour son propre build. Scripts d'exploitation retirés ; sortie = finding MASVS-NETWORK + CWE-319/200/598 + remédiation.
- **frameworks préservés**: MASVS-NETWORK, MASTG, OWASP-Mobile-M5, CWE, MITRE ATT&CK, NIST CSF.
- **dedup**: l'analyse auth profonde est déléguée à `testing-mobile-api-authentication` ; la vérif pinning à `hardening-mobile-app-certificate-pinning` (pas de duplication, renvois croisés).
- **état**: keeper. KILL: interception sur device de production / app non possédée → out of scope. Re-audit: idem.

## testing-android-intents-for-vulnerabilities
- **décision**: adapt (recadrage défensif, NOM CONSERVÉ — déjà testing-* own-app)
- **slug library**: `testing-android-intents-for-vulnerabilities`
- **raison**: lentille de durcissement IPC own-app — énumération de la surface exportée (activities/services/receivers/content providers), vérification exported=false sauf nécessité, gating par permission, PendingIntent FLAG_IMMUTABLE, requêtes content-provider paramétrées (anti-SQLi/traversal), note sur le flip du défaut android:exported à l'API 31+. Commandes Drozer offensives reformulées en checklist de vérif ; sortie = finding MASVS-PLATFORM + CWE-926/927/89/22 + remédiation.
- **frameworks préservés**: MASVS-PLATFORM, MASTG, OWASP-Mobile-M6, CWE, MITRE ATT&CK (incl. T1055), NIST CSF.
- **dedup**: distinct de `testing-own-app-for-deeplink-vulnerabilities` (deeplinks = sous-ensemble link-entry ; renvoi croisé bidirectionnel).
- **état**: keeper. KILL: test sur device de production / app non possédée → out of scope ; payload d'exploit → refus. Re-audit: idem.

## testing-mobile-api-authentication
- **décision**: adapt (recadrage défensif, NOM CONSERVÉ — déjà testing-* own-app)
- **slug library**: `testing-mobile-api-authentication`
- **raison**: lentille de durcissement auth/authz du backend own-app (OWASP API Top-10 / MASVS-AUTH). Vérif JWT (rejet none-alg + confusion RS256→HS256, clé forte, exp), cycle de vie des tokens (invalidation logout + changement de mot de passe, pas de token en URL), authz par objet server-side (anti-BOLA/IDOR), OAuth PKCE + allowlist redirect_uri. Recettes de cracking HMAC et payloads retirés ; sortie = finding OWASP-API (API1/API2/API5) + CWE-287/639/862/347/613 + remédiation. Probing actif/sortant §5-gated, pacing rate-limit-aware.
- **frameworks préservés**: MASVS-AUTH, MASTG, OWASP-API-Top-10, CWE, MITRE ATT&CK (incl. T1068), NIST CSF.
- **dedup**: pairé avec `assessing-own-mobile-app-traffic` (qui fournit les endpoints/tokens analysés ici) — renvoi croisé, pas de duplication.
- **état**: keeper. KILL: API non possédée / sans autorisation → out of scope ; recette de cracking ou exploit → refus. Re-audit: idem (repo stale / révision OWASP API Top-10).

---

## Synthèse

6 sources → 6 keepers (4 adapt+rename, 2 adapt nom-conservé), 0 reject. Cluster `cyber:mobile-security` couvert: surface link-entry (deeplinks), surface IPC (intents), data-at-rest (storage), transport (pinning + traffic), auth backend (api-auth). Tous T2 bibliothèque, tous own-app défensif + §5-gated + §11 quota. Renvois croisés établis pour éviter la duplication entre les 6.

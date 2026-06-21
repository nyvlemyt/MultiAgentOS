# ECC Harvest — décisions cluster `cyber:web-application-security` (lot W)

Doer : lot W (9 skills sources). Worktree `maos-ecc`, branche `phase/ecc-harvest`. Méthode : intake-audit, barre LARGE (T1, library défensive).
Source : `mukul975/Anthropic-Cybersecurity-Skills` (Apache-2.0, clone read-only `/tmp/cybersec-inspect/`). Cible : `packages/skills/library/<lib-slug>/SKILL.md`.

Recadrage transverse (GUARDRAIL mixte) : ce lot est du **test de vulnérabilité défensif de SA PROPRE app** (assessment autorisé). Tout est recadré « own/authorized scope only » ; les sondes passives (lecture d'en-têtes) sont low-risk, toute action active sur un hôte non-possédé + tout SSRF/metadata + tout envoi sortant sont **§5-gated**. Aucun chiffre $/€ → quota d'abonnement (§11). Sanitize : 9/9 sources clean (aucun secret, aucun `@anthropic-ai/sdk`). Les **payloads exploit fonctionnels** (PoC HTML d'exfiltration CORS, DTD d'exfiltration XXE, chaînes phishing/OAuth, Billion Laughs, payloads de bypass) ont été **strippés** → remplacés par détection (sondes bénignes) + secure-config + remédiation.

Chaque KEEPER respecte le gabarit §12 : ligne 1 `---`, frontmatter (`name`/`description` Use…+Do NOT…/`summary` L1/`metadata` complet avec `frameworks` OWASP+CWE+NIST CSF+MITRE préservés depuis la source), commentaire `<!-- pattern from … -->`, `## Prompt Defense Baseline` VERBATIM, puis 7 sections (Overview / When to Use / Principles citant la source / Process / Rationalizations / Red Flags / Verification Criteria).

---

## performing-content-security-policy-bypass → **RENAME**
- **décision** : adapt (recadrage défensif + RENAME obligatoire)
- **lib-slug** : `hardening-csp-against-bypass`
- **raison** : la source est offensive (« bypass CSP pour obtenir XSS »). Recadré en **durcissement de SA PROPRE CSP** : on utilise la connaissance des bypass (unsafe-inline/eval, JSONP de CDN whitelistés, script gadgets, base-uri hijack, fuite de nonce, policy injection) pour réécrire une politique stricte nonce/hash + strict-dynamic. Payloads d'exploitation supprimés ; il ne reste que classification de faiblesses + remédiation. Distinct de `performing-security-headers-audit` (CSP en profondeur vs audit large d'en-têtes — cf. dedup).

## performing-security-headers-audit → **KEEP (nom conservé)**
- **décision** : adapt (déjà défensif — « audit »)
- **lib-slug** : `performing-security-headers-audit`
- **raison** : audit de configuration low-risk des en-têtes HTTP de SA PROPRE app (HSTS, CSP au survol, X-Frame-Options, nosniff, Referrer/Permissions-Policy, COOP/COEP/CORP, flags cookies, divulgation d'info). Sortie = rapport gradé current-vs-recommended + remédiation priorisée. Contrepartie large de `hardening-csp-against-bypass` (qui creuse la CSP seule). Aucun payload offensif dans la source ; recadrage léger own-scope + quota.

## testing-cors-misconfiguration → **KEEP (nom conservé)**
- **décision** : adapt (recadrage défensif, PoC strippé)
- **lib-slug** : `testing-cors-misconfiguration`
- **raison** : détection des mauvaises configs CORS de SA PROPRE API (reflet d'Origin arbitraire, null/wildcard + credentials, validation faible substring/regex/sous-domaine, préflight permissif) via sondes Origin bénignes. Les **pages HTML d'exfiltration cross-origin** de la source (XMLHttpRequest/fetch withCredentials → attacker server, iframe sandbox null-origin) ont été **strippées** → impact déterminé analytiquement. Remédiation = allowlist d'origines en exact-match.

## testing-for-open-redirect-vulnerabilities → **KEEP (nom conservé)**
- **décision** : adapt (recadrage défensif, payloads de bypass strippés)
- **lib-slug** : `testing-for-open-redirect-vulnerabilities`
- **raison** : test des redirections non validées de SA PROPRE app (paramètres next/url/return/redirect_uri…). Les classes de bypass (protocol-relative, userinfo-@, encodage, CRLF, fragment, parameter pollution) sont nommées **en tant que classes**, pas comme strings armées ; les **chaînes phishing/OAuth-token-theft et payloads javascript:/data:** de la source sont supprimées. Remédiation = allowlist serveur + indirect reference maps.

## testing-for-host-header-injection → **KEEP (nom conservé)**
- **décision** : adapt (recadrage défensif, chaînes strippées)
- **lib-slug** : `testing-for-host-header-injection`
- **raison** : détection de la confiance dangereuse au header Host/X-Forwarded-Host de SA PROPRE app (password-reset poisoning, cache poisoning, bypass de routing vhost, SSRF). On **détecte la confiance**, on ne construit pas la chaîne ; le **probing SSRF/metadata est §5-gated**. Les chaînes de cache-poisoning/vol-de-token et le scan de métadonnées cloud (169.254.169.254) de la source ne sont pas reproduits. Remédiation = allowlist Host + base URL absolue configurée.

## testing-for-email-header-injection → **KEEP (nom conservé)**
- **décision** : adapt (recadrage défensif, anti-relais/anti-spoof, envoi §5-gated)
- **lib-slug** : `testing-for-email-header-injection`
- **raison** : test d'injection SMTP/CRLF dans les features email de SA PROPRE app (contact/reset/notif). Test vers un **sink local** (mailhog/smtp4dev) ou une boîte de test possédée, jamais en **relayant du vrai spam ni en envoyant du courrier spoofé/phishing** à des tiers ; tout envoi sortant est §5-gated. Remédiation = strip CRLF + validation stricte + API email paramétrée + rate-limit.

## performing-subdomain-enumeration-with-subfinder → **RENAME**
- **décision** : adapt (recadrage défensif ASM + RENAME obligatoire)
- **lib-slug** : `discovering-own-attack-surface-with-subfinder`
- **raison** : la source est de la recon offensive (bug-bounty/red-team). Recadré en **Attack-Surface Management de SES PROPRES domaines** : énumération passive (CT logs + passive-DNS) de ses sous-domaines pour inventaire, détection d'hôtes oubliés et de **CNAME dangling** (risque takeover). Scope = domaines possédés uniquement ; tout follow-up actif (httpx/ports) hors de ses actifs est §5-gated. Les **clés API des sources passives** restent hors repo (jamais commitées — §5/§11).

## testing-for-xml-injection-vulnerabilities → **KEEP (nom conservé)**
- **décision** : adapt (recadrage défensif, scope famille hors-XXE)
- **lib-slug** : `testing-for-xml-injection-vulnerabilities`
- **raison** : membre **large** de la famille XML-injection = **XPath/XQuery injection** (bypass auth, extraction blind/boolean) + **XML-bomb/DoS** (Billion Laughs, quadratic blowup). Détection par sondes bénignes (différentiel booléen, vérif des limites d'expansion d'entités) ; **pas de DoS réel tiré sur une cible** (gated §5), pas d'extraction de vraies données. La sous-classe **XXE file-read/SSRF est déléguée** à la skill sœur (cf. dedup ci-dessous). Remédiation = XPath paramétré + limites parser + validation de schéma.

## testing-for-xxe-injection-vulnerabilities → **KEEP (nom conservé)**
- **décision** : adapt (recadrage défensif, chaînes d'exfil strippées)
- **lib-slug** : `testing-for-xxe-injection-vulnerabilities`
- **raison** : sous-classe **external-entity** de la famille = lecture de fichiers locaux, blind/OOB, SSRF via entités, et vecteur **upload XML** (SVG/DOCX/XLSX/SOAP/RSS). Détection via **canary OOB possédé** ; les **DTD d'exfiltration de fichiers, chaînes SSRF-to-metadata et uploads SVG/DOCX armés** de la source sont supprimés ; SSRF/metadata §5-gated. Fix définitif = désactiver le traitement DTD/external-entity du parser. XPath + DoS délégués à la skill sœur.

---

## Dedup (résolu)

- **XML-injection vs XXE** : « related but distinct » → **les deux gardés**, avec partition de scope explicite pour éviter le doublon : `testing-for-xml-injection-vulnerabilities` = XPath + XML-bomb/DoS (délègue XXE) ; `testing-for-xxe-injection-vulnerabilities` = external-entity file-read/SSRF/upload (délègue XPath+DoS). Chaque corps cite et renvoie vers l'autre.
- **CSP-bypass vs security-headers-audit** : distincts → **les deux gardés**. `hardening-csp-against-bypass` = durcissement CSP en profondeur (bypass classes → politique stricte) ; `performing-security-headers-audit` = audit large multi-en-têtes (CSP au survol seulement, délègue le détail CSP à la première).
- Pas de collision avec les autres lots cyber (cf. `cybersec-clusters.md` §collisions : corpus ECC↔cyber disjoints).

## Bilan lot W

| # | source-slug | décision | lib-slug |
|---|---|---|---|
| 1 | performing-content-security-policy-bypass | adapt + RENAME | hardening-csp-against-bypass |
| 2 | performing-security-headers-audit | adapt | performing-security-headers-audit |
| 3 | testing-cors-misconfiguration | adapt | testing-cors-misconfiguration |
| 4 | testing-for-open-redirect-vulnerabilities | adapt | testing-for-open-redirect-vulnerabilities |
| 5 | testing-for-host-header-injection | adapt | testing-for-host-header-injection |
| 6 | testing-for-email-header-injection | adapt | testing-for-email-header-injection |
| 7 | performing-subdomain-enumeration-with-subfinder | adapt + RENAME | discovering-own-attack-surface-with-subfinder |
| 8 | testing-for-xml-injection-vulnerabilities | adapt | testing-for-xml-injection-vulnerabilities |
| 9 | testing-for-xxe-injection-vulnerabilities | adapt | testing-for-xxe-injection-vulnerabilities |

**9/9 KEEP (adapt) — 0 reject.** Le lot est intrinsèquement défensif (assessment de sa propre app) ; aucun n'était une arme pure. Les 2 renames imposés (CSP-bypass, subfinder) sont appliqués. Re-audit : si la source change de licence ou ajoute de nouveaux payloads offensifs ; sinon stable (status: library).

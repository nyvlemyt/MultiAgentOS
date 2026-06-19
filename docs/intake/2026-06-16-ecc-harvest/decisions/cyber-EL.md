# ECC Harvest — décisions cluster `cyber:phishing-defense` (lot EL)

Doer : lot EL (7 skills). Worktree `maos-ecc`, branche `phase/ecc-harvest`.
Source : `mukul975/Anthropic-Cybersecurity-Skills` (clone read-only, Apache-2.0, auteur frontmatter `mahipal`).
Cible keepers : `packages/skills/library/<slug>/SKILL.md` (forme exemplaire §12, T1, status library).
Méthode : `intake-audit` cycle complet par skill — barre LARGE (défense blue-team), KILL sur weaponization / mass-targeting / evasion.

Recadrage transverse (CLAUDE.md §5/§11) : MAOS = abonnement, jamais de chiffre $/€ → tout coût en *quota units*. Envois sortants, écritures DNS/MX, rétractation post-livraison touchant des boîtes = actions risquées **human-gated §5**. Identifiants admin/API = fournis au runtime, jamais embarqués.

Sanitize (regex secrets/PII/`@anthropic-ai/sdk`) : **7/7 sources clean** (le seul `Username/Password: Service account credentials` du source gophish est un *libellé placeholder*, pas un secret — et ce skill est rejeté).

Bilan : **3 keepers** · **4 folds/rejects** (3 fold-vendeurs + 1 dup gophish).

---

## implementing-secure-email-gateway  *(keeper — gateway vendor-neutre, réceptacle des folds)*
- **décision** : adapt (keeper)
- **raison** : doctrine SEG vendor-neutre — six couches de protection ordonnées (réputation connexion → authentification SPF/DKIM/DMARC → contenu/ML pour BEC+impersonation → réécriture URL + sandbox au clic → détonation pièce jointe → rétractation post-livraison), plan de bascule MX réversible et observé, tuning faux-positifs. Base = `implementing-proofpoint-email-security-gateway` (le plus complet : couvre les 6 couches, déploiement MX/API/hybride, TRAP, DMARC inbound). Recadré défensif : lit la config et propose ; tout envoi sortant / écriture DNS-MX / rétractation = gate §5.
- **dedup** : non — aucun gateway dans `packages/skills/library/`. Distinct de `detecting-email-account-compromise` (post-compromission), `investigating-phishing-email-incident` (1 message), `implementing-soar-playbook-for-phishing` (orchestration SOAR). Consomme la sortie de `performing-dmarc-policy-enforcement-rollout` comme couche d'authentification.
- **folds (3 vendeurs repliés dans la table delta du keeper)** :
  - `implementing-proofpoint-email-security-gateway` → **base** du keeper (TAP/TRAP/Impostor Classifier/VAP/CLEAR en colonne Proofpoint).
  - `implementing-email-sandboxing-with-proofpoint` (Proofpoint TAP) → **fold** : sous-ensemble du gateway Proofpoint (détonation pièces jointes + URL Defense + VAP). Aucun delta hors de la couche « détonation » déjà couverte ; ses knobs spécifiques (profils sandbox Win/macOS/Android, dynamic delivery hold) absorbés dans la table delta. Raison fold : dup-no-better d'un sous-ensemble du gateway.
  - `implementing-mimecast-targeted-attack-protection` (Mimecast TTP) → **fold** : mêmes 4 fonctions (URL Protect, Attachment Protect, Impersonation Protect, Internal Email Protect) = isomorphe aux couches URL/attachment/BEC/post-livraison. Delta réel (Pre-Delivery Action *Hold* par défaut nov. 2025, Hit 3 / Hit 1 VIP, Safe-File vs Dynamic) capté en colonne Mimecast.
  - `implementing-google-workspace-phishing-protection` → **fold** : mêmes contrôles via Admin Console > Gmail > Safety (Enhanced Pre-Delivery Scanning, attachment protection, spoofing detection, Enhanced Safe Browsing, Advanced Protection Program FIDO2). Delta capté en colonne Google Workspace. Note : ne pas confondre avec `implementing-google-workspace-admin-security` / `-sso-configuration` déjà en lib (posture admin/SSO, pas anti-phishing email).
- **frameworks** : nist_csf [PR.AT-01, DE.CM-09, RS.CO-02, DE.AE-02] · mitre_attack [T1566, T1598, T1534, T1036, T1027] (préservés depuis le source proofpoint-gateway, le plus large).
- **scores (0–5)** : project_fit 4 · token_efficiency 4 (un keeper au lieu de 4) · safety 5 (défensif, edges gated) · implementation_effort 4 · evidence_maturity 5 (vendeurs établis) · user_value 4 · phase_compatibility 5.
- **KILL** : aucun déclenché — défensif, secrets runtime, edges §5-gated. Pas de PAYG, pas d'exécution de code tiers.
- **chemin library** : `packages/skills/library/implementing-secure-email-gateway/SKILL.md`
- **état** : boosté, conforme exemplaire (L1 `---`, commentaire source, summary L1, metadata+frameworks, Prompt Defense Baseline verbatim, 7 sections §12 + table delta vendeurs, 0 `@anthropic-ai/sdk`, 0 secret).
- **re-audit** : si un vendeur publie une refonte majeure de modules (ex. Mimecast/Proofpoint architecture v.next) ou si MAOS scope un agent « email-ops » exécutant (alors gate §5 + `config/permissions.json`).

## performing-adversary-in-the-middle-phishing-detection  *(keeper)*
- **décision** : adapt (keeper)
- **raison** : détection/réponse défensive AiTM (proxy inverse Tycoon 2FA / EvilProxy / Evilginx / Sneaky 2FA volant le cookie de session post-MFA pour contourner le MFA). Cœur transférable pour MAOS : MFA résistant au phishing (FIDO2 lié à l'origine), durcissement Conditional Access (token binding, CAE, block proxy/Tor), règles de détection (auth puis session d'une IP différente, voyage impossible, création de règle inbox / consentement OAuth post-auth), chasse post-compromission. Recadré blue-team strict : la connaissance des kits sert *uniquement* à détecter ; aucun proxy/phishlet opéré.
- **dedup** : non — distinct du gateway (couche IdP/session, pas mail-flow) et de `detecting-email-account-compromise` (cet AiTM cible le vol de cookie/MFA-bypass spécifiquement). Alimente la doctrine auth/session MAOS + signaux pour `mas-sec-reviewer`.
- **frameworks** : nist_csf [PR.AT-01, DE.CM-09, RS.CO-02, DE.AE-02] · mitre_attack [T1566, T1598, T1534, T1036, T1003] (préservés — note : T1003 Credential Dumping ici par vol de cookie/session).
- **scores (0–5)** : project_fit 5 (auth/session = cœur MAOS) · token_efficiency 4 · safety 5 (défensif, edges §5 gated) · implementation_effort 4 · evidence_maturity 5 (kits 2025 documentés) · user_value 4 · phase_compatibility 5.
- **KILL** : aucun déclenché côté keeper. Garde-fou explicite : toute dérive vers déploiement de proxy / phishlets / capture de session réelle = REJET (abus offensif). Changements Conditional Access / révocations = §5-gated. Identifiants IdP/SIEM runtime.
- **chemin library** : `packages/skills/library/performing-adversary-in-the-middle-phishing-detection/SKILL.md`
- **état** : boosté, conforme exemplaire (L1 `---`, commentaire source, summary L1, metadata+frameworks, Prompt Defense Baseline verbatim, 7 sections §12, 0 sdk, 0 secret).
- **re-audit** : si de nouveaux kits PhaaS changent la mécanique de détection (ex. contournement FIDO2) ou évolution majeure des signaux Conditional Access/CAE.

## performing-dmarc-policy-enforcement-rollout  *(keeper)*
- **décision** : adapt (keeper)
- **raison** : rollout DMARC phasé (p=none → p=quarantine → p=reject) sans casser le mail légitime — inventaire des sources émettrices, alignement SPF/DKIM, ramp `pct` avec soak, rollback d'urgence, `sp=`. Couche d'authentification DNS, distincte de la config gateway. Recadré défensif : propose les enregistrements et analyse les rapports agrégés ; les écritures DNS = gate §5.
- **dedup** : non — aucune compétence DMARC/SPF/DKIM autonome en lib. Complémentaire : fournit la couche « authentification » consommée par `implementing-secure-email-gateway` ; pas un doublon de `implementing-dmarc-dkim-spf-email-security` (source non harvesté dans ce lot — celui-ci est la *doctrine de rollout phasé* spécifiquement, axe enforcement progressif).
- **frameworks** : nist_csf [PR.AT-01, DE.CM-09, RS.CO-02, DE.AE-02] · mitre_attack [T1566, T1598, T1534, T1036] (préservés ; pas de T1027 ici, source DMARC n'en porte pas).
- **scores (0–5)** : project_fit 4 · token_efficiency 4 · safety 5 (défensif, DNS gated §5) · implementation_effort 4 · evidence_maturity 5 (RFC 7208/6376/7489 + mandat Google/Yahoo) · user_value 4 · phase_compatibility 5.
- **KILL** : aucun. Garde-fou : écritures DNS = actions risquées §5 (un mauvais enregistrement peut blackholer le mail) → propose, humain publie.
- **chemin library** : `packages/skills/library/performing-dmarc-policy-enforcement-rollout/SKILL.md`
- **état** : boosté, conforme exemplaire (L1 `---`, commentaire source, summary L1, metadata+frameworks, Prompt Defense Baseline verbatim, 7 sections §12, 0 sdk, 0 secret).
- **re-audit** : si évolution des exigences bulk-sender (Google/Yahoo/Microsoft) ou nouvelle RFC DMARC (DMARCbis).

---

## performing-phishing-simulation-with-gophish  *(fold/reject — dup)*
- **décision** : reject (fold dans le keeper existant)
- **raison** : dup quasi-exacte de `running-authorized-phishing-simulation` (déjà harvesté lot EF, source `performing-red-team-phishing-with-gophish`) : même outil (GoPhish), mêmes composants (sending profile, email template, landing page, user group, campaign), même API. **Pire** que le keeper existant : ce source-ci oriente vers la **capture de credentials** (« Enable credential capture », « Capture simulated credentials on landing page ») et liste de l'outillage offensif (Evilginx2, King Phisher) — exactement ce que le keeper existant strippe et remplace par gouvernance + teach-on-click + métriques-seulement. Aucun delta distinct positif ; il n'apporte que du risque.
- **dedup** : oui — dup-no-better de `running-authorized-phishing-simulation`. Tout signal défensif utile (logistique GoPhish, métriques open/click/report) est déjà capté, en version durcie (own-org, consentement écrit, redirection training, gate §5).
- **fold** : éléments uniques (libellés de déploiement Docker/binaire) jugés non-essentiels et non repris — le keeper existant porte déjà le pattern campagne. Aucun nouveau fichier.
- **chemin library** : aucun (rejeté).
- **état** : rejeté. KILL : (a) **dup-no-better** d'un keeper existant ; (b) orientation **credential-capture** + outillage offensif (Evilginx2, King Phisher) = dérive weaponization que la consigne de lot REJETTE explicitement. Le placeholder `Username/Password: Service account credentials` du source n'est pas un secret réel.
- **re-audit** : non — conflit structurel (capture de credentials) + redondance ; rien à ré-auditer.

---

## Récapitulatif lot EL

| source-slug | décision | cible |
|---|---|---|
| implementing-proofpoint-email-security-gateway | base du keeper | `implementing-secure-email-gateway` |
| implementing-email-sandboxing-with-proofpoint | fold (table delta) | → keeper |
| implementing-mimecast-targeted-attack-protection | fold (table delta) | → keeper |
| implementing-google-workspace-phishing-protection | fold (table delta) | → keeper |
| performing-adversary-in-the-middle-phishing-detection | keeper | slug homonyme |
| performing-dmarc-policy-enforcement-rollout | keeper | slug homonyme |
| performing-phishing-simulation-with-gophish | reject (dup-no-better) | aucun |

**Keepers : 3** · folds : 3 · rejects : 1. Sanitize 7/7 clean. Frameworks préservés sur chaque keeper.

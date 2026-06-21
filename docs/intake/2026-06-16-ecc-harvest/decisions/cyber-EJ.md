# ECC Harvest — décisions cluster `cyber:zero-trust-architecture` (lot EJ)

Doer : lot EJ (8 skills zero-trust). Worktree `maos-ecc`, branche `phase/ecc-harvest`. Méthode : `intake-audit` lifecycle complet, barre LARGE (T1, défense).
Source : `mukul975/Anthropic-Cybersecurity-Skills` (clone read-only `--depth 1`, Apache-2.0, author `mahipal`). Cible : `packages/skills/library/<slug>/SKILL.md`.

**Charte défensive.** Les 8 skills sont 100 % défensifs (modèle de maturité CISA, posture d'appareil, vérification d'identité, microsegmentation, ZT-DNS, ZTNA, IAP HashiCorp). Aucune weaponisation détectée → aucun KILL offensif déclenché. Tous mappent sur **CLAUDE.md §5** (gating des actions risquées : sandbox projet, blocage écriture cross-projet, gates humains risk:high/blocking) — ce cluster est la **doctrine derrière notre garde-fou runtime**.

**Recadrage transverse (§11).** MAOS = abonnement, jamais de PAYG per-token. Toute mention de coût/effort = unités de quota contre la fenêtre (TOKEN_STRATEGY §8), jamais €/$. Les sources mukul975 sont déjà sans chiffre $ ; recadrage surtout préventif.

**Sanitize (secrets / PII / `@anthropic-ai/sdk`).** 8/8 sources scannées. Les corps contiennent des **placeholders** d'API tokens dans des snippets d'exemple (`${CS_TOKEN}`, `${GC_API_TOKEN}`, `${MDCA_API_TOKEN}`, `var.okta_client_secret`, clés AEAD `sP1fnF5Xz85RrXM...` tronquées dans Boundary) — ce sont des **variables d'environnement / placeholders illustratifs, aucun secret réel**. Les skills boostés ne recopient pas les snippets opérationnels longs : ils en distillent le **pattern** (process numéroté), donc zéro secret propagé. `@anthropic-ai/sdk` : absent des 8 sources.

**Dedup zscaler (note tâche).** Le skill `implementing-zero-trust-network-access-with-zscaler` traite **ZPA / ZTNA — remplacement de VPN, accès identity-based aux apps privées via outbound-only tunnels**. C'est un delta distinct de tout futur `configuring-zscaler` du lot EI (qui couvrirait le SWG/proxy/Internet Access, ZIA). À l'audit du lot EJ, **aucun `configuring-zscaler` n'existe encore** dans `packages/skills/library/` ni dans `decisions/`. Décision : **garder le skill ZPA/ZTNA tel quel** (delta = network-access privé vs filtrage web sortant), avec note de non-collision ci-dessous. Si EI atterrit plus tard avec un `configuring-zscaler` ZIA, pas de fold requis (sujets disjoints) ; ne folder que si EI livre lui aussi du ZPA.

---

## implementing-cisa-zero-trust-maturity-model
- **décision** : adapt (keeper, boost §12)
- **identité** : modèle de maturité CISA ZTMM v2.0 (5 piliers × 4 stades + 3 capacités transverses). Frame d'**évaluation + roadmap**, pas d'exécution de contrôle. Obsolescence : basse (CISA v2.0 = standard fédéral stable).
- **fit** : c'est la **carte doctrinale derrière CLAUDE.md §5**. Le sandbox dispatcher + blocage cross-projet + gates risk:high/blocking sont l'expression runtime des piliers Networks/Applications/Data au stade Advanced (default-deny, zéro zone de confiance implicite). Pas de dup : aucun slug zero-trust-architecture préexistant en library ; `implementing-mtls-for-zero-trust-services` est un contrôle ponctuel, pas le frame de maturité.
- **3 coûts** : install = bas (skill markdown, scoring déterministe, zéro dépendance) ; maintenance = re-baseline trimestriel + suivi version CISA ; removal = trivial (un dossier slug, réversible).
- **scores** (0–5) : project_fit 5 · token_efficiency 5 (scoring arithmétique, pas d'appel LLM) · safety 5 (lecture/évaluation only) · implementation_effort 5 (markdown) · evidence_maturity 5 (standard fédéral) · user_value 4 · phase_compatibility 5 (Phase ECC Harvest).
- **KILL** : aucun. Pas de PAYG, pas d'exécution de code, pas de secret, pas de framework lourd, in-phase.
- **appropriation MAOS** : scoring déterministe (pas de quota brûlé), recadré quota §8, items de roadmap exécutables hérités du gating §5, framing per-pillar (jamais un score global).
- **chemin library** : `packages/skills/library/implementing-cisa-zero-trust-maturity-model/SKILL.md`
- **état** : boosté conforme — ligne 1 `---`, commentaire source, summary L1, metadata complet (`frameworks` préservé : nist_csf/nist_ai_rmf/mitre_attack), Prompt Defense Baseline verbatim, 7 sections §12 (Overview/When/Principles citant source/Process/Rationalizations/Red Flags/Verification). 0 `@anthropic-ai/sdk`, 0 secret réel.
- **re-audit** : si CISA publie ZTMM v3, ou re-check à 12 mois.

## implementing-device-posture-assessment-in-zero-trust
- **décision** : adapt (keeper, boost §12)
- **identité** : posture d'appareil comme contrôle d'accès — ingestion de signaux EDR (CrowdStrike ZTA), MDM (Intune/Jamf), encryption/OS/secure-boot/TPM dans des policies de conditional access (Entra/Okta). Pilier Devices du ZTMM. Obsolescence : basse.
- **fit** : analogue conceptuel de **CLAUDE.md §5** — rien de fiable ne s'exécute hors d'un contexte évalué et gaté ; le sandbox projet actif est l'équivalent d'une frontière device-vérifié, une action non évaluée = device non managé (bloqué jusqu'au gate). Pas de dup library.
- **3 coûts** : install = bas (markdown, pattern distillé sans recopier les snippets PowerShell/curl) ; maintenance = suivre les évolutions ZTA/conditional-access ; removal = trivial.
- **scores** : project_fit 5 · token_efficiency 5 · safety 5 (lecture/évaluation, fail-closed) · implementation_effort 5 · evidence_maturity 4 · user_value 4 · phase_compatibility 5.
- **KILL** : aucun. Placeholders de tokens (`${CS_TOKEN}`) = variables d'env illustratives, pas de secret réel ; non recopiés dans le boost.
- **appropriation MAOS** : fail-closed sur posture absente/périmée, posture ANDé avec identité, report-mode avant enforce (= dry-run §5), quota units §8.
- **chemin library** : `packages/skills/library/implementing-device-posture-assessment-in-zero-trust/SKILL.md`
- **état** : boosté conforme — ligne 1 `---`, commentaire source, summary L1, metadata (`frameworks` : nist_csf/mitre_attack), Prompt Defense Baseline verbatim, 7 sections §12. 0 sdk, 0 secret réel.
- **re-audit** : 12 mois ou changement majeur d'API EDR/conditional-access.

## implementing-identity-verification-for-zero-trust
- **décision** : adapt (keeper, boost §12)
- **identité** : vérification d'identité continue ZT — MFA anti-phishing (FIDO2/WebAuthn), conditional access risk-adaptive, step-up, CAE, gouvernance d'identité. Pilier Identity du ZTMM (NIST 800-207/63B). Obsolescence : basse. Porte ATLAS `AML.T0052` (phishing).
- **fit** : doctrine derrière **CLAUDE.md §5 gates humains** — une action `risk:high`/`blocking` EST un step-up : re-vérifier un humain avant une action conséquente. Pas de dup (les slugs `implementing-saml-sso-with-okta`, `implementing-passwordless-*` sont des contrôles ponctuels, pas le frame d'identité ZT).
- **3 coûts** : install = bas (markdown) ; maintenance = suivre FIDO/CAE/conditional-access ; removal = trivial.
- **scores** : project_fit 5 · token_efficiency 5 · safety 5 · implementation_effort 5 · evidence_maturity 5 (NIST) · user_value 4 · phase_compatibility 5.
- **KILL** : aucun. Défensif, pas de secret, pas de PAYG.
- **appropriation MAOS** : step-up = analogue du gate humain §5, recadrage quota §8, CAE = révocation rapide (pas de chiffre $).
- **chemin library** : `packages/skills/library/implementing-identity-verification-for-zero-trust/SKILL.md`
- **état** : boosté conforme — ligne 1 `---`, commentaire source, summary L1, metadata (`frameworks` : nist_csf/nist_ai_rmf/atlas_techniques/mitre_attack), Prompt Defense Baseline verbatim, 7 sections §12. 0 sdk, 0 secret.
- **re-audit** : 12 mois.

## implementing-microsegmentation-with-guardicore
- **décision** : adapt (keeper, boost §12)
- **identité** : microsegmentation est-ouest au niveau processus (Akamai Guardicore) — map dépendances (Reveal), policies least-privilege + deny + ring-fence, reveal-before-enforce. Pilier Networks du ZTMM (Advanced/Optimal). Obsolescence : basse.
- **fit** : frame derrière **CLAUDE.md §5 isolation cross-projet** — le sandbox projet = un micro-segment ; écriture hors `path` ou appel hors `allowed_hosts` = flux cross-segment refusé par défaut. Le mode Reveal = analogue du dry-run §5. Pas de dup (les slugs `implementing-network-policies-for-kubernetes`, `implementing-mtls-for-zero-trust-services` sont des contrôles spécifiques, pas la doctrine est-ouest générale).
- **3 coûts** : install = bas (markdown, snippets curl/yaml NON recopiés — pattern distillé) ; maintenance = re-baseline des maps sur changement ; removal = trivial.
- **scores** : project_fit 5 · token_efficiency 5 · safety 5 (défensif) · implementation_effort 5 · evidence_maturity 4 · user_value 4 · phase_compatibility 5.
- **KILL** : aucun. Placeholders `${GC_API_TOKEN}` = env var illustrative, non propagée.
- **appropriation MAOS** : default-deny = invariant §5, reveal-before-enforce = dry-run §5, quota units §8.
- **chemin library** : `packages/skills/library/implementing-microsegmentation-with-guardicore/SKILL.md`
- **état** : boosté conforme — ligne 1 `---`, commentaire source, summary L1, metadata (`frameworks` : nist_csf/mitre_attack), Prompt Defense Baseline verbatim, 7 sections §12. 0 sdk, 0 secret.
- **re-audit** : 12 mois.

## implementing-zero-trust-dns-with-nextdns
- **décision** : adapt (keeper, boost §12)
- **identité** : DNS comme point de contrôle ZT (NextDNS) — résolution chiffrée DoH/DoT/DoQ, blocage threat-intel (DGA/NRD/typosquat/cryptojacking/rebinding), anti-tunneling, policy par device, ZTDNS Windows 11. Pilier Networks. Obsolescence : basse.
- **fit** : frame derrière **CLAUDE.md §5 `allowed_hosts`** — un appel sortant hors `config/permissions.json#allowed_hosts` = le DNS-deny du cockpit : egress default-deny + allowlist explicite. Pas de dup (`analyzing-dns-logs-for-exfiltration` = analyse forensic, pas l'implémentation du contrôle).
- **3 coûts** : install = bas (markdown, configs systemd/PowerShell NON recopiées intégralement — pattern distillé) ; maintenance = revue blocklists ; removal = trivial.
- **scores** : project_fit 5 · token_efficiency 5 · safety 5 · implementation_effort 5 · evidence_maturity 4 · user_value 4 · phase_compatibility 5.
- **KILL** : aucun. `your-api-key`/`abc123` = placeholders illustratifs, pas de secret réel.
- **appropriation MAOS** : egress allowlist = analogue §5 allowed_hosts, block-by-category, quota units §8.
- **chemin library** : `packages/skills/library/implementing-zero-trust-dns-with-nextdns/SKILL.md`
- **état** : boosté conforme — ligne 1 `---`, commentaire source, summary L1, metadata (`frameworks` : nist_csf/mitre_attack), Prompt Defense Baseline verbatim, 7 sections §12. 0 sdk, 0 secret.
- **re-audit** : 12 mois.

## implementing-zero-trust-for-saas-applications
- **décision** : adapt (keeper, boost §12)
- **identité** : ZT pour le SaaS — fédération IdP, conditional access, CASB (shadow-IT + session controls/DLP), gouvernance OAuth, SSPM. Pilier Applications. Risque dominant = consent OAuth excessif + shadow IT. Obsolescence : basse.
- **fit** : mappe sur **CLAUDE.md §5 gating tiers/sortant** — un appel API externe ou un envoi = action risk:high/blocking gatée humain ; la gouvernance OAuth-consent = analogue de `config/permissions.json` comme allowlist unique des catégories risquées externes. Pas de dup.
- **3 coûts** : install = bas (markdown, snippets PowerShell/curl NON recopiés) ; maintenance = SSPM/OAuth review ; removal = trivial.
- **scores** : project_fit 5 · token_efficiency 5 · safety 5 · implementation_effort 5 · evidence_maturity 4 · user_value 4 · phase_compatibility 5.
- **KILL** : aucun. Placeholders `${MDCA_API_TOKEN}`/`var.okta_client_secret` = env/var Terraform illustratives.
- **appropriation MAOS** : gouvernance OAuth = analogue permissions.json §5, session controls gradués, quota units §8.
- **chemin library** : `packages/skills/library/implementing-zero-trust-for-saas-applications/SKILL.md`
- **état** : boosté conforme — ligne 1 `---`, commentaire source, summary L1, metadata (`frameworks` : nist_csf/mitre_attack), Prompt Defense Baseline verbatim, 7 sections §12. 0 sdk, 0 secret.
- **re-audit** : 12 mois.

## implementing-zero-trust-network-access-with-zscaler
- **décision** : adapt (keeper, boost §12) — **gardé avec delta distinct, PAS de fold**
- **identité** : ZTNA via Zscaler Private Access (ZPA) — remplacement VPN, accès identity-based per-app, tunnels outbound-only via Zero Trust Exchange, segments d'app, posture, browser access. Pilier Networks. Obsolescence : basse.
- **fit** : doctrine derrière **CLAUDE.md §5** — le sandbox projet accorde un accès least-privilege aux ressources d'UN projet, outbound-only, sans confiance réseau implicite. Pas de dup library.
- **DELTA zscaler (note tâche)** : ZPA = accès **applications privées** (vers apps internes), ≠ tout futur `configuring-zscaler` du lot EI qui couvrirait **ZIA/SWG = filtrage web sortant**. Surfaces disjointes → **garder distinct, aucun fold**. Aucun `configuring-zscaler` n'existe en library/decisions à l'instant de l'audit. Si EI livre du ZIA → toujours pas de fold (sujets séparés) ; folder seulement si EI livre lui aussi du ZPA. Note explicite dans le corps (When NOT + Red Flag « ZPA conflated with ZIA/SWG »).
- **3 coûts** : install = bas (markdown, pas de snippet exécutable lourd) ; maintenance = suivre ZPA ; removal = trivial.
- **scores** : project_fit 5 · token_efficiency 5 · safety 5 · implementation_effort 5 · evidence_maturity 4 · user_value 4 · phase_compatibility 5.
- **KILL** : aucun. Défensif, pas de secret.
- **appropriation MAOS** : access-an-app-never-join-a-network = invariant §5, outbound-only, quota units §8.
- **chemin library** : `packages/skills/library/implementing-zero-trust-network-access-with-zscaler/SKILL.md`
- **état** : boosté conforme — ligne 1 `---`, commentaire source, summary L1, metadata (`frameworks` : nist_csf/mitre_attack), Prompt Defense Baseline verbatim, 7 sections §12. 0 sdk, 0 secret.
- **re-audit** : à l'atterrissage du lot EI (vérifier non-collision ZPA↔ZIA), sinon 12 mois.

## implementing-zero-trust-with-hashicorp-boundary
- **décision** : adapt (keeper, boost §12)
- **identité** : proxy identity-aware (HashiCorp Boundary + Vault) — accès ZT à l'infra (SSH/RDP/DB/K8s) sans VPN ni credentials permanents : default-deny, OIDC→managed groups, credentials dynamiques JIT brokerés (jamais vus par l'user), session recording, sessions time-boxed. Pilier Networks/IAM. Obsolescence : basse.
- **fit** : frame derrière **CLAUDE.md §5** (default-deny, least-privilege, pas d'accès permanent) ET **§11** (pas de secret en code) — le modèle broker-never-expose = exactement comment MAOS garde les credentials hors du contexte agent. Pas de dup (`implementing-hashicorp-vault-dynamic-secrets`, `implementing-just-in-time-access-provisioning` = composants ; Boundary = le proxy d'accès complet).
- **3 coûts** : install = bas (markdown ; HCL/Terraform NON recopiés — pattern distillé) ; maintenance = rotation tokens Vault, suivi Boundary ; removal = trivial.
- **scores** : project_fit 5 · token_efficiency 5 · safety 5 (broker, pas d'exposition secret) · implementation_effort 5 · evidence_maturity 4 · user_value 4 · phase_compatibility 5.
- **KILL** : aucun. ⚠️ Source contient des clés AEAD tronquées (`sP1fnF5Xz85RrXM...`) + `var.vault_token`/`var.aws_secret_key` = **placeholders illustratifs** dans la config exemple, PAS de secret réel ; non recopiés dans le boost, et Red Flag §11.5 ajouté (« never commit a real KMS key »).
- **appropriation MAOS** : broker-never-expose = doctrine §11 (credentials hors contexte agent), default-deny = §5, quota units §8.
- **chemin library** : `packages/skills/library/implementing-zero-trust-with-hashicorp-boundary/SKILL.md`
- **état** : boosté conforme — ligne 1 `---`, commentaire source, summary L1, metadata (`frameworks` : nist_csf/mitre_attack), Prompt Defense Baseline verbatim, 7 sections §12. 0 sdk, 0 secret réel.
- **re-audit** : 12 mois.

---

## Bilan lot EJ

- **Keepers : 8/8** (tous `adapt`, boostés §12). Rejets : 0. Folds : 0 (note ZPA↔ZIA = non-collision, garde distinct).
- **Charte défensive respectée** : 8/8 défensifs, mappent sur CLAUDE.md §5 (+ §11 pour Boundary). Aucune weaponisation, aucun KILL offensif.
- **Sanitize** : 8/8 clean. Placeholders de tokens/clés dans les snippets sources = variables d'env / vars Terraform / clés tronquées illustratives ; **aucun secret réel**, et les snippets opérationnels n'ont pas été recopiés (distillation du pattern en Process numéroté). `@anthropic-ai/sdk` absent partout.
- **`frameworks` préservé** dans chaque metadata (nist_csf systématique ; + nist_ai_rmf / atlas_techniques / mitre_attack selon source).
- **Recadrage §11** : toute notion de coût recadrée en quota units (§8), zéro chiffre €/$ propagé.
- **Cluster** : `cyber:zero-trust-architecture`, tier T1, status library, origin `mukul975/Anthropic-Cybersecurity-Skills`, license Apache-2.0.

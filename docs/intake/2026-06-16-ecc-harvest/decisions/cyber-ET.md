# ECC Harvest — décisions cluster `cyber:cloud-security` (lot ET)

Doer: lot ET (8 skills, dont 2 au titre offensif). Worktree `maos-ecc` (branche `phase/ecc-harvest`). Méthode: intake-audit, barre LARGE (T1, library), garde-fou défensif explicite.
Source cybersec: `mukul975/Anthropic-Cybersecurity-Skills` (Apache-2.0, author mahipal). Cible: `packages/skills/library/<slug>/SKILL.md`.
Recadrage transverse: MAOS = abonnement (§11), PAS de coût per-token PAYG ; tout chiffre = unités de quota, jamais $/€. Secrets/keystores/réseau/cross-projet = gatés §5.
Sanitize (regex secrets/PII/internal): 8/8 sources clean (placeholders ACCOUNT/PROJECT_ID/TENANT_ID/CLIENT_ID/CLIENT_SECRET/ARN/CIDR uniquement, aucune valeur réelle ; les `access_key=AKIAEXAMPLE`/`secret_key=secretkey`/`changethispassword`/`securepwd123` des snippets source sont des placeholders pédagogiques strippés ou neutralisés au boost). `@anthropic-ai/sdk`: absent des 8 sources.
Champ `frameworks` préservé depuis le frontmatter source (nist_csf/mitre_attack ; +nist_ai_rmf/atlas_techniques si présents — absents de ce lot).

**Garde-fou défensif (KILL criterion ce lot)**: 6 skills sont blue-team natifs (Vault secrets-management, zero-trust cloud, ZTNA, identité Okta, inventaire Cartography, forensics CloudTrail). 2 portent un titre offensif et exigent un recadrage explicite avant tout keep :
- `performing-aws-account-enumeration-with-scout-suite` : ScoutSuite EST un outil d'audit défensif multi-cloud (CSPM read-only sur SON PROPRE compte). Gardé comme **audit autorisé de son propre compte AWS**, renommé `auditing-own-aws-account-with-scout-suite`. Cadré sur le tenant du propriétaire uniquement ; si reframé en recon attaquant contre des tiers → REJECT.
- `performing-aws-privilege-escalation-assessment` : gardé comme **auto-évaluation IAM autorisée de son propre compte** (trouver+corriger ses propres chemins d'escalade), renommé `assessing-own-aws-privilege-escalation-paths`. Autorisation écrite + propre compte uniquement ; si pure exploitation/usage contre des tiers → REJECT.

Recadrage commun READ-AND-REPORT : MAOS raisonne sur la posture/les logs/les configs/les graphes et produit des findings + un plan ; les actions vivantes (déployer Vault, basculer un IdP, créer/supprimer une règle, exécuter un scan/exploit sur un compte vivant, contenir une instance) sont des **recommandations au propriétaire** sur SON tenant, jamais une action MAOS autonome (§5 cross-tenant + risk:high/blocking). Credentials cloud (clés AWS/SA, tokens Okta, unseal-keys Vault, mots de passe Neo4j, KMS) = secrets gatés §5, jamais loggés/persistés/commités. Endpoints cloud externes (AWS/Azure/GCP API, Okta, ACME/OCSP, bolt://Neo4j) = `allowed_hosts` only. Toute bascule vers weaponization/exfiltration/évasion/recon-tiers → REJECT (rencontrée seulement aux 2 titres offensifs, neutralisée par recadrage own-account ; aucun REJECT effectif).

---

## implementing-secrets-management-with-vault
- **décision**: adapt
- **raison**: doctrine défensive de secrets-management centralisé HashiCorp Vault — HA Raft + TLS + auto-unseal KMS + audit devices, auth identité-based (OIDC humains / AppRole CI-CD / Kubernetes pods), moteurs de secrets dynamiques (database/AWS) à TTL court + rotation root, Transit (encryption-as-a-service sans exposer la clé) + PKI (certs internes), policies ACL least-privilege, élimination des credentials hardcodés du code et des pipelines. Recadré read-and-report : MAOS conçoit/audite la posture Vault et surface les findings d'hygiène ; init/unseal/rotate/policy-write sur le Vault vivant = exécuté par le propriétaire (§5 cross-tenant).
- **dedup**: non — `implementing-hashicorp-vault-dynamic-secrets` existant est étroit (moteurs dynamiques seuls) ; ce skill couvre la plateforme complète (sealing/auth/Transit/PKI/K8s/policies/audit). Complète `mas-sec-reviewer` côté gestion de credentials. Cadrage quota (§11), pas de $.
- **chemin library**: `packages/skills/library/implementing-secrets-management-with-vault/SKILL.md`
- **frameworks**: nist_csf [PR.IR-01, ID.AM-08, GV.SC-06, DE.CM-01], mitre_attack [T1078.004, T1530, T1537, T1580, T1003].
- **renommage**: aucun (slug source conservé).
- **état**: boosté conforme (ligne 1 `---`, commentaire source, summary L1 ≤200 tok, metadata complet + frameworks, Prompt Defense Baseline verbatim, 7 sections §12). 0 sdk, 0 secret (tokens/unseal-keys/secret_ids traités en §5 ; `access_key=AKIAEXAMPLE`/`secret_key=secretkey` du snippet source = placeholders pédagogiques non repris au corps boosté). Re-audit: évolution moteurs dynamiques Vault ou révision politique de rotation.

## implementing-zero-trust-in-cloud
- **décision**: adapt
- **raison**: doctrine défensive zero-trust cloud (NIST SP 800-207 / BeyondCorp) — never-trust-always-verify, Identity-Aware Proxy / AWS Verified Access / Azure Conditional Access devant chaque app (backends jamais joignables en direct), MFA + device managé conforme, vérification continue (identité/device/localisation/comportement/threat-intel par requête, pas seulement au login), micro-segmentation contre le lateral movement, export des décisions d'accès au SIEM, maturité scorée par pilier (identity/device/network/application). Recadré read-and-report : MAOS conçoit l'architecture + audite la maturité ; déployer IAP/Verified Access, écrire la conditional-access policy, décommissionner le VPN sur le tenant vivant = exécuté par le propriétaire (§5 cross-tenant).
- **dedup**: non — `implementing-beyondcorp-zero-trust-access-model` / `implementing-cisa-zero-trust-maturity-model` existants couvrent des angles voisins, mais ce skill est la doctrine d'architecture cloud complète multi-cloud (4 piliers + micro-segmentation + continuous verification). Complète `mas-sec-reviewer` côté gating §5 sandbox. Cadrage quota (§11).
- **chemin library**: `packages/skills/library/implementing-zero-trust-in-cloud/SKILL.md`
- **frameworks**: nist_csf [PR.IR-01, ID.AM-08, GV.SC-06, DE.CM-01], mitre_attack [T1078.004, T1530, T1537, T1580].
- **renommage**: aucun.
- **état**: boosté conforme (8 sections, summary L1, metadata + frameworks, commentaire source, Prompt Defense Baseline verbatim). 0 sdk, 0 secret (client-id/client-secret/POLICY_ID = placeholders). Re-audit: évolution NIST ZTA maturity model ou nouveaux services Verified Access/IAP.

## implementing-zero-trust-network-access
- **décision**: adapt
- **raison**: doctrine défensive ZTNA — remplacer le VPN par un accès identité+contexte aux apps internes : IAP GCP / Verified Access AWS devant les apps web (backends non exposés), Azure Private Link (isolation réseau) + Conditional Access (device conforme + MFA), micro-segmentation (security groups + Kubernetes NetworkPolicy) contre le lateral movement, vérification continue (re-auth sur apps sensibles), logging des décisions d'accès + requêtes sur les denials, break-glass documenté pour panne IdP, ZTNA agent-based pour les thick-clients legacy. ZTNA complète — ne remplace pas — firewalls/ACL/WAF. Recadré read-and-report : MAOS conçoit/audite la topologie + le plan de migration ; stand-up des proxies, écriture de policy, décommission VPN sur le tenant vivant = exécuté par le propriétaire (§5 cross-tenant).
- **dedup**: non — `implementing-zero-trust-network-access-with-zscaler` existant est vendor-spécifique (ZPA) ; ce skill est la doctrine ZTNA vendor-agnostique (IAP/Verified Access/Private Link/Conditional Access). S'aligne sur le garde-fou réseau §5 (allowed_hosts). Cadrage quota (§11).
- **chemin library**: `packages/skills/library/implementing-zero-trust-network-access/SKILL.md`
- **frameworks**: nist_csf [PR.IR-01, ID.AM-08, GV.SC-06, DE.CM-01], mitre_attack [T1078.004, T1530, T1537, T1580].
- **renommage**: aucun.
- **état**: boosté conforme (8 sections, summary L1, metadata + frameworks, commentaire source). 0 sdk, 0 secret (CLIENT_ID/CLIENT_SECRET/TENANT_ID/SUB_ID = placeholders). Re-audit: évolution Private Link/Verified Access ou besoin ZTNA agent-based pour legacy.

## managing-cloud-identity-with-okta
- **décision**: adapt
- **raison**: doctrine défensive d'identité cloud centralisée Okta comme IdP — fédération SSO AWS (SAML) / Azure (OIDC) / GCP (Workforce Identity), MFA phishing-resistant (FastPass / FIDO2, SMS/voice désactivés), automation du cycle de vie SCIM (deprovisioning < quelques minutes après l'événement RH, sessions terminées), policies d'accès adaptatives (device managé+conforme, blocage anonymizers, session/re-auth bornées, break-glass FIDO2-only audité), monitoring ThreatInsight + System Log streaming SIEM, chasse aux comptes orphelins (IAM directs / service accounts hors fédération). Recadré read-and-report : MAOS conçoit la topologie IdP + audite l'hygiène identité ; configurer SAML/OIDC/MFA/SCIM sur Okta et le tenant cloud vivant = exécuté par le propriétaire (§5 cross-tenant).
- **dedup**: non — `implementing-saml-sso-with-okta` / `implementing-scim-provisioning-with-okta` existants sont étroits (un mécanisme chacun) ; ce skill est la doctrine IdP-cloud complète (SSO + MFA + lifecycle + adaptatif + threat-monitoring + orphan-hunt). S'aligne sur le gating IAM cross-projet §5. Cadrage quota (§11).
- **chemin library**: `packages/skills/library/managing-cloud-identity-with-okta/SKILL.md`
- **frameworks**: nist_csf [PR.IR-01, ID.AM-08, GV.SC-06, DE.CM-01], mitre_attack [T1078.004, T1530, T1537, T1580, T1566].
- **renommage**: aucun.
- **état**: boosté conforme (8 sections, summary L1, metadata + frameworks, commentaire source). 0 sdk, 0 secret (OKTA_API_TOKEN traité en §5 ; okta-app-client-id/saml-provider ARN = placeholders). Re-audit: évolution Okta Identity Engine ou nouvelles obligations SOC2/zero-trust identité.

## performing-cloud-asset-inventory-with-cartography
- **décision**: adapt
- **raison**: doctrine défensive d'inventaire d'actifs cloud orientée graphe (Cartography CNCF / Neo4j) — sync AWS/GCP/Azure (resources + principals IAM + trust) en graphe, puis requêtes Cypher de sécurité : buckets publics/anonymes, users à AdministratorAccess, instances exposées 0.0.0.0/0 sur SSH, trust cross-account :root sans external-id, rôles inutilisés 90j+, Lambdas à rôle admin, chemins d'attaque multi-hop (instance publique → bucket sensible). Read-only par construction : le graphe localise l'exposition et les attack paths, ne remédie pas. Recadré read-and-report : MAOS exécute le sync avec des credentials read-only et rapporte ; corriger ACL/clés/rôles = exécuté par le propriétaire (§5 cross-tenant).
- **dedup**: non — aucun skill d'asset-inventory orienté graphe existant ; distinct de CSPM (moteur de règles vs graphe de relations) et du SIEM (détection temps réel). Complète la chasse aux attack paths que `mas-sec-reviewer` consomme. Cadrage quota (§11).
- **chemin library**: `packages/skills/library/performing-cloud-asset-inventory-with-cartography/SKILL.md`
- **frameworks**: nist_csf [PR.IR-01, ID.AM-08, GV.SC-06, DE.CM-01], mitre_attack [T1078.004, T1530, T1537, T1580].
- **renommage**: aucun.
- **état**: boosté conforme (8 sections, summary L1, metadata + frameworks, commentaire source). 0 sdk, 0 secret (mots de passe Neo4j `changethispassword`/`securepwd123` du snippet source = placeholders pédagogiques, traités en §5 via env-var injection au corps boosté, jamais inline). Re-audit: évolution data-model Cartography ou nouveaux modules de sync.

## performing-cloud-forensics-with-aws-cloudtrail
- **décision**: adapt
- **raison**: doctrine défensive DFIR cloud (CloudTrail) — reconstruire l'activité attaquante post-compromission depuis le journal API : scoping (timeframe/comptes/clés compromises), requêtes management events via boto3 lookup_events (≤90j) ou Athena/CloudTrail Lake (historique/data-events), filtrage user-agents/source-IP/event-names suspects, timeline chronologique par principal, analyse accès données (S3 GetObject) + changements IAM, identification de la persistance (nouveaux users/clés/rôles/Lambdas), tracking par AccessKeyId + géoloc IP. Read-only post-incident : explique la brèche, ne la contient pas. Recadré read-and-report : MAOS analyse les logs et émet timeline+findings ; configurer trails, révoquer des clés, contenir sur le compte vivant = exécuté par le propriétaire (§5 cross-tenant).
- **dedup**: non — `detecting-aws-cloudtrail-anomalies` existant est de la détection temps-réel (alerting) ; ce skill est de la reconstruction forensique post-incident (DFIR/timeline). Nourrit l'IR que `mas-sec-reviewer` consomme. Cadrage quota (§11), pas de $ Athena.
- **chemin library**: `packages/skills/library/performing-cloud-forensics-with-aws-cloudtrail/SKILL.md`
- **frameworks**: nist_csf [PR.IR-01, ID.AM-08, GV.SC-06, DE.CM-01], mitre_attack [T1078.004, T1530, T1537, T1580, T1003].
- **renommage**: aucun.
- **état**: boosté conforme (8 sections, summary L1, metadata + frameworks, commentaire source). 0 sdk, 0 secret (identités/ARN/IP = sensibles, confinés au rapport ; aucune valeur réelle dans la source). Re-audit: évolution CloudTrail Lake/Security Lake ou nouvelles TTP cloud.

## performing-aws-account-enumeration-with-scout-suite  →  auditing-own-aws-account-with-scout-suite
- **décision**: adapt (recadrage défensif own-account + RENOMMAGE)
- **garde-fou appliqué**: titre source offensif ("enumeration"). ScoutSuite (NCC Group) EST un outil d'audit défensif CSPM multi-cloud, read-only, agentless, sur SON PROPRE compte. Gardé strictement comme **audit autorisé de son propre compte** ; tout reframe en recon attaquant contre des tiers = REJECT (KILL criterion, énoncé explicitement dans Overview + Red Flags + Verification du skill). Renommé `performing-aws-account-enumeration-with-scout-suite` → `auditing-own-aws-account-with-scout-suite`.
- **raison**: doctrine défensive own-account CSPM — IAM read-only (SecurityAudit/ViewOnlyAccess), scan des misconfigurations (S3 public, root sans MFA, SSH 0.0.0.0/0, RDS non chiffrée, CloudTrail mono-région, Lambda public), triage danger>warning>good, baseline→remédiation→re-scan, scans récurrents pour le drift, multi-cloud Azure/GCP. Recadré read-and-report : MAOS exécute le scan read-only sur le propre compte du propriétaire et rapporte ; appliquer les fixes = exécuté par le propriétaire (§5 cross-tenant).
- **dedup**: non — `assessing-own-cloud-security-posture` existant est générique ; celui-ci est l'outil-spécifique ScoutSuite (NCC Group). Complète CSPM côté outil agentless. Cadrage quota (§11), pas de $.
- **chemin library**: `packages/skills/library/auditing-own-aws-account-with-scout-suite/SKILL.md`
- **frameworks**: nist_csf [PR.IR-01, ID.AM-08, GV.SC-06, DE.CM-01], mitre_attack [T1078.004, T1530, T1537, T1580].
- **renommage**: `performing-aws-account-enumeration-with-scout-suite` → `auditing-own-aws-account-with-scout-suite`.
- **état**: boosté conforme (8 sections, summary L1, metadata + frameworks, commentaire source pointant le slug source). 0 sdk, 0 secret (`AWS_ACCESS_KEY_ID=<your-key>` du snippet source = placeholder, traité en §5 via profile/env au corps boosté). Re-audit: évolution ScoutSuite rules ou CIS AWS Foundations.

## performing-aws-privilege-escalation-assessment  →  assessing-own-aws-privilege-escalation-paths
- **décision**: adapt (recadrage défensif own-account + RENOMMAGE)
- **garde-fou appliqué**: titre source offensif + outillage offensif (Pacu, CloudFox, PMapper). Gardé strictement comme **auto-évaluation IAM autorisée de son propre compte** (trouver+corriger ses propres chemins d'escalade) ; autorisation écrite + propre compte obligatoires ; tout reframe en testing non-autorisé ou pure exploitation contre des tiers = REJECT (KILL criterion, énoncé dans Overview + When-NOT + Red Flags + Verification). Renommé `performing-aws-privilege-escalation-assessment` → `assessing-own-aws-privilege-escalation-paths`. Les étapes de preuve mutantes (créer une policy version, assume-role, créer une fonction) = exécutées par le propriétaire sur son compte, jamais par MAOS (§5).
- **raison**: doctrine défensive d'auto-évaluation IAM — énumération des permissions effectives (simulate-principal-policy), graphe d'escalade (PMapper : qui atteint admin, par quelle edge), classes d'escalade connues (iam:CreatePolicyVersion, iam:PassRole+lambda/ec2, iam:Attach*Policy, iam:CreateLoginProfile, sts:AssumeRole), revue du trust cross-account (wildcard/:root sans external-id/MFA = confused-deputy), remédiation (permission boundaries, iam:PassRole restreint aux ARN, SCP guardrails, external-id). Recadré read-and-report : MAOS analyse l'IAM et rapporte les chemins+fixes ; appliquer boundaries/SCP et toute preuve mutante = exécuté par le propriétaire (§5 cross-tenant).
- **dedup**: non — `detecting-aws-iam-privilege-escalation` existant est de la détection (alerting sur événements) ; celui-ci est de l'auto-assessment proactif own-account (trouver+corriger ses propres chemins). Nourrit le gating IAM §5. Cadrage quota (§11).
- **chemin library**: `packages/skills/library/assessing-own-aws-privilege-escalation-paths/SKILL.md`
- **frameworks**: nist_csf [PR.IR-01, ID.AM-08, GV.SC-06, DE.CM-01], mitre_attack [T1078.004, T1530, T1537, T1580, T1068].
- **renommage**: `performing-aws-privilege-escalation-assessment` → `assessing-own-aws-privilege-escalation-paths`.
- **état**: boosté conforme (8 sections, summary L1, metadata + frameworks, commentaire source pointant le slug source). 0 sdk, 0 secret (ACCOUNT/TARGET_ACCOUNT/test-user = placeholders ; credentials de test traités en §5). Re-audit: nouvelles classes d'escalade IAM (modules Pacu) ou évolution SCP/permission-boundaries.

---

## Bilan lot ET

- **Keepers**: 8/8 (6 défensifs blue-team natifs + 2 offensive-titled recadrés own-account/autorisé et renommés).
- **Rejets**: 0 (garde-fou défensif satisfait par recadrage : ScoutSuite = audit own-account read-only ; privilege-escalation = auto-assessment own-account autorisé ; le KILL criterion "recon/exploitation contre tiers" est énoncé dans chacun des 2 skills mais non rencontré comme cas effectif → 0 REJECT).
- **Renommages**: 2.
  - `performing-aws-account-enumeration-with-scout-suite` → `auditing-own-aws-account-with-scout-suite`.
  - `performing-aws-privilege-escalation-assessment` → `assessing-own-aws-privilege-escalation-paths`.
- **Boost lourd**: `performing-cloud-forensics-with-aws-cloudtrail` (source au body mince — workflow 7 étapes + tableaux concepts/outils extraits et étoffés aux 7 sections §12).
- **Sanitize**: 8/8 clean (0 secret/PII réel — seulement placeholders ACCOUNT/PROJECT_ID/TENANT_ID/CLIENT_ID/CLIENT_SECRET/ARN/CIDR et placeholders pédagogiques AKIAEXAMPLE/changethispassword/securepwd123 neutralisés au boost ; 0 `@anthropic-ai/sdk`).
- **Conformité §12**: 8/8 à la forme exemplaire (ligne 1 `---`, frontmatter name/description/summary L1 ≤200 tok/metadata{origin/license/cluster/tier/status/frameworks}, commentaire source `<!-- pattern from mukul975/... skills/<slug-source>/SKILL.md -->` — les 2 renommés pointent leur slug SOURCE, Prompt Defense Baseline verbatim, 7 sections §12 = Overview/When-to-Use+When-NOT/Principles citant la source/Process/Rationalizations/Red Flags/Verification).
- **Recadrages transverses**: §11 (quota units, jamais $/€) + §5 (read-and-report ; déploiement/remédiation/enforcement/scans/exploits/containment/deletions = exécutés par le propriétaire sur son tenant, jamais action MAOS autonome ; credentials cloud/Okta/Vault/Neo4j/KMS = secrets gatés jamais loggés/commités ; cibles cloud externes = `allowed_hosts`).
- **Garde-fou KILL**: les 2 offensive-titled ne sont KEEP que parce que recadrés own-account/autorisé ; toute future variante framée recon-tiers/exploitation déclencherait le REJECT inscrit dans leur corps.

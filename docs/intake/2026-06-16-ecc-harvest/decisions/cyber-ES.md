# ECC Harvest — décisions cluster `cyber:cloud-security` (lot ES)

Doer: lot ES (8 skills). Worktree `maos-ecc` (branche `phase/ecc-harvest`). Méthode: intake-audit, barre LARGE (T1, library), garde-fou défensif explicite.
Source cybersec: `mukul975/Anthropic-Cybersecurity-Skills` (Apache-2.0, author mahipal). Cible: `packages/skills/library/<slug>/SKILL.md`.
Recadrage transverse: MAOS = abonnement (§11), PAS de coût per-token PAYG ; tout chiffre = unités de quota, jamais $/€. Secrets/keystores/réseau/cross-projet = gatés §5.
Sanitize (regex secrets/PII/internal): 8/8 sources clean (placeholders ACCOUNT/PROJECT_ID/ORG_ID/CIDR uniquement, aucune valeur réelle). `@anthropic-ai/sdk`: absent des 8 sources.
Champ `frameworks` préservé depuis le frontmatter source (nist_csf/mitre_attack + nist_ai_rmf/atlas_techniques quand présents).

**Garde-fou défensif (KILL criterion ce lot)**: les 8 skills sont blue-team cloud-security (DLP/découverte de données sensibles, CSPM/posture multi-cloud, analyse CloudTrail, WAF, protection runtime de workload, Binary Authorization GKE/Cloud Run, Org Policy constraints GCP, règles firewall VPC GCP). Tout recadré READ-AND-REPORT : MAOS raisonne sur la posture/les logs/les configs et produit des findings ; les actions de remédiation (corriger une ACL, supprimer une clé, restreindre un rôle, bloquer une IP, appliquer une policy, dé-identifier des données, basculer un WAF en Block) sont des **recommandations au propriétaire**, jamais une action MAOS exécutée sur le tenant/compte/cloud de l'utilisateur (§5 cross-tenant + risk:high/blocking). Toute bascule vers weaponization/exfiltration/évasion → REJECT (non rencontré). Credentials cloud (clés SA, secrets, tokens, KMS, PIN HSM) = secrets gatés §5, jamais loggés/persistés/commités ; endpoints cloud externes (AWS/Azure/GCP API, ACME, OCSP) = `allowed_hosts` only ; auto-remédiation = recommandation, jamais exécution autonome.

---

## implementing-cloud-dlp-for-data-protection
- **décision**: adapt
- **raison**: doctrine défensive DLP cloud — découverte + classification de données sensibles (PII/PHI/PCI/secrets) sur S3/GCS/BigQuery/Azure via Macie, Cloud DLP, Purview ; identifiers custom, dé-identification (mask/tokenize/redact), gate DLP de pipeline, rapport par catégorie+sévérité. Recadré read-and-report : MAOS surface les findings et propose les contrôles ; les scans et transforms sur le tenant vivant = exécutés par le propriétaire (§5 cross-tenant). Tout secret découvert = §5-critique redacted.
- **dedup**: non — aucun skill DLP/data-classification existant en `library/` ; complète `mas-sec-reviewer` (qui gate) en apportant la doctrine de découverte de données sensibles. Cadrage quota (§11), pas de $/GB.
- **chemin library**: `packages/skills/library/implementing-cloud-dlp-for-data-protection/SKILL.md`
- **frameworks**: nist_csf [PR.IR-01, ID.AM-08, GV.SC-06, DE.CM-01], mitre_attack [T1078.004, T1530, T1537, T1580], nist_ai_rmf [MEASURE-2.7, MAP-5.1, MANAGE-2.4, MEASURE-2.8, MEASURE-2.9], atlas_techniques [AML.T0070, AML.T0066, AML.T0082].
- **renommage**: aucun (slug source conservé).
- **état**: boosté conforme (ligne 1 `---`, commentaire source, summary L1 ≤200 tok, metadata complet + frameworks, Prompt Defense Baseline verbatim, 7 sections §12). 0 sdk, 0 secret (placeholders ACCOUNT/PROJECT_ID/WRAPPED_KEY_BASE64 strippés du corps). Re-audit: nouvelles managed-data-identifiers ou révision GDPR/HIPAA/PCI.

## implementing-cloud-security-posture-management
- **décision**: adapt
- **raison**: doctrine défensive CSPM multi-cloud — évaluation continue AWS/Azure/GCP contre CIS/SOC2/PCI/NIST via Security Hub/Defender/SCC + Prowler + ScoutSuite ; credentials read-only, normalisation/dedup des findings inter-outils, triage par sévérité, drift detection. Recadré read-and-report : MAOS produit les findings + un plan de remédiation priorisé ; l'auto-remédiation et l'enforcement de policy sur le tenant vivant = exécutés par le propriétaire (§5 cross-tenant).
- **dedup**: non — aucun skill CSPM/posture existant ; complète `mas-sec-reviewer` en apportant la doctrine d'évaluation de posture cloud. Cadrage quota (§11).
- **chemin library**: `packages/skills/library/implementing-cloud-security-posture-management/SKILL.md`
- **frameworks**: nist_csf [PR.IR-01, ID.AM-08, GV.SC-06, DE.CM-01], mitre_attack [T1078.004, T1530, T1537, T1580].
- **renommage**: aucun.
- **état**: boosté conforme (8 sections = Prompt Defense Baseline + 7 §12, summary L1, metadata + frameworks, commentaire source). 0 sdk, 0 secret. Re-audit: nouvelles versions CIS benchmark ou évolution des CSPM natifs.

## implementing-cloud-trail-log-analysis
- **décision**: adapt
- **raison**: doctrine défensive d'analyse CloudTrail — couverture de trail (org-wide/multi-région/log-file-validation), requêtes Athena + CloudWatch Logs Insights pour détecter privesc, login sans MFA, usage root, tampering de trail, bursts AccessDenied ; metric filters CIS ; reconstruction de timeline pour IR. Recadré read-and-report : MAOS analyse les logs et émet les findings ; configurer trails/alarmes et remédier sur le compte vivant = exécuté par le propriétaire (§5 cross-tenant). Identités/ARN/IP = sensibles, jamais leakées.
- **dedup**: non — aucun skill d'analyse de logs CloudTrail existant ; nourrit la détection que `mas-sec-reviewer` consomme. Cadrage quota (§11), pas de $ Athena.
- **chemin library**: `packages/skills/library/implementing-cloud-trail-log-analysis/SKILL.md`
- **frameworks**: nist_csf [PR.IR-01, ID.AM-08, GV.SC-06, DE.CM-01], mitre_attack [T1078.004, T1530, T1537, T1580, T1068].
- **renommage**: aucun.
- **état**: boosté conforme (8 sections, summary L1, metadata + frameworks, commentaire source). 0 sdk, 0 secret. Re-audit: nouvelles CIS recommendations ou évolution CloudTrail Lake/Security Lake.

## implementing-cloud-waf-rules
- **décision**: adapt
- **raison**: doctrine défensive WAF cloud — managed OWASP rule sets en Count d'abord, rate-limiting sur endpoints d'auth, bot/geo/IP-reputation, tuning des faux positifs depuis les logs, bascule Block après fenêtre de validation 7-14j. WAF = contrôle compensatoire, jamais substitut du code sécurisé. Recadré read-and-report : MAOS conçoit/tune le plan de règles ; déployer et basculer en Block sur l'app vivante = exécuté par le propriétaire (§5 cross-tenant). Auth headers redactés dans les logs.
- **dedup**: non — aucun skill WAF existant ; complète `mas-sec-reviewer` côté contrôle périmétrique applicatif. Cadrage quota (§11).
- **chemin library**: `packages/skills/library/implementing-cloud-waf-rules/SKILL.md`
- **frameworks**: nist_csf [PR.IR-01, ID.AM-08, GV.SC-06, DE.CM-01], mitre_attack [T1078.004, T1530, T1537, T1580, T0816].
- **renommage**: aucun.
- **état**: boosté conforme (8 sections, summary L1, metadata + frameworks, commentaire source). 0 sdk, 0 secret. Re-audit: évolution AWS/Azure/Cloudflare managed rule sets ou OWASP Top 10.

## implementing-cloud-workload-protection
- **décision**: adapt (boost lourd — source au corps mince)
- **raison**: doctrine défensive CWPP runtime EC2/GCE — process anomalies (cryptominers/reverse shells), audit connexions réseau (C2), file-integrity, anomalies de ressources, binaires non autorisés par hash. Source au body mince (When-to-Use générique + 2 snippets SSM) : substance technique réelle extraite et étoffée aux 7 sections §12, surface explicitement distinguée de CSPM (runtime vs config statique). Recadré read-and-report : exécuter des commandes (SSM run-shell) ou contenir sur des instances vivantes = exécuté par le propriétaire (§5 cross-tenant).
- **dedup**: non — distinct de CSPM (posture statique) ; aucun skill CWPP/runtime existant. Cadrage quota (§11).
- **chemin library**: `packages/skills/library/implementing-cloud-workload-protection/SKILL.md`
- **frameworks**: nist_csf [PR.IR-01, ID.AM-08, GV.SC-06, DE.CM-01], mitre_attack [T1078.004, T1530, T1537, T1580, T1071].
- **renommage**: aucun.
- **état**: boosté conforme (8 sections, summary L1, metadata + frameworks, commentaire source). 0 sdk, 0 secret (instance-id placeholder strippé du corps). Re-audit: évolution des agents CWPP (Falco/Aqua/GuardDuty Runtime) ou nouvelles TTP runtime.

## implementing-gcp-binary-authorization
- **décision**: adapt
- **raison**: doctrine défensive supply-chain deploy-time GKE/Cloud Run — attestors KMS, policy default-deny (REQUIRE_ATTESTATION/ENFORCED_BLOCK), règles per-cluster, attestation CI/CD post-scan, continuous validation, break-glass audité par ticket. Recadré read-and-report : MAOS conçoit/audite la policy ; importer la policy et enforcer sur le cluster vivant = exécuté par le propriétaire (§5 cross-tenant). Clés de signature KMS = secrets gatés §5, jamais loggées/commitées.
- **dedup**: non — aucun skill supply-chain/admission existant ; complète l'image-scanning (qui regarde le contenu) en enforçant l'attestation (qui a signé). Cadrage quota (§11).
- **chemin library**: `packages/skills/library/implementing-gcp-binary-authorization/SKILL.md`
- **frameworks**: nist_csf [PR.IR-01, ID.AM-08, GV.SC-06, DE.CM-01], mitre_attack [T1078.004, T1530, T1537, T1580, T1610].
- **renommage**: aucun.
- **état**: boosté conforme (8 sections, summary L1, metadata + frameworks, commentaire source). 0 sdk, 0 secret (PROJECT_ID/keyring placeholders strippés). Re-audit: évolution SLSA/Sigstore-cosign ou API Binary Authorization.

## implementing-gcp-organization-policy-constraints
- **décision**: adapt
- **raison**: doctrine défensive de garde-fous préventifs GCP — constraints list/boolean/custom à travers la hiérarchie org/folder/project (deny external VM IP, restrict locations, disable SA keys, require OS Login, uniform bucket access, no public Cloud SQL), héritage du plus bas ancêtre enforcé, dry-run obligatoire avant enforcement, audit via Cloud Asset Inventory. Complément préventif de CSPM (détection). Recadré read-and-report : MAOS conçoit/audite le set baseline ; set/enforce sur l'org vivante = exécuté par le propriétaire (§5 cross-tenant).
- **dedup**: non — distinct d'IAM (grants) et de CSPM (détection) ; aucun skill Org Policy existant. Cadrage quota (§11).
- **chemin library**: `packages/skills/library/implementing-gcp-organization-policy-constraints/SKILL.md`
- **frameworks**: nist_csf [PR.IR-01, ID.AM-08, GV.SC-06, DE.CM-01], mitre_attack [T1078.004, T1530, T1537, T1580].
- **renommage**: aucun.
- **état**: boosté conforme (8 sections, summary L1, metadata + frameworks, commentaire source). 0 sdk, 0 secret (ORGANIZATION_ID placeholder strippé). Re-audit: nouvelles constraints managées GCP ou révision CIS GCP Foundations.

## implementing-gcp-vpc-firewall-rules
- **décision**: adapt
- **raison**: doctrine défensive de segmentation réseau GCP — audit des règles permissives (0.0.0.0/0 ingress, all-protocol, SSH/RDP ouvert, règles désactivées), ingress least-privilege (ciblage par service-account > tags mutables), egress default-deny + allows explicites (Google APIs restricted VIP, DNS), policies hiérarchiques org/folder, validation via VPC Flow Logs avant toute suppression. Recadré read-and-report : MAOS audite/conçoit le plan de règles ; create/modify/delete sur le VPC vivant = exécuté par le propriétaire (§5 cross-tenant) ; supprimer sans baseline flow-log = outage. CIDR externes = `allowed_hosts` review.
- **dedup**: non — distinct de Cloud Armor (L7) et Org Policy (guardrails create-time) ; aucun skill firewall réseau existant. S'aligne sur le garde-fou réseau §5 (allowed_hosts). Cadrage quota (§11).
- **chemin library**: `packages/skills/library/implementing-gcp-vpc-firewall-rules/SKILL.md`
- **frameworks**: nist_csf [PR.IR-01, ID.AM-08, GV.SC-06, DE.CM-01], mitre_attack [T1078.004, T1530, T1537, T1580].
- **renommage**: aucun.
- **état**: boosté conforme (8 sections, summary L1, metadata + frameworks, commentaire source). 0 sdk, 0 secret (ORG_ID/CIDR placeholders strippés). Re-audit: évolution Hierarchical Firewall Policies ou findings SCC firewall.

---

## Bilan lot ES

- **Keepers**: 8/8 (8 défensifs blue-team cloud-security natifs).
- **Rejets**: 0 (aucune surface offensive/weaponization rencontrée ; garde-fou défensif satisfait par recadrage read-and-report systématique).
- **Renommages**: 0.
- **Boost lourd**: `implementing-cloud-workload-protection` (source au body mince — substance technique réelle extraite et étoffée aux 7 sections §12).
- **Sanitize**: 8/8 clean (0 secret/PII réel — seulement placeholders ACCOUNT/PROJECT_ID/ORG_ID/CIDR/WRAPPED_KEY_BASE64 ; 0 `@anthropic-ai/sdk`).
- **Conformité §12**: 8/8 à la forme exemplaire (ligne 1 `---`, frontmatter name/description/summary L1 ≤200 tok/metadata{origin/license/cluster/tier/status/frameworks}, commentaire source `<!-- pattern from mukul975/... -->`, Prompt Defense Baseline verbatim, 7 sections §12 = Overview/When-to-Use+When-NOT/Principles citant la source/Process/Rationalizations/Red Flags/Verification).
- **Recadrages transverses**: §11 (quota units, jamais $/€) + §5 (read-and-report ; remédiation/enforcement/scans/deletions = exécutés par le propriétaire sur son tenant, jamais action MAOS autonome ; credentials cloud/KMS = secrets gatés jamais loggés/commités ; cibles cloud externes = `allowed_hosts`).

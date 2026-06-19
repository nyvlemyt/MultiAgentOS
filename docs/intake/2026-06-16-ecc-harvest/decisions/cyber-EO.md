# ECC Harvest — décisions cluster `cyber:cloud-security` (lot EO)

Doer: lot EO (8 skills). Worktree `maos-ecc` (branche `phase/ecc-harvest`). Méthode: intake-audit, barre LARGE (T1, library), garde-fou défensif explicite.
Source cybersec: `mukul975/Anthropic-Cybersecurity-Skills` (Apache-2.0). Cible: `packages/skills/library/<slug>/SKILL.md`.
Recadrage transverse: MAOS = abonnement (§11), PAS de coût per-token PAYG ; tout chiffre = unités de quota, jamais $/€. Secrets/keystores/réseau/cross-projet = gatés §5.
Sanitize (regex secrets/PII/internal): 8/8 sources clean. `@anthropic-ai/sdk`: absent des 8 sources.
Champ `frameworks` préservé depuis le frontmatter source (nist_csf/mitre_attack + nist_ai_rmf/atlas_techniques quand présents).

**Garde-fou défensif (KILL criterion ce lot)**: les 8 skills sont blue-team cloud-security (audit posture, analyse de logs, CIS, revue IAM/RBAC, scan IaC). Tout recadré READ-AND-REPORT : MAOS raisonne sur les indicateurs et produit des findings ; les actions de remédiation (corriger ACL, supprimer clé, restreindre rôle) sont des **recommandations au propriétaire**, jamais une action MAOS exécutée sur le tenant/compte de l'utilisateur. Toute bascule vers weaponization/ciblage de masse/évasion → REJECT (non rencontré). Credentials cloud (clés SA, secrets, PIN, tokens) = secrets gatés §5, jamais loggés/persistés/commités ; cibles cloud externes = `allowed_hosts` only.

---

## auditing-aws-s3-bucket-permissions
- **décision**: adapt
- **raison**: audit défensif de posture S3 sur compte autorisé — Block Public Access (compte+bucket), ACL publiques (AllUsers/AuthenticatedUsers), policies à principal wildcard, chiffrement/versioning/logging, corroboré Prowler CIS + IAM Access Analyzer. Recadré read-and-report (sensibilité inférée des noms/metadata, jamais de download d'objets) ; remédiation = guidance au propriétaire. Credentials AWS = secrets §5.
- **dedup**: non — `mas-sec-reviewer` gate les actions mais ne porte pas la doctrine de posture S3 ; complémentaire de `analyzing-cloud-storage-access-patterns` (logs runtime vs config statique).
- **chemin library**: `packages/skills/library/auditing-aws-s3-bucket-permissions/SKILL.md`
- **frameworks**: nist_csf [PR.IR-01, ID.AM-08, GV.SC-06, DE.CM-01], mitre_attack [T1530, T1619, T1078.004, T1537, T1567.002].
- **renommage**: aucun (slug source conservé).
- **état**: boosté conforme (ligne 1 `---`, commentaire source, summary L1 ≤200 tok, metadata complet + frameworks, Prompt Defense Baseline verbatim, 7 sections §12). 0 sdk, 0 secret. Re-audit: nouvelle révision CIS AWS Foundations ou dépréciation d'ACL S3.

## analyzing-cloud-storage-access-patterns
- **décision**: adapt
- **raison**: hunt d'anomalies d'accès cross-cloud (S3/GCS/Azure Blob) sur logs autorisés — baselines (volume/heure, objets/principal, historique IP) puis détection bulk-download, IP nouvelle vs fenêtre 30j, accès hors-heures, spike ListBucket (recon). Frameworks ATLAS/AI-RMF présents (pertinent sécurité-agent §12). Recadré read-only (jamais ouvrir les objets investigés) ; remédiation = guidance propriétaire. Credentials = secrets §5.
- **dedup**: non — distinct de `auditing-aws-s3-bucket-permissions` (config statique vs comportement runtime) ; complète la doctrine data-access que `mas-sec-reviewer` consomme.
- **chemin library**: `packages/skills/library/analyzing-cloud-storage-access-patterns/SKILL.md`
- **frameworks**: nist_csf [PR.IR-01, ID.AM-08, GV.SC-06, DE.CM-01], mitre_attack [T1530, T1567.002, T1619, T1078.004, T1048], nist_ai_rmf [MEASURE-2.7, MAP-5.1, MANAGE-2.4], atlas_techniques [AML.T0024, AML.T0056].
- **renommage**: aucun.
- **état**: boosté conforme (8 sections = Prompt Defense Baseline + 7 §12, summary L1, metadata + frameworks complets, commentaire source). 0 sdk, 0 secret. Re-audit: évolution des formats CloudTrail Data Events / Azure Storage Analytics.

## analyzing-office365-audit-logs-for-compromise
- **décision**: adapt
- **raison**: hunt BEC sur tenant O365 autorisé via Microsoft Graph (permissions read-only) — Unified Audit Log, règles inbox/forwarding externes, délégation mailbox, consentements OAuth suspects, sign-ins anormaux → timeline risk-scorée. Recadré read-only (jamais scope write), remédiation = guidance propriétaire. Secret/cert client Graph = secret §5.
- **dedup**: non — complémentaire de `detecting-business-email-compromise`/`detecting-email-account-compromise` existants (ceux-ci côté gateway/UEBA ; ici source = Unified Audit Log + Graph mailbox settings). `mas-sec-reviewer` gate, ne hunt pas.
- **chemin library**: `packages/skills/library/analyzing-office365-audit-logs-for-compromise/SKILL.md`
- **frameworks**: nist_csf [PR.IR-01, ID.AM-08, GV.SC-06, DE.CM-01], mitre_attack [T1114.002, T1098.002, T1556.006, T1078.004].
- **renommage**: aucun.
- **état**: boosté conforme (8 sections, summary L1, metadata + frameworks, commentaire source). 0 sdk, 0 secret. Re-audit: évolution Microsoft Graph audit schema ou Unified Audit Log.

## auditing-azure-active-directory-configuration
- **décision**: adapt
- **raison**: audit posture identité Entra ID sur tenant autorisé (read-only Reader) — security defaults, rôles privilégiés (Global Admins, PIM vs permanent, SP, guests), couverture conditional-access + gaps MFA, comptes stale/guest, sign-ins risqués/legacy/impossible-travel, corroboré ScoutSuite. Recadré read-only + distinction report-only≠enforced ; remédiation = guidance propriétaire. Credentials tenant = secrets §5.
- **dedup**: non — distinct de `analyzing-azure-activity-logs-for-threats` (config statique vs threat-hunt runtime) ; complète la doctrine IAM que `mas-sec-reviewer` consomme.
- **chemin library**: `packages/skills/library/auditing-azure-active-directory-configuration/SKILL.md`
- **frameworks**: nist_csf [PR.IR-01, ID.AM-08, GV.SC-06, DE.CM-01], mitre_attack [T1078.004, T1098.003, T1556.006, T1069.003, T1526].
- **renommage**: aucun.
- **état**: boosté conforme (8 sections, summary L1, metadata + frameworks, commentaire source). 0 sdk, 0 secret. Re-audit: nouvelle révision CIS Azure Foundations ou changement de licence Entra (PIM/P2).

## auditing-cloud-with-cis-benchmarks
- **décision**: adapt
- **raison**: audit multi-cloud CIS Foundations (AWS v5/Azure v4/GCP v4) sur comptes autorisés via Prowler/ScoutSuite — parsing controls FAIL, score par section, priorisation Level 1→2, monitoring continu. Frameworks nist_ai_rmf GOVERN présents (§12). Recadré read-only (roles SecurityAudit/Reader/Viewer) + remédiation test-first sous change control propriétaire. Credentials = secrets §5.
- **dedup**: complémentaire — `performing-kubernetes-cis-benchmark-with-kube-bench` (k8s spécifique) + `hardening-*-endpoint-with-cis-benchmark` existent ; ce skill couvre le CIS *cloud-account* multi-provider, absent ailleurs. `mas-sec-reviewer` gate, ne benchmark pas.
- **chemin library**: `packages/skills/library/auditing-cloud-with-cis-benchmarks/SKILL.md`
- **frameworks**: nist_csf [PR.IR-01, ID.AM-08, GV.SC-06, DE.CM-01], mitre_attack [T1078.004, T1530, T1098.003, T1685.002, T1580], nist_ai_rmf [GOVERN-1.1, GOVERN-4.2, MAP-2.3].
- **renommage**: aucun.
- **état**: boosté conforme (8 sections, summary L1, metadata + frameworks complets, commentaire source). 0 sdk, 0 secret. Re-audit: publication d'une nouvelle version majeure CIS Foundations (AWS/Azure/GCP).

## auditing-gcp-iam-permissions
- **décision**: adapt
- **raison**: audit IAM GCP least-privilege sur org/projet autorisé (read-only securityReviewer/cloudAsset.viewer) — bindings primitifs (Owner/Editor), inventaire SA + clés user-managed, IAM Recommender (excès), Policy Analyzer (effective access + allUsers/allAuthenticatedUsers), delegation domain-wide + impersonation. Recadré read-only + effective-access (pas juste bindings bruts) ; remédiation = guidance propriétaire avec période de test. Clés SA = secrets §5.
- **dedup**: non — distinct de `auditing-kubernetes-cluster-rbac` (GKE RBAC) ; complète `implementing-aws-iam-permission-boundaries`/`performing-service-account-audit` côté revue GCP. `mas-sec-reviewer` gate, ne revoit pas l'IAM.
- **chemin library**: `packages/skills/library/auditing-gcp-iam-permissions/SKILL.md`
- **frameworks**: nist_csf [PR.IR-01, ID.AM-08, GV.SC-06, DE.CM-01], mitre_attack [T1078.004, T1098.003, T1528, T1548.005, T1580].
- **renommage**: aucun.
- **état**: boosté conforme (8 sections, summary L1, metadata + frameworks, commentaire source). 0 sdk, 0 secret. Re-audit: évolution gcloud IAM / dépréciation des clés SA user-managed.

## auditing-kubernetes-cluster-rbac
- **décision**: adapt
- **raison**: audit RBAC k8s (EKS/GKE/AKS) sur cluster autorisé (read) — ClusterRoles wildcard, secret-read, pods/exec, bindings cluster-admin + system:authenticated, who-can (rbac-tool), KubiScan (privesc), Kubeaudit, token automount + pods privileged/root. Recadré read-only + bindings≠roles ; remédiation = guidance propriétaire avec caveat usage (CI/CD/operators). Kubeconfig = secret §5.
- **dedup**: complémentaire — `implementing-rbac-hardening-for-kubernetes`/`implementing-kubernetes-pod-security-standards` existent (build/hardening) ; ce skill couvre l'*audit* RBAC d'un cluster déployé, distinct de `auditing-gcp-iam-permissions` (IAM cloud, pas RBAC cluster). `mas-sec-reviewer` gate, ne revoit pas le RBAC.
- **chemin library**: `packages/skills/library/auditing-kubernetes-cluster-rbac/SKILL.md`
- **frameworks**: nist_csf [PR.IR-01, ID.AM-08, GV.SC-06, DE.CM-01], mitre_attack [T1098.006, T1552.007, T1611, T1613, T1078.004].
- **renommage**: aucun.
- **état**: boosté conforme (8 sections, summary L1, metadata + frameworks, commentaire source). 0 sdk, 0 secret. Re-audit: évolution de l'API RBAC k8s ou des Pod Security Standards.

## auditing-terraform-infrastructure-for-security
- **décision**: adapt
- **raison**: audit IaC Terraform shift-left sur repo autorisé — Checkov/tfsec/Terrascan + OPA/Rego custom, scan code+plan JSON+state, gate CI/CD bloquant (SARIF), triage par severity. Recadré static-analysis-and-report : remédiation = PR du développeur, jamais un `terraform apply` MAOS. Secret en dur dans code/state = finding §5 critique (redacted, jamais echo de la valeur).
- **dedup**: complémentaire — `implementing-infrastructure-as-code-security-scanning`/`implementing-policy-as-code-with-open-policy-agent` existent (build de pipeline/policy générique) ; ce skill couvre l'*audit* Terraform spécifique (code+plan+state, OPA Terraform). `mas-sec-reviewer` gate les actions, ne scanne pas l'IaC.
- **chemin library**: `packages/skills/library/auditing-terraform-infrastructure-for-security/SKILL.md`
- **frameworks**: nist_csf [PR.IR-01, ID.AM-08, GV.SC-06, DE.CM-01], mitre_attack [T1078.004, T1530, T1190, T1552.001, T1580].
- **renommage**: aucun.
- **état**: boosté conforme (8 sections, summary L1, metadata + frameworks, commentaire source). 0 sdk, 0 secret. Re-audit: évolution majeure Checkov/tfsec policy sets ou format Terraform plan/state.

---

## Bilan lot EO

- **Keepers**: 8/8 (8 défensifs natifs blue-team cloud-security).
- **Rejets**: 0 (aucun skill offensif/weaponization dans ce lot ; le garde-fou défensif n'a pas déclenché de KILL).
- **Renommages**: 0 (8 slugs source conservés).
- **Sanitize**: 8/8 clean (0 secret/PII, 0 `@anthropic-ai/sdk`).
- **Conformité §12**: 8/8 à la forme exemplaire (ligne 1 `---`, frontmatter name/description/summary L1 ≤200 tok/metadata{origin/license/cluster:cyber:cloud-security/tier:T1/status:library/frameworks}, commentaire source `mukul975/...`, Prompt Defense Baseline verbatim, 7 sections §12 = Overview/Principles[cite source]/Process/Rationalizations/Red Flags/Verification + When-to-Use).
- **Recadrages transverses**: §11 (quota units, pas de $/€) + §5 (credentials cloud = secrets gatés jamais loggés/commités/hors-sandbox ; remédiation = guidance/PR propriétaire, jamais une écriture MAOS sur le tenant/compte/infra de l'utilisateur ; cibles externes = `allowed_hosts`) + read-and-report strict (jamais télécharger les objets/données investigués).
- **Frameworks préservés**: nist_csf+mitre_attack sur les 8 ; nist_ai_rmf/atlas_techniques ajoutés où présents en source (analyzing-cloud-storage-access-patterns: ATLAS+AI-RMF ; auditing-cloud-with-cis-benchmarks: AI-RMF GOVERN).

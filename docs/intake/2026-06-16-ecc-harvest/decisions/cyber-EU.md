# ECC Harvest — décisions cluster `cyber:cloud-security` (lot EU)

Doer: lot EU (8 skills, dont 2 titrés offensifs). Worktree `maos-ecc` (branche `phase/ecc-harvest`). Méthode: intake-audit, barre LARGE (T1, library) pour le défensif, garde-fou défensif explicite en KILL criterion.
Source cybersec: `mukul975/Anthropic-Cybersecurity-Skills` (Apache-2.0). Cible: `packages/skills/library/<slug>/SKILL.md`.
Recadrage transverse: MAOS = abonnement (§11), PAS de coût per-token PAYG ; tout chiffre = unités de quota, jamais $/€/€-par-TB. Secrets/keystores/réseau/cross-tenant = gatés §5.
Sanitize (regex secrets/PII/internal): 8/8 sources clean (placeholders ACCOUNT/PROJECT_ID/ORG_ID/AKIA…/key-id/CIDR uniquement, aucune valeur réelle). `@anthropic-ai/sdk`: absent des 8 sources.
Champ `frameworks` préservé depuis le frontmatter source (nist_csf/mitre_attack + nist_ai_rmf/atlas_techniques quand présents).

**Garde-fou défensif (KILL criterion ce lot)**: 6 des 8 sont blue-team cloud-security (forensics CloudTrail/VPC-Flow/S3/ALB via Athena, forensics runtime conteneur Falco, threat-hunting AWS Detective, assessment GCP Forseti/SCC, revue de fonctions serverless, remédiation S3). Tout recadré READ-AND-REPORT : MAOS raisonne sur logs/posture/configs et produit des findings + recommandations ; les actions (corriger ACL, supprimer clé, restreindre rôle, basculer une instance, déployer une règle, appliquer une policy) sont des **recommandations au propriétaire**, jamais une action MAOS exécutée sur le tenant/compte/cloud de l'utilisateur (§5 cross-tenant + risk:high/blocking). Credentials cloud (clés SA, secrets, tokens, KMS) = secrets gatés §5, jamais loggés/persistés/commités ; endpoints cloud externes = `allowed_hosts` only.
**2 skills titrés offensifs = KILL appliqué**: `performing-cloud-penetration-testing-with-pacu` (framework d'EXPLOITATION AWS prêt-à-tirer) et `performing-gcp-penetration-testing-with-gcpbucketbrute` (arme d'énumération/brute-force de buckets) → REJECT (détail ci-dessous). Aucun résidu défensif-only distinct ne survit au strip de l'exploitation ; le durcissement IAM/cloud correspondant est déjà couvert.

---

## performing-cloud-log-forensics-with-athena
- **décision**: adapt
- **raison**: doctrine défensive de forensics de logs cloud à l'échelle — tables forensiques (CloudTrail/VPC Flow/S3 access/ALB) en partition projection (pas d'ALTER TABLE manuel), SQL forensique mappant chaque requête à un comportement attaquant (AccessDenied bursts, privesc IAM, exfil S3 hors-RFC1918, lateral movement + port-scan sur VPC Flow, injection au niveau ALB), corrélation multi-source en timeline d'incident. Recadré read-and-report : MAOS conçoit tables+requêtes et raisonne sur les résultats ; exécuter sur le compte vivant et agir = propriétaire (§5 cross-tenant). ARN/IP/identités = preuve sensible jamais leakée.
- **dedup**: non — aucun skill de forensics-SQL CloudTrail/VPC-Flow/ALB existant en `library/` (les `analyzing-*-logs` couvrent d'autres sources/outils) ; nourrit la détection que `mas-sec-reviewer` consomme. Cadrage quota (§11), pas de $-par-TB Athena.
- **chemin library**: `packages/skills/library/performing-cloud-log-forensics-with-athena/SKILL.md`
- **frameworks**: nist_csf [PR.IR-01, ID.AM-08, GV.SC-06, DE.CM-01], mitre_attack [T1078.004, T1530, T1537, T1580, T1021].
- **renommage**: aucun (slug source conservé).
- **état**: boosté conforme (ligne 1 `---`, commentaire source, summary L1 ≤200 tok, metadata complet + frameworks, Prompt Defense Baseline verbatim, 7 sections §12). 0 sdk, 0 secret. Re-audit: évolution CloudTrail Lake/Security Lake ou nouveaux formats de logs ALB/VPC Flow.

## performing-cloud-native-forensics-with-falco
- **décision**: adapt (boost lourd — source au corps mince)
- **raison**: doctrine défensive de détection runtime conteneur/k8s — règles YAML sur le flux de syscalls (shell-in-container, lecture de fichiers sensibles /etc/shadow|passwd, connexions sortantes inattendues, escalade setuid/setgid, container escape mount/ptrace), tuning des faux positifs par exclusion de parents bénins (entrypoint/supervisord), triage des alertes JSON Falco. Source au body mince (When-to-Use générique + 1 règle + 1 snippet parse) : substance technique réelle extraite et étoffée aux 7 sections §12, runtime explicitement distingué du scanning d'image statique (ce que fait le conteneur vs ce qu'il contient). Recadré read-and-report : déployer/enforcer Falco ou répondre (kill pod, cordon) sur le cluster vivant = propriétaire (§5 cross-tenant).
- **dedup**: non — distinct des `scanning-*`/`implementing-*-image-*` (statique) et de `detecting-container-escape-with-falco-rules` (focalisé escape) ; apporte la doctrine d'authoring+triage runtime complète. Cadrage quota (§11).
- **chemin library**: `packages/skills/library/performing-cloud-native-forensics-with-falco/SKILL.md`
- **frameworks**: nist_csf [PR.IR-01, ID.AM-08, GV.SC-06, DE.CM-01], mitre_attack [T1078.004, T1530, T1537, T1580, T1068].
- **renommage**: aucun.
- **état**: boosté conforme (8 sections = Prompt Defense Baseline + 7 §12, summary L1, metadata + frameworks, commentaire source). 0 sdk, 0 secret. Re-audit: évolution Falco/Tetragon/eBPF ou nouvelles TTP container-escape.

## performing-cloud-native-threat-hunting-with-aws-detective
- **décision**: adapt
- **raison**: doctrine défensive de threat-hunting graphe — behavior graphs auto-liant CloudTrail/VPC-Flow/GuardDuty/EKS, investigation par entité (IAM user/role, EC2, IP, bucket, cluster) sur fenêtre scope-time, corrélation des findings GuardDuty en finding-groups (campagne), interprétation des indicateurs (IMPOSSIBLE_TRAVEL, FLAGGED_IP, NEW_GEOLOCATION/ASO/USER_AGENT) cross-référencés contre CloudTrail brut. Detective est read-only par construction (ne mute aucune ressource) → skill T1 propre. Recadré read-and-report : répondre (disable key, isoler instance) sur le compte vivant = propriétaire (§5 cross-tenant). IAM scopé read uniquement (detective:SearchGraph/GetInvestigation/ListIndicators).
- **dedup**: non — distinct d'Athena (SQL brut) et de `detecting-cloud-threats-with-guardduty` (signaux bruts) ; apporte la doctrine d'investigation graphe + corrélation campagne. Cadrage quota (§11).
- **chemin library**: `packages/skills/library/performing-cloud-native-threat-hunting-with-aws-detective/SKILL.md`
- **frameworks**: nist_csf [PR.IR-01, ID.AM-08, GV.SC-06, DE.CM-01], mitre_attack [T1078.004, T1530, T1537, T1580, T1071].
- **renommage**: aucun.
- **état**: boosté conforme (8 sections, summary L1, metadata + frameworks, commentaire source). 0 sdk, 0 secret (ARN graph/IDs = placeholders). Re-audit: évolution API Detective (investigation auto) ou nouveaux indicateurs.

## performing-gcp-security-assessment-with-forseti
- **décision**: adapt
- **raison**: doctrine défensive d'assessment de posture GCP — inventaire via Cloud Asset Inventory + SCC, audit IAM à travers la hiérarchie org→folder→project (Owner/Editor, allUsers/allAuthenticatedUsers, clés SA >90j), firewall 0.0.0.0/0 / all-protocol / SSH-RDP ouverts, buckets publics / sans CMEK / sans uniform-access, conformité CIS GCP Foundations via SCC findings, ScoutSuite en corroboration multi-check. Héritage top-down → auditer chaque niveau. Forseti est déprécié au profit de SCC (référencé mais superseded ; le skill porte le chemin SCC/gcloud/ScoutSuite). Recadré read-and-report : remédier/enforcer sur l'org vivante = propriétaire (§5 cross-tenant). IAM read-only (securityReviewer) ; matériau de clé SA = secret §5 jamais lu/persisté.
- **dedup**: non — distinct de `auditing-gcp-iam-permissions` (focalisé IAM) et de `implementing-gcp-organization-policy-constraints` (préventif) ; apporte l'assessment posture multi-axe (IAM+réseau+storage+CIS) org-wide. Cadrage quota (§11).
- **chemin library**: `packages/skills/library/performing-gcp-security-assessment-with-forseti/SKILL.md`
- **frameworks**: nist_csf [PR.IR-01, ID.AM-08, GV.SC-06, DE.CM-01], mitre_attack [T1078.004, T1530, T1537, T1580], nist_ai_rmf [MEASURE-2.7, MAP-5.1, MANAGE-2.4, GOVERN-1.1, GOVERN-4.2], atlas_techniques [AML.T0070, AML.T0066, AML.T0082].
- **renommage**: aucun (Forseti conservé au slug ; déprécation documentée dans le corps).
- **état**: boosté conforme (8 sections, summary L1, metadata + frameworks, commentaire source). 0 sdk, 0 secret (ORG_ID/PROJECT_ID/SA_EMAIL placeholders strippés). Re-audit: révision CIS GCP Foundations ou évolution SCC (retrait définitif de Forseti des frameworks de conformité).

## performing-serverless-function-security-review
- **décision**: adapt
- **raison**: doctrine défensive de revue de fonctions serverless (Lambda/Azure Functions/Cloud Functions) — rôles d'exécution wildcard/admin → scope least-privilege, secrets en variables d'environnement, triggers non authentifiés (function URLs, resource-based invoke public), code injection/deserialization (os.system/eval/pickle.loads/yaml.load), runtimes dépréciés, Prowler/Checkov/Bandit. Pattern de finding = combinaison dangereuse (admin role + secrets env + trigger public). Recadré read-and-report : appliquer changements de rôle / migration secrets / changement de trigger sur fonctions vivantes = propriétaire (§5 cross-tenant). Secret découvert = §5-critique masqué, jamais persisté/commité.
- **dedup**: non — distinct de `detecting-serverless-function-injection` (détection runtime) et de `mas-sec-reviewer` (gate générique) ; apporte la doctrine de revue statique multi-provider (rôle+secret+trigger+code). Cadrage quota (§11).
- **chemin library**: `packages/skills/library/performing-serverless-function-security-review/SKILL.md`
- **frameworks**: nist_csf [PR.IR-01, ID.AM-08, GV.SC-06, DE.CM-01], mitre_attack [T1078.004, T1530, T1537, T1580, T1055].
- **renommage**: aucun.
- **état**: boosté conforme (8 sections, summary L1, metadata + frameworks, commentaire source). 0 sdk, 0 secret réel (patterns de détection password/key/AKIA = signatures, pas de valeur ; placeholders FUNCTION_NAME). Re-audit: nouveaux runtimes dépréciés ou évolution OWASP Serverless Top 10.

## remediating-s3-bucket-misconfiguration
- **décision**: adapt (recadrage read-and-report appuyé — source contient des commandes qui mutent le compte vivant)
- **raison**: doctrine défensive de remédiation S3 — détection (Access Analyzer, Config, Macie, inspection policy/ACL Principal '*') + plan ordonné : Block Public Access account+bucket (4 settings), BucketOwnerEnforced pour désactiver les ACL legacy, policies restrictives (deny non-TLS, VPC-endpoint-only), SSE-KMS par défaut + deny-unencrypted-upload, access logging + CloudTrail data events, SCP/Config préventifs. Le source exécute des mutations → recadré durement : MAOS identifie l'exposition et produit le plan ORDONNÉ ; exécuter (BPA, remplacer policy, désactiver ACL, chiffrer) sur le compte vivant = propriétaire (§5 cross-tenant + risk:high). Préserver les access logs AVANT remédiation = preuve.
- **dedup**: non — distinct de `auditing-aws-s3-bucket-permissions` (audit seul) ; apporte la doctrine de remédiation ordonnée + contrôles préventifs. Cadrage quota (§11). Le titre "remediating" est conservé mais le corps est read-and-report (design du plan, pas exécution).
- **chemin library**: `packages/skills/library/remediating-s3-bucket-misconfiguration/SKILL.md`
- **frameworks**: nist_csf [PR.IR-01, ID.AM-08, GV.SC-06, DE.CM-01], mitre_attack [T1078.004, T1530, T1537, T1580, T1573].
- **renommage**: aucun (slug "remediating-*" conservé ; recadrage read-and-report explicite dans le corps — MAOS conçoit le plan, le propriétaire exécute).
- **état**: boosté conforme (8 sections, summary L1, metadata + frameworks, commentaire source). 0 sdk, 0 secret (account-id 123456789012 = placeholder ; key-id ARN placeholder). Re-audit: évolution Block Public Access / Access Analyzer ou nouveaux contrôles préventifs S3.

## performing-cloud-penetration-testing-with-pacu
- **décision**: reject
- **raison**: framework d'EXPLOITATION AWS prêt-à-tirer (Pacu de Rhino Security Labs, 50+ modules). Le corps est une recette offensive opérationnelle : `iam__privesc_scan --escalate` (exploitation effective de 21+ méthodes de privesc), `s3__download_bucket --dl-names` (exfiltration), `secretsmanager__enum` / `ssm__download_parameters` (vol de secrets), `ebs__enum_snapshots_unauth`, `sts__assume_role` lateral movement, `lambda` code-injection, persistence + cleanup d'artefacts. Aucun résidu défensif-only distinct ne survit au strip de l'exploitation : ce qui resterait (durcissement IAM, permission boundaries, détection GuardDuty/Security Hub, blast-radius) est déjà couvert par les keepers de ce lot + `performing-gcp-security-assessment-with-forseti` + les library existants `auditing-aws-s3-bucket-permissions` / `implementing-aws-iam-permission-boundaries` / `detecting-aws-iam-privilege-escalation` / `detecting-cloud-threats-with-guardduty`. Importer le manuel d'armement n'ajoute rien de défensif que MAOS ne possède.
- **dedup**: oui sur la valeur défensive (durcissement IAM + détection privesc = déjà chez nous) ; le reste = arme par construction (§5 risk:high/blocking — credential harvesting, exfil, exécution de code sur le tenant).
- **chemin library**: aucun (T0, non ingéré).
- **renommage**: aucun (pas de checklist d'auto-assessment distincte ne survit ; un "assess your own IAM blast radius" serait dup-no-better de Forseti/IAM-boundaries existants).
- **état**: rejeté. KILL: framework d'exploitation offensif prêt-à-tirer (privesc-escalate, exfil S3/secrets, lateral movement, persistence) ; aucun résidu défensif-only ; valeur de durcissement = dup-no-better. Re-audit: NON (conflit structurel — outil offensif ; à ne jamais ingérer comme bibliothèque exécutable).

## performing-gcp-penetration-testing-with-gcpbucketbrute
- **décision**: reject
- **raison**: outil d'énumération/brute-force de buckets GCS (GCPBucketBrute, Rhino Security Labs) — permutations de mots-clés pour découvrir des buckets accessibles tiers, TestIamPermissions de masse, recherche de chemins de privesc IAM, test d'impersonation de service-accounts (`iam.serviceAccounts.actAs`, `setIamPolicy`). C'est une arme d'énumération/mass-targeting (KILL ce lot). Le seul résidu envisagé — « auditer l'exposition de TES PROPRES buckets GCS » — ne survit pas distinctement : il est déjà couvert par `performing-gcp-security-assessment-with-forseti` (Step 4 audit GCS public-access, `gsutil iam get` allUsers/allAuthenticatedUsers) + les library existants `assessing-own-cloud-security-posture` / `auditing-gcp-iam-permissions` / `detecting-misconfigured-azure-storage` (équivalent posture). Le rename `auditing-own-gcs-bucket-exposure` serait dup-no-better → non créé.
- **dedup**: oui — l'audit d'exposition de ses propres buckets = déjà couvert par Forseti keeper + posture existante ; reste = énumération brute-force tierce (arme).
- **chemin library**: aucun (T0, non ingéré).
- **renommage**: envisagé `auditing-own-gcs-bucket-exposure` puis REJETÉ (dup-no-better de Forseti Step 4 + assessing-own-cloud-security-posture ; aucun résidu distinct).
- **état**: rejeté. KILL: arme d'énumération/brute-force de buckets (mass-targeting tiers) ; le résidu audit-self = dup-no-better des keepers/existants. Re-audit: NON (outil offensif d'énumération ; l'audit de posture self est déjà servi par le cluster).

---

## Bilan lot EU

- **Keepers**: 6/8 (forensics Athena, forensics runtime Falco, threat-hunting Detective, assessment GCP Forseti, revue serverless, remédiation S3).
- **Rejets**: 2/8 — les 2 skills titrés offensifs (`performing-cloud-penetration-testing-with-pacu` = framework d'exploitation AWS ; `performing-gcp-penetration-testing-with-gcpbucketbrute` = arme d'énumération de buckets). Garde-fou défensif appliqué en KILL ; aucun résidu défensif-only distinct ne survit ; valeur de durcissement/posture = dup-no-better des keepers + library existants.
- **Renommages**: 0 (le rename envisagé `auditing-own-gcs-bucket-exposure` pour gcpbucketbrute a été rejeté comme dup-no-better).
- **Boost lourd**: `performing-cloud-native-forensics-with-falco` (source au body mince — substance technique extraite et étoffée aux 7 sections §12).
- **Sanitize**: 8/8 clean (0 secret/PII réel — placeholders ACCOUNT/PROJECT_ID/ORG_ID/AKIA…/key-id/CIDR/instance-id uniquement ; les patterns password/key/AKIA du serverless-review sont des signatures de détection, pas des valeurs ; 0 `@anthropic-ai/sdk`).
- **Conformité §12** (6 keepers): à la forme exemplaire (ligne 1 `---`, frontmatter name/description/summary L1 ≤200 tok/metadata{origin/license/cluster:cyber:cloud-security/tier:T1/status:library/frameworks}, commentaire source `<!-- pattern from mukul975/... -->`, Prompt Defense Baseline verbatim, 7 sections §12 = Overview/When-to-Use+When-NOT/Principles citant la source/Process/Rationalizations/Red Flags/Verification).
- **Recadrages transverses**: §11 (quota units, jamais $/€/par-TB) + §5 (read-and-report systématique ; remédiation/réponse/déploiement/enforcement/scans = exécutés par le propriétaire sur son tenant, jamais action MAOS autonome ; credentials cloud/KMS/SA-keys = secrets gatés jamais lus/loggés/commités ; cibles cloud externes = `allowed_hosts`). Le keeper `remediating-s3-*` (titre actif) a reçu le recadrage le plus appuyé : MAOS conçoit le plan ordonné, le propriétaire exécute.

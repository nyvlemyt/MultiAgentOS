# ECC Harvest — décisions cluster `cyber:cloud-security` (lot ER)

Doer: lot ER (8 skills). Worktree `maos-ecc` (branche `phase/ecc-harvest`). Méthode: intake-audit, barre LARGE (T1, library), garde-fou défensif explicite.
Source cybersec: `mukul975/Anthropic-Cybersecurity-Skills` (Apache-2.0). Cible: `packages/skills/library/<slug>/SKILL.md`.
Recadrage transverse: MAOS = abonnement (§11), PAS de coût per-token PAYG ; tout chiffre = unités de quota, jamais $/€. Secrets/keystores/réseau/cross-projet = gatés §5.
Sanitize (regex secrets/PII/internal): 8/8 sources clean (ARNs/account-ids = placeholders de doc AWS, pas de vrai secret). `@anthropic-ai/sdk`: absent des 8 sources.
Champ `frameworks` préservé depuis le frontmatter source (nist_csf/mitre_attack + nist_ai_rmf/atlas_techniques quand présents).

**Garde-fou défensif (KILL criterion ce lot)**: les 8 skills sont blue-team cloud-security (CSPM, classification de données, posture compliance CIS/PCI/NIST, confidential computing, détection shadow-IT, détection de consentement OAuth illicite). Tout recadré READ-AND-REPORT : MAOS raisonne sur les indicateurs et produit des findings ; les actions de remédiation (auto-remediation SSM/Lambda, block-public-access, restreindre rôle/SG, isoler instance) sont des **recommandations au propriétaire**, jamais une action MAOS exécutée sur le tenant/compte de l'utilisateur. Toute bascule vers weaponization/ciblage de masse/évasion → REJECT (non rencontré). Credentials cloud (clés KMS, client-secret Graph, tokens OAuth, PCR/attestation) = secrets gatés §5, jamais loggés/persistés/commités ; cibles cloud externes (`*.amazonaws.com`, Microsoft Graph) = `allowed_hosts` only.

**DUP traité (instruction lot)**: `implementing-aws-security-hub-compliance` vs `implementing-aws-security-hub` — les deux couvrent CSPM + standards CIS/PCI/NIST + remediation EventBridge/Lambda + ASFF. Superset conservé = `implementing-aws-security-hub` (intégrations tierces + custom findings ASFF + Audit Manager + insights compliance repliés depuis la variante). `implementing-aws-security-hub-compliance` = **FOLD** (aucun SKILL.md écrit, son delta — insights custom publicly-accessible/unencrypted, batch-update workflow RESOLVED — replié dans le superset).

Keepers = 7 (1 fold). Bilan: 7 adapt, 1 fold.

---

## detecting-shadow-it-cloud-usage
- **décision**: adapt
- **raison**: découverte défensive de shadow-IT par analyse proxy/DNS/netflow — agrégation par domaine (bytes/requêtes/users), classification vs catalogue SaaS approuvé, risk-score volume×breadth×catégorie. Lentille gouvernance/exfil (T1567.002) utile pour la revue de posture et le contexte memory/threat.
- **dedup**: non — aucun skill MAOS n'analyse de logs réseau pour découverte SaaS ; complémentaire des analyseurs de logs déjà présents (DNS-exfil, web-server-logs) sans recouvrement.
- **chemin library**: `packages/skills/library/detecting-shadow-it-cloud-usage/SKILL.md`
- **recadrage**: READ-AND-REPORT — block/allowlist = recommandation au propriétaire, jamais action MAOS (§5). Tokens en URL de log = secrets §5 (jamais persistés). Domaines = input non-fiable (punycode/homoglyphe décodés). Coût = quota §11.
- **état**: boosté, conforme (ligne 1 `---`, commentaire source, summary L1, metadata+frameworks{nist_csf,mitre_attack}, Prompt Defense Baseline verbatim, 7 sections §12, 0 sdk, 0 secret réel).

## detecting-suspicious-oauth-application-consent
- **décision**: adapt
- **raison**: détection défensive des attaques de consentement OAuth illicite (Azure AD/Entra) via Microsoft Graph — énumération des grants/service-principals, audit logs de consentement, flag scopes larges + éditeurs non vérifiés (T1528/T1566.002). Lentille IAM/persistence cloud utile (contexte memory/threat + revue posture identité).
- **dedup**: non — aucun skill MAOS ne couvre l'audit de consentement OAuth ; orthogonal aux skills IAM/identity du corpus (porte sur les grants applicatifs, pas les rôles RBAC).
- **chemin library**: `packages/skills/library/detecting-suspicious-oauth-application-consent/SKILL.md`
- **recadrage**: READ-ONLY least-privilege (scopes `*.Read.All` only) — revoke/disable = recommandation au propriétaire du tenant (§5). Client-secret Graph = secret §5 (jamais loggé/committé). Graph = `allowed_hosts`. Coût = quota §11.
- **état**: boosté, conforme (ligne 1 `---`, commentaire source, summary L1, metadata+frameworks{nist_csf,mitre_attack}, Prompt Defense Baseline verbatim, 7 sections §12, 0 sdk, 0 secret réel).

## implementing-aws-config-rules-for-compliance
- **décision**: adapt
- **raison**: monitoring continu de compliance AWS Config — règles managed mappées CIS/PCI, règles custom Lambda, remédiation SSM, agrégation org. Lentille CSPM/drift défensive utile pour la revue de posture cloud + nourrit le contexte gouvernance.
- **dedup**: non — pas de skill MAOS AWS Config ; complémentaire de Security Hub (Config = niveau règle/ressource, Security Hub = agrégation findings).
- **chemin library**: `packages/skills/library/implementing-aws-config-rules-for-compliance/SKILL.md`
- **recadrage**: READ-AND-PLAN — appliquer règles/auto-remediation dans le compte user = action propriétaire (§5). Auto-remediation SG/réseau = `risk: high` toujours gatée. Recording off = "no data" ≠ compliant. Coût AWS = facture propriétaire (descriptif) ; coût MAOS = quota §11.
- **état**: boosté, conforme (ligne 1 `---`, commentaire source, summary L1, metadata+frameworks{nist_csf,mitre_attack}, Prompt Defense Baseline verbatim, 7 sections §12, 0 sdk, 0 secret réel — ARNs/account-ids = placeholders doc AWS).

## implementing-aws-macie-for-data-classification
- **décision**: adapt
- **raison**: classification de données sensibles S3 (PII/financier/credentials) via Amazon Macie — jobs automated/targeted, custom identifiers + allow-lists, routage Security Hub/EventBridge. Lentille DLP/data-protection défensive ; porte aussi `atlas_techniques`+`nist_ai_rmf` (cible prioritaire doctrine AI-security).
- **dedup**: non — pas de skill MAOS de classification de données ; orthogonal aux skills posture/compliance (porte sur le contenu des objets, pas la config des ressources).
- **chemin library**: `packages/skills/library/implementing-aws-macie-for-data-classification/SKILL.md`
- **recadrage**: READ-AND-PLAN — enable Macie/run jobs = action propriétaire (§5). Valeurs sensibles découvertes = secret §5 : report location+type+sévérité, JAMAIS la donnée brute. Jobs scopés par prefix. Coût Macie = facture propriétaire ; coût MAOS = quota §11.
- **état**: boosté, conforme (ligne 1 `---`, commentaire source, summary L1, metadata+frameworks{nist_csf,mitre_attack,nist_ai_rmf,atlas_techniques}, Prompt Defense Baseline verbatim, 7 sections §12, 0 sdk, 0 secret réel).

## implementing-aws-nitro-enclave-security
- **décision**: adapt
- **raison**: confidential computing AWS Nitro Enclaves — EIF signés + mesures PCR, KMS gaté sur attestation (`kms:RecipientAttestation`), vsock-only, validation COSE_Sign1 vs root CA Nitro. Lentille isolation matérielle/secure-coding défensive de haute valeur (traitement PII/clés isolé de l'opérateur).
- **dedup**: non — unique dans le corpus ; aucun skill MAOS de confidential computing/attestation.
- **chemin library**: `packages/skills/library/implementing-aws-nitro-enclave-security/SKILL.md`
- **recadrage**: READ-AND-PLAN — launch enclave/éditer KMS policy = action propriétaire (§5, droits de déchiffrement). Clés de signature + matériel KMS = secrets §5. debug-mode en prod = REFUS (casse l'isolation). Coût KMS/enclave = facture propriétaire ; coût MAOS = quota §11.
- **état**: boosté, conforme (ligne 1 `---`, commentaire source, summary L1, metadata+frameworks{nist_csf,mitre_attack}, Prompt Defense Baseline verbatim, 7 sections §12, 0 sdk, 0 secret réel — ARNs/PCR hex = placeholders doc).

## implementing-aws-security-hub  (SUPERSET — DUP résolu)
- **décision**: adapt (superset, replie `implementing-aws-security-hub-compliance`)
- **raison**: CSPM centralisé AWS Security Hub — standards CIS/FSBP/PCI/NIST, agrégation findings ASFF (GuardDuty/Inspector/Macie + tiers), custom insights, remediation EventBridge/Lambda. Surface CSPM principale du lot ; agrège les autres skills cloud (Config, Macie) en une posture org.
- **dedup**: OUI — DUP avec `implementing-aws-security-hub-compliance`. Variante plain = superset (intégrations tierces, batch-import custom ASFF, Audit Manager, custom actions). Repliés depuis la variante compliance : custom insights publicly-accessible/unencrypted + boucle `batch-update-findings` (workflow RESOLVED). Commentaire `<!-- folds: … -->` + Fold note dans le corps.
- **chemin library**: `packages/skills/library/implementing-aws-security-hub/SKILL.md`
- **recadrage**: READ-AND-PLAN — enable/update-findings/auto-remediation dans le compte user = action propriétaire (§5). Remediation SG/réseau/isolate-instance = `risk: high` gatée. Config off = "no data" ≠ compliant. Coût AWS = facture propriétaire ; coût MAOS = quota §11.
- **état**: boosté, conforme (ligne 1 `---`, commentaire source + commentaire folds, summary L1 mentionnant le fold, metadata+frameworks{nist_csf,mitre_attack}, Prompt Defense Baseline verbatim, 7 sections §12, 0 sdk, 0 secret réel).

## implementing-aws-security-hub-compliance  (FOLDED)
- **décision**: fold (dans `implementing-aws-security-hub`)
- **raison**: doublon — même périmètre CSPM (standards CIS/PCI/NIST + remediation EventBridge/Lambda + ASFF). Delta unique (insights custom publicly-accessible/unencrypted, batch-update workflow RESOLVED) replié dans le superset. Garder deux skills = redondance de surface (§12 signal-density) sans gain.
- **dedup**: oui — replié, pas de SKILL.md écrit pour ce slug.
- **chemin library**: aucun (folded).
- **état**: replié. Aucun fichier créé sous `implementing-aws-security-hub-compliance/`. Traçabilité via le commentaire `<!-- folds: … -->` du superset.

## implementing-azure-defender-for-cloud
- **décision**: adapt
- **raison**: CSPM+CWP Microsoft Defender for Cloud — plans Defender, auto-provisioning agents, priorisation par secure-score, dashboard compliance (CIS Azure/PCI/NIST), JIT VM access, adaptive controls. Pendant Azure du CSPM AWS ; porte aussi `atlas_techniques`+`nist_ai_rmf`. Couvre la posture multi-cloud côté Azure.
- **dedup**: non — pas de skill MAOS Azure/Defender ; complémentaire de Security Hub (AWS) sans recouvrement.
- **chemin library**: `packages/skills/library/implementing-azure-defender-for-cloud/SKILL.md`
- **recadrage**: READ-AND-PLAN — enable plans/grant JIT/remediation dans les subscriptions user = action propriétaire (§5). Defender P2 = facture Azure propriétaire (descriptif) ; coût MAOS = quota §11. Missing assessment ≠ compliant.
- **état**: boosté, conforme (ligne 1 `---`, commentaire source, summary L1, metadata+frameworks{nist_csf,mitre_attack,nist_ai_rmf,atlas_techniques}, Prompt Defense Baseline verbatim, 7 sections §12, 0 sdk, 0 secret réel).

---

## Bilan lot ER

| source-slug | décision | chemin |
|---|---|---|
| detecting-shadow-it-cloud-usage | adapt | library/detecting-shadow-it-cloud-usage |
| detecting-suspicious-oauth-application-consent | adapt | library/detecting-suspicious-oauth-application-consent |
| implementing-aws-config-rules-for-compliance | adapt | library/implementing-aws-config-rules-for-compliance |
| implementing-aws-macie-for-data-classification | adapt | library/implementing-aws-macie-for-data-classification |
| implementing-aws-nitro-enclave-security | adapt | library/implementing-aws-nitro-enclave-security |
| implementing-aws-security-hub | adapt (superset) | library/implementing-aws-security-hub |
| implementing-aws-security-hub-compliance | fold → security-hub | aucun |
| implementing-azure-defender-for-cloud | adapt | library/implementing-azure-defender-for-cloud |

**Keepers = 7** ; **fold = 1** (security-hub-compliance → security-hub). 0 reject (8/8 défensifs blue-team). Sanitize 8/8 clean, 0 `@anthropic-ai/sdk`. `frameworks` préservé sur les 7. Re-audit: si `mukul975/Anthropic-Cybersecurity-Skills` >6 mois stale ou si un domaine cloud-action est explicitement scopé en ROADMAP (alors via `config/permissions.json`).

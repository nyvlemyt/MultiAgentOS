# ECC Harvest — décisions cluster `cyber:identity-access-management` (lot DR)

Doer: lot DR (8 skills). Worktree `maos-ecc`. Méthode: intake-audit barre LARGE (T1, library).
Source cyber: `mukul975/Anthropic-Cybersecurity-Skills` (Apache-2.0). Cible: `packages/skills/library/<slug>/SKILL.md`.
Dedup contre `our-assets-index.md` + recoupe `mas-sec-reviewer` / CLAUDE.md §5 (gating cross-projet, moindre privilège)
et §11 (discipline des credentials/secrets, jamais de clé committée).
Nature du lot: skills **DÉFENSIFS** (IAM/IGA/PAM blue-team) — revues d'accès, recertification, audit de
comptes de service, rotation de credentials, minimisation de scopes OAuth.
Le frontmatter source porte `subdomain: identity-access-management` + `frameworks` NIST-CSF (PR.AA-01/02/05/06)
+ MITRE-ATTACK (T1078/T1110/T1556/T1098, certains ajoutent T1078.004 / T1069 / T1003) : mappings préservés dans la metadata MAS.
Garde-fou défensif appliqué à chaque skill : lentille revue/audit/durcissement gardée ; toute action
exécutante (révocation, rotation, désactivation de compte) est traitée comme `risk: high` §5 — gate humain,
sandbox du projet actif, jamais d'écriture hors-scope ni vers un IdP tiers depuis MAOS.
Sanitize: 0 secret réel, 0 PII, 0 `@anthropic-ai/sdk` dans les 8 sources. Recadrage transverse §11 : tout
chiffre = quota d'abonnement, jamais $/€ (les sources n'utilisaient pas de cash, recadrage léger).

Note dedup intra-lot (signalée par la tâche) : trois skills de revue d'accès (saviynt vs générique vs
sailpoint-iiq) + deux skills comptes-privilégiés (review vs discovery) + deux comptes-de-service (audit vs
rotation). Tous gardés distincts car tool/process delta réel (cf. raisons par skill). Aucun fold.

---

## performing-access-recertification-with-saviynt
- **décision**: adapt
- **raison**: recertification d'accès **spécifique Saviynt EIC** — campagnes (User-Manager/Entitlement-Owner/Application/Role/Event/Micro), enrichies par la couche intelligence Saviynt (risk score, usage last-access, peer-group, flags SoD) pour décisions informées vs rubber-stamp. Reminders+escalation+default-revoke pilotent la complétion; remédiation = tickets de provisioning avec grace period + vérification. Nourrit `mas-sec-reviewer` + §5 (moindre privilège, revue de comptes).
- **dedup**: non — distinct du générique (`performing-access-review-and-certification`, méthodologie vendor-neutral) et de SailPoint IIQ. Delta = API/console Saviynt + intelligence campaign propriétaire.
- **garde-fou défensif (§5)**: la création de ticket de révocation est bénigne; l'**exécution** d'un revoke/disable contre un système cible = `risk: high` → gate humain, jamais auto-déclenché par MAOS contre un tenant tiers. Default-revoke = config Saviynt, pas une action MAOS.
- **chemin library**: `packages/skills/library/performing-access-recertification-with-saviynt/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` NIST-CSF/MITRE-ATTACK (+T1071) préservé + Prompt Defense Baseline; 7 sections §12 défensives; 0 secret, 0 sdk, 0 cash).

## performing-access-review-and-certification
- **décision**: adapt
- **raison**: méthodologie **vendor-neutral** de revue/certification d'accès — 5 types de revue (User/Entitlement/Role/Privileged/SoD), lifecycle 7 étapes (plan→collect→distribute→certify→remediate→report→close), priorisation risque (privileged/financier/PII-PHI/external-facing = high), modèle reviewer manager/app-owner/hybrid. Mappe NIST 800-53 AC-2/AC-2(3)/AC-5/AC-6/AU-6. Échecs types: rubber-stamp, scope incomplet, révocation paper-only, exclusion des identités non-humaines. Backbone défensif de la posture §5.
- **dedup**: non — c'est la **doctrine tool-neutral**; Saviynt et SailPoint IIQ fournissent la mécanique produit. Delta = la méthodologie elle-même (priorisation, lifecycle, evidence) sans dépendance plateforme.
- **garde-fou défensif (§5)**: produire la liste de remédiation = bénin; **exécuter** la révocation = `risk: high` (gate humain, in-project), jamais auto-déclenché par MAOS contre un tiers.
- **chemin library**: `packages/skills/library/performing-access-review-and-certification/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` NIST-CSF/MITRE-ATTACK préservé + Prompt Defense Baseline; 7 sections §12 défensives; 0 secret, 0 sdk, 0 cash).

## performing-entitlement-review-with-sailpoint-iiq
- **décision**: adapt
- **raison**: revue d'entitlements **spécifique SailPoint IdentityIQ 8.2+** — `CertificationDefinition`/BeanShell: certifications manager (include entitlements/roles/accounts, exclude service accounts, default-revoke, reminder+escalation), certifications ciblées sur apps high-risk (AD/AWS-IAM/Oracle-EBS/SAP-GRC/CyberArk) filtrées sur entitlements privilégiés (app-owner certifier), policies SoD qui flag pendant la revue, workflow de remédiation (`ProvisioningPlan` Remove + exécution + fallback work-item). Nourrit `mas-sec-reviewer` + §5.
- **dedup**: non — mécanique produit IIQ (modèle `CertificationDefinition`, SoD `Policy.TYPE_SOD`, `Workflow.CertificationRemediation`), distincte du générique et de Saviynt.
- **garde-fou défensif (§5)**: configurer une `CertificationDefinition` = bénin; le BeanShell qui appelle `provisioner.execute(plan)` contre une cible = `risk: high` → gate humain, in-project, jamais contre une instance IIQ tierce depuis MAOS.
- **chemin library**: `packages/skills/library/performing-entitlement-review-with-sailpoint-iiq/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` NIST-CSF/MITRE-ATTACK préservé + Prompt Defense Baseline; 7 sections §12 défensives; exemples BeanShell/SoD = templates, 0 secret réel, 0 sdk, 0 cash).

## performing-oauth-scope-minimization-review
- **décision**: adapt
- **raison**: revue least-privilege **OAuth 2.0** des grants tiers/cross-boundary — inventaire des service principals + grants delegated/application (admin-consent = all-users = top risk), classification scopes critical/high/medium/low par sensibilité, scoring risque par app, détection sur-permission (app non-approuvée, scopes hors catalogue, broad ReadWrite-vs-Read, grants stale >90j), plan de remédiation priorisé + admin-consent workflow pour fermer l'afflux. Nourrit `mas-sec-reviewer` + §5 (least privilege, allowed_hosts).
- **dedup**: non — angle consent/scope OAuth tiers absent de notre surface; complète §5 (handling tokens/secrets) sans recouvrir un skill existant.
- **garde-fou défensif (§5)**: inventaire/classification = read-only contre un tenant **possédé**; l'enumeration d'un tenant tiers = hors-scope/offensif (Red Flag). Le revoke/downgrade de grant = `risk: high` → gate humain, coordonné pour ne pas casser une intégration critique.
- **chemin library**: `packages/skills/library/performing-oauth-scope-minimization-review/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` NIST-CSF/MITRE-ATTACK préservé + Prompt Defense Baseline; 7 sections §12 défensives; 0 secret, 0 sdk, 0 cash).

## performing-privileged-account-access-review
- **décision**: adapt
- **raison**: revue **PAM** des comptes privilégiés (domain/cloud admins, DBA, service, break-glass) via framework 4 piliers DISCOVER→VALIDATE→REMEDIATE→MONITOR + matrice de décision (certify/reduce/disable/reset). Cadence par blast-radius (admins critique=mensuel, service/DBA=trimestriel, break-glass=après usage). Critères: justification, least-privilege, activité 90j, MFA/password, SoD, ownership. JIT > standing. Mappe NIST AC-2/AC-3/AC-6 + CIS Ctrl 5. Nourrit `mas-sec-reviewer` + §5.
- **dedup**: non — distinct de `performing-privileged-account-discovery` (étape *validate→remediate→monitor* complète vs simple inventaire) et du générique (privilégié vs accès standard). Voir note intra-lot.
- **garde-fou défensif (§5)**: lister l'action = bénin; **exécuter** disable/reduce/rotate contre une cible = `risk: high` → gate humain, in-project, jamais contre un tiers depuis MAOS. Break-glass = usage toujours audité + reset.
- **chemin library**: `packages/skills/library/performing-privileged-account-access-review/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` NIST-CSF/MITRE-ATTACK préservé + Prompt Defense Baseline; 7 sections §12 défensives; 0 secret, 0 sdk, 0 cash).

## performing-privileged-account-discovery
- **décision**: adapt (source = stub mince → corps §12 reconstruit depuis le scope)
- **raison**: étape **inventaire** avant revue — énumération des comptes privilégiés partout où ils se cachent: AD (Domain/Enterprise/Schema Admins, AdminCount=1, SPN, delegation), cloud (AWS AdministratorAccess/`iam:*`, Azure Global/Privileged-Role/Security Admin, GCP Owner/Editor), DB (SQL sysadmin/db_owner, Oracle DBA/SYSDBA, Postgres superuser). Risk-classify + onboarding PAM. Mappe NIST AC-2/AC-3/AC-6/IA-2/AU-3, forward SIEM. Nourrit `mas-sec-reviewer` + §5 (connaître la surface privilégiée d'un projet).
- **dedup**: non — c'est le **DISCOVER** isolé; `performing-privileged-account-access-review` fait le validate→remediate→monitor. Garder distincts (phase lifecycle différente) cf. note intra-lot. Source d'origine = stub (Overview/objectives/controls/verif) → boosté en 7 sections complètes.
- **garde-fou défensif (§5)**: découverte = **read-only** (inspection, §5 manual-safe), scope owned/authorized uniquement; énumérer un env tiers = recon hors-scope (Red Flag). Onboarding/disable = downstream `risk: high` gated. Inventaire stocké dans `data/` (§8).
- **chemin library**: `packages/skills/library/performing-privileged-account-discovery/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` NIST-CSF/MITRE-ATTACK (+T1078.004) préservé + Prompt Defense Baseline; 7 sections §12 défensives reconstruites; 0 secret, 0 sdk, 0 cash).

## performing-service-account-audit
- **décision**: adapt
- **raison**: audit **comptes de service** (non-humains) AD/cloud/DB/apps — discovery (SPN, gMSA vs traditional, PasswordNeverExpires; AWS keys+last-used, Azure SP/app-reg/managed-identity, GCP SA+key-age), évaluation 6 dimensions (ownership/purpose/privileges/auth/rotation/activity), flags orphaned/over-priv/stale/shared/interactive-logon, risk-classify + candidats gMSA. Règle cardinale: **map dependencies AVANT remédiation**. Mappe NIST AC-2/AC-2(3)/AC-6/IA-5/AU-6. Nourrit `mas-sec-reviewer` + §5/§11 (discipline credentials).
- **dedup**: non — c'est l'**audit/posture** (trouver orphaned/over-priv); `performing-service-account-credential-rotation` fait la rotation. Garder distincts cf. note intra-lot.
- **garde-fou défensif (§5/§11)**: discovery = read-only; disable/reduce = `risk: high` gated, in-project, après validation des dépendances; jamais contre un tiers. Aucun credential committé/plaintext (§11).
- **chemin library**: `packages/skills/library/performing-service-account-audit/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` NIST-CSF/MITRE-ATTACK (+T1069) préservé + Prompt Defense Baseline; 7 sections §12 défensives; 0 secret, 0 sdk, 0 cash).

## performing-service-account-credential-rotation
- **décision**: adapt
- **raison**: automatisation de **rotation de credentials** comptes de service — mécanisme par type (AD→gMSA auto-rotate 30j; AWS→Secrets Manager; GCP→IAM key; Azure SP→Key Vault; DB→Vault dynamic secrets short-TTL). Architecture fixe: generate→update source→propagate à TOUS les consumers→verify health (auth+smoke+retries)→revoke old après grace period; rollback testé obligatoire. Préférer gMSA/dynamic secrets (aucun humain ne connaît le secret). Mappe NIST AC-2/AC-6/IA-5. Nourrit `mas-sec-reviewer` + §5 (écriture `.env`/secrets toujours gated) + §11.
- **dedup**: non — c'est l'**exécution de rotation**; `performing-service-account-audit` fait l'inventaire/posture. Garder distincts cf. note intra-lot.
- **garde-fou défensif (§5/§11)**: rotation = écriture gated sur systèmes **possédés** uniquement; secret stocké en vault, **jamais** committé (§5 `.env` gate + §11 no committed key). MAOS ne rote jamais un secret tiers et ne touche jamais `ANTHROPIC_API_KEY` (auth = abonnement §11).
- **chemin library**: `packages/skills/library/performing-service-account-credential-rotation/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` NIST-CSF/MITRE-ATTACK (+T1003) préservé + Prompt Defense Baseline; 7 sections §12 défensives; exemples PowerShell/boto3/hvac = templates, 0 secret réel, 0 sdk, 0 cash).

---

### Récap
- 8/8 keepers (tous `adapt`). 0 reject. Lot 100% défensif (IAM/IGA/PAM blue-team).
- **Note dedup intra-lot résolue → aucun fold.** Trois revues d'accès gardées distinctes par tool/process delta:
  Saviynt EIC (API+intelligence campaign propriétaire) vs générique (méthodologie vendor-neutral) vs SailPoint
  IIQ (`CertificationDefinition`/BeanShell/SoD `Policy.TYPE_SOD`). Deux comptes-privilégiés distincts par phase
  lifecycle: discovery (DISCOVER/inventaire read-only) vs access-review (VALIDATE→REMEDIATE→MONITOR). Deux
  comptes-de-service distincts par fonction: audit (posture/orphaned/over-priv) vs rotation (gMSA/Vault/secrets).
  OAuth-scope = angle unique (consent tiers cross-boundary).
- Garde-fou défensif appliqué partout: revue/audit/durcissement gardé; toute action exécutante (revoke, disable,
  reduce, rotate) = `risk: high` §5 → gate humain, sandbox du projet actif, jamais vers un IdP/tenant/système tiers
  depuis MAOS. Discovery/inventory = read-only/owned-scope. `performing-privileged-account-discovery` (stub source)
  reconstruit en 7 sections complètes.
- Recadrage §11 transverse: 0 chiffre cash (sources sans cash, recadrage léger), tuning = quota d'abonnement.
  Skills credential (`service-account-audit`, `credential-rotation`, `oauth-scope`) recadrés explicitement: secrets
  en vault jamais committés (§5 `.env` gate), MAOS auth = abonnement, jamais `ANTHROPIC_API_KEY` rotée/committée (§11).
- Frameworks préservés (metadata MAS imbriquée): NIST-CSF [PR.AA-01/02/05/06] + MITRE-ATTACK [T1078/T1110/T1556/T1098]
  sur les 8; extras par skill: +T1071 (saviynt), +T1078.004 (discovery), +T1069 (sa-audit), +T1003 (rotation).
- Tous nourrissent `mas-sec-reviewer` + la lentille §5 (moindre privilège, revue de comptes, gating cross-projet)
  et §11 (discipline credentials).
- Garde-fous techniques: 0 `@anthropic-ai/sdk`, 0 secret réel/PII dans les 8 outputs (préfixes/ARN/cert/exemples = placeholders).

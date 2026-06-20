# ECC Harvest — décisions lot `cyber-EV` (cluster `cyber:cloud-security`)

Doer : lot EV (7 skills). Worktree `maos-ecc`, branche `phase/ecc-harvest`. Méthode : intake-audit, lifecycle complet par skill.
Source : `mukul975/Anthropic-Cybersecurity-Skills` (clone read-only `/tmp/cybersec-inspect`, Apache-2.0, auteur `mahipal`).
Cible keepers : `packages/skills/library/<slug>/SKILL.md`.

Posture du lot : **DÉFENSIF**. Les 7 skills sont des playbooks de durcissement cloud (WAF, IAM, rôles Lambda, Defender, registry, k8s, serverless). Aucune machinerie de weaponisation présente → aucun KILL offensif déclenché. Tout est gardé comme **bibliothèque T1** (connaissance que `mas-sec-reviewer` et une tâche de revue cloud consultent ; MAOS ne l'exécute jamais contre sa propre infra local-first).

Recadrages transverses appliqués à chaque corps :
- **§11** : abonnement, zéro coût per-token PAYG. Tout seuil/limite = contrôle de posture, jamais $/€ ni quota cash. Les rapports d'exemple chiffrés en $ ne sont pas transposés tels quels.
- **§5** : les actions cloud décrites (associate-web-acl, create-policy, SCP, helm install Falco…) sont du domaine du projet *enregistré*, pas de MAOS ; library = lecture, pas d'exécution. Le réseau (allowed_hosts) et les écritures hors-sandbox restent gatés côté MAOS.
- **§12** : chaque keeper réécrit à la forme exemplaire (ligne 1 `---`, commentaire source, summary L1, metadata complet avec `frameworks` préservé, Prompt Defense Baseline verbatim, 7 sections §12).
- **Sanitize** : 7/7 sources clean. Aucun secret réel, aucune PII, aucun `@anthropic-ai/sdk`. Seul match regex = placeholder rédigé `sk_live_XXXX...` dans le rapport d'exemple de `securing-serverless-functions` (illustration, pas un secret) — non transposé dans le corps boosté.
- **`frameworks`** préservé depuis le frontmatter source : `nist_csf` (7/7), `mitre_attack` (7/7), plus `nist_ai_rmf` + `atlas_techniques` pour Azure Defender (porteur de techniques MITRE ATLAS).

---

## securing-api-gateway-with-aws-waf
- **décision** : adapt (keeper, library T1).
- **raison** : playbook défensif WAF devant API Gateway — managed rule groups OWASP, rate-based per-IP + scope-down login, Bot Control en Count-avant-Block, custom rules (header/geo/body-size), logging redacté (authorization/cookie), monitoring BlockedRequests. Lentille de durcissement réutilisable pour une revue cloud ; zéro contenu offensif.
- **dedup** : non — aucun skill `.claude/skills/` ne couvre la posture WAF/rate-limit cloud ; complète `mas-sec-reviewer` (gate §5) sans le dupliquer.
- **chemin library** : `packages/skills/library/securing-api-gateway-with-aws-waf/SKILL.md`
- **KILL testés** : PAYG/clé API → non (recadré §11, seuils=posture). Exécute du code sans audit → non (library, lecture seule côté MAOS). Email/finance/secrets/deploy → non. Framework lourd → non (skill autonome). Hors-phase → non (phase ECC-harvest). Évidence faible → non (Apache-2.0, NIST/MITRE mappé).
- **état** : boosté conforme (ligne 1 `---`, commentaire source, summary L1 ≤200 tok, metadata + `frameworks` préservé, Prompt Defense Baseline verbatim, 7 sections §12, 0 sdk, 0 secret). Re-audit : si la source >12 mois sans maj, ou si une tâche cloud réelle révèle un manque.

## securing-aws-iam-permissions
- **décision** : adapt (keeper, library T1).
- **raison** : playbook least-privilege IAM — inventaire, génération de policy depuis CloudTrail (Access Analyzer), scoping ARN + conditions (MFA/IP/temps), permission boundaries anti-escalade, MFA via SCP, mort des clés long-lived → STS, monitoring Config/EventBridge sur root-usage. Lentille de durcissement identité directement alignée sur la doctrine §5 (gating cross-projet / actions privilégiées).
- **dedup** : non — §5 énonce *quand* gater une action privilégiée ; ce skill apporte la mécanique AWS-IAM concrète pour la revue d'un projet enregistré. Complémentaire, pas redondant.
- **chemin library** : `packages/skills/library/securing-aws-iam-permissions/SKILL.md`
- **KILL testés** : PAYG/clé API → non (§11 recadré). Exécute code sans audit → non (library). Email/finance/secrets/deploy → non. Framework lourd → non. Hors-phase → non. Évidence faible → non (Apache-2.0, NIST/MITRE mappé).
- **état** : boosté conforme (ligne 1 `---`, source, summary L1, metadata + `frameworks`, Prompt Defense Baseline verbatim, 7 sections §12, 0 sdk, 0 secret). Re-audit : source >12 mois, ou gap révélé en revue cloud réelle.

## securing-aws-lambda-execution-roles
- **décision** : adapt (keeper, library T1).
- **raison** : least-privilege ciblé sur les rôles d'exécution Lambda — un rôle par fonction, scope dérivé de CloudTrail, trust anti-confused-deputy (`aws:SourceAccount`), permission boundary qui Deny l'escalade (Create*/PassRole/AssumeRole), validation (validate-policy + simulate), enforcement SCP. Variante serverless du least-privilege IAM, garde une valeur propre (boundary anti-escalade + trust).
- **dedup** : partiel avec `securing-aws-iam-permissions` (least-privilege général) MAIS angle distinct : surface d'exécution serverless, confused-deputy, self-mutation lambda. Gardé séparé (granularité utile en revue).
- **chemin library** : `packages/skills/library/securing-aws-lambda-execution-roles/SKILL.md`
- **KILL testés** : PAYG → non (§11). Exécute code sans audit → non (library). Email/finance/secrets/deploy → non. Framework lourd → non. Hors-phase → non. Évidence faible → non.
- **état** : boosté conforme (forme exemplaire complète, 7 sections §12, 0 sdk, 0 secret). Re-audit : source >12 mois, ou gap en revue cloud réelle.

## securing-azure-with-microsoft-defender
- **décision** : adapt (keeper, library T1 — signal AI-security le plus fort du lot).
- **raison** : CNAPP Defender for Cloud — plans par workload, connecteurs multi-cloud, priorisation par attack-path (cloud security graph) plutôt que par CVSS, JIT VM access, automation Logic Apps sur alertes High. Porte les mappings **MITRE ATLAS + NIST AI RMF** → feeder direct de la doctrine agent-defense §12 (model-abuse, exposition workload IA).
- **dedup** : non — seul skill du lot couvrant Azure/multi-cloud CSPM + attack-path + posture IA. Aucun recouvrement avec les skills AWS.
- **chemin library** : `packages/skills/library/securing-azure-with-microsoft-defender/SKILL.md`
- **KILL testés** : PAYG → non (§11). Exécute code sans audit → non (library). Email/finance/secrets/deploy → non. Framework lourd → non. Hors-phase → non. Évidence faible → non (Apache-2.0 + NIST/MITRE/ATLAS mappé).
- **frameworks** : `nist_csf` + `mitre_attack` + `nist_ai_rmf` + `atlas_techniques` préservés (seul skill du lot avec les 4 familles).
- **état** : boosté conforme (forme exemplaire, 7 sections §12, 0 sdk, 0 secret). Re-audit : source >12 mois, ou gap en revue cloud réelle.

## securing-container-registry-images
- **décision** : adapt (keeper, library T1).
- **raison** : sécurité supply-chain au niveau registry — scan Trivy+Grype (double DB), SBOM Syft, signature/attestation Cosign/Sigstore, contrôles registry (scan-on-push, tag immutability, lifecycle), gates CI/CD bloquants + rescan continu, clés en KMS/Vault. Lentille dep-audit/supply-chain concrète (§5).
- **dedup** : non — la doctrine §5 supply-chain est conceptuelle ; ce skill apporte l'outillage image/registry. Complémentaire aux scans dépendances code.
- **chemin library** : `packages/skills/library/securing-container-registry-images/SKILL.md`
- **KILL testés** : PAYG → non (§11). Exécute code sans audit → non (library). Email/finance/secrets/deploy → non (la gestion de clés décrite pointe vers KMS/Vault, pas d'écriture de secret côté MAOS). Framework lourd → non. Hors-phase → non. Évidence faible → non.
- **état** : boosté conforme (forme exemplaire, 7 sections §12, 0 sdk, 0 secret). Re-audit : source >12 mois, ou gap en revue cloud réelle.

## securing-kubernetes-on-cloud
- **décision** : adapt (keeper, library T1).
- **raison** : durcissement k8s managé (EKS/AKS/GKE) — Pod Security Standards Restricted, workload identity (IRSA/WI/MI) qui tue les creds statiques en pod, NetworkPolicy default-deny, RBAC namespace-scoped, admission Kyverno/OPA (registry approuvé + digest pinning), runtime Falco + kube-bench. Doctrine sandbox/least-privilege §5 appliquée à la couche orchestration.
- **dedup** : non — aucun skill `.claude/skills/` ne couvre k8s ; l'admission control prolonge `securing-container-registry-images` (registry → cluster) sans le dupliquer.
- **chemin library** : `packages/skills/library/securing-kubernetes-on-cloud/SKILL.md`
- **KILL testés** : PAYG → non (§11). Exécute code sans audit → non (library). Email/finance/secrets/deploy → non. Framework lourd → non. Hors-phase → non. Évidence faible → non.
- **état** : boosté conforme (forme exemplaire, 7 sections §12, 0 sdk, 0 secret). Re-audit : source >12 mois, ou gap en revue cloud réelle.

## securing-serverless-functions
- **décision** : adapt (keeper, library T1).
- **raison** : durcissement serverless multi-cloud (Lambda/Azure Functions/GCF) — rôles least-privilege dédiés, élimination des secrets hardcodés vers Secrets Manager/KeyVault/Vault + KMS, scan dépendances (npm audit/Snyk/pip-audit/Trivy + Semgrep SAST), validation d'input (JSON Schema, requêtes paramétrées), auth des function URLs (IAM/Cognito, jamais NONE), monitoring runtime (GuardDuty Lambda, structured logs). Couvre injection + supply-chain serverless.
- **dedup** : partiel avec `securing-aws-lambda-execution-roles` (rôles) MAIS angle plus large : secrets, deps, input-validation, function-URL auth, runtime. Gardé distinct (vue applicative serverless vs vue IAM pure). Recoupe aussi conceptuellement les baselines secure-coding §12 sans les dupliquer.
- **chemin library** : `packages/skills/library/securing-serverless-functions/SKILL.md`
- **KILL testés** : PAYG → non (§11). Exécute code sans audit → non (library). Email/finance/secrets/deploy → non (le skill *interdit* les secrets hardcodés, il n'en écrit pas). Framework lourd → non. Hors-phase → non. Évidence faible → non.
- **sanitize** : placeholder rédigé `sk_live_XXXX...` (rapport d'exemple SLS-002) NON transposé dans le corps boosté ; aucun secret réel.
- **état** : boosté conforme (forme exemplaire, 7 sections §12, 0 sdk, 0 secret). Re-audit : source >12 mois, ou gap en revue cloud réelle.

---

## Bilan lot cyber-EV

- **Keepers** : 7 / 7 (tous DÉFENSIFS → library T1, cluster `cyber:cloud-security`).
- **Rejets** : 0 (aucune machinerie de weaponisation dans le lot, comme anticipé au brief).
- **Sanitize** : 7/7 clean — 0 secret réel, 0 PII, 0 `@anthropic-ai/sdk`. Seul match regex = placeholder `sk_live_XXXX...` (illustration), non transposé.
- **frameworks préservés** : `nist_csf` + `mitre_attack` partout ; `nist_ai_rmf` + `atlas_techniques` en plus pour `securing-azure-with-microsoft-defender` (signal AI-security le plus fort, feeder §12).
- **Conformité §12** : 7/7 à la forme exemplaire (ligne 1 `---`, commentaire source `mukul975/...`, summary L1 ≤200 tok, metadata complet, Prompt Defense Baseline verbatim, 7 sections Overview/Principles-cite-source/Process/Rationalizations/Red Flags/Verification).
- **Posture transverse** : library = lecture pour revue d'un projet *enregistré* ; MAOS n'exécute jamais ces actions cloud contre sa propre infra local-first (§5). Tout chiffre = posture, jamais $/€ (§11).

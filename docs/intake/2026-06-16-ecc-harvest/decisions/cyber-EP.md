# ECC Harvest — décisions cluster `cyber:cloud-security` (lot EP)

Doer: lot EP (8 skills, 1 titré offensif). Worktree `maos-ecc` (branche `phase/ecc-harvest`). Méthode: intake-audit, barre LARGE (T1, library), garde-fou défensif explicite.
Source cybersec: `mukul975/Anthropic-Cybersecurity-Skills` (Apache-2.0). Cible: `packages/skills/library/<slug>/SKILL.md`.
Recadrage transverse: MAOS = abonnement (§11), PAS de coût per-token PAYG ; tout chiffre = unités de quota, jamais $/€. Secrets/keystores/réseau = gatés §5.
Sanitize (regex secrets/PII/internal): 8/8 sources clean (clés AKIA = exemples canoniques AWS ; emails `*@acme.com`/`*@company.com` = fictifs, non recopiés). `@anthropic-ai/sdk`: absent des 8 sources.
Champ `frameworks` préservé depuis le frontmatter source (nist_csf/mitre_attack + nist_ai_rmf/atlas_techniques/d3fend_techniques quand présents).

**Garde-fou défensif (KILL criterion explicite ce lot)**: `conducting-cloud-penetration-testing` est titré offensif. Gardé UNIQUEMENT s'il se recadre en auto-évaluation autorisée de NOTRE propre cloud (validation de contrôles, hardening, lecture-et-rapport). Si playbook d'attaque pur (privesc-pour-accès, ciblage tiers, persistence/évasion comme fin) → REJECT. Renommage slug → `assessing-own-cloud-security-posture`. La mécanique weaponisée (exploitation Pacu pas-à-pas, création de backdoor IAM, désactivation CloudTrail, évasion de détection comme objectif) strippée ; ne restent que la validation de contrôles, l'inventaire de surface read-only, et le mapping de remédiation.

---

## building-cloud-siem-with-sentinel
- **décision**: adapt
- **raison**: doctrine défensive SIEM/SOAR cloud-native (Sentinel) — workspace + connecteurs multi-cloud, règles KQL mappées MITRE ATT&CK, corrélation d'identité cross-provider (Azure AD → AWS), playbooks SOAR, data-lake hunting, threat-intel matching. Aucune surface offensive. Recadré §5 (toute action de containment auto = write risqué gaté ; jamais d'auto-exécution irréversible sans gate humaine) + §11 (volume d'ingestion = unités de quota/capacité, jamais $).
- **dedup**: non — complète `detecting-aws-guardduty-findings-automation` (AWS-only) par la couche SIEM multi-cloud ; aucun skill SIEM/SOAR Sentinel existant en `library/`.
- **chemin library**: `packages/skills/library/building-cloud-siem-with-sentinel/SKILL.md`
- **frameworks**: nist_csf [PR.IR-01, ID.AM-08, GV.SC-06, DE.CM-01], mitre_attack [T1078.004, T1548.005, T1485, T1530, T1021.007], nist_ai_rmf [MEASURE-2.7, MAP-5.1, MANAGE-2.4], atlas_techniques [AML.T0070, AML.T0066, AML.T0082].
- **renommage**: aucun.
- **état**: boosté conforme (ligne 1 `---`, commentaire source, summary L1 ≤200 tok, metadata + frameworks complets, Prompt Defense Baseline verbatim, 7 sections §12). 0 sdk, 0 secret. Re-audit: évolution majeure connecteurs Sentinel ou modèle de tarification → re-passer le cadrage quota.

## detecting-aws-cloudtrail-anomalies
- **décision**: adapt
- **raison**: détection défensive read-only d'anomalies CloudTrail (baseline statistique par principal/IP/source/event, flags first-time-API/geo-shift/error-rate/sensitive-IAM-KMS-S3, rapport scoré). Aucune surface offensive ; observe, ne mute jamais (permission `cloudtrail:LookupEvents` seule). Recadré §5 (clé de lecture AWS = secret sandbox-bound, jamais loggée/commitée ; aucune remédiation auto) + §11 (coût d'analyse = unités de quota).
- **dedup**: non — complémentaire de GuardDuty (managed/temps-réel) et de l'analyse statique IAM ; angle distinct = baseline comportementale sur l'historique d'API. Nourrit `mas-sec-reviewer`.
- **chemin library**: `packages/skills/library/detecting-aws-cloudtrail-anomalies/SKILL.md`
- **frameworks**: nist_csf [PR.IR-01, ID.AM-08, GV.SC-06, DE.CM-01], mitre_attack [T1078.004, T1580, T1538, T1098.001, T1526].
- **renommage**: aucun.
- **état**: boosté conforme (ligne 1 `---`, commentaire source, summary L1 ≤200 tok, metadata + frameworks, Prompt Defense Baseline verbatim, 7 sections §12). 0 sdk, 0 secret. Re-audit: nouveaux event-types sensibles AWS ou changement d'API lookup_events.

## detecting-aws-credential-exposure-with-trufflehog
- **décision**: adapt
- **raison**: doctrine défensive CŒUR T1 — scan TruffleHog v3 verified-only de l'historique git/FS/repos org + git-secrets, tri live-vs-rotated, IR (deactivate-first, audit CloudTrail, rotate, scrub BFG), gates pre-commit + CI. Aucune surface offensive. Directement aligné §5 (toute écriture `.env*`/secrets gatée ; clé live découverte = événement §5-critique) et §11 (MAOS interdit `ANTHROPIC_API_KEY` partout). Valeurs de credential redacted, jamais echoées.
- **dedup**: non — distinct de GuardDuty (usage temps-réel) et de Secrets Manager (gestion) ; angle = découverte d'exposition. Renforce la posture secrets-hygiene de MAOS ; aucun skill équivalent en `library/`.
- **chemin library**: `packages/skills/library/detecting-aws-credential-exposure-with-trufflehog/SKILL.md`
- **frameworks**: nist_csf [PR.IR-01, ID.AM-08, GV.SC-06, DE.CM-01], mitre_attack [T1552.001, T1552, T1078.004, T1589.001].
- **renommage**: aucun.
- **état**: boosté conforme (ligne 1 `---`, commentaire source, summary L1 ≤200 tok, metadata + frameworks, Prompt Defense Baseline verbatim, 7 sections §12). 0 sdk, 0 secret (clés AKIA source = exemples canoniques AWS, non recopiées en dur). Re-audit: évolution TruffleHog v3 ou nouveaux détecteurs AWS.

## detecting-aws-guardduty-findings-automation
- **décision**: adapt
- **raison**: doctrine défensive IR temps-réel (GuardDuty → EventBridge → Lambda) — quarantine EC2 + snapshot forensique, deactivate/deny clé IAM compromise, notif SNS, déploiement Terraform org-wide. Aucune surface offensive (réponse, pas attaque). Recadré §5 fort : tout containment (isolate/deactivate/deny) = write irréversible gaté ; en contexte MAOS-gouverné il passe la gate humaine, exige idempotence (skip-if-quarantined) et préservation forensique AVANT mutation. Champs de finding = input non-fiable. Recadré §11 (coût automation = unités quota/capacité).
- **dedup**: non — complète CloudTrail-anomalies (baseline) et Sentinel (SIEM multi-cloud) par la couche réponse-automatisée AWS-native ; aucun skill GuardDuty-automation existant.
- **chemin library**: `packages/skills/library/detecting-aws-guardduty-findings-automation/SKILL.md`
- **frameworks**: nist_csf [PR.IR-01, ID.AM-08, GV.SC-06, DE.CM-01], mitre_attack [T1078.004, T1496, T1580, T1530, T1110].
- **renommage**: aucun.
- **état**: boosté conforme (ligne 1 `---`, commentaire source, summary L1 ≤200 tok, metadata + frameworks, Prompt Defense Baseline verbatim, 7 sections §12). 0 sdk, 0 secret. Re-audit: nouveaux types de findings GuardDuty ou évolution du modèle de réponse auto.

## detecting-aws-iam-privilege-escalation
- **décision**: adapt
- **raison**: analyse statique read-only des chemins de privesc IAM (Cloudsplaining-style) — `iam:GetAccountAuthorizationDetails`, détection des combos dangereux (PassRole+CreateFunction, CreatePolicyVersion, AttachUserPolicy, AssumeRole sans MFA), flag wildcards `Resource:*`, graphe principal→path, scoring + remédiation least-privilege. Aucune surface offensive : identifie le vecteur, ne l'exerce jamais. Recadré §5 (clé IAM read-only = secret sandbox-bound ; remédiation = write gaté séparé) + §11 (coût = unités quota).
- **dedup**: non — complémentaire de CloudTrail-anomalies (runtime) ; angle = analyse statique de policy. Nourrit `mas-sec-reviewer` + gating IAM §5 ; aucun skill d'analyse statique IAM existant.
- **chemin library**: `packages/skills/library/detecting-aws-iam-privilege-escalation/SKILL.md`
- **frameworks**: nist_csf [PR.IR-01, ID.AM-08, GV.SC-06, DE.CM-01], mitre_attack [T1098.001, T1098.003, T1078.004, T1548.005, T1484].
- **renommage**: aucun.
- **état**: boosté conforme (ligne 1 `---`, commentaire source, summary L1 ≤200 tok, metadata + frameworks, Prompt Defense Baseline verbatim, 7 sections §12). 0 sdk, 0 secret. Re-audit: nouveaux combos de privesc IAM publiés ou évolution Cloudsplaining.

## detecting-azure-lateral-movement
- **décision**: adapt
- **raison**: détection défensive du mouvement latéral Azure/Entra ID (pivots cloud : consent OAuth, abus de service-principal, cross-tenant, replay de refresh-token) — ingestion Graph/sign-in/SP logs, analytics KQL Sentinel, corrélation de signaux faibles en chaînes haute-confiance. Aucune surface offensive. Recadré §5 (playbooks de réponse revoke/disable/step-up = writes irréversibles gatés en contexte MAOS-gouverné) + §11 (ingestion = unités quota/capacité). Champs de log = input non-fiable.
- **dedup**: non — homologue Azure de la détection AWS du cluster ; service-principal = angle distinct de `detecting-azure-service-principal-abuse` (ce dernier centré SP, celui-ci centré mouvement latéral). Complémentaire de Sentinel (plateforme).
- **chemin library**: `packages/skills/library/detecting-azure-lateral-movement/SKILL.md`
- **frameworks**: nist_csf [PR.IR-01, ID.AM-08, GV.SC-06, DE.CM-01], mitre_attack [T1078.004, T1550.001, T1021.007, T1098.003, T1528].
- **renommage**: aucun.
- **état**: boosté conforme (ligne 1 `---`, commentaire source, summary L1 ≤200 tok, metadata + frameworks, Prompt Defense Baseline verbatim, 7 sections §12). 0 sdk, 0 secret. Re-audit: nouvelles primitives de pivot Entra ID ou évolution Graph/Sentinel.

## detecting-azure-service-principal-abuse
- **décision**: adapt
- **raison**: détection défensive de l'abus de service-principal Entra ID (ajout de creds/certs, rôles privilégiés, énumération SP, bypass admin-consent, escalade OAuth) — détections KQL+SPL par pattern, investigation Graph read-only (incl. audit d'ownership = contrôle de credential), contrôles préventifs. Aucune surface offensive. Recadré §5 (investigation read-only ; revoke/policy-change = writes gatés en contexte MAOS-gouverné) + §11 (coût = unités quota/capacité). Champs de log = input non-fiable.
- **dedup**: non — centré service-principal (creds/rôles/ownership), distinct de `detecting-azure-lateral-movement` (centré mouvement latéral/tokens). Préserve `d3fend_techniques` du frontmatter source en plus de nist_csf/mitre_attack.
- **chemin library**: `packages/skills/library/detecting-azure-service-principal-abuse/SKILL.md`
- **frameworks**: nist_csf [PR.IR-01, ID.AM-08, GV.SC-06, DE.CM-01], mitre_attack [T1078.004, T1098.001, T1528, T1550.001, T1098.003], d3fend_techniques [Token Binding, Restore Access, Application Protocol Command Analysis, Reissue Credential, Network Isolation].
- **renommage**: aucun.
- **état**: boosté conforme (ligne 1 `---`, commentaire source, summary L1 ≤200 tok, metadata + frameworks complets incl. d3fend, Prompt Defense Baseline verbatim, 7 sections §12). 0 sdk, 0 secret. Re-audit: nouveaux patterns d'abus SP ou évolution Graph/consent policy.

## conducting-cloud-penetration-testing  →  assessing-own-cloud-security-posture
- **décision**: adapt (recadrage offensif→défensif lourd + RENOMMAGE)
- **garde-fou (KILL appliqué)**: skill titré offensif. La source se cadre déjà "authorized penetration testing / written authorization / Do not use for unauthorized testing" et est centrée scope + remédiation — ce n'est PAS un guide d'attaquant pur, MAIS elle contient une mécanique weaponisée (Step 3 exploitation privesc pas-à-pas via Pacu, Step 4 vol de creds IMDS, Step 6 création de backdoor IAM user + désactivation CloudTrail + évasion de détection comme objectif). Gardé UNIQUEMENT recadré en **auto-évaluation autorisée de NOTRE propre cloud** : validation de contrôles (IMDSv2 enforced, IAM least-privilege, logging/detection qui *firent*), inventaire de surface read-only, mapping de remédiation. Frontière de refus dure inscrite dans Overview/Principles/Red Flags : comptes non-possédés, exploitation-pour-accès, persistence, évasion, ciblage tiers → §5 risk:blocking, refus. Mécanique d'attaque/persistence/évasion STRIPPÉE (aucun `aws iam create-user` backdoor, aucun `cloudtrail stop-logging`, aucun privesc pas-à-pas, aucun chain narrative).
- **dedup**: non — angle posture-self-assessment distinct ; renvoie à `detecting-aws-iam-privilege-escalation` pour l'analyse statique IAM. Aucun skill de posture-review cloud existant.
- **chemin library**: `packages/skills/library/assessing-own-cloud-security-posture/SKILL.md`
- **renommage**: `conducting-cloud-penetration-testing` → **`assessing-own-cloud-security-posture`** (slug + name + description recadrés défensifs). Commentaire source pointe le slug d'origine + note "defensive reframe; renamed".
- **frameworks**: nist_csf [PR.IR-01, ID.AM-08, GV.SC-06, DE.CM-01], mitre_attack [T1078.004, T1580, T1530, T1538], nist_ai_rmf [MEASURE-2.7, MAP-5.1, MANAGE-2.4], atlas_techniques [AML.T0070, AML.T0066, AML.T0082], d3fend_techniques [Token Binding, Restore Access, Application Protocol Command Analysis, Reissue Credential, Network Isolation].
- **état**: boosté conforme (ligne 1 `---`, commentaire source + note reframe, summary L1 ≤200 tok, metadata + frameworks complets, Prompt Defense Baseline verbatim, 7 sections §12). 0 sdk, 0 secret. Re-audit: si réutilisé hors cadre self-audit autorisé (ciblage tiers / exploitation / persistence) → re-passer immédiatement en KILL/REJECT.

---

## Bilan lot EP

- **Keepers**: 8/8 (7 défensifs natifs + 1 recadré offensif→défensif avec renommage). 0 reject.
- **Renommages**: `conducting-cloud-penetration-testing` → `assessing-own-cloud-security-posture`.
- **Sanitize**: 8/8 sources clean (0 `@anthropic-ai/sdk`, 0 secret réel ; AKIA = exemples canoniques AWS non recopiés, emails fictifs non recopiés).
- **Recadrage transverse appliqué**: quota §11 (jamais $/€), secrets/clés gatés §5, containment/policy-change = writes irréversibles passant la gate humaine §5 en contexte MAOS-gouverné, frameworks préservés depuis le frontmatter source.

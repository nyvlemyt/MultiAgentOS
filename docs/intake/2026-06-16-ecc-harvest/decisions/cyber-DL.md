# ECC Harvest — décisions cluster `cyber:vulnerability-management` (lot DL)

Doer: lot DL (8 skills). Worktree `maos-ecc`, branche `phase/ecc-harvest`. Méthode: intake-audit, barre LARGE (T1 défense, library).
Source: `mukul975/Anthropic-Cybersecurity-Skills` (clone read-only `--depth 1`, 2026-06-18), licence Apache-2.0, auteur `mahipal`.
Cible: `packages/skills/library/<slug>/SKILL.md`. Forme exemplaire = §12 boosté (ligne 1 `---`, commentaire source, summary L1, metadata avec `frameworks`, Prompt Defense Baseline verbatim, 7 sections §12).

**Garde-fou défensif (lot DL).** Le cluster est gestion de vulnérabilités *défensive* : scan, patch, SLA, scoring de criticité, audit AD. Lentille « évaluer + remédier » conservée. L'audit AD = self-audit autorisé uniquement (jamais ciblage tiers). KILL armes : weaponisation, ciblage de masse, évasion → reject. Aucun des 8 n'est offensif ; tous sont des disciplines de remédiation. Décision = `adapt` pour les 8 (chacun exige un recadrage MAOS, pas seulement une copie).

**Recadrage transverse MAOS** (appliqué aux 8) :
- §11 abonnement : tout chiffre = unités de **quota**, jamais $/€. Les sources framaient en $/SLA-cash → strippé.
- §8 projet externe read-only : le système scanné/patché/audité vit hors repo ; MAOS produit des diffs, pas des écritures directes.
- §5 actions risquées gatées : scans actifs, déploiement de patch (reboot/fleet-write), création de snapshot cloud, collecte AD credentialed = shell/exec/réseau → confirm ou human-gate selon le niveau d'autonomie.
- mas-sec-reviewer : ces skills nourrissent la lentille vuln-management de la revue sécu.

**Sanitize** : 8/8 sources clean. Secrets/PII : seulement des **placeholders** (`P@ssw0rd`, `<service-account-password>`, `${SLACK_WEBHOOK_URL}`, `api-key-here`) — neutralisés/non repris dans le corps boosté (recadrés « vault/CI, jamais committé », §5). `@anthropic-ai/sdk` : absent des 8 sources. `frameworks` préservés (nist_csf + mitre_attack ; + nist_ai_rmf et d3fend_techniques là où présents).

**Renames** : aucun. Les 8 slugs source sont déjà clairs et sans collision (cf. `cybersec-clusters.md` §collisions = vide) → conservés à l'identique.

---

## implementing-patch-management-workflow
- **décision**: adapt
- **raison**: cycle de patch défensif fermé (discover→assess→risk-rank→test-ring→CAB→rollout phasé→verify→report) qui réduit la surface d'attaque en bornant le blast-radius opérationnel. Distinct du SLA-clock : ici c'est l'exécution de la remédiation (test/rings/rollback/verify-scan), pas l'horloge.
- **dedup**: non — `mas-sec-reviewer` gate les actions risquées mais ne porte aucune doctrine de déploiement phasé/rollback ; nouveau dans la surface MAOS.
- **garde-fou**: défensif pur (remédiation). Aucun vecteur offensif. Déploiement live = §5 (reboot/fleet-write gatés selon autonomie).
- **chemin library**: `packages/skills/library/implementing-patch-management-workflow/SKILL.md`
- **rename**: aucun.
- **état**: boosté conforme (ligne 1 `---`, commentaire source, summary L1, metadata+frameworks, Prompt Defense Baseline verbatim, 7 sections §12, 0 `@anthropic-ai/sdk`, secrets→vault/CI recadrés, $→quota).

## implementing-rapid7-insightvm-for-scanning
- **décision**: adapt
- **raison**: déploiement défensif d'une plateforme de scan de vulnérabilités (Security Console + Scan Engines distribués + Insight Agents) pour un parc *autorisé* : scan credentialed, safe-checks, fenêtres de scan, projets de remédiation pilotés par API v3.
- **dedup**: non — `mas-sec-reviewer` ne porte aucune doctrine de scan actif ; nouvelle surface. Couple avec `performing-agentless-vulnerability-scanning` (alternative sans agent) sans le dupliquer (ici = engine + agent on-prem).
- **garde-fou**: défensif ; le risque clé = scan actif intrusif → §5 (autorisation in-scope, pas de leakage cross-host). Garde-fou « scan only what you're authorized » explicite dans le corps. Recadré secrets→vault.
- **chemin library**: `packages/skills/library/implementing-rapid7-insightvm-for-scanning/SKILL.md`
- **rename**: aucun.
- **état**: boosté conforme (ligne 1 `---`, commentaire source, summary L1, metadata+frameworks, Prompt Defense Baseline verbatim, 7 sections §12, 0 sdk, secrets→vault recadrés, $→quota, TLS-verify on hors lab).

## implementing-vulnerability-management-with-greenbone
- **décision**: adapt
- **raison**: scan de vulnérabilités open-source scriptable (GVM/OpenVAS via python-gvm/GMP) : connecter, créer target+config, lancer, poller, parser le rapport XML en JSON actionnable. Lentille « scan programmatique défensif » distincte de Rapid7 (vendor on-prom) et de l'agentless.
- **dedup**: non — nouvelle surface ; couple avec Rapid7/agentless sans dup (GMP/OpenVAS = stack distincte).
- **garde-fou**: défensif ; risque = scan actif → §5 (targets in-scope autorisés). Garde-fou « authorized targets only » + TLS-verify + poll-to-completion explicites. Secrets→vault.
- **chemin library**: `packages/skills/library/implementing-vulnerability-management-with-greenbone/SKILL.md`
- **rename**: aucun.
- **état**: boosté conforme (ligne 1 `---`, commentaire source, summary L1, metadata+frameworks {nist_csf, mitre_attack+T1046}, Prompt Defense Baseline verbatim, 7 sections §12, 0 sdk, secrets→vault, $→quota).

## implementing-vulnerability-remediation-sla
- **décision**: adapt
- **raison**: design de programme SLA de remédiation : classification sévérité (CVSS + EPSS/KEV), tiering d'actifs, matrice (sévérité × tier), processus d'exception (controls compensatoires + double appro + cap 90j), chaîne d'escalade, KPIs (compliance/MTTR/backlog). Lentille *policy*, distincte de l'alerting et du scoring d'actifs (skills frères du lot).
- **dedup**: non — couple avec `…sla-breach-alerting` (mécanique d'alerte) et `…asset-criticality-scoring` (modèle de score) sans les dupliquer ; ici = la politique + la matrice + les KPIs.
- **garde-fou**: défensif pur (gouvernance). Recadré : timers/breaches → ledger `events` (§9, télémétrie ≠ cash), sévérité → enum risk §5.
- **chemin library**: `packages/skills/library/implementing-vulnerability-remediation-sla/SKILL.md`
- **rename**: aucun.
- **état**: boosté conforme (ligne 1 `---`, commentaire source, summary L1, metadata+frameworks, Prompt Defense Baseline verbatim, 7 sections §12, 0 sdk, $→quota/jours, mapping events+risk-enum).

## implementing-vulnerability-sla-breach-alerting
- **décision**: adapt
- **raison**: couche d'alerting automatisée au-dessus de la politique SLA : store de tracking, logique d'état de breach *déterministe*, escalade tierée, dashboard KPIs. Distinct de la politique SLA (skill frère) — ici la détection + notification.
- **dedup**: non — complète `…remediation-sla` (politique) sans dup ; ici = mécanique d'alerte + dashboard.
- **garde-fou**: défensif. Deux recadrages forts MAOS : (1) détection breach = scoring déterministe, **pas d'appel LLM** (§6 token discipline) ; (2) notifications Slack/email/PagerDuty = §5 outbound-send gaté + `allowed_hosts` + secrets webhooks→vault. Store→events ledger (§9).
- **chemin library**: `packages/skills/library/implementing-vulnerability-sla-breach-alerting/SKILL.md`
- **rename**: aucun.
- **état**: boosté conforme (ligne 1 `---`, commentaire source, summary L1, metadata+frameworks, Prompt Defense Baseline verbatim, 7 sections §12, 0 sdk, déterministe §6, outbound §5/allowed_hosts, secrets→vault, $→quota).

## performing-active-directory-vulnerability-assessment
- **décision**: adapt (recadrage fort + garde-fou de scope dominant)
- **raison**: self-audit AD défensif (PingCastle + Purple Knight + BloodHound) → trouve les misconfigs canoniques (Kerberoastable admins, delegation non-contrainte, AS-REP, AdminSDHolder, sprawl privilégié) et les mappe à des remédiations (gMSA/RBCD/pre-auth/ACL-restore/GPO). Le plus sensible du lot : outils dual-use (SharpHound, BloodHound).
- **dedup**: non — surface AD/identity absente de notre lib ; couple §5 IAM gating sans dup.
- **garde-fou**: **DÉCISIF**. Conservé uniquement sous scope dur = domaine *possédé/administré + autorisé*, collecte least-privilege, **assess-and-remediate, jamais weaponize**. Ligne KILL = opérationnaliser un attack-path / produire du tooling d'exploitation. Principe #1 + #2 + Red Flags portent ce garde-fou. Collecte credentialed = §5 (in-scope only, pas de cross-domain) ; data AD sensible → `data/` (§8) ; creds→vault.
- **chemin library**: `packages/skills/library/performing-active-directory-vulnerability-assessment/SKILL.md`
- **rename**: aucun.
- **état**: boosté conforme (ligne 1 `---`, commentaire source, summary L1, metadata+frameworks {nist_csf, mitre_attack+T1548/T1134, d3fend_techniques préservés}, Prompt Defense Baseline verbatim, 7 sections §12, 0 sdk, scope-dur self-audit, $→quota, placeholders creds neutralisés→vault).

## performing-agentless-vulnerability-scanning
- **décision**: adapt
- **raison**: scan de vulnérabilités sans agent (SSH/WinRM authentifié, analyse de snapshot cloud, SNMPv3, Vuls) — idéal cloud/IoT/legacy/OT où l'agent ne tourne pas. Complète Rapid7 (agent/engine) et Greenbone (réseau) avec la lentille agentless + snapshot.
- **dedup**: non — surface agentless/snapshot distincte ; couple sans dup avec les deux skills de scan du lot.
- **garde-fou**: défensif ; risques = énumération distante + création de snapshot → §5 (in-scope autorisé, cloud-API). Recadrages forts : **toujours supprimer les snapshots** (data-exposure/cost, `finally`), compte de service least-privilege read-only, épargner OT/ICS, host-key SSH non désactivé en bloc, secrets→vault. `nist_ai_rmf` préservé en plus.
- **chemin library**: `packages/skills/library/performing-agentless-vulnerability-scanning/SKILL.md`
- **rename**: aucun.
- **état**: boosté conforme (ligne 1 `---`, commentaire source, summary L1, metadata+frameworks {nist_csf, nist_ai_rmf, mitre_attack+T1078.004/T1530}, Prompt Defense Baseline verbatim, 7 sections §12, 0 sdk, snapshot-cleanup, least-priv, $→quota).

## performing-asset-criticality-scoring-for-vulns
- **décision**: adapt
- **raison**: modèle de scoring de criticité d'actifs multi-facteur (business/data/réglementaire/exposition/recouvrabilité/population × poids) → tier 1-5 qui *module* le SLA de remédiation. Sépare la criticité (contexte business) de la sévérité CVSS (intrinsèque) — les deux se multiplient.
- **dedup**: non — c'est l'axe « tier d'actif » que `…remediation-sla` consomme et que le CVSS/EPSS ne couvre pas ; complémentaire, non dup.
- **garde-fou**: défensif pur (gouvernance/prioritisation). Recadrage MAOS : scorer = **arithmétique déterministe, pas d'appel LLM** (§6) ; tier → enum risk §5 ; scores → ledger events/memory (§8/§9).
- **chemin library**: `packages/skills/library/performing-asset-criticality-scoring-for-vulns/SKILL.md`
- **rename**: aucun.
- **état**: boosté conforme (ligne 1 `---`, commentaire source, summary L1, metadata+frameworks, Prompt Defense Baseline verbatim, 7 sections §12, 0 sdk, déterministe §6, $→quota, mapping ledger+risk-enum).

---

## Bilan lot DL

- **Keepers** : 8/8 (toutes décisions = `adapt`, recadrage MAOS requis pour chacune). 0 reject, 0 watch, 0 backlog.
- **Renames** : 0 (slugs source clairs, sans collision ECC↔cyber per `cybersec-clusters.md`).
- **Sanitize** : 8/8 clean ; placeholders secrets neutralisés/recadrés (vault/CI, §5) ; 0 `@anthropic-ai/sdk`.
- **Frameworks préservés** : nist_csf (8/8), mitre_attack (8/8), + nist_ai_rmf (agentless) + d3fend_techniques (AD).
- **Garde-fou défensif** : tenu. Le plus sensible (`…active-directory-vulnerability-assessment`, outils dual-use) gardé sous scope dur self-audit + assess-and-remediate ; ligne KILL = weaponisation/opérationnalisation des attack-paths.
- **Conformité §12** : 8/8 fichiers = ligne 1 `---`, commentaire source, summary L1 ≤200 tok, metadata complet + `frameworks`, Prompt Defense Baseline verbatim, 7 sections (Overview/Principles citant source/Process/Rationalizations/Red Flags/Verification).
- **Chemin shard** : `docs/intake/2026-06-16-ecc-harvest/decisions/cyber-DL.md`.

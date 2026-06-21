# ECC Harvest — décisions cluster `cyber:soc-operations` (lot DY)

Doer: lot DY (9 skills soc-operations). Worktree `maos-ecc` (branche `phase/ecc-harvest`).
Source: `mukul975/Anthropic-Cybersecurity-Skills` (clone read-only `/tmp/cybersec-inspect`, Apache-2.0). Méthode: intake-audit pleine, barre LARGE (T1 défense bleue, library).
Cible: `packages/skills/library/<slug>/SKILL.md`, forme exemplaire §12 (ligne 1 `---`, commentaire source `mukul975/...`, summary L1 ≤200 tok, metadata + `frameworks` préservés, Prompt Defense Baseline verbatim, 7 sections §12 Overview/When/Principles(cite source)/Process/Rationalizations/Red Flags/Verification).

**Cadrage doctrine.** Les 9 skills sont du **blue-team SOC pur** : enrichissement de threat intelligence (Splunk), intégration de feeds STIX/TAXII, scanning de vulnérabilités, corrélation d'événements (QRadar), réduction de l'alert fatigue, cartographie de couverture MITRE ATT&CK, use-cases SIEM de détection, et automatisation SOAR (Phantom + XSOAR). Aucun n'est de la weaponisation, du ciblage de masse, ni de l'évasion → la clause KILL « offensif » ne se déclenche pour aucun. Tous sont **KNOWLEDGE/docs** : ils décrivent l'opération d'outils SOC externes (Splunk ES, QRadar, Nessus/Qualys, Cortex XSOAR, Splunk SOAR), pas du code exécuté par MAOS. MAOS ne déploie jamais ces plateformes lui-même ; il les **connaît** pour nourrir `mas-sec-reviewer` (§5), la doctrine de détection, et la mémoire threat/contexte.

**Garde §5 sur l'automatisation SOAR.** Les deux skills SOAR décrivent des actions de confinement automatique (isolation d'hôte, désactivation de compte, blocage IP/URL/sender sur firewall, purge de mailbox). Dans la doctrine MAOS ce sont des actions `risk: high`/`blocking` (§5 : envois sortants, modifications hors-sandbox) qui **pausent toujours pour validation humaine**. Les sources elles-mêmes recommandent des approval gates analyste — aligné avec §5. Cadrage ajouté dans chaque corps : MAOS connaît ces playbooks comme doctrine de réponse, il ne câble jamais d'auto-confinement sans gate humaine.

**Recadrage §11 (quota, pas cash).** Plusieurs sources frament en `$`/`Cost: Free`/`Commercial` (tableaux de feeds, MTTR « time saved ») et exposent des clés/credentials API en placeholders. Recadrage : toute mesure d'efficacité MAOS = **unités de quota** d'abonnement (TOKEN_STRATEGY §8), jamais per-token cash ; les colonnes « Cost » des feeds décrivent le coût de la *source TI externe*, pas un coût MAOS — note de prudence ajoutée dans les corps concernés.

**Sanitize.** Regex secrets/PII/internal sur les 9 sources : clean. Tous les credentials présents sont des **placeholders pédagogiques** (`YOUR_VT_API_KEY`, `YOUR_OTX_API_KEY`, `SERVICE_ACCOUNT_PASSWORD`, `SCAN_SERVICE_PASSWORD`, `CS_CLIENT_SECRET`, `YOUR_SOAR_TOKEN`, `YOUR_API_TOKEN`, `192.168.x`, `10.0.x`) — pas de secret réel. Aucun import `@anthropic-ai/sdk` dans les 9 sources. Les corps boostés ne recopient pas les blobs de code/credentials des sources : ils en distillent la **doctrine** (forme exemplaire §12), donc 0 placeholder propagé.

**Frameworks préservés** (frontmatter natif du repo source) : `nist_csf` + `mitre_attack` sur les 9 ; `nist_ai_rmf` + `atlas_techniques` + `d3fend_techniques` en plus sur `implementing-mitre-attack-coverage-mapping` et `implementing-siem-use-cases-for-detection`.

**Dedup interne (les 2 SOAR).** Phantom (Splunk SOAR) vs XSOAR (Palo Alto Cortex) : **gardés distincts**, pas de fold. Delta plateforme réel — Phantom = modèle d'actions playbook Python + asset connectors + `phantom.prompt` ; XSOAR = playbook YAML déclaratif (tasks/sub-playbooks/conditions) + verdict DBotScore + 900+ integration packs. La lentille §5 (gate humaine avant confinement) est commune mais la mécanique diffère. Cross-référence ajoutée dans les deux corps.

**Renames.** Aucun. Les 9 slugs sont déjà descriptifs, sans collision (cf. `cybersec-clusters.md` : ECC↔cyber disjoints) et ne dupliquent aucun skill `library/` existant.

---

## building-threat-intelligence-enrichment-in-splunk
- **décision**: adapt (keep)
- **raison**: pipeline d'enrichissement TI dans Splunk ES (feeds STIX/TAXII/CSV/API → KV Store typé → lookups → correlation searches → notables enrichis avec confidence/severity + contexte asset). Lentille distincte de la library : ancrage opérationnel de la détection IOC-based et de son modèle de provenance/fraîcheur. Nourrit `mas-sec-reviewer` + mémoire threat. Recadré knowledge : MAOS connaît le pipeline, ne déploie pas Splunk chez l'utilisateur.
- **dedup**: non — aucun skill `library/` ne couvre l'enrichissement TI dans un SIEM. Complémentaire de `building-threat-intelligence-feed-integration` (celui-ci = enrichissement intra-Splunk ; l'autre = ingestion/normalisation multi-feeds amont).
- **chemin library**: `packages/skills/library/building-threat-intelligence-enrichment-in-splunk/SKILL.md`
- **état**: boosté + vérifié conforme (ligne 1 `---`, commentaire source `mukul975/...`, summary L1, metadata + `frameworks` {nist_csf, mitre_attack} préservés, Prompt Defense Baseline verbatim, 7 sections §12). Sanitize: placeholders pédagogiques uniquement dans la source (`<encrypted_api_key>`, `YOUR_OTX_API_KEY`) non propagés au corps boosté ; 0 secret réel, 0 `@anthropic-ai/sdk`. KILL offensif: non (détection défensive). §11: colonnes « Cost » des feeds = coût source externe, pas MAOS — note ajoutée.

## building-threat-intelligence-feed-integration
- **décision**: adapt (keep)
- **raison**: opérationnalisation de feeds TI (catalogue sources → ingestion STIX/TAXII + open-source + commercial → normalisation STIX 2.1 → dedup multi-source avec attribution préservée → scoring confidence → distribution SIEM/MISP → expiry par type + health par match-rate). Lentille distincte : la chaîne amont ingest/normalize/dedup/score qui alimente l'enrichissement. Nourrit `mas-sec-reviewer` + mémoire threat.
- **dedup**: non — complémentaire de `building-threat-intelligence-enrichment-in-splunk` (amont feed-mgmt vs intra-SIEM enrichment). Aucun skill `library/` ne couvre la gestion de feeds TI.
- **chemin library**: `packages/skills/library/building-threat-intelligence-feed-integration/SKILL.md`
- **état**: boosté + vérifié conforme (ligne 1 `---`, commentaire source, summary L1, metadata + `frameworks` {nist_csf, mitre_attack} préservés, Prompt Defense Baseline verbatim, 7 sections §12). Sanitize: placeholders (`YOUR_OTX_API_KEY`, `YOUR_MISP_API_KEY`, `your_username/password`) non propagés ; 0 secret réel, 0 `@anthropic-ai/sdk`. KILL offensif: non. §11: colonnes Cost/Free/Commercial = coût source externe — note ajoutée.

## building-vulnerability-scanning-workflow
- **décision**: adapt (keep)
- **raison**: workflow de scanning de vulnérabilités (scope/cadence credentialed → priorisation RISQUE = CVSS × criticité asset, boostée KEV + EPSS, PAS CVSS brut → SLA P1–P5 → corrélation SIEM des vulns activement exploitées sur assets critiques → tracking days-open + re-scan de vérification). Tue l'anti-pattern « patch tous les criticals ». Nourrit `mas-sec-reviewer`/dep-audit.
- **dedup**: non — proche conceptuellement de la priorisation vuln (cluster endpoint DW `performing-endpoint-vulnerability-remediation`) mais axe différent : ici = workflow de **scan/découverte/priorisation programme**, là-bas = **remédiation/déploiement de patch** endpoint. Complémentaires, pas doublon. Aucun skill `library/` ne couvre le workflow de scan.
- **chemin library**: `packages/skills/library/building-vulnerability-scanning-workflow/SKILL.md`
- **état**: boosté + vérifié conforme (ligne 1 `---`, commentaire source, summary L1, metadata + `frameworks` {nist_csf, mitre_attack} préservés, Prompt Defense Baseline verbatim, 7 sections §12). Sanitize: placeholders (`SCAN_SERVICE_PASSWORD`, `API_PASSWORD`, IP RFC1918) non propagés ; CVE (Log4Shell/EternalBlue/FortiOS) nommés uniquement comme cibles de remédiation ; 0 secret réel, 0 `@anthropic-ai/sdk`. KILL offensif: non (description « do NOT use for pentest/exploitation » conservée). §11: pas de coût MAOS.

## correlating-security-events-in-qradar
- **décision**: adapt (keep)
- **raison**: corrélation d'événements dans IBM QRadar (investigation offense via AQL → building blocks → correlation rules chaînées avec contraintes temps/identité pour attaques multi-étapes → enrichissement reference sets → tuning offense par disposition data + coalescing). Lentille SIEM distincte (modèle offense/building-block/magnitude/QID, vendor-spécifique vs Splunk). Nourrit `mas-sec-reviewer` + doctrine détection.
- **dedup**: non — distinct des skills Splunk (plateforme + modèle de corrélation différents : offenses QRadar vs notables Splunk). Aucun skill `library/` ne couvre QRadar.
- **chemin library**: `packages/skills/library/correlating-security-events-in-qradar/SKILL.md`
- **état**: boosté + vérifié conforme (ligne 1 `---`, commentaire source, summary L1, metadata + `frameworks` {nist_csf, mitre_attack} préservés, Prompt Defense Baseline verbatim, 7 sections §12). Sanitize: placeholders (`YOUR_API_TOKEN`, IP RFC1918, `qradar.example.com`) non propagés ; 0 secret réel, 0 `@anthropic-ai/sdk`. KILL offensif: non (corrélation défensive). §11: pas de coût MAOS.

## implementing-alert-fatigue-reduction
- **décision**: adapt (keep)
- **raison**: réduction de l'alert fatigue SOC (MESURE-first qualité par règle → Risk-Based Alerting agrégeant le risque → tuning par exclusions VÉRIFIÉES contre tests ATT&CK, jamais disable aveugle → consolidation → tiered routing → re-mesure FP + couverture). Contrainte cardinale : réduire le volume sans créer de blind spot. Lentille distincte (qualité de détection, pas une plateforme). Nourrit `mas-sec-reviewer` + doctrine détection.
- **dedup**: non — distinct de la corrélation (QRadar) et des use-cases (celui-ci = hygiène volume/qualité). Aucun skill `library/` ne couvre l'alert fatigue.
- **chemin library**: `packages/skills/library/implementing-alert-fatigue-reduction/SKILL.md`
- **état**: boosté + vérifié conforme (ligne 1 `---`, commentaire source, summary L1, metadata + `frameworks` {nist_csf, mitre_attack} préservés, Prompt Defense Baseline verbatim, 7 sections §12). Sanitize: 0 credential, 0 PII, 0 `@anthropic-ai/sdk`. KILL offensif: non (description « do NOT use to disable rules / evade » conservée). §11: pas de coût MAOS.

## implementing-mitre-attack-coverage-mapping
- **décision**: adapt (keep)
- **raison**: cartographie de couverture détection vs MITRE ATT&CK (export règles + mapping → matrice Navigator → scoring 4-parts data-source+quality+validation+enrichment, « covered » = validé-par-émulation PAS taggé → mapping data-source→techniques → priorisation gaps prevalence×impact×feasibility → roadmap trimestriel + re-scoring). Tue le faux « 200 règles taggées = couvert ». Lentille distincte (mesure de maturité adversary-centric). Nourrit `mas-sec-reviewer` + doctrine détection.
- **dedup**: non — distinct de `implementing-siem-use-cases-for-detection` (celui-ci = MESURE/gap-analysis de couverture ; l'autre = CONSTRUCTION de use-cases). Aucun skill `library/` ne couvre le coverage mapping.
- **chemin library**: `packages/skills/library/implementing-mitre-attack-coverage-mapping/SKILL.md`
- **état**: boosté + vérifié conforme (ligne 1 `---`, commentaire source, summary L1, metadata + `frameworks` {nist_csf, mitre_attack, nist_ai_rmf, atlas_techniques, d3fend_techniques} TOUS préservés, Prompt Defense Baseline verbatim, 7 sections §12). Sanitize: 0 credential, 0 PII, 0 `@anthropic-ai/sdk`. KILL offensif: non (mapping défensif). §11: pas de coût MAOS.

## implementing-siem-use-cases-for-detection
- **décision**: adapt (keep)
- **raison**: detection-engineering de use-cases SIEM traités comme du software (gap-analysis ATT&CK → spec standardisée → implémentation cross-plateforme SPL/EQL/KQL → validation par simulation d'attaque AVANT prod → lifecycle proposed→…→production→deprecated → library versionnée + health metrics). Lentille distincte (construction/maintenance de détections). Nourrit `mas-sec-reviewer` + doctrine détection.
- **dedup**: non — complémentaire de `implementing-mitre-attack-coverage-mapping` (mesure de gaps) : ce skill CONSTRUIT les détections, l'autre MESURE la couverture. Aucun skill `library/` ne couvre le detection-engineering use-case.
- **chemin library**: `packages/skills/library/implementing-siem-use-cases-for-detection/SKILL.md`
- **état**: boosté + vérifié conforme (ligne 1 `---`, commentaire source, summary L1, metadata + `frameworks` {nist_csf, mitre_attack, nist_ai_rmf, atlas_techniques, d3fend_techniques} TOUS préservés, Prompt Defense Baseline verbatim, 7 sections §12). Sanitize: 0 credential, 0 PII ; les commandes Atomic Red Team de la source = test de détection (posture défensive) non recopiées ; 0 `@anthropic-ai/sdk`. KILL offensif: non. §11: pas de coût MAOS.

## implementing-soar-automation-with-phantom
- **décision**: adapt (keep)
- **raison**: automatisation SOAR dans Splunk SOAR/Phantom (modèle asset/container/artifact/playbook → automatiser la couche SÛRE enrichment/triage → GATE humaine `phantom.prompt` avant toute action high-impact isolation/disable/block → metrics de run). Lentille distincte (orchestration de réponse + doctrine du gate). Recadrage §5 fort : tout auto-confinement = `risk:high/blocking` qui PAUSE toujours pour validation humaine, autonomy-level ne l'override pas. Nourrit `mas-sec-reviewer` + doctrine IR.
- **dedup**: non, gardé distinct de XSOAR — plateforme + modèle différents (Phantom = playbook Python + asset connectors + `phantom.prompt` ; XSOAR = playbook YAML déclaratif + DBotScore). Cross-référence ajoutée. Aucun fold.
- **chemin library**: `packages/skills/library/implementing-soar-automation-with-phantom/SKILL.md`
- **état**: boosté + vérifié conforme (ligne 1 `---`, commentaire source, summary L1, metadata + `frameworks` {nist_csf, mitre_attack} préservés, Prompt Defense Baseline verbatim, 7 sections §12). Sanitize: placeholders (`YOUR_VT_API_KEY`, `CS_CLIENT_SECRET`, `SERVICE_ACCOUNT_PASSWORD`, `YOUR_SOAR_TOKEN`) non propagés ; 0 secret réel, 0 `@anthropic-ai/sdk`. KILL offensif: non (réponse défensive). §11: MTTR/time-saved = métrique SOC, pas coût MAOS — note ajoutée.

## implementing-soar-playbook-with-palo-alto-xsoar
- **décision**: adapt (keep)
- **raison**: playbooks IR dans Cortex XSOAR/Demisto (hiérarchie incident-type/layout/playbook/sub-playbook/task → playbooks YAML déclaratifs chaînant enrichment + verdict DBotScore + réponse → MANUAL task analyste avant tout confinement high-impact block/purge/isolate/disable → réutilisation common playbooks + 900+ packs). Lentille distincte. Recadrage §5 fort : auto-confinement = `risk:high/blocking`, pause humaine toujours. Nourrit `mas-sec-reviewer` + doctrine IR.
- **dedup**: non, gardé distinct de Phantom — plateforme + modèle différents (XSOAR = YAML déclaratif tasks/sub-playbooks/conditions + DBotScore ; Phantom = actions playbook Python + `phantom.prompt`). Delta plateforme réel, gate humaine commune. Cross-référence ajoutée. Aucun fold.
- **chemin library**: `packages/skills/library/implementing-soar-playbook-with-palo-alto-xsoar/SKILL.md`
- **état**: boosté + vérifié conforme (ligne 1 `---`, commentaire source, summary L1, metadata + `frameworks` {nist_csf, mitre_attack} préservés, Prompt Defense Baseline verbatim, 7 sections §12). Sanitize: placeholders (`8.8.8.8` exemple, IDs incident génériques) non propagés ; 0 secret réel, 0 `@anthropic-ai/sdk`. KILL offensif: non (réponse défensive). §11: tableau MTTR -80% = métrique SOC, pas coût MAOS — note ajoutée.

---

## Bilan lot DY

- **Keepers**: 9 / 9 (tous `adapt`/keep, cluster `cyber:soc-operations`, tier T1, status library).
- **Rejets**: 0 (blue-team SOC pur ; aucune weaponisation/évasion/ciblage de masse).
- **Renames / folds**: 0. Les 2 SOAR (Phantom vs XSOAR) gardés DISTINCTS — delta plateforme réel (modèle d'actions Python + asset connectors vs playbook YAML déclaratif + DBotScore) ; gate humaine commune mais mécanique différente ; cross-référence mutuelle ajoutée dans les deux corps. Pas de fold.
- **Garde §5**: les 2 SOAR recadrés — auto-confinement (isolation/disable/block/purge) = `risk:high/blocking`, pause humaine TOUJOURS, autonomy-level ne l'override pas.
- **Frameworks préservés**: 9/9 ({nist_csf, mitre_attack}) ; en plus {nist_ai_rmf, atlas_techniques, d3fend_techniques} sur `implementing-mitre-attack-coverage-mapping` et `implementing-siem-use-cases-for-detection`.
- **Sanitize global**: 9/9 clean (placeholders pédagogiques seulement, non propagés aux corps boostés) ; 0 `@anthropic-ai/sdk` ; recadrage §11 (quota ≠ cash ; colonnes Cost/MTTR = externe/SOC, pas coût MAOS) noté dans les corps concernés.
- **Conformité exemplaire §12**: 9/9 (ligne 1 `---`, commentaire source `mukul975/...`, summary L1 ≤200 tok, metadata complet + frameworks, Prompt Defense Baseline verbatim, 7 sections Overview/When/Principles(cite source)/Process/Rationalizations/Red Flags/Verification).

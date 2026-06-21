# ECC Harvest — décisions LOT DD (cyber smalls : compliance / governance / privacy / DLP / ASM / IoT)

Doer : Phase D, cyber smalls, LOT DD (10 slugs sources). Worktree `maos-ecc`, branche `phase/ecc-harvest`.
Méthode : intake-audit barre LARGE (T1, library). Source : `mukul975/Anthropic-Cybersecurity-Skills` (Apache-2.0).
Cible : `packages/skills/library/<slug>/SKILL.md`.

**Guardrail du lot** : tout est défensif (compliance / governance / privacy / DLP / ASM / IoT-assessment). On GARDE tout sauf doublon vrai d'une skill library existante. Cadrage transverse :
- §11 — MAOS = abonnement, jamais de coût per-token PAYG. Tout chiffre = unités de quota, jamais $/€.
- §5 — toute action sortante (transferts transfrontaliers, notifications de brèche, livraison de paquet de données, transmission de preuves à l'auditeur), tout scan de stores réels de données personnelles, tout scan actif réseau/hardware/firmware, et tout déploiement touchant le sandbox/tenant de prod = gated humain.
- §8 — l'état MAOS vit dans `data/`.
- Prompt Defense Baseline copié VERBATIM dans chaque keeper. Frameworks préservés depuis la source (GDPR / ISO 27001 / PCI-DSS / NIST CSF / SOC2 / NIST Privacy / MITRE ATT&CK / MITRE ATLAS).

Sanitize (regex secrets/PII/internal) : 10/10 sources clean (les `YOUR_*_KEY`, `client_secret`, hashes d'exemple sont des placeholders pédagogiques, retirés/non repris dans les keepers ; aucun secret réel). `@anthropic-ai/sdk` : absent des 10 sources.

Dedup vérifié contre la library existante :
- famille DLP existante : `detecting-insider-data-exfiltration-via-dlp`, `implementing-cloud-dlp-for-data-protection`, `implementing-endpoint-dlp-controls` → la skill Purview est **product-specific** (Microsoft 365/Purview, sensitivity-labels + endpoint + auto-labeling cross-workload), pas un doublon du DLP générique cloud/endpoint. Cross-référence explicite ajoutée dans le `When NOT`.
- ASM existant : `discovering-own-attack-surface-with-subfinder` (skill-outil étroite) → `implementing-attack-surface-management` est le **programme EASM large** ; gardé avec cross-référence bidirectionnelle (sweep one-shot vs pipeline continu).
- gouvernance/compliance existante : `hipaa-compliance`, `healthcare-phi-compliance`, `nerc-cip-compliance-controls`, `implementing-aws-config-rules-for-compliance`, `customs-trade-compliance` → aucun recouvre GDPR / ISO 27001 / PCI-DSS / NIST CSF / SOC2 / PIA. Pas de doublon.

**Aucun reject : 10/10 keepers.** Tous défensifs, tous distincts, tous forts dans leur domaine.

---

## 1. implementing-gdpr-data-protection-controls
- **cluster** : cyber:compliance-governance
- **décision** : adapt (keep)
- **raison** : programme complet de mesures techniques + organisationnelles GDPR (ROPA Art. 30, DPIA Art. 35, sécurité Art. 32, droits des personnes, brèche 72h, transferts SCC/BCR). C'est la doctrine de gouvernance données défensive de référence ; aucun équivalent dans la library. Recadré §5 (transferts transfrontaliers + notifications de brèche + écritures sur stores de données personnelles = gated), §11 (quota, pas de cash).
- **dedup** : non — la library couvre HIPAA/PHI/NERC mais pas le socle GDPR.
- **chemin library** : `packages/skills/library/implementing-gdpr-data-protection-controls/SKILL.md`
- **état** : keeper écrit, conforme (ligne 1 `---`, commentaire source, summary L1, metadata avec frameworks, 8 sections = Prompt Defense Baseline VERBATIM + 7 §12, 0 secret, 0 `@anthropic-ai/sdk`).

## 2. implementing-gdpr-data-subject-access-request
- **cluster** : cyber:privacy-compliance
- **décision** : adapt (keep)
- **raison** : workflow DSAR Article 15 (intake multi-canal, vérif d'identité proportionnée, découverte PII regex+NER, mapping Art. 15, exemptions, génération de réponse, suivi délai 1 mois, audit log). Distinct du programme #1 : c'est l'**exécution** d'une requête, pas la conception du programme. Recadré §5 — la découverte PII (scan de stores réels) et la livraison du paquet sont gated, la PII découverte ne quitte jamais le gate.
- **dedup** : non — granularité exécution unique vs programme.
- **chemin library** : `packages/skills/library/implementing-gdpr-data-subject-access-request/SKILL.md`
- **état** : keeper écrit, conforme.

## 3. implementing-iso-27001-information-security-management
- **cluster** : cyber:compliance-governance
- **raison** : cycle de vie ISMS ISO/IEC 27001:2022 (scope, risque, Annexe A 93 contrôles / 4 catégories + 11 nouveaux contrôles 2022, SoA, audit interne, revue de direction, certification Stage 1/2, amélioration continue). Socle de gouvernance qui *enveloppe* les contrôles réglementaires (GDPR/PCI s'y mappent). Recadré §5 (déploiements touchant le sandbox + transmission de preuves auditeur = gated).
- **décision** : adapt (keep)
- **dedup** : non — aucune skill ISMS générique dans la library.
- **chemin library** : `packages/skills/library/implementing-iso-27001-information-security-management/SKILL.md`
- **état** : keeper écrit, conforme.

## 4. implementing-pci-dss-compliance-controls
- **cluster** : cyber:compliance-governance
- **décision** : adapt (keep)
- **raison** : contrôles PCI DSS 4.0.1 (scoping CDE + segmentation, 12 exigences / 6 objectifs, changements 4.0 : customized approach, MFA tout-CDE, targeted risk analysis, scans authentifiés, anti-phishing, revue de logs automatisée, artefacts SAQ/ROC/AOC/ASV). **Protège** les données carte ; ne traite JAMAIS de paiement (paiement = §5 risk:blocking, explicitement hors scope dans le `Do NOT use` + Principles). Recadré §5/§11.
- **dedup** : non.
- **chemin library** : `packages/skills/library/implementing-pci-dss-compliance-controls/SKILL.md`
- **état** : keeper écrit, conforme. Note : framing data-protection strict, frontière paiement explicitée (frôle §5 blocking → barrière posée dans le corps).

## 5. performing-nist-csf-maturity-assessment
- **cluster** : cyber:compliance-governance
- **décision** : adapt (keep)
- **raison** : évaluation de maturité NIST CSF 2.0 (6 Functions dont la nouvelle Govern, 22 catégories, 4 Implementation Tiers, Current/Target Profile, roadmap priorisée par réduction de risque). Read/assess/recommend uniquement — le déploiement de contrôle est une activité gated séparée (cadré dans Principles + Red Flags). Recadré §5/§11.
- **dedup** : non — distinct de l'ISMS certifiable #3 (snapshot de maturité vs système certifié).
- **chemin library** : `packages/skills/library/performing-nist-csf-maturity-assessment/SKILL.md`
- **état** : keeper écrit, conforme.

## 6. performing-privacy-impact-assessment
- **cluster** : cyber:privacy-compliance
- **décision** : adapt (keep)
- **raison** : PIA/DPIA (catalogue ROPA, data-flow mapping collection→suppression, scoring 10 dimensions likelihood×impact, checks GDPR Art. 35 + CCPA/CPRA, méthodo NIST Privacy PRAM + ICO, plan de remédiation + rapport). Distinct du DSAR #2 et du programme GDPR #1 : c'est l'évaluation de risque d'une *activité de traitement*. Recadré §5 (scans de stores réels gated) / §11.
- **dedup** : non.
- **chemin library** : `packages/skills/library/performing-privacy-impact-assessment/SKILL.md`
- **état** : keeper écrit, conforme.

## 7. performing-soc2-type2-audit-preparation
- **cluster** : cyber:governance-risk-compliance
- **décision** : adapt (keep)
- **raison** : préparation audit SOC 2 Type II (gap-assessment vs Trust Services Criteria CC1-CC9 + A1/PI1/C1/P1-P8, collecte de preuves read-only multi-systèmes, validation d'efficacité opérationnelle sur 3-12 mois, exceptions de contrôle, monitoring continu). Le distinctif Type II = *opéré dans le temps* pilote le tout. Recadré §5 — collecteurs en read-only, transmission du paquet à l'auditeur = gated.
- **dedup** : non — pas de skill SOC 2 dans la library ; complète ISO 27001 (#3) et NIST CSF (#5) sans recouvrement.
- **chemin library** : `packages/skills/library/performing-soc2-type2-audit-preparation/SKILL.md`
- **état** : keeper écrit, conforme.

## 8. implementing-data-loss-prevention-with-microsoft-purview
- **cluster** : cyber:data-protection
- **décision** : adapt (keep)
- **raison** : implémentation DLP **product-specific** Microsoft Purview (taxonomie sensitivity-labels + chiffrement/marquage, policies DLP avec SIT built-in + regex custom, endpoint DLP USB/print/clipboard/cloud, auto-labeling, monitoring Activity Explorer/alerts/Graph). Discipline cardinale : *simulate before enforce*. Recadré §5 (changements de tenant prod gated) / §11.
- **dedup** : **non** (vérifié explicitement). La library a 3 skills DLP (insider-exfil, cloud générique, endpoint générique) ; celle-ci est spécifique au produit Microsoft 365/Purview, cross-workload, avec labels + auto-labeling — pas un doublon. Cross-références ajoutées dans `When NOT`. → **keep, pas fold**.
- **chemin library** : `packages/skills/library/implementing-data-loss-prevention-with-microsoft-purview/SKILL.md`
- **état** : keeper écrit, conforme.

## 9. implementing-attack-surface-management
- **cluster** : cyber:offensive-security (mais la skill est **défensive** : ASM = connaître/réduire sa PROPRE surface)
- **décision** : adapt (keep, recadré défensif)
- **raison** : programme EASM continu (énum subdomains subfinder/amass/CT, fingerprint httpx, discovery Shodan/Censys, scan Nuclei, scoring pondéré OWASP/RSQ 0-100). La source la classe `offensive-security` mais le framing keeper est strictement défensif et authorization-first. Recadré §5 (scan de hosts non-possédés + scans actifs Nuclei = gated, allowed_hosts) / §11 (respect des quotas free-tier, jamais per-token).
- **dedup** : per consigne — vs `discovering-own-attack-surface-with-subfinder` (skill-outil étroite) → on garde l'ASM comme **programme large** et on cross-référence dans les deux sens. Pas de fold (granularité différente).
- **chemin library** : `packages/skills/library/implementing-attack-surface-management/SKILL.md`
- **état** : keeper écrit, conforme. Cross-référence subfinder honorée (Overview + When NOT + Verification).

## 10. performing-iot-security-assessment
- **cluster** : cyber:penetration-testing (évaluation IoT **défensive** : trouver/remédier avant déploiement)
- **décision** : adapt (keep, recadré défensif)
- **raison** : assessment IoT/embedded full-stack (recon hardware UART/JTAG/FCC-ID, extraction+analyse firmware binwalk/Ghidra/credentials, analyse réseau TLS/MQTT/BLE/Zigbee, émulation FirmAE/QEMU + tests dynamiques, démo d'impact). Bordé dur par l'autorisation (clause source explicite : jamais de device non-possédé, jamais de médical/safety-critical sans autorisation + protocoles de sécurité). Recadré §5 (tout test actif hardware/firmware/réseau gated, allowed_hosts) / §11.
- **dedup** : non — pas de skill IoT-assessment dans la library.
- **chemin library** : `packages/skills/library/performing-iot-security-assessment/SKILL.md`
- **état** : keeper écrit, conforme. Clause d'autorisation source préservée mot pour mot dans Principles + Red Flags + Verification.

---

## Bilan

| # | source-slug | décision | cluster | library-slug |
|---|---|---|---|---|
| 1 | implementing-gdpr-data-protection-controls | adapt/keep | cyber:compliance-governance | idem |
| 2 | implementing-gdpr-data-subject-access-request | adapt/keep | cyber:privacy-compliance | idem |
| 3 | implementing-iso-27001-information-security-management | adapt/keep | cyber:compliance-governance | idem |
| 4 | implementing-pci-dss-compliance-controls | adapt/keep | cyber:compliance-governance | idem |
| 5 | performing-nist-csf-maturity-assessment | adapt/keep | cyber:compliance-governance | idem |
| 6 | performing-privacy-impact-assessment | adapt/keep | cyber:privacy-compliance | idem |
| 7 | performing-soc2-type2-audit-preparation | adapt/keep | cyber:governance-risk-compliance | idem |
| 8 | implementing-data-loss-prevention-with-microsoft-purview | adapt/keep | cyber:data-protection | idem |
| 9 | implementing-attack-surface-management | adapt/keep | cyber:offensive-security (défensif) | idem |
| 10 | performing-iot-security-assessment | adapt/keep | cyber:penetration-testing (défensif) | idem |

**10/10 keepers, 0 reject, 0 fold.** Re-audit : si la library ajoute plus tard une skill DLP-Microsoft ou un programme EASM concurrent, re-vérifier le dedup #8/#9.

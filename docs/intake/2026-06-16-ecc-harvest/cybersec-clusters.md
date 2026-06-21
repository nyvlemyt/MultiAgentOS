# Clustering — Anthropic-Cybersecurity-Skills (mukul975)

Source : `https://github.com/mukul975/Anthropic-Cybersecurity-Skills` (clone read-only `--depth 1`, 2026-06-18).
Inventaire mécanique du frontmatter uniquement (bodies intouchés). **754 skills** trouvés.

## Méthode

- Le `domain` du frontmatter vaut `cybersecurity` pour les 754 skills : sans valeur discriminante. Le **vrai axe de regroupement est le champ `subdomain`** → 45 sous-domaines distincts (la tâche estimait ~26 ; chiffre réel = 45, plusieurs sont des variantes-slug d'un même domaine, cf. notes « fusion »).
- Champ `frameworks` synthétisé à partir des familles présentes et non-vides dans le frontmatter : `nist_csf` (754/754), `mitre_attack` (754/754), `nist_ai_rmf` (85/754), `atlas_techniques` (81/754). Aucun champ `frameworks` natif n'existe dans le repo.
- Tagging **T1** (défense / sécurité-agent : nourrit `mas-sec-reviewer` + CLAUDE.md §5) vs **T2** (offensif / ops verticales : bibliothèque, gardé si fort dans son domaine).

Bilan tiers : **T1 = 624 skills**, **T2 = 130 skills** (total 754).

## Clusters par sous-domaine

| domaine | count | tier | note |
|---|---|---|---|
| cloud-security | 63 | T1 | CSPM, CloudTrail/Azure logs → nourrit revue secrets cloud + §5 |
| threat-hunting | 56 | T1 | détection comportementale → §5 risky-action + sec-reviewer |
| threat-intelligence | 50 | T1 | CTI, STIX, IOC → contexte memory/threat |
| network-security | 43 | T1 | DNS/zeek, exfil detect → garde-fou réseau §5 allowed_hosts |
| web-application-security | 42 | T1 | OWASP, secure-coding web → mas-sec-reviewer |
| malware-analysis | 39 | T2 | RE malware, CAPE, apktool → BIBLIOTHÈQUE offensive/forensic |
| digital-forensics | 37 | T2 | acquisition disque, artefacts → forensic (lib) |
| soc-operations | 33 | T1 | SIEM, corrélation, alerting → ops défensives |
| identity-access-management | 33 | T1 | IAM, RBAC, JIT → gating cross-projet §5 |
| container-security | 29 | T1 | image scan, supply-chain → dep-audit |
| security-operations | 28 | T1 | runbooks SOC → ops |
| ot-ics-security | 28 | T1 | SCADA/ICS monitoring → défense verticale (T1 monitoring) |
| api-security | 28 | T1 | API posture, rate-limit → revue API |
| incident-response | 26 | T1 | IR cloud, playbooks → ops défensives |
| vulnerability-management | 25 | T1 | CVSS/EPSS prioritisation → dep-audit |
| red-teaming | 24 | T2 | TTP offensives, C2 → bibliothèque offensive |
| penetration-testing | 20 | T2 | exploit, bypass → bibliothèque offensive |
| devsecops | 17 | T1 | secure CI/CD, IaC scan → secure-coding |
| zero-trust-architecture | 17 | T1 | ZTNA, verified-access → §5 sandbox |
| endpoint-security | 17 | T1 | EDR, DLP endpoint → défense poste |
| phishing-defense | 15 | T1 | CT logs, anti-phishing → défense |
| cryptography | 15 | T1 | crypto controls → secure-coding |
| mobile-security | 13 | T1 | MAM, sécu mobile → défense (vertical) |
| ransomware-defense | 13 | T1 | honeypot, anti-ransomware → défense |
| threat-detection | 7 | T1 | détection signatures → §5 |
| application-security | 4 | T1 | appsec générique → secure-coding/sec-reviewer |
| compliance-governance | 4 | T1 | ISO27001, SOC2 → gouvernance |
| supply-chain-security | 3 | T1 | attestation, SBOM → dep-audit/supply-chain |
| deception-technology | 3 | T1 | honeypot/leurres → défense |
| ai-security | 2 | T1 | sécurité agents IA, prompt-injection → CŒUR T1 mas-sec-reviewer |
| wireless-security | 2 | T2 | wifi/RF attaques → bibliothèque |
| offensive-security | 2 | T2 | offensif générique → bibliothèque |
| privacy-compliance | 2 | T1 | privacy/GDPR → gouvernance |
| identity-and-access-management | 2 | T1 | IAM (variante slug) → fusion avec identity-access-management |
| red-team | 2 | T2 | red-team (variante slug) → fusion red-teaming |
| identity-security | 1 | T1 | AD ACL, identité → §5 IAM |
| blockchain-security | 1 | T2 | audit smart-contract → bibliothèque verticale |
| firmware-security | 1 | T2 | firmware/UEFI → bibliothèque verticale |
| social-engineering-defense | 1 | T1 | anti-SE → défense |
| data-protection | 1 | T1 | DLP, chiffrement données → secure-coding |
| zero-trust | 1 | T1 | ZT principes → §5 |
| ot-security | 1 | T1 | OT (variante slug) → fusion ot-ics-security |
| firmware-analysis | 1 | T2 | firmware RE → bibliothèque verticale |
| purple-team | 1 | T2 | purple (mixte) → bibliothèque (penche offensif) |
| governance-risk-compliance | 1 | T1 | GRC → gouvernance |

## Variantes-slug à fusionner (hygiène pré-audit)

Plusieurs sous-domaines sont des doublons orthographiques d'un cluster plus large. À traiter comme un seul cluster lors de l'audit :

- `identity-and-access-management` (2) + `identity-security` (1) → **identity-access-management** (33)
- `red-team` (2) → **red-teaming** (24)
- `ot-security` (1) → **ot-ics-security** (28)
- `zero-trust` (1) → **zero-trust-architecture** (17)
- `governance-risk-compliance` (1) + `privacy-compliance` (2) + `compliance-governance` (4) → cluster **gouvernance/compliance** (~7)
- `application-security` (4) cohabite avec `web-application-security` (42) — garder distincts (web vs appsec générique).

## Signaux AI-security (priorité T1 pour mas-sec-reviewer)

- 81 skills portent `atlas_techniques` (MITRE ATLAS) ; 85 portent `nist_ai_rmf`. Ce sont les cibles prioritaires pour nourrir la doctrine sécurité-agent de MultiAgentOS (prompt-injection, model-abuse, agent-sandbox). Le cluster `ai-security` (2) est nominalement petit mais les techniques ATLAS sont disséminées dans cloud-security, threat-hunting et threat-intelligence.

## Collisions de noms ECC↔cyber (cibles dedup)

**Aucune collision.** Les 270 noms de skills ECC (type=skill) et les 754 noms cybersec sont strictement disjoints (`comm -12` = vide). Aucune dedup nécessaire entre les deux corpus.

# ECC Harvest — décisions cluster `cyber:endpoint-security` (lot DW)

Doer: lot DW (8 skills endpoint-security). Worktree `maos-ecc` (branche `phase/ecc-harvest`).
Source: `mukul975/Anthropic-Cybersecurity-Skills` (clone read-only, Apache-2.0). Méthode: intake-audit pleine, barre LARGE (T1 défense, library).
Cible: `packages/skills/library/<slug>/SKILL.md`, forme exemplaire §12 (ligne 1 `---`, commentaire source, summary L1, metadata + `frameworks` préservés, Prompt Defense Baseline verbatim, 7 sections §12).

**Cadrage doctrine.** Tous ces skills sont du **durcissement / contrôle de poste défensif** (whitelisting applicatif, chiffrement disque, DLP, FIM, protections mémoire, contrôle USB, forensics, remédiation). Aucun n'est de la weaponisation, du ciblage de masse, ni de l'évasion → la clause KILL « offensif » ne se déclenche pour aucun. Tous sont **KNOWLEDGE/docs** : ils décrivent des contrôles d'OS externes (Windows GPO/Intune, Linux AIDE), pas du code exécuté par MAOS. MAOS ne déploie jamais ces contrôles lui-même ; il les **connaît** pour nourrir `mas-sec-reviewer` (§5) et la doctrine de durcissement.

**Sanitize.** Regex secrets/PII/internal sur les 8 sources : clean (les PIN/clés présents sont des **placeholders pédagogiques** — ex. `123456`, GUID d'exemple, `VID_0781&PID_5583` — pas de secret réel). `@anthropic-ai/sdk` : absent des 8 sources. Aucune mention `cost_usd`/$ : ces skills ne frament pas en cash, donc pas de recadrage §11 nécessaire (note ajoutée par prudence dans chaque corps).

**Frameworks préservés** (frontmatter natif du repo source) : `nist_csf`, `mitre_attack`, et le cas échéant `nist_ai_rmf` + `atlas_techniques` (présents uniquement sur `implementing-endpoint-dlp-controls`).

**Renames.** Aucun. Les 8 slugs sont déjà descriptifs, sans collision (cf. `cybersec-clusters.md` : ECC↔cyber disjoints) et ne dupliquent aucun skill `library/` existant.

---

## implementing-application-whitelisting-with-applocker
- **décision**: adapt (keep)
- **raison**: contrôle d'exécution default-deny (whitelisting applicatif Windows) — un des leviers de durcissement les plus rentables (neutralise malware par script, LOLBins, droppers non signés, shadow IT). Lentille distincte de tout ce qu'on a : nourrit la doctrine §5 sur les lacunes de contrôle d'exécution côté poste. Recadré en skill **knowledge** : MAOS connaît AppLocker pour informer `mas-sec-reviewer`, il ne le déploie jamais.
- **dedup**: non — aucun skill `library/` ne couvre le contrôle d'exécution applicatif Windows.
- **chemin library**: `packages/skills/library/implementing-application-whitelisting-with-applocker/SKILL.md`
- **état**: boosté + vérifié conforme (ligne 1 `---`, commentaire source `mukul975/...`, summary L1, metadata + `frameworks` {nist_csf, mitre_attack} préservés, Prompt Defense Baseline verbatim, 7 sections §12). Sanitize: 0 secret réel (placeholders pédagogiques), 0 `@anthropic-ai/sdk`. KILL offensif: non déclenché (durcissement pur).


## implementing-disk-encryption-with-bitlocker
- **décision**: adapt (keep)
- **raison**: protection des données au repos (chiffrement disque complet Windows) — contrôle de durcissement majeur dont la sécurité tient à la **discipline opératoire** (escrow des clés AVANT chiffrement, TPM+PIN contre cold-boot/evil-maid, full-disk sur disques recyclés). Lentille absente de la library. Knowledge : MAOS connaît BitLocker pour `mas-sec-reviewer`, ne chiffre jamais les disques de l'utilisateur.
- **dedup**: non — aucun skill `library/` ne couvre le chiffrement disque au repos.
- **chemin library**: `packages/skills/library/implementing-disk-encryption-with-bitlocker/SKILL.md`
- **état**: boosté + vérifié conforme (ligne 1 `---`, commentaire source, summary L1, metadata + `frameworks` {nist_csf, mitre_attack} préservés, Prompt Defense Baseline verbatim, 7 sections §12). Sanitize: PIN `123456` + GUID = placeholders pédagogiques, 0 secret réel, 0 `@anthropic-ai/sdk`. KILL offensif: non.

## implementing-endpoint-dlp-controls
- **décision**: adapt (keep)
- **raison**: prévention de fuite de données au poste (DLP endpoint) — détecte/bloque l'exfiltration PII/PHI/PCI via USB, cloud, mail, presse-papier, impression. Discipline de tuning (SIT précis, audit-avant-blocage, réduction faux positifs, policy tips, taux d'override). Couche distincte de la library. Frameworks `nist_ai_rmf` + `atlas_techniques` présents → étend la lentille à la fuite de données médiée par IA. Knowledge : MAOS connaît le contrôle pour `mas-sec-reviewer`, ne déploie pas d'agent DLP.
- **dedup**: non — aucun skill `library/` ne couvre la DLP endpoint.
- **chemin library**: `packages/skills/library/implementing-endpoint-dlp-controls/SKILL.md`
- **état**: boosté + vérifié conforme (ligne 1 `---`, commentaire source, summary L1, metadata + `frameworks` {nist_csf, mitre_attack, nist_ai_rmf, atlas_techniques} TOUS préservés, Prompt Defense Baseline verbatim, 7 sections §12). Sanitize: 0 secret, 0 `@anthropic-ai/sdk`. KILL offensif: non.

## implementing-file-integrity-monitoring-with-aide
- **décision**: adapt (keep)
- **raison**: FIM host-based Linux (AIDE) — baseline checksums + checks planifiés + détection de modification sur répertoires critiques (/etc, /bin, /boot). Contrôle détectif dont la valeur tient à l'intégrité de la baseline (off-box), au scope, et au re-baseline contrôlé. Lentille absente de la library. Knowledge : MAOS connaît AIDE pour `mas-sec-reviewer`, ne l'installe pas sur les hôtes utilisateur.
- **dedup**: non — aucun skill `library/` ne couvre le FIM host-based.
- **chemin library**: `packages/skills/library/implementing-file-integrity-monitoring-with-aide/SKILL.md`
- **état**: boosté + vérifié conforme (ligne 1 `---`, commentaire source, summary L1, metadata + `frameworks` {nist_csf, mitre_attack} préservés, Prompt Defense Baseline verbatim, 7 sections §12). Sanitize: 0 secret, 0 `@anthropic-ai/sdk`. KILL offensif: non.

## implementing-memory-protection-with-dep-aslr
- **décision**: adapt (keep)
- **raison**: durcissement anti-exploit mémoire Windows (DEP/ASLR/CFG/SEHOP, system-wide + per-app, Exploit Guard). Défense en profondeur dont le risque opératoire est la compatibilité (apps legacy/non-ASLR). Lentille absente de la library. Knowledge : MAOS connaît ces mitigations pour `mas-sec-reviewer`, ne configure pas l'Exploit Protection des machines utilisateur.
- **dedup**: non — aucun skill `library/` ne couvre les mitigations mémoire OS.
- **chemin library**: `packages/skills/library/implementing-memory-protection-with-dep-aslr/SKILL.md`
- **état**: boosté + vérifié conforme (ligne 1 `---`, commentaire source, summary L1, metadata + `frameworks` {nist_csf, mitre_attack} préservés, Prompt Defense Baseline verbatim, 7 sections §12). Sanitize: 0 secret, 0 `@anthropic-ai/sdk`. KILL offensif: non (mitigation défensive; les techniques ROP/overflow ne sont que nommées comme menace à contrer).

## implementing-usb-device-control-policy
- **décision**: adapt (keep)
- **raison**: contrôle des supports amovibles USB (anti-exfiltration + anti-malware par média). Précision opératoire (bloquer la classe mass-storage, pas le bus USB ; whitelist VID/PID ; notification + process d'exception). Distinct de la DLP endpoint (inspection de contenu) et de BitLocker. Lentille absente de la library. Knowledge : MAOS connaît le contrôle pour `mas-sec-reviewer`, ne l'applique pas aux machines utilisateur.
- **dedup**: non — proche thématiquement de la DLP endpoint mais axe différent (classe de périphérique vs contenu) ; aucun skill `library/` ne couvre le device control USB.
- **chemin library**: `packages/skills/library/implementing-usb-device-control-policy/SKILL.md`
- **état**: boosté + vérifié conforme (ligne 1 `---`, commentaire source, summary L1, metadata + `frameworks` {nist_csf, mitre_attack} préservés, Prompt Defense Baseline verbatim, 7 sections §12). Sanitize: `VID_0781&PID_5583` + GUID = placeholders pédagogiques, 0 secret, 0 `@anthropic-ai/sdk`. KILL offensif: non.

## performing-endpoint-forensics-investigation
- **décision**: adapt (keep)
- **raison**: DFIR endpoint défensif (préservation par ordre de volatilité, imaging write-blocked + hash, Volatility 3, artefacts Windows EZ-tools, super-timeline, chain of custody). Discipline évidentielle ; les outils de credential-theft (hashdump/lsadump) sont employés en posture **investigation/forensic**, pas d'exfiltration. Lentille absente de la library. Knowledge : MAOS connaît la doctrine DFIR pour `mas-sec-reviewer`/IR, ne lance pas d'outils forensic sur les hôtes utilisateur.
- **dedup**: non — aucun skill `library/` ne couvre le forensic endpoint / DFIR.
- **chemin library**: `packages/skills/library/performing-endpoint-forensics-investigation/SKILL.md`
- **état**: boosté + vérifié conforme (ligne 1 `---`, commentaire source, summary L1, metadata + `frameworks` {nist_csf, mitre_attack} préservés, Prompt Defense Baseline verbatim, 7 sections §12). Sanitize: 0 secret, 0 PII, 0 `@anthropic-ai/sdk`. KILL offensif: non — cadre purement défensif/évidentiel ; description « do NOT use for offensive/anti-forensic » ajoutée.

## performing-endpoint-vulnerability-remediation
- **décision**: adapt (keep)
- **raison**: remédiation de vulnérabilités endpoint (priorisation risque CVSS+EPSS+KEV+criticité+exposition, types de remédiation, déploiement WSUS/SCCM/Intune, durcissement config, zero-day sans patch, validation par re-scan). Corrige l'anti-pattern « patch tous les criticals ». Nourrit `mas-sec-reviewer`/dep-audit. Lentille absente de la library. Knowledge : MAOS connaît la doctrine, ne patche pas les endpoints utilisateur.
- **dedup**: non — proche conceptuellement de la priorisation vuln ECC mais axe endpoint/patch-deploy distinct ; aucun skill `library/` endpoint-remediation existant.
- **chemin library**: `packages/skills/library/performing-endpoint-vulnerability-remediation/SKILL.md`
- **état**: boosté + vérifié conforme (ligne 1 `---`, commentaire source, summary L1, metadata + `frameworks` {nist_csf, mitre_attack} préservés, Prompt Defense Baseline verbatim, 7 sections §12). Sanitize: 0 secret, 0 `@anthropic-ai/sdk`. KILL offensif: non — les CVE (EternalBlue/PrintNightmare) ne sont nommés que comme cibles de remédiation.

---

## Bilan lot DW

- **Keepers**: 8 / 8 (tous `adapt`/keep, cluster `cyber:endpoint-security`, tier T1, status library).
- **Rejets**: 0 (aucune weaponisation/évasion/ciblage de masse dans ce cluster défensif).
- **Renames**: 0.
- **Frameworks**: préservés sur les 8 ; `nist_ai_rmf` + `atlas_techniques` en plus sur `implementing-endpoint-dlp-controls` uniquement.
- **Sanitize global**: 8/8 clean (placeholders pédagogiques seulement) ; 0 `@anthropic-ai/sdk` ; 0 `cost_usd`/$.
- **Conformité exemplaire §12**: 8/8 (ligne 1 `---`, commentaire source `mukul975/...`, summary L1, metadata complet + frameworks, Prompt Defense Baseline verbatim, 7 sections Overview/When/Principles(cite source)/Process/Rationalizations/Red Flags/Verification).

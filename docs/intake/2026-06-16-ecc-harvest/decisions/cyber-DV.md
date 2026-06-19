# ECC Harvest — décisions cluster `cyber:endpoint-security` (lot DV)

Doer: lot DV (9 skills). Worktree `maos-ecc`. Méthode: intake-audit barre LARGE (T1, library).
Source cyber: `mukul975/Anthropic-Cybersecurity-Skills` (Apache-2.0). Cible: `packages/skills/library/<slug>/SKILL.md`.
Dedup contre `our-assets-index.md` + recoupe `mas-sec-reviewer` / CLAUDE.md §5 (posture endpoint, risky actions gated).
Nature du lot: skills **DÉFENSIFS** (blue-team) de défense d'endpoint — HIDS, EDR, event-logging,
détection d'évasion/fileless, durcissement CIS. Aucune arme offensive dans le lot.
Le frontmatter source porte `subdomain: endpoint-security` + des `frameworks` (NIST-CSF + MITRE-ATTACK
sur les 9; `deploying-edr-agent-with-crowdstrike` ajoute NIST-AI-RMF + MITRE-ATLAS; `detecting-evasion-
techniques-in-endpoint-logs` ajoute D3FEND): mappings préservés dans la metadata MAS.
Garde-fou défensif appliqué à chaque skill: lentille déploiement+détection+durcissement gardée;
toute conséquence destructrice (active-response, service-disable, firewall, rm) recadrée en action
RISQUÉE GATÉE §5; tout owner-scoped (jamais de probing tiers). Note: `detecting-evasion-techniques`
est de la DÉTECTION défensive (TA0005 dans les logs), gardé — pas de l'évasion offensive.
Sanitize: 0 secret réel, 0 PII, 0 `@anthropic-ai/sdk` dans les 9 sources (CID/CIS placeholders d'exemple
uniquement). Recadrage transverse §11: tout chiffre = quota d'abonnement, jamais $/€ (les sources
n'utilisaient pas de cash; les mentions de licences MDE/CrowdStrike/CIS = prérequis tiers, pas une
facturation MAOS — recadrage léger, MAOS s'authentifie par abonnement, jamais via clé committée §11).

---

## configuring-host-based-intrusion-detection
- **décision**: adapt
- **raison**: déploiement+tuning défensif HIDS (Wazuh/OSSEC/AIDE) sur endpoints possédés — FIM sur binaires/config/clés-registre-Run, rootcheck, règles de détection (modif binaire critique, SSH-config, exécutables en temp), forwarding SIEM. Nourrit la posture endpoint de `mas-sec-reviewer` + §5.
- **dedup**: non — `mas-sec-reviewer` est une gate générique §5; aucun skill HIDS/FIM dans notre surface. Angle distinct = intégrité fichier + détection host-level.
- **garde-fou défensif (§5)**: l'active-response (block IP/disable-account) est recadrée en action RISQUÉE GATÉE — définie mais jamais auto-activée en prod sans test non-prod; tout owner-scoped, aucun probing tiers, aucune écriture hors projet actif.
- **chemin library**: `packages/skills/library/configuring-host-based-intrusion-detection/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` NIST-CSF/MITRE-ATTACK préservé + Prompt Defense Baseline; 7 sections §12 défensives; baseline 48h + exclusions noisy explicités; 0 secret, 0 sdk, 0 cash).

## configuring-windows-defender-advanced-settings
- **décision**: adapt
- **raison**: durcissement défensif MDE — ASR rules (block Office child-process, vol LSASS, scripts obfusqués, PSExec/WMI), controlled folder access (anti-ransomware), network/exploit protection (DEP/SEHOP/CFG), cloud-delivered + Block-at-First-Sight, tamper protection; déploiement Intune/SCCM/GPO; hunting KQL. Nourrit la posture endpoint de `mas-sec-reviewer` + §5.
- **dedup**: non — aucun skill Defender/ASR dans notre surface; angle = config protection native Windows. Distinct de l'EDR tiers (CrowdStrike).
- **garde-fou défensif (§5)**: doctrine Audit-avant-Block (2-4 semaines) martelée; toute action qui AFFAIBLIT Defender (disable realtime/behavior monitoring, drop tamper protection) recadrée en action RISQUÉE GATÉE, jamais une édition autonome; owner-scoped.
- **recadrage §11**: licences MDE/M365 E5 = prérequis tiers, jamais une facturation PAYG MAOS; MAOS s'authentifie par abonnement.
- **chemin library**: `packages/skills/library/configuring-windows-defender-advanced-settings/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` NIST-CSF/MITRE-ATTACK préservé + Prompt Defense Baseline; 7 sections §12 défensives; tamper protection obligatoire; 0 secret réel, 0 sdk, 0 cash).

## configuring-windows-event-logging-for-detection
- **décision**: adapt
- **raison**: baseline défensif de logging détection — Advanced Audit Policy (GPO), command-line dans 4688, sizing log ≥1GB, Windows Event Forwarding des Event IDs à forte valeur (4624/4625/4648/4672/4688/4720/4728/7045/1102) vers SIEM; mapping ID→technique (lateral movement, persistence service, log-clear). Nourrit `mas-sec-reviewer` + §5.
- **dedup**: non — aucun skill de config audit-policy/WEF dans notre surface; angle = télémétrie endpoint pour détection. Distinct de Sysmon.
- **garde-fou défensif**: le clearing/shrink de logs (1102/104) est explicitement ce qu'on DÉTECTE, jamais ce qu'on fait; tout owner-scoped, aucune écriture hors projet actif (§5).
- **chemin library**: `packages/skills/library/configuring-windows-event-logging-for-detection/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` NIST-CSF/MITRE-ATTACK préservé + Prompt Defense Baseline; 7 sections §12 défensives; advanced-not-basic + cmdline-4688 + forward-off-host martelés; 0 secret, 0 sdk, 0 cash).

## deploying-edr-agent-with-crowdstrike
- **décision**: adapt
- **raison**: déploiement+tuning défensif EDR CrowdStrike Falcon — sensor install avec CID (SCCM/Intune/GPO/Ansible), prevention policies par groupe (ML cloud+sensor, behavioral on-write, exploit/memory-scan, ransomware+shadow-copy), response policies (RTR, containment, remediation auto), validation + test detection, intégration SIEM. Nourrit `mas-sec-reviewer` + §5.
- **dedup**: non — aucun skill EDR dans notre surface; angle = onboarding endpoint sur télémétrie+prévention comportementale. Distinct du HIDS (host-level intégrité) et de Defender (natif).
- **garde-fou défensif (§5)**: network containment, kill auto, quarantine et désinstallation sensor recadrés en actions RISQUÉES GATÉES (peuvent outage la prod); pré-autorisation scoped + exclusions trafic management; owner-scoped.
- **recadrage §11**: licence/API Falcon = prérequis tiers, jamais une facturation PAYG MAOS; secret API client jamais émis en clair; MAOS s'authentifie par abonnement.
- **frameworks**: NIST-CSF + MITRE-ATTACK + (bonus) NIST-AI-RMF + MITRE-ATLAS préservés (signal AI-security → prioritaire pour `mas-sec-reviewer`).
- **chemin library**: `packages/skills/library/deploying-edr-agent-with-crowdstrike/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` complet préservé + Prompt Defense Baseline; 7 sections §12 défensives; CID-at-install + policy-par-rôle + MDM-macOS martelés; CID/exemples = placeholders, 0 secret réel, 0 sdk, 0 cash).

## deploying-osquery-for-endpoint-monitoring
- **décision**: adapt
- **raison**: visibilité endpoint défensive via SQL — osquery sur la flotte, requêtes planifiées (processes on_disk=0 = fileless, listening ports, startup_items persistence, packages, SUID, crontab, unsigned exe), hunting (connexions IP externes, SSH keys inattendues, binaires système modifiés), FleetDM/Kolide en TLS. Nourrit `mas-sec-reviewer` + §5.
- **dedup**: non — aucun skill osquery/visibilité-SQL dans notre surface; angle = état OS interrogeable périodiquement. Distinct de l'EDR (temps réel) et du HIDS (intégrité fichier).
- **garde-fou défensif**: read-only par construction (lit l'état OS, ne le modifie pas); owner-scoped, jamais de probing de hosts tiers; enroll secret/TLS jamais en clair; intervalles 300-3600s + differential mode pour protéger la perf.
- **chemin library**: `packages/skills/library/deploying-osquery-for-endpoint-monitoring/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` NIST-CSF/MITRE-ATTACK préservé + Prompt Defense Baseline; 7 sections §12 défensives; periodic-not-realtime + differential-mode martelés; 0 secret, 0 sdk, 0 cash).

## detecting-evasion-techniques-in-endpoint-logs
- **décision**: adapt (DÉTECTION défensive — explicitement keep par le brief)
- **raison**: chasse défensive defense-evasion (MITRE ATT&CK TA0005) dans la télémétrie endpoint — log tampering (1102/104, wevtutil cl), timestomping (Sysmon 2 vs 11), process injection (Sysmon 8/10/25), disabling sécu (Set-MpPreference -Disable*, DisableRealtimeMonitoring), masquerading (binaires système hors System32, OriginalFileName mismatch, double extension), LOLBin abuse (mshta/certutil/regsvr32/rundll32/MSBuild) + corrélation 3+ signaux faibles. Nourrit `mas-sec-reviewer` + §5.
- **dedup**: non — angle hunting/règles de détection d'évasion absent de notre surface; complète les skills de logging (event-logging) et de visibilité (osquery).
- **garde-fou défensif (clarif. brief)**: c'est de la DÉTECTION, jamais de l'évasion offensive. Les patterns LOLBin/injection sont des SIGNATURES de détection, pas un how-to; explicité dans Overview/Principles/Red Flags. Read-only, owner-scoped.
- **chemin library**: `packages/skills/library/detecting-evasion-techniques-in-endpoint-logs/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` NIST-CSF/MITRE-ATTACK + (bonus) D3FEND préservé + Prompt Defense Baseline; 7 sections §12 défensives; "detect-not-perform" + allowlist injecteurs + parent-process context martelés; 0 secret, 0 sdk, 0 cash).

## detecting-fileless-attacks-on-endpoints
- **décision**: adapt
- **raison**: détection défensive d'attaques fileless/in-memory que l'AV fichier rate — PowerShell malveillant (encoded, IEX download cradle, AMSI-bypass dans 4104), injection (reflective DLL Sysmon 7, hollowing 1+10, CreateRemoteThread 8), persistence WMI (Sysmon 19/20/21, __EventFilter/__EventConsumer), payloads en registre (Sysmon 13 Base64 long dans Run). Configure la télémétrie (Sysmon/AMSI/PowerShell logging) puis écrit les règles SIEM. Nourrit `mas-sec-reviewer` + §5.
- **dedup**: non — angle in-memory/behavioral absent de notre surface; complète l'evasion-detection (angle distinct: fileless vs evasion générique) et l'event-logging.
- **garde-fou défensif**: DÉTECTION uniquement, jamais de génération de payload; behavioral-not-signature; AMSI-bypass = alerte prioritaire; read-only, owner-scoped.
- **chemin library**: `packages/skills/library/detecting-fileless-attacks-on-endpoints/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` NIST-CSF/MITRE-ATTACK préservé + Prompt Defense Baseline; 7 sections §12 défensives; telemetry-first + AMSI-bypass-priority + WMI-19/21 martelés; 0 secret, 0 sdk, 0 cash).

## hardening-linux-endpoint-with-cis-benchmark
- **décision**: adapt
- **raison**: durcissement défensif CIS Linux (Ubuntu/RHEL/CentOS/Debian) — mounts nodev/nosuid/noexec, GRUB, minimisation services, sysctl réseau, firewall, sshd (no root, no password auth), pwquality/PAM, règles auditd (identity/sudoers/time/perm/module), assessment OpenSCAP. Nourrit `mas-sec-reviewer` + §5.
- **dedup**: non — aucun skill de hardening CIS dans notre surface; angle = baseline OS attack-surface. Distinct du Windows-CIS (OS différent).
- **garde-fou défensif (§5)**: sshd/firewall/sysctl recadrés en actions RISQUÉES GATÉES (lockout/réseau cassé) — allow SSH AVANT firewall, sshd testé depuis 2e session, sysctl staged; owner-scoped.
- **chemin library**: `packages/skills/library/hardening-linux-endpoint-with-cis-benchmark/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` NIST-CSF/MITRE-ATTACK préservé + Prompt Defense Baseline; 7 sections §12 défensives; never-lock-yourself-out + profil-par-rôle + measure-with-OpenSCAP martelés; 0 secret, 0 sdk, 0 cash).

## hardening-windows-endpoint-with-cis-benchmark
- **décision**: adapt
- **raison**: durcissement défensif CIS Windows (10/11, Server 2019/2022) — sélection profil L1/L2, import GPO Build Kits, account/lockout + audit policy + security options (NTLMv2-only, UAC admin-approval, no last-username) + Windows Firewall, validation CIS-CAT, processus d'exceptions formel. Nourrit `mas-sec-reviewer` + §5.
- **dedup**: non — aucun skill CIS-Windows dans notre surface; angle = baseline GPO Windows. Distinct du Linux-CIS.
- **garde-fou défensif (§5)**: rollout GPO recadré en staged (pilot OU avant flotte) pour ne pas casser les LOB apps; affaiblir un baseline = action RISQUÉE GATÉE; exceptions = justification+compensating control+sign-off; owner-scoped.
- **chemin library**: `packages/skills/library/hardening-windows-endpoint-with-cis-benchmark/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` NIST-CSF/MITRE-ATTACK préservé + Prompt Defense Baseline; 7 sections §12 défensives; pilot-before-fleet + right-level-for-data + measure-with-CIS-CAT martelés; 0 secret, 0 sdk, 0 cash).

---

### Récap
- 9/9 keepers (tous `adapt`). 0 reject. Lot 100% DÉFENSIF (blue-team endpoint defense).
- Catégories: déploiement+config détective (HIDS, EDR CrowdStrike, osquery, Windows event-logging, Windows
  Defender ASR/MDE), détection comportementale (evasion-in-logs, fileless), durcissement (CIS Linux, CIS Windows).
- Garde-fou défensif appliqué partout: lentille déploiement+détection+durcissement gardée; toute conséquence
  destructrice recadrée en action RISQUÉE GATÉE §5 — active-response HIDS, network-containment/kill/quarantine
  CrowdStrike, disable-Defender, sshd/firewall/sysctl Linux (lockout), affaiblir un baseline Windows, rollout GPO
  non-piloté. Les deux skills "detecting-*" sont de la DÉTECTION (TA0005 / fileless dans les logs), jamais de
  l'évasion offensive — clarifié verbatim dans Overview/Principles/Red Flags (patterns LOLBin/injection =
  signatures de détection, pas how-to; aucun payload généré). Tout read-only/owner-scoped, jamais de probing tiers,
  jamais d'écriture hors projet actif (§5).
- Frameworks préservés dans la metadata: NIST-CSF + MITRE-ATTACK sur les 9;
  `deploying-edr-agent-with-crowdstrike` ajoute NIST-AI-RMF + MITRE-ATLAS (signal AI-security → prioritaire
  pour `mas-sec-reviewer`); `detecting-evasion-techniques-in-endpoint-logs` ajoute D3FEND.
- Recadrage §11 transverse: 0 chiffre cash (les sources n'en avaient pas, recadrage léger). Les licences tierces
  (MDE/M365 E5, CrowdStrike Falcon, CIS SecureSuite) = prérequis du PROJET EXTERNE, jamais une facturation PAYG
  MAOS; note explicite — MAOS s'authentifie par abonnement, jamais via clé committée; secrets API (CID Falcon,
  enroll secret FleetDM) jamais émis en clair.
- Tous nourrissent `mas-sec-reviewer` + la lentille §5 (posture endpoint, risky actions gated, owner-scope).
- Garde-fous techniques: 0 `@anthropic-ai/sdk`, 0 secret réel/PII dans les 9 outputs (CID/ARN/cert/préfixes/
  exemples CIS = placeholders).
- Renames: aucun. Les 9 slugs library == slugs source.

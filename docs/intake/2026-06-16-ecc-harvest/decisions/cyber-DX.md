# ECC Harvest — décisions cluster `cyber:soc-operations` (lot DX)

Doer: lot DX (9 skills soc-operations). Worktree `maos-ecc` (branche `phase/ecc-harvest`).
Source: `mukul975/Anthropic-Cybersecurity-Skills` (clone read-only, Apache-2.0). Méthode: intake-audit pleine, barre LARGE (T1 défense, library).
Cible: `packages/skills/library/<slug>/SKILL.md`, forme exemplaire §12 (ligne 1 `---`, commentaire source `mukul975/...`, summary L1, metadata + `frameworks` préservés, Prompt Defense Baseline verbatim, 7 sections §12).

**Cadrage doctrine.** Les 9 skills sont du **bleu pur (blue-team SOC)** : analyse de logs (DNS exfil, Windows event logs), ingénierie de détection (Splunk SPL, Sigma), automatisation de triage malware défensif, et process/métriques SOC (dashboard IR, matrice d'escalade, KPI, playbook ransomware). Aucun n'est de la weaponisation, du ciblage de masse, ni de l'évasion → la clause KILL « offensif » ne se déclenche pour aucun. Tous sont **KNOWLEDGE/docs** : ils décrivent des process et des outils externes (Splunk, EDR, sandbox isolé, SOAR), pas du code que MAOS exécute. MAOS ne déploie jamais ces contrôles ; il les **connaît** pour nourrir `mas-sec-reviewer` (§5) et la doctrine défensive. Deux skills portent une charge opératoire sensible — le pipeline malware et le playbook ransomware — recadrés explicitement : sandbox isolé obligatoire, jamais d'authoring de malware, containment = action propriétaire (jamais une action MAOS).

**Sanitize.** Regex secrets/PII/internal sur les 9 sources : clean. Les artefacts présents sont des **placeholders pédagogiques** (IP RFC1918/exemples `192.168.1.105`, `185.234.218.50`, hash tronqués `a1b2c3d4...`, GUID Sigma d'exemple, `$TOKEN`/`$token` variables non-renseignées). Le flag `SKIP_TLS_VERIFY` du pipeline malware est une commodité de lab documentée, pas un secret. `@anthropic-ai/sdk` : absent des 9 sources. Aucune mention `cost_usd` : ces skills ne frament pas en cash → recadrage §11 ajouté par prudence dans chaque corps (coût = unités de quota §8, pas de PAYG).

**Frameworks préservés** (frontmatter natif du repo source) : `nist_csf` + `mitre_attack` sur les 9 ; en plus `atlas_techniques` (DNS-exfil, KPI), `nist_ai_rmf` (KPI), `d3fend_techniques` (Windows-logs, Splunk-SPL, Sigma, ransomware).

**Renames.** Aucun. Les 9 slugs sont déjà descriptifs, sans collision (cf. `cybersec-clusters.md` : ECC↔cyber disjoints) et ne dupliquent aucun skill `library/` existant (`analyzing-security-logs-with-splunk` existe mais couvre l'**investigation** one-off ; les deux skills de détection DX couvrent la **construction de règles** durables — lentilles distinctes, cadrage « Do NOT use for detection engineering / one-off investigation » croisé dans les deux sens).

---

## analyzing-dns-logs-for-exfiltration
- **décision**: adapt (keep)
- **raison**: chasse défensive de l'exfiltration et du C2 par DNS sur logs autorisés (tunneling par longueur/entropie de sous-domaine, abus de TXT, DGA, contournement DoH, attribution host/process, estimation de volume exfiltré). Lentille réseau §5 (`allowed_hosts`) absente de la library. Frameworks `atlas_techniques` présents → étend la lentille à l'exfil médiée par IA. Knowledge : MAOS raisonne sur les indicateurs DNS pour `mas-sec-reviewer`, ne sinkhole/isole jamais.
- **dedup**: non — aucun skill `library/` ne couvre la chasse exfil DNS.
- **chemin library**: `packages/skills/library/analyzing-dns-logs-for-exfiltration/SKILL.md`
- **état**: boosté + vérifié conforme (ligne 1 `---`, commentaire source, summary L1, metadata + `frameworks` {nist_csf, mitre_attack, atlas_techniques} préservés, Prompt Defense Baseline verbatim, 7 sections §12). Sanitize: IP/hash = placeholders pédagogiques, 0 secret, 0 `@anthropic-ai/sdk`. KILL offensif: non (chasse défensive read-only).

## analyzing-windows-event-logs-in-splunk
- **décision**: adapt (keep)
- **raison**: investigation blue-team Windows (Security/System/Sysmon) — brute force/spray, escalade de privilèges, persistance, mouvement latéral, timeline forensique, mappés ATT&CK. Lentille investigation Windows absente de la library (le skill Splunk existant est orienté incident multi-sources, pas Windows event-IDs). Knowledge : nourrit `mas-sec-reviewer` (§5), ne remédie pas les hôtes utilisateur.
- **dedup**: non — proche thématiquement de `analyzing-security-logs-with-splunk` mais axe distinct (Windows event-IDs/Sysmon vs corrélation multi-sources d'incident) ; cadrage « do NOT use for network-only / Linux » ajouté.
- **chemin library**: `packages/skills/library/analyzing-windows-event-logs-in-splunk/SKILL.md`
- **état**: boosté + vérifié conforme (ligne 1 `---`, commentaire source, summary L1, metadata + `frameworks` {nist_csf, mitre_attack, d3fend_techniques} préservés, Prompt Defense Baseline verbatim, 7 sections §12). Sanitize: 0 secret, 0 `@anthropic-ai/sdk`. KILL offensif: non (les TTP Kerberoast/DCSync/PtH ne sont nommés que comme cibles de détection).

## building-automated-malware-submission-pipeline
- **décision**: adapt (keep — recadrage de sûreté renforcé)
- **raison**: triage malware **défensif** à l'échelle (collecte EDR/email-gateway, pré-screen par hash VT/MalwareBazaar, détonation des seuls inconnus en sandbox **isolé**, extraction d'IOC, verdict pondéré, push SIEM). Le skill analyse des fichiers suspects capturés, il n'authore ni ne distribue jamais de malware. Lentille triage automatisé absente de la library. Knowledge : MAOS raisonne sur le design sûr du pipeline pour `mas-sec-reviewer`, ne détone rien sur la machine utilisateur, n'applique jamais le blocage IOC.
- **dedup**: non — aucun skill `library/` ne couvre le pipeline de triage malware.
- **chemin library**: `packages/skills/library/building-automated-malware-submission-pipeline/SKILL.md`
- **état**: boosté + vérifié conforme (ligne 1 `---`, commentaire source, summary L1, metadata + `frameworks` {nist_csf, mitre_attack} préservés, Prompt Defense Baseline verbatim, 7 sections §12). Sanitize: `$TOKEN`/`$token` = variables vides, `SKIP_TLS_VERIFY` = commodité lab, 0 secret réel, 0 `@anthropic-ai/sdk`. KILL offensif: **examiné de près, non déclenché** — posture purement défensive ; ligne KILL explicite ajoutée au corps (refus d'authoring/modification de malware, isolation sandbox non-négociable, blocage = remédiation propriétaire §5).

## building-detection-rule-with-splunk-spl
- **décision**: adapt (keep)
- **raison**: ingénierie de détection Splunk SPL — règles de corrélation durables (seuil, séquence, anomalie-baseline, mouvement latéral, exfil, PowerShell), enrichissement asset/identity/threat-intel, optimisation tstats/data-models, validation précision/FP avant prod. Comble le déficit de couverture ATT&CK des SIEM (~21%). Lentille distincte de l'investigation one-off. Knowledge : nourrit `mas-sec-reviewer` (§5), ne déploie rien dans le SIEM utilisateur.
- **dedup**: non — aucun skill `library/` ne couvre la construction de règles SPL durables ; cadrage « do NOT use for one-off investigation » croisé avec `analyzing-windows-event-logs-in-splunk`.
- **chemin library**: `packages/skills/library/building-detection-rule-with-splunk-spl/SKILL.md`
- **état**: boosté + vérifié conforme (ligne 1 `---`, commentaire source, summary L1, metadata + `frameworks` {nist_csf, mitre_attack, d3fend_techniques} préservés, Prompt Defense Baseline verbatim, 7 sections §12). Sanitize: 0 secret, 0 `@anthropic-ai/sdk`. KILL offensif: non — cadrage « evasion/bypass = hors politique » ajouté.

## building-detection-rules-with-sigma
- **décision**: adapt (keep)
- **raison**: détection-as-code portable (Sigma YAML → Splunk/Elastic/Sentinel via pySigma backends + pipelines, mapping ATT&CK, suivi de couverture Navigator, backtest FP 7 jours, CI/CD Git). Lentille vendor-agnostic absente de la library. Knowledge : nourrit `mas-sec-reviewer` (§5), produit des artefacts de règles, ne déploie pas dans le SIEM utilisateur.
- **dedup**: non — distinct du skill SPL (write-once/compile-many multi-SIEM vs SPL natif) ; aucun skill `library/` Sigma existant.
- **chemin library**: `packages/skills/library/building-detection-rules-with-sigma/SKILL.md`
- **état**: boosté + vérifié conforme (ligne 1 `---`, commentaire source, summary L1, metadata + `frameworks` {nist_csf, mitre_attack, d3fend_techniques} préservés, Prompt Defense Baseline verbatim, 7 sections §12). Sanitize: GUID Sigma = exemple, 0 secret, 0 `@anthropic-ai/sdk`. KILL offensif: non — cadrage « purple-team output → couverture défensive » + « pas d'évasion » dans le corps.

## building-incident-response-dashboard
- **décision**: adapt (keep)
- **raison**: dashboards IR temps réel (Splunk Dashboard Studio/Elastic/Grafana) pour situational awareness pendant incident actif — systèmes affectés, containment, propagation IOC, timeline, vue exécutive, refresh par scheduled searches. Lentille dashboarding IR absente de la library. Knowledge : MAOS raisonne sur le design dashboard pour `mas-sec-reviewer` (§5) ; le dashboard informe, il ne contient/remédie jamais.
- **dedup**: non — aucun skill `library/` ne couvre le dashboarding IR ; cadrage « do NOT use for day-to-day monitoring (Incident Review) ».
- **chemin library**: `packages/skills/library/building-incident-response-dashboard/SKILL.md`
- **état**: boosté + vérifié conforme (ligne 1 `---`, commentaire source, summary L1, metadata + `frameworks` {nist_csf, mitre_attack} préservés, Prompt Defense Baseline verbatim, 7 sections §12). Sanitize: IP/hash/incident-IDs = placeholders, 0 secret, 0 `@anthropic-ai/sdk`. KILL offensif: non — cadrage « informs, never enforces » (§5) explicite.

## building-soc-escalation-matrix
- **décision**: adapt (keep)
- **raison**: design de matrice d'escalade SOC — tiers, classification P1–P4 + SLA, escalade context-driven (sévérité × criticité d'actif), triggers automatiques + temporels, templates de communication, encodage SOAR. **Miroir direct de la gating risk-enum de MAOS** (§5 : high/blocking pausent toujours pour un humain) → lentille gouvernance précieuse. Knowledge : nourrit `mas-sec-reviewer` (§5), MAOS ne page personne ni n'agit dessus.
- **dedup**: non — aucun skill `library/` ne couvre la matrice d'escalade ; cohabite avec les playbooks IR (process vs framework de priorisation).
- **chemin library**: `packages/skills/library/building-soc-escalation-matrix/SKILL.md`
- **état**: boosté + vérifié conforme (ligne 1 `---`, commentaire source, summary L1, metadata + `frameworks` {nist_csf, mitre_attack} préservés, Prompt Defense Baseline verbatim, 7 sections §12). Sanitize: 0 secret, 0 PII, 0 `@anthropic-ai/sdk`. KILL offensif: non — process/gouvernance pur.

## building-soc-metrics-and-kpi-tracking
- **décision**: adapt (keep)
- **raison**: programme de métriques/KPI SOC — framework cœur (famille MTTD/MTTR, FP/TP rate, couverture ATT&CK, dwell time) aligné NIST-CSF, mesure depuis le SIEM, qualité d'alerte, productivité (non-punitive), couverture, reporting exécutif + amélioration continue. Frameworks `atlas_techniques` + `nist_ai_rmf` présents → étend aux KPI de sécurité-agent. Knowledge : nourrit `mas-sec-reviewer` (§5), MAOS calcule/rapporte, ne manage pas d'équipe.
- **dedup**: non — aucun skill `library/` ne couvre les métriques SOC.
- **chemin library**: `packages/skills/library/building-soc-metrics-and-kpi-tracking/SKILL.md`
- **état**: boosté + vérifié conforme (ligne 1 `---`, commentaire source, summary L1, metadata + `frameworks` {nist_csf, mitre_attack, atlas_techniques, nist_ai_rmf} TOUS préservés, Prompt Defense Baseline verbatim, 7 sections §12). Sanitize: 0 secret, 0 `@anthropic-ai/sdk`. KILL offensif: non — garde-fou « métriques = amélioration de process, jamais punition individuelle » ancré dans Principles/Red Flags.

## building-soc-playbook-for-ransomware
- **décision**: adapt (keep — recadrage de sûreté renforcé)
- **raison**: playbook IR ransomware **défensif** (NIST SP 800-61) — triggers de détection précoce (chiffrement de masse, suppression shadow-copy/backup, note de rançon), arbre de triage (isoler sans éteindre), containment EDR/firewall/AD, préservation évidentielle par ordre de volatilité, eradication + identification de variante, recovery depuis backups immuables, post-incident. Le skill construit une réponse défensive, n'authore jamais de ransomware. Lentille playbook ransomware absente de la library. Knowledge : nourrit `mas-sec-reviewer` (§5), MAOS n'isole/reconstruit jamais d'hôte ; containment = action propriétaire.
- **dedup**: non — aucun skill `library/` ne couvre le playbook ransomware.
- **chemin library**: `packages/skills/library/building-soc-playbook-for-ransomware/SKILL.md`
- **état**: boosté + vérifié conforme (ligne 1 `---`, commentaire source, summary L1, metadata + `frameworks` {nist_csf, mitre_attack, d3fend_techniques} préservés, Prompt Defense Baseline verbatim, 7 sections §12). Sanitize: incident-IDs/IP/hash = placeholders, 0 secret, 0 `@anthropic-ai/sdk`. KILL offensif: **examiné de près, non déclenché** — posture purement défensive ; ligne KILL explicite ajoutée (refus d'authoring/usage offensif ; isoler ≠ éteindre ; paiement de rançon hors scope = décision propriétaire/legal §11 ; containment = action propriétaire §5).

---

## Bilan lot DX

- **Keepers**: 9 / 9 (tous `adapt`/keep, cluster `cyber:soc-operations`, tier T1, status library).
- **Rejets**: 0 (aucune weaponisation/évasion/ciblage de masse dans ce cluster blue-team).
- **Renames**: 0.
- **Sensibles recadrés**: 2 — `building-automated-malware-submission-pipeline` (sandbox isolé obligatoire, pas d'authoring) et `building-soc-playbook-for-ransomware` (défensif, pas d'authoring/offensif, paiement hors scope) ; KILL offensif examiné de près sur les deux, non déclenché.
- **Frameworks**: préservés sur les 9 ; en plus `atlas_techniques` (DNS-exfil, KPI), `nist_ai_rmf` (KPI), `d3fend_techniques` (Windows-logs, Splunk-SPL, Sigma, ransomware).
- **Sanitize global**: 9/9 clean (placeholders pédagogiques + variables vides seulement) ; 0 `@anthropic-ai/sdk` ; 0 `cost_usd`/$.
- **Conformité exemplaire §12**: 9/9 (ligne 1 `---`, commentaire source `mukul975/...`, summary L1, metadata complet + frameworks, Prompt Defense Baseline verbatim, 7 sections Overview/When/Principles(cite source)/Process/Rationalizations/Red Flags/Verification).

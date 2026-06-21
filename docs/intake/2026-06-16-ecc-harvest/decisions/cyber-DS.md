# ECC Harvest — décisions cluster `cyber:incident-response` (lot DS)

Doer: lot DS (9 skills). Worktree `maos-ecc`. Méthode: intake-audit barre LARGE (T1, library).
Source cyber: `mukul975/Anthropic-Cybersecurity-Skills` (Apache-2.0). Cible: `packages/skills/library/<slug>/SKILL.md`.
Dedup contre `our-assets-index.md` + recoupe `mas-sec-reviewer` / CLAUDE.md §5 (réponse à incident, manipulation de preuves, collecte d'IoC, gating cross-projet).
Nature du lot: skills **DÉFENSIFS** (blue-team) de réponse à incident — analyse de logs, playbooks IR, collecte d'IoC, manipulation de preuves, timeline forensique, communication d'incident, IR cloud.
Le frontmatter source porte `subdomain: incident-response` + `frameworks` NIST-CSF (RS.MA/RS.AN/RC.RP) + MITRE-ATTACK partout ; deux skills (`analyzing-security-logs-with-splunk`, `building-incident-timeline-with-timesketch`) ajoutent NIST-AI-RMF / MITRE-ATLAS / D3FEND : mappings préservés dans la metadata MAS (champ `frameworks`).
Garde-fou défensif appliqué à chaque skill : lentille analyse+containment+collecte-de-preuves gardée ; aucune action mutante sortante de MAOS vers un système tiers (containment = guidance owner-scoped, §5 gate). Collecte de preuves volatiles = read-only order-of-volatility sur hôte possédé, jamais probing tiers.
Sanitize: 0 secret réel, 0 PII, 0 `@anthropic-ai/sdk` dans les 9 sources. Trois recadrages mineurs:
(1) `building-incident-timeline-with-timesketch` source contenait un placeholder `password="password"` (config d'exemple) → non porté, remplacé par référence à secret-via-env.
(2) `conducting-cloud-incident-response` source chiffrait l'impact en `$2,974` (egress/compute non-autorisé) → reframé en impact opérationnel sans cash (§11 : MAOS = abonnement, jamais $/€).
(3) commandes de containment (désactivation de clés IAM, deny-all, isolation d'instance) = guidance pour le propriétaire du cloud cible, jamais exécutées par MAOS sur un tiers (§5).
Recadrage transverse §11 : tout chiffre = quota d'abonnement, jamais $/€ (les sources n'utilisaient pas de cash hormis le cas (2) ci-dessus).

---

## analyzing-linux-audit-logs-for-intrusion
- **décision**: adapt
- **raison**: analyse d'intrusion host-based via Linux auditd — vérification daemon/règles + détection de drops (`auditctl -s`), déploiement de règles ciblées (fichiers credentials `/etc/passwd`/`shadow`/sudoers, clés SSH, `ptrace` injection, exec-from-`/tmp`, chargement modules kernel = rootkit, sockets, cron, tampering `/var/log`), requêtes `ausearch` key-taggées + synthèse `aureport`, reconstruction de timeline mappée ATT&CK. Nourrit `mas-sec-reviewer` + lentille §5 (forensique host d'un projet possédé).
- **dedup**: non — aucune capacité d'analyse de logs host/auditd dans notre surface; angle host-level distinct du réseau et de la gate générique §5.
- **garde-fou défensif**: analyse read-only/owner-scoped sur hôte autorisé; toute remédiation = guidance pour le propriétaire, jamais une action mutante sortante de MAOS vers un tiers (§5).
- **chemin library**: `packages/skills/library/analyzing-linux-audit-logs-for-intrusion/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` NIST-CSF/MITRE-ATTACK préservé + Prompt Defense Baseline; 7 sections §12 défensives; 0 secret, 0 sdk, 0 cash).

## analyzing-network-traffic-for-incidents
- **décision**: adapt
- **raison**: forensique réseau d'incident sur captures autorisées — acquisition (tap/SPAN ou PCAP existant) puis triage Wireshark + métadonnées Zeek (`conn`/`dns`/`http`/`ssl` via `zeek-cut`) + NetFlow pour confirmer le beaconing C2 (intervalle régulier, jitter faible), quantifier l'exfiltration (gros `orig_bytes`, protocoles anormaux, tunneling ICMP/DNS) et tracer le mouvement latéral (SMB/RDP interne-à-interne). Mappé ATT&CK. Nourrit `mas-sec-reviewer`, §5 et le garde-fou `allowed_hosts`.
- **dedup**: non — angle réseau distinct du host (auditd) et de la gate §5; aucune capacité d'analyse PCAP/flow dans notre surface.
- **garde-fou défensif**: analyse read-only de trafic autorisé, jamais d'interception live de systèmes tiers (§5); remédiation = guidance owner-scoped.
- **chemin library**: `packages/skills/library/analyzing-network-traffic-for-incidents/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` NIST-CSF/MITRE-ATTACK préservé + Prompt Defense Baseline; 7 sections §12 défensives; le filtre awk d'IP source = analyse bénigne, pas un payload; 0 secret, 0 sdk, 0 cash).

## analyzing-security-logs-with-splunk
- **décision**: adapt
- **raison**: investigation d'incident Splunk/SPL sur index autorisés — scoping index/sourcetype/time, corrélation multi-sources (Windows event/firewall/proxy/auth) via `stats`/`transaction`/`join`, reconstruction de timeline, hunting TTP/IoC (brute-force T1110, pass-the-hash T1550.002, RDP T1021.001, PowerShell T1059.001, LSASS T1003.001). Porte des tags AI-security (MITRE ATLAS + NIST-AI-RMF + D3FEND) → prioritaire pour la doctrine sécurité-agent de `mas-sec-reviewer`.
- **dedup**: non — aucune capacité d'investigation SIEM/SPL dans notre surface; complète §5 et la lentille agent-security.
- **garde-fou défensif**: investigation read-only sur données autorisées, SPL non-destructif (pas de `| delete`); remédiation = guidance owner-scoped.
- **chemin library**: `packages/skills/library/analyzing-security-logs-with-splunk/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` NIST-CSF/MITRE-ATTACK/MITRE-ATLAS/NIST-AI-RMF/D3FEND préservé + Prompt Defense Baseline; 7 sections §12 défensives; 0 secret, 0 sdk, 0 cash).

## building-incident-response-playbook
- **décision**: adapt
- **raison**: conception de playbook IR réutilisable pour UN type d'incident — phases NIST SP 800-61r3 / SANS PICERL, arbres de décision, critères d'escalade, matrice RACI (IC/SOC/sysadmin/legal/comms), points d'intégration SOAR. Mappé ATT&CK (ransomware T1486, phishing T1566, exploit T1190, exfil T1041, valid-accounts T1078). Doc de gouvernance qui informe `mas-sec-reviewer` + §5.
- **dedup**: non — aucun gabarit de playbook IR dans notre surface; complète la doctrine §5 (gating risque).
- **garde-fou défensif (§5)**: les étapes SOAR risquées (isolation, révocation de clés, suppression) gardent une gate humaine; `risk:high|blocking` met toujours en pause — explicite dans Principles + Red Flags.
- **chemin library**: `packages/skills/library/building-incident-response-playbook/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` NIST-CSF/MITRE-ATTACK préservé + Prompt Defense Baseline; 7 sections §12 défensives; 0 secret, 0 sdk, 0 cash).

## building-incident-timeline-with-timesketch
- **décision**: adapt
- **raison**: timeline forensique collaborative via Timesketch (Google, open-source) — déploiement Docker, ingestion multi-sources (Plaso/log2timeline pour artefacts disk-image winevtx/prefetch/amcache/shimcache/userassist, + CSV/JSONL + analyzers Sigma) dans un sketch unifié OpenSearch, puis tagging/annotation/story de la chaîne d'attaque. Mappé ATT&CK + D3FEND. Nourrit la reconstruction d'incident pour `mas-sec-reviewer` + §5.
- **dedup**: non — aucune capacité de timeline forensique dans notre surface; distinct de l'analyse réseau/host point-à-point (ici = corrélation multi-sources normalisée).
- **garde-fou défensif**: données de cas autorisées uniquement, jamais d'acquisition de preuves tierces par MAOS (§5); remédiation = guidance owner-scoped.
- **sanitize**: la source portait un placeholder `password="password"` (config d'exemple) → NON porté; remplacé par règle "secrets via environment/secret store, jamais de littéral" (Principles + Red Flags).
- **chemin library**: `packages/skills/library/building-incident-timeline-with-timesketch/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` NIST-CSF/MITRE-ATTACK/D3FEND préservé + Prompt Defense Baseline; 7 sections §12 défensives; 0 secret réel, 0 sdk, 0 cash).

## building-malware-incident-communication-template
- **décision**: adapt
- **raison**: gabarits de communication structurés pour incident malware — classification de sévérité (P1 ransomware/wiper → P4 endpoint isolé) pilotant timelines + audiences, sélection de canaux (out-of-band/chiffré pour critique), templates prêts (notification interne, briefing exécutif, advisory technique, notice client, divulgation réglementaire) adaptés par type (ransomware/wiper/trojan/worm). Mappé ATT&CK. Artefact gouvernance/comms qui informe le process IR.
- **dedup**: non — aucun gabarit de comms d'incident dans notre surface; complète le playbook IR (DS#4) côté communication.
- **garde-fou défensif (§5)**: skill = RÉDIGER les templates, PAS les envoyer. Tout envoi sortant = `risk:high|blocking` (catégorie message/outbound §5) → gate humaine systématique; notices externes = revue légale d'abord. Explicite dans Principles + Red Flags.
- **recadrage §11**: la source mettait des estimations d'impact $ dans le briefing exécutif → reframé en impact qualitatif/opérationnel, jamais de chiffre cash.
- **chemin library**: `packages/skills/library/building-malware-incident-communication-template/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` NIST-CSF/MITRE-ATTACK préservé + Prompt Defense Baseline; 7 sections §12 défensives; 0 secret, 0 sdk, 0 cash).

## collecting-indicators-of-compromise
- **décision**: adapt
- **raison**: collecte systématique d'IoC sur preuves d'incident autorisées — extraction+catégorisation réseau (IPs/domaines/URLs), host (hashes/chemins/clés registre/services), email (sender/subject/attachment) et comportementaux ; enrichissement threat-intel ; représentation STIX 2.1 + gestion/partage MISP/OpenCTI/TAXII (ISACs/partenaires). Mappé ATT&CK. Enrichit le contexte threat/memory + nourrit `mas-sec-reviewer` + §5.
- **dedup**: non — aucune capacité de collecte/normalisation d'IoC dans notre surface; alimente la mémoire-threat (angle distinct du log-analysis).
- **garde-fou défensif (§5)**: collecte read-only sur preuves possédées (pas d'acquisition tierce); lookups d'enrichissement = sortants → respect `allowed_hosts`; partage = action gated sous accord/TLP. Explicite dans Principles + Red Flags.
- **chemin library**: `packages/skills/library/collecting-indicators-of-compromise/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` NIST-CSF/MITRE-ATTACK préservé + Prompt Defense Baseline; 7 sections §12 défensives; 0 secret, 0 sdk, 0 cash).

## collecting-volatile-evidence-from-compromised-host
- **décision**: adapt
- **raison**: collecte de preuves volatiles sur hôte compromis autorisé, dans l'ordre de volatilité — RAM (WinPmem/LiME), connexions réseau, processus, état système, AVANT isolation/shutdown ; outils de confiance depuis média externe (jamais d'install sur l'hôte), hashing+chain-of-custody. Mappé ATT&CK (T1003.001 LSASS, T1057 process, T1049 réseau, T1543.003 services). Nourrit la reconstruction d'incident pour `mas-sec-reviewer` + §5.
- **dedup**: non — aucune capacité de collecte forensique host dans notre surface; distinct du log-analysis (capture live state vs lecture de logs).
- **garde-fou défensif (§5)**: collecte owner-scoped avec autorisation légale/HR explicite; MAOS ne collecte pas sur un système non-autorisé; isolation/remédiation = action du propriétaire après collecte. Explicite dans Principles + Red Flags.
- **chemin library**: `packages/skills/library/collecting-volatile-evidence-from-compromised-host/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` NIST-CSF/MITRE-ATTACK préservé + Prompt Defense Baseline; 7 sections §12 défensives; 0 secret, 0 sdk, 0 cash).

## conducting-cloud-incident-response
- **décision**: adapt
- **raison**: réponse à incident cloud sur comptes administrés (AWS/Azure/GCP) — confirmation via logs natifs (CloudTrail/Azure Activity/GCP Audit : login suspect, `CreateAccessKey`, bucket public, `StopLogging`/`DeleteTrail` évasion), containment identity-first (disable keys, deny-all, revoke sessions, isolation), préservation de preuves dans un compte forensique isolé. Mappé ATT&CK (T1078/T1537/T1580/T1525). Nourrit `mas-sec-reviewer` + §5.
- **dedup**: non — aucune capacité IR cloud dans notre surface; recoupe la lentille cloud-security mais angle = réponse/containment, pas posture statique.
- **garde-fou défensif (§5)**: les commandes de containment (désactivation clés IAM, deny-all, isolation d'instance) = GUIDANCE pour le propriétaire du compte; MAOS n'exécute aucune action cloud mutante contre un compte tiers. Préserver avant de détruire (snapshot d'abord). Explicite dans Principles + Red Flags.
- **recadrage §11**: la source chiffrait l'impact en `$2,974` (egress/compute non-autorisé) → reframé en impact opérationnel/quota, jamais de cash.
- **chemin library**: `packages/skills/library/conducting-cloud-incident-response/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` NIST-CSF/MITRE-ATTACK préservé + Prompt Defense Baseline; 7 sections §12 défensives; clés/ARN d'exemple = placeholders, 0 secret réel, 0 sdk, 0 cash).

---

### Récap
- 9/9 keepers (tous `adapt`). 0 reject. Lot 100% défensif (blue-team incident-response).
- Garde-fou défensif appliqué partout: lentille analyse-de-logs + collecte-de-preuves + playbook + comms + IR-cloud gardée; aucune action mutante sortante de MAOS vers un système tiers. Containment (cloud : disable keys/deny-all/isolation ; host : isolation/shutdown) reframé en GUIDANCE owner-scoped, jamais exécuté par MAOS (§5). Collecte de preuves volatiles = order-of-volatility read-only sur hôte autorisé. Envoi de notifications d'incident = `risk:high|blocking` gated.
- Frameworks préservés dans la metadata (champ `frameworks`): NIST-CSF (RS.MA/RS.AN/RC.RP) + MITRE-ATTACK sur les 9; `analyzing-security-logs-with-splunk` ajoute MITRE-ATLAS + NIST-AI-RMF + D3FEND; `building-incident-timeline-with-timesketch` ajoute D3FEND. Les tags ATLAS/AI-RMF (Splunk) = signal AI-security prioritaire pour la doctrine sécurité-agent de `mas-sec-reviewer`.
- Aucun renommage: les 9 slugs library = slugs sources.
- Sanitize: 3 recadrages mineurs — (1) placeholder `password="password"` (timesketch) non porté → règle secrets-via-env; (2) impact `$2,974` (cloud-IR) reframé sans cash §11; (3) commandes mutantes (IAM/isolation) reframées en guidance owner-scoped §5. 0 `@anthropic-ai/sdk`, 0 secret réel, 0 PII dans les 9 outputs.
- Tous nourrissent `mas-sec-reviewer` + la lentille §5 (réponse à incident, manipulation de preuves, IoC, gating cross-projet/outbound).

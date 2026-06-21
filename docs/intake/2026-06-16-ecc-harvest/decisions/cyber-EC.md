# ECC Harvest — décisions cluster `cyber:security-operations` (lot EC)

Doer: lot EC (7 skills). Worktree `maos-ecc`. Méthode: intake-audit barre LARGE (T1, library).
Source cyber: `mukul975/Anthropic-Cybersecurity-Skills` (Apache-2.0). Cible: `packages/skills/library/<slug>/SKILL.md`.
Dedup contre `our-assets-index.md` + recoupe `mas-sec-reviewer` / CLAUDE.md §5 (détection intrusion, forensique, beaconing C2, garde-fou réseau `allowed_hosts`).
Nature du lot: skills **DÉFENSIFS** (blue-team secops) — analyse de logs (API GW, Azure, PowerShell, web-server),
forensique mémoire Linux (LiME/Volatility), monitoring CT logs anti-phishing, détection beaconing C2 (Zeek).
Le frontmatter source porte `subdomain: security-operations` + `frameworks` NIST-CSF/MITRE-ATTACK (et MITRE-ATLAS
pour `analyzing-tls-certificate-transparency-logs`) : mappings préservés dans la metadata MAS.
Garde-fou défensif appliqué à chaque skill : lentille détection+investigation+forensique gardée, read-only sur
données/systèmes possédés et autorisés ; aucune action mutante/offensive sortante depuis MAOS (§5).
Sanitize: 0 secret réel, 0 PII, 0 `@anthropic-ai/sdk` dans les 7 sources (placeholders type `WORKSPACE_ID`/
`example.com` uniquement). Recadrage transverse §11 : tout chiffre = quota d'abonnement, jamais $/€ (les sources
n'utilisaient pas de cash, recadrage léger).

---

## analyzing-api-gateway-access-logs
- **décision**: adapt
- **raison**: chasse défensive d'abus API sur logs gateway autorisés (AWS API GW/Kong/Nginx) — BOLA/IDOR (énumération de resource-IDs par principal), bypass rate-limit par tampering de headers de forwarding, credential scanning (surges 401 mono-source), injection SQL/NoSQL en query-params, méthodes write sur endpoints read-only. Détection = agrégations pandas group-by + seuils d'anomalie. Nourrit la lentille posture-API de `mas-sec-reviewer` + §5.
- **dedup**: non — `mas-sec-reviewer` est une gate générique §5; aucun skill d'analyse de logs API-gateway dans notre surface. Angle distinct = abus dans les logs edge, pas autorisation per-task.
- **garde-fou défensif (§5)**: le Python source parse des logs hors-ligne (détecteur read-only), pas un client d'attaque; explicité offline/owner-scoped. Bypass de header reconcilié vs identité client réelle, jamais probing actif d'un tiers.
- **chemin library**: `packages/skills/library/analyzing-api-gateway-access-logs/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` NIST-CSF/MITRE-ATTACK préservé + Prompt Defense Baseline; 7 sections §12 défensives; 0 secret, 0 sdk, 0 chiffre cash).

## analyzing-azure-activity-logs-for-threats
- **décision**: adapt
- **raison**: threat hunting défensif sur logs de tenant Azure autorisés (Azure Monitor activity + Entra sign-in/audit) — escalade de privilège (role-assignment WRITE, grants Global Admin), sign-ins impossible-travel/new-IP, modifs resource-group/subscription, accès Key Vault depuis IP nouvelle, changements NSG, tampering conditional-access. Détection = KQL sur Log Analytics via azure-monitor-query. Nourrit la lentille IAM/secrets de `mas-sec-reviewer` + §5.
- **dedup**: non — aucun skill cloud-SIEM/KQL Azure dans notre surface; angle distinct = abus control-plane/identité dans un tenant, pas autorisation per-task.
- **garde-fou défensif (§5)**: requêtes read-only sur workspace autorisé; révocation de rôle/isolation = remediation owner, jamais une action MAOS. IDs tenant/workspace + credentials = placeholders, jamais exposés en sortie.
- **chemin library**: `packages/skills/library/analyzing-azure-activity-logs-for-threats/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` NIST-CSF/MITRE-ATTACK préservé + Prompt Defense Baseline; 7 sections §12 défensives; placeholder `WORKSPACE_ID` only, 0 secret réel, 0 sdk, 0 cash).

## analyzing-memory-forensics-with-lime-and-volatility
- **décision**: adapt
- **raison**: forensique mémoire Linux défensive en IR sur hôte autorisé — acquisition LiME (module kernel, format lime/raw) puis analyse Volatility 3: linux.pslist vs linux.psscan (processus cachés), linux.bash (historique), linux.sockstat (connexions), linux.lsmod (rootkits), linux.malfind (code injecté). Détecte injection de processus, dump de creds, rootkits d'évasion. Nourrit la lentille IR de `mas-sec-reviewer` + §5.
- **dedup**: non — aucun skill forensique mémoire dans notre surface; angle distinct = preuve volatile RAM, pas autorisation per-task ni forensique disque.
- **garde-fou défensif (§5)**: analyse read-only d'une image issue d'un hôte autorisé; containment/réimage = remediation owner, jamais une action MAOS. Secrets/historique récupérés = confidentiels, jamais exposés. Ordre de volatilité (acquérir avant reboot) imposé.
- **chemin library**: `packages/skills/library/analyzing-memory-forensics-with-lime-and-volatility/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` NIST-CSF/MITRE-ATTACK préservé + Prompt Defense Baseline; 7 sections §12 défensives; 0 secret, 0 sdk, 0 cash).

## analyzing-powershell-script-block-logging
- **décision**: adapt
- **raison**: forensique PowerShell défensive sur EVTX autorisés (Event ID 4104) — reconstruction de scripts multi-blocs (ScriptBlockId ordonné par MessageNumber), détection Base64/-EncodedCommand, download cradles, AMSI-bypass, obfuscation (entropie Shannon, tick-marks, concaténation). Décodage UTF-16LE pour analyse statique uniquement. Nourrit la lentille endpoint de `mas-sec-reviewer` + §5.
- **dedup**: non — aucun skill d'analyse de logs PowerShell/LOLBin dans notre surface; angle distinct = abus PowerShell dans la télémétrie endpoint.
- **garde-fou défensif (§5)**: analyse read-only des logs possédés; payloads décodés = preuve inerte, JAMAIS exécutés; le skill analyse, n'écrit/n'exécute aucun PowerShell offensif. Quarantaine hôte/disable account = remediation owner.
- **chemin library**: `packages/skills/library/analyzing-powershell-script-block-logging/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` NIST-CSF/MITRE-ATTACK préservé + Prompt Defense Baseline; 7 sections §12 défensives; 0 secret, 0 sdk, 0 cash).

## analyzing-tls-certificate-transparency-logs
- **décision**: adapt
- **raison**: détection proactive phishing/usurpation de marque via CT logs (crt.sh/pycrtsh) — typosquatting/lookalikes (distance Levenshtein + homoglyphes), émission non autorisée pour domaines possédés, CA inattendues, wildcards sur sous-domaines suspects, cross-ref infra phishing connue. Porte des tags AI-security (MITRE ATLAS AML.T0073/T0052) → prioritaire pour la doctrine sécurité-agent. Nourrit la lentille phishing/réseau de `mas-sec-reviewer` + §5.
- **dedup**: non — aucun skill CT-log/anti-phishing dans notre surface; angle distinct = early-warning sur infra attaquant publique, pas autorisation per-task ni PKI ops.
- **garde-fou défensif (§5)**: OSINT read-only sur données CT publiques; enregistrement défensif/takedown/visite du domaine lookalike = action owner/légale, JAMAIS une action MAOS; aucune prise de contact avec l'infra attaquant.
- **chemin library**: `packages/skills/library/analyzing-tls-certificate-transparency-logs/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` NIST-CSF/MITRE-ATTACK/MITRE-ATLAS préservé + Prompt Defense Baseline; 7 sections §12 défensives; placeholder `example.com` only, 0 secret, 0 sdk, 0 cash).

## analyzing-web-server-logs-for-intrusion
- **décision**: adapt
- **raison**: chasse intrusion web défensive sur logs Apache/Nginx autorisés — SQLi (UNION SELECT/OR 1=1/hex), LFI/path-traversal (../, /etc/passwd, php://filter), XSS, fingerprints scanners (nikto/sqlmap/dirbuster/gobuster/wfuzz), brute-force login (rate per source), via regex signatures OWASP + enrichissement GeoIP + anomalies fréquence/response-size. Nourrit la lentille web-app-security de `mas-sec-reviewer` + §5.
- **dedup**: non — aucun skill d'analyse de logs web-server dans notre surface; angle distinct = intrusion app-layer dans les logs, pas autorisation per-task.
- **garde-fou défensif (§5)**: parse de logs hors-ligne (détecteur read-only); blocage source/WAF tuning/scan actif du site = remediation owner ou interdit, jamais une action MAOS. Probe vs breach distingué par status/taille.
- **chemin library**: `packages/skills/library/analyzing-web-server-logs-for-intrusion/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` NIST-CSF/MITRE-ATTACK préservé + Prompt Defense Baseline; 7 sections §12 défensives; 0 secret, 0 sdk, 0 cash).

## detecting-beaconing-patterns-with-zeek
- **décision**: adapt
- **raison**: chasse beaconing C2 défensive sur Zeek conn.log autorisé — ZAT LogToDataFrame → pandas, group-by paire (id.orig_h, id.resp_h), stats inter-arrival (écart-type, coefficient de variation), flag des callbacks périodiques low-jitter. Détecte le C2 même chiffré, par le timing seul (T1573/T1071). Nourrit la lentille réseau/`allowed_hosts` de `mas-sec-reviewer` + §5.
- **dedup**: non — recoupe `analyzing-dns-logs-for-exfiltration` (réseau) mais angle distinct = régularité temporelle des connexions conn.log, pas tunneling DNS. Aucun skill de détection beaconing dans notre surface.
- **garde-fou défensif (§5)**: analyse read-only de logs réseau possédés; blocage destination/isolation host = remediation owner, jamais une action MAOS; le C2 suspecté n'est jamais contacté/probé. CV (normalisé par moyenne) imposé vs std-dev brut.
- **chemin library**: `packages/skills/library/detecting-beaconing-patterns-with-zeek/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` NIST-CSF/MITRE-ATTACK préservé + Prompt Defense Baseline; 7 sections §12 défensives; 0 secret, 0 sdk, 0 cash).

---

### Récap
- 7/7 keepers (tous `adapt`). 0 reject. Lot 100% défensif (blue-team secops).
- Garde-fou défensif appliqué partout: lentille détection+investigation+forensique gardée, read-only sur
  données/systèmes possédés et autorisés; tout angle mutant/offensif strippé — blocage de source, WAF tuning,
  scan actif, takedown de domaine, containment/réimage, exécution de payload décodé = remediation owner ou
  interdit (§5), jamais une action MAOS sortante. Payloads PowerShell décodés = preuve inerte jamais exécutée;
  lookalikes CT jamais contactés; C2 Zeek jamais probé.
- Frameworks préservés dans la metadata: NIST-CSF + MITRE-ATTACK sur les 7;
  `analyzing-tls-certificate-transparency-logs` ajoute MITRE-ATLAS (AML.T0073/T0052 — signal AI-security/phishing
  → prioritaire pour la doctrine sécurité-agent de `mas-sec-reviewer`).
- Tous nourrissent `mas-sec-reviewer` + la lentille §5 (posture API, IAM/secrets, IR, endpoint, web-app-security,
  phishing, réseau/`allowed_hosts`).
- Recadrage §11 transverse: 0 chiffre cash (les sources n'en avaient pas), tuning = quota d'abonnement.
- Garde-fous techniques: 0 `@anthropic-ai/sdk`, 0 secret réel/PII dans les 7 outputs (placeholders
  `WORKSPACE_ID`/`example.com` uniquement).


# ECC Harvest — décisions cluster `cyber:network-security` (lot EX)

Doer: lot EX (8 skills). Worktree `maos-ecc`, branche `phase/ecc-harvest`. Méthode: intake-audit, barre T1 (défense → nourrit `mas-sec-reviewer` + CLAUDE.md §5), cible `packages/skills/library/<slug>/SKILL.md`.
Source: `mukul975/Anthropic-Cybersecurity-Skills` (clone read-only, Apache-2.0). Recadrage transverse: MAOS = abonnement (§11), AUCUN coût per-token PAYG ; tout chiffre = unités de quota, jamais €/$. Defensive-only : ces skills sont tous des **détecteurs** (C2/DNS, exfil-DNS, lateral-movement, anomalies réseau, scan/port-scan). Aucun n'est offensif → aucun KILL « weaponization » déclenché.
Sanitize (regex secrets/PII/`@anthropic-ai/sdk`): 8/8 sources clean. Les rares `${ES_PASSWORD}` / webhook Slack `XXXX/YYYY/ZZZZ` des corps sources sont des **placeholders templatés** (aucun secret réel) ; non repris verbatim — corps reboostés.
Garde-fou §5 spécifique à ce lot : tout ce qui **agit** (fail2ban auto-ban, RPZ/blocklist, isolation EDR/VLAN, iptables DROP, désactivation de compte) est une action à risque `high`/`blocking` → gate humain obligatoire. Les skills restent côté **détection + proposition** ; l'exécution d'une réponse passe par la mission lifecycle + `mas-sec-reviewer`.

FOLDS enregistrés (cf. brief : DNS-exfil ×2 et lateral-movement ×2, garder si delta distinct, sinon FOLD) :
- `detecting-exfiltration-over-dns-with-zeek` → **FOLD** dans `detecting-dns-exfiltration-with-dns-query-analysis` (même méthode : entropie Shannon + longueur sous-domaine + volume + abus TXT ; mêmes indicateurs, mêmes seuils ; la query-analysis couvre déjà le parsing Zeek `dns.log`. Le « zeek-only » n'apporte qu'un sous-ensemble TSV, pas de delta).
- `detecting-lateral-movement-with-zeek` → **FOLD** dans `detecting-lateral-movement-in-network` (l'in-network est strictement plus large : logs Windows 4624/4625/7045 + Sigma + Zeek conn/smb/dce_rpc/kerberos + SOAR. Le « zeek-only » ajoute surtout un script NTLM-spray ; absorbé comme note dans le keeper).

Bilan: **6 keepers / 2 folds** sur 8.

---

## detecting-command-and-control-over-dns
- **décision**: adapt (keeper T1)
- **raison**: détecteur défensif riche de C2/DGA sur DNS — fusion pondérée de 5 détecteurs (entropie Shannon, beaconing par régularité d'intervalle, classification DGA features-puis-ML, analyse payload TXT base64/PE/PowerShell, signatures Iodine/dnscat2/Cobalt). Cœur garde-fou réseau §5 (allowed_hosts/DNS) + nourrit la détection comportementale `mas-sec-reviewer`.
- **dedup**: aucune collision (corpus cybersec disjoint des 270 ECC, cf. cybersec-clusters.md). Distinct des skills exfil (canal de commande C2 + DGA, pas extraction de données).
- **3 coûts**: install = boost §12 1 fichier ; maintenance = signatures d'outils à rafraîchir (re-audit si seuils datés) ; removal = réversible (1 dossier lib).
- **scores (0-5)**: project_fit 4 · token_efficiency 4 (L1 dense, ML décrit pas chargé) · safety 5 (détection seule, réponse §5-gated) · implementation_effort 4 · evidence_maturity 4 · user_value 4 · phase_compatibility 5.
- **KILL**: aucun déclenché — defensive-only, pas de PAYG, pas d'exécution de code tiers. Réponse block/RPZ/EDR explicitement renvoyée au gate §5 + `mas-sec-reviewer`.
- **chemin library**: `packages/skills/library/detecting-command-and-control-over-dns/SKILL.md`
- **état**: boosté conforme (ligne 1 `---`, commentaire source, summary L1, metadata+frameworks{nist_csf,mitre_attack} préservés, Prompt Defense Baseline verbatim, 7 sections §12, 0 sdk, 0 secret). Recadrage $→quota appliqué. Re-audit: si signatures d'outils >12 mois obsolètes.

## detecting-dns-exfiltration-with-dns-query-analysis
- **décision**: adapt (keeper T1, réceptacle du fold exfil)
- **raison**: détecteur défensif d'exfiltration DNS — scoring per-domaine (longueur sous-domaine, entropie Shannon, ratio unique, ratio TXT/NULL, volume, encodage base64/hex) composité 0-100, multi-input (Zeek dns.log TSV + Suricata EVE + PCAP), avec règles Suricata + SPL déployables.
- **dedup/fold**: **absorbe `detecting-exfiltration-over-dns-with-zeek`** — même méthode (entropie+longueur+volume), le path Zeek dns.log est déjà un input ici ; le « zeek-only » n'apportait qu'un sous-ensemble TSV. Distinct du C2-over-dns (exfil de données vs canal de commande/DGA).
- **3 coûts**: install = 1 fichier boosté ; maintenance = re-baseline par environnement (seuils) ; removal = réversible.
- **scores (0-5)**: project_fit 4 · token_efficiency 4 · safety 5 (détection, réponse §5-gated) · implementation_effort 4 · evidence_maturity 4 · user_value 4 · phase_compatibility 5.
- **KILL**: aucun — defensive-only, pas de PAYG. Block/RPZ/isolation renvoyés au §5 + capture PCAP avant containment.
- **chemin library**: `packages/skills/library/detecting-dns-exfiltration-with-dns-query-analysis/SKILL.md`
- **état**: boosté conforme (ligne 1 `---`, commentaire source + commentaire fold, summary L1, metadata+frameworks{nist_csf,mitre_attack} préservés, Prompt Defense Baseline verbatim, 7 sections §12, 0 sdk, 0 secret). Recadrage $→quota. Re-audit: non sauf nouvel outil de tunnel majeur.

## detecting-exfiltration-over-dns-with-zeek
- **décision**: reject (FOLD)
- **raison**: variante Zeek-only de la détection d'exfil DNS — mêmes indicateurs (entropie Shannon >4.0, labels >52 chars, >50 sous-domaines uniques/domaine, volume), sur dns.log TSV uniquement. Aucun delta distinct vs query-analysis, qui couvre déjà le parsing Zeek dns.log comme input de premier rang.
- **dedup/fold**: **FOLD dans `detecting-dns-exfiltration-with-dns-query-analysis`** (commentaire fold ajouté dans le keeper).
- **chemin library**: aucun (folded).
- **état**: rejeté-fold. KILL: dup-no-better (même méthode, input plus pauvre). Re-audit: non.

## detecting-lateral-movement-in-network
- **décision**: adapt (keeper T1, réceptacle du fold lateral)
- **raison**: détecteur défensif de lateral movement (TA0008) — corrèle logs Windows Security (4624/4625/4648/7045/4769) + Zeek (conn/smb_mapping/dce_rpc/ntlm/kerberos) + règles Sigma portables ; signal = un compte/host qui éventaille vers N hôtes internes en fenêtre courte, puis traçage de la chaîne complète. Cœur garde-fou cross-host §5 + `mas-sec-reviewer`.
- **dedup/fold**: **absorbe `detecting-lateral-movement-with-zeek`** — l'in-network est strictement plus large (endpoint+réseau+Sigma+SOAR) ; le zeek-only n'ajoute qu'un script NTLM-spray + le path réseau-only, absorbés ici comme inputs. Distinct des autres skills du lot.
- **3 coûts**: install = 1 fichier boosté ; maintenance = re-baseline east-west + maj règles Sigma ; removal = réversible.
- **scores (0-5)**: project_fit 4 · token_efficiency 4 · safety 5 (détection, containment §5-gated) · implementation_effort 4 · evidence_maturity 4 · user_value 4 · phase_compatibility 5.
- **KILL**: aucun — defensive-only, pas de PAYG. Isolation/quarantine/disable/DROP renvoyés au §5 + collecte forensique avant containment. Note: réseau-only = partiel, à coupler EDR (non-substitut).
- **chemin library**: `packages/skills/library/detecting-lateral-movement-in-network/SKILL.md`
- **état**: boosté conforme (ligne 1 `---`, commentaire source + commentaire fold, summary L1, metadata+frameworks{nist_csf,mitre_attack,d3fend_techniques} préservés, Prompt Defense Baseline verbatim, 7 sections §12, 0 sdk, 0 secret). Recadrage $→quota. Re-audit: maj TTP lateral.

## detecting-lateral-movement-with-zeek
- **décision**: reject (FOLD)
- **raison**: variante Zeek-only — parse conn/smb_mapping/smb_files/dce_rpc/ntlm/kerberos pour SMB admin-share, DCE/RPC remote-exec, NTLM account-spray (script SumStats), anomalies Kerberos. L'in-network couvre déjà toute cette section Zeek ; le seul vrai apport (script NTLM-spray + framing réseau-only) est mince.
- **dedup/fold**: **FOLD dans `detecting-lateral-movement-in-network`** (commentaire fold + path réseau-only absorbés dans le keeper).
- **chemin library**: aucun (folded).
- **état**: rejeté-fold. KILL: dup-no-better (sous-ensemble Zeek-only du keeper). Re-audit: non.

## detecting-network-anomalies-with-zeek
- **décision**: adapt (keeper T1)
- **raison**: skill plateforme défensive — déploiement/config Zeek passif (SPAN/tap, offload off, networks.cfg) + authoring de scripts de détection event-driven (Notice/SumStats : DNS-tunnel, beaconing, SSH brute-force, certs invalides) + threat-hunting metadata + intégration SIEM JSON/Filebeat. Couche de visibilité réseau générale nourrissant §5.
- **dedup**: distinct des détecteurs ciblés du lot (c'est le socle plateforme/scripting, pas un détecteur mono-technique). Pas de collision corpus.
- **3 coûts**: install = 1 fichier boosté ; maintenance = tuning seuils + exclusions CDN/update ; removal = réversible.
- **scores (0-5)**: project_fit 4 · token_efficiency 4 · safety 5 (passif par design, réponse §5-gated) · implementation_effort 4 · evidence_maturity 4 · user_value 4 · phase_compatibility 5.
- **KILL**: aucun — passif (logs, pas de blocage), pas de PAYG. Enforcement renvoyé au §5 + `mas-sec-reviewer`. Non-substitut IPS/EDR.
- **chemin library**: `packages/skills/library/detecting-network-anomalies-with-zeek/SKILL.md`
- **état**: boosté conforme (ligne 1 `---`, commentaire source, summary L1, metadata+frameworks{nist_csf,mitre_attack} préservés, Prompt Defense Baseline verbatim, 7 sections §12, 0 sdk, 0 secret). Recadrage $→quota. Re-audit: maj majeure Zeek (>6.x).

## detecting-network-scanning-with-ids-signatures
- **décision**: adapt (keeper T1)
- **raison**: détecteur défensif de recon/port-scan via signatures Suricata/Snort — règles threshold par type de scan (SYN/FIN/Xmas/NULL/ACK/UDP, Nmap OS-fingerprint+NSE, Masscan, scans internes), threshold.config (suppress scanners autorisés + rate-limit) + corrélateur Python en campagnes par source. Early-warning §5.
- **dedup**: distinct du fail2ban (signatures IDS réseau vs réponse host-based fail2ban) et du Zeek-anomalies (signature-based ciblé scan vs plateforme metadata). Pas de collision corpus.
- **3 coûts**: install = 1 fichier boosté ; maintenance = tuning seuils par taille réseau + maj ruleset ET ; removal = réversible.
- **scores (0-5)**: project_fit 4 · token_efficiency 4 · safety 5 (détection seule, enforcement §5-gated) · implementation_effort 4 · evidence_maturity 4 · user_value 4 · phase_compatibility 5.
- **KILL**: aucun — defensive-only, pas de PAYG. Block firewall/isolation renvoyés au §5 + `mas-sec-reviewer`.
- **chemin library**: `packages/skills/library/detecting-network-scanning-with-ids-signatures/SKILL.md`
- **état**: boosté conforme (ligne 1 `---`, commentaire source, summary L1, metadata+frameworks{nist_csf,mitre_attack} préservés, Prompt Defense Baseline verbatim, 7 sections §12, 0 sdk, 0 secret). Recadrage $→quota. Re-audit: maj majeure Suricata/Snort.

## detecting-port-scanning-with-fail2ban
- **décision**: adapt (keeper T1 — avec caveat §5 renforcé)
- **raison**: défense host-based — Fail2ban filtres/jails custom (portscan via iptables `recent`, nmap-scan, http-scan /wp-admin/.env, sshd, recidive) + auto-ban. Couche defense-in-depth sous l'IDS réseau. **Particularité**: contrairement aux autres skills (détection seule), Fail2ban **exécute** un iptables DROP automatiquement.
- **dedup**: distinct du scanning-ids (réponse host-based fail2ban vs signatures IDS réseau). Pas de collision corpus.
- **3 coûts**: install = 1 fichier boosté ; maintenance = tuning maxretry/findtime + entretien ignoreip ; removal = réversible.
- **scores (0-5)**: project_fit 4 · token_efficiency 4 · safety 4 (l'action ban est active → caveat §5, d'où -1 vs détecteurs purs) · implementation_effort 4 · evidence_maturity 4 · user_value 4 · phase_compatibility 5.
- **KILL**: aucun déclenché — pas de PAYG, pas de code tiers. MAIS l'auto-ban (iptables DROP, action sortante/destructive) est cadré comme **action §5 risk:high** sous `mas-sec-reviewer` + gate humain, jamais autopilot silencieux (§4/§5) ; `ignoreip` = interlock de sécurité obligatoire. Caveat porté verbatim dans Overview/Principles/RedFlags/Verification du skill.
- **chemin library**: `packages/skills/library/detecting-port-scanning-with-fail2ban/SKILL.md`
- **état**: boosté conforme (ligne 1 `---`, commentaire source, summary L1, metadata+frameworks{nist_csf,mitre_attack} préservés, Prompt Defense Baseline verbatim, 7 sections §12, 0 sdk, 0 secret). Recadrage $→quota. Re-audit: si jamais l'auto-ban est wiré dans un mode autonomy MAOS (alors déclarer la catégorie dans config/permissions.json).

---

## Bilan lot EX
- **Keepers (6)**: detecting-command-and-control-over-dns · detecting-dns-exfiltration-with-dns-query-analysis · detecting-lateral-movement-in-network · detecting-network-anomalies-with-zeek · detecting-network-scanning-with-ids-signatures · detecting-port-scanning-with-fail2ban.
- **Folds/rejects (2)**: detecting-exfiltration-over-dns-with-zeek → fold dns-exfil ; detecting-lateral-movement-with-zeek → fold lateral-in-network.
- Tous T1 defensive, Apache-2.0, frameworks préservés, recadrés §5/§11 (détection vs réponse gated, quota vs cash). Sanitize 8/8 clean. Aucun KILL weaponization (corpus 100% détection).

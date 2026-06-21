# ECC Harvest — décisions cluster `cyber:threat-hunting` (LOT I)

Doer: LOT I (11 skills source) — lateral-movement / C2-beaconing / network hunting, **tous défensifs**. Worktree `maos-ecc`, branche `phase/ecc-harvest`.
Source: `mukul975/Anthropic-Cybersecurity-Skills` (Apache-2.0), clones read-only sous `/tmp/cybersec-inspect/skills/<slug>/SKILL.md`.
Cible: `packages/skills/library/<lib-slug>/SKILL.md`. Méthode: intake-audit barre LARGE (T1, library), lentille **détection/hunting**.

## Garde-fous transverses (étape 0)

- **§5 (read-only)**: chaque skill *détecte* sur des logs/captures **possédés** ; aucune action réseau active, aucun contact de l'infra suspecte, aucune requête vers le domaine/host suspect. Containment/isolation/blocage/sinkhole/remediation/recovery = guidance **propriétaire**, jamais une action MAOS auto. Réaffirmé dans Principles + Red Flags + Verification de chaque fiche.
- **§11 (abonnement)**: tout coût = unités de quota (§8), jamais $/€. Les sources ne chiffraient pas en cash (telemetry réseau) → recadrage léger, ancré dans summary + Rationalizations + Red Flags.
- **§12**: 8 sections par fiche = `Prompt Defense Baseline` (VERBATIM, copié de `agentic-engineering`) + 7 sections (Overview / When to Use / Principles citant la source / Process / Rationalizations / Red Flags / Verification Criteria). Frontmatter `name` + `description` (`Use…`+`Do NOT…`) + `summary` L1 + `metadata` complet (origin, license, cluster `cyber:threat-hunting`, tier T1, status library, `frameworks` = MITRE ATT&CK IDs + NIST-CSF préservés).
- Sanitize secrets/PII: 11/11 sources clean. `@anthropic-ai/sdk`: absent des sources et des fiches produites.
- **Guardrail défensif**: tous T1 défensifs (détection/chasse). `hunting-for-cobalt-strike-beacons` = DÉTECTION du C2 attaquant → keep défensif, aucun payload armé porté. Snippet d'attaque DCOM = commenté/lab-only dans la source → conservé tel quel (documente quoi détecter), jamais exécuté. **Aucun rejet pur-arme attendu, aucun rencontré** — mais l'audit *pouvait* rejeter (critère: payload offensif exécutable non-défensif). KEEP = 11/11.

## Dedup pour CE lot

- Aucun des 11 lib-slugs n'existe déjà dans `packages/skills/library/`. Des skills adjacents existent (`detecting-beaconing-patterns-with-zeek`, `detecting-command-and-control-over-dns`, `detecting-lateral-movement-in-network`, `performing-dns-tunneling-detection`, `detecting-lateral-movement-with-zeek`) — ils appartiennent à **d'autres lots/Doers** (facettes Zeek/réseau distinctes), hors de mon périmètre ; je ne les touche pas.
- **Famille beaconing (4 skills)** — gardés distincts, **0 fold** :
  - `hunting-for-beaconing-with-frequency-analysis` = **canonique** pour la méthode statistique (CV, jitter, taille-payload). Noté canonique dans son summary + dans les fiches sœurs.
  - `hunting-for-command-and-control-beaconing` = facette **workflow/orchestration** + carte de techniques large (T1572/T1132/T1095/T1568) + lentille réputation DNS. Renvoie explicitement le calcul CV à la fiche canonique (Rationalizations + Process). Chevauchement réel mais valeur ajoutée distincte → keep, pas fold.
  - `hunting-for-cobalt-strike-beacons` = facette **signature CS-spécifique** (cert serial 8BB00EE, JA3/JA3S/JARM, profils malleable, named pipes). Attribution ≠ détection générique → keep.
  - `hunting-for-domain-fronting-c2-traffic` = facette **transport SNI/Host** (T1090.004). Mécanisme distinct → keep.
- **`hunting-for-dcom-lateral-movement` vs `hunting-for-lateral-movement-via-wmi`** — mécanismes distincts (COM/RPC port 135 vs WmiPrvSE provider host), télémétrie et détections différentes → **keep les deux** (consigne du lot respectée), 0 fold. Lien croisé noté dans les deux fiches.

---

## Item par item (11 source slugs)

### 1. detecting-lateral-movement-with-splunk
- **décision**: implement_now (library T1)
- **raison**: chasse SPL TA0008 sur logs Windows possédés — graphes d'authentification source→destination, détection de paires inédites vs baseline, corrélation logon (4624 Type 3/10, 4648) → création de processus. Lentille défensive forte, alimente `mas-sec-reviewer` + §5 (réseau/cross-project).
- **dedup**: non (slug absent ; `detecting-lateral-movement-with-zeek`/`-in-network` = facettes réseau d'autres lots).
- **lib-slug**: `detecting-lateral-movement-with-splunk`
- **KILL testé**: rejet si offensif/exécution de mouvement → non, pure détection read-only. Re-audit: si repo source >6 mois stale.

### 2. hunting-for-dcom-lateral-movement
- **décision**: implement_now (library T1)
- **raison**: chasse DCOM (T1021.003) — abus MMC20.Application / ShellWindows / ShellBrowserWindow, corrélation Sysmon EID 1/3, RPC port 135, WMI-Activity ; Sigma + Splunk/KQL/Zeek + audit surface + durcissement GPO. Riche, défensif.
- **dedup**: non ; distinct de WMI (item 3).
- **lib-slug**: `hunting-for-dcom-lateral-movement`
- **KILL testé**: le snippet d'attaque PowerShell pouvait déclencher un rejet → mais il est **commenté + lab-only** dans la source (documente quoi détecter), conservé tel quel, Red Flag explicite "ne pas exécuter hors lab". Keep. Re-audit: si repo >6 mois stale.

### 3. hunting-for-lateral-movement-via-wmi
- **décision**: implement_now (library T1)
- **raison**: chasse WMI (T1047) — WmiPrvSE.exe parent d'un shell (4688 + Sysmon EID 1), patterns cmd /q /c + redirection admin$, persistance par souscriptions WMI (5857/5860/5861). Défensif, read-only.
- **dedup**: non ; mécanisme distinct du DCOM (item 2), lien croisé noté.
- **lib-slug**: `hunting-for-lateral-movement-via-wmi`
- **KILL testé**: rejet si exécution WMI offensive → non. Re-audit: repo >6 mois.

### 4. hunting-for-cobalt-strike-beacons
- **décision**: implement_now (library T1) — facette **CS-spécifique** de la famille beaconing
- **raison**: DÉTECTION du C2 attaquant le plus répandu : cert serial 8BB00EE, JA3/JA3S/JARM, profils malleable HTTP, jitter, named pipes ; Zeek/Suricata/PCAP offline + score composite. Défensif (chasse le C2 d'un adversaire), aucun payload armé.
- **dedup**: garde distinct (attribution framework ≠ méthode stat générique de l'item 5).
- **lib-slug**: `hunting-for-cobalt-strike-beacons`
- **KILL testé**: rejet si déploiement/opération C2 ou contact du team server → non, détection pure. Re-audit: repo >6 mois.

### 5. hunting-for-beaconing-with-frequency-analysis
- **décision**: implement_now (library T1) — **canonique** méthode statistique beaconing
- **raison**: méthode générique : intervalles par paire, CV<0.20 (≥50 conn, 30s–24h), jitter, filtrage known-good, CV taille-payload, enrichissement WHOIS/CT/passive-DNS/TI, corrélation endpoint (DHCP+Sysmon). Cœur réutilisable.
- **dedup**: gardé distinct ; marqué canonique, les 3 autres facettes y renvoient.
- **lib-slug**: `hunting-for-beaconing-with-frequency-analysis`
- **KILL testé**: rejet si probing actif → non. Re-audit: repo >6 mois.

### 6. hunting-for-command-and-control-beaconing
- **décision**: implement_now (library T1) — facette **workflow** beaconing
- **raison**: workflow end-to-end (hypothèse→collecte→freq→filtrage→réputation→endpoint→confirm) + carte de techniques large (T1071/T1572/T1132/T1095/T1568) + lentille réputation DNS. Chevauche l'item 5 mais valeur ajoutée = breadth multi-transport + confirmation endpoint.
- **dedup**: keep, **pas fold** (consigne lot : garder facettes distinctes). Renvoie le calcul CV à l'item 5 (canonique) dans Process + Rationalizations.
- **lib-slug**: `hunting-for-command-and-control-beaconing`
- **KILL testé**: rejet si dup-no-better pur → non, breadth distincte justifie la conservation. Re-audit: si recoupement jugé excessif au prochain self-audit de cluster → candidate à fold vers item 5.

### 7. hunting-for-domain-fronting-c2-traffic
- **décision**: implement_now (library T1) — facette **SNI/Host** beaconing
- **raison**: détection domain fronting (T1090.004) — mismatch SNI vs Host header en logs proxy/SWG, inspection cert offline (pyOpenSSL), ranges CDN, score sur différentiel de réputation. Mécanisme distinct.
- **dedup**: keep distinct.
- **lib-slug**: `hunting-for-domain-fronting-c2-traffic`
- **note frameworks**: le frontmatter source taggait T1071 générique ; le corps cite T1090.004 (technique correcte). **Les deux préservés** dans `metadata.frameworks.mitre_attack` et signalés dans Overview.
- **KILL testé**: rejet si connexion active au front suspect → non. Re-audit: repo >6 mois.

### 8. hunting-for-dns-tunneling-with-zeek
- **décision**: implement_now (library T1)
- **raison**: chasse DNS tunneling/exfil (T1071.004, T1048.003) sur Zeek dns.log — longueur de requête, entropie Shannon (>3.5 bits/char), cardinalité sous-domaines, skew TXT/NULL/CNAME, volume, timing, corrélation conn.log. Détecte iodine/dnscat2/DNSExfiltrator/DoH/CS-DNS.
- **dedup**: non (slug absent ; `performing-dns-tunneling-detection`/`detecting-command-and-control-over-dns` = autres lots).
- **lib-slug**: `hunting-for-dns-tunneling-with-zeek`
- **KILL testé**: rejet si la chasse résout/contacte le domaine suspect → non, garde-fou "ne pas requêter le domaine" ajouté. Re-audit: repo >6 mois.

### 9. hunting-for-unusual-network-connections
- **décision**: implement_now (library T1) — **point d'entrée généraliste**
- **raison**: chasse hypothèse-driven (boucle hypothèse→sources→queries→analyse→validation→corrélation→report) sur EDR/SIEM/Sysmon ; cibles : ports non-standards (T1571), non-app-layer (T1095), fréquences anormales (C2/exfil/scan/cryptomining). Route vers les facettes dédiées.
- **dedup**: keep ; explicitement positionné comme entrée qui renvoie aux facettes statistique/DNS (items 5/8) plutôt que de les dupliquer.
- **lib-slug**: `hunting-for-unusual-network-connections`
- **KILL testé**: rejet si dup-no-better des facettes → non, rôle d'orchestration/hypothèse distinct. Re-audit: repo >6 mois.

### 10. hunting-for-unusual-service-installations
- **décision**: implement_now (library T1)
- **raison**: chasse installations de services Windows malveillants (T1543.003) — Event ID 7045, chemins binaires suspects (temp/encodé/shell), création par PowerShell, LocalSystem sur chemin inhabituel, baseline. Facette persistance/escalade.
- **dedup**: non (slug absent).
- **lib-slug**: `hunting-for-unusual-service-installations`
- **KILL testé**: rejet si création/modif de service → non, parsing read-only. Re-audit: repo >6 mois.

### 11. analyzing-ransomware-network-indicators
- **décision**: implement_now (library T1)
- **raison**: analyse empreinte réseau pré-chiffrement ransomware sur Zeek conn.log/NetFlow — beaconing (intervalle/CV), nœuds TOR de sortie, flux d'exfil (ratio outbound), DNS DGA/entropie ; score composite + mapping ATT&CK (T1071.001/T1573/T1048/T1567.002/T1486). Fenêtre d'action avant T1486.
- **dedup**: non (slug absent ; `analyzing-ransomware-payment-wallets`/playbooks ransomware = facettes paiement/IR d'autres lots).
- **lib-slug**: `analyzing-ransomware-network-indicators`
- **KILL testé**: rejet si opération ransomware ou contact infra → non, analyse read-only. Re-audit: repo >6 mois ; liste TOR/IOC à rafraîchir (Red Flag intégré).

---

## Bilan LOT I

- **11/11 KEEP** (implement_now, library T1). 0 reject, 0 fold, 0 backlog, 0 watch.
- **0 collision** avec la library existante (11 lib-slugs neufs). Facettes adjacentes laissées aux autres lots.
- Famille beaconing : 4 facettes distinctes, canonique = `hunting-for-beaconing-with-frequency-analysis`, candidate-fold notée (item 6 → item 5) au prochain self-audit de cluster si recoupement jugé excessif.
- Garde-fous §5/§11/§12 appliqués sur chaque fiche ; snippet d'attaque DCOM gardé commenté/lab-only.
- Re-audit cluster: si le repo source `mukul975/Anthropic-Cybersecurity-Skills` dépasse 6 mois sans maj, ou au prochain phase-gate self-audit.

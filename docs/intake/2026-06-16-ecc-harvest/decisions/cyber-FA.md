# ECC Harvest — décisions cluster `cyber:network-security` (lot FA — le lot offensif)

Doer : lot FA (11 skills, tous à titre offensif). Worktree `maos-ecc`, branche `phase/ecc-harvest`.
Source : `mukul975/Anthropic-Cybersecurity-Skills` (clone read-only, Apache-2.0, frontmatter `author: mahipal`). Cible keepers : `packages/skills/library/<defensive-slug>/SKILL.md`.

**Garde-fou défensif strict (KILL agressif).** Pour CHAQUE skill : (a) REJECT si c'est une arme d'attaque pure / exploit prêt-à-tirer / activateur de ciblage de masse / DoS / évasion de détection sans résidu purement défensif ; ou (b) KEEP UNIQUEMENT une version reframée défensivement qui enseigne **DÉTECTION + MITIGATION** de l'attaque (renommage en slug défensif `detecting-and-preventing-<x>` / `auditing-own-<x>`), en strippant TOUT payload/commande weaponisé.

Recadrage transverse (§11) : MAOS = abonnement, jamais de coût per-token PAYG ; tout chiffre = unités de quota, jamais $/€. Sanitize (secrets/PII/`@anthropic-ai/sdk`) : sources clean, `@anthropic-ai/sdk` absent. Frameworks préservés (`nist_csf`, `mitre_attack` ; aucun `nist_ai_rmf`/`atlas_techniques` sur ce lot).

Bilan attendu par le garde-fou : « un audit qui ne peut pas dire REJECT est cassé » → **plusieurs rejets**. Résultat : **7 keepers reframés défense, 4 rejets**.

---

## conducting-man-in-the-middle-attack-simulation
- **décision** : keep-reframed
- **rename** : `conducting-man-in-the-middle-attack-simulation` → `detecting-and-preventing-mitm`
- **raison** : l'attaque MITM a un fort résidu purement défensif et nommé (HSTS + preload, certificate pinning, Dynamic ARP Inspection adossé au DHCP snooping, signatures IDS/SIEM ARP/DHCP/DNS-spoof). Le keeper enseigne **vérifier+durcir+détecter** sur un réseau possédé ; toute procédure d'interception (Ettercap/Bettercap/mitmproxy, CA malveillante, capture) est strippée. L'interception elle-même reste §5 risk:blocking et hors-scope.
- **KILL appliqué** : le payload d'interception est rejeté ; ne survit que la posture détection+mitigation. L'audit aurait basculé en REJECT s'il ne restait qu'un guide d'attaque.
- **frameworks préservés** : nist_csf [PR.IR-01, DE.CM-01, ID.AM-03, PR.DS-02] · mitre_attack [T1557.001, T1557.002, T1040] (cadrés « ce contre quoi on défend »).
- **dedup** : non — nourrit `mas-sec-reviewer` + garde-fou réseau §5 (`allowed_hosts`), surface absente de nos assets.
- **chemin library** : `packages/skills/library/detecting-and-preventing-mitm/SKILL.md`.
- **recadrage** : quota d'abonnement (§11), aucun $/€.
- **re-audit** : si MITRE met à jour T1557 ou si un contrôle anti-downgrade (ex. ECH) devient standard ; sinon stable.

---

## performing-arp-spoofing-attack-simulation
- **décision** : keep-reframed
- **rename** : `performing-arp-spoofing-attack-simulation` → `detecting-and-preventing-arp-spoofing`
- **raison** : résidu défensif fort et nommé (Dynamic ARP Inspection adossé au DHCP snooping, port-security/802.1X/segmentation, signatures IDS opcode-2 / gratuitous-ARP). Le keeper enseigne vérifier la couverture DAI, lire les statistiques d'inspection et prouver l'alerte — toute émission de réponses ARP spoofées (arpspoof/Ettercap/Scapy) est strippée.
- **KILL appliqué** : payload de poisoning rejeté ; ne survit que la posture DAI+detection. Émettre du faux ARP reste §5 risk:blocking.
- **frameworks préservés** : nist_csf [PR.IR-01, DE.CM-01, ID.AM-03, PR.DS-02] · mitre_attack [T1046, T1040, T1557, T1071].
- **dedup** : non — garde-fou réseau §5 + `mas-sec-reviewer`.
- **chemin library** : `packages/skills/library/detecting-and-preventing-arp-spoofing/SKILL.md`.
- **recadrage** : quota (§11), aucun $/€.
- **re-audit** : si la doctrine first-hop-security évolue (ex. DAI sur ports trunk) ; sinon stable.

---

## performing-dns-enumeration-and-zone-transfer
- **décision** : keep-reframed
- **rename** : `performing-dns-enumeration-and-zone-transfer` → `auditing-own-dns-exposure`
- **raison** : recadré strictement en self-audit défensif « audite TA propre exposition DNS + désactive les transferts de zone ». Garde la restriction AXFR/IXFR, la chasse aux enregistrements dangling (subdomain-takeover), DNSSEC et SPF/DKIM/DMARC. Toute énumération / brute-force / zone-transfer de domaines tiers est strippée et explicitement hors-scope.
- **KILL appliqué** : la recon tiers est rejetée ; ne survit que l'auto-audit sur zones possédées. Un keeper qui scannerait des tiers aurait été REJECT.
- **frameworks préservés** : nist_csf [PR.IR-01, DE.CM-01, ID.AM-03, PR.DS-02] · mitre_attack [T1046, T1040, T1557, T1071, T1595].
- **dedup** : non — réduit la surface §5 `allowed_hosts`, nourrit `mas-sec-reviewer`.
- **chemin library** : `packages/skills/library/auditing-own-dns-exposure/SKILL.md`.
- **recadrage** : quota (§11), aucun $/€.
- **re-audit** : si DMARC/BIMI ou DNSSEC algos évoluent ; sinon stable.

---

## performing-ssl-stripping-attack
- **décision** : keep-reframed
- **rename** : `performing-ssl-stripping-attack` → `detecting-and-preventing-ssl-stripping`
- **raison** : résidu défensif fort et nommé (HSTS + preload pour fermer le premier-visite, suppression des points d'entrée HTTP cleartext et du mixed-content, Upgrade-Insecure-Requests, signatures IDS de downgrade). Le keeper enseigne durcir+détecter sur ses propres propriétés web ; tout proxy de downgrade / capture de creds est strippé. Le stripping reste §5 risk:blocking.
- **KILL appliqué** : payload de stripping rejeté ; ne survit que la posture anti-downgrade. Sans résidu HSTS exploitable, ç'aurait été REJECT.
- **frameworks préservés** : nist_csf [PR.IR-01, DE.CM-01, ID.AM-03, PR.DS-02] · mitre_attack [T1046, T1040, T1557, T1071, T1573].
- **dedup** : non — `mas-sec-reviewer` (posture transport web).
- **chemin library** : `packages/skills/library/detecting-and-preventing-ssl-stripping/SKILL.md`.
- **recadrage** : quota (§11), aucun $/€.
- **re-audit** : si HSTS/preload est supplanté (ex. HTTPS-only par défaut navigateur généralisé) ; sinon stable.

---

## performing-vlan-hopping-attack
- **décision** : keep-reframed
- **rename** : `performing-vlan-hopping-attack` → `detecting-and-preventing-vlan-hopping`
- **raison** : résidu défensif fort et nommé (DTP off / `switchport nonegotiate`, mode access figé, native VLAN déplacé+taggé contre le double-tagging, élagage des trunks, segmentation). Le keeper enseigne auditer la config et vérifier la segmentation ; tout forgeage de trunk (Yersinia) / double-tagging est strippé. Le hopping reste §5 risk:blocking.
- **KILL appliqué** : payload de switch-spoofing rejeté ; ne survit que le durcissement switch. Sans contrôle nommé, REJECT.
- **frameworks préservés** : nist_csf [PR.IR-01, DE.CM-01, ID.AM-03, PR.DS-02] · mitre_attack [T1046, T1040, T1557, T1071, T1027].
- **dedup** : non — garde-fou segmentation §5 + `mas-sec-reviewer`.
- **chemin library** : `packages/skills/library/detecting-and-preventing-vlan-hopping/SKILL.md`.
- **recadrage** : quota (§11), aucun $/€.
- **re-audit** : si les défauts DTP des fournisseurs switch changent ; sinon stable.

---

## exploiting-bgp-hijacking-vulnerabilities
- **décision** : keep-reframed
- **rename** : `exploiting-bgp-hijacking-vulnerabilities` → `detecting-and-preventing-bgp-hijacking`
- **raison** : résidu défensif très fort et nommé (ROAs + RPKI route-origin validation avec rejet des Invalid à l'ingress, prefix-filtering, AS-path, max-prefix, monitoring temps-réel BGPalerter/looking-glass/RIPEstat). Le keeper enseigne valider sa couverture ROA et prouver les alertes ; toute annonce de préfixe non détenu / simulation de hijack sur control-plane live est strippée. L'annonce frauduleuse reste §5 risk:blocking.
- **KILL appliqué** : payload d'annonce/hijack rejeté ; ne survit que RPKI+monitoring. Sans contrôle RPKI nommé, REJECT.
- **frameworks préservés** : nist_csf [PR.IR-01, DE.CM-01, ID.AM-03, PR.DS-02] · mitre_attack [T1046, T1040, T1557, T1071].
- **dedup** : non — posture routing pour `mas-sec-reviewer` ; sous-tend la confiance §5 `allowed_hosts`.
- **chemin library** : `packages/skills/library/detecting-and-preventing-bgp-hijacking/SKILL.md`.
- **recadrage** : quota (§11), aucun $/€.
- **re-audit** : si ASPA / BGPsec atteint un déploiement standard ; sinon stable.

---

## exploiting-ipv6-vulnerabilities
- **décision** : keep-reframed
- **rename** : `exploiting-ipv6-vulnerabilities` → `detecting-and-preventing-ipv6-rogue-ra`
- **raison** : résidu défensif fort et nommé contre la classe rogue-RA / DHCPv6 abuse (mitm6 / SLAAC spoofing) : RA Guard sur l'access-layer, blocage DHCPv6, désactivation d'IPv6 inutilisé, monitoring NDP (ndpmon). Le keeper enseigne inventorier IPv6 (piège « IPv4-only mais IPv6 on par défaut »), couvrir RA Guard et prouver l'alerte ; tout envoi de RA/NA spoofé, mitm6, THC-IPv6 est strippé. L'injection RA reste §5 risk:blocking.
- **KILL appliqué** : payload mitm6/RA-spoof rejeté ; ne survit que la first-hop-security. Sans RA Guard/NDP nommés, REJECT. (slug ciblé `ipv6-rogue-ra` plutôt que le générique « ipv6-vulnerabilities », pour borner au vecteur réellement couvert.)
- **frameworks préservés** : nist_csf [PR.IR-01, DE.CM-01, ID.AM-03, PR.DS-02] · mitre_attack [T1046, T1040, T1557, T1071].
- **dedup** : non — posture first-hop pour `mas-sec-reviewer`.
- **chemin library** : `packages/skills/library/detecting-and-preventing-ipv6-rogue-ra/SKILL.md`.
- **recadrage** : quota (§11), aucun $/€.
- **re-audit** : si SEND / RFC IPv6 first-hop-security évolue ; sinon stable.

---

## exploiting-smb-vulnerabilities-with-metasploit
- **décision** : reject
- **raison** : arme d'exploitation pure — chaîne Metasploit prête-à-tirer contre SMB (EternalBlue-class), exploit framework + payloads/sessions. Aucun résidu purement défensif distinct : le durcissement SMB (désactiver SMBv1, signing, segmentation, patching) est déjà implicite ailleurs (cluster vulnerability-management / endpoint / dep-audit) et ne nécessite pas ce guide d'exploitation. Le reframer en « détection SMB » produirait au mieux un doublon faible, au pire conserverait l'arme.
- **KILL appliqué** : exploit prêt-à-tirer + framework Metasploit (§5 risk:blocking, exécution de code offensif tiers). Pas de version défense-only à valeur unique → REJECT net.
- **frameworks** : nist_csf/mitre_attack non repris (rejet).
- **chemin library** : aucun.
- **re-audit** : non — sauf si un cluster « SMB hardening » défensif dédié est explicitement scopé, et alors écrit from-scratch, jamais dérivé de ce guide Metasploit.

---

## performing-wifi-password-cracking-with-aircrack
- **décision** : reject
- **raison** : arme de cracking de credentials — capture de handshake + bruteforce/dictionnaire aircrack-ng pour récupérer des clés WPA/WPA2. C'est un casseur de mots de passe, ciblage de masse possible (réseaux voisins). Le résidu défensif (choisir WPA3, passphrases longues, 802.1X/EAP, désactiver WPS) est trivial et déjà couvert par la doctrine crypto/IAM ; il ne justifie pas de conserver l'outillage de cracking.
- **KILL appliqué** : arme de cracking de credentials + capture sans-fil de tiers (§5 risk:blocking). Aucun résidu défense-only non-trivial → REJECT.
- **frameworks** : non repris (rejet).
- **chemin library** : aucun.
- **re-audit** : non — conflit structurel (un guide de cracking ne se « défensive-ise » pas).

---

## performing-bandwidth-throttling-attack-simulation
- **décision** : reject
- **raison** : technique de DoS — dégradation/throttling de la bande passante d'une cible (la tâche la flaggait DoS probable). Le ciblage de la disponibilité d'autrui n'a pas de version défensive transférable ici : la résilience DoS (rate-limiting, QoS, scrubbing, capacity) est une discipline d'ingénierie réseau distincte, pas le miroir de cette simulation d'attaque. Garder une version « détecter le throttling » serait un doublon faible du monitoring réseau déjà présent (cluster network-security/soc-operations).
- **KILL appliqué** : technique DoS (atteinte à la disponibilité, §5 risk:blocking ; garde-fou explicite « DoS → REJECT »). Pas de résidu défense-only à valeur unique → REJECT.
- **frameworks** : non repris (rejet).
- **chemin library** : aucun.
- **re-audit** : non — le garde-fou DoS est catégorique.

---

## Bilan du lot FA

- **Keepers (7, reframés défense)** : `detecting-and-preventing-mitm`, `detecting-and-preventing-arp-spoofing`, `auditing-own-dns-exposure`, `detecting-and-preventing-ssl-stripping`, `detecting-and-preventing-vlan-hopping`, `detecting-and-preventing-bgp-hijacking`, `detecting-and-preventing-ipv6-rogue-ra`.
- **Rejets (3, armes pures)** : `exploiting-smb-vulnerabilities-with-metasploit` (exploit Metasploit prêt-à-tirer), `performing-wifi-password-cracking-with-aircrack` (cracking de credentials), `performing-bandwidth-throttling-attack-simulation` (DoS).
- **Décompte ferme : 7 keep-reframed / 3 rejets** sur 11 sources.
- **Le garde-fou KILL a mordu** : 3 sources sur 11 basculées en REJECT (les armes pures). Les 7 keepers ne survivent QUE parce que chacun porte un résidu détection+mitigation nommé et non-trivial (DAI+DHCP-snooping, HSTS+preload, RA Guard+ndpmon, RPKI+ROA+BGPalerter, DTP-off+native-VLAN, DNSSEC+restriction AXFR) ; tout payload weaponisé a été strippé, et l'interception/annonce/forgeage reste §5 risk:blocking hors-scope dans chaque keeper.


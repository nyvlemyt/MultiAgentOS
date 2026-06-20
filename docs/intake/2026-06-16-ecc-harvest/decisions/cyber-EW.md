# ECC Harvest — décisions cluster `cyber:network-security` (lot EW)

Doer: lot EW (8 skills). Worktree `maos-ecc`. Méthode: intake-audit barre LARGE (T1, library).
Source cyber: `mukul975/Anthropic-Cybersecurity-Skills` (Apache-2.0). Cible: `packages/skills/library/<slug>/SKILL.md`.
Dedup contre `our-assets-index.md` + recoupe `mas-sec-reviewer` / CLAUDE.md §5 (garde-fou réseau, `allowed_hosts`, risky actions gated).
Nature du lot: skills **DÉFENSIFS** (blue-team) de sécurité réseau — analyse de flux/paquets,
segmentation, firewall, IDS/IPS, détection d'ARP-poisoning. Aucune arme offensive dans le lot.
Le frontmatter source porte `subdomain: network-security` + des `frameworks` (NIST-CSF + MITRE-ATTACK
sur les 8): mappings préservés dans la metadata MAS.
Garde-fou défensif appliqué à chaque skill: lentille analyse+détection+config-défensive gardée;
toute conséquence destructrice ou intrusive (envoi de paquets crafted, capture sur réseau non-possédé,
règle firewall qui coupe l'accès, mode IPS inline qui drop, NAT exposant un service) recadrée en
action RISQUÉE GATÉE §5; tout owner-scoped (jamais de capture/scan de réseaux tiers).
Sanitize: 0 secret réel, 0 PII, 0 `@anthropic-ai/sdk` dans les 8 sources (IP RFC5737/RFC1918, MAC,
hashes JA3 et `<YOUR_OINK_CODE>` = placeholders d'exemple uniquement, pas des secrets émis). Recadrage
transverse §11: tout chiffre = quota d'abonnement, jamais $/€ (les sources n'utilisaient pas de cash;
les rulesets payants ET Pro / Snort Subscriber = prérequis tiers du projet externe, pas une facturation
MAOS — MAOS s'authentifie par abonnement, jamais via clé committée §11).

---

## analyzing-network-flow-data-with-netflow
- **décision**: adapt
- **raison**: triage défensif de télémétrie de flux (NetFlow v9 / IPFIX) — décodage via la lib Python `netflow`, baseline par hôte, puis flag des 4 classes d'anomalie (port-scan src→multi-dst même port, exfil byte-count sortant vers dst inhabituelle, beaconing C2 périodique faible-jitter, pics volumétriques). Payload-free, premier niveau peu coûteux. Nourrit `mas-sec-reviewer` + la lentille §5 (`allowed_hosts`, sortie réseau gatée).
- **dedup**: non — aucun skill d'analyse de flux dans notre surface; angle = métadonnée de flux site-wide sans payload. Distinct de l'analyse paquet (scapy/wireshark).
- **garde-fou défensif (§5)**: collecte owner-scoped uniquement (exporteurs possédés, jamais de tap tiers); toute containment (firewall/route) recadrée en action RISQUÉE GATÉE, jamais auto-appliquée; cross-check des dst sortantes contre `allowed_hosts`.
- **chemin library**: `packages/skills/library/analyzing-network-flow-data-with-netflow/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` NIST-CSF/MITRE-ATTACK [T1071/T1048/T1046/T1095] préservé + Prompt Defense Baseline; 7 sections §12 défensives; baseline-avant-alerte + periodicity=C2 + flow≠payload martelés; 0 secret, 0 sdk, 0 cash).

## analyzing-network-packets-with-scapy
- **décision**: adapt
- **raison**: dissection+stats défensive de paquets via Scapy — lecture pcap offline (`rdpcap()`), extraction des couches IP/TCP/UDP/DNS/HTTP, stats (top-talkers, distribution proto, fréquence port), détection SYN-flood (ratio flags TCP), DNS-tunneling (longueur+entropie de query), fragmentation/headers malformés. Posture par défaut = read-only offline. Nourrit `mas-sec-reviewer` + §5.
- **dedup**: non — aucun skill Scapy dans notre surface; angle = analyse paquet field-level programmatique. Distinct de Wireshark (tshark/GUI) et du flow (netflow).
- **garde-fou défensif (§5)**: Scapy peut craft+send — recadré en action RISQUÉE GATÉE (envoi réseau sortant), owner-scoped, jamais le chemin par défaut; le besoin de root = signal de sortie de l'analyse offline → re-vérifier autorisation + gate.
- **chemin library**: `packages/skills/library/analyzing-network-packets-with-scapy/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` NIST-CSF/MITRE-ATTACK [T1040/T1071/T1046/T1557] préservé + Prompt Defense Baseline; 7 sections §12 défensives; default-offline-read + send=§5-gated + detect-on-structure martelés; 0 secret, 0 sdk, 0 cash).

## analyzing-network-traffic-with-wireshark
- **décision**: adapt
- **raison**: investigation IR défensive packet-level via Wireshark/tshark — capture filters BPF + ring-buffer, display filters (UA suspects, DNS odd-TLD, SMB lateral, creds cleartext, beaconing), follow-stream, export d'objets HTTP/SMB + IOCs, stats (protocol hierarchy/conv/endpoints/IO-graph), preservation evidence SHA-256 chain-of-custody. Nourrit `mas-sec-reviewer` + §5.
- **dedup**: non — aucun skill Wireshark/tshark dans notre surface; angle = analyse paquet de référence + extraction artefacts/IOC. Distinct de scapy (lib programmatique) et du flow.
- **garde-fou défensif (§5)**: capture sur segment AUTORISÉ owner-scoped uniquement; capture live recadrée en action RISQUÉE GATÉE; jamais d'interception de comms privées/tiers; pas de claim payload sur trafic chiffré (TLS/DoH/DoT → métadonnée seule).
- **chemin library**: `packages/skills/library/analyzing-network-traffic-with-wireshark/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` NIST-CSF/MITRE-ATTACK [T1040/T1071/T1557/T1046] préservé + Prompt Defense Baseline; 7 sections §12 défensives; capture-filter-first + authorized-segment-only + hash-evidence martelés; 0 secret, 0 sdk, 0 cash).

## configuring-network-segmentation-with-vlans
- **décision**: adapt
- **raison**: segmentation VLAN défensive sur switches managés — design de zones (corp/servers/DMZ/guest/IoT/mgmt/quarantine) + matrice de flux, ports access/trunk, durcissement anti-VLAN-hopping (DTP off/nonegotiate, native-VLAN inutilisé, allowed-VLAN explicite, DHCP snooping, DAI, IP Source Guard, port-security, BPDU guard, storm-control), ACLs inter-VLAN default-deny, vérif par test. Réduit blast-radius/lateral-movement → nourrit `mas-sec-reviewer` + §5.
- **dedup**: non — aucun skill de segmentation VLAN dans notre surface; angle = isolation L2 + ACL inter-zone. Recoupe pfSense (firewall) mais distinct (switch/L2 vs firewall/L3).
- **garde-fou défensif (§5)**: toute reconfig switch coupant l'accès (trunk/native/ACL) recadrée en action RISQUÉE GATÉE STAGED (pilot→segment→flotte), jamais auto-appliquée en prod; owner-scoped; VLAN seul ≠ frontière de sécurité (Layer-3 requis), ≠ air-gap.
- **chemin library**: `packages/skills/library/configuring-network-segmentation-with-vlans/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` NIST-CSF/MITRE-ATTACK [T1046/T1040/T1557.002/T1021/T1018] préservé + Prompt Defense Baseline; 7 sections §12 défensives; L3-enforcement-required + anti-hopping + design-before-config martelés; 0 secret, 0 sdk, 0 cash).

## configuring-pfsense-firewall-rules
- **décision**: adapt
- **raison**: config firewall pfSense défensive — interfaces/VLANs, règles par zone (LAN/DMZ/GUEST/IoT) en default-deny avec aliases, NAT port-forward scopé au strict requis, VPN IPsec/OpenVPN, pfBlockerNG (blocklists IP/DNS), forwarding logs SIEM. Ordre des règles = correctness (first-match, BLOCK spécifique au-dessus du PASS large). Nourrit `mas-sec-reviewer` + §5.
- **dedup**: non — aucun skill firewall/pfSense dans notre surface; angle = périmètre/segmentation L3 stateful. Recoupe VLAN (L2) mais distinct (firewall/NAT/VPN).
- **garde-fou défensif (§5)**: toute règle/NAT ouvrant une exposition inbound ou coupant l'accès recadrée en action RISQUÉE GATÉE, jamais auto-éditée; owner-scoped; logging obligatoire sur tous les BLOCK; pas de substitut au host-firewall, pas de DPI TLS sans HW.
- **recadrage §11**: feeds/appliances payants (pfBlockerNG Pro, Netgate) = prérequis tiers du réseau de l'utilisateur, jamais une facturation PAYG MAOS; MAOS s'authentifie par abonnement.
- **chemin library**: `packages/skills/library/configuring-pfsense-firewall-rules/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` NIST-CSF/MITRE-ATTACK [T1071.001/T1095/T1572/T1571/T1041] préservé + Prompt Defense Baseline; 7 sections §12 défensives; default-deny + rule-order=correctness + NAT-scope-tight + log-all-blocks martelés; 0 secret, 0 sdk, 0 cash).

## configuring-snort-ids-for-intrusion-detection
- **décision**: adapt
- **raison**: déploiement+tuning Snort 3 IDS défensif — install Snort+DAQ, interface span/tap (promiscuous, offloading off), config Lua (HOME_NET, preprocessors, port_scan, alert_json), rulesets Community via PulledPork, règles locales (reverse-shell, Mimikatz-over-SMB, DNS-tunnel, creds cleartext, SYN-scan), validation + tuning threshold/suppression sur baseline. Nourrit `mas-sec-reviewer` + §5.
- **dedup**: non — aucun skill IDS/Snort dans notre surface; angle = détection signature réseau. Distinct de Suricata (autre moteur, EVE-JSON/multithread) et des firewall/segmentation.
- **garde-fou défensif (§5)**: posture par défaut = DÉTECTION (IDS); le mode inline IPS (drop) recadré en action RISQUÉE GATÉE (peut outage la prod), jamais un flip autonome; owner-scoped (segment possédé); déploiement non-tuné = DoS sur l'analyste → baseline-and-tune obligatoire.
- **sanitize/§11**: l'oinkcode = token de registration → placeholder/référence env, jamais committé; rulesets Subscriber payants = prérequis tiers, jamais une facturation PAYG MAOS.
- **chemin library**: `packages/skills/library/configuring-snort-ids-for-intrusion-detection/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` NIST-CSF/MITRE-ATTACK [T1046/T1071.001/T1572/T1210/T1048] préservé + Prompt Defense Baseline; 7 sections §12 défensives; detection-by-default + tune-against-baseline + oinkcode-jamais-committé martelés; 0 secret réel, 0 sdk, 0 cash).

## configuring-suricata-for-network-monitoring
- **décision**: adapt
- **raison**: déploiement Suricata 7+ IDS/NSM défensif — tuning AF_PACKET (threads/ring/buffer, offloading off) sur span/tap possédé, suricata.yaml (HOME_NET, EVE-JSON alert/http/dns/tls/files/flow/anomaly, app-layer, JA3/HASSH), rulesets via suricata-update (ET Open) + disable.conf, règles locales (reverse-shell, DNS-tunnel, bad-JA3 C2, SSH brute-force, large-POST exfil), validation + tuning baseline, EVE→SIEM. Nourrit `mas-sec-reviewer` + §5.
- **dedup**: non — aucun skill Suricata dans notre surface; angle = IDS multithread protocol-aware + EVE-JSON + JA3/HASSH. Distinct de Snort (autre moteur) — gardés tous deux (moteurs différents, EVE vs unified2).
- **garde-fou défensif (§5)**: posture par défaut = IDS/NSM (alert+metadata); le mode inline IPS (NFQUEUE drop) recadré en action RISQUÉE GATÉE (peut outage la prod), jamais un flip autonome; owner-scoped; sensor sous-dimensionné → drops silencieux → `kernel_drops==0` vérifié; déploiement non-tuné = flood FP.
- **sanitize/§11**: credentials rule-source/oinkcode jamais committés; ET Pro payant = prérequis tiers, jamais une facturation PAYG MAOS.
- **chemin library**: `packages/skills/library/configuring-suricata-for-network-monitoring/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` NIST-CSF/MITRE-ATTACK [T1046/T1071.001/T1572/T1048/T1573.001] préservé + Prompt Defense Baseline; 7 sections §12 défensives; IDS-by-default + size-before-trust + tune-against-baseline + metadata-differentiator martelés; 0 secret réel, 0 sdk, 0 cash).

## detecting-arp-poisoning-in-network-traffic
- **décision**: adapt
- **raison**: détection+prévention défensive d'ARP poisoning/spoofing (MitM L2, T1557.002) — repérage par anomalie (changement IP→MAC, spoof MAC gateway, flip-flop, flood gratuit-ARP, IP dupliquée); couches: ARPWatch, filtres Wireshark, moniteur Python passif (gateway-spoof/mac-change/flip-flop/arp-rate); prévention DAI (DHCP-snooping d'abord), port-security, static-ARP gateways, broadcast domains réduits, 802.1X. Nourrit `mas-sec-reviewer` + §5.
- **dedup**: non — aucun skill ARP/L2-MitM dans notre surface; angle = défense Layer-2 spécifique. Réutilise DAI/DHCP-snooping aussi présents dans VLAN/segmentation mais angle distinct (détection MitM vs design de zones).
- **garde-fou défensif (§5)**: DÉTECTION uniquement, jamais de spoof — passif/read-only par construction (sniff + lecture ARPWatch DB, aucun ARP forgé émis, y compris "pour tester"); changements DAI/port-security/static-ARP owner-scoped + recadrés en actions RISQUÉES GATÉES STAGED (peuvent drop du trafic légitime, trusted-ports d'abord); ARP-controls ≠ substitut au chiffrement.
- **chemin library**: `packages/skills/library/detecting-arp-poisoning-in-network-traffic/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` NIST-CSF/MITRE-ATTACK [T1557.002/T1557/T1040/T1200] préservé + Prompt Defense Baseline; 7 sections §12 défensives; detect-not-spoof + passive-read-only + snooping-before-DAI + defense-in-depth martelés; 0 secret, 0 sdk, 0 cash).

---

### Récap
- 8/8 keepers (tous `adapt`). 0 reject. Lot 100% DÉFENSIF (blue-team network security).
- Catégories: analyse/détection (NetFlow flow, Scapy paquet, Wireshark IR, ARP-poisoning détection),
  config défensive (segmentation VLAN, firewall pfSense), IDS/IPS (Snort, Suricata).
- Garde-fou défensif appliqué partout: lentille analyse+détection+config-défensive gardée; toute conséquence
  intrusive/destructrice recadrée en action RISQUÉE GATÉE §5 — envoi de paquets crafted (Scapy send/sniff live),
  capture live (Wireshark), mode inline IPS qui drop (Snort/Suricata), reconfig switch coupant l'accès (VLAN trunk/native),
  règle/NAT ouvrant une exposition inbound (pfSense), changement DAI/port-security (ARP). Posture par défaut partout =
  analyse offline / détection (IDS) / read-only; le passage à l'action active (IPS, send, exposition, cut) est gaté+staged.
- Owner-scope martelé partout: collecte/capture/monitoring uniquement sur infra possédée; jamais de tap/scan/spoof
  de réseaux tiers. ARP et Scapy clarifiés verbatim: DÉTECTION/analyse, jamais l'attaque (aucun ARP forgé, aucun
  paquet d'attaque émis). Wireshark: pas de claim payload sur trafic chiffré (TLS/DoH/DoT → métadonnée seule).
- Frameworks préservés dans la metadata: NIST-CSF (PR.IR-01/DE.CM-01/ID.AM-03/PR.DS-02) + MITRE-ATTACK sur les 8.
  ATT&CK par skill: netflow [T1071/T1048/T1046/T1095]; scapy [T1040/T1071/T1046/T1557]; wireshark [T1040/T1071/T1557/T1046];
  vlan [T1046/T1040/T1557.002/T1021/T1018]; pfsense [T1071.001/T1095/T1572/T1571/T1041]; snort [T1046/T1071.001/T1572/T1210/T1048];
  suricata [T1046/T1071.001/T1572/T1048/T1573.001]; arp [T1557.002/T1557/T1040/T1200].
- Recadrage §11 transverse: 0 chiffre cash (les sources n'en avaient pas, recadrage léger). Rulesets payants
  (Snort Subscriber, ET Pro), feeds pfBlockerNG Pro et appliances = prérequis tiers du réseau de l'utilisateur, jamais
  une facturation PAYG MAOS; MAOS s'authentifie par abonnement. Secrets (oinkcode, rule-source creds, enroll/TLS) =
  placeholders/références env, jamais committés.
- Tous nourrissent `mas-sec-reviewer` + la lentille §5 (posture réseau, `allowed_hosts`, risky actions gated, owner-scope).
- Garde-fous techniques: 0 `@anthropic-ai/sdk`, 0 secret réel/PII dans les 8 outputs (IP RFC5737/RFC1918, MAC,
  hashes JA3, `<YOUR_OINK_CODE>` = placeholders d'exemple).
- Renames: aucun. Les 8 slugs library == slugs source.

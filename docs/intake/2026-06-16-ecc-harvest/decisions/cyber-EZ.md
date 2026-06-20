# ECC Harvest — décisions lot `cyber-EZ` (cluster `cyber:network-security`)

Doer : lot EZ (6 skills). Worktree `maos-ecc`, branche `phase/ecc-harvest`. Méthode : intake-audit, lifecycle complet par skill.
Source : `mukul975/Anthropic-Cybersecurity-Skills` (clone read-only `/tmp/cybersec-inspect`, Apache-2.0, auteur `mahipal`).
Cible keepers : `packages/skills/library/<slug>/SKILL.md`.

Posture du lot : **DÉFENSIF**. Les 6 skills sont de l'analyse de trafic (tshark/zeek), de l'inspection et de l'évaluation SSL/TLS, de l'évaluation wireless passive (kismet) et de la découverte réseau nmap. Aucune machinerie de weaponisation/ciblage-de-masse présente → aucun KILL offensif déclenché. Tout est gardé comme **bibliothèque T1** (connaissance que `mas-sec-reviewer` et une tâche de revue réseau consultent ; MAOS ne l'exécute jamais contre des systèmes tiers ni contre sa propre infra local-first).

Recadrages transverses appliqués à chaque corps :
- **§11** : abonnement, zéro coût per-token PAYG. Tout seuil/limite = contrôle de posture, jamais $/€ ni quota cash. Les rapports d'exemple chiffrés en $ ne sont pas transposés.
- **§5** : les actions réseau décrites (scan nmap, inspection TLS, capture wifi) restent du domaine d'un réseau *autorisé/possédé* ; library = lecture, pas d'exécution. Le réseau (allowed_hosts) et les écritures hors-sandbox restent gatés côté MAOS. Aucun IOC n'est actionné (bloqué/contacté) par MAOS — finding only.
- **§12** : chaque keeper réécrit à la forme exemplaire (ligne 1 `---`, commentaire source, summary L1, metadata complet avec `frameworks` préservé, Prompt Defense Baseline verbatim, 7 sections §12).
- **Sanitize** : 6/6 sources clean. Aucun secret réel, aucune PII, aucun `@anthropic-ai/sdk`. Le matériel CA d'exemple (`openssl genrsa`, sujets `/C=US/...`) dans `performing-ssl-tls-inspection-configuration` = placeholder pédagogique, non transposé comme secret.
- **`frameworks`** préservé depuis le frontmatter source : `nist_csf` (6/6), `mitre_attack` (6/6). Aucun skill du lot ne porte `nist_ai_rmf`/`atlas_techniques`.

### Note dedup zeek/tshark (overlap EW/EX signalé au brief)
La library contient déjà des skills zeek (`detecting-beaconing-patterns-with-zeek`, `analyzing-network-traffic-for-incidents`). Ceux-ci **consomment** des logs Zeek/PCAP déjà produits pour de la détection/forensic ciblée. Le keeper EZ `performing-network-traffic-analysis-with-zeek` couvre un **delta-outil distinct** : *déployer et opérer* Zeek comme NSM (architecture de logs, écriture de scripts de détection custom, intégration SIEM, modes live/offline). Donc **gardé, pas fold**. `performing-network-traffic-analysis-with-tshark` (extraction IOC/protocole offline via tshark/pyshark sur PCAP) est lui aussi à outillage distinct (CLI Wireshark vs framework Zeek) → gardé séparé. Renommage : `scanning-network-with-nmap-advanced` → **`scanning-own-network-with-nmap`** (cadrage authorized-own-network explicite, suppression de la connotation "advanced/evasion").

---

## performing-network-traffic-analysis-with-tshark
- **décision** : adapt (keeper, library T1).
- **raison** : triage PCAP offline via tshark/pyshark — stats de protocole, top talkers, flux suspects (scan/beaconing/exfil), extraction d'IOC (IP/domaines DNS/URL HTTP), détection DNS-tunneling (entropie sous-domaines, TXT). Lentille d'analyse défensive réutilisable, lecture seule de captures possédées ; zéro émission de paquet.
- **dedup** : non — outillage distinct des skills zeek existants (CLI Wireshark/pyshark sur fichier PCAP vs framework Zeek déployé). Complète `mas-sec-reviewer` sans le dupliquer.
- **chemin library** : `packages/skills/library/performing-network-traffic-analysis-with-tshark/SKILL.md`
- **KILL testés** : PAYG/clé API → non (§11, seuils=posture). Exécute code sans audit → non (library, lecture seule ; aucune capture live). Email/finance/secrets/deploy → non. Framework lourd → non (skill autonome). Hors-phase → non (phase ECC-harvest). Évidence faible → non (Apache-2.0, NIST/MITRE mappé). Weaponisation/ciblage-de-masse/évasion → non (lecture offline de PCAP possédé).
- **état** : boosté conforme (ligne 1 `---`, commentaire source, summary L1 ≤200 tok, metadata + `frameworks` préservé, Prompt Defense Baseline verbatim, 7 sections §12, 0 sdk, 0 secret). Re-audit : source >12 mois sans maj, ou gap révélé en revue réseau réelle.

## performing-network-traffic-analysis-with-zeek
- **décision** : adapt (keeper, library T1).
- **raison** : déploiement/opération de Zeek comme NSM passif — architecture de logs (conn/dns/http/ssl/files/notice/weird/x509), modes live/offline, écriture de scripts de détection custom dans le langage Zeek, intégration SIEM. Lentille "moniteur permanent + scripting + SIEM", passive (n'émet rien).
- **dedup** : non, malgré la présence library de `detecting-beaconing-patterns-with-zeek` et `analyzing-network-traffic-for-incidents`. Ces deux-là **consomment** des logs/PCAP déjà produits pour une détection ciblée ; le keeper EZ couvre le **delta-outil distinct** = déployer/opérer Zeek + scripting + SIEM. Gardé séparé (pas de fold). Tool-delta aussi vs tshark (framework Zeek vs CLI Wireshark).
- **chemin library** : `packages/skills/library/performing-network-traffic-analysis-with-zeek/SKILL.md`
- **KILL testés** : PAYG → non (§11). Exécute code sans audit → non (library, monitoring passif côté projet autorisé, jamais exécuté par MAOS contre des tiers). Email/finance/secrets/deploy → non. Framework lourd → non (Zeek = outil tiers décrit, pas une dépendance MAOS). Hors-phase → non. Évidence faible → non (Apache-2.0, NIST/MITRE mappé). Weaponisation → non (passif, finding-only).
- **état** : boosté conforme (forme exemplaire complète, 7 sections §12, 0 sdk, 0 secret). Re-audit : source >12 mois, ou gap en revue réseau réelle.

## performing-ssl-tls-inspection-configuration
- **décision** : adapt (keeper, library T1).
- **raison** : configuration de break-and-inspect autorisé sur NGFW/SWG — CA d'inspection interne, modes forward-proxy/inbound/SSH, génération de certs proxy, exemptions pinning + catégories sensibles (banque/santé), scope aligné sur revue privacy/légale. Contrôle défensif owner-only, pas une capacité d'interception covert.
- **dedup** : non — aucun skill `.claude/skills/` ne couvre le TLS break-and-inspect ; complète les baselines secure-coding/§5 (clé CA = secret HSM/KMS).
- **chemin library** : `packages/skills/library/performing-ssl-tls-inspection-configuration/SKILL.md`
- **KILL testés** : PAYG → non (§11). Exécute code sans audit → non (library, owner-only côté projet). Email/finance/secrets/deploy → la clé CA est un secret → recadrée HSM/KMS, jamais écrite par MAOS (§5) ; pas un déclencheur de rejet, c'est un garde-fou intégré au corps. Framework lourd → non. Hors-phase → non. Évidence faible → non (Apache-2.0, NIST/MITRE mappé). Weaponisation/bypass-pinning-tiers → explicitement interdit dans le corps (owner-only) → non déclenché.
- **sanitize** : matériel CA d'exemple (`openssl genrsa -aes256`, sujets `/C=US/...`) = placeholder pédagogique, non transposé comme secret réel.
- **état** : boosté conforme (forme exemplaire complète, 7 sections §12, 0 sdk, 0 secret réel). Re-audit : source >12 mois, ou gap en revue réseau réelle.

## performing-ssl-tls-security-assessment
- **décision** : adapt (keeper, library T1).
- **raison** : évaluation de posture TLS via sslyze sur serveur autorisé — versions de protocole, force des cipher-suites, validité de chaîne de certs, HSTS/OCSP, faiblesses connues (Heartbleed/ROBOT/renégociation), rapport JSON + remédiation. Lecture de posture défensive, jamais exploitation.
- **dedup** : non — complète `performing-ssl-tls-inspection-configuration` (config vs évaluation) ; aucun skill `.claude/skills/` ne couvre l'audit TLS sslyze.
- **chemin library** : `packages/skills/library/performing-ssl-tls-security-assessment/SKILL.md`
- **KILL testés** : PAYG → non (§11). Exécute code sans audit → non (library, scan posture côté projet autorisé). Email/finance/secrets/deploy → non. Framework lourd → non. Hors-phase → non. Évidence faible → non (Apache-2.0, NIST/MITRE mappé). Weaponisation → les CVE (Heartbleed/ROBOT) sont **détectées et reportées**, jamais exploitées (cadrage explicite dans le corps) → non déclenché.
- **état** : boosté conforme (forme exemplaire complète, 7 sections §12, 0 sdk, 0 secret). Re-audit : source >12 mois, ou gap en revue réseau réelle (sslyze).

## performing-wireless-security-assessment-with-kismet
- **décision** : adapt (keeper, library T1).
- **raison** : assessment wireless **passif** via Kismet (monitor mode, n'émet rien) — rogue AP, SSID cachés, chiffrement faible/legacy (Open/WEP/WPA-TKIP), clients non autorisés, GPS optionnel. WIDS défensif, autorisation écrite requise (rappel légal de la source). Aucune action active (deauth/injection/crack).
- **dedup** : non — seul skill wireless de la library ; complète la couverture réseau (filaire tshark/zeek vs RF kismet).
- **chemin library** : `packages/skills/library/performing-wireless-security-assessment-with-kismet/SKILL.md`
- **KILL testés** : PAYG → non (§11). Exécute code sans audit → non (library, capture passive côté env. autorisé). Email/finance/secrets/deploy → non. Framework lourd → non. Hors-phase → non. Évidence faible → non (Apache-2.0, NIST/MITRE mappé). Weaponisation (deauth/injection/handshake-crack) → explicitement hors-scope dans le corps (passif-only) → non déclenché.
- **état** : boosté conforme (forme exemplaire complète, 7 sections §12, 0 sdk, 0 secret). Re-audit : source >12 mois, ou gap en revue wireless réelle.

## scanning-network-with-nmap-advanced → **scanning-own-network-with-nmap** (RENOMMÉ)
- **décision** : adapt (keeper, library T1, **renommé + élagué**).
- **raison** : découverte/inventaire réseau Nmap — host discovery en couches, scan de ports borné, détection service/version + OS, NSE sélectif, sortie structurée (`-oA`) pour pipeline inventaire/vuln-management. Recadré **own-network / autorisé** ; renommé `scanning-own-network-with-nmap` pour supprimer la connotation "advanced/évasion".
- **élagage weaponisation (KILL partiel appliqué au corps, skill gardé)** : les sections **firewall/IDS evasion** (fragmentation `-f`, decoys `-D RND`, spoofing) et **timing DoS-grade agressif** + **brute-force NSE credential** de la source sont **exclues** comme hors-scope/weaponisation. Le keeper interdit explicitement ces techniques dans Principles/Red Flags. La lentille gardée = discovery/inventory défensif.
- **dedup** : non — aucun skill `.claude/skills/` ne couvre la découverte réseau Nmap ; alimente l'inventaire d'actifs qui nourrit vuln-management.
- **chemin library** : `packages/skills/library/scanning-own-network-with-nmap/SKILL.md` (frontmatter `renamed_from: scanning-network-with-nmap-advanced`).
- **KILL testés** : PAYG → non (§11). Exécute code sans audit → non (library, scan côté réseau autorisé). Email/finance/secrets/deploy → non. Framework lourd → non. Hors-phase → non. Évidence faible → non (Apache-2.0, NIST/MITRE mappé). **Weaponisation/évasion/ciblage-de-masse → DÉCLENCHÉ sur les sections evasion/DoS/brute-force → élaguées du corps ; le reste (discovery autorisé) est gardé**, conforme au brief ("keep with strict authorized-own-network framing").
- **état** : boosté conforme (forme exemplaire complète, 7 sections §12, 0 sdk, 0 secret), sections offensives retirées. Re-audit : source >12 mois, ou si un besoin de pentest réel scopé en ROADMAP exige les techniques élaguées (alors via `config/permissions.json`, jamais en réintroduisant l'évasion sans gate).

---

## Bilan lot cyber-EZ

- **Keepers** : 6 / 6 (tous DÉFENSIFS → library T1, cluster `cyber:network-security`).
- **Renommages** : 1 — `scanning-network-with-nmap-advanced` → `scanning-own-network-with-nmap` (cadrage authorized-own-network + élagage des sections evasion/DoS/brute-force).
- **Folds** : 0. Les deux skills traffic-analysis (tshark, zeek) sont **gardés distincts** des skills zeek existants de la library (`detecting-beaconing-patterns-with-zeek`, `analyzing-network-traffic-for-incidents`) sur un delta-outil clair : tshark = extraction IOC offline CLI Wireshark sur PCAP ; zeek = déploiement/opération NSM + scripting + SIEM ; les existants = consommation de logs/PCAP déjà produits pour détection ciblée.
- **Rejets** : 0 (aucun skill entièrement weaponisé dans le lot ; le seul KILL partiel = sections offensives de nmap, élaguées, skill conservé).
- **Sanitize** : 6/6 clean — 0 secret réel, 0 PII, 0 `@anthropic-ai/sdk`. Matériel CA d'exemple (ssl-tls-inspection) = placeholder pédagogique non transposé.
- **frameworks préservés** : `nist_csf` + `mitre_attack` partout (6/6). Aucun `nist_ai_rmf`/`atlas_techniques` dans ce lot.
- **Conformité §12** : 6/6 à la forme exemplaire (ligne 1 `---`, commentaire source `mukul975/...`, summary L1 ≤200 tok, metadata complet + `frameworks`, Prompt Defense Baseline verbatim, 7 sections Overview/When/Principles-cite-source/Process/Rationalizations/Red Flags/Verification).
- **Posture transverse** : library = lecture pour revue d'un réseau *autorisé/possédé* ; MAOS n'exécute jamais ces actions réseau contre des tiers ni contre sa propre infra local-first (§5). IOCs/rogue-AP/findings = recensés, jamais actionnés. Tout chiffre = quota units, jamais $/€ (§11).

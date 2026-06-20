# ECC Harvest — décisions lot cyber-smalls FF (détection / analyse / assessment / firmware / wireless / purple)

Doer : lot FF (9 slugs sources). Worktree `maos-ecc`, branche `phase/ecc-harvest`. Méthode : intake-audit barre LARGE défensive (cf. cybersec-clusters.md, garde-fou défensif du brief).
Source : `mukul975/Anthropic-Cybersecurity-Skills` (Apache-2.0), clone read-only `/tmp/cybersec-inspect/skills/<slug>/SKILL.md`.
Cible KEEPER : `packages/skills/library/<lib-slug>/SKILL.md` (tier T2, status library, 8 sections = Prompt Defense Baseline VERBATIM + 7 §12).
Recadrage transverse : MAOS = abonnement (§11), JAMAIS de coût per-token PAYG — tout chiffre = quota d'abonnement, jamais $/€. Cibles autorisées uniquement ; actions actives §5-gated ; aucun secret ; aucun `@anthropic-ai/sdk` ; aucun payload exploit fonctionnel.
Sanitize secrets/PII/`@anthropic-ai/sdk` : 9/9 sources clean.
Bilan : **8 KEEP (adapt) · 1 REJECT (fold)**.

---

## detecting-bluetooth-low-energy-attacks
- **décision** : adapt (keep)
- **cluster** : cyber:wireless-security
- **raison** : lentille DÉTECTION d'attaques BLE en vol (sniff passif Ubertooth/nRF, énum GATT bleak, force de pairing crackle, indicateurs replay/MITM/spoofing). Défensif net. Pas de skill BLE existant : `performing-wireless-security-assessment-with-kismet` couvre le WiFi/RF Kismet, pas le BLE/GATT. Distincte de l'assessment (item 3) : ici on surveille/détecte, là on audite la posture d'un device.
- **dedup** : non (aucun BLE en bibliothèque ; Kismet = WiFi, disjoint).
- **chemin library** : `packages/skills/library/detecting-bluetooth-low-energy-attacks/SKILL.md`
- **recadrage MAOS** : autorisation écrite avant toute capture ; tout write actif sur un device cible = risk:high → §5 + mas-sec-reviewer PASS ; aucun payload unlock émis ; coût = quota (§11). Frameworks préservés : MITRE ATT&CK (T1011.001/T1557/T1040/T1200), NIST CSF (PR.IR-01/DE.CM-01/ID.AM-03).
- **état** : écrit, conforme (ligne 1 `---`, commentaire source, summary L1, metadata complet, Prompt Defense Baseline VERBATIM + 7 §12, 0 secret, 0 sdk). Re-audit : si le repo source >6 mois sans maj.

## detecting-deepfake-audio-in-vishing-attacks
- **décision** : adapt (keep)
- **cluster** : cyber:social-engineering-defense
- **raison** : lentille FORENSIQUE-AUDIO (MFCC/spectral/jitter-shimmer, ensemble RF+GBT, rapport confiance). Distincte du procédural existant `defending-against-vishing-and-pretext-calls` (vérification d'appelant, politique anti-pretexting) : ici c'est la détection technique de voix synthétique. Complémentaire, pas doublon.
- **dedup** : non (facette technique vs procédurale).
- **chemin library** : `packages/skills/library/detecting-deepfake-audio-in-vishing-attacks/SKILL.md`
- **recadrage MAOS** : verdict = score de confiance, jamais preuve unique → vérification out-of-band obligatoire avant action financière/légale ; ne construit pas de générateur de clonage vocal ; coût = quota (§11). Frameworks préservés : MITRE ATLAS (AML.T0088/T0043/T0018/T0052), NIST AI RMF, NIST CSF, d3fend, ATT&CK.
- **état** : écrit, conforme. Re-audit : 6 mois.

## performing-bluetooth-security-assessment
- **décision** : adapt (keep)
- **cluster** : cyber:wireless-security
- **raison** : lentille ASSESSMENT de posture BLE (énum GATT complète, gradation auth/chiffrement par caractéristique, profils sensibles connus, rapport JSON structuré + risk score). Per le brief, distincte de la détection (item 1) : détection = en vol ; assessment = audit méthodique d'un device. Auteur différent (mahipal) ; angle « grader la posture » non couvert par item 1.
- **dedup** : non (assessment vs détection ; Kismet = WiFi).
- **chemin library** : `packages/skills/library/performing-bluetooth-security-assessment/SKILL.md`
- **recadrage MAOS** : devices possédés/scoped uniquement ; connect OK sur device possédé, mais tout write sur cible live = risk:high → §5 + sec-reviewer PASS ; pas d'exfiltration de données sensibles dans le rapport ; coût = quota (§11). Frameworks : MITRE ATT&CK (T1557/T1040), NIST CSF (PR.IR-01/DE.CM-01/ID.AM-03).
- **état** : écrit, conforme. Re-audit : 6 mois.

## monitoring-scada-modbus-traffic-anomalies
- **décision** : **reject (fold)**
- **cluster** : cyber:ot-security (variante slug → ot-ics-security)
- **raison** : KILL = dup-no-better. Le cœur (distribution de codes-fonction FC, baseline timing z-score, détection rogue-master, plages de registres, exceptions/recon FC43/FC08, transaction-ID replay, connection-flood DoS) est DÉJÀ couvert par `detecting-modbus-protocol-anomalies` (filet anomalie large : FC allowlist, register-range, polling-timing z-score, protocol-violation, rogue-client, Markov sequencing) ET par `detecting-attacks-on-scada-systems` (anomalie process physique/historian : out-of-range, rate-of-change, z-score, spoofing capteur). La seule facette « unique » apparente — limites de valeur de registre vs bornes physiques sûres (setpoint/rate) — existe déjà dans `detecting-attacks-on-scada-systems` (move 3 physics/historian). Le cadrage « programme de monitoring continu » n'ajoute pas de doctrine nouvelle au-dessus des deux skills OT existants.
- **dedup** : oui — recoupement quasi total avec deux skills OT déjà en bibliothèque ; pas d'angle net différenciant.
- **chemin library** : aucun (T0).
- **état** : rejeté/folded. La substance utile est absorbée par `detecting-modbus-protocol-anomalies` + `detecting-attacks-on-scada-systems`. Re-audit : non (conflit de redondance structurel) — sauf si un futur besoin « surveillance-programme OT » distinct des deux skills émerge.

## analyzing-uefi-bootkit-persistence
- **décision** : adapt (keep)
- **cluster** : cyber:firmware-security
- **raison** : forensique défensive UEFI/bootkit (dump SPI flash chipsec/flashrom offline, variables UEFI/MOK, analyse ESP + hashes known-good, diff modules firmware vs baseline vendeur, YARA, bypass Secure Boot CVE-2022-21894, intégrité boot-chain, mémoire Volatility 3, attribution familles BlackLotus/LoJax/MoonBounce…). Aucun skill UEFI/bootkit existant : `performing-firmware-malware-analysis` et `performing-plc-firmware-security-analysis` ne couvrent ni l'ESP, ni les variables Secure Boot, ni le SPI-flash bootkit. Niche défensive forte.
- **dedup** : non (UEFI/Secure-Boot/ESP absent de la bibliothèque).
- **chemin library** : `packages/skills/library/analyzing-uefi-bootkit-persistence/SKILL.md`
- **recadrage MAOS** : analyse OFFLINE depuis live USB de confiance ; reflash/reset-clés = destructif risk:high → §5-gated, dump original préservé d'abord (preuve) ; pas de payload bootkit/bypass émis ; coût = quota (§11). Frameworks : MITRE ATT&CK (T1542.001/.003, T1553.006, T1014), NIST CSF, d3fend.
- **état** : écrit, conforme. Re-audit : 6 mois (paysage bootkit évolue vite).

## performing-firmware-extraction-with-binwalk
- **décision** : adapt (keep)
- **cluster** : cyber:firmware-analysis
- **raison** : étape EXTRACTION/triage firmware (binwalk signature+entropie, recursion matryoshka bornée, montage SquashFS/CramFS/JFFS2 via unsquashfs/sasquatch/jefferson, découverte credentials/clés/certs, versions → CVE). Per garde-fou brief = analyse firmware défensive (lab). Distincte de `performing-firmware-malware-analysis` (RE de firmware malveillant) et `performing-plc-firmware-security-analysis` (PLC-spécifique) : ici c'est le déballage générique d'images IoT/routeur. Léger recouvrement mais facette « toolchain d'extraction/entropie » non couverte ailleurs.
- **dedup** : non (extraction/déballage vs RE malware vs PLC) ; chevauchement partiel noté, pas suffisant pour folder.
- **chemin library** : `packages/skills/library/performing-firmware-extraction-with-binwalk/SKILL.md`
- **recadrage MAOS** : firmware autorisé uniquement (licence/droits) ; secrets découverts = findings, jamais redistribués ni collés verbatim ; recursion bornée ; coût = quota (§11). Frameworks : MITRE ATT&CK (T1078/T1190/T1003/T1110), NIST CSF (ID.RA-01/PR.PS-01/DE.AE-02).
- **état** : écrit, conforme. Re-audit : 6 mois.

## performing-fuzzing-with-aflplusplus
- **décision** : adapt (keep)
- **cluster** : cyber:application-security
- **raison** : per garde-fou brief = fuzz de TON PROPRE code / cibles autorisées (QA défensive pré-release). Fuzzing binaire coverage-guided (instrumentation afl-cc/afl-clang-fast, QEMU/Unicorn binary-only, corpus afl-cmin, campagne afl-fuzz, triage afl-tmin+CASR/GDB). Distinct de `performing-api-fuzzing-with-restler` (fuzzing API/web protocolaire) : ici c'est le fuzzing binaire mémoire. Cadrage authorized-targets explicite.
- **dedup** : non (binaire AFL++ vs API RESTler).
- **chemin library** : `packages/skills/library/performing-fuzzing-with-aflplusplus/SKILL.md`
- **recadrage MAOS** : cibles possédées/autorisées uniquement, jamais production/tiers ; un crash = bug report, jamais weaponisé en exploit (§5) ; coût = quota (§11). Frameworks : MITRE ATT&CK (T1190/T1059), NIST CSF (PR.PS-01/PR.PS-04/ID.RA-01), NIST AI RMF + ATLAS (cibles model-serving).
- **état** : écrit, conforme. Re-audit : 6 mois.

## performing-purple-team-atomic-testing
- **décision** : adapt (keep)
- **cluster** : cyber:purple-team
- **raison** : facette QUANTIFICATION-DE-COUVERTURE ATT&CK distincte. Deux skills atomic/purple existent déjà : `validating-detections-with-atomic-red-team` (validation par-technique) et `performing-purple-team-exercise` (programme d'exercice coordonné). Le livrable propre ici = heatmap ATT&CK Navigator + métriques par-tactique exécution-vs-détection + blind spots (executed-but-not-detected) + reporting de tendance mensuel leadership + boucle Sigma. `implementing-mitre-attack-coverage-mapping` existe mais est mapping général, pas la boucle gap-analysis pilotée par Atomic Red Team. Facette assez distincte pour garder.
- **dedup** : non (quantification/Navigator/tendance vs validation par-technique vs exercice programme vs mapping général).
- **chemin library** : `packages/skills/library/performing-purple-team-atomic-testing/SKILL.md`
- **recadrage MAOS** : autorisation écrite + range isolé = hard gate ; l'exécution d'atomics = techniques réelles → risk:high/blocking, TOUJOURS §5-pausé même en autopilot, sec-reviewer PASS + cleanup obligatoire ; « detected » = alerte déclenchée, pas seulement loggée ; coût = quota (§11). Frameworks : MITRE ATT&CK, ATLAS, NIST AI RMF, d3fend, NIST CSF.
- **état** : écrit, conforme. Re-audit : 6 mois.

## analyzing-ethereum-smart-contract-vulnerabilities
- **décision** : adapt (keep)
- **cluster** : cyber:blockchain-security
- **raison** : audit défensif pré-déploiement Solidity (Slither static 90+ détecteurs + Mythril symbolique/SMT, solc-select, triage+dédup+sévérité, rapport SWC). Aucun skill blockchain/smart-contract en bibliothèque. Niche verticale défensive ; contrats immuables custodiant des actifs → pré-déploiement critique.
- **dedup** : non (blockchain absent de la bibliothèque).
- **chemin library** : `packages/skills/library/analyzing-ethereum-smart-contract-vulnerabilities/SKILL.md`
- **recadrage MAOS** : code possédé/scoped uniquement ; scénarios d'exploit DÉCRITS, jamais payload drain/reentrancy fonctionnel ; aucune transaction d'exploit on-chain (§5 blocking — sortie/financier) ; n'remplace pas un audit humain sur contrat à forte valeur ; coût = quota (§11). Frameworks : MITRE ATT&CK (T1190/T1059), NIST CSF (PR.DS-01/PR.DS-02/ID.RA-01), SWC.
- **état** : écrit, conforme. Re-audit : 6 mois.

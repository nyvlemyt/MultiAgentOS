# ECC Harvest — décisions cluster `cyber:ot-ics-security` (LOT S — détection / monitoring)

Doer: lot OT/ICS S (10 skills sources). Worktree `maos-ecc`, branche `phase/ecc-harvest`. Méthode: intake-audit, barre LARGE (T1, library).
Source: `mukul975/Anthropic-Cybersecurity-Skills` (Apache-2.0, clone read-only `/tmp/cybersec-inspect/skills/<slug>/SKILL.md`), auteur `mahipal`.
Cible: `packages/skills/library/<lib-slug>/SKILL.md`.

## Garde-fou OT/ICS appliqué (rappel)
Tous ces skills sont **défensifs** : détection passive, monitoring, asset discovery passive-first, intégrité PLC en lecture seule. Aucun n'attaque ni n'endommage un ICS. Détecter une attaque (stuxnet, modbus-injection, FrostyGoop, Industroyer, TRITON, PIPEDREAM) = **détection défensive** → KEEP, jamais d'exploit fonctionnel produit. Recadrage transverse appliqué à chaque keeper :
- **Passive-first** : capture sur SPAN/TAP, parsing de trafic miroir ; toute action active sur un appareil OT vivant (Smart Polling Nozomi, Claroty Edge, requête sur contrôleur) = action de **fenêtre de maintenance, §5-gated**, jamais par défaut.
- **Sécurité avant sécurité-info** : findings critiques / SIS → équipe process-safety, pas seulement SOC IT. SIS exclu de tout scan actif.
- **Pas d'actuation OT** : les skills produisent des détections + guidance, jamais une commande de contrôle. Containment = action humaine gated.
- **§11** : tout coût en unités de quota d'abonnement, jamais $/€ (les sources framaient en `cost_usd`/labels SIEM — recadré).
- **Secrets** : credentials (PI, Dragos API-Key/Secret, Nozomi token, Claroty token) = secrets externes, jamais hardcodés/commités. `verify_ssl=False` des sources signalé mais non propagé comme reco.
- **`@anthropic-ai/sdk`** : absent des 10 sources. Aucun import provider introduit.

Sanitize (regex secrets/PII/internal) : 10/10 sources clean (les IP `10.x` et hostnames `*.plant.local` sont des exemples génériques).

## Dédup (instructions du lot)
- `detecting-modbus-protocol-anomalies` (filet large : allowlist FC, timing z-score, violations protocole, séquences Markov) **vs** `detecting-modbus-command-injection-attacks` (angle write-abuse spécifique : FrostyGoop, write-flood, broadcast write, out-of-range) → **angles et contenus distincts, KEEP les deux** (cadrage croisé écrit dans le corps de chaque skill).
- `detecting-attacks-on-scada-systems` (signature/IOC + règles Suricata + IOC malware connus + process-anomaly) **vs** `detecting-anomalies-in-industrial-control-systems` (anomalie ML Isolation-Forest, baseline comportementale) → angle signature vs angle ML, **KEEP les deux**.
- Dragos / Nozomi / Claroty = **plateformes éditeurs distinctes** → KEEP chacune.
- **Aucun fold.** 10 keepers, 0 rejet.

---

## detecting-anomalies-in-industrial-control-systems
- **décision**: adapt
- **raison**: détection d'anomalies comportementale (ML Isolation-Forest + règles déterministes topologie/timing/function-code + corrélation physique via historian). Complément du `mas-sec-reviewer` côté doctrine OT défensive. Recadré passive-first, baseline ≥2 semaines, SIS jamais touché, physique = check infalsifiable du sensor-spoofing.
- **dédup**: distinct de `detecting-attacks-on-scada-systems` (angle ML vs angle signature/IOC). Pas de fold.
- **chemin library**: `packages/skills/library/detecting-anomalies-in-industrial-control-systems/SKILL.md`
- **état**: écrit. Frontmatter (name/description Use+Do NOT/summary L1/metadata frameworks IEC 62443+ATT&CK ICS+NIST CSF+NIST AI RMF), commentaire source, Prompt Defense Baseline VERBATIM, 7 sections §12. 0 sdk, 0 secret.

## detecting-attacks-on-historian-servers
- **décision**: adapt
- **raison**: détection d'attaques sur historians OT (PI/Ignition/Wonderware/Proficy) au pivot IT/OT : clients non-autorisés, intégrité données (flatline/replay/gaps), latéral-movement (historian → ports PLC). Recadré API read-only stricte, compte least-privilege, jamais de write/exploit historian.
- **dédup**: aucun (les skills database génériques sont hors cluster ; reformulé comme tel dans le Do NOT).
- **chemin library**: `packages/skills/library/detecting-attacks-on-historian-servers/SKILL.md`
- **état**: écrit, conforme (8 blocs, frameworks ATT&CK ICS/NIST CSF/IEC 62443). 0 sdk, 0 secret.

## detecting-attacks-on-scada-systems
- **décision**: adapt
- **raison**: détection signature/IOC large multi-protocole (Modbus/DNP3/S7comm/IEC-104) : baselines déterministes + règles IDS OT (Suricata/Zeek) + process-anomaly + IOC malware connus (TRITON, Industroyer, PIPEDREAM). Recadré passive-first, SIS = événement safety, **aucune actuation/containment automatique** sur OT.
- **dédup**: distinct de `detecting-anomalies-in-industrial-control-systems` (signature vs ML). Pas de fold.
- **chemin library**: `packages/skills/library/detecting-attacks-on-scada-systems/SKILL.md`
- **état**: écrit, conforme (frameworks IEC 62443/ATT&CK ICS/NIST CSF/NIST AI RMF). Les règles Suricata/IOC = détection défensive (signatures), pas d'exploit fonctionnel. 0 sdk, 0 secret.

## detecting-dnp3-protocol-anomalies
- **décision**: adapt
- **raison**: détection d'anomalies DNP3 (énergie, port 20000) en DPI passif : master non-autorisé, cold/warm restart (FC 0x0D/0x0E), opérations fichier/firmware (PIPEDREAM), Select/Operate hors baseline. Remédiation structurelle recommandée = DNP3 SA v5. Recadré passive only, jamais de transmission DNP3 vers outstation vivant.
- **dédup**: distinct de Modbus (Do NOT pointe vers `detecting-modbus-command-injection-attacks`). Pas de fold.
- **chemin library**: `packages/skills/library/detecting-dnp3-protocol-anomalies/SKILL.md`
- **état**: écrit, conforme (frameworks ATT&CK ICS/NIST CSF/NIST AI RMF/IEC 62443). 0 sdk, 0 secret.

## detecting-modbus-command-injection-attacks
- **décision**: adapt
- **raison**: détection de l'attaque d'injection de commandes Modbus (classe FrostyGoop) : master non-autorisé, write non-autorisé, write-flood, broadcast write (unit ID 0), out-of-range register, diagnostic/restart. Recadré : source IP = preuve faible (pas d'auth Modbus, spoof possible) → vérifier change-management avant escalade ; passive only, containment humain-gated.
- **dédup**: **gardé distinct** de `detecting-modbus-protocol-anomalies` — angle write-abuse/injection spécifique vs filet anomalie large. Cadrage croisé écrit dans les deux corps. Pas de fold.
- **chemin library**: `packages/skills/library/detecting-modbus-command-injection-attacks/SKILL.md`
- **état**: écrit, conforme (frameworks ATT&CK ICS/NIST CSF/IEC 62443). 0 sdk, 0 secret.

## detecting-modbus-protocol-anomalies
- **décision**: adapt
- **raison**: détection d'anomalies protocole Modbus **générique** (filet large) : allowlist clients + function-codes par session, write-tracking, timing z-score, violations protocole (protocol ID ≠ 0 = MITM/frame malformée), broadcast write, modèles Markov de séquences normales. Recadré passive only, pas de fuzzing actif d'appareil vivant (§5).
- **dédup**: **gardé distinct** de `detecting-modbus-command-injection-attacks` (filet timing/protocole/séquence vs write-abuse). Pas de fold.
- **chemin library**: `packages/skills/library/detecting-modbus-protocol-anomalies/SKILL.md`
- **état**: écrit, conforme (frameworks IEC 62443/ATT&CK ICS/NIST CSF/NIST AI RMF). 0 sdk, 0 secret.

## detecting-stuxnet-style-attacks
- **décision**: adapt
- **raison**: détection d'attaques cyber-physiques classe Stuxnet : intégrité logique PLC (diff blocs vs baseline known-good), détection physique (corrélation fréquence↔RPM, puissance↔vitesse, vibration↔vitesse — démasque le sensor-spoofing), indicateurs USB/EWS, chaîne d'attaque 5 étapes mappée ATT&CK ICS. Détecter Stuxnet = détection défensive (pas d'exploit). Recadré : lecture seule des blocs (jamais download/modify logique PLC), baseline known-good obligatoire, preuves forensiques préservées avant remédiation.
- **dédup**: distinct de `detecting-attacks-on-scada-systems` (IDS basique) — angle intégrité-logique + physique avancé. Pas de fold.
- **chemin library**: `packages/skills/library/detecting-stuxnet-style-attacks/SKILL.md`
- **état**: écrit, conforme (frameworks IEC 62443/ATT&CK ICS/NIST CSF). KILL non déclenché : CORE = détection/monitoring défensif, jamais attaque/dommage ICS. 0 sdk, 0 secret.

## implementing-dragos-platform-for-ot-monitoring
- **décision**: adapt
- **raison**: déploiement/opération plateforme Dragos (NDR OT) : sensors passifs outbound-only, tuning Knowledge Pack + threat-groups (VOLTZITE/CHERNOVITE/ELECTRUM/KAMACITE), visibilité assets, corrélation vulnérabilités, intégration SIEM avec mapping ATT&CK ICS. Recadré API read-only, credentials externes, **aucune actuation/containment** vers OT vivant.
- **dédup**: éditeur distinct (Nozomi/Claroty = skills séparés). Pas de fold.
- **chemin library**: `packages/skills/library/implementing-dragos-platform-for-ot-monitoring/SKILL.md`
- **état**: écrit, conforme (frameworks ATT&CK ICS/NIST CSF/NIST AI RMF/IEC 62443). Labels SIEM `cost_usd`-like absents ; severity mapping conservé (numérique SIEM, pas $). 0 sdk, 0 secret.

## implementing-ot-network-traffic-analysis-with-nozomi
- **décision**: adapt
- **raison**: déploiement Nozomi Guardian (analyse trafic OT passive) : sensors TAP/SPAN, asset visibility, BAD (behavioral anomaly detection), assessment vulnérabilités, analyse links cross-zone (compliance segmentation IEC 62443). Recadré : **Smart Polling** (seule feature active) = action maintenance-window §5-gated, jamais default-on ; API read-only, token externe.
- **dédup**: éditeur distinct. Pas de fold.
- **chemin library**: `packages/skills/library/implementing-ot-network-traffic-analysis-with-nozomi/SKILL.md`
- **état**: écrit, conforme (frameworks IEC 62443/ATT&CK ICS/NIST CSF/NIST AI RMF). 0 sdk, 0 secret.

## performing-ics-asset-discovery-with-claroty
- **décision**: adapt
- **raison**: asset discovery ICS via Claroty xDome : passive SPAN/TAP first (2-4 sem), inventaire Purdue 0-5, détection shadow-devices par diff CMDB, enrichissement vulnérabilités, Claroty Edge (requêtes actives protocoles natifs) maintenance-window/rate-limited/SIS-exclu. Recadré : **jamais de scanner IT (Nessus/Qualys) sur PLC/RTU** (crash contrôleurs legacy) ; Edge actif = §5-gated ; API read-only, token externe.
- **dédup**: éditeur distinct. Pas de fold.
- **chemin library**: `packages/skills/library/performing-ics-asset-discovery-with-claroty/SKILL.md`
- **état**: écrit, conforme (frameworks IEC 62443/ATT&CK ICS/NIST CSF/NIST AI RMF). 0 sdk, 0 secret.

---

## Bilan lot S
- **10 sources auditées, 10 keepers (adapt), 0 reject, 0 fold.** Couverture complète, aucune source droppée.
- Garde-fou OT/ICS : tous défensifs (détection/monitoring/discovery passive/intégrité read-only) → KEEP conforme. Aucun CORE attaquant/endommageant un ICS rencontré (KILL non déclenché — l'audit pouvait dire reject, ne l'a pas eu à faire).
- Dédup respectée : Modbus injection vs anomalie générique = distincts ; SCADA signature vs ICS ML = distincts ; Dragos/Nozomi/Claroty = distincts. 0 collision avec les slugs library existants.
- HARD respecté : aucune édition `ledger.tsv`, aucun `git add/commit/push`. Seuls écrits : 10 dirs library + ce shard.

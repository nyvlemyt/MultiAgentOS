# ECC Harvest — décisions cluster `cyber:ot-ics-security` (LOT U)

Doer: lot OT/ICS U (9 skills — assessment / hardening / protocol analysis). Worktree `maos-ecc`, branche `phase/ecc-harvest`.
Méthode: intake-audit barre LARGE défensive (T1, library). Source: `mukul975/Anthropic-Cybersecurity-Skills` (Apache-2.0, auteur des bodies = mahipal).
Cible: `packages/skills/library/<slug>/SKILL.md`.

## Garde-fous transverses (rappel)
- **GUARDRAIL OT/ICS** : tout skill défensif (évaluation, durcissement, analyse de protocole) = KEEP sauf doublon réel → fold. Aucune source de ce lot n'attaque/n'endommage un ICS → aucun reject.
- **SAFETY-FIRST (§5)** : chaque skill recadré passif/lecture-seule d'abord ; toute action OT active (scan actif, requête native, injection, changement firewall/auth sur serveur vif) est §5-gated et fenêtre-de-maintenance. SIS jamais scanné.
- **§11** : abonnement uniquement, tout effort en unités de quota, jamais $/€ ; jamais d'`ANTHROPIC_API_KEY`. Sources : `requests`/scapy/binwalk présents mais aucun import `@anthropic-ai/sdk` (vérifié, absent du lot).
- **Pas d'exploit fonctionnel** : analyses de protocole (s7comm, plc-firmware) recadrées en analyse défensive pour détection/durcissement ; aucun PoC, aucune injection live.
- **Dedup** : aucune collision de slug avec la library existante. Les 3 facettes OT-assessment restent distinctes (large vs safe-scanning vs Claroty) — contenus réellement différents, pas de fold.

---

## performing-oil-gas-cybersecurity-assessment
- **décision**: implement_now (library, T1)
- **raison**: évaluation cybersécurité défensive sectorielle pétrole & gaz (upstream/midstream/downstream) — SCADA pipeline, DCS raffinerie, SIS, RTU distants — mappée API 1164 / TSA SD-01/SD-02 / IEC 62443 / NIST CSF. Lentille unique : intégrité custody-transfer (fraude métrologique), chiffrement liaisons radio/satellite (IEC 62351), convergence physique-cyber sites distants.
- **dedup**: non — sectoriel, distinct de power-grid et de l'OT générique (cf. consigne « garder distinct »).
- **chemin library**: `packages/skills/library/performing-oil-gas-cybersecurity-assessment/SKILL.md`
- **état**: écrit conforme (ligne 1 `---`, commentaire source, summary L1, metadata frameworks préservés, Prompt Defense Baseline verbatim + 7 §12). Recadré safety-first ; SIS exclu ; actions actives §5-gated ; 0 exploit ; 0 secret ; 0 sdk.

## performing-ot-network-security-assessment
- **décision**: implement_now (library, T1)
- **raison**: facette LARGE d'évaluation réseau OT/ICS sur le modèle Purdue — découverte passive d'actifs, risque convergence IT/OT, analyse des règles firewall par zone (IEC 62443 zone/conduit), posture protocoles industriels. C'est le socle générique.
- **dedup**: non — distincte de la méthodo safe-scanning et du workflow Claroty (3 facettes gardées). Aucun chevauchement de contenu réel.
- **chemin library**: `packages/skills/library/performing-ot-network-security-assessment/SKILL.md`
- **état**: écrit conforme. Passif-first ; Level 0/1 observe-only ; scans actifs Level 2+ §5-gated et fenêtre ; frameworks IEC 62443-3-2/3-3 + NIST SP 800-82r3 préservés ; 0 exploit/secret/sdk.

## performing-ot-vulnerability-assessment-with-claroty
- **décision**: implement_now (library, T1)
- **raison**: facette PLATEFORME (Claroty xDome) — découverte passive + active-safe, corrélation CVE/ICS-CERT, scoring de risque OT (CVSS ajusté criticité + niveau Purdue + contrôles compensatoires), priorisation remédiation/virtual-patching. Spécifique et complémentaire.
- **dedup**: non — facette distincte (plateforme) des deux autres OT. Pas de fold.
- **chemin library**: `packages/skills/library/performing-ot-vulnerability-assessment-with-claroty/SKILL.md`
- **état**: écrit conforme. Le fetch CISA KEV (sortant) recadré explicitement §5 (allowed_hosts) + donnée non-fiable ; SIS jamais query active ; virtual-patching comme remédiation ; frameworks NERC CIP-010-4/CVSS/ICS-CERT préservés ; 0 exploit/secret/sdk.

## performing-ot-vulnerability-scanning-safely
- **décision**: implement_now (library, T1)
- **raison**: facette MÉTHODOLOGIE safe-scanning — modèle à 3 paliers (passif → requête native → actif-contrôlé) avec portes de prérequis explicites (validation labo, garantie fournisseur, change approval, fenêtre, rollback, exclusion SIS). C'est la discipline qui empêche de crasher un automate legacy.
- **dedup**: non — méthodologie de gating, pas le même objet que l'évaluation large ni le workflow plateforme. Gardée distincte.
- **chemin library**: `packages/skills/library/performing-ot-vulnerability-scanning-safely/SKILL.md`
- **état**: écrit conforme. Cœur safety-first (palier passif par défaut, escalade gated §5 + fenêtre) ; profils IT standards interdits sur OT ; SIS exclu de tout palier ; frameworks IEC 62443/NERC CIP/NIST SP 800-82 préservés ; 0 exploit/secret/sdk.

## performing-plc-firmware-security-analysis
- **décision**: implement_now (library, T1)
- **raison**: analyse DÉFENSIVE de firmware PLC en labo/offline — acquisition autorisée, vérification d'intégrité par hash vs baseline known-good (détection altération/supply-chain), analyse statique (binwalk/Ghidra : credentials en dur, backdoors, interfaces debug), revue de la pile protocole pour durcissement. Détection + hardening, pas d'arme.
- **dedup**: non — composant (IEC 62443-4-2), distinct des évaluations réseau/plateforme.
- **chemin library**: `packages/skills/library/performing-plc-firmware-security-analysis/SKILL.md`
- **état**: écrit conforme. Recadré labo/offline UNIQUEMENT (jamais sur PLC de production), interdiction d'upload firmware vers services publics, AUCUN exploit/PoC/injection live (le test protocole live = flux pentest §5-gated hors scope ici). GUARDRAIL respecté : analyse de protocole = défensif, pas d'exploit. Frameworks IEC 62443-4-2/CWE préservés ; 0 secret/sdk.

## performing-power-grid-cybersecurity-assessment
- **décision**: implement_now (library, T1)
- **raison**: évaluation défensive réseau électrique — génération, postes (substations), distribution, EMS/SCADA — NERC CIP + sécurité IEC 61850 GOOSE/MMS (IEC 62351), synchrophaseurs (PMU), paysage de menace grille (Industroyer/CrashOverride). Sectoriel, lentille protocole substation unique.
- **dedup**: non — sectoriel, distinct de oil-gas et de l'OT générique (consigne « garder distinct »).
- **chemin library**: `packages/skills/library/performing-power-grid-cybersecurity-assessment/SKILL.md`
- **état**: écrit conforme. Analyse substation passive d'abord ; jamais d'injection GOOSE/MMS sur bus vif ; remote access MFA/jump-host (CIP-005 R2) ; mappage NERC CIP obligatoire ; frameworks NERC CIP/IEC 61850/IEC 62351 préservés ; 0 exploit/secret/sdk.

## performing-s7comm-protocol-security-analysis
- **décision**: implement_now (library, T1)
- **raison**: analyse DÉFENSIVE du protocole Siemens S7comm/S7CommPlus (TCP/102) — parsing ROSCTR/function codes depuis pcaps capturés, flag des opérations critiques (write, program download/upload = exfil logique, CPU stop), exposition CVE Siemens connues. Pour règles de détection + durcissement (segmentation, know-how/access protection). PAS d'exploit.
- **dedup**: non — protocole-spécifique Siemens, distinct du firmware-analysis et des évaluations réseau.
- **chemin library**: `packages/skills/library/performing-s7comm-protocol-security-analysis/SKILL.md`
- **état**: écrit conforme. GUARDRAIL « protocol security analysis = défensif pour détection/hardening, no working exploit » strictement appliqué : passif sur trafic capturé, jamais de frame envoyée à un PLC de production, IDs MITRE ATT&CK-ICS (T0881/T0843) sur les findings, CVE mappées au modèle/firmware observé. 0 exploit/secret/sdk.

## performing-scada-hmi-security-assessment
- **décision**: implement_now (library, T1)
- **raison**: évaluation défensive des IHM SCADA — IHM web/thin-client, auth/session, comm IHM-PLC, durcissement OS/app — alignée IEC 62443-3-3 + NIST SP 800-82. 4 catégories couvertes ; web vulns (XSS/CSRF/IDOR) traitées comme safety-relevant (manip setpoint / suppression d'alarme).
- **dedup**: non — couche IHM, distincte de l'analyse protocole PLC (s7comm) et des évaluations réseau.
- **chemin library**: `packages/skills/library/performing-scada-hmi-security-assessment/SKILL.md`
- **état**: écrit conforme. Safety-first : miroir labo préféré, tests state-changing sur IHM de prod = fenêtre + rollback + §5 ; defaults/cleartext = findings critiques ; frameworks IEC 62443-3-3/OWASP/NIST SP 800-82 préservés ; 0 exploit/secret/sdk.

## securing-historian-server-in-ot-environment
- **décision**: implement_now (library, T1)
- **raison**: durcissement défensif de serveur historian OT (OSIsoft/AVEVA PI, Honeywell PHD, GE Proficy) — placement Purdue L3, audit exposition réseau, migration auth legacy IP-based (PI Trust) → Windows Integrated Security, audit-trails d'intégrité, réplication DMZ unidirectionnelle (data diode / PI-to-PI). Cœur défensif : enterprise ne touche jamais l'historian OT.
- **dedup**: non — durcissement de composant serveur, distinct des évaluations et analyses protocole.
- **chemin library**: `packages/skills/library/securing-historian-server-in-ot-environment/SKILL.md`
- **état**: écrit conforme. Audit lecture-seule ; changements firewall/auth/compte sur serveur vif = §5-gated + fenêtre ; pas de chemin direct L4→historian OT ; réplication unidirectionnelle obligatoire ; frameworks IEC 62443/NERC CIP-007/Purdue préservés ; 0 exploit/secret/sdk.

---

## Bilan lot U
- **9/9 sources couvertes**, **9 keepers**, **0 reject**, **0 fold** (les 3 facettes OT et les 2 verticaux sectoriels gardés distincts par consigne et par contenu réel).
- Tous écrits en `packages/skills/library/<slug>/SKILL.md` (slug source = slug library), conformes §12 (Prompt Defense Baseline verbatim + 7 sections), frameworks IEC 62443 / NERC CIP / MITRE ATT&CK-ICS / NIST préservés du frontmatter source.
- Recadrage safety-first + §5 gating + §11 quota appliqué partout ; aucun exploit fonctionnel ; aucun secret ; aucun import `@anthropic-ai/sdk`.
- Re-audit: si le repo source bouge de tier (>6 mois) ou si un futur agent OT domaine est scopé en ROADMAP (déclarer alors les catégories risquées OT dans `config/permissions.json`, pas en dur).

# ECC Harvest — décisions cluster `cyber:digital-forensics` (LOT O — artefacts Windows)

Doer : Phase D, LOT O (10 slugs source, artefacts Windows). Worktree `maos-ecc`, branche `phase/ecc-harvest`.
Source : `mukul975/Anthropic-Cybersecurity-Skills` (Apache-2.0), clone read-only `/tmp/cybersec-inspect/skills/<slug>/SKILL.md`.
Cible keepers : `packages/skills/library/<lib-slug>/SKILL.md`. Tier **T2** (bibliothèque forensique/verticale, cf. clustering : `digital-forensics` = T2, gardé fort dans son domaine).

## Méthode & garde-fous (intake-audit, barre LARGE forensique)

- **GARDE-FOU FORENSIQUE** : la DFIR est par nature défensive/investigatrice → **KEEP** sauf doublon (→ fold). Cadrage transverse appliqué à chaque keeper : investigation autorisée sur systèmes propres/in-scope, chaîne de possession (custody) préservée, **lecture seule sur les images de preuve** (§5 — pas de mount writable, pas d'op destructive sur la source), données recouvrées jamais divulguées/exfiltrées (§5 gate secrets/PII). Aucun CORE n'est anti-forensique/destruction-de-preuve → **aucun reject**. L'audit *pouvait* dire reject (critère explicite : si le CORE avait été wiping/forge/évasion d'audit) ; il ne l'a pas eu à le dire ici.
- **Recadrage §11** : MAOS = abonnement, jamais de coût per-token PAYG. Aucun chiffre $/€ introduit (les sources n'en contenaient pas — coûts en quota implicite côté MAOS). Aucun import `@anthropic-ai/sdk` dans les sources ni dans les keepers.
- **Sanitize** : 10/10 sources clean (pas de secret/PII réel ; les exemples — séries USB, MAC, IP — sont fictifs et conservés comme illustrations pédagogiques).
- **§12** : chaque keeper = ligne 1 `---`, frontmatter (`name`/`description` Use+Do-NOT/`summary` L1/`metadata` complet avec `frameworks` préservant MITRE ATT&CK + NIST CSF + NIST SP 800-86), commentaire source, `## Prompt Defense Baseline` VERBATIM, puis 7 sections (Overview / When to Use / Principles citant la source / Process / Rationalizations / Red Flags / Verification Criteria).
- **Frameworks préservés** : tous les slugs portaient `nist_csf` (RS.AN-01/RS.AN-03/DE.AE-02/RS.MA-01) + `mitre_attack` (techniques par slug). NIST SP 800-86 (guide d'intégration forensique IR) ajouté explicitement comme cadre méthodologique sous-jacent (acquisition→examination→analysis→reporting).

## Dédup (2 folds imposés + 1 umbrella)

- `analyzing-lnk-file-and-jump-list-artifacts` (LNK **+** Jump Lists, structure binaire, AppID hashes, EZ + Python) = **canonique** ; `analyzing-windows-lnk-files-for-artifacts` (LNK seul, plus riche sur l'acquisition/mount + scénarios média amovible) **FOLD dedans** (workflow de collecte + corrélation USB absorbés).
- `analyzing-prefetch-files-for-execution-history` (PECmd + Python complet, 5 étapes, grep outils malveillants, MAM) = **canonique** ; `analyzing-windows-prefetch-with-python` (stub mince mais apporte la lib `windowsprefetch` + détection binaire renommé/masquerading T1036.005) **FOLD dedans** (technique unique absorbée).
- `performing-windows-artifact-analysis-with-eric-zimmerman-tools` = skill-parapluie tool-suite → gardé comme **méthodologie large** (couche d'orchestration KAPE/EZ ; renvoie aux skills mono-artefact pour la profondeur).

---

## 1. analyzing-lnk-file-and-jump-list-artifacts
- **décision** : adapt (CANONIQUE du couple LNK)
- **raison** : couvre LNK **et** Jump Lists — la plus large des deux. Preuve d'accès fichier / exécution / activité utilisateur (persiste après suppression de la cible). Lentille distincte des autres artefacts (shortcut/jumplist vs registre/exécution).
- **dedup** : reçoit le fold de `analyzing-windows-lnk-files-for-artifacts` (workflow acquisition read-only via mount, corrélation média amovible↔USBSTOR, persistance Startup).
- **chemin library** : `packages/skills/library/analyzing-windows-lnk-and-jumplist-artifacts/SKILL.md`
- **frameworks** : MITRE ATT&CK T1547.009/T1547.001, T1204.002, T1005/T1025/T1074.001 ; NIST CSF + SP 800-86.
- **état** : écrit, conforme §12 (8 sections + Prompt Defense Baseline VERBATIM, 0 sdk, 0 secret réel, read-only/§5 explicité).

## 2. analyzing-windows-lnk-files-for-artifacts
- **décision** : fold
- **raison** : forte redondance avec #1 (même artefact LNK, mêmes timestamps/volume/machine-ID). Pas assez distinct pour un keeper séparé ; sa valeur unique (mount read-only détaillé, script LnkParse3, scénarios média amovible/share réseau/persistance Startup) est intégrée dans le canonique #1.
- **dedup** : oui — fondu dans `analyzing-windows-lnk-and-jumplist-artifacts` (canonique = LNK + Jump Lists).
- **chemin library** : — (folded, pas de slug propre).
- **état** : non écrit (fold). Commentaire de provenance du canonique mentionne le fold.

## 3. analyzing-prefetch-files-for-execution-history
- **décision** : adapt (CANONIQUE du couple Prefetch)
- **raison** : preuve d'exécution programme (run count, jusqu'à 8 timestamps, fichiers référencés, MAM Win10). La plus riche : PECmd + parsing Python manuel + grep outils attaquants + timeline. Lentille distincte (exécution, pas accès folder/fichier).
- **dedup** : reçoit le fold de `analyzing-windows-prefetch-with-python` (lib `windowsprefetch` + détection binaire renommé/masquerading T1036.005 via comparaison nom↔DLL référencées).
- **chemin library** : `packages/skills/library/analyzing-windows-prefetch-execution-history/SKILL.md`
- **frameworks** : MITRE ATT&CK T1059.001, T1003.001, T1021.002, T1567.002, + (fold) T1036.005/T1070.004/T1057 ; NIST CSF + SP 800-86.
- **état** : écrit, conforme §12 (Prefetch≠intent, triangulation Prefetch+Amcache+ShimCache, absence=signal anti-forensique).

## 4. analyzing-windows-prefetch-with-python
- **décision** : fold
- **raison** : corps mince (étapes en one-liners) ; ne tient pas seul comme keeper. Apport unique réel = lib `windowsprefetch` + détection masquerading (T1036.005) → fondu dans le canonique #3 (instruction du lot : garder le plus riche, garder l'apport python si tooling unique).
- **dedup** : oui — fondu dans `analyzing-windows-prefetch-execution-history`.
- **chemin library** : — (folded).
- **état** : non écrit (fold). Provenance du canonique #3 le cite.

## 5. analyzing-windows-amcache-artifacts
- **décision** : adapt
- **raison** : hive Amcache.hve = existence/installation/drivers + SHA-1 pour threat-intel + détection timestomping (LinkDate vs FileKeyLastWrite) + drivers non signés out-of-box (BYOVD). Distinct de Prefetch (existence ≠ exécution) et du registre généraliste.
- **dedup** : non — corpus Amcache spécifique (AmcacheParser, replay .LOG1/.LOG2). Le registre généraliste (#7) renvoie vers ce skill pour l'analyse Amcache approfondie.
- **chemin library** : `packages/skills/library/analyzing-windows-amcache-artifacts/SKILL.md`
- **frameworks** : MITRE ATT&CK T1070.004/T1070.006, T1036.005, T1014, T1005 ; NIST CSF + SP 800-86.
- **état** : écrit, conforme §12 (principe « existence ≠ exécution », collecte obligatoire des transaction logs, BYOVD).

## 6. analyzing-windows-registry-for-artifacts
- **décision** : adapt
- **raison** : analyse registre généraliste — activité utilisateur, persistance/autorun, logiciels, USB, réseau, timezone. RegRipper/Registry Explorer/python-registry. Couche large couvrant plusieurs sous-artefacts (UserAssist, BAM/DAM, USBSTOR, ShimCache).
- **dedup** : non, mais chevauche partiellement #5 (Amcache), #8 (ShellBags), #6-USB (#7 du lot) : le keeper renvoie explicitement vers les skills dédiés pour Amcache, ShellBags, et l'historique USB → pas de duplication, hiérarchie claire (généraliste → spécialisés). Garde-fou §5 : credentials SAM jamais extraits pour réutilisation.
- **chemin library** : `packages/skills/library/analyzing-windows-registry-artifacts/SKILL.md`
- **frameworks** : MITRE ATT&CK T1012, T1547.001, T1112, T1003.002, T1025 ; NIST CSF + SP 800-86.
- **état** : écrit, conforme §12 (hive=preuve read-only, .LOG pour dirty-hive, SAM off-limits §5 secrets gate).

## 7. analyzing-windows-shellbag-artifacts
- **décision** : adapt
- **raison** : ShellBags = preuve de navigation **folder** (Explorer) persistant après suppression/déconnexion ; preuve d'accès USB/share/zip même disparu. Distinct du LNK (fichier) et du registre généraliste (sous-clé spécifique BagMRU/Bags, outils dédiés SBECmd/ShellBags Explorer).
- **dedup** : non — limites propres explicitées (folder-only, Explorer-only). Renvoie vers #6/USB pour corrélation device.
- **chemin library** : `packages/skills/library/analyzing-windows-shellbag-artifacts/SKILL.md`
- **frameworks** : MITRE ATT&CK T1083, T1074.001, T1135, T1025, T1070.004 ; NIST CSF + SP 800-86.
- **état** : écrit, conforme §12 (folder≠fichier, absence≠non-accès, timestamps à corroborer).

## 8. analyzing-usb-device-connection-history
- **décision** : adapt
- **raison** : historique USB/média amovible = exfiltration. Corrélation multi-source (USBSTOR + MountedDevices + MountPoints2 + SetupAPI + Event Logs) → identité device (VID/PID/serial), lettre, utilisateur, premier/dernier branchement. Lentille distincte, transversale aux artefacts.
- **dedup** : non — skill de corrélation dédié. Garde-fou : connexion ≠ exfiltration (corroborer USN/LNK/ShellBag). Renvoie vers #6 (registre) sans le dupliquer.
- **chemin library** : `packages/skills/library/analyzing-usb-device-connection-history/SKILL.md`
- **frameworks** : MITRE ATT&CK T1052.001, T1025, T1091, T1005, T1074.001 ; NIST CSF + SP 800-86.
- **état** : écrit, conforme §12 (corrélation>clé unique, identité=VID/PID+serial, attribution user via MountPoints2).

## 9. extracting-windows-event-logs-artifacts
- **décision** : adapt
- **raison** : EVTX = mouvement latéral, privesc, persistance, pass-the-hash, log-clearing. Chainsaw+Sigma / Hayabusa / EvtxECmd / python-evtx ; IDs critiques (4624/4625/4688/4697/4720/1102…). Cœur DFIR, distinct des artefacts disque/registre.
- **dedup** : non. Périmètre : investigation de preuve EVTX (≠ authoring de règles SIEM live, qui resterait T1 SOC/threat-detection). Garde-fou : ne jamais clear/forge les logs (le clearing 1102/104 est justement la cible — T1070.001).
- **chemin library** : `packages/skills/library/analyzing-windows-event-logs-artifacts/SKILL.md`
- **frameworks** : MITRE ATT&CK T1005, T1074, T1119, T1070 (T1070.001 log clear), T1021 ; NIST CSF + SP 800-86.
- **état** : écrit, conforme §12 (triage rules→confirmation raw, LogonType clés, clearing=finding).

## 10. performing-windows-artifact-analysis-with-eric-zimmerman-tools
- **décision** : adapt (UMBRELLA / méthodologie large)
- **raison** : skill-parapluie de la suite EZ Tools + KAPE (MFTECmd/PECmd/RECmd/EvtxECmd/LECmd/JLECmd/SBECmd/AmcacheParser/Timeline Explorer). Valeur = orchestration collect→process→analyze + super-timeline + détection timestomping $SI vs $FN. Gardé comme couche méthodologique chapeau.
- **dedup** : non — c'est l'orchestrateur ; renvoie explicitement vers les skills mono-artefact (#1,#3,#5,#6,#7,#8,#9) pour la profondeur. Chevauchement assumé et hiérarchisé (umbrella vs spécialisés), pas une duplication.
- **chemin library** : `packages/skills/library/performing-windows-artifact-analysis-with-ez-tools/SKILL.md`
- **frameworks** : MITRE ATT&CK T1005, T1074, T1119, T1070, T1059 ; NIST CSF + SP 800-86 (4 phases).
- **état** : écrit, conforme §12 (NIST SP 800-86 phases, $SI vs $FN timestomping, corrélation multi-classes, defer aux skills dédiés).

---

## Bilan LOT O

- **10 slugs source couverts** (aucun perdu).
- **8 keepers écrits** (adapt) ; **2 folds** (LNK seul → canonique LNK+JumpList ; Prefetch-python → canonique Prefetch).
- **0 reject** (garde-fou forensique : aucun CORE anti-forensique ; l'audit gardait le critère reject mais ne l'a pas déclenché).
- Tous tier T2, status library, cluster `cyber:digital-forensics`, frameworks MITRE ATT&CK + NIST CSF + NIST SP 800-86 préservés.
- §5 (read-only preuve, custody, pas de divulgation secrets/PII) + §11 (pas de PAYG, pas de $/€) appliqués à chaque keeper.
- HARD respecté : pas de ledger.tsv, pas de git add/commit/push ; seuls les 8 dossiers library + ce shard ont été écrits.
- Re-audit : si le repo source >6 mois sans maj, ou si un futur "agent forensique" est scopé en ROADMAP (alors déclarer les actions risquées via `config/permissions.json`, jamais en dur).

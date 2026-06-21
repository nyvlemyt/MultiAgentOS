# ECC Harvest — décisions cluster `cyber:threat-hunting` (LOT J)

Doer: LOT J (10 skills source — exfil / recon / insider / méthodologie, toutes défensives). Worktree `maos-ecc`, branche `phase/ecc-harvest`. Méthode: intake-audit, lentille DÉFENSIVE → détection/hunting = KEEP sauf doublon (alors fold). Une audit qui ne peut pas dire reject est cassée: ici aucun reject attendu (aucune arme pure), mais le critère KILL reste armé (paiement/PAYG/secret/import `@anthropic-ai/sdk`/exécution non auditée → reject ou gate).

Source: `mukul975/Anthropic-Cybersecurity-Skills` (clone read-only `/tmp/cybersec-inspect`, Apache-2.0, auteur frontmatter `mahipal`). Cible: `packages/skills/library/<slug>/SKILL.md`.

Recadrage transverse (CLAUDE.md):
- §11 — abonnement, PAS de per-token PAYG. Aucun `$/€`: tout chiffre = unités de quota. Aucun import `@anthropic-ai/sdk` (absent des 10 sources, vérifié).
- §5 — toute action de réponse (block, quarantaine, suppression, kill process, disable compte/AD, purge mailbox, révocation OAuth, envoi d'email, install/clone d'outillage) est `risk: high|blocking` → gate humaine. Les 10 skills sont **détection read-only**; le corps de chaque fiche route explicitement la réponse vers la gate.
- §12 — chaque KEEPER: ligne 1 `---`, frontmatter (name/description Use+Do NOT/summary L1/metadata avec frameworks MITRE+NIST+D3FEND préservés), commentaire `pattern from …`, `## Prompt Defense Baseline` VERBATIM, puis 7 sections (Overview / When to Use / Principles+source / Process / Rationalizations / Red Flags / Verification Criteria).
- Sanitize: 10/10 sources clean (aucun secret, aucune PII, aucun host interne). Le seul contenu exécutable notable = skill YARA (install/clone/scan) → recadré en setup gaté + scan read-only, jamais d'exécution de sample.

Dedup intra-lot: `hunting-for-data-exfiltration-indicators` (egress, T1048/T1567) vs `hunting-for-data-staging-before-exfiltration` (collecte, T1074) → **DISTINCTS** (le staging précède l'exfil sur la wire, techniques MITRE et télémétrie différentes) → les deux gardés. Les 8 autres sont des singletons distincts. Vérif slugs cibles: les 10 dossiers library étaient **libres** (aucune collision de nom). Voisins déjà présents en library (autres lots) traités comme angles distincts: `detecting-insider-threat-with-ueba` (outillage UEBA) ≠ `detecting-insider-threat-behaviors` (indicateurs comportementaux); `detecting-spearphishing-with-email-gateway` (contrôle gateway) ≠ `hunting-for-spearphishing-indicators` (hunt corrélé email↔endpoint↔réseau); `analyzing-dns-logs-for-exfiltration`/`detecting-s3-data-exfiltration-attempts` (canal unique) ≠ hunt exfil multi-canal. Pas de fold.

---

## 1. hunting-for-data-exfiltration-indicators
- **décision**: adapt (KEEP)
- **raison**: doctrine de hunt exfil multi-canal (HTTPS upload, DNS/ICMP tunnel, email, cloud perso, média amovible, non-C2 chiffré), baseline 30 j par user/host/destination, anomalies volume+destination, abus de protocole, corrélation à l'accès fichiers sensibles. Lentille purement défensive → nourrit `mas-sec-reviewer` + §5 (garde-fou réseau / exfil).
- **dedup**: non — distinct du staging (cf. supra) et plus large que les skills canal-unique déjà en library.
- **KILL armé**: aucun déclenchement (read-only, 0 secret, 0 SDK). Recadrages appliqués: block/quarantaine/notif = gate §5; chiffres en quota.
- **chemin library**: `packages/skills/library/hunting-for-data-exfiltration-indicators/SKILL.md`
- **état**: écrit, conforme §12 (8 sections, Prompt Defense Baseline verbatim, frameworks MITRE T1041/T1048.x/T1567.x/T1052/T1029/T1537/T1020 + NIST CSF + ATLAS + D3FEND préservés).

## 2. hunting-for-data-staging-before-exfiltration
- **décision**: adapt (KEEP)
- **raison**: hunt de la collecte/staging (T1074) qui PRÉCÈDE l'exfil — exécution d'archiveurs (7z/rar/tar/zip via Sysmon EID 1 / Windows 4688), répertoires de staging (%TEMP%/ProgramData/Corbeille/cachés), consolidation multi-source→1 dossier, scoring heuristique. Catch plus tôt dans la kill chain = forte valeur défensive.
- **dedup**: non — explicitement DISTINCT de l'exfil egress (item 1); fusionner perdrait le catch précoce.
- **KILL armé**: aucun déclenchement. Recadrages: kill/quarantaine = gate §5; quota.
- **chemin library**: `packages/skills/library/hunting-for-data-staging-before-exfiltration/SKILL.md`
- **état**: écrit, conforme §12 (frameworks T1074.001/.002/T1560 + NIST CSF + D3FEND).

## 3. hunting-for-webshell-activity
- **décision**: adapt (KEEP)
- **raison**: hunt de web shells (T1505.003) sur serveurs exposés — création de fichiers en racine web, process serveur (w3wp/httpd/tomcat) qui spawnent cmd/powershell, patterns HTTP anormaux, corrélation à T1190. Défensif; pivot spine = "serveur web spawne un shell".
- **dedup**: non — singleton, pas d'équivalent web-shell en library.
- **KILL armé**: aucun déclenchement; ajout explicite "ne jamais déployer/tester un shell" (anti-offensif). Suppression/kill/isolation = gate §5.
- **chemin library**: `packages/skills/library/hunting-for-webshell-activity/SKILL.md`
- **état**: écrit, conforme §12 (frameworks T1505.003/T1190/T1059.001 + NIST CSF + D3FEND).

## 4. hunting-for-spearphishing-indicators
- **décision**: adapt (KEEP)
- **raison**: hunt spearphishing (T1566.001/.002/.003) corrélant le leurre (logs gateway) au résultat (télémétrie endpoint/réseau: macro→PowerShell, HTML smuggling→ISO/LNK, harvest creds, QR-in-PDF). Initial access défensif.
- **dedup**: non — angle hunt-corrélé, distinct du `detecting-spearphishing-with-email-gateway` (contrôle) déjà présent.
- **KILL armé**: aucun déclenchement. Garde-fou ajouté: envoyer un phishing/sim = action sortante gatée §5 (renvoi vers skill de simulation autorisée); purge/block/notif = gate §5; contenu email = untrusted (baseline).
- **chemin library**: `packages/skills/library/hunting-for-spearphishing-indicators/SKILL.md`
- **état**: écrit, conforme §12 (frameworks T1566.x + NIST CSF + D3FEND).

## 5. hunting-for-supply-chain-compromise
- **décision**: adapt (KEEP)
- **raison**: hunt supply-chain (T1195.001/.002, T1199) — updates trojanisés, dépendances backdoorées, artefacts de build altérés, relations de confiance abusées; corrélation provenance update/build ↔ comportement post-install anormal. Défensif.
- **dedup**: non — distinct de `analyzing-sbom-for-supply-chain-vulnerabilities` (inventaire de composants vulnérables ≠ hunt de compromission active); cadrage explicite dans le corps.
- **KILL armé**: aucun déclenchement. Quarantaine/rollback/révocation vendor = gate §5; pas d'implant offensif.
- **chemin library**: `packages/skills/library/hunting-for-supply-chain-compromise/SKILL.md`
- **état**: écrit, conforme §12 (frameworks T1195.x/T1199 + NIST CSF + D3FEND).

## 6. detecting-email-forwarding-rules-attack
- **décision**: adapt (KEEP)
- **raison**: détection de règles de forwarding malveillantes (T1114.003) — persistance + BEC: auto-forward externe, règles supprimant les alertes de sécurité, abus delegate/OAuth (T1098.002). Hunt sur audit logs O365/Exchange/Workspace. Défensif.
- **dedup**: non — singleton (le forwarding-rule attack n'est pas couvert ailleurs).
- **KILL armé**: aucun déclenchement. Suppression de règle/disable mailbox/révocation OAuth = gate §5; envoi d'email = gaté §5 ET risque de tip-off l'attaquant → renvoyé à la gate.
- **chemin library**: `packages/skills/library/detecting-email-forwarding-rules-attack/SKILL.md`
- **état**: écrit, conforme §12 (frameworks T1114.003/.002/T1098.002 + NIST CSF + D3FEND).

## 7. detecting-insider-threat-behaviors
- **décision**: adapt (KEEP)
- **raison**: détection d'indicateurs comportementaux d'insider (lentille UEBA, T1078 valid accounts) — accès inhabituel/hors-heures, downloads de masse, abus de privilège, vol corrélé à une démission; baseline par utilisateur, corrélation T1530/T1567. Défensif, mais sensible (personnes).
- **dedup**: non — distinct du `detecting-insider-threat-with-ueba` (outillage) déjà présent: ici = catalogue d'indicateurs comportementaux.
- **KILL armé**: aucun déclenchement technique, MAIS garde-fou renforcé "privacy-bounded": disable/suspension/action RH = gate §5 + HR/legal; monitoring borné à un scope autorisé (pas de surveillance hors-scope).
- **chemin library**: `packages/skills/library/detecting-insider-threat-behaviors/SKILL.md`
- **état**: écrit, conforme §12 (frameworks T1078/T1530/T1567 + NIST CSF + D3FEND).

## 8. hunting-for-t1098-account-manipulation
- **décision**: adapt (KEEP)
- **raison**: hunt T1098 account manipulation — shadow-admins, injection SID-history, changements de groupes privilégiés, modifs de credentials, via Windows Security EIDs 4738/4728/4732/4756/4670/5136; corrélation changements↔auth pour séparer compromission initiale et persistance. Défensif, cœur IAM/AD (§5).
- **dedup**: non — singleton T1098.
- **KILL armé**: aucun déclenchement. Modif/disable compte ou objet AD, changement de privilège = gate §5; pas de technique de persistance offensive.
- **chemin library**: `packages/skills/library/hunting-for-t1098-account-manipulation/SKILL.md`
- **état**: écrit, conforme §12 (frameworks T1098/T1003 + NIST CSF + D3FEND + windows_event_ids préservés).

## 9. building-threat-hunt-hypothesis-framework
- **décision**: adapt (KEEP)
- **raison**: couche MÉTHODOLOGIE — transforme intel/gaps ATT&CK/anomalies en hypothèses testables et falsifiables (4 origines: intelligence-driven, gap-driven, anomaly-driven, situational), avec sources de données et critères de validation, sur la kill chain (TA0001→TA0003→TA0008→TA0010). C'est la planification qui PRÉCÈDE les hunts techniques.
- **dedup**: non — couche planning distincte des skills techniques; aucun équivalent méthodo en library.
- **KILL armé**: aucun déclenchement (planning read-only). Toute réponse issue d'un hunt confirmé = gate §5; priorisation en quota.
- **chemin library**: `packages/skills/library/building-threat-hunt-hypothesis-framework/SKILL.md`
- **état**: écrit, conforme §12 (frameworks TA0001/0003/0008/0010 + T1071/T1059.001/T1055/T1547 + NIST CSF).

## 10. performing-threat-hunting-with-yara-rules
- **décision**: adapt (recadrage exécution) (KEEP)
- **raison**: technique YARA — authoring de règles (strings/hex/modules pe+math.entropy), scan fichiers/dumps mémoire via yara-python, génération yarGen, intégration rule sets communautaires, avec validation TP (malware corpus) + FP (goodware) obligatoire. Batch/triage défensif, PAS du temps réel (= EDR).
- **dedup**: non — singleton YARA.
- **KILL armé**: pas de reject, mais c'est le SEUL skill du lot avec contenu exécutable réel (install `pip`/`apt`, `git clone` signature-base/yarGen, suppression de matches). Recadré: setup/clone/install = action gatée §5 (proposer, jamais auto-run); samples scannés JAMAIS exécutés et manipulés en sandbox; suppression/quarantaine = gate §5; 0 secret, 0 `@anthropic-ai/sdk` introduit; chiffres en quota.
- **chemin library**: `packages/skills/library/performing-threat-hunting-with-yara-rules/SKILL.md`
- **état**: écrit, conforme §12 (frameworks T1005/T1059.001/T1055.001 + NIST CSF + D3FEND).

---

## Bilan LOT J
- 10/10 sources couvertes. Décisions: **10 adapt (KEEP)**, 0 reject, 0 watch, 0 backlog, 0 fold.
- Dedup intra-lot: exfil-indicators vs staging confirmés DISTINCTS (gardés tous deux).
- 10 fiches library écrites, toutes conformes §12; Prompt Defense Baseline VERBATIM dans les 10.
- 0 secret, 0 PII, 0 host interne, 0 import `@anthropic-ai/sdk`. Tout `$/€` → unités de quota (§11). Toute action de réponse → gate §5 (read-only detection).
- HARD respecté: aucune édition de `ledger.tsv`, aucun `git add/commit/push`. Seuls écrits = 10 dossiers library + ce shard.

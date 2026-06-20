# ECC Harvest — décisions LOT F : `cyber:threat-hunting` (détection credential/AD-attack)

Doer : LOT F (12 slugs source). Worktree `maos-ecc`, branche `phase/ecc-harvest`. Méthode : intake-audit, barre LARGE T1 défensif.
Source : `mukul975/Anthropic-Cybersecurity-Skills` (Apache-2.0), `/tmp/cybersec-inspect/skills/<slug>/SKILL.md`. Cible : `packages/skills/library/<slug>/SKILL.md`.

## Garde-fous appliqués (étape 0)

- **Lentille défensive** : les 12 sont des skills de *détection / threat-hunting* (lentille detect+mitigate). Garde par défaut, sauf doublon → fold. Aucune arme pure trouvée (les exploitants — `exploiting-kerberoasting-with-impacket`, `performing-kerberoasting-attack`, `conducting-domain-persistence-with-dcsync` — ne sont PAS dans ce lot).
- **Strip armes → signatures de détection** : les sources nomment des outils offensifs (Mimikatz, Rubeus, Impacket, PrintSpoofer, Responder, ntlmrelayx, PetitPotam) **uniquement comme indicateurs à reconnaître**. Aucun payload exécutable conservé ; chaque keeper interdit explicitement de lancer ces outils (Red Flags + Rationalizations). Les requêtes (Splunk/KQL/Sigma) et lectures PowerShell sont **read-only** (télémétrie ; `Get-*` seulement, pas de `Set-*`/GPO inline).
- **§5** : toute action de réponse (disable compte, reset KRBTGT, kill/isolate, rotation, révocation cert) est marquée *human-gated*, jamais auto-exécutée.
- **§11** : aucun chiffre $/€ ; coût = quota d'abonnement. Aucun `@anthropic-ai/sdk` (absent des sources).
- **Frameworks préservés** : MITRE ATT&CK (technique IDs), MITRE ATLAS (NTLM-relay), NIST CSF, NIST AI RMF, D3FEND — recopiés dans `metadata.frameworks`.
- **Sanitize** : 12/12 sources clean (pas de secret/PII/clé interne).

## Dédup interne au lot

Deux paires détectent la même attaque → **fold** dans la variante la plus riche (conservée comme canonique) :

- DCSync : `hunting-for-dcsync-attacks` (mince) **→ FOLD dans** `detecting-dcsync-attack-in-active-directory` (riche : requêtes 4662 + Sigma + 5 scénarios + GUIDs). Canonique = `detecting-dcsync-attack-in-active-directory`.
- NTLM relay : `hunting-for-ntlm-relay-attacks` (mince, 73 l.) **→ FOLD dans** `detecting-ntlm-relay-with-event-correlation` (très riche : 8 étapes, requêtes complètes, ATLAS). Canonique = `detecting-ntlm-relay-with-event-correlation`.

Pas de collision avec l'index ECC↔cyber existant (cf. `cybersec-clusters.md §collisions` = vide) ; les 12 slugs cibles étaient tous libres dans `library/`.

---

## Décisions item par item (12 slugs source)

### detecting-dcsync-attack-in-active-directory
- **décision** : adapt (CANONIQUE de la paire DCSync)
- **raison** : détection T1003.006 read-only — compte non-DC exerçant les droits de réplication (Event 4662, AccessMask 0x100, 3 GUIDs DS-Replication-*), corroboration RPC MS-DRSR depuis IP non-DC, allowlist AAD Connect/SCCM, pivot follow-on Golden Ticket. Cœur défensif §5/credential-access, nourrit `mas-sec-reviewer`.
- **fold reçu** : `hunting-for-dcsync-attacks` (variante mince absorbée : workflow + output réduits, rien d'unique).
- **chemin library** : `packages/skills/library/detecting-dcsync-attack-in-active-directory/SKILL.md`
- **état** : écrit. 8 sections (Prompt Defense Baseline VERBATIM + 7 §12), summary L1, metadata+frameworks, 0 sdk, 0 secret, réponses §5-gated.

### hunting-for-dcsync-attacks
- **décision** : fold → `detecting-dcsync-attack-in-active-directory`
- **raison** : même technique (T1003.006), même signal (Event 4662 / DS-Replication-Get-Changes / non-DC). Strictement un sous-ensemble de la canonique (pas de Sigma, pas de scénarios, pas de corrélation réseau détaillée). Garder les deux = duplication.
- **chemin library** : aucun (folded).
- **état** : absorbé dans la canonique (mentionné dans son commentaire `<!-- pattern … (folds: hunting-for-dcsync-attacks) -->`).

### detecting-golden-ticket-attacks-in-kerberos-logs
- **décision** : adapt
- **raison** : détection T1558.001 read-only — anomalies Kerberos (4768/4769) : TGS sans TGT préalable, RC4 (0x17) en domaine AES, durées hors-politique, SIDs inexistants, âge KRBTGT, échecs validation PAC (KB5008380+). Pivot aval de DCSync (vol KRBTGT). Requêtes Splunk/KQL conservées.
- **dedup** : non — distinct de DCSync (amont) et de Kerberoasting (TGS cracking, technique différente T1558.003).
- **chemin library** : `packages/skills/library/detecting-golden-ticket-attacks-in-kerberos-logs/SKILL.md`
- **état** : écrit, conforme (remédiation KRBTGT double-rotation §5-gated, no $/€).

### detecting-kerberoasting-attacks
- **décision** : adapt
- **raison** : détection T1558.003 + AS-REP roasting T1558.004 read-only — TGS-REQ massifs distincts (Event 4769) en RC4 ciblant des comptes à SPN, comptes DONT_REQUIRE_PREAUTH. Source mince (template hunt générique) → corps enrichi de signatures concrètes (fenêtre temps + dc(ServiceName) + 0x17 + pondération SPN privilégié) fidèles à la technique. Outils Rubeus/GetUserSPNs reconnus, jamais lancés.
- **dedup** : non — technique distincte (cracking TGS hors-ligne) de Golden Ticket et DCSync.
- **chemin library** : `packages/skills/library/detecting-kerberoasting-attacks/SKILL.md`
- **état** : écrit, conforme.

### detecting-pass-the-hash-attacks
- **décision** : adapt
- **raison** : détection T1550.002 (+ Pass-the-Ticket T1550.003) read-only — logons NTLM Type-3 (4624 LT3, NtLmSsp) là où Kerberos est attendu, propagation latérale rapide multi-hôtes, corrélation avec dump LSASS amont. Source mince → enrichie de requêtes baseline NTLM-vs-Kerberos. Outils sekurlsa::pth/psexec/CME reconnus, jamais lancés.
- **dedup** : non — distinct du dump (T1003) qui le précède ; PtH = réutilisation de hash, pas extraction.
- **chemin library** : `packages/skills/library/detecting-pass-the-hash-attacks/SKILL.md`
- **état** : écrit, conforme.

### detecting-ntlm-relay-with-event-correlation
- **décision** : adapt (CANONIQUE de la paire NTLM-relay)
- **raison** : détection T1557.001 + T1187 read-only la plus riche du lot (8 étapes) — mismatch IP↔WorkstationName (4624 LT3 NTLM), spraying multi-hôtes, downgrade NTLMv1, coercition machine-account (PetitPotam/DFSCoerce/PrinterBug → AD CS/LDAP → DCSync), poisoning Responder (LLMNR 5355 / NBT-NS 137 / mDNS 5353), audit posture SMB/LDAP signing + channel binding (Get-* read-only). Porte ATLAS + NIST AI RMF. Disclaimer "authorized testing" source remplacé par cadrage défensif §5.
- **fold reçu** : `hunting-for-ntlm-relay-attacks` (variante mince absorbée).
- **chemin library** : `packages/skills/library/detecting-ntlm-relay-with-event-correlation/SKILL.md`
- **état** : écrit, conforme (audit posture = `Get-*` seulement, pas de `Set-*`; réponses §5-gated; frameworks ATLAS/AI-RMF préservés).

### hunting-for-ntlm-relay-attacks
- **décision** : fold → `detecting-ntlm-relay-with-event-correlation`
- **raison** : même technique (T1557.001), même signaux (mismatch IP/hostname, NTLMSSP, machine-account, SMB signing). Sous-ensemble strict de la canonique (description haut niveau, pas de requêtes complètes ni d'étapes). Garder = duplication.
- **chemin library** : aucun (folded).
- **état** : absorbé (commentaire `<!-- … (folds: hunting-for-ntlm-relay-attacks) -->`).

### detecting-mimikatz-execution-patterns
- **décision** : adapt
- **raison** : détection T1003.001 (+ techniques activées 006/T1558) read-only — signatures de modules en ligne de commande (sekurlsa/lsadump/kerberos::/crypto::), accès LSASS (Sysmon 10), chargement réflexif/in-memory (Invoke-Mimikatz, script-block/AMSI), indicateurs binaire/driver (mimidrv). Behavioral > filename (résiste au renommage). Pivot follow-on DCSync/golden. Outil jamais lancé.
- **dedup** : chevauche `detecting-t1003-credential-dumping-with-edr` mais distinct = lentille **Mimikatz-spécifique** (modules + reflective loading) vs la lentille T1003 générique (procdump/NTDS/SAM/VSS). Renvoi croisé explicite.
- **chemin library** : `packages/skills/library/detecting-mimikatz-execution-patterns/SKILL.md`
- **état** : écrit, conforme.

### detecting-t1003-credential-dumping-with-edr
- **décision** : adapt
- **raison** : détection T1003.* read-only (la plus complète sur le dump) — accès LSASS (Sysmon 10, masques GrantedAccess + allowlist processus bénins), signatures outils (sekurlsa, procdump -ma lsass, comsvcs MiniDump, ntdsutil IFM, reg save SAM/SECURITY/SYSTEM, vssadmin shadow), NTDS.dit via shadow copy, export ruches, DCSync (renvoi). Requêtes Splunk/KQL(MDE)/Sigma conservées. Recommande Credential Guard/RunAsPPL en prévention.
- **dedup** : non — umbrella T1003 ; Mimikatz = sous-cas outillé, DCSync = sous-technique .006 traitée à part en profondeur.
- **chemin library** : `packages/skills/library/detecting-t1003-credential-dumping-with-edr/SKILL.md`
- **état** : écrit, conforme (containment §5-gated, no $/€).

### detecting-service-account-abuse
- **décision** : adapt
- **raison** : détection T1078.002 (+ T1021/T1098/T1550.002) read-only — abus de comptes de service détecté par déviation d'un baseline comportemental (hôtes/logon-types/heures/ressources) : logon interactif (LT2) ou RDP (LT10) anormal, accès hors-scope, off-hours, pic de privilège (svc DA → DCSync). Source mince → enrichie de la doctrine baseline + requêtes 4624 LT2/10. Lien §5 IAM/gating cross-projet.
- **dedup** : non — lentille identité/comportement, complémentaire des techniques de vol de credential.
- **chemin library** : `packages/skills/library/detecting-service-account-abuse/SKILL.md`
- **état** : écrit, conforme (rotation = workflow séparé human-gated, pas un test).

### detecting-t1548-abuse-elevation-control-mechanism
- **décision** : adapt
- **raison** : détection T1548.001-.004 read-only — UAC bypass Windows (Sysmon 12/13 sur HKCU\…\shell\open\command ; LOLBins auto-élévation fodhelper/eventvwr/sdclt/slui/cmstp depuis parent anormal ; saut d'intégrité sans consent), setuid/setgid + sudo Linux. Requêtes Splunk/KQL/Sigma conservées.
- **dedup** : chevauche `detecting-privilege-escalation-attempts` mais distinct = lentille **mécanisme d'élévation (UAC/setuid/sudo)** spécifique ; renvoi croisé.
- **chemin library** : `packages/skills/library/detecting-t1548-abuse-elevation-control-mechanism/SKILL.md`
- **état** : écrit, conforme.

### detecting-privilege-escalation-attempts
- **décision** : adapt
- **raison** : détection privesc umbrella read-only — T1134 (token impersonation : Potato family, PrintSpoofer service→SYSTEM via SeImpersonate), T1548.002 (UAC), T1574.009 (unquoted/weak service path), T1068 (kernel/CVE), sudo/SUID Linux. Source mince → enrichie de signatures behavior (parent service→shell SYSTEM, Sigma) fidèles. Outils Potato/PrintSpoofer reconnus, jamais lancés.
- **dedup** : chevauche `detecting-t1548` (UAC) mais distinct = umbrella plus large (token/service-path/exploit) ; renvoi croisé vers t1548 pour la profondeur UAC.
- **chemin library** : `packages/skills/library/detecting-privilege-escalation-attempts/SKILL.md`
- **état** : écrit, conforme.

---

## Bilan LOT F

| décision | n | slugs |
|---|---|---|
| adapt (keeper) | 10 | dcsync(canon), golden-ticket, kerberoasting, pass-the-hash, ntlm-relay(canon), mimikatz, t1003-edr, service-account, t1548, privesc-attempts |
| fold | 2 | hunting-for-dcsync-attacks → dcsync ; hunting-for-ntlm-relay-attacks → ntlm-relay |
| reject | 0 | (aucune arme pure dans ce lot ; les exploitants correspondants sont hors-lot) |

Re-audit : si la doctrine `mas-sec-reviewer` formalise une taxonomie credential-access (Phase 4 mémoire / §5 categories), revoir le mapping ATT&CK→catégories risquées de ces 10 keepers.

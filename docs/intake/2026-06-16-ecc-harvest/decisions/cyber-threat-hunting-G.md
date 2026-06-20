# ECC Harvest — décisions cluster `cyber:threat-hunting` (lot G)

Doer: lot G (12 slugs sources). Worktree `maos-ecc`. Méthode: intake-audit barre LARGE (T1, library).
Source cyber: `mukul975/Anthropic-Cybersecurity-Skills` (Apache-2.0). Cible: `packages/skills/library/<slug>/SKILL.md`.
Périmètre du lot: détection PowerShell / process-injection / execution / defense-evasion — **100 % DÉFENSIF** (blue-team).
Dedup contre `our-assets-index.md`, la lib existante (`analyzing-powershell-script-block-logging` déjà présent),
et `mas-sec-reviewer` / CLAUDE.md §5 (endpoint, egress allowed_hosts, destructive-op gating).
Le frontmatter source porte `subdomain: threat-hunting` + `frameworks` NIST-CSF/MITRE-ATTACK (+ NIST-AI-RMF +
d3fend selon le skill) : mappings préservés dans la metadata MAS.
Garde-fou défensif appliqué à chaque skill : lentille détection/hunting gardée ; toute machinerie offensive
(launcher Empire, injecteur, RunPE, commande LOLBin d'abus, suppression de shadow copies) reframée en IOC à
reconnaître, jamais en outil à produire. Remédiation (isolation, quarantaine, blocage egress, restore) = guidance
propriétaire, jamais une action MAOS (§5).
Sanitize: 0 secret réel, 0 PII, 0 `@anthropic-ai/sdk` dans les 12 sources. Recadrage transverse §11 : tout
chiffre = quota d'abonnement, jamais $/€ (les sources n'utilisaient pas de cash, recadrage léger).

## Dedup / folds décidés pour ce lot

- **PowerShell** : `detecting-suspicious-powershell-execution` (générique, mince — encoded cmds / AMSI bypass /
  download cradles / Empire C2) **FOLD →** `hunting-for-anomalous-powershell-execution` (même IOC, lentille hunt
  EDR+SIEM enrichie par la chaîne 4104→4103→process-creation). Le 3e angle PowerShell de la lib existante
  (`analyzing-powershell-script-block-logging`, forensics EVTX mono-hôte) reste distinct → renvoi explicite.
- **LOLBins** : `hunting-for-living-off-the-land-binaries` (plus large, peu de requêtes) **FOLD →**
  `hunting-for-lolbins-execution-in-endpoint-logs` (canonical riche : Splunk/KQL/Sigma, plus de binaires,
  parent-child, paths, egress).
- **Process injection** : `hunting-for-process-injection-techniques` (générique, JSON Sysmon, mince) **FOLD →**
  `detecting-t1055-process-injection-with-sysmon` (superset Sysmon : Events 8/10/7/25, requêtes prêtes,
  filtrage known-good, classification sous-techniques). `detecting-process-hollowing-technique` (T1055.012,
  image-mismatch / Hollows Hunter / pe-sieve) = sous-technique distincte → **KEEP** séparé.

Bilan : 12 sources → **9 keepers** (3 folds). 0 reject (lot intégralement défensif, aucune arme pure).

---

## analyzing-powershell-empire-artifacts
- **décision**: adapt (keep)
- **raison**: DÉTECTION des artefacts du framework C2 PowerShell Empire dans les logs Windows autorisés
  (4104/4103) — launcher par défaut `powershell -noP -sta -w 1 -enc`, IOC stager (`System.Net.WebClient`,
  `FromBase64String`), signatures de modules (Invoke-Mimikatz/Kerberoast/TokenManipulation), user-agents et URIs
  de staging par défaut. C'est de la détection d'outil attaquant, pas de l'opération d'Empire.
- **dedup**: non — distinct de `analyzing-powershell-script-block-logging` (forensics 4104 générique) ;
  ici = matching IOC spécifique Empire. Complète `mas-sec-reviewer` + §5 endpoint.
- **garde-fou défensif**: aucun launcher/stager/listener/module généré ; Base64 décodé en UTF-16LE pour
  inspection uniquement, jamais exécuté ; un seul match par défaut ≠ preuve (corroboration exigée).
- **chemin library**: `packages/skills/library/analyzing-powershell-empire-artifacts/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` NIST-CSF/NIST-AI-RMF/MITRE-ATTACK/d3fend préservé +
  Prompt Defense Baseline VERBATIM ; 7 sections §12 défensives ; 0 secret, 0 sdk, 0 cash).

## detecting-dll-sideloading-attacks
- **décision**: adapt (keep)
- **raison**: DÉTECTION du DLL side-loading / search-order hijacking (T1574.001/.002) — chasse Sysmon Event 7
  (Image Loaded + hash) et EDR pour DLL non-signées chargées hors du répertoire attendu par un binaire signé,
  apps signées lancées depuis Temp/AppData/Public (wrappers leurres), mismatch de hash, DLL proxying.
- **dedup**: non — angle hijacking DLL absent de notre surface ; complète `mas-sec-reviewer` + §5 endpoint.
- **garde-fou défensif**: aucune proxy/phantom DLL produite ; identité par hash (pas par nom) ; corrélation du
  comportement post-load exigée ; quarantaine = guidance propriétaire.
- **chemin library**: `packages/skills/library/detecting-dll-sideloading-attacks/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` NIST-CSF/MITRE-ATTACK/d3fend préservé + Prompt
  Defense Baseline VERBATIM ; 7 sections §12 défensives ; 0 secret, 0 sdk, 0 cash).

## detecting-process-hollowing-technique
- **décision**: adapt (keep — sous-technique distincte)
- **raison**: DÉTECTION du process hollowing (T1055.012 / RunPE) — séquence suspended-create → write → resume,
  mismatch image mémoire vs disque (Sysmon Event 25 ProcessTampering), incohérence nom/comportement
  (svchost/explorer/rundll32), corroboration mémoire (Volatility malfind, pe-sieve, Hollows Hunter).
- **dedup**: non — gardé distinct de `detecting-t1055-process-injection-with-sysmon` (famille T1055 générale) ;
  ici = signature hollowing spécifique + forensics mémoire. Renvoi explicite dans le corps.
- **garde-fou défensif**: aucun code suspended-create/unmap/write/resume produit ; CREATE_SUSPENDED seul ≠
  hollowing (séquence + image-mismatch exigés) ; isolation = guidance propriétaire.
- **chemin library**: `packages/skills/library/detecting-process-hollowing-technique/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` NIST-CSF/MITRE-ATTACK/d3fend préservé + Prompt
  Defense Baseline VERBATIM ; 7 sections §12 défensives ; 0 secret, 0 sdk, 0 cash).

## detecting-t1055-process-injection-with-sysmon
- **décision**: adapt (keep — CANONICAL injection)
- **raison**: DÉTECTION Sysmon de toute la famille T1055 (DLL/PE injection, thread-hijack, APC, hollowing,
  doppelganging) — Events 8 (CreateRemoteThread), 10 (ProcessAccess masques VM_WRITE/CREATE_THREAD), 7
  (DLL anormales), 25 (ProcessTampering) ; graphe source→cible, filtrage known-good, classification
  sous-techniques ; requêtes Splunk/KQL/Sigma prêtes.
- **dedup**: **FOLD** de `hunting-for-process-injection-techniques` (générique/mince) ici — superset Sysmon.
  Hollowing approfondi délégué à `detecting-process-hollowing-technique`.
- **garde-fou défensif**: aucun injecteur produit ; SourceImage!=TargetImage + masques d'accès exigés ;
  filtrage AV/debuggers/RMM intégré ; angle mort reflective-load noté ; containment = guidance propriétaire.
- **chemin library**: `packages/skills/library/detecting-t1055-process-injection-with-sysmon/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` NIST-CSF/MITRE-ATTACK/d3fend préservé + Prompt
  Defense Baseline VERBATIM ; 7 sections §12 défensives + 3 requêtes de référence read-only ; 0 secret, 0 sdk, 0 cash).

## detecting-suspicious-powershell-execution
- **décision**: fold (→ `hunting-for-anomalous-powershell-execution`)
- **raison**: doublon mince — mêmes IOC (encoded/Base64, AMSI bypass, download cradles, constrained-language
  evasion, agent Empire) que le keeper hunting, sans la chaîne 4104/4103/process-creation enrichie. Aucun angle
  unique justifiant un fichier séparé.
- **dedup**: oui — replié dans le canonical PowerShell hunt. T1620 (reflective load) + T1105 absorbés dans la
  metadata du keeper.
- **chemin library**: aucun (folded).
- **état**: folded. Aucun fichier créé ; couverture assurée par `hunting-for-anomalous-powershell-execution`.

## detecting-t1055-process-injection-with-sysmon — (déjà traité ci-dessus, canonical)
*(répété pour mémoire ; voir entrée plus haut)*

## hunting-for-anomalous-powershell-execution
- **décision**: adapt (keep — CANONICAL PowerShell hunt)
- **raison**: HUNT hypothèse-driven du PowerShell malveillant sur EDR+SIEM+logs Windows — source clé Script
  Block Logging 4104 (texte déobfusqué), réassemblage multi-blocs par ScriptBlock ID, détection encoded/Base64,
  AMSI bypass, download cradles IEX/Net.WebClient, evasion constrained-language, credential dumping, agents Empire.
- **dedup**: reçoit le **FOLD** de `detecting-suspicious-powershell-execution`. Distinct de
  `analyzing-powershell-script-block-logging` (forensics EVTX mono-hôte) → renvoi explicite dans le corps.
- **garde-fou défensif**: aucun payload/cradle/bypass produit ; un encoded cmd seul ≠ compromis (corrélation +
  baseline exigées) ; décodage UTF-16LE pour inspection seule ; containment = guidance propriétaire.
- **chemin library**: `packages/skills/library/hunting-for-anomalous-powershell-execution/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` NIST-CSF/MITRE-ATTACK préservé, T1620/T1105/T1562.001
  ajoutés depuis le fold + Prompt Defense Baseline VERBATIM ; 7 sections §12 défensives ; 0 secret, 0 sdk, 0 cash).

## hunting-for-defense-evasion-via-timestomping
- **décision**: adapt (keep)
- **raison**: DÉTECTION du timestomping NTFS (T1070.006) — comparaison $STANDARD_INFORMATION (0x10, user-writable)
  vs $FILE_NAME (0x30, kernel-only) dans le $MFT parsé (MFTECmd/analyzeMFT) ; 5 checks d'incohérence (SI<FN,
  nanosecondes zéro, gap > 1 an, entry-modified tardif) ; corroboration USN Journal (BASIC_INFO_CHANGE),
  ShimCache/Amcache, $LogFile ; baseline known-clean anti-FP.
- **dedup**: non — angle anti-forensique MFT absent de notre surface ; complète §5 endpoint/forensics.
- **garde-fou défensif**: aucun timestamp écrit / aucun outil de timestomping produit ; analyse read-only sur
  copies forensiques (jamais l'évidence live) ; SI<FN = lead, pas preuve (corroboration exigée).
- **chemin library**: `packages/skills/library/hunting-for-defense-evasion-via-timestomping/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` NIST-CSF/MITRE-ATTACK/d3fend préservé, T1070.006 mis
  en tête + Prompt Defense Baseline VERBATIM ; 7 sections §12 défensives ; 0 secret, 0 sdk, 0 cash).
  Note: la source contenait du Python d'analyse (read-only, parse MFT/USN/ShimCache CSV) — lentille gardée,
  reformulée en process défensif, pas de bloc de code exécutable embarqué (IOC + méthode décrits).

## hunting-for-living-off-the-cloud-techniques
- **décision**: adapt (keep)
- **raison**: HUNT de l'abus de services cloud/SaaS légitimes (Living off the Cloud) pour C2/staging/exfil —
  webhooks Discord/Telegram, Azure Functions C2 dynamique, exfil Google Docs/Notion, transfert vers compte cloud
  attaquant. Détection = egress vers SaaS de confiance qu'un hôte/process ne devrait pas joindre + cadence +
  volume/direction. Nourrit directement la lentille §5 allowed_hosts (egress réseau).
- **dedup**: non — angle cloud-abuse absent ; complète `mas-sec-reviewer` + §5 allowed_hosts.
- **garde-fou défensif**: aucun beacon/webhook C2/canal d'exfil produit ; domaine seul ≠ verdict (process +
  comportement + baseline exigés) ; blocage egress = guidance propriétaire.
- **chemin library**: `packages/skills/library/hunting-for-living-off-the-cloud-techniques/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` NIST-CSF/MITRE-ATTACK/d3fend préservé, T1102/T1567/
  T1537/T1048 mappés depuis Key Concepts + Prompt Defense Baseline VERBATIM ; 7 sections §12 défensives ; 0 secret,
  0 sdk, 0 cash).

## hunting-for-living-off-the-land-binaries
- **décision**: fold (→ `hunting-for-lolbins-execution-in-endpoint-logs`)
- **raison**: même domaine LOLBin/T1218, version plus large mais sans les requêtes prêtes (Splunk/KQL/Sigma),
  moins de binaires et de scénarios que le keeper endpoint-logs. Pas d'angle unique : la lentille hypothèse +
  baseline + watchlist est conservée dans le canonical.
- **dedup**: oui — replié dans `hunting-for-lolbins-execution-in-endpoint-logs`.
- **chemin library**: aucun (folded).
- **état**: folded. Couverture assurée par le canonical LOLBin.

## hunting-for-lolbins-execution-in-endpoint-logs
- **décision**: adapt (keep — CANONICAL LOLBin)
- **raison**: HUNT de l'abus de LOLBins (T1218 + voisins) dans les logs de création de process autorisés —
  watchlist LOLBAS + baseline 30j + détection arguments anormaux (certutil -urlcache/-decode, mshta http,
  regsvr32 Squiblydoo, rundll32 temp-DLL, msbuild inline, bitsadmin transfer, wmic XSL) + parents suspects +
  paths inhabituels + corrélation egress ; requêtes Splunk/KQL/Sigma prêtes.
- **dedup**: reçoit le **FOLD** de `hunting-for-living-off-the-land-binaries`.
- **garde-fou défensif**: aucune commande d'abus produite ; nom de binaire seul ≠ attaque (args/parent/path +
  baseline exigés) ; containment = guidance propriétaire.
- **chemin library**: `packages/skills/library/hunting-for-lolbins-execution-in-endpoint-logs/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` NIST-CSF/MITRE-ATTACK/d3fend préservé, T1218.*/T1197/
  T1140 mappés + Prompt Defense Baseline VERBATIM ; 7 sections §12 défensives + 3 requêtes de référence read-only ;
  0 secret, 0 sdk, 0 cash).

## hunting-for-process-injection-techniques
- **décision**: fold (→ `detecting-t1055-process-injection-with-sysmon`)
- **raison**: doublon générique/mince de la même famille T1055 (Sysmon Event 8/10) sans les requêtes prêtes ni
  le filtrage known-good ni la classification exhaustive des sous-techniques du keeper sysmon. Pas d'angle unique
  (la mention « Sysmon JSON » est couverte par le canonical).
- **dedup**: oui — replié dans `detecting-t1055-process-injection-with-sysmon`.
- **chemin library**: aucun (folded).
- **état**: folded. Couverture assurée par le canonical injection.

## hunting-for-shadow-copy-deletion
- **décision**: adapt (keep)
- **raison**: HUNT de la suppression de Volume Shadow Copies / Inhibit System Recovery (T1490) — indicateur
  pré-chiffrement ransomware à haute confiance. Détection des 4 vecteurs (vssadmin delete shadows /all /quiet,
  wmic shadowcopy delete, PowerShell Remove-WmiObject Win32_ShadowCopy, bcdedit recovery off) dans les logs de
  création de process ; corrélation à T1486/T1485 (chiffrement/destruction suivent souvent en minutes).
- **dedup**: non — angle T1490 absent ; complète §5 (la classe destructive `rm`/destruction que MAOS gate) +
  `mas-sec-reviewer`.
- **garde-fou défensif**: aucune suppression de shadow copy / aucun script de destruction produit (c'est
  exactement la classe destructive §5) ; suppression de masse rarement légitime → alerte haute-fidélité ;
  isolation/restore = guidance propriétaire.
- **chemin library**: `packages/skills/library/hunting-for-shadow-copy-deletion/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` NIST-CSF/MITRE-ATTACK/d3fend préservé, T1490 mis en
  tête + T1486/T1485 contexte + Prompt Defense Baseline VERBATIM ; 7 sections §12 défensives ; 0 secret, 0 sdk, 0 cash).

---

### Récap
- 12 sources → **9 keepers** (tous `adapt`) + **3 folds** + **0 reject**. Lot 100 % défensif (blue-team
  detection/hunting). Aucune arme pure attendue ni trouvée.
- Folds : `detecting-suspicious-powershell-execution` → `hunting-for-anomalous-powershell-execution` ;
  `hunting-for-living-off-the-land-binaries` → `hunting-for-lolbins-execution-in-endpoint-logs` ;
  `hunting-for-process-injection-techniques` → `detecting-t1055-process-injection-with-sysmon`.
  `detecting-process-hollowing-technique` gardé distinct (sous-technique T1055.012 + forensics mémoire).
- Garde-fou défensif appliqué partout : aucun outil offensif produit (launcher Empire, proxy DLL, injecteur,
  RunPE, commande LOLBin d'abus, suppression shadow copy). Toute remédiation = guidance propriétaire, jamais une
  action MAOS (§5 ; shadow-copy deletion = classe destructive explicitement gatée).
- `analyzing-powershell-empire-artifacts` = DÉTECTION d'artefacts d'un framework C2 attaquant → keep défensif,
  zéro payload. Base64 décodé pour inspection seule, jamais exécuté.
- Frameworks préservés dans la metadata des 9 : NIST-CSF + MITRE-ATTACK partout ; d3fend sur 7/9 ; NIST-AI-RMF
  sur `analyzing-powershell-empire-artifacts`. ATT&CK IDs raffinés vers les sous-techniques réelles décrites
  (T1059.001, T1574.00x, T1055.012, T1070.006, T1218.0xx, T1490, T1102/T1567/T1537) plutôt que les IDs génériques
  recyclés du frontmatter source (T1046/T1057/T1082/T1083) qui ne correspondaient pas au contenu.
- Tous nourrissent `mas-sec-reviewer` + la lentille §5 (endpoint, egress allowed_hosts pour LOTC, destructive-op
  gating pour shadow-copy deletion).
- Recadrage §11 transverse : 0 chiffre cash (les sources n'en avaient pas), tuning = quota d'abonnement.
- Garde-fous techniques : 0 `@anthropic-ai/sdk`, 0 secret réel/PII dans les 9 outputs. Le Python d'analyse de la
  source timestomping (read-only, parse CSV) a été distillé en méthode/IOC, sans embarquer de bloc exécutable.
- Dedup lib existante vérifiée : aucune collision de slug ; `analyzing-powershell-script-block-logging` (déjà
  présent) reste l'angle forensics 4104 distinct, renvoi croisé ajouté dans les deux keepers PowerShell.

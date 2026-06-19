# ECC Harvest — décisions lot EB (cluster `cyber:threat-detection`)

Doer : lot EB (7 skills). Worktree `maos-ecc`, branche `phase/ecc-harvest`. Méthode : `intake-audit` lifecycle complet par skill, barre LARGE (toutes T1, status `library`).
Source : `mukul975/Anthropic-Cybersecurity-Skills` (clone read-only `/tmp/cybersec-inspect`, Apache-2.0), auteur `mahipal`. Cible : `packages/skills/library/<slug>/SKILL.md`.

**Lentille — défense uniquement.** Les 7 skills sont des skills de **détection blue-team** : ils détectent des techniques d'attaquant (credential dumping, golden ticket, insider/UEBA, LotL/LOLBAS, pass-the-ticket, RDP brute-force) à partir de télémétrie (Sysmon, Windows Security EventID, EVTX, SIEM Splunk/Elastic). Aucun ne réalise l'attaque → aucun ne déclenche le KILL `intake-audit` (bascule en offensif). La lentille détection est préservée verbatim dans chaque corps.

**Recadrage MAOS transverse :**
- Abonnement (§11) : aucun chiffre $/€ ; tout coût = unités de quota (§8). Aucune des sources ne framait en cash — recadrage trivial.
- §5 (actions risquées gatées) : ces skills produisent des règles de détection + rapports JSON ; le déploiement Sysmon/AppLocker/WDAC ou tout changement sur un hôte est **guidance pour le propriétaire de l'hôte**, jamais une action sortante exécutée par MAOS. Cadré dans chaque Overview + Red Flags. Ils nourrissent `mas-sec-reviewer` et la lentille §5.
- §12 : forme exemplaire (ligne 1 `---` ; frontmatter name/description/summary L1 ≤200 tok/metadata{origin, license, cluster, tier, status, frameworks} ; commentaire source ; `## Prompt Defense Baseline` verbatim ; 7 sections §12 Overview/Principles citant la source/Process/Rationalizations/Red Flags/Verification).
- `frameworks` préservé depuis le frontmatter source : `nist_csf` (5/5 portent `DE.CM-01, DE.AE-02, DE.AE-06, ID.RA-05`) + `mitre_attack` (techniques natives du skill, non les T1078/T1190/T1059 génériques boilerplate quand une technique précise existe dans l'Overview).

**Sanitize :** secrets/PII/internal → 7/7 clean. `@anthropic-ai/sdk` → absent des 7 sources. Pas de clés, pas d'endpoints internes (les IP/hostnames présents sont des exemples factices `evil.example.com`, `WORKSTATION-01`).

**Bilan dup :** 1 fold détecté et appliqué — `detecting-living-off-the-land-with-lolbas` (mince : overview + steps numérotés, aucun delta technique) replié dans `detecting-living-off-the-land-attacks` (riche : Sysmon XML, règles Sigma, corrélation Python, détection réseau, anomalie parent-enfant, durcissement AppLocker/WDAC). Delta LOLBAS conservé (réf. projet LOLBAS, watchlist priorisée, scoring) dans le keeper. → **6 keepers, 1 fold**.

---

## detecting-credential-dumping-techniques
- **décision** : adapt_now → library.
- **identité** : détection du credential dumping (LSASS / SAM / NTDS.dit). Source `skills/detecting-credential-dumping-techniques/SKILL.md`, Apache-2.0. Obsolescence : faible (techniques AD stables ; Sysmon EventID 10 pérenne).
- **fit** : nourrit `mas-sec-reviewer` + lentille §5 (catégorie credential-access). Touche la surface doctrine sécurité-agent. Pas de dup dans `docs/knowledge/` ni `mas-*` (aucun skill n'adresse la détection AD/Windows).
- **3 coûts** : install ≈ 1 unité (réécriture §12, pas de code) ; maintenance ≈ nulle (doc statique, re-audit annuel) ; removal = trivial (1 dossier slug, réversible).
- **scores** : project_fit 4 · token_efficiency 4 (L1 summary) · safety 5 (détection pure) · implementation_effort 4 · evidence_maturity 4 · user_value 4 · phase_compatibility 5.
- **KILL** : aucune. Pas de PAYG, pas d'exécution de code par MAOS, pas de bascule offensive. Sanitize clean.
- **chemin library** : `packages/skills/library/detecting-credential-dumping-techniques/SKILL.md`.
- **frameworks** : nist_csf [DE.CM-01, DE.AE-02, DE.AE-06, ID.RA-05] ; mitre_attack [T1003] (technique native ; T1078/T1190/T1059/T1110 du frontmatter source = boilerplate générique, T1003 est la technique réelle du skill).
- **état** : keeper écrit, conforme (8 sections, Prompt Defense Baseline verbatim, 0 sdk, 0 secret). Re-audit : si repo source >6 mois stale.

## detecting-golden-ticket-forgery
- **décision** : adapt_now → library.
- **identité** : détection de forge de Golden Ticket Kerberos (T1558.001) via EventID 4769/4768 — downgrade RC4 (0x17), durées de ticket anormales, anomalies krbtgt. Apache-2.0. Obsolescence faible.
- **fit** : nourrit `mas-sec-reviewer` + §5 (credential-access/AD). Pas de dup ; distinct du credential-dumping (forge de ticket vs extraction de hash).
- **3 coûts** : install ≈ 1 ; maintenance nulle ; removal trivial.
- **scores** : project_fit 4 · token_efficiency 4 · safety 5 · implementation_effort 4 · evidence_maturity 4 · user_value 4 · phase_compatibility 5.
- **KILL** : aucune. Détection pure, sanitize clean.
- **chemin library** : `packages/skills/library/detecting-golden-ticket-forgery/SKILL.md`.
- **frameworks** : nist_csf [DE.CM-01, DE.AE-02, DE.AE-06, ID.RA-05] ; mitre_attack [T1558.001] (technique native explicite dans l'Overview).
- **état** : keeper écrit, conforme. Re-audit : repo >6 mois stale.

## detecting-insider-threat-with-ueba
- **décision** : adapt_now → library.
- **identité** : UEBA insider-threat — baselines comportementales Elasticsearch/OpenSearch, z-score, peer-group, corrélation indicateurs faibles → alerte composite. Couvre exfiltration (T1048/T1041), abus de privilège. Apache-2.0. Obsolescence faible.
- **fit** : nourrit `mas-sec-reviewer` + §5 (détection comportementale / exfiltration). Angle distinct (analytics statistiques, pas signatures). Pas de dup.
- **3 coûts** : install ≈ 1 ; maintenance nulle ; removal trivial.
- **scores** : project_fit 4 · token_efficiency 4 · safety 5 · implementation_effort 4 · evidence_maturity 4 · user_value 4 · phase_compatibility 5.
- **KILL** : aucune. Détection pure. Note privacy : UEBA surveille des utilisateurs → cadré « scope = données dont on est propriétaire/autorisé », pas de surveillance de tiers (Red Flags).
- **chemin library** : `packages/skills/library/detecting-insider-threat-with-ueba/SKILL.md`.
- **frameworks** : nist_csf [DE.CM-01, DE.AE-02, DE.AE-06, ID.RA-05] ; mitre_attack [T1078, T1048, T1041] (techniques natives du frontmatter, pertinentes : compte valide + exfiltration).
- **état** : keeper écrit, conforme. Re-audit : repo >6 mois stale.

## detecting-living-off-the-land-attacks  (RECEPTACLE du fold)
- **décision** : adapt_now → library. **Receptacle** du fold de `detecting-living-off-the-land-with-lolbas`.
- **identité** : détection d'abus de LOLBins (certutil, mshta, rundll32, regsvr32, msbuild, bitsadmin, wmic…) — config Sysmon dédiée, règles Sigma, corrélation Python (args suspects, réseau sortant, anomalie parent-enfant), durcissement AppLocker/WDAC. Source riche. Apache-2.0. Obsolescence faible.
- **fit** : nourrit `mas-sec-reviewer` + §5 (execution/defense-evasion). Pas de dup interne après fold. Garde-fou explicite : ne pas bloquer tous les LOLBins (outils légitimes) ; détecter le contexte anormal.
- **3 coûts** : install ≈ 1 ; maintenance nulle ; removal trivial.
- **scores** : project_fit 5 · token_efficiency 4 · safety 5 · implementation_effort 4 · evidence_maturity 5 (corpus le plus mûr du lot) · user_value 5 · phase_compatibility 5.
- **KILL** : aucune. Détection pure ; les snippets PowerShell/Sysmon sont du durcissement-hôte = guidance propriétaire (§5), jamais exécuté par MAOS (cadré Overview + Red Flags).
- **chemin library** : `packages/skills/library/detecting-living-off-the-land-attacks/SKILL.md`.
- **frameworks** : nist_csf [DE.CM-01, DE.AE-02, DE.AE-06, ID.RA-05] ; mitre_attack [T1218, T1105, T1059, T1047, T1127.001] (techniques natives présentes dans le corps source — LOLBin signed-binary-proxy, ingress-tool-transfer, command-interpreter, WMI, MSBuild).
- **état** : keeper écrit, conforme. Delta LOLBAS du fold conservé (réf. projet LOLBAS, watchlist priorisée, scoring de risque). Re-audit : repo >6 mois stale.

## detecting-living-off-the-land-with-lolbas
- **décision** : reject (FOLD, pas un rejet de valeur).
- **raison** : doublon mince de `detecting-living-off-the-land-attacks` — même cible (LOLBins certutil/regsvr32/mshta/rundll32), même méthode (process telemetry + Sigma + parent-child), mais corps réduit à un Overview + steps numérotés sans aucun snippet ni technique unique. Le keeper générique contient tout son contenu et davantage. Aucun delta technique distinct → fold conformément à la consigne (« keep with distinct delta else fold »).
- **delta conservé dans le receptacle** : la lentille « watchlist LOLBin priorisée » + le scoring de risque + la référence au projet LOLBAS (déjà présents/intégrés dans le keeper générique).
- **chemin library** : aucun.
- **état** : folded. KILL/dedup : dup-no-better intra-lot. Re-audit : non (replié, conflit structurel avec le keeper).

## detecting-pass-the-ticket-attacks
- **décision** : adapt_now → library.
- **identité** : détection Pass-the-Ticket Kerberos (T1550.003) — corrélation EventID 4768/4769/4771, réutilisation de ticket cross-host, downgrade RC4, volume anormal de TGS. Apache-2.0. Obsolescence faible.
- **fit** : nourrit `mas-sec-reviewer` + §5 (credential-access/lateral-movement). Distinct du Golden Ticket (vol+rejeu de ticket valide vs forge via hash krbtgt) — gardé séparé, delta net.
- **3 coûts** : install ≈ 1 ; maintenance nulle ; removal trivial.
- **scores** : project_fit 4 · token_efficiency 4 · safety 5 · implementation_effort 4 · evidence_maturity 4 · user_value 4 · phase_compatibility 5.
- **KILL** : aucune. Détection pure, sanitize clean.
- **chemin library** : `packages/skills/library/detecting-pass-the-ticket-attacks/SKILL.md`.
- **frameworks** : nist_csf [DE.CM-01, DE.AE-02, DE.AE-06, ID.RA-05] ; mitre_attack [T1550.003] (technique native explicite dans l'Overview).
- **état** : keeper écrit, conforme. Re-audit : repo >6 mois stale.

## detecting-rdp-brute-force-attacks
- **décision** : adapt_now → library.
- **identité** : détection brute-force RDP — EventID 4625 (échec, Logon Type 10/3), corrélation 4624 (succès post-échec), analyse fréquence IP source, bypass NLA, parsing EVTX via python-evtx. Apache-2.0. Obsolescence faible.
- **fit** : nourrit `mas-sec-reviewer` + §5 (brute-force/remote-services ; lien conceptuel `allowed_hosts`/accès distant). Pas de dup.
- **3 coûts** : install ≈ 1 ; maintenance nulle ; removal trivial.
- **scores** : project_fit 4 · token_efficiency 4 · safety 5 · implementation_effort 4 · evidence_maturity 4 · user_value 4 · phase_compatibility 5.
- **KILL** : aucune. Détection pure, sanitize clean.
- **chemin library** : `packages/skills/library/detecting-rdp-brute-force-attacks/SKILL.md`.
- **frameworks** : nist_csf [DE.CM-01, DE.AE-02, DE.AE-06, ID.RA-05] ; mitre_attack [T1021.001, T1110.001, T1110.003, T1078] (techniques natives du frontmatter — RDP remote-services + password brute-force/spray + compte valide).
- **état** : keeper écrit, conforme. Re-audit : repo >6 mois stale.

---

## Bilan lot EB
- **7 sources → 6 keepers + 1 fold.**
- Keepers : detecting-credential-dumping-techniques · detecting-golden-ticket-forgery · detecting-insider-threat-with-ueba · detecting-living-off-the-land-attacks (receptacle) · detecting-pass-the-ticket-attacks · detecting-rdp-brute-force-attacks.
- Fold : detecting-living-off-the-land-with-lolbas → detecting-living-off-the-land-attacks.
- Renames : aucun (tous les keepers conservent leur slug source).
- Tous T1, status `library`, frameworks préservés, Prompt Defense Baseline verbatim, sanitize clean, 0 `@anthropic-ai/sdk`.

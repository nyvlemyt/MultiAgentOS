# ECC Harvest — décisions cluster `cyber:ransomware-defense` (lot EG)

Doer : lot EG (7 skills, tous blue-team anti-ransomware). Worktree `maos-ecc`, branche `phase/ecc-harvest`. Méthode : skill `intake-audit` à barre LARGE (T1, library), avec garde-fou DEFENSIVE strict : tout est défense/forensique/durcissement/détection ; aucune arme, aucun ciblage de masse, aucune évasion (KILL si dérive). Cas sensible : `analyzing-ransomware-payment-wallets` = forensique blockchain d'**attribution** (OSINT read-only sur chaîne publique), JAMAIS un guide pour payer une rançon — le paiement de rançon est un envoi sortant `risk: blocking` (§5) et reste hors scope MAOS.

Source : `mukul975/Anthropic-Cybersecurity-Skills` (clone read-only `--depth 1`, Apache-2.0). Cible : `packages/skills/library/<slug>/SKILL.md`.
Recadrage transverse : MAOS = abonnement (§11), AUCUN coût per-token PAYG ; tout chiffre = unités de quota, jamais $/€/BTC-USD. `frameworks` (nist_csf + mitre_attack) préservés dans `metadata`.
Sanitize (regex secrets/PII/`@anthropic-ai/sdk`) : 7/7 sources clean. Aucune clé, aucun token, aucun import `@anthropic-ai/sdk`. Les adresses crypto et IP des sources sont des exemples illustratifs (non opérationnels) → neutralisés/génériques dans les versions boostées.

Dedup contre la library existante (lots antérieurs) : `building-soc-playbook-for-ransomware` (cyber:soc-operations, NIST SP 800-61), `performing-ransomware-response` (cyber:incident-response), `testing-ransomware-recovery-procedures`, `implementing-honeytokens-for-breach-detection` (honeytokens réseau/credentials), `implementing-canary-tokens-for-network-intrusion` (tripwires DNS/AWS-key). Conséquences appliquées ci-dessous (un reject intra-lot + un recadrage CISA pour éviter le dup-no-better).

Garde-fou KILL appliqué partout : reject de toute arme/ciblage de masse/évasion ; paiement de rançon = `risk: blocking` §5, jamais codé/cadré.

Bilan : **6 keepers, 1 reject** (doublon intra-lot des canary-files).

---

## analyzing-ransomware-payment-wallets
- **décision**: adapt (keeper défensif — recadré attribution/forensique)
- **raison**: forensique blockchain d'**attribution** — tracer une adresse de note de rançon en lecture seule sur la chaîne publique (Blockstream/blockchain.com/WalletExplorer/OXT), cartographier le flux (consolidation, peel chains, mixers, cashout exchange), clusteriser l'infrastructure réutilisée (common-input-ownership), et screener OFAC SDN, pour un rapport d'attribution/IR + référence law enforcement. OSINT passif, après-coup.
- **garde-fous KILL appliqués**: paiement/négociation/facilitation de rançon = envoi sortant `risk: blocking` (§5), hors scope MAOS, STRIPPÉ de tout cadrage (le skill OBSERVE, ne paie jamais). Hôtes d'explorer = réseau sortant → doivent être dans §5 `allowed_hosts` sinon gate humain. Conversions USD/BTC du source = illustratives → recadrées en unités de chaîne (§11). Heuristiques de cluster = probabilistes (niveau de confiance + corroboration obligatoires). OFAC obligatoire. Monero = non traçable, pas de fausse assertion. Pas d'arme/évasion.
- **dedup**: non — distinct de `performing-ransomware-response` (IR end-to-end, mentionne OFAC mais pas la méthode de traçage chaîne) ; ici lentille forensique blockchain dédiée (clustering, peel chains, mixers).
- **chemin library**: `packages/skills/library/analyzing-ransomware-payment-wallets/SKILL.md`
- **état**: boosté §12 conforme — ligne 1 `---`, commentaire source, summary L1, metadata complet (frameworks préservés nist_csf/mitre T1657+T1486), Prompt Defense Baseline verbatim + 7 sections §12. 0 secret, 0 `@anthropic-ai/sdk`. Adresses/IP du source = exemples non-opérationnels, génériques. Re-audit: si source >6 mois stale, ou si un skill de paiement/finance est un jour scopé (alors via `config/permissions.json`, jamais en codant le paiement).

## building-ransomware-playbook-with-cisa-framework
- **décision**: adapt (keeper défensif — recadré lentille CISA readiness)
- **raison**: playbook ransomware via la lentille **CISA #StopRansomware** — apport distinctif = checklist de **prévention/readiness** scorée AVANT incident (backups offline testés, MFA, segmentation IT/OT, RDP restreint, SLA patch 48h, macros off, allowlisting, RTO/RPO trimestriels) + phasage CISA (Prévention→Détection→Containment→Eradication/Recovery→Post-Incident) avec matrice de priorité de récupération. Défensif, pré-construit, validé en tabletop.
- **garde-fous KILL appliqués**: branche "payer la rançon" = décision légale/exec, `risk: blocking` (§5) → documentée comme gate, JAMAIS exécutée/recommandée. Containment = isoler (pas power-off, préserve les clés mémoire) ; recovery = rebuild clean (pas de déchiffrement in-place). Pas d'arme/évasion. Chiffres en RTO/RPO + unités de quota, jamais $ (§11).
- **dedup**: non, mais frôle — chevauche `building-soc-playbook-for-ransomware` (NIST SP 800-61, doctrine de triggers de détection) et `performing-ransomware-response` (runbook IR live). Delta CISA distinct = readiness/prévention scorée + phasage CISA. Cross-référencé aux deux dans le corps pour éviter le dup-no-better (cible : complémentarité, pas fusion).
- **chemin library**: `packages/skills/library/building-ransomware-playbook-with-cisa-framework/SKILL.md`
- **état**: boosté §12 conforme — ligne 1 `---`, commentaire source, summary L1, metadata+frameworks (mitre T1486/T1490/T1489/T1078/T1021.002), Prompt Defense Baseline verbatim + 7 sections §12. 0 secret, 0 `@anthropic-ai/sdk`. Re-audit: si la source >6 mois stale, ou si le chevauchement avec le SOC playbook/IR runbook se creuse (alors envisager fusion/merge).

## deploying-decoy-files-for-ransomware-detection
- **décision**: adapt (keeper défensif — canonique file-canary)
- **raison**: couche de détection par déception spécifique au **chiffrement de fichiers** — décoys nommés pour trier premier/dernier par répertoire (ransomware énumère A–Z/Z–A), placés aux racines de partage + dossiers endpoint + partages finance/HR/legal + staging backup, surveillés par FIM/watchdog OS (inotify/ReadDirectoryChangesW/FSEvents) ; tout modify/rename/delete = indicateur quasi-zéro-faux-positif. Matrice de réponse tiered + validation pipeline. C'est le keeper canonique du file-canary (consolide le doublon intra-lot, cf. reject ci-dessous).
- **garde-fous KILL appliqués**: détection ≠ prévention (complète backups/EDR/segmentation, ne remplace pas). Alertes **local-first** dans `data/events` ; email/Slack/syslog-vers-SIEM = envois sortants `risk: high` (§5) → human-gated, off par défaut. Isolation réseau automatique = action gated, pas auto-fire aveugle. Exclusion backup/AV pour préserver le signal. Pas de baiting de tiers, pas d'arme/évasion. Quota, pas $ (§11).
- **dedup**: distinct des honeytokens existants — `implementing-honeytokens-for-breach-detection` et `implementing-canary-tokens-for-network-intrusion` ciblent l'intrusion réseau/credentials (fake AWS keys, tripwires DNS) ; ici la cible est le **comportement de chiffrement de fichiers** sur partages/endpoints. Pas de dup-no-better (vecteur de détection différent), cross-référencé dans le corps.
- **chemin library**: `packages/skills/library/deploying-decoy-files-for-ransomware-detection/SKILL.md`
- **état**: boosté §12 conforme — ligne 1 `---`, commentaire source, summary L1, metadata+frameworks (mitre T1486/T1083/T1490/T1485), Prompt Defense Baseline verbatim + 7 sections §12. 0 secret, 0 `@anthropic-ai/sdk`. A absorbé l'angle multi-canaux d'alerte du doublon rejeté. Re-audit: source >6 mois stale.

## deploying-ransomware-canary-files
- **décision**: reject (doublon intra-lot — dup-no-better)
- **raison**: même technique exacte que `deploying-decoy-files-for-ransomware-detection` (canary files + watchdog Python + monitor modify/rename/delete), version plus pauvre (workflow 4 étapes vs 5, pas de stratégie de placement premier/dernier ni de matrice de réponse tiered). Son seul delta — multi-canaux d'alerte email/SMTP/Slack/syslog — a été **absorbé** dans le keeper canonique (recadré local-first + outbound gated §5). Conserver les deux = dup-no-better par construction.
- **garde-fous KILL**: n/a (rejet pour duplication, pas pour danger) — mais note que le source poussait l'envoi email/Slack par défaut, ce qui est un envoi sortant `risk: high` (§5) ; raison de plus de canoniser la version local-first.
- **dedup**: oui — doublon intra-lot de `deploying-decoy-files-for-ransomware-detection`. La règle intake §3 (duplicate → reject ou merge) : merge du delta utile dans le keeper, reject du reste.
- **chemin library**: aucun (rejeté).
- **état**: rejeté. Re-audit: NON — recoupement structurel total ; tout l'apport unique est déjà capturé par le keeper canonique. Ne ré-importer que si une technique de file-canary réellement nouvelle (non couverte) apparaît.

## detecting-ransomware-encryption-behavior
- **décision**: adapt (keeper défensif)
- **raison**: détection comportementale temps-réel d'unknown/zero-day — fusion entropie de Shannon (delta original→écrit), taux d'I/O par process, churn d'extensions, création de note de rançon, suppression de shadow copies, en un score composite 0–100 mappé à une réponse tiered. Lentille comportementale qui complète la signature.
- **garde-fous KILL appliqués**: JAMAIS entropie seule (ZIP/JPEG/MP4 ≈ 8.0 → faux positifs) — delta + multi-signaux obligatoires. Containment automatique (suspend/kill/isolate) = `risk: high` §5 → human-gated, pas d'auto-fire aveugle. Évasion (base64/chiffrement partiel) prise en compte. Tuning en sandbox isolé, pas en prod. Pas de construction d'évasion (offensif → reject). Quota, pas $ (§11).
- **dedup**: non — distinct de `detecting-ransomware-encryption-behavior`-adjacents : `building-soc-playbook-for-ransomware` cite les triggers mais ne livre pas la méthode entropie+scoring ; `deploying-decoy-files-*` est de la déception (canary), ici de l'analyse comportementale de process. Complémentaire.
- **chemin library**: `packages/skills/library/detecting-ransomware-encryption-behavior/SKILL.md`
- **état**: boosté §12 conforme — ligne 1 `---`, commentaire source, summary L1, metadata+frameworks (mitre T1078/T1190/T1059/T1486/T1490), Prompt Defense Baseline verbatim + 7 sections §12. 0 secret, 0 `@anthropic-ai/sdk`. Re-audit: source >6 mois stale.

## detecting-ransomware-precursors-in-network
- **décision**: adapt (keeper défensif — titre `detecting-*`, contenu 100% détection)
- **raison**: détection de la phase **pré-chiffrement** sur le réseau (CS→chiffrement ≈ 17 min) — mappe les phases kill-chain (initial access, C2/beacon, DCSync/Kerberoasting, recon, mouvement latéral, staging) aux indicateurs Zeek/Suricata/Arkime, écrit la **corrélation SIEM** (SPL/KQL) qui chaîne des événements faibles en une alerte haute confiance, et intègre des feeds IOC ransomware (abuse.ch, CISA KEV). Containment dans la fenêtre avant la perte.
- **garde-fous KILL appliqués**: DÉTECTE les beacons/mouvement latéral, ne construit AUCUN C2/exploit (offensif → reject). Capture sur réseaux **autorisés uniquement** (§5) ; pulls de feeds IOC = lectures sortantes vers hôtes allowlisted. Containment (isolation/disable/block) = `risk: high` §5 human-gated. Seuils corrélés, pas suppression aveugle (sinon recon low-and-slow ratée). Quota, pas $ (§11).
- **dedup**: non — distinct de `detecting-beaconing-patterns-with-zeek` (beacon mono-signal) : ici corrélation multi-phase chaînée spécifique au précurseur ransomware ; distinct de `performing-ransomware-response` (post-chiffrement). Complémentaire.
- **chemin library**: `packages/skills/library/detecting-ransomware-precursors-in-network/SKILL.md`
- **état**: boosté §12 conforme — ligne 1 `---`, commentaire source, summary L1, metadata+frameworks (mitre T1078/T1190/T1059/T1003/T1110), Prompt Defense Baseline verbatim + 7 sections §12. 0 secret, 0 `@anthropic-ai/sdk`. IP/sids du source = exemples illustratifs. Re-audit: source >6 mois stale.

## implementing-anti-ransomware-group-policy
- **décision**: adapt (keeper défensif)
- **raison**: durcissement Windows AD anti-ransomware par GPO (defense-in-depth) — AppLocker/WDAC DENY sur chemins user-writable (%TEMP%/AppData/Downloads/Desktop), Controlled Folder Access (Block) sur dossiers high-value + allowlist, règles ASR (email exec-content, Office child-process/injection, scripts obfusqués, macros Win32), lockdown mouvement latéral (SMBv1 off, RDP restreint, WMI distant bloqué, AutoRun off), audit gpresult/Get-MpPreference + event IDs.
- **garde-fous KILL appliqués**: PAS standalone (complète EDR/backups/segmentation/training). Rollout domain-wide = changement à fort impact (peut casser des apps légitimes) → pilote en test OU d'abord, puis staging human-gated (§5). ASR en Audit avant Block. CFA Block exige allowlist. Pas d'arme/évasion (durcissement pur). Quota, pas $ (§11).
- **dedup**: non — distinct de `implementing-application-whitelisting-with-applocker` (AppLocker générique) et `hardening-windows-endpoint-with-cis-benchmark` (CIS générique) : ici jeu de règles GPO spécifiquement anti-ransomware (staging paths, CFA, ASR delivery-mechanisms, anti-propagation). Complémentaire.
- **chemin library**: `packages/skills/library/implementing-anti-ransomware-group-policy/SKILL.md`
- **état**: boosté §12 conforme — ligne 1 `---`, commentaire source, summary L1, metadata+frameworks (mitre T1078/T1190/T1059/T1486/T1490), Prompt Defense Baseline verbatim + 7 sections §12. 0 secret, 0 `@anthropic-ai/sdk`. Re-audit: source >6 mois stale.

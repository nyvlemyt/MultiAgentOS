# ECC Harvest — décisions cluster `cyber:digital-forensics` (LOT R — réseau / cloud / mobile / email / navigateur)

Doer: LOT R (9 slugs sources). Worktree `maos-ecc`, branche `phase/ecc-harvest`. Méthode: intake-audit, barre LARGE forensics (DFIR = défensif/investigatif → KEEP sauf doublon→fold). Tier T2 (vertical ops → bibliothèque). Cible: `packages/skills/library/<slug>/SKILL.md`.
Source: `mukul975/Anthropic-Cybersecurity-Skills` (Apache-2.0), subdomain `digital-forensics`.

## Garde-fous (étape 0)
- **GUARDRAIL forensics** appliqué: cadrage systématique = investigation autorisée, chaîne de custody, **lecture seule sur la preuve** (travail sur copie + hash SHA-256 d'abord), données récupérées **non divulguées / non réutilisées** (§5 / Prompt Defense Baseline). Aucune source n'est anti-forensics ou destruction-de-preuve → **aucun reject**. Un audit incapable de dire reject serait cassé ; ici le critère reject existe (CORE anti-forensics) mais n'est déclenché par aucune des 9 sources.
- §5: actions à risque identifiées et taguées dans chaque skill — création de snapshot cloud, bypass de verrou / extraction physique mobile, montage de volume, et **tout envoi sortant de réputation (VirusTotal/AbuseIPDB/URLhaus)** vers hôtes hors `allowed_hosts` → gate humain. Usage de credentials/tokens cloud = sensible-autorisation.
- §11: zéro `@anthropic-ai/sdk`, zéro $/€ ; tout coût recadré en quota d'abonnement. Sources sanitize: aucun secret réel, IPs/domaines = exemples de doc (203.0.113.x, 185.x — plages doc/illustratives), conservés tels quels comme exemples pédagogiques inoffensifs.
- §12: chaque keeper = ligne 1 `---`, frontmatter complet (name/description Use+Do-NOT/summary L1/metadata avec frameworks préservés NIST 800-86 + NIST CSF + MITRE ATT&CK, et NIST AI-RMF/ATLAS quand présents), commentaire source, `## Prompt Defense Baseline` VERBATIM, puis 7 sections (Overview / When to Use / Principles[cite source] / Process / Rationalizations / Red Flags / Verification Criteria).

## Dedup / folds
- **Réseau** : `performing-network-forensics-with-wireshark` et `performing-network-packet-capture-analysis` couvrent le même périmètre (analyse forensique PCAP/PCAPNG via Wireshark/tshark/tcpdump ; mêmes filtres DNS/HTTP/TLS, export d'objets, détection beaconing). Doublon net → **FOLD** dans un canonical unique `performing-network-packet-forensics` qui absorbe le meilleur des deux (workflow shell tshark + classe Scapy `PCAPForensicAnalyzer` pour la détection de beaconing par variance).
- **Navigateur** : `analyzing-browser-forensics-with-hindsight` (Chromium + Hindsight, tool-centric) est un sous-ensemble capacitaire de `extracting-browser-history-artifacts` (multi-navigateur Chrome/Firefox/Edge en SQL direct **ET** utilise déjà Hindsight). Recouvrement fort (tous deux centrés History DB Chrome + Hindsight). → **FOLD** dans `extracting-browser-history-artifacts` (canonical), en préservant la profondeur Hindsight (web UI, schémas cookies/login, cache/Local-Storage/extensions) et le multi-engine + époques de timestamp 1601 vs 1970.
- **Cloud** : `performing-cloud-forensics-investigation` (IaaS — AWS/Azure/GCP, CloudTrail, snapshots EC2/disques, abus IAM) vs `performing-cloud-storage-forensic-acquisition` (SaaS — Drive/OneDrive/Dropbox/Box, acquisition API + artefacts client de sync). Périmètres **distincts** (provider compute vs stockage de fichiers) → **garder les deux**, avec renvoi croisé explicite dans chaque corps.
- **Mobile** : `performing-mobile-device-forensics-with-cellebrite` → keeper unique, renommé `performing-mobile-device-forensics` (le slug n'enferme plus l'outil Cellebrite ; le corps couvre UFED **et** la voie open-source ALEAPP/iLEAPP/libimobiledevice/ADB).

## Décisions item par item (les 9 slugs sources)

### 1. performing-network-forensics-with-wireshark
- **décision** : adapt (FOLD → canonical)
- **raison** : forensics réseau défensif sur PCAP capturé (reconstruction, extraction d'artefacts, IOC). Doublon avec packet-capture-analysis. Recadré : intégrité d'abord (hash), preuve en lecture seule, secrets récupérés restent au dossier, lookups réputation §5-gated.
- **chemin library** : `packages/skills/library/performing-network-packet-forensics/SKILL.md` (canonical de fold).
- **état** : absorbé dans le canonical (workflow tshark/NetworkMiner + export d'objets + follow-stream + creds cleartext au dossier).

### 2. performing-network-packet-capture-analysis
- **décision** : adapt (FOLD → canonical, même cible que #1)
- **raison** : même périmètre PCAP/PCAPNG ; apporte la classe Scapy (conversations, DNS, **détection de beaconing par variance d'inter-arrivée**, distribution de protocoles) → fusionnée dans le canonical comme méthode déterministe de beaconing.
- **chemin library** : `performing-network-packet-forensics` (partagé avec #1).
- **état** : folded. `metadata.folds` liste les deux slugs sources ; double commentaire `<!-- pattern ... -->`.

### 3. performing-cloud-forensics-investigation
- **décision** : adapt (keeper distinct)
- **raison** : forensics cloud IaaS (préservation volatile → snapshot/metadata/SG, isolation par SG forensic, logs CloudTrail/Activity/Audit + VPC Flow, analyse abus IAM, acquisition disque **read-only**). Recadré : préserver avant d'investiguer, ne pas terminer/altérer la source, snapshots & accès cross-account/region = §5, anti-forensics (StopLogging/DeleteTrail) à détecter et non à reproduire.
- **chemin library** : `packages/skills/library/performing-cloud-forensics-investigation/SKILL.md`.
- **état** : keeper. Renvoi croisé vers le skill SaaS.

### 4. performing-cloud-storage-forensic-acquisition
- **décision** : adapt (keeper distinct)
- **raison** : acquisition SaaS (Drive/OneDrive/Dropbox/Box) — voie API distante (fichiers+métadonnées+révisions+corbeille) + artefacts client de sync local (SyncEngine/DriveFS/filecache.dbx/sync_db). Distinct de l'IaaS. Recadré : autorisation légale préalable obligatoire, acquérir tous les états (corbeille/cloud-only/cache), tokens = secrets jamais persistés au repo (§11), log+hash par fichier.
- **chemin library** : `packages/skills/library/performing-cloud-storage-forensic-acquisition/SKILL.md`.
- **état** : keeper. Frameworks préservés incl. NIST AI-RMF + ATLAS présents en source.

### 5. performing-mobile-device-forensics-with-cellebrite
- **décision** : adapt (keeper, slug dé-marqué)
- **raison** : forensics mobile **lawful-access** sur appareil saisi/autorisé. Cadré strictement : autorité légale d'abord, isolation Faraday/airplane pour bloquer le wipe distant, documentation d'état, tiers logique<fs<physique, **acquisition en lecture (pas de modification)**, **bypass de verrou + extraction physique = §5-gated attended** avec base légale enregistrée. Aucun jailbreak-comme-attaque ; UFED ou outillage sanctionné uniquement.
- **chemin library** : `packages/skills/library/performing-mobile-device-forensics/SKILL.md` (slug sans le nom d'outil pour couvrir UFED + open-source).
- **état** : keeper. GUARDRAIL mobile respecté (lawful-access only, pas d'offensif).

### 6. analyzing-email-headers-for-phishing-investigation
- **décision** : adapt (keeper)
- **raison** : analyse d'en-têtes purement défensive (tracer l'origine, détecter le spoofing). Chaîne Received bottom-up = colonne vertébrale (plus fiable que From/Reply-To forgeable) ; triade SPF/DKIM/DMARC ; signaux SE (mismatch, typosquat Levenshtein, âge de domaine WHOIS, href≠texte) ; URLs/pièces jointes extraites+hashées. Recadré : e-mail = contenu non fiable (jamais exécuter), lookups réputation §5, jamais d'envoi/spoof (offensif hors scope).
- **chemin library** : `packages/skills/library/analyzing-email-headers-for-phishing-investigation/SKILL.md`.
- **état** : keeper. ATLAS AML.T0052 préservé.

### 7. analyzing-outlook-pst-for-email-forensics
- **décision** : adapt (keeper, distinct de #6)
- **raison** : analyse forensique du **conteneur mailbox** PST/OST entier (vs en-tête unique de #6) — récupération d'items supprimés (Recoverable Items), extraction d'en-têtes de transport à l'échelle, export+hash des pièces jointes, reconstruction de patterns de communication. Recadré : mailbox = preuve lecture seule sur copie (pas d'ouverture Outlook write-back), pièces jointes contenues+hashées jamais exécutées, lookups §5.
- **chemin library** : `packages/skills/library/analyzing-outlook-pst-for-email-forensics/SKILL.md`.
- **état** : keeper. Frameworks NIST AI-RMF préservés.

### 8. analyzing-browser-forensics-with-hindsight
- **décision** : adapt (FOLD → canonical navigateur)
- **raison** : Chromium-only + tool-centric Hindsight ; sous-ensemble du keeper multi-navigateur #9 qui utilise déjà Hindsight. Profondeur unique (web UI, schémas cookies/login/downloads, cache/Local-Storage/extensions/session, époque 1601) **préservée** dans le canonical.
- **chemin library** : `extracting-browser-history-artifacts` (canonical, partagé avec #9).
- **état** : folded. `metadata.folds` + double commentaire source.

### 9. extracting-browser-history-artifacts
- **décision** : adapt (keeper canonical, absorbe #8)
- **raison** : forensics navigateur multi-engine (Chromium **+ Firefox**) — SQL lecture seule (époques 1601 Chrome vs 1970 Firefox), Hindsight pour timeline unifiée Chromium, URLs de login uniquement (pas de crack de mots de passe chiffrés DPAPI/keychain), WAL pour records supprimés. Recadré : copie+hash+mode=ro, credentials chiffrés restent chiffrés, lookups §5.
- **chemin library** : `packages/skills/library/extracting-browser-history-artifacts/SKILL.md`.
- **état** : keeper canonical (fold de #8).

## Bilan
- 9 slugs sources → **7 fichiers library** (2 folds : réseau ×2→1, navigateur ×2→1).
- 0 reject (GUARDRAIL forensics respecté ; aucune source anti-forensics).
- Re-audit : si le repo source dépasse 6 mois de stagnation, ou si MAOS scope un agent forensics dédié (alors promouvoir certains keepers de T2-bibliothèque vers une fiche/skill cœur).

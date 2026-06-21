# ECC Harvest — décisions cluster `cyber:threat-intelligence` (LOT A)

Doer: lot threat-intelligence A (10 slugs sources). Worktree `maos-ecc`, branche `phase/ecc-harvest`. Méthode: intake-audit barre LARGE (T1, library, lentille défensive CTI/attribution/MITRE).
Source: `mukul975/Anthropic-Cybersecurity-Skills` (Apache-2.0), sous-domaine `threat-intelligence` (50 skills au total dans le cluster, cf. `cybersec-clusters.md`).
Cible keepers: `packages/skills/library/<lib-slug>/SKILL.md`, forme exemplar (ligne 1 `---`, frontmatter name/description/summary/metadata, commentaire source, `## Prompt Defense Baseline` VERBATIM, 7 sections §12).
Garde-fou défensif: ces skills sont tous défensifs (CTI / attribution / cartographie MITRE / threat hunting). Aucune arme pure attendue → aucun reject pour cause d'arme. Recadrage transverse: MAOS = abonnement (§11), JAMAIS de chiffre $/€ → unités de quota. Lentille detect+mitigate conservée partout (gaps de détection, COA, Sigma, coverage).
Sanitize: 10/10 sources clean (pas de secret/PII, pas d'`@anthropic-ai/sdk`, pas de clé API). Le code Python des sources illustre des requêtes ATT&CK STIX/TAXII en lecture seule + génération de couches Navigator/graphes — aucune exécution offensive; les SKILL keepers décrivent le process sans embarquer de payload.

---

## analyzing-threat-actor-ttps-with-mitre-attack
- **décision**: adapt (CANONIQUE — reçoit 2 folds)
- **raison**: le plus complet des trois skills MITRE-mapping: workflow entier (query ATT&CK STIX, technique_map, couche Navigator v4.5, overlay détection + % gap, comparaison cross-group). C'est la cartographie défensive d'un acteur sur ATT&CK pour piloter la détection. Distinct de `mapping-mitre-attack-techniques` (lui part des contrôles, pas de l'acteur).
- **dedup**: absorbe `analyzing-apt-group-with-mitre-navigator` et `analyzing-threat-actor-ttps-with-mitre-navigator` (chevauchement lourd noté dans le brief). Préserve d'eux les frameworks ATLAS (AML.T0070/0066/0082) + NIST AI RMF (pertinents quand l'adversaire vise des composants IA/agent) dans le metadata + un alinéa Overview.
- **chemin library**: `packages/skills/library/analyzing-threat-actor-ttps-with-mitre-attack/SKILL.md`
- **état**: keeper écrit, conforme exemplar (ligne 1 `---`, commentaire source, summary L1, metadata complet avec `frameworks` + `folds`, Prompt Defense Baseline VERBATIM, 7 sections §12). Recadré §11 (pas de cash) + §5 (read-only, pas de payload offensif).

## analyzing-apt-group-with-mitre-navigator
- **décision**: fold → `analyzing-threat-actor-ttps-with-mitre-attack`
- **raison**: quasi-identique au canonique (mêmes 5 étapes: query group, couche Navigator, comparaison multi-groupes, gap analysis, tactic breakdown). Sa seule valeur marginale (code de tactic breakdown + couche un peu plus riche) est couverte par le process du canonique. Pas de framework unique (NIST CSF seul, déjà présent).
- **dedup**: oui — replié dans le canonique (`metadata.folds`).
- **chemin library**: aucun (fold, pas de fichier séparé).
- **état**: folded. Cible canonique notée. KILL non déclenché (skill défensif valide, simplement redondant).

## analyzing-threat-actor-ttps-with-mitre-navigator
- **décision**: fold → `analyzing-threat-actor-ttps-with-mitre-attack`
- **raison**: le plus mince des trois (juste 5 steps + stub d'output JSON, pas de workflow code détaillé). Redondant avec le canonique. **MAIS** porte des frameworks uniques: ATLAS (AML.T0070/0066/0082) + NIST AI RMF (MEASURE-2.7/MAP-5.1/MANAGE-2.4) — préservés dans le metadata du canonique conformément à la consigne "PRESERVE NIST/MITRE refs".
- **dedup**: oui — replié dans le canonique; frameworks ATLAS/NIST-AI-RMF migrés.
- **chemin library**: aucun (fold).
- **état**: folded. Frameworks uniques préservés dans le keeper canonique. KILL non déclenché.

## mapping-mitre-attack-techniques
- **décision**: adapt (distinct)
- **raison**: angle différent des skills acteur-TTP — ici on part de SON PROPRE stack de détection (Sigma/SIEM/KQL) qu'on tague sur ATT&CK, avec score de couverture à 3 états (blind/logged-only/detected), priorisation des angles morts contre les groupes du secteur, heatmap Navigator + reporting exécutif. Lentille detection-engineering / coverage-gap. Techniques MITRE distinctes (T1591/T1592/T1593 recon). D3FEND mis en avant comme contre-mesure quand la détection n'est pas faisable.
- **dedup**: non — complémentaire au canonique (mesure de couverture des contrôles vs profilage d'acteur). Cadrage explicite "3-state, pas binaire" et "logged ≠ detected".
- **chemin library**: `packages/skills/library/mapping-mitre-attack-techniques/SKILL.md`
- **état**: keeper écrit, conforme (Prompt Defense Baseline VERBATIM, 7 sections, frameworks ATT&CK/D3FEND/ATLAS/NIST-CSF/NIST-AI-RMF préservés). Recadré §11/§5.

## hunting-advanced-persistent-threats
- **décision**: adapt (DÉFENSIF confirmé)
- **raison**: threat hunting hypothesis-driven (hypothèse ATT&CK → data sources → requêtes Velociraptor/osquery/Zeek/SPL LECTURE SEULE → pivots → Sigma). C'est de la détection proactive, pas de l'attaque. Garde-fou défensif appliqué explicitement: les requêtes lisent la télémétrie, n'exécutent jamais de payload ni ne modifient les hôtes (toute action altérante = gated §5). Null results = validation de contrôles. Escalade vers IR (NIST 800-61) si compromission confirmée.
- **dedup**: non — distinct de la heatmap statique (`mapping-...`) et du profilage; ici c'est la chasse active sur télémétrie.
- **chemin library**: `packages/skills/library/hunting-advanced-persistent-threats/SKILL.md`
- **état**: keeper écrit, conforme. Lentille read-only/§5 martelée (Principles 3, Red Flags, Verification). Recadré §11. Aucun reframe de slug nécessaire (déjà défensif).

## profiling-threat-actor-groups
- **décision**: adapt
- **raison**: profil d'acteur structuré et tiéré par audience (executive 1-pager / SOC brief / annexe technique STIX-Sigma-YARA), dimensions identity/motivation/targeting/capability/campaign/TTP, mapping ATT&CK, assessment de couverture de détection contre le profil. Profils TTP-centric (durables) pas IOC-centric (périmés en semaines); attribution probabiliste (Low/Med/High), jamais binaire.
- **dedup**: non — distinct de l'attribution (qui pèse l'évidence pour nommer) et de la corrélation (qui groupe les incidents). Ici = synthèse intel d'un acteur connu pour piloter le threat model.
- **chemin library**: `packages/skills/library/profiling-threat-actor-groups/SKILL.md`
- **état**: keeper écrit, conforme. Recadré §11/§5 (synthèse read-only, pas de contenu offensif).

## analyzing-campaign-attribution-evidence
- **décision**: adapt (distinct de correlating — gardé séparé)
- **raison**: pèse l'évidence pour NOMMER l'acteur avec un niveau de confiance — via Diamond Model + Analysis of Competing Hypotheses (ACH: l'inconsistance pèse plus que la confirmation), 6 catégories d'évidence (infra/TTP/code malware/patterns opérationnels/artefacts linguistiques/victimologie), scores overlap infra + Jaccard TTP, prise en compte explicite des false flags et du tooling partagé. Technique unique = ACH.
- **dedup**: distinct de `correlating-threat-campaigns` (cf. note dedup du brief: "garder distinct seulement si chacun porte une technique unique"). Décision GARDER DISTINCT: attribution NOMME l'acteur (ACH, confiance), corrélation GROUPE les incidents (pivots, clustering). Techniques uniques de part et d'autre → pas de fold.
- **chemin library**: `packages/skills/library/analyzing-campaign-attribution-evidence/SKILL.md`
- **état**: keeper écrit, conforme. Frameworks Diamond/ACH/ATT&CK/NIST-CSF. Recadré §11/§5.

## correlating-threat-campaigns
- **décision**: adapt (distinct de attribution — gardé séparé)
- **raison**: lie des incidents disparates en UNE campagne (sans forcer de faux liens) — normalisation STIX 2.1, pivots 4 dimensions (infra/capability/temporal/victimology), score de confiance pondéré (infra 40 / capability 35 / temporal 15 / victim 10), graphe de campagne (OpenCTI/Maltego/Neo4j), rapport avec IOC partagés (meilleurs candidats au blocage). Garde-fous explicites contre les faux positifs CDN/hosting partagé + malware commodity. Technique unique = scoring pondéré de corrélation + pivoting multi-dim.
- **dedup**: distinct de `analyzing-campaign-attribution-evidence` (voir entrée ci-dessus). Corrélation ≠ attribution: question "ça va ensemble ?" vs "qui ?". Chacun sa technique propre → KEEP DISTINCT, pas de fold.
- **chemin library**: `packages/skills/library/correlating-threat-campaigns/SKILL.md`
- **état**: keeper écrit, conforme. Frameworks ATT&CK/STIX-2.1/NIST-CSF. Recadré §11/§5.

## analyzing-cyber-kill-chain
- **décision**: adapt
- **raison**: analyse post-incident contre la Lockheed Martin Cyber Kill Chain (7 phases) — matrice de complétion de phase (completed/detected/blocked + gap de contrôle par phase non détectée), mapping phases→tactiques ATT&CK pour la granularité technique, courses of action par phase (detect/deny/disrupt/degrade/deceive/destroy) priorisées par coût et interruption précoce. Défensif: la COA "destroy" (active defence) est explicitement marquée ADVISORY — toute action offensive/destructive réelle reste gated §5.
- **dedup**: non — complémentaire à ATT&CK (le skill insiste lui-même: "pair with ATT&CK"); distinct de la heatmap de couverture et du profilage.
- **chemin library**: `packages/skills/library/analyzing-cyber-kill-chain/SKILL.md`
- **état**: keeper écrit, conforme. Garde-fou §5 sur la COA "destroy" (Principle 7, Red Flags). Recadré §11. Frameworks Kill-Chain/ATT&CK/NIST-CSF.

## implementing-diamond-model-analysis
- **décision**: adapt
- **raison**: couche atomique de structuration CTI — chaque événement d'intrusion en 4 features cœur (Adversary/Capability/Infrastructure/Victim) + méta-features, liaison en activity threads, clustering en activity groups, détection de pivots (infra/capability partagés sur ≥2 événements) = moteur de découverte d'activité liée. Capability mappée sur ATT&CK. C'est le substrat sous la corrélation et l'attribution.
- **dedup**: non — distinct: structure les événements (n'attribue pas, ne corrèle pas au niveau campagne). Hand-off explicite vers `correlating-threat-campaigns` + `analyzing-campaign-attribution-evidence`.
- **chemin library**: `packages/skills/library/implementing-diamond-model-analysis/SKILL.md`
- **état**: keeper écrit, conforme. Frameworks Diamond/ATT&CK/STIX-2.1/NIST-CSF. Recadré §11/§5.

---

## Bilan LOT A

- **10 slugs sources couverts** (aucun silencieusement abandonné).
- **8 keepers** écrits dans `packages/skills/library/`.
- **2 folds** → tous deux vers `analyzing-threat-actor-ttps-with-mitre-attack` (canonique), avec préservation des frameworks ATLAS + NIST AI RMF issus de la variante Navigator.
- **0 reject** (garde-fou: cluster 100 % défensif; aucune arme pure).
- Dedup brief tranchée: trio MITRE → 1 canonique + 2 folds; couple campagne (attribution vs corrélation) → gardé DISTINCT (techniques uniques de chaque côté).
- Recadrage §11 (quota abonnement, 0 $/€) + §5 (read-only, payloads offensifs gated, COA "destroy" advisory) appliqué aux 8 keepers.
- Sanitize 10/10 clean; 0 `@anthropic-ai/sdk`; 0 secret/clé.
- Contraintes dures respectées: aucun `ledger.tsv`, aucun `git add/commit/push`, seulement les dossiers `library/<slug>/` + ce shard.

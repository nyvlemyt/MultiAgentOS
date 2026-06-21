# ECC Harvest — décisions cluster `cyber:threat-intelligence` (LOT B)

Doer: lot threat-intelligence B (10 slugs sources). Worktree `maos-ecc`, branche `phase/ecc-harvest`. Méthode: intake-audit, lentille DÉFENSIVE (detect/mitigate/hardening), barre T1 library.
Source: `mukul975/Anthropic-Cybersecurity-Skills` (Apache-2.0), chaque source lue à `/tmp/cybersec-inspect/skills/<slug>/SKILL.md`. Cible: `packages/skills/library/<slug>/SKILL.md`.
Recadrage transverse (§11): MAOS = abonnement, aucun coût per-token PAYG; tout chiffre = quota units, jamais $/€. Les montants $ de licence vendeur (skill d'évaluation) sont des coûts EXTERNES, distincts du quota MAOS.
Recadrage §5: feeds/connecteurs/SIEM = frontières de confiance → hosts en `allowed_hosts`; publish/sync/sharing = action sortante gatée; secrets hors repo.
Sanitize: 10/10 sources clean — aucun import `@anthropic-ai/sdk`, aucun `ANTHROPIC_API_KEY`. Les credentials des sources (`change_me`, `YOUR_KEY`, tokens compose) sont des placeholders illustratifs; AUCUN n'est recopié dans les keepers (les keepers décrivent le process, pas le code verbatim, et imposent secrets-depuis-l'environnement).
Verdict global: 0 reject (tout défensif), 6 keepers, 4 folds. Aucune arme pure dans ce lot — attendu, conforme.

---

## Sous-cluster MISP (4 sources → 1 keeper canonique + 1 keeper analytique)

Les 4 skills MISP se chevauchent fortement sur la même surface PyMISP (déployer → feeds → search → export → share). Décision de dédup: **un keeper opérationnel canonique** (`operating-misp-platform`) absorbe collecte + agrégation-feed + partage, car ce sont les trois facettes d'une même opération de plateforme; **un keeper distinct** (`analyzing-threat-landscape-misp`) reste séparé car c'est de l'analytique read-only (statistiques/tendances), pas de l'ops d'écriture.

### collecting-threat-intelligence-with-misp
- **décision**: adapt → CANONIQUE
- **raison**: déploiement MISP + config feeds + PyMISP search/export STIX. C'est le cœur opérationnel; devient le keeper canonique `operating-misp-platform`. Recadré défensif: feeds = ingest non-fiable + warninglists; export gaté; secrets hors repo.
- **chemin library**: `packages/skills/library/operating-misp-platform/SKILL.md`
- **état**: keeper écrit (canonique). 8 sections §12, Prompt Defense Baseline verbatim, frameworks NIST/MITRE préservés.

### building-threat-feed-aggregation-with-misp
- **décision**: fold → `operating-misp-platform`
- **raison**: doublon réel de `collecting` (déployer + feeds + search/corrélation) + un angle export-SIEM (Splunk HEC / blocklist firewall). L'angle export-SIEM est plié dans le process du canonique (étape "export downstream"). Rien d'unique ne justifie un fichier séparé. Le source contenait `SKIP_TLS_VERIFY` + clés inline → strippé; le keeper exige TLS-on et secrets-env.
- **chemin library**: aucun (fold). Cible canonique: `operating-misp-platform`.
- **état**: plié. Pas de fichier propre.

### performing-threat-intelligence-sharing-with-misp
- **décision**: fold → `operating-misp-platform`
- **raison**: create/enrich/publish/share événements MISP avec TLP + sharing-groups. C'est la facette "écriture/dissémination" de la même plateforme PyMISP. Plié dans le canonique (étapes create-enrich + gate publish/share). Le partage est traité comme action sortante gatée (§5).
- **chemin library**: aucun (fold). Cible canonique: `operating-misp-platform`.
- **état**: plié. Pas de fichier propre.

### analyzing-threat-landscape-with-misp
- **décision**: adapt → KEEPER distinct
- **raison**: analytique read-only (stats événements, distribution types IOC, top techniques ATT&CK, top acteurs/galaxies, tendances temporelles). Lentille différente des 3 autres (agrégation/reporting vs ops d'écriture) → garde distinct. Préserve d3fend_techniques du source en plus de NIST/MITRE.
- **chemin library**: `packages/skills/library/analyzing-threat-landscape-misp/SKILL.md`
- **état**: keeper écrit. Posture read-only soulignée (sûr à tout niveau d'autonomie); confidence-flag sur petits échantillons.

---

## Sous-cluster lifecycle (2 sources → 1 keeper canonique)

### implementing-threat-intelligence-lifecycle-management
- **décision**: adapt → CANONIQUE
- **raison**: les 6 phases du cycle (Direction→Collection→Processing→Analysis→Dissemination→Feedback) avec outillage (PIRs, pipeline collecte CISA KEV/OTX/abuse.ch, normalisation STIX 2.1 + dedup, production 3 niveaux, métriques). Le plus riche des deux (391 lignes). Devient le keeper canonique `threat-intelligence-lifecycle`.
- **chemin library**: `packages/skills/library/threat-intelligence-lifecycle/SKILL.md`
- **état**: keeper écrit (canonique). Hosts de collecte (CISA KEV, OTX, abuse.ch) → `allowed_hosts`; dissémination gatée TLP.

### managing-intelligence-lifecycle
- **décision**: fold → `threat-intelligence-lifecycle`
- **raison**: même cycle 6 phases mais lens gouvernance/maturité (NIST SP 800-150, PIRs structurés, modèle de maturité FIRST CTI-SIG, boucle feedback 5 jours, métriques trimestrielles). Pas un workflow distinct — c'est la couche gouvernance du même cycle. Plié: la prose PIR/maturité/feedback-metrics + le framework NIST SP 800-150 sont intégrés dans les principes et le process du canonique.
- **chemin library**: aucun (fold). Cible canonique: `threat-intelligence-lifecycle`.
- **état**: plié. NIST SP 800-150 + FIRST CTI-SIG capturés dans le keeper canonique.

---

## Keepers autonomes (distincts, aucun chevauchement)

### building-ioc-enrichment-pipeline-with-opencti
- **décision**: adapt → KEEPER
- **raison**: pipeline d'enrichissement OpenCTI (connecteurs internal-enrichment VT/Shodan/AbuseIPDB/GreyNoise/SecurityTrails, bundles STIX 2.1, scoring 0-100). Distinct de MISP (autre plateforme, autre modèle de connecteurs). Lens défensive forte: chaque connecteur = appel sortant vers service tiers → `allowed_hosts` + plafond `max_tlp` (anti-exfiltration de TLP:RED/AMBER), réponse externe = donnée non-fiable, fail-closed.
- **chemin library**: `packages/skills/library/building-ioc-enrichment-pipeline-opencti/SKILL.md`
- **état**: keeper écrit. `max_tlp` posé comme garde-fou central; tokens depuis l'environnement.

### building-threat-intelligence-platform
- **décision**: adapt → KEEPER
- **raison**: architecture multi-outils (MISP+OpenCTI+TheHive+Cortex sur Elasticsearch) — design en couches + points d'intégration. Distinct des keepers mono-outil: c'est de l'architecture, pas de l'ops. Lens défensive: chaque point d'intégration = frontière de confiance; ES contient tout le corpus CTI (incl. TLP:RED) → auth + isolation réseau obligatoires; sync inter-instances + TAXII sortant gatés (§5).
- **chemin library**: `packages/skills/library/building-threat-intelligence-platform/SKILL.md`
- **état**: keeper écrit. Garde-fou ES-non-sécurisé = breach total souligné en red flag.

### evaluating-threat-intelligence-platforms
- **décision**: adapt → KEEPER
- **raison**: décision de procurement TIP (MISP/OpenCTI/ThreatConnect/Anomali/EclecticIQ) — critères M/D, PoC 30 jours, matrice pondérée, onboarding 90 jours. Skill de décision distinct (pas d'ops, pas de build). S'aligne nativement sur la doctrine intake-audit (décider, peser 3 coûts). Recadrage §11: les $ de licence sont externes-vendeur, jamais confondus avec le quota MAOS.
- **chemin library**: `packages/skills/library/evaluating-threat-intelligence-platforms/SKILL.md`
- **état**: keeper écrit. TCO = licence+admin FTE+infra+migration; intégration SIEM testée en PoC, pas sur datasheet.

### generating-threat-intelligence-reports
- **décision**: adapt → KEEPER
- **raison**: production de renseignement fini (strategic/operational/tactical/flash) avec standards d'écriture (key judgment, ICD 203 confidence, attribution sources), classification TLP, QC pass. Distinct de l'analytique landscape (calcul stats) et de la diffusion IOC brute (MISP). Lens défensive: protection des sources en TLP:AMBER/RED, anti-sur-classification (bloque la défense communautaire), chaque section doit produire une action.
- **chemin library**: `packages/skills/library/generating-threat-intelligence-reports/SKILL.md`
- **état**: keeper écrit. ICD 203 + FIRST TLP comme standards; freshness-dating <48h.

---

## Récapitulatif dédup

| sous-cluster | sources | keepers | folds |
|---|---|---|---|
| MISP | 4 | 2 (`operating-misp-platform`, `analyzing-threat-landscape-misp`) | 2 (feed-aggregation, sharing → operating) |
| lifecycle | 2 | 1 (`threat-intelligence-lifecycle`) | 1 (managing → implementing) |
| autonomes | 4 | 4 (opencti-enrichment, build-platform, evaluating, reports) | 0 |
| **total** | **10** | **6** | **4** |

Re-audit: si le repo source dépasse 6 mois de staleness, ou si un domaine "CTI runtime" est explicitement scopé en ROADMAP (alors câbler les hosts feeds/enrichissement via `config/permissions.json#allowed_hosts`).

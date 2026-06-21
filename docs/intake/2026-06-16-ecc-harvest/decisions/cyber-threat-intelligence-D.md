# ECC Harvest — décisions cluster `cyber:threat-intelligence` (LOT D)

Doer : lot D (10 skills). Worktree `maos-ecc`, branche `phase/ecc-harvest`. Méthode : intake-audit complet par skill, barre LARGE (T1, library).
Source : `mukul975/Anthropic-Cybersecurity-Skills` (Apache-2.0), `/tmp/cybersec-inspect/skills/<slug>/SKILL.md`.
Cible keeper : `packages/skills/library/<lib-slug>/SKILL.md` (forme exemplar `agentic-engineering`).

## Garde-fous transverses (étape 0)
- **Lentille défensive obligatoire (LOT D).** L'OSINT ici = collecte CTI **défensive** (profilage d'adversaires, suivi d'infra, réputation IP). Reframe systématique : collecte passive par défaut, scan actif de cibles non-possédées = action §5 gated, jamais un défaut. Toute dérive « recon offensive de cibles arbitraires » → renommage défensif ou reject.
- **§11 abonnement.** Aucun chiffre $/€ : tout en unités de quota (TOKEN_STRATEGY §8). L'unique skill avec un appel LLM (correlation IA) est réancré sur `packages/core/src/llm.ts` ; l'import `openai`/SDK direct de la source est strippé.
- **Sanitize.** 10/10 sources clean après strip des `YOUR_*_KEY`, tokens et payloads. `@anthropic-ai/sdk` absent des sources et des keepers (grep import/require = 0).
- **Dedup contre la library existante.** Familles voisines déjà présentes : `building-threat-intelligence-feed-integration`, `building-threat-intelligence-enrichment-in-splunk`, `collecting-indicators-of-compromise`, `analyzing-threat-actor-ttps-with-mitre-attack`, `analyzing-tls-certificate-transparency-logs`. Pris en compte item par item ci-dessous.

---

## collecting-open-source-intelligence
- **décision** : adapt → **rename défensif**
- **chemin library** : `packages/skills/library/collecting-defensive-osint/SKILL.md`
- **raison** : facette « collecte OSINT manuelle/ad-hoc » de la famille OSINT. La source mêlait « pre-engagement red team recon » (offensif) à de la collecte défensive. Reframe → exigence de renseignement d'abord, passif par défaut, scan actif = §5 gated, pivot = hypothèse à corroborer, hygiène de footprint. Renommé `collecting-defensive-osint` pour ancrer la lentille dans le slug.
- **dedup** : distinct de `collecting-indicators-of-compromise` (IOC sur preuve d'incident possédée) — ici reconnaissance passive externe d'adversaires/surface. Facette OSINT « manuelle » vs SpiderFoot (auto) vs correlation IA.
- **frameworks préservés** : NIST-CSF ID.RA-01/05, DE.CM-01, DE.AE-02 ; ATT&CK T1593.001/T1589.002/T1596.002/T1590/T1596.001.

## performing-osint-with-spiderfoot
- **décision** : adapt → **rename**
- **chemin library** : `packages/skills/library/automating-osint-collection-with-spiderfoot/SKILL.md`
- **raison** : facette **outil-spécifique** distincte (automatisation REST/CLI SpiderFoot, scoping par use-case `passive`/`footprint`/`investigate`, polling, parse par type). Garde l'angle « l'autorisation scope le module set » → use-case passif pour cibles non-possédées ; clés de modules = secrets. Renommé pour expliciter l'automatisation.
- **dedup** : non — `collecting-defensive-osint` = doctrine manuelle/pivots ; ici l'orchestration d'un moteur 200+ modules. Facettes complémentaires de la famille OSINT (fold #1).
- **frameworks préservés** : NIST-CSF idem ; ATT&CK T1591/T1592/T1593/T1589/T1595.

## performing-ai-driven-osint-correlation
- **décision** : adapt (recadrage §11) → **rename**
- **chemin library** : `packages/skills/library/correlating-osint-with-ai-reasoning/SKILL.md`
- **raison** : facette **corrélation cross-source par raisonnement LLM** (linkage d'identités, confidence 0–1 par force de preuve, détection de faux positifs/noms communs). La source appelait l'OpenAI SDK en direct → **strippé**, réancré sur l'unique injection point `packages/core/src/llm.ts` (engine Claude Code, abonnement, §11). Ajout exigence base légale + spot-check 10–20 % + corroboration deux sources avant confidence >0.8.
- **dedup** : non — c'est l'étage cognition/synthèse au-dessus de la collecte (#1/#2). 4ᵉ facette OSINT distincte.
- **KILL évité** : §11 (import provider direct) neutralisé par le reframe `llm.ts`. Si non-recadrable, c'eût été reject.
- **frameworks préservés** : NIST-AI-RMF MEASURE-2.7/2.5, GOVERN-6.1, MAP-5.1 ; ATLAS AML.T0051/T0054/T0056 ; D3FEND (Identifier/URL/Reputation/User-Behavior/Content-Validation) ; NIST-CSF + ATT&CK T1591…T1595.

## building-threat-actor-profile-from-osint
- **décision** : adapt (slug conservé)
- **chemin library** : `packages/skills/library/building-threat-actor-profile-from-osint/SKILL.md`
- **raison** : facette **profilage/dossier structuré** (Diamond Model + ACH pour confidence d'attribution, STIX 2.1 Threat-Actor/Intrusion-Set, mapping ATT&CK, recommandations défensives). Reframe : attribution toujours **graduée jamais asserée** (faux drapeaux), output = détections/blocks/hunts, pas de dox d'individus.
- **dedup** : distinct de `analyzing-threat-actor-ttps-with-mitre-attack` (mapping TTP pur) — ici le dossier acteur complet (alias/motivation/ciblage/infra + attribution ACH). 5ᵉ facette OSINT (consomme #1/#2/#3).
- **frameworks préservés** : NIST-CSF idem ; ATT&CK T1591/T1589/T1593/T1590.

## building-adversary-infrastructure-tracking-system
- **décision** : **fold** → canonical `tracking-adversary-infrastructure`
- **chemin library** : aucun fichier propre (fondu)
- **raison** : doublon attendu (cf. note dedup du lot). Le « build a tracking system » (passive-DNS discovery → graphe NetworkX → monitor nouvelles registrations) **est la même doctrine pivot→graphe→cluster→timeline→monitor** que `tracking-threat-actor-infrastructure`, juste exprimée en code de pipeline. Fondu : les étapes de build (graphe, hub-nodes, monitoring CT/registrations) sont absorbées dans le keeper canonical. Commentaire source du keeper cite explicitement le fold.
- **dedup** : oui — fold-into-canonical (#6). Aucune perte : graphe + monitoring forward conservés dans le canonical.
- **frameworks préservés (dans le canonical)** : ATT&CK T1583.001/T1583.004/T1596.001/T1590.002/T1071.001 (mergé avec ceux de #6).

## tracking-threat-actor-infrastructure
- **décision** : adapt → **rename canonical** (absorbe #5)
- **chemin library** : `packages/skills/library/tracking-adversary-infrastructure/SKILL.md`
- **raison** : skill **canonical** suivi d'infra adverse (pivots passive-DNS/CT/WHOIS/ASN + fingerprints JARM/JA3S/favicon/HTTP, graphe avec first/last-seen, clusters/hubs, timeline, monitoring CT + nouvelles registrations, export STIX Infrastructure). Reframe : passif/indexé par défaut, scan actif = §5 gated, overlap = hypothèse graduée. Renommé `tracking-adversary-infrastructure` (slug défensif + neutre acteur).
- **dedup** : absorbe `building-adversary-infrastructure-tracking-system` (#5). Distinct de `analyzing-tls-certificate-transparency-logs` (analyse CT seule) — ici le pivoting multi-signal complet.
- **frameworks préservés** : NIST-CSF idem ; ATT&CK fusion T1583.001/T1583.004/T1596.001/T1590.002/T1071.001/T1566.

## performing-ip-reputation-analysis-with-shodan
- **décision** : adapt (slug conservé)
- **chemin library** : `packages/skills/library/performing-ip-reputation-analysis-with-shodan/SKILL.md`
- **raison** : facette **réputation/triage IP** via index Shodan (ports/services/CVE/SSL/ASN/geo, scoring factor-based transparent, InternetDB gratuit pour le volume, corrélation org/ASN/SSL-CN). Reframe défensif clé : **lire l'index, pas scanner** (Shodan a déjà scanné) ; score = **prior de triage, pas verdict** (anti over-block, attention CDN/cloud partagés) ; clé API = secret.
- **dedup** : non — facette enrichissement/triage SOC distincte de la cartographie d'infra (#6) et de la collecte OSINT (#1).
- **frameworks préservés** : NIST-CSF idem ; ATT&CK T1591/T1592/T1593/T1589/T1595.

## building-attack-pattern-library-from-cti-reports
- **décision** : adapt → **rename** (court)
- **chemin library** : `packages/skills/library/building-attack-pattern-library-from-cti/SKILL.md`
- **raison** : facette **extraction comportements → bibliothèque STIX Attack-Pattern mappée ATT&CK + scaffolds détection Sigma/YARA**. Reframe : extraction par mots-clés = **hints, pas faits** (confirmation analyste avant entrée) ; outputs = **templates de détection défensifs, jamais payloads offensifs** ; extraction LLM-assistée via `llm.ts` (§11) ; texte de rapport = untrusted input. Slug raccourci (`-cti`).
- **dedup** : distinct de `collecting-indicators-of-compromise` (IOC techniques) et de `analyzing-threat-actor-ttps-with-mitre-attack` (TTP d'un acteur) — ici la **bibliothèque** de patterns extraite d'un corpus de rapports + génération de détections.
- **frameworks préservés** : NIST-CSF idem ; ATT&CK T1566.001/T1059.001/T1003.001/T1558.003/T1550.002 ; D3FEND (File-Metadata/Protocol-Command/Identifier/Format-Conversion/Message-Analysis).

## analyzing-malware-family-relationships-with-malpedia
- **décision** : adapt (slug conservé)
- **chemin library** : `packages/skills/library/analyzing-malware-family-relationships-with-malpedia/SKILL.md`
- **raison** : facette **relations entre familles malware** via Malpedia (naming `platform.family` + alias résout le « many names », lignées parent-child, chaînes loader-payload, liens acteur↔famille, extraction YARA → ruleset défensif). Reframe : **détection/intel, jamais récupérer/exécuter de samples vivants** ; chaînes curées = hints à corroborer ; token API = secret.
- **dedup** : non — angle taxonomie/lignée malware absent de la library (les voisins sont IR/détection malware, pas la cartographie de familles).
- **frameworks préservés** : NIST-CSF idem ; ATT&CK T1587.001/T1027/T1071.

## analyzing-threat-intelligence-feeds
- **décision** : adapt (recadrage facette) → **rename**
- **chemin library** : `packages/skills/library/evaluating-threat-intelligence-feed-quality/SKILL.md`
- **raison** : **recadré sur la facette JUGEMENT/QUALITÉ** (scoring des feeds : fraîcheur/fidélité/pertinence/profondeur d'attribution via NIST SP 800-150 ; action confidence-tiered block vs detection-only ; TTL par type ; dedup avant comptage ; contexte campagne/acteur obligatoire anti over-block ; respect TLP). La source couvrait aussi ingest/normalize/distribute → **ce pan est déjà chez nous** dans `building-threat-intelligence-feed-integration`. Pour éviter le dup-no-better, le keeper est scopé à la **couche qualité en amont** que l'intégration consomme, et le corps cite explicitement la dedup. Renommé `evaluating-threat-intelligence-feed-quality`.
- **dedup** : oui, géré par **scoping** — `building-threat-intelligence-feed-integration` = pipeline opérationnel ; ce keeper = porte-qualité de sélection des sources. Frontières énoncées dans Overview/Principles.
- **frameworks préservés** : NIST-CSF idem ; ATT&CK T1071.001/T1566/T1568/T1583.001/T1102 ; NIST SP 800-150 cité.

---

## Bilan LOT D
- **10 sources couvertes**, aucune droppée.
- **9 keepers écrits** (4 facettes OSINT + 1 canonical infra + réputation IP + attack-pattern CTI + Malpedia + feed-quality).
- **1 fold** (`building-adversary-infrastructure-tracking-system` → `tracking-adversary-infrastructure`).
- **0 reject** : toutes les sources étaient des facettes CTI défensives recadrables ; aucune n'était une arme pure. (L'audit *pouvait* reject — la lentille a été appliquée, la dérive offensive a été reframée plutôt que rejetée car le cœur restait défensif.)
- **Re-audit** : si la library gagne un cluster `red-teaming`/`offensive-security`, revérifier que `collecting-defensive-osint` et `tracking-adversary-infrastructure` n'y dérivent pas. Re-check feed-quality vs feed-integration si l'un des deux est refondu.

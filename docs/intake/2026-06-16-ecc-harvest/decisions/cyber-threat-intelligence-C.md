# ECC Harvest — décisions cluster `cyber:threat-intelligence` (LOT C)

Doer : LOT C (10 skills source). Worktree `maos-ecc`, branche `phase/ecc-harvest`. Méthode : intake-audit complet par skill, lentille DÉFENSIVE (detect / mitigate / hardening).
Source : `mukul975/Anthropic-Cybersecurity-Skills` (Apache-2.0), `/tmp/cybersec-inspect/skills/<slug>/SKILL.md`. Cluster `threat-intelligence` (50 skills, tier T1 — cf. `cybersec-clusters.md`).
Cible keepers : `packages/skills/library/<lib-slug>/SKILL.md`, forme exemplaire `agentic-engineering` (ligne 1 `---`, commentaire source, `## Prompt Defense Baseline` VERBATIM, 7 sections §12).

**Recadrages transverses appliqués à TOUS les keepers :**
- §11 abonnement : aucun chiffre $/€ ; tout coût = quota d'abonnement (TOKEN_STRATEGY §8). Les sources mentionnent « VT Enterprise $X / 1M lookups » → strippé.
- §5 risky-actions : tout outbound (publish TAXII/MISP, push SIEM/SOAR, blocage IOC, détonation sandbox, lookup d'enrichissement) est gated + host dans `config/permissions.json#allowed_hosts`.
- Secrets : credentials TAXII/MISP/API jamais committés/loggués ; placeholders sources rotés. `SKIP_TLS_VERIFY` présent dans 2 sources (taxii-server, defang-pipeline) → cadré **lab-only, jamais production** dans le corps.
- Sanitize : pas de PII/secret réel ni d'import `@anthropic-ai/sdk` dans les 10 sources (clean). Les exemples de payload (SUNBURST hash, regex bitcoin/mutex) sont **détection défensive**, conservés ; aucun payload weaponisé à stripper (aucun n'en contenait).
- GUARDRAIL défensif : les 10 sources sont défensives (CTI / IOC / STIX / TAXII / enrichissement / lifecycle). `building-ioc-defanging` = défanging = défensif → keep. Aucun rejet pour weaponization. `malware-ioc-extraction` recadré explicitement « detection-only, jamais malware opérationnel ».

Bilan : **8 keepers, 2 folds, 0 reject.** Un audit qui ne peut pas dire reject est cassé — ici la barre KILL (weaponization pure, paiement, PAYG, dup-no-better) a été appliquée et aucun item ne la franchit ; les 2 folds sont des dups internes au lot, pas des rejets.

---

## Famille STIX/TAXII (4 sources → 3 keepers, 1 fold)

Chevauchement réel sur l'axe « consommer un flux TAXII ». Facettes distinctes retenues : **processer/router** un flux entrant, **héberger** un serveur, **authoring** d'objets STIX. La 4ᵉ (feed-integration) est le sous-ensemble « consommer » de la facette processing → fold.

### implementing-stix-taxii-feed-integration
- **décision** : fold → `stix-taxii-feed-processing` (canonique).
- **raison** : workflow « consumer/producer feed integration » (discovery, fetch paginé, parse, custom `TAXIIConsumer`, mini-serveur medallion). Tout son cœur actionnable (poller une collection, extraire indicateurs/observables) est un sous-ensemble strict de `processing-stix-taxii-feeds`, qui ajoute validation spec_version, enforcement TLP, routage par type et partage bi-directionnel. La partie « monter un serveur local » est mieux couverte par `taxii-server-deployment`. Garder les deux = dup-no-better.
- **chemin library** : — (folded).
- **état** : fold acté ; canonique = `stix-taxii-feed-processing` (note de fold inscrite dans le summary + Principles du keeper).

### processing-stix-taxii-feeds
- **décision** : adapt.
- **raison** : facette **consommation/processing défensive** — discovery, polling incrémental (`added_after` UTC + overlap 5 min + pagination), validation STIX 2.1 (spec_version 2.0≠2.1, champs requis, confidence 0–100), enforcement TLP avant routage, routage par type (indicator→SIEM/blocklist, malware→EDR, threat-actor/campaign→TIP, course-of-action→SOAR), indexation (pas de blobs opaques), publish-back gated. C'est la doctrine « le flux est untrusted jusqu'à validation » — alignée §5 (réseau/outbound) et la baseline prompt-defense.
- **dedup** : absorbe feed-integration (cf. fold ci-dessus). Distinct de authoring (produit) et server-deployment (héberge).
- **chemin library** : `packages/skills/library/stix-taxii-feed-processing/SKILL.md`.
- **état** : écrit, forme exemplaire (ligne 1 `---`, commentaire source, Prompt Defense Baseline verbatim, 7 sections, metadata.frameworks = STIX-2.1/TAXII-2.1/OASIS/NIST-SP-800-150/NIST-CSF/MITRE-ATTACK, 0 `@anthropic-ai/sdk`, 0 secret).

### implementing-taxii-server-with-opentaxii
- **décision** : adapt.
- **raison** : facette **opérateur de serveur** — déployer OpenTAXII/medallion, configurer discovery + API roots + collections avec ACL read/write par collection, Docker + healthcheck, HTTPS/TLS + auth, modèles de partage (hub-and-spoke / p2p / source-subscriber). Forte valeur sécurité : least-privilege collections, rotation credentials, TLS obligatoire. `SKIP_TLS_VERIFY` source → recadré lab-only.
- **dedup** : non — héberger ≠ consommer (`processing`) ≠ produire (`authoring`).
- **chemin library** : `packages/skills/library/taxii-server-deployment/SKILL.md`.
- **état** : écrit, conforme (8 sections, frameworks incl. OpenTAXII/medallion, secrets cadrés §5/§11, 0 sdk).

### implementing-security-information-sharing-with-stix2
- **décision** : adapt.
- **raison** : facette **authoring/producteur** — créer SDOs (Indicator/Malware/ThreatActor/Campaign/AttackPattern/Identity), SROs (Relationship/Sighting), bundles, patterns STIX, TLP, validation `stix2-validator` + round-trip avant publish. Apporte les invariants « created_by_ref obligatoire », « refs SRO résolvent dans le bundle », « pattern valide sinon indicator non-détectant ». Porte aussi `d3fend_techniques` (préservé en framework).
- **dedup** : non — produire ≠ consommer ≠ héberger.
- **chemin library** : `packages/skills/library/stix2-intelligence-authoring/SKILL.md`.
- **état** : écrit, conforme (frameworks incl. D3FEND + MITRE T1027, publish gated §5).

---

## Famille IOC (5 sources → 4 keepers, 1 fold) + defang (keep)

Facettes distinctes : décision analyste (triage), automatisation pipeline (enrichment), extraction depuis binaire, lifecycle. La 6ᵉ (VT hash enrichment) est un nœud mono-source de l'automatisation → fold.

### analyzing-indicators-of-compromise
- **décision** : adapt.
- **raison** : facette **jugement analyste** — normaliser/classer, défanger, enrichir ≥3 sources (VT/AbuseIPDB/MalwareBazaar/URLScan/Shodan/MISP), scorer, disposition tiered (block ≥70 / monitor 40–69 / whitelist <40 / FP) avec TTL. Garde-fous forts : « jamais une seule source », « infra partagée CDN/cloud = piège », « blocage = action §5 high-risk humaine ». Porte `atlas_techniques: AML.T0052` (préservé).
- **dedup** : non — décision humaine, distincte de l'automatisation pipeline.
- **chemin library** : `packages/skills/library/ioc-analysis-triage/SKILL.md`.
- **état** : écrit, conforme (frameworks incl. MITRE-ATLAS AML.T0052).

### automating-ioc-enrichment
- **décision** : adapt (et **réceptacle de fold**).
- **raison** : facette **automatisation** — pipeline SOAR/Python : extract→classify→fan-out parallèle par type→agrégation score→routage tiered. Garde-fous : rate-limiting + backoff 429/Retry-After, cache ≥24h, « failures must surface (empty≠clean) », « JAMAIS d'auto-block sur score seul » (§5). Recadré quota, pas cash (la source chiffrait en $).
- **dedup** : absorbe `performing-malware-hash-enrichment-with-virustotal` (cf. fold). Distinct de la décision manuelle (`ioc-analysis-triage`).
- **chemin library** : `packages/skills/library/ioc-enrichment-automation/SKILL.md`.
- **état** : écrit, conforme (frameworks incl. VirusTotal-API-v3 + SOAR ; pivots VT intégrés via le fold).

### performing-malware-hash-enrichment-with-virustotal
- **décision** : fold → `ioc-enrichment-automation`.
- **raison** : workflow mono-source VT v3 (last_analysis_stats, behaviours, contacted_ips/domains/urls pivots, crowdsourced YARA, batch + rate-limit, rapport). C'est exactement le **nœud hash le plus profond** de l'enrichissement automatisé, déjà cadré par `automating-ioc-enrichment` (qui couvre VT + rate-limit + cache). Garder un skill séparé = dup-no-better ; mais sa richesse (behaviour report, network pivots, YARA classification) a été **distillée** dans le keeper réceptacle (Process step 3 + Principle 6 « pivot then verify »).
- **dedup** : oui — sous-ensemble VT-only de l'automatisation.
- **chemin library** : — (folded, contenu absorbé).
- **état** : fold acté ; pivots/behaviour/YARA reportés dans `ioc-enrichment-automation`.

### building-ioc-defanging-and-sharing-pipeline
- **décision** : adapt.
- **raison** : facette **partage sûr** — défanger (hxxp / `[.]` / `[@]`) pour que reports/email/Slack n'auto-linkent jamais vers de l'infra malveillante, normaliser+dédup+whitelist, convertir STIX 2.1 + TLP, distribuer MISP/TAXII. Explicitement défensif (cf. consigne LOT C). Garde-fous : « refang seulement en analyse, jamais dans un artefact partageable », whitelist anti-FP, `SKIP_TLS_VERIFY` lab-only, distribution §5-gated.
- **dedup** : non — partage/défanging distinct de triage et d'authoring (authoring = relationship-rich ; ici = volume + sécurité de manipulation).
- **chemin library** : `packages/skills/library/ioc-defanging-sharing-pipeline/SKILL.md`.
- **état** : écrit, conforme (frameworks incl. MISP/TLP, distribution gated §5).

### performing-malware-ioc-extraction
- **décision** : adapt.
- **raison** : facette **extraction depuis échantillon** — static PE (hashes, imphash/rich-header pour grouping famille, entropy section ≥7 = packé, imports, PDB), strings ASCII+UTF-16LE (IP/domain/url/registry/mutex/UA/bitcoin/pdb), YARA classification, sortie STIX Indicator+Malware. Recadré **detection-only, jamais malware opérationnel** ; isolation VM/conteneur obligatoire (§5), détonation gated, filtrage IP privées/strings bénins. La barre KILL weaponization est testée et NON franchie (output = règles de détection, pas un payload).
- **dedup** : non — extraction depuis binaire distincte de consommation de flux et de scoring.
- **chemin library** : `packages/skills/library/malware-ioc-extraction/SKILL.md`.
- **état** : écrit, conforme (frameworks incl. YARA/PE-format ; lens défensif explicite en Overview/When-NOT/Red-Flags).

### performing-indicator-lifecycle-management
- **décision** : adapt.
- **raison** : facette **hygiène base IOC** — machine à 7 états (discovered→…→retired) avec history loggué, decay de confiance par type (half-life IP 30j / URL 60j / domain 90j / hash 365j), tracking hits/FP (>3 FP → under-review), aging/retirement automatique, métriques (hit rate / FP rate / coverage / freshness). Anti-fatigue analyste + efficacité détection. Recadré §5 (deploy/retire sur systèmes live = gated) et §7 (modéliser l'état en **literal union, pas enum** au bord SQLite/Drizzle — la source utilisait `enum`).
- **dedup** : non — gouvernance temporelle distincte du scoring ponctuel.
- **chemin library** : `packages/skills/library/indicator-lifecycle-management/SKILL.md`.
- **état** : écrit, conforme (frameworks incl. MISP ; note §7 literal-union dans summary + Principle 6).

---

## Suites & re-audit

- **Dedup inter-lot** : `cybersec-clusters.md` confirme 0 collision de noms ECC↔cyber. À surveiller au merge : chevauchement conceptuel possible entre ce lot et d'éventuels keepers `soc-operations` (SIEM/SOAR) ou `malware-analysis` (RE) d'autres lots — fold à reconsidérer si un lot SOC produit un skill « SOAR enrichment » plus large.
- **Sécurité ingestion** : sources lues en clone read-only `--depth 1`, Apache-2.0, sanitize clean (pas de secret/PII/sdk). Aucun code exécuté pendant l'audit.
- **Re-audit** : à la revue Checker du LOT C, et si `mukul975/Anthropic-Cybersecurity-Skills` publie une révision majeure des skills threat-intelligence (>6 mois).

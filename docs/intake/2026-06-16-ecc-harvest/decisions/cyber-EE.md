# ECC Harvest — décisions cluster `cyber:security-operations` (lot EE)

Doer: lot EE (7 skills). Worktree `maos-ecc`, branche `phase/ecc-harvest`. Méthode: intake-audit, lifecycle complet par skill.
Source cyber: `mukul975/Anthropic-Cybersecurity-Skills` (clone read-only `/tmp/cybersec-inspect`, Apache-2.0). Cible: `packages/skills/library/<slug>/SKILL.md`.

Lentille du lot: **DEFENSIVE blue-team secops** — EDR, honeytokens, pipelines de logs, mTLS, security chaos engineering, monitoring SIEM. Aucun ne weaponise, ne cible en masse, ni n'évade : critère KILL « weaponization/mass-targeting/evasion » non déclenché sur les 7. `implementing-mtls-for-zero-trust-services` est le plus fort : il mappe directement sur NOTRE §5 (gating réseau, sandbox cross-projet) + le canal worker↔web.

Recadrage transverse (§11) : MAOS = abonnement, JAMAIS de coût per-token PAYG. Tout chiffre $/€ des sources (Datadog, PagerDuty, Canarytokens SaaS) est réancré en **quota units** ou en équivalent **local-first** (`data/`, §8). Aucune source n'importe `@anthropic-ai/sdk`. Sanitize : les secrets des sources sont des placeholders (`<YOUR_DATADOG_API_KEY>`, `DD_API_KEY`, `WALLET`*absent*) → réécrits en références d'env-var, jamais en valeurs.
`frameworks` préservé depuis le frontmatter source (nist_csf, mitre_attack, + nist_ai_rmf/atlas_techniques/d3fend là où présents).

Bilan : **7 keepers / 7** (tous `adapt`). 0 reject.

---

## implementing-endpoint-detection-with-wazuh
- **décision**: adapt
- **raison**: doctrine EDR/SIEM défensive (gestion d'agents, décodeurs+règles XML custom, requêtage d'alertes via REST API, validation logtest). Recadré local-first : la lentille « détection de poste + règles testées avant prod » nourrit la posture défensive MAOS sans imposer Wazuh comme dépendance runtime.
- **dedup**: non — `mas-sec-reviewer` gate les *actions* MAOS (§5) ; ici on outille la détection EDR côté projet observé. Cohabite avec `deploying-edr-agent-with-crowdstrike`/`deploying-osquery-*` déjà en library (outils EDR distincts, pas de doublon 1:1).
- **chemin library**: `packages/skills/library/implementing-endpoint-detection-with-wazuh/SKILL.md`
- **costs**: install = faible (doc, 0 dép runtime) ; maintenance = faible (drift API Wazuh, re-audit annuel) ; removal = trivial (dossier slug supprimable).
- **KILL check**: pas de PAYG, pas d'exécution de code par l'audit, pas de paiement/secret/deploy ; weaponization=non (détection only). Aucun veto.
- **état**: boosté conforme exemplaire §12 (ligne1 `---`, commentaire source, summary L1, metadata frameworks préservés, Prompt Defense Baseline verbatim, 7 sections §12). Sanitize : credentials API → env-vars. Re-audit : si l'API Wazuh 4.x est dépréciée.

## implementing-honeytokens-for-breach-detection
- **décision**: adapt
- **raison**: déception défensive (canary tokens : faux credentials AWS, canaries DNS, beacons documents, enregistrements DB-leurres) déclenchant une alerte à l'accès. C'est de la **détection précoce d'intrusion**, pas de l'attaque. Lentille MAOS : on peut semer des leurres dans le périmètre d'un projet observé pour détecter une exfiltration ; canaries DNS = signal réseau aligné §5 `allowed_hosts`.
- **dedup**: non — `performing-deception-technology-deployment` (library) couvre la déception au sens large ; ici le focus est les *honeytokens* spécifiques (AWS/DNS/doc/DB). Complémentaire.
- **chemin library**: `packages/skills/library/implementing-honeytokens-for-breach-detection/SKILL.md`
- **costs**: install = faible ; maintenance = faible (rotation des tokens, suivi du SaaS canary) ; removal = trivial.
- **KILL check**: les faux credentials sont des LEURRES inertes (jamais de vraies clés) → pas de secret réel exposé ; déclencheur = alerte défensive, pas paiement/deploy. Canarytokens.org SaaS reframé : préférence local-first (webhook propre vers `data/`/events), SaaS optionnel. weaponization=non. Aucun veto.
- **état**: boosté conforme §12. Sanitize : exemple de « faux AWS creds » conservé MAIS marqué explicitement leurre inerte (Red Flag : ne jamais semer une vraie clé). Re-audit : si la dépendance Canarytokens externe devient bloquante.

## implementing-log-forwarding-with-fluentd
- **décision**: adapt
- **raison**: pipeline d'agrégation de logs centralisée (Fluent Bit en forwarder léger sur endpoint, Fluentd en agrégateur ; inputs syslog/file/app, filtres enrichissement/grep, routage multi-sortie). Brique défensive d'observabilité : sans pipeline de logs fiable, aucune détection en amont ne tient. Lentille MAOS : doctrine pour acheminer les logs d'un projet observé vers un SIEM.
- **dedup**: non — les skills `analyzing-*-logs-*` (library) *consomment* des logs ; celui-ci les *achemine* (couche transport en amont). Complémentaire, pas doublon.
- **chemin library**: `packages/skills/library/implementing-log-forwarding-with-fluentd/SKILL.md`
- **costs**: install = faible ; maintenance = moyenne (drift de config Fluentd/Fluent Bit, plugins) ; removal = trivial.
- **KILL check**: 0 secret (port 24224, configs INI/YAML) ; pas de paiement/deploy/exfil ; valider la syntaxe avant prod = garde-fou. weaponization=non. Aucun veto.
- **état**: boosté conforme §12. Sanitize : RAS (pas de credential dans la source). Re-audit : si Fluentd v1.16 est déprécié.

## implementing-log-integrity-with-blockchain
- **décision**: adapt
- **raison**: chaîne d'intégrité append-only par hash-chaining SHA-256 (chaque entrée hashée avec le hash précédent → toute modification invalide tous les hashes suivants ; détection de falsification au point près ; ancrage périodique de checkpoints sur un service de timestamping). MALGRÉ le nom « blockchain » : ZÉRO crypto-monnaie, ZÉRO paiement, ZÉRO clé privée — c'est du SHA-256 pur. Mappe directement sur la table `events`/audit-log MAOS (§8) : tamper-evidence de notre propre journal.
- **dedup**: non — aucun skill library ne couvre l'intégrité tamper-evident des logs ; c'est une brique d'assurance distincte de l'acheminement (fluentd) et de l'analyse.
- **chemin library**: `packages/skills/library/implementing-log-integrity-with-blockchain/SKILL.md`
- **costs**: install = faible (SHA-256 stdlib, 0 dép lourde) ; maintenance = faible ; removal = trivial.
- **KILL check**: le mot « blockchain » NE déclenche PAS le KILL crypto-paiement (cf. lot core-token `agent-payment-x402` rejeté) — ici aucun wallet/clé privée/ERC, juste du hash-chaining déterministe local. 0 secret, 0 PAYG, pas de réseau (ancrage externe = optionnel). weaponization=non. Aucun veto.
- **état**: boosté conforme §12. Sanitize : RAS. Recadrage explicite « blockchain = hash-chain SHA-256, PAS de cryptomonnaie » dans Overview + Red Flags. Re-audit : non (primitive stable).

## implementing-mtls-for-zero-trust-services
- **décision**: adapt (FLAGSHIP du lot)
- **raison**: mTLS service-à-service (génération CA + certs via `cryptography`, vérif TLS via `ssl`, validation de chaîne, contrôle d'expiration, audit du déploiement mTLS). **Le plus fort fit du lot** : mappe directement sur NOTRE §5 (frontière de confiance worker↔web, identité vérifiée, sandbox cross-projet) et le principe zero-trust de l'archi MAOS (apps/web ↔ apps/worker).
- **dedup**: non — aucun skill library ne couvre l'authentification mutuelle par cert ; complémentaire de l'IAM/zero-trust (qui gèrent l'identité humaine/RBAC, pas le canal service-à-service).
- **chemin library**: `packages/skills/library/implementing-mtls-for-zero-trust-services/SKILL.md`
- **costs**: install = faible ; maintenance = moyenne (rotation/expiration des certs = dette opérationnelle réelle) ; removal = faible.
- **KILL check**: clés privées = générées localement et **jamais committées** (Red Flag explicite, §5 keystores/.env) ; 0 PAYG ; pas de réseau sortant non-allowlisté. weaponization=non (c'est de la défense d'authentification). Aucun veto.
- **état**: boosté conforme §12. Sanitize : les clés privées des exemples restent des artefacts à générer, jamais en clair committé ; rappel §5 « write to keystores = human-gated ». Ancrage explicite worker↔web. Re-audit : si l'archi worker↔web change de transport.

## implementing-security-chaos-engineering
- **décision**: adapt (recadrage de gating le plus lourd du lot)
- **raison**: chaos engineering sécurité — désactive/dégrade DÉLIBÉRÉMENT des contrôles (WAF bypass, retrait de règle firewall, coupure pipeline de logs, désactivation EDR) pour vérifier que la détection+réponse fonctionnent. **Validation défensive de couverture SOC**, PAS une attaque. MAIS : c'est intrinsèquement destructif → chaque expérience est `risk: high`/`blocking` (§5), DOIT passer `mas-sec-reviewer` + validation humaine, et exige un rollback fail-safe (pattern `try/finally` de la source) + autorisation explicite.
- **dedup**: non — `performing-soc-tabletop-exercise`/`testing-ransomware-recovery-procedures` (library) testent process/récup ; ici on injecte une dégradation réelle de contrôle pour mesurer la détection. Distinct.
- **chemin library**: `packages/skills/library/implementing-security-chaos-engineering/SKILL.md`
- **costs**: install = faible ; maintenance = moyenne ; removal = trivial. Mais **coût opérationnel/risque élevé** par exécution → gating obligatoire.
- **KILL check**: le critère « weaponization/mass-targeting/evasion » N'EST PAS déclenché (la désactivation est volontaire, scopée, rollbackée, en environnement autorisé — pas une évasion adverse). Néanmoins §5 `risk: high|blocking` → human-gate + sec-reviewer NON optionnels, inscrits dans Principles/Red Flags/Verification. 0 PAYG. Garde-fou fort, pas de veto reject.
- **état**: boosté conforme §12. Renforcé : rollback fail-safe obligatoire (finally), blast-radius borné, autorisation+sec-reviewer avant toute expérience, jamais en prod sans gate. Re-audit : à chaque revue de la doctrine §5.

## implementing-security-monitoring-with-datadog
- **décision**: adapt (recadrage SaaS-payant le plus lourd du lot)
- **raison**: monitoring SIEM cloud (Datadog Cloud SIEM + CSM + Workload Protection : déploiement agent, ingestion sources de logs, règles de détection, dashboards, workflows de notification). Doctrine défensive de détection cloud riche (la source la plus détaillée, 424 lignes). Lentille MAOS : la *doctrine* de détection (règles de seuil/anomalie, mapping ATT&CK, suppression des faux positifs, escalade par sévérité) est portable vers n'importe quel backend.
- **dedup**: non — les skills SIEM library (`analyzing-security-logs-with-splunk`, `correlating-security-events-in-qradar`, etc.) sont par-outil ; Datadog Cloud SIEM/CSM est un backend distinct. Pas de doublon 1:1.
- **chemin library**: `packages/skills/library/implementing-security-monitoring-with-datadog/SKILL.md`
- **costs**: install = faible (doc) ; maintenance = moyenne (drift API Datadog) ; removal = trivial. Datadog = **SaaS payant** → recadré : la lentille doctrine est gardée, la dépendance produit n'est pas imposée ; tout chiffre $/€ → quota/local.
- **KILL check**: Datadog est un SaaS facturé MAIS c'est l'outil de l'environnement observé, PAS une dépendance runtime MAOS ni un PAYG Anthropic → §11 (ban PAYG Anthropic) non violé ; clé d'API Datadog lue depuis env (`DD_API_KEY`/`DD_APP_KEY`), jamais committée. weaponization=non. Aucun veto.
- **état**: boosté conforme §12. Sanitize : `<YOUR_DATADOG_API_KEY>` → référence env-var explicite ; rappel « clés Datadog hors git, hors NEXT_PUBLIC ». Recadrage : doctrine portable, Datadog non-obligatoire. Re-audit : si l'API Datadog v2 change.

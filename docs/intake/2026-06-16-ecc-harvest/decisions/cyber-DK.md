# ECC Harvest — décisions cluster `cyber:vulnerability-management` (lot DK)

Doer: lot DK (9 skills). Worktree `maos-ecc`. Méthode: intake-audit barre LARGE (T1, library) + **garde-fou défensif strict**.
Source cyber: `mukul975/Anthropic-Cybersecurity-Skills` (Apache-2.0). Cible: `packages/skills/library/<slug>/SKILL.md`.
Dedup contre `our-assets-index.md` + recoupe `mas-sec-reviewer` / CLAUDE.md §5 (priorisation du risque, gating, posture).
Nature du lot: gestion de vulnérabilités **DÉFENSIVE** (blue-team) — patch, SLA/aging, triage, exception/risk-acceptance,
priorisation EPSS, dashboard de findings, posture cloud (CSPM), validation continue (BAS safe-sim), analyse de chemins d'attaque
(exposure-management). Le frontmatter source porte `subdomain: vulnerability-management` + `frameworks` NIST-CSF/MITRE-ATTACK
(et `d3fend_techniques` pour BAS) : mappings préservés dans la metadata MAS.

**Garde-fou métasploit / offensif (KILL explicite)** : tout framework d'exploitation prêt-à-tirer (payloads, meterpreter,
hashdump, pivoting, post-exploitation) = REJECT sans résidu défensif récupérable. Appliqué à chaque skill : lentille
détection/priorisation/durcissement/gouvernance gardée ; tout payload/scan-actif/exécution-mutante reframé en guidance
défensive sur systèmes possédés, jamais en arme. Pas de weaponization, mass-targeting, ni évasion.

Sanitize: 0 secret réel, 0 PII, 0 `@anthropic-ai/sdk` dans les 9 sources (placeholders ARN/clé/CVE = exemples).
Recadrage transverse §11 : tout chiffre = quota d'abonnement, jamais $/€ (sources sans cash, recadrage léger).

---

## building-patch-tuesday-response-process
- **décision**: adapt
- **raison**: process opératoire **défensif** de patch-management — triage mensuel d'advisories vendeur (MSRC) cross-référencé CISA KEV le jour J, catégorisation risk-based des CVE en fenêtres de remédiation (zero-day/KEV → 24-48h … low → next-window), déploiement en anneaux (emergency → pilot 5-10% → prod servers → workstations → stragglers) avec soak + rollback documenté, re-scan post-déploiement + gap analysis, exceptions time-boxées avec compensating controls. Nourrit la lentille priorisation/posture de `mas-sec-reviewer` + §5.
- **dedup**: non — `mas-sec-reviewer` est une gate générique §5; aucun process de patch-cycle/ring-deployment dans notre surface. Angle distinct = cadence de remédiation vendeur.
- **garde-fou défensif**: la source contient un `db_import`/scan workflow non-offensif (énumère les patches manquants), pas d'exploit. Recadré explicitement: MAOS **planifie** la remédiation; tout push de patch hors sandbox projet = action §5 gatée (clic humain). Validation = re-scan, jamais exploit.
- **chemin library**: `packages/skills/library/building-patch-tuesday-response-process/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` NIST-CSF/MITRE-ATTACK préservé + Prompt Defense Baseline; 7 sections §12 défensives; 0 secret, 0 sdk, 0 chiffre cash).

## building-vulnerability-aging-and-sla-tracking
- **décision**: adapt
- **raison**: mesure **défensive** aging + SLA — politique SLA severity-based (14/30/60/90j) + modificateurs adaptatifs (internet-facing -50%, KEV → 48h, EPSS>0.7 -50%, crown-jewel -25%, compensating-control +25%), moteur d'aging (age/overdue/SLA-%-elapsed depuis discovery date), KPIs (MTTR, SLA-compliance-rate, overdue, distribution, exception-rate), échelle d'escalade (owner → manager → CISO → VP). Nourrit la priorisation de remédiation `mas-sec-reviewer` + §5.
- **dedup**: non — angle accountability/aging absent de notre surface; `mas-sec-reviewer` = gate générique. Distinct du patch-process (cadence) et de l'EPSS (probabilité): ici = horloge SLA + métriques.
- **garde-fou défensif**: code source = pandas read-only sur un DataFrame de findings (calcul de métriques), aucun exploit/scan-actif. MAOS calcule, ne remédie pas hors sandbox (§5). Clock = discovery date.
- **chemin library**: `packages/skills/library/building-vulnerability-aging-and-sla-tracking/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` NIST-CSF/MITRE-ATTACK préservé + Prompt Defense Baseline; 7 sections §12 défensives; 0 secret, 0 sdk, 0 cash).

## building-vulnerability-dashboard-with-defectdojo
- **décision**: adapt
- **raison**: pattern **défensif** d'agrégation de findings (DefectDojo exemplaire) — hub central ingérant 200+ formats de scanners (Nessus/ZAP/Trivy/Semgrep/Snyk…), dédup-on-engagement, hiérarchie Product-Type→Product→Engagement→Test→Finding, hooks CI/CD, ticketing (Jira) + métriques SLA-breach. Nourrit `mas-sec-reviewer` + §5 avec l'inventaire réel de vulns d'un projet.
- **dedup**: non — angle inventaire-consolidé/dédup absent de notre surface; complète l'aging-SLA (math) en fournissant la plateforme. Distinct de `mas-sec-reviewer` (gate).
- **garde-fou défensif + §5 secrets**: source contient des placeholders `<secure_password>`, `<random_64_char_key>`, `your_api_key_here`, token Jira — TOUS reframés explicitement en secrets fournis par l'opérateur au déploiement, jamais committés, jamais possédés par MAOS (§5 secrets gate / §11 no committed key). Aucun exploit. MAOS agrège, n'attaque pas, n'écrit pas hors sandbox.
- **chemin library**: `packages/skills/library/building-vulnerability-dashboard-with-defectdojo/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` NIST-CSF/MITRE-ATTACK préservé + Prompt Defense Baseline; 7 sections §12 défensives; 0 secret réel — placeholders seulement, 0 sdk, 0 cash).

## building-vulnerability-exception-tracking-system
- **décision**: adapt
- **raison**: gouvernance **défensive** exception/risk-acceptance — requêtes catégorisées (remediation-delay 30j, no-fix 90j, business-critical 60j, false-positive, compensating-control 180j) avec durées max + tiers d'approbation, compensating-controls obligatoires (détection/prévention/réponse/monitoring), schéma auditable (tables exception + audit-log), workflow request→approve/reject, checker d'expiration quotidien (auto-réouverture). Garde le risque accepté visible et time-boxé (PCI-DSS/SOC2/NIST-CSF). Nourrit `mas-sec-reviewer` + §5.
- **dedup**: non — angle risk-acceptance/exception absent de notre surface; complète l'aging-SLA (le "que fait-on quand on rate la SLA"). Distinct de `mas-sec-reviewer` (gate).
- **garde-fou défensif**: Flask API read/write sur SA PROPRE DB d'exceptions (gouvernance), aucun exploit/scan-actif. Pas de skip silencieux: toute exception = risk-acceptance enregistrée + expirable. Pas d'écriture hors sandbox (§5).
- **chemin library**: `packages/skills/library/building-vulnerability-exception-tracking-system/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` NIST-CSF/MITRE-ATTACK préservé + Prompt Defense Baseline; 7 sections §12 défensives; 0 secret réel, 0 sdk, 0 cash).

## exploiting-vulnerabilities-with-metasploit-framework
- **décision**: reject
- **raison**: arme offensive prête-à-tirer. Le skill pilote le Metasploit Framework (2 300 exploits, 1 200 auxiliaires, 400 post-exploit) : `use exploit/...`, `set PAYLOAD windows/x64/meterpreter/reverse_tcp`, `exploit`, puis post-exploitation explicite — `hashdump`, `credential_collector`, autoroute/socks_proxy (pivoting), `keyscan_start`, exfil de creds/loot. Le cadrage "validation VM" est cosmétique : le cœur reste l'exécution d'exploits + meterpreter + lateral movement contre des hôtes cibles. Viole directement le garde-fou défensif du lot et CLAUDE.md §5 (exécution mutante sortante vers des systèmes tiers = `risk: blocking`, jamais auto). Aucun résidu défensif-only récupérable que les autres skills du lot (patch/SLA/EPSS/exception/posture/BAS) ne couvrent déjà sans arme.
- **dedup**: n/a — la seule lentille transférable (prouver l'exploitabilité pour prioriser) est déjà couverte sans exécution offensive par EPSS (probabilité réelle d'exploit) + KEV (exploitation confirmée) + BAS (validation safe-sim sans exploitation). Le reste est unsafe par construction.
- **chemin library**: aucun (rejeté, pas de dossier slug).
- **garde-fou défensif appliqué**: KILL match exact — framework d'exploitation/payload/meterpreter/post-exploitation/pivoting. Reframe impossible: stripper l'offensif ne laisse qu'une coquille redondante.
- **état**: rejeté. KILL: arme d'exploitation prête-à-tirer (meterpreter, hashdump, pivoting, exfil), §5 risk:blocking (exécution mutante sortante vers tiers), pas de résidu défensif-only. Re-audit: **non** — conflit structurel avec la doctrine défensive + §5; ne jamais ré-ingérer un moteur d'exploitation.

## implementing-attack-path-analysis-with-xm-cyber
- **décision**: adapt
- **raison**: priorisation **défensive** par reachability (CTEM/exposure-management, XM Cyber exemplaire) — modélise comment les expositions (identity ~40%, misconfig ~38%, réseau, CVE ~8%, cloud) s'enchaînent vers les actifs critiques, score par atteignabilité-aux-crown-jewels (pas CVSS), surface les **choke points** (~2% des expositions sur des chemins convergents) dont la correction effondre beaucoup de chemins. Définir les actifs critiques d'abord, capteurs read-only/agentless, prioriser par paths-blocked × assets-protected. Nourrit `mas-sec-reviewer` + §5.
- **dedup**: non — angle graphe-d'attaque/choke-point absent de notre surface; complète EPSS (probabilité) et l'aging-SLA (horloge) par la lentille atteignabilité. Distinct de `mas-sec-reviewer` (gate).
- **garde-fou défensif (§5)**: malgré le mot "attack path", c'est de la **modélisation read-only**, pas de l'exploitation. Reframé explicitement: capteurs read-only/agentless (compte AD read-only, rôles cloud Reader) sur actifs POSSÉDÉS uniquement; aucune exécution d'exploit (différence martelée vs metasploit rejeté); toute action active hors sandbox = §5-gated.
- **chemin library**: `packages/skills/library/implementing-attack-path-analysis-with-xm-cyber/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` NIST-CSF/MITRE-ATTACK préservé + Prompt Defense Baseline; 7 sections §12 défensives; 0 secret, 0 sdk, 0 cash).

## implementing-cloud-vulnerability-posture-management
- **décision**: adapt
- **raison**: CSPM **défensif** multi-cloud — détecte les risques cloud-native (IAM over-permission, storage public, data non-chiffrée, contrôles réseau manquants, misconfig service) via AWS Security Hub, Azure Defender for Cloud, et open-source Prowler/ScoutSuite, sous identités read-only audit (SecurityAudit IAM / Azure Security Reader). Mapping CIS/NIST/PCI, agrégation multi-provider par sévérité, rapport de posture priorisé. Tags AI-security potentiels (cloud) → recoupe la doctrine sécurité-agent. Nourrit `mas-sec-reviewer` + §5.
- **dedup**: non — angle misconfig cloud-native (vs CVE) absent de notre surface; complète les autres skills du lot (orientés findings/CVE). Distinct de `mas-sec-reviewer` (gate).
- **garde-fou défensif (§5)**: scan = **read-only audit** sur comptes POSSÉDÉS uniquement (SecurityAudit/Reader), aucun write/admin, aucun exploit. Reframé explicitement: un finding "bucket public" est **rapporté**, jamais accédé pour "confirmer" (accès = unauthorized data access). Cross-account = §5-gated.
- **chemin library**: `packages/skills/library/implementing-cloud-vulnerability-posture-management/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` NIST-CSF/MITRE-ATTACK préservé + Prompt Defense Baseline; 7 sections §12 défensives; ARN d'exemple = placeholders, 0 secret réel, 0 sdk, 0 cash).

## implementing-continuous-security-validation-with-bas
- **décision**: adapt
- **raison**: validation continue **défensive** des contrôles via BAS (SafeBreach/AttackIQ/Picus/Cymulate exemplaires) — émule en **safe-sim** des TTP MITRE ATT&CK à travers la kill-chain contre les contrôles possédés (EDR/NGFW/email-gw/SIEM/WAF), score control-effectiveness (prevented+detected/total) par contrôle, mappe les gaps aux tactiques ATT&CK, planifie validation daily/weekly/monthly + régression après chaque change. Nourrit `mas-sec-reviewer` + §5 + priorisation des règles SIEM.
- **dedup**: non — angle assurance-de-contrôle (les contrôles détectent-ils vraiment ?) absent de notre surface; complète l'attack-path (quels chemins) par "les défenses tiennent-elles". Distinct de `mas-sec-reviewer` (gate).
- **garde-fou défensif (§5)**: cœur du garde-fou — la source insiste "safe simulation, no exploitation" (table BAS vs pentest/red-team). Reframé explicitement: émulation safe-mode, JAMAIS exploitation réelle (distinction martelée vs metasploit rejeté); coordination SOC obligatoire; sim sur systèmes POSSÉDÉS du projet uniquement, hors-sandbox §5-gated.
- **chemin library**: `packages/skills/library/implementing-continuous-security-validation-with-bas/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` NIST-CSF/MITRE-ATTACK + `d3fend_techniques` préservés + Prompt Defense Baseline; 7 sections §12 défensives; 0 secret, 0 sdk, 0 cash).

## implementing-epss-score-for-vulnerability-prioritization
- **décision**: adapt
- **raison**: priorisation **défensive** par probabilité d'exploitation (EPSS de FIRST) — interroge l'API EPSS (api.first.org) pour la proba d'exploitation à 30j (0.0-1.0) + percentile de chaque CVE, combine EPSS × CVSS en tiers (EPSS>0.7 & CVSS>=9 → P0 24h … P4 90j), détecte les spikes EPSS (menace émergente). EPSS = likelihood, CVSS = impact: les deux. Nourrit `mas-sec-reviewer` + §5 (puis aging-SLA pour l'horloge). Lentille la plus directement réutilisable du lot.
- **dedup**: non — angle exploitation-probability absent de notre surface; complète l'aging-SLA (qui consomme EPSS comme modificateur) et le patch-process (KEV/EPSS pour la fenêtre). Distinct de `mas-sec-reviewer` (gate).
- **garde-fou défensif + §5 réseau**: aucune exploitation — pure priorisation depuis données publiques. Reframé explicitement: appels API uniquement vers `api.first.org`/dataset public, à déclarer dans `allowed_hosts` (§5 network calls gatées). Pas d'exploit du P0 pour "confirmer".
- **chemin library**: `packages/skills/library/implementing-epss-score-for-vulnerability-prioritization/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` NIST-CSF/MITRE-ATTACK préservé + Prompt Defense Baseline; 7 sections §12 défensives; CVE d'exemple uniquement, 0 secret, 0 sdk, 0 cash).

---

### Récap
- **8/9 keepers** (tous `adapt`), **1 reject**. Lot quasi-intégralement défensif (blue-team vulnerability-management).
- Seul rejet: `exploiting-vulnerabilities-with-metasploit-framework` — KILL garde-fou exact (framework d'exploitation prêt-à-tirer: meterpreter, hashdump, pivoting, exfil; §5 risk:blocking; pas de résidu défensif-only car EPSS+KEV+BAS couvrent déjà la lentille "prioriser/valider" sans arme). Re-audit: non.
- Garde-fou défensif appliqué partout: la lentille détection/priorisation/durcissement/gouvernance gardée; tout angle offensif strippé. Points sensibles reframés explicitement:
  - **attack-path (XM Cyber)** et **BAS** portent "attack" dans le nom mais sont modélisation read-only / safe-simulation — distinction martelée vs metasploit; capteurs read-only/agentless, sim sur systèmes possédés, hors-sandbox §5-gated.
  - **CSPM**: scan read-only audit (SecurityAudit/Reader) sur comptes possédés; un finding "bucket public" est rapporté, jamais accédé.
  - **patch-process**: MAOS planifie; tout push hors sandbox = §5-gated; validation = re-scan, jamais exploit.
  - **EPSS**: appels limités à `api.first.org` (allowed_hosts §5).
- Frameworks préservés dans la metadata: NIST-CSF + MITRE-ATTACK sur les 8 keepers; BAS conserve en plus `d3fend_techniques` (5 techniques défensives D3FEND).
- §5 secrets: `building-vulnerability-dashboard-with-defectdojo` — placeholders DB-password/secret-key/AES-key/API-token reframés en secrets fournis par l'opérateur, jamais committés, jamais possédés par MAOS.
- Recadrage §11 transverse: 0 chiffre cash (sources sans $), tuning = quota d'abonnement.
- Garde-fous techniques: 0 `@anthropic-ai/sdk`, 0 secret réel/PII dans les 8 outputs (ARN/clé/CVE = placeholders/exemples).
- Renames: aucun — les 8 library-slugs sont identiques aux source-slugs.

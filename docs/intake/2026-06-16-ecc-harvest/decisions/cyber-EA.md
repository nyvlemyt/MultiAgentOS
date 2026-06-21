# ECC Harvest — décisions lot EA (cluster `cyber:soc-operations`)

Doer: lot EA (7 skills). Worktree `maos-ecc`, branche `phase/ecc-harvest`. Méthode: intake-audit, barre défensive blue-team.
Source: `mukul975/Anthropic-Cybersecurity-Skills` (clone read-only `--depth 1`, 2026-06-18), licence **Apache-2.0**, auteur frontmatter `mahipal`. Cible: `packages/skills/library/<slug>/SKILL.md`, forme exacte de l'exemplaire §12 (`agentic-engineering`).

## Guardrails (intake-audit step 0)
- **Local-first / abonnement §11**: aucun chiffre $/€ dans les corps boostés; toute mesure de coût = unités de quota (§8). Les sources n'en contiennent pas (SOC ops, pas de billing).
- **§5 actions risquées**: ces 7 skills sont des doctrines de **détection/triage défensifs**. Aucun n'exécute d'action risquée par construction (pas de `rm`/push/secrets). Les blocs SPL/KQL/EQL sont des **requêtes de lecture** SIEM — données read-only. Conservés comme savoir, pas comme exécution automatique. La requête `sendalert`/`curl POST` (déploiement de règle) reste illustrative; en runtime MAOS elle tomberait sous gate §5 (réseau hors `allowed_hosts` + écriture). Cadré dans chaque corps.
- **Memory Keeper §8**: ces skills ne touchent pas `data/memory/`.
- **Sanitize**: 7/7 sources clean. Pas de secret/PII réel. Placeholders non-secrets conservés (`YOUR_API_KEY`, IP RFC1918, BTC fictif d'un scénario). `@anthropic-ai/sdk`: absent des 7 sources → lint guard non concerné.
- **frameworks préservés**: copiés du frontmatter source (`nist_csf`, `mitre_attack`, + `nist_ai_rmf`/`atlas_techniques`/`d3fend_techniques` où présents).

## Recadrage transverse
Le cluster `cyber:soc-operations` (33 skills, T1 dans `cybersec-clusters.md`) = ops défensives. Ces 7 nourrissent la doctrine sécurité-agent de MAOS (`mas-sec-reviewer` + CLAUDE.md §5): méthodes de détection comportementale, onboarding de visibilité, validation de couverture, triage. Le **purple-team** est gardé **défensif**: l'objet du skill est la *validation collaborative de détection* (mesurer si les règles bleues se déclenchent), pas l'attaque — l'émulation rouge y est un moyen au service du gap-remediation bleu, explicitement coordonné et autorisé.

---

## performing-lateral-movement-detection
- **décision**: implement (keeper, boosté)
- **raison**: doctrine de détection post-compromis (PtH/ticket, PsExec, WMI, WinRM, RDP, SMB admin-share, DCOM, tâches planifiées) par corrélation SIEM Windows+Sysmon+netflow, mappée ATT&CK TA0008. Pur blue-team, nourrit `mas-sec-reviewer` et CLAUDE.md §5 (savoir de détection comportementale).
- **3 coûts**: install = boost §12 (faible, tokens modérés); maintenance = TTP/EventCodes stables, dérive lente; removal = réversible (dossier slug isolé).
- **scores** (0–5): project_fit 4 · token_efficiency 4 (L1 dense) · safety 5 (lecture seule, containment recadré §5) · implementation_effort 4 · evidence_maturity 4 (ATT&CK/d3fend/nist_csf, auteur identifié) · user_value 4 · phase_compatibility 5.
- **KILL check**: pas de PAYG, pas d'`@anthropic-ai/sdk`, pas de secret, pas d'exécution risquée auto (SPL = read-only). Aucun veto.
- **frameworks**: `nist_csf`, `mitre_attack`, `d3fend_techniques` préservés.
- **chemin library**: `packages/skills/library/performing-lateral-movement-detection/SKILL.md`
- **rename**: aucun.
- **état**: boosté conforme (ligne 1 `---`, commentaire source, summary L1, metadata complet+frameworks, Prompt Defense Baseline verbatim, 7 sections §12). Recadrage clé: containment = action §5 gatée humain, jamais auto; coûts en quota (§8/§11). Re-audit: si nouveau corpus EventCode/ATT&CK majeur.


## performing-log-source-onboarding-in-siem
- **décision**: implement (keeper, boosté)
- **raison**: doctrine d'onboarding de source dans un SIEM (priorisation valeur/coût NCSC, collecte syslog/forwarder/cloud, parsers, normalisation CIM/ECS, validation qualité, activation détection). Couche visibilité défensive — sans elle pas de détection. Nourrit la posture monitoring §5.
- **3 coûts**: install = boost §12 (faible); maintenance = formats de logs stables, dérive lente; removal = réversible (slug isolé).
- **scores** (0–5): project_fit 4 · token_efficiency 4 · safety 5 (config décrite, changement prod recadré §5/change-mgmt) · implementation_effort 4 · evidence_maturity 4 (NCSC + CIM, refs externes) · user_value 4 · phase_compatibility 5.
- **KILL check**: pas de PAYG/SDK/secret. Changements collecteur prod = recadrés actions §5 change-managées. Aucun veto.
- **frameworks**: `nist_csf`, `mitre_attack` préservés.
- **chemin library**: `packages/skills/library/performing-log-source-onboarding-in-siem/SKILL.md`
- **rename**: aucun.
- **état**: boosté conforme (8 sections, Prompt Defense Baseline verbatim, metadata+frameworks). Recadrage clé: coût d'ingestion = quota/data-budget (§8/§11) pas $/GB; tout changement prod = §5 gaté. Re-audit: si schémas SIEM (CIM/ECS) évoluent fortement.

## performing-purple-team-exercise
- **décision**: implement (keeper, boosté) — **gardé DÉFENSIF**
- **raison**: validation collaborative, autorisée et coordonnée de la détection bleue (matrice ATT&CK + alerte attendue, mesure détection Y/N + latence, gap-remediation en séance, re-test, couverture avant/après). L'émulation rouge (Atomic Red Team/Caldera) est l'instrument de mesure, pas l'objet. Nourrit la validation de couverture `mas-sec-reviewer`.
- **vérif KILL weaponization**: NON déclenché. Le skill ne fournit pas d'arme/évasion/ciblage de masse; l'exécution rouge y est explicitement autorisée+coordonnée+nettoyée. Cadrage défensif renforcé (Overview/Principles/Red Flags) : sans autorisation+scope+comms temps réel → ce n'est plus du purple-team, stop.
- **3 coûts**: install = boost §12 (faible); maintenance = TTP/outils stables; removal = réversible.
- **scores** (0–5): project_fit 4 · token_efficiency 4 · safety 4 (exécution live recadrée §5-gatée+change-mgmt) · implementation_effort 4 · evidence_maturity 4 (ATT&CK/d3fend) · user_value 4 · phase_compatibility 5.
- **KILL check**: pas de PAYG/SDK/secret. Exécution live = §5 gatée humain. Aucun veto.
- **frameworks**: `nist_csf`, `mitre_attack`, `d3fend_techniques` préservés.
- **chemin library**: `packages/skills/library/performing-purple-team-exercise/SKILL.md`
- **rename**: aucun.
- **état**: boosté conforme (8 sections, Prompt Defense Baseline verbatim, metadata+frameworks). Recadrage clé: défensif strict, autorisation obligatoire, exécution live §5, coûts en quota. Re-audit: si dérive vers usage offensif non coordonné.

## performing-soc-tabletop-exercise
- **décision**: implement (keeper, boosté)
- **raison**: exercice discussion-only validant playbooks IR, escalade, communication cross-fonctionnelle et décision sous pression via injects scénarisés (sans impact prod). Scoring rubrique + AAR avec gaps owned/datés + suivi clôture. Doctrine de répétition de processus défensif.
- **3 coûts**: install = boost §12 (faible); maintenance = méthodo NIST SP 800-84 stable; removal = réversible.
- **scores** (0–5): project_fit 4 · token_efficiency 4 · safety 5 (n'exécute rien; remediation §5 hors séance) · implementation_effort 4 · evidence_maturity 4 (NIST/FEMA HSEEP refs) · user_value 4 · phase_compatibility 5.
- **KILL check**: pas de PAYG/SDK/secret; tabletop = discussion seule, zéro exécution. Aucun veto.
- **frameworks**: `nist_csf`, `mitre_attack` préservés.
- **chemin library**: `packages/skills/library/performing-soc-tabletop-exercise/SKILL.md`
- **rename**: aucun.
- **état**: boosté conforme (8 sections, Prompt Defense Baseline verbatim, metadata+frameworks). Recadrage clé: discussion-only, remediation réelle = §5 gatée hors exercice, coûts en quota. Re-audit: si cadre compliance évolue.

## performing-threat-hunting-with-elastic-siem
- **décision**: implement (keeper, boosté)
- **raison**: chasse proactive hypothesis-driven dans Elastic Security (KQL Discover, EQL séquences, Timeline, conversion en règles de détection + Navigator). Trouve les menaces qui échappent à la détection auto. Pur blue-team, nourrit la couverture détection.
- **note placeholder**: `Authorization: ApiKey YOUR_API_KEY` = placeholder non-secret conservé tel quel (illustration de déploiement de règle). Déploiement réel = §5 gaté.
- **3 coûts**: install = boost §12 (faible); maintenance = KQL/EQL/ECS stables; removal = réversible.
- **scores** (0–5): project_fit 4 · token_efficiency 4 · safety 5 (KQL/EQL read-only, deploy/isolate recadrés §5) · implementation_effort 4 · evidence_maturity 4 (ATT&CK+ATLAS+nist_ai_rmf+d3fend) · user_value 4 · phase_compatibility 5.
- **KILL check**: pas de PAYG/SDK/secret réel; requêtes = lecture seule. Aucun veto.
- **frameworks**: `nist_csf`, `mitre_attack`, `nist_ai_rmf`, `atlas_techniques`, `d3fend_techniques` préservés (le seul des 7 portant ATLAS — signal AI-security).
- **chemin library**: `packages/skills/library/performing-threat-hunting-with-elastic-siem/SKILL.md`
- **rename**: aucun.
- **état**: boosté conforme (8 sections, Prompt Defense Baseline verbatim, metadata+frameworks). Recadrage clé: hunt read-only, deploy/isolate §5, coûts en quota. Re-audit: si Elastic Security change de modèle de requêtes.

## performing-user-behavior-analytics
- **décision**: implement (keeper, boosté)
- **raison**: UEBA défensif — détection de comptes compromis/menace interne par déviation de baseline (impossible travel, off-hours, volume d'accès, abus de privilège) + score de risque pondéré. Read-only. Nourrit détection comportementale §5.
- **3 coûts**: install = boost §12 (faible); maintenance = stats/baselines stables; removal = réversible.
- **scores** (0–5): project_fit 4 · token_efficiency 4 · safety 5 (read-only; contrainte éthique forte: indicateurs ≠ preuve/sanction) · implementation_effort 4 · evidence_maturity 4 · user_value 4 · phase_compatibility 5.
- **KILL check**: pas de PAYG/SDK/secret; analyse lecture seule. Garde-fou éthique ajouté (jamais preuve/sanction/auto-enforcement). Aucun veto.
- **frameworks**: `nist_csf`, `mitre_attack` préservés.
- **chemin library**: `packages/skills/library/performing-user-behavior-analytics/SKILL.md`
- **rename**: aucun.
- **état**: boosté conforme (8 sections, Prompt Defense Baseline verbatim, metadata+frameworks). Recadrage clé: sorties = indicateurs pour investigation humaine (jamais verdict/sanction), réponse §5 gatée, coûts en quota. Re-audit: si politique vie privée/insider-threat évolue.

## triaging-security-alerts-in-splunk
- **décision**: implement (keeper, boosté)
- **raison**: triage Tier-1 Splunk ES (priorisation Incident Review par urgency, contexte notable, corrélation multi-sources, enrichissement threat-intel, disposition TP/BTP/FP/undetermined, documentation, métriques MTTD/MTTR). Cœur des ops défensives quotidiennes. Read-only.
- **3 coûts**: install = boost §12 (faible); maintenance = méthodo triage stable; removal = réversible.
- **scores** (0–5): project_fit 4 · token_efficiency 4 · safety 5 (SPL read-only, escalade/disable recadrés §5) · implementation_effort 4 · evidence_maturity 4 · user_value 5 (ops récurrentes) · phase_compatibility 5.
- **KILL check**: pas de PAYG/SDK/secret; SPL = lecture seule. Aucun veto.
- **frameworks**: `nist_csf`, `mitre_attack` préservés.
- **chemin library**: `packages/skills/library/triaging-security-alerts-in-splunk/SKILL.md`
- **rename**: aucun.
- **état**: boosté conforme (8 sections, Prompt Defense Baseline verbatim, metadata+frameworks). Recadrage clé: triage observe, escalade state-changing (disable/isolation) = §5 gatée, coûts en quota. Re-audit: si Splunk ES change le modèle notable/Incident Review.

---

## Bilan lot EA

- **Keepers: 7/7** (aucun reject). Les 7 sont du blue-team SOC défensif pur (cluster `cyber:soc-operations`, T1). Aucune weaponization/évasion/ciblage-de-masse rencontrée → KILL non déclenché.
- **purple-team**: gardé défensif (validation collaborative de détection), garde-fous d'autorisation+coordination renforcés.
- **Renames: 0** — slugs source conservés à l'identique.
- **Recadrage transverse appliqué partout**: SPL/KQL/EQL = analyse télémétrie read-only; toute action state-changing (containment, isolation, disable, deploy de règle, changement collecteur prod) = action §5 gatée humain, jamais auto même en autopilot; coûts = unités de quota (§8) jamais $/€ (§11).
- **Sanitize**: 7/7 clean. Placeholders non-secrets conservés (`YOUR_API_KEY`, IP RFC1918, BTC fictif scénario). Zéro `@anthropic-ai/sdk`.
- **Conformité §12**: chaque SKILL.md = ligne 1 `---`, frontmatter name/description/summary(L1)/metadata{origin,license=Apache-2.0,cluster,tier=T1,status=library,frameworks}, commentaire `<!-- pattern from ... -->`, `## Prompt Defense Baseline` verbatim, 7 sections (Overview/When-to-Use/Principles[cite source]/Process/Rationalizations/Red Flags/Verification).

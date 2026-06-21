# ECC Harvest — décisions cluster `cyber:incident-response` (lot DT)

Doer: lot DT (9 skills). Worktree `maos-ecc`, branche `phase/ecc-harvest`. Méthode: `intake-audit` lifecycle complet, barre LARGE (T1 défense blue-team, library).
Source: `mukul975/Anthropic-Cybersecurity-Skills` (clone read-only `/tmp/cybersec-inspect/skills/<slug>`, Apache-2.0, auteur `mahipal`). Cible: `packages/skills/library/<slug>/SKILL.md`.
Cluster: `cyber:incident-response` (sous-domaine `incident-response`, 26 skills au total — cf. `cybersec-clusters.md`). Tier **T1** (défense → nourrit `mas-sec-reviewer` + CLAUDE.md §5).

## Cadrage transverse (rappels CLAUDE.md)
- **§11 abonnement, jamais PAYG.** Toute mesure de coût = unités de quota / fenêtre (TOKEN_STRATEGY §8), jamais $/€. Aucun import `@anthropic-ai/sdk` (vérifié absent des 9 sources).
- **§5 actions risquées toujours gated.** Ces skills décrivent containment/eradication (isolation réseau, reset KRBTGT, purge mailbox, suppression de fichiers/clés, `rm`, `git`-équivalents). En MAOS ce sont des **playbooks de connaissance défensive** : ils n'exécutent rien automatiquement — toute action destructive reste un clic humain (§5 risk:high/blocking), même en autopilot.
- **§12 forme boostée.** Chaque keeper réécrit à l'exemplaire `agentic-engineering` : ligne 1 `---`; frontmatter name/description/summary L1/metadata{origin,license,cluster,tier,status,frameworks}; commentaire `<!-- pattern from ... -->`; `## Prompt Defense Baseline` verbatim; 7 sections §12 (Overview / When to Use / Principles citant la source / Process / Rationalizations / Red Flags / Verification Criteria).
- **DEFENSIVE only.** Les 9 sources sont du blue-team IR pur (réponse malware/phishing, forensics mémoire, containment, eradication, investigation AD-compromise). Aucune n'est de la weaponization/mass-targeting/evasion → 0 KILL. `frameworks` (nist_csf + mitre_attack, et d3fend quand présent) préservés depuis le frontmatter source.

## Sanitize
9/9 sources clean : aucun secret réel (hashes tronqués, IP défangées `[.]`, e-mails `corp.example.com` = placeholders illustratifs), aucun `@anthropic-ai/sdk`, aucune clé privée. Vérifié par grep regex (sk-ant-/AKIA/PRIVATE KEY/ANTHROPIC_API_KEY → vide).

---

## conducting-malware-incident-response
- **décision**: adapt (keeper)
- **identité**: lifecycle IR malware enterprise (detect→scope→contain→analyze→eradicate→recover). Frameworks source : nist_csf RS.MA/RS.AN/RC.RP, mitre_attack T1204/T1027/T1055/T1059/T1486, d3fend (5 techniques). DEFENSIVE pur.
- **fit**: nourrit `mas-sec-reviewer` + CLAUDE.md §5 — doctrine de réponse à incident, lentille « playbook défensif » absente de notre surface (planner/dispatcher gèrent le DAG, pas la réponse IR). Pas de doublon dans `docs/knowledge/` ni dans les `mas-*`.
- **3 coûts**: install = réécriture §12 (faible, tokens modérés) ; maintenance = quasi-nulle (doctrine stable, ATT&CK versionné) ; removal = trivial (1 dossier slug, réversible).
- **KILL**: aucun. Pas de PAYG, pas de clé, n'exécute rien (connaissance), DEFENSIVE. Les actions destructives décrites (isolate/delete/disable) restent human-gated §5 → conforme.
- **appropriation MAOS**: reframé en playbook de connaissance ; toute action destructive = clic humain (§5 risk:high/blocking) ; télémétrie en quota/events, jamais $/€ (§11).
- **chemin library**: `packages/skills/library/conducting-malware-incident-response/SKILL.md` (pas de rename).
- **état**: boosté §12 (ligne1 `---`, commentaire source, summary L1, metadata+frameworks, Prompt Defense Baseline verbatim, 7 sections). Re-audit: si ATT&CK/d3fend majeur évolue, sinon n/a.


## conducting-memory-forensics-with-volatility
- **décision**: adapt (keeper)
- **identité**: forensics mémoire Volatility 3 sur RAM dump (acquire→identify OS→processes→netscan→malfind→credentials). Frameworks : nist_csf RS/RC, mitre_attack T1055/T1003.001/T1014/T1059.001/T1620. DEFENSIVE/DFIR.
- **fit**: lentille forensic post-containment, complète `conducting-malware-incident-response` (analyse de la preuve volatile). Nourrit §5/`mas-sec-reviewer`. Pas de doublon.
- **3 coûts**: install faible ; maintenance quasi-nulle (Volatility 3 stable) ; removal trivial (1 slug).
- **KILL**: aucun. Pas de PAYG/clé. Risque dual-use (hashdump) neutralisé : acquisition + extraction credentials = système possédé/autorisé uniquement, human-gated §5, preuve-only (jamais réutilisation offensive).
- **appropriation MAOS**: playbook de connaissance ; steps sensibles (acquisition, hashdump) = clic humain (§5) ; quota/events pas $/€ (§11).
- **chemin library**: `packages/skills/library/conducting-memory-forensics-with-volatility/SKILL.md` (pas de rename).
- **état**: boosté §12 (8 sections, Prompt Defense Baseline, frameworks préservés). Re-audit: n/a (stable).

## conducting-phishing-incident-response
- **décision**: adapt (keeper)
- **identité**: lifecycle IR phishing (triage headers→analyse sandbox→scope funnel→contain purge+account→harden). Frameworks : nist_csf RS/RC, mitre_attack T1566.001/.002, T1204.001/.002, T1114, T1056.003. DEFENSIVE.
- **fit**: nourrit §5/`mas-sec-reviewer` ; complémente `detecting-email-account-compromise` (BEC interne = renvoi explicite). Pas de doublon.
- **3 coûts**: install faible ; maintenance faible (techniques AiTM/quishing évoluent lentement) ; removal trivial.
- **KILL**: aucun. Pas de PAYG/clé. Risque dual-use (authoring phishing) explicitement refusé dans le corps ; actions purge/disable/revoke human-gated §5.
- **appropriation MAOS**: playbook ; purge mailbox + account remediation = clic humain (§5) ; quota/events (§11).
- **chemin library**: `packages/skills/library/conducting-phishing-incident-response/SKILL.md` (pas de rename).
- **état**: boosté §12 (8 sections, baseline, frameworks). Re-audit: n/a.

## conducting-post-incident-lessons-learned
- **décision**: adapt (keeper)
- **identité**: after-action review blameless (gather→post-mortem→RCA 5-Whys→métriques MTTD/MTTC/MTTR→action items→playbook/Sigma). Frameworks : nist_csf RS/RC, mitre_attack T1566/T1486/T1059/T1078. DEFENSIVE/process.
- **fit**: doctrine de revue post-incident ; outputs = memory candidates (`mas-memory-keeper`) + nourrit `mas-reviewer`. Pas de doublon (notre `mas-reviewer` vérifie outputs vs brief, pas la RCA d'incident sécu).
- **3 coûts**: install faible ; maintenance nulle (méthode stable) ; removal trivial.
- **KILL**: aucun. Pas de PAYG/clé, n'exécute rien, purement organisationnel.
- **appropriation MAOS**: effort = quota (§11) ; findings durables promus via Memory Keeper (§8, seul writer).
- **chemin library**: `packages/skills/library/conducting-post-incident-lessons-learned/SKILL.md` (pas de rename).
- **état**: boosté §12 (8 sections, baseline, frameworks). Re-audit: n/a.

## containing-active-breach
- **décision**: adapt (keeper)
- **identité**: containment breach actif (scope→short-term isolate/disable/KRBTGT→long-term ACL/microseg→validate→preserve evidence→communicate). Frameworks : nist_csf RS/RC, mitre_attack T1486/T1021.002/T1078/T1071.001/T1570. DEFENSIVE.
- **fit**: cœur §5 — containment touche des actions ultra-risquées (isolation réseau, reset KRBTGT, disable comptes) qui sont précisément le périmètre gated MAOS. Nourrit `mas-sec-reviewer`. Pas de doublon.
- **3 coûts**: install faible ; maintenance faible ; removal trivial.
- **KILL**: aucun. Pas de PAYG/clé. Actions destructives = human-gated §5 risk:high/blocking, explicité dans le corps ; n'exécute rien automatiquement.
- **appropriation MAOS**: playbook ; isolate/disable/KRBTGT = clic humain (§5, KRBTGT/branch-reset cités §5) ; quota/events (§11).
- **chemin library**: `packages/skills/library/containing-active-breach/SKILL.md` (pas de rename).
- **état**: boosté §12 (8 sections, baseline, frameworks). Re-audit: n/a.

## detecting-email-account-compromise
- **décision**: adapt (keeper)
- **identité**: détection EAC/BEC/account-takeover O365+Workspace (inbox rules externes, impossible travel, user agents non-humains, OAuth rogue, corrélation campagne). Frameworks : nist_csf RS/RC, mitre_attack T1486/T1490/T1070/T1078/T1566. DEFENSIVE/detection-engineering.
- **fit**: lentille détection ; complète `conducting-phishing-incident-response` (renvoi explicite phishing externe vs takeover interne). Nourrit §5/`mas-sec-reviewer`. Pas de doublon.
- **3 coûts**: install faible ; maintenance faible (Graph/UAL stables) ; removal trivial.
- **KILL**: aucun. Pas de PAYG/clé. Risque vie-privée (lecture mail) borné : audit metadata least-privilege, jamais harvest de contenu, tenant autorisé uniquement (§5).
- **appropriation MAOS**: lentille de connaissance ; lecture sous autorisation ; containment destructif délégué (human-gated §5) ; quota/events (§11).
- **chemin library**: `packages/skills/library/detecting-email-account-compromise/SKILL.md` (pas de rename).
- **état**: boosté §12 (8 sections, baseline, frameworks). Re-audit: n/a.

## eradicating-malware-from-infected-systems
- **décision**: adapt (keeper)
- **identité**: eradication post-containment (map persistence Win+Linux→identify artifacts→remove→rotate creds/KRBTGT→patch entry point→validate, re-image si rootkit). Frameworks : nist_csf RS/RC, mitre_attack T1486/T1490/T1070/T1078/T1547. DEFENSIVE/DFIR.
- **fit**: phase eradication ; suit `containing-active-breach` + `conducting-malware-incident-response`. Actions destructives (rm, KRBTGT) = cœur §5. Nourrit `mas-sec-reviewer`. Pas de doublon.
- **3 coûts**: install faible ; maintenance faible ; removal trivial.
- **KILL**: aucun. Pas de PAYG/clé. Le skill décrit `rm`/KRBTGT/credential-rotation — précisément les actions §5 always-gated ; corps explicite human-gate, image-before-delete, jamais auto-run.
- **appropriation MAOS**: playbook ; rm/KRBTGT/rotation = clic humain (§5, `rm`+branch-reset cités §5) ; quota/events (§11).
- **chemin library**: `packages/skills/library/eradicating-malware-from-infected-systems/SKILL.md` (pas de rename).
- **état**: boosté §12 (8 sections, baseline, frameworks). Re-audit: n/a.

## implementing-velociraptor-for-ir-collection
- **décision**: adapt (keeper)
- **identité**: collecte forensic fleet-scale Velociraptor/VQL (deploy server+clients→VQL artifacts Win/Linux/macOS→hunts bornés→real-time watch→SIEM/SOAR). Frameworks : nist_csf RS/RC, mitre_attack T1486/T1490/T1070/T1078/T1005, d3fend (5). DEFENSIVE/DFIR.
- **fit**: outillage de collecte IR ; complète forensics mémoire + investigation AD. Nourrit §5/`mas-sec-reviewer`. Pas de doublon.
- **3 coûts**: install faible ; maintenance faible ; removal trivial.
- **KILL**: aucun. Pas de PAYG/clé. Dual-use (déploiement d'agent) borné : endpoints possédés/autorisés seulement, déploiement human-gated §5, surveillance hors-IR refusée.
- **appropriation MAOS**: playbook ; déploiement agent = clic humain (§5) ; hunts bornés (quota) ; quota/events pas $/€ (§11).
- **chemin library**: `packages/skills/library/implementing-velociraptor-for-ir-collection/SKILL.md` (pas de rename).
- **état**: boosté §12 (8 sections, baseline, frameworks). Re-audit: n/a.

## performing-active-directory-compromise-investigation
- **décision**: adapt (keeper)
- **identité**: investigation compromission AD/identity-forensics (NTDS.dit/DCSync, Kerberos Golden/Silver/Kerberoast, GPO abuse, privileged groups, trusts ; méthodo scope→auth-logs→persistence→remediation). Frameworks : nist_csf RS/RC, mitre_attack T1486/T1490/T1070/T1078/T1021, d3fend (5). DEFENSIVE/DFIR.
- **fit**: investigation identité = cœur §5 (IAM/cross-projet gating) ; remediation (krbtgt rotation, DC rebuild) = always-gated. Nourrit `mas-sec-reviewer`. Pas de doublon.
- **3 coûts**: install faible ; maintenance faible (event IDs/ATT&CK stables) ; removal trivial.
- **KILL**: aucun. Pas de PAYG/clé. Dual-use (le repo source contient aussi des skills AD offensifs — hors lot DT) ; CETTE source est purement investigation défensive ; offensif/forge/persistence refusé dans le corps ; remediation human-gated §5.
- **appropriation MAOS**: playbook ; analyse read-only autorisée ; krbtgt/account-reset/DC-rebuild = clic humain (§5) ; quota/events (§11).
- **chemin library**: `packages/skills/library/performing-active-directory-compromise-investigation/SKILL.md` (pas de rename).
- **état**: boosté §12 (8 sections, baseline, frameworks). Re-audit: n/a.

---

## Bilan lot DT
9 sources auditées → **9 keepers (adapt)**, 0 reject. Cluster `cyber:incident-response`, tier T1, DEFENSIVE blue-team pur (aucune weaponization/mass-targeting/evasion). Aucun rename. 0 secret, 0 `@anthropic-ai/sdk`. Frameworks (nist_csf + mitre_attack, + d3fend sur 3 skills) préservés. Recadrage §5 (actions destructives human-gated) + §11 (quota, jamais $/€) appliqué partout.

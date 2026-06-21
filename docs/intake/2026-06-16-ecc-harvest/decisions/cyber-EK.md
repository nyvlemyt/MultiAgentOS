# ECC Harvest — décisions cluster `cyber:phishing-defense` (lot EK)

Doer : lot EK (8 skills phishing-defense). Worktree `maos-ecc`, branche `phase/ecc-harvest`. Méthode : `intake-audit` lifecycle complet, barre LARGE (T1, défense bleue).
Source : `mukul975/Anthropic-Cybersecurity-Skills` (read-only `/tmp/cybersec-inspect/skills/<slug>/SKILL.md`, Apache-2.0, author `mahipal`). Cible : `packages/skills/library/<slug>/SKILL.md`.

**Charte défensive.** Les 8 skills sont 100 % blue-team phishing-defense : analyse d'URL en sandbox (URLScan), bouton de signalement + triage, détection BEC (gateway+contrôles financiers ET IA/NLP comportementale), détection quishing QR, détection spearphishing au SEG, programme de formation anti-phishing, authentification email DMARC/DKIM/SPF. Aucune weaponisation / ciblage de masse / évasion → aucun KILL offensif déclenché. Tous mappent sur **CLAUDE.md §5** (URL/email = contenu non fiable ; appels sortants gatés sur `allowed_hosts` ; actions de purge/retract/quarantine = risk:high gatées humain) et alimentent `mas-sec-reviewer`.

**Recadrage transverse (§11).** MAOS = abonnement, jamais de PAYG per-token. Toute mention de coût/effort = unités de quota contre la fenêtre (TOKEN_STRATEGY §8), jamais €/$. Les chiffres statistiques des sources (taux de report, accuracy modèles) sont des métriques de domaine, pas des coûts — conservés ; aucun chiffre $/€ n'existait dans les sources.

**Sanitize (secrets / PII / `@anthropic-ai/sdk`).** 8/8 sources scannées : aucun secret réel, aucune PII, aucune clé. Les snippets (DMARC/SPF TXT records, `openssl genrsa` pour DKIM, exemples d'API URLScan) sont des **patterns illustratifs publics**, pas des secrets ; la clé DKIM `MIIBIjANBgkqhki...` est tronquée/illustrative. Les boosts distillent le pattern (Process numéroté) sans recopier les snippets opérationnels longs. `@anthropic-ai/sdk` : absent des 8 sources.

**Dup BEC (note tâche).** `detecting-business-email-compromise` (gateway rules + behavioral analytics + **contrôles financiers** : dual-auth, vérif out-of-band, FBI IC3 classification) vs `detecting-business-email-compromise-with-ai` (plateformes **IA/NLP** : baselines comportementaux, modèles transformer BERT, anomaly-detection, confidence thresholds). Delta distinct et substantiel (process control + email-rules vs ML-platform pipeline) → **garder les deux, AUCUN fold**. Note de non-redondance dans le corps de chacun (When NOT croisé).

**`frameworks` préservé** dans chaque metadata (nist_csf systématique ; + mitre_attack / atlas_techniques / nist_ai_rmf selon source). `d3fend_techniques` présents dans 2 sources : non retenus comme famille `frameworks` (alignement avec la convention des lots cyber précédents EJ qui ne gardent que nist_csf/nist_ai_rmf/atlas/mitre).

---

## analyzing-malicious-url-with-urlscan
- **décision** : adapt (keeper, boost §12)
- **identité** : analyse défensive d'URL suspecte via URLScan.io (détonation isolée Chromium : screenshot, DOM post-JS, HAR réseau, certificat TLS, IP/ASN, verdict). Frame de triage safe-detonation + extraction IOC. Obsolescence : basse (URLScan = service stable, gratuit).
- **fit** : nourrit `mas-sec-reviewer` + **CLAUDE.md §5** — l'URL analysée EST du contenu non fiable ; les lookups réputation (VT/PhishTank/Safe Browsing) doivent cibler uniquement `config/permissions.json#allowed_hosts`. Pas de dup : aucun slug d'analyse d'URL préexistant en library (les slugs `analyzing-dns-logs-*`, `investigating-phishing-email-incident` couvrent d'autres surfaces).
- **3 coûts** : install = bas (markdown, pattern distillé, snippet API non recopié) ; maintenance = suivre l'API URLScan ; removal = trivial (un dossier slug).
- **scores** (0–5) : project_fit 5 · token_efficiency 5 · safety 5 (lecture/évaluation, détonation isolée) · implementation_effort 5 · evidence_maturity 4 · user_value 4 · phase_compatibility 5.
- **KILL** : aucun. Pas de PAYG, pas d'exécution de code local, pas de secret, défensif, in-phase.
- **appropriation MAOS** : détonation-jamais-confiance, lookups confinés à `allowed_hosts` §5, IOC corroborés ≥2 sources, recadrage quota §8.
- **chemin library** : `packages/skills/library/analyzing-malicious-url-with-urlscan/SKILL.md`
- **état** : boosté conforme — ligne 1 `---`, commentaire source, summary L1, metadata (`frameworks` : nist_csf/mitre_attack/atlas_techniques), Prompt Defense Baseline verbatim, 7 sections §12. 0 sdk, 0 secret.
- **re-audit** : 12 mois ou changement majeur d'API URLScan.

## building-phishing-reporting-button-workflow
- **décision** : adapt (keeper, boost §12)
- **identité** : programme bouton-de-signalement + triage automatisé (déploiement Outlook multi-clients, pipeline SOAR d'extraction IOC + classification, actions de réponse, boucle de feedback reporter, métriques). Frame de capacité défensive end-to-end. Obsolescence : basse.
- **fit** : nourrit `mas-sec-reviewer` + **CLAUDE.md §5** — les actions destructives (retract org-wide, blocage sender, purge) sont gatées humain risk:high ; les lookups réputation/sandbox confinés à `allowed_hosts`. Pas de dup : aucun slug bouton-report préexistant.
- **3 coûts** : install = bas (markdown, pattern distillé) ; maintenance = suivre l'API Report/SOAR ; removal = trivial.
- **scores** : project_fit 5 · token_efficiency 5 · safety 5 (verdict automatisé, action gatée) · implementation_effort 5 · evidence_maturity 4 · user_value 4 · phase_compatibility 5.
- **KILL** : aucun. Pas de PAYG, pas de secret. La machinerie d'envoi est cadrée : pas de mass-mail, retract gaté §5.
- **appropriation MAOS** : automate-verdict-gate-purge, lookups confinés §5, recadrage quota §8, métriques en events.
- **chemin library** : `packages/skills/library/building-phishing-reporting-button-workflow/SKILL.md`
- **état** : boosté conforme — ligne 1 `---`, commentaire source, summary L1, metadata (`frameworks` : nist_csf/mitre_attack), Prompt Defense Baseline verbatim, 7 sections §12. 0 sdk, 0 secret.
- **re-audit** : 12 mois.

## detecting-business-email-compromise-with-ai
- **décision** : adapt (keeper, boost §12) — **gardé distinct du variant non-IA, AUCUN fold**
- **identité** : détection BEC pilotée IA/NLP (plateforme API-based, baselines comportementaux + writing-style, modèles transformer BERT/GPT, détection urgence/mismatch identité-style, seuils de confiance, réponse graduée). Frame ML-pipeline. Obsolescence : basse.
- **fit** : nourrit `mas-sec-reviewer` + **CLAUDE.md §5** — auto-quarantine = action gatée humain risk:high ; accès API confiné à `allowed_hosts`. **DELTA vs `detecting-business-email-compromise`** : ici = pipeline plateforme ML (baselines appris, transformers, anomaly-detection) ; le variant = règles SEG + analytics + **contrôles financiers** (dual-auth, vérif out-of-band). Surfaces complémentaires, substantiellement distinctes → garder les deux, note croisée When NOT dans chaque corps.
- **3 coûts** : install = bas (markdown, pattern distillé) ; maintenance = suivre plateformes/modèles + boucle d'apprentissage ; removal = trivial.
- **scores** : project_fit 5 · token_efficiency 5 · safety 5 · implementation_effort 5 · evidence_maturity 4 · user_value 4 · phase_compatibility 5.
- **KILL** : aucun. Pas de PAYG, pas de secret. Note : l'IA mentionnée est la plateforme de sécurité email tierce, pas un appel LLM MAOS (pas de §11 PAYG déclenché).
- **appropriation MAOS** : baseline-then-deviate, confidence-graded response, auto-quarantine gaté §5, accès confiné, recadrage quota §8.
- **chemin library** : `packages/skills/library/detecting-business-email-compromise-with-ai/SKILL.md`
- **état** : boosté conforme — ligne 1 `---`, commentaire source, summary L1, metadata (`frameworks` : nist_csf/nist_ai_rmf/mitre_attack/atlas_techniques), Prompt Defense Baseline verbatim, 7 sections §12. 0 sdk, 0 secret.
- **re-audit** : 12 mois.

## detecting-business-email-compromise
- **décision** : adapt (keeper, boost §12) — **gardé distinct du variant IA, AUCUN fold**
- **identité** : détection BEC par règles SEG + analytics comportementaux + **contrôles de processus financier** (dual-auth, vérif out-of-band téléphone, taxonomie FBI IC3, indicateurs de compromission de compte). Frame rules-and-controls. Obsolescence : basse.
- **fit** : nourrit `mas-sec-reviewer` ; les gates de processus financier (dual-auth, out-of-band verify) sont la **doctrine humaine derrière CLAUDE.md §5**. **DELTA vs `detecting-business-email-compromise-with-ai`** : ici = heuristiques gateway + contrôles AP/finance + persistance compte ; le variant = plateforme ML. Complémentaires → garder les deux.
- **3 coûts** : install = bas (markdown) ; maintenance = revue règles SEG + process AP ; removal = trivial.
- **scores** : project_fit 5 · token_efficiency 5 · safety 5 · implementation_effort 5 · evidence_maturity 4 · user_value 5 (contrôles financiers = haute valeur) · phase_compatibility 5.
- **KILL** : aucun. Pas de PAYG, pas de secret, défensif. Le skill ne déclenche PAS §5 paiement : il N'autorise pas de transfert, il impose le gate humain de vérification avant.
- **appropriation MAOS** : out-of-band-verify = analogue gate humain §5, dual-auth = analogue dual-approver, recadrage quota §8.
- **chemin library** : `packages/skills/library/detecting-business-email-compromise/SKILL.md`
- **état** : boosté conforme — ligne 1 `---`, commentaire source, summary L1, metadata (`frameworks` : nist_csf/nist_ai_rmf/mitre_attack/atlas_techniques), Prompt Defense Baseline verbatim, 7 sections §12. 0 sdk, 0 secret.
- **re-audit** : 12 mois.

## detecting-qr-code-phishing-with-email-security
- **décision** : adapt (keeper, boost §12)
- **identité** : détection quishing (QR-code phishing) — détection image/OCR au gateway, extraction+scan de l'URL décodée, protection mobile (MTD/MDM), règles de détection, contre-évasion 2025 (split/nested/ASCII/styled QR), formation. Obsolescence : basse (vecteur en forte croissance).
- **fit** : nourrit `mas-sec-reviewer` + **CLAUDE.md §5** — l'URL QR-décodée = contenu non fiable, lookups confinés à `allowed_hosts`. Pas de dup : delta clair vs `analyzing-malicious-url-with-urlscan` (décodage image vs analyse d'URL texte) — note croisée When NOT.
- **3 coûts** : install = bas (markdown, pattern distillé) ; maintenance = suivre l'évolution des évasions QR ; removal = trivial.
- **scores** : project_fit 5 · token_efficiency 5 · safety 5 · implementation_effort 5 · evidence_maturity 4 · user_value 4 · phase_compatibility 5.
- **KILL** : aucun. Pas de PAYG, pas de secret, défensif (détection, pas génération de QR malveillant).
- **appropriation MAOS** : decode-then-apply-URL-policy, URL décodée = untrusted §5, lookups confinés, recadrage quota §8.
- **chemin library** : `packages/skills/library/detecting-qr-code-phishing-with-email-security/SKILL.md`
- **état** : boosté conforme — ligne 1 `---`, commentaire source, summary L1, metadata (`frameworks` : nist_csf/nist_ai_rmf/mitre_attack/atlas_techniques), Prompt Defense Baseline verbatim, 7 sections §12. 0 sdk, 0 secret.
- **re-audit** : 12 mois ou évolution majeure des techniques quishing.

## detecting-spearphishing-with-email-gateway
- **décision** : adapt (keeper, boost §12)
- **identité** : configuration SEG contre spearphishing ciblé — protection impersonation (VIPs/domaines lookalike), détonation URL time-of-click, sandboxing pièces jointes (dynamic delivery), règles custom depuis logs, alerting+SIEM. Obsolescence : basse.
- **fit** : nourrit `mas-sec-reviewer` + **CLAUDE.md §5** — quarantine = action gatée humain risk:high ; détonations/lookups confinés à `allowed_hosts`. Pas de dup (slugs gateway préexistants couvrent d'autres surfaces ; ici = anti-spearphishing ciblé).
- **3 coûts** : install = bas (markdown, snippets de config non recopiés intégralement) ; maintenance = tuning règles + suivi vendeurs ; removal = trivial.
- **scores** : project_fit 5 · token_efficiency 5 · safety 5 · implementation_effort 5 · evidence_maturity 4 · user_value 4 · phase_compatibility 5.
- **KILL** : aucun. Pas de PAYG, pas de secret, défensif (config gateway, pas de lure).
- **appropriation MAOS** : layer-defenses, detonate-at-click, quarantine gaté §5, lookups confinés, recadrage quota §8.
- **chemin library** : `packages/skills/library/detecting-spearphishing-with-email-gateway/SKILL.md`
- **état** : boosté conforme — ligne 1 `---`, commentaire source, summary L1, metadata (`frameworks` : nist_csf/mitre_attack), Prompt Defense Baseline verbatim, 7 sections §12. 0 sdk, 0 secret.
- **re-audit** : 12 mois.

## implementing-anti-phishing-training-program
- **décision** : adapt (keeper, boost §12)
- **identité** : programme de formation anti-phishing (couche humaine) — baseline, curriculum role-based progressif, plateforme (KnowBe4/Proofpoint), simulations continues autorisées, renforcement positif, mesure vs SANS Maturity Model. Obsolescence : basse.
- **fit** : nourrit `mas-sec-reviewer` ; les simulations = activité **autorisée gatée (§5)** ; mesure non-punitive. Pas de dup : delta vs `building-phishing-reporting-button-workflow` (programme humain/formation vs pipeline technique de signalement) et vs `running-authorized-phishing-simulation` (programme complet vs exécution d'une simulation) — note When NOT.
- **3 coûts** : install = bas (markdown) ; maintenance = MAJ scénarios + cadence ; removal = trivial.
- **scores** : project_fit 4 · token_efficiency 5 · safety 5 (charte autorisation + non-punitif) · implementation_effort 5 · evidence_maturity 4 · user_value 4 · phase_compatibility 5.
- **KILL** : aucun. Garde-fou ajouté : simulations autorisées only, jamais de harvest de credentials réels, mesure non-punitive (When NOT + Red Flags).
- **appropriation MAOS** : baseline-before-train, simulations gatées §5, reinforce-not-punish, recadrage quota §8, métriques en events.
- **chemin library** : `packages/skills/library/implementing-anti-phishing-training-program/SKILL.md`
- **état** : boosté conforme — ligne 1 `---`, commentaire source, summary L1, metadata (`frameworks` : nist_csf/mitre_attack), Prompt Defense Baseline verbatim, 7 sections §12. 0 sdk, 0 secret.
- **re-audit** : 12 mois.

## implementing-dmarc-dkim-spf-email-security
- **décision** : adapt (keeper, boost §12)
- **identité** : authentification email SPF/DKIM/DMARC anti-spoofing — audit DNS, publication SPF (~all→-all), génération+publication DKIM (clé privée sur MTA, publique en DNS), rollout DMARC en 3 phases (none→quarantine→reject) + analyse des rapports agrégés. Obsolescence : basse (standards stables).
- **fit** : nourrit `mas-sec-reviewer` ; touche directement **CLAUDE.md §5/§11** — écritures DNS confinées aux domaines autorisés (§5), clé privée DKIM = secret jamais commité (§11). Pas de dup.
- **3 coûts** : install = bas (markdown, snippets dig/openssl/TXT distillés en pattern) ; maintenance = rotation clé DKIM + suivi rapports DMARC ; removal = trivial.
- **scores** : project_fit 4 · token_efficiency 5 · safety 5 (garde-fou secret/scope explicite) · implementation_effort 5 · evidence_maturity 5 (RFC standards) · user_value 4 · phase_compatibility 5.
- **KILL** : aucun. ⚠️ Sanitize : clé DKIM exemple `MIIBIjANBgkqhki...` = **tronquée/illustrative publique** (clé *publique* par nature), pas de clé privée réelle dans la source ; le boost ajoute Red Flag §11 « never commit the DKIM private key » + When NOT « no DNS outside scope ». Snippets opérationnels non recopiés intégralement.
- **appropriation MAOS** : audit-before-change, stage-to-reject, private-key-never-committed §11, DNS scope-confiné §5, recadrage quota §8.
- **chemin library** : `packages/skills/library/implementing-dmarc-dkim-spf-email-security/SKILL.md`
- **état** : boosté conforme — ligne 1 `---`, commentaire source, summary L1, metadata (`frameworks` : nist_csf/mitre_attack), Prompt Defense Baseline verbatim, 7 sections §12. 0 sdk, 0 secret réel.
- **re-audit** : 12 mois.

---

## Bilan lot EK

- **Keepers : 8/8** (tous `adapt`, boostés §12). Rejets : 0. **Folds : 0** — les deux skills BEC gardés distincts (rules+financial-controls vs IA/NLP-platform), delta substantiel, note croisée When NOT dans chaque corps.
- **Charte défensive respectée** : 8/8 blue-team phishing-defense (URLScan, bouton-report, BEC ×2, quishing, spearphishing SEG, formation, DMARC/DKIM/SPF). Aucune weaponisation / ciblage de masse / évasion → aucun KILL offensif. Tous mappent sur CLAUDE.md §5 (URL/email = untrusted ; lookups confinés `allowed_hosts` ; purge/retract/quarantine = risk:high gatés humain ; simulations autorisées ; DNS scope-confiné ; DKIM private key = secret §11).
- **Sanitize** : 8/8 clean. Snippets (TXT records SPF/DMARC, `openssl genrsa` DKIM, API URLScan, configs SEG) = patterns illustratifs publics, non recopiés intégralement (distillation en Process numéroté). Clé DKIM source = publique tronquée illustrative. Aucun secret réel, aucune PII. `@anthropic-ai/sdk` absent des 8 sources (l'« AI » du skill BEC-with-ai = plateforme tierce de sécurité email, pas un appel LLM MAOS → pas de §11 PAYG).
- **`frameworks` préservé** dans chaque metadata (nist_csf systématique ; + mitre_attack ; + nist_ai_rmf / atlas_techniques selon source). `d3fend_techniques` (2 sources) non retenus comme famille (convention lots cyber précédents).
- **Recadrage §11** : toute notion de coût/effort recadrée en quota units (§8), zéro chiffre €/$ propagé.
- **Cluster** : `cyber:phishing-defense`, tier T1, status library, origin `mukul975/Anthropic-Cybersecurity-Skills`, license Apache-2.0.

| source-slug | décision | raison (6 mots) |
|---|---|---|
| analyzing-malicious-url-with-urlscan | adapt-keeper | safe URL detonation feeds sec-reviewer |
| building-phishing-reporting-button-workflow | adapt-keeper | user-sensor triage, destructive actions gated |
| detecting-business-email-compromise-with-ai | adapt-keeper | ML-platform BEC lens, kept distinct |
| detecting-business-email-compromise | adapt-keeper | rules+financial-controls BEC, kept distinct |
| detecting-qr-code-phishing-with-email-security | adapt-keeper | quishing decode-then-scan, distinct delta |
| detecting-spearphishing-with-email-gateway | adapt-keeper | SEG layered impersonation+detonation defense doctrine |
| implementing-anti-phishing-training-program | adapt-keeper | human layer, authorized non-punitive simulations |
| implementing-dmarc-dkim-spf-email-security | adapt-keeper | email auth, private-key secret §11 |

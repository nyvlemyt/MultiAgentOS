# ECC Harvest — décisions Phase D cybersec, cluster `cyber:ransomware-defense` (lot EH)

Doer: lot EH (6 skills). Worktree `maos-ecc` (branche `phase/ecc-harvest`). Méthode: `intake-audit` lifecycle complet par skill, barre LARGE (T1 défensif, statut `library`).
Source: `mukul975/Anthropic-Cybersecurity-Skills` (clone read-only `--depth 1`, 2026-06-18), licence **Apache-2.0**, auteur `mahipal`. Cible: `packages/skills/library/<slug>/SKILL.md`.

**Cadrage transverse (guardrails §0).**
- **§11 abonnement** : MAOS = un seul mode de facturation (abonnement Claude Code). Aucun montant $/€ ne survit dans les keepers ; tout chiffre devient une unité de quota ou un objectif RPO/RTO (temps), jamais du cash. Les scénarios sources chiffrés en $ (« $2.3M évités », « $500K/jour », « ransom $2M ») sont reframés ou neutralisés.
- **§5 actions risquées** : ces skills sont du **savoir défensif** (KNOWLEDGE docs, statut `library`), pas du code exécutable câblé dans le runtime. Aucun `delete`/`rm`/écriture hors sandbox n'est automatisé par leur ingestion ; ils nourrissent la doctrine sauvegarde + le `mas-sec-reviewer`. Les commandes destructrices présentes dans les bodies sources (ex. `chattr +i`, reset krbtgt, isolation hôte) restent **illustratives** et tombent sous le gate humain §5 si un jour un agent les proposait.
- **§8 état dans `data/`** : la doctrine sauvegarde immuable est cohérente avec « tout l'état MAOS vit dans `data/` » — elle renforce notre discipline de protection de ce dossier ; aucune dépendance externe hors-repo n'est introduite (les outils cités — restic, Veeam, Thinkst — sont nommés à titre de référence, pas installés).
- **Sanitize** : 6/6 sources `SKILL.md` clean (0 secret réel, 0 PII, 0 import `@anthropic-ai/sdk`). Note : un script auxiliaire `scripts/process.py` (honeypot) contient des placeholders de canari (`AKIAIOSFODNN7EXAMPLE` = clé factice documentée AWS, `ghp_XXXX`) — **non porté** (seul le `SKILL.md` est la source).
- **Provenance** : `frameworks` préservés (nist_csf, mitre_attack, + nist_ai_rmf/atlas_techniques quand présents dans la source).
- **Reframe défense vs arme** : tous les 6 sont blue-team (détection précoce, sauvegarde immuable, kill-switch *vaccination défensive*, tabletop, recovery). Aucun n'est de la weaponization/ciblage de masse/évasion → aucun KILL au titre du périmètre offensif.

Bilan: **6 keepers / 6** (décision `adapt` pour les 6 — recadrage abonnement + reframing « organisation entreprise » → « MAOS local-first / sauvegarde de `data/` »). 0 reject.

---

## implementing-honeypot-for-ransomware-detection
- **décision**: adapt
- **raison**: couche de leurre (canaris, partages-honeypot, tokens canari) pour détection précoce du chiffrement ransomware, faux-positifs quasi nuls. Lentille défensive pure qui nourrit le raisonnement de `mas-sec-reviewer` sur le tampering de fichiers et renforce la protection du dossier `data/` (§8). Recadré : aucun montant $ (le scénario source « 2.3M$ évités » devient « 95 % des partages protégés / minutes d'alerte gagnées »).
- **dedup**: non — aucun skill MAOS n'outille la détection-par-déception ; complémentaire à `mas-sec-reviewer` (qui *décide* sur catégories §5) sans le dupliquer.
- **chemin library**: `packages/skills/library/implementing-honeypot-for-ransomware-detection/SKILL.md`
- **KILL examinés**: PAYG/clé API → aucun. Code exécuté sans sec-review → non, statut `library` (savoir, pas runtime). Touche secrets/déploiement → non. Offensif/arme → non (blue-team). Hors-phase → non (Phase D cybersec en cours).
- **§5/§11**: les actions de containment du body source (isolation hôte, quarantine NAC, EDR isolate) sont **illustratives** ; explicitées comme actions risquées §5 gated dans le keeper (Principle 4, Red Flags, Verification). 0 chiffre cash.
- **état**: keeper boosté §12 conforme (ligne 1 `---`, commentaire source, summary L1, metadata complet `frameworks` préservés, Prompt Defense Baseline verbatim, 7 sections §12, 0 `@anthropic-ai/sdk`, 0 secret réel).
- **re-audit**: si le repo source >6 mois sans maj, ou si un agent MAOS propose un jour d'automatiser le containment (alors → ADR + déclaration catégorie risquée dans `config/permissions.json`).

## implementing-immutable-backup-with-restic
- **décision**: adapt
- **raison**: doctrine sauvegarde immuable (restic + Object Lock Compliance, vérif `check --read-data`, restore-test) — la pièce maîtresse anti-ransomware qui cartographie DIRECTEMENT sur la protection du dossier `data/` (§8, état MAOS). Recadré : chiffres = RPO/RTO (temps) + quota, jamais $ ; rétention > dwell-time.
- **dedup**: non — aucune doctrine de sauvegarde WORM existante dans nos assets ; complète §8 (« data/ est l'état » mais ne dit pas *comment* le rendre tamper-proof).
- **chemin library**: `packages/skills/library/implementing-immutable-backup-with-restic/SKILL.md`
- **KILL examinés**: PAYG → aucun. Code exécuté sans sec-review → non (`library`, savoir). Secrets/déploiement → non (credentials de repo nommés comme à isoler, pas embarqués). Offensif → non. Hors-phase → non.
- **§5/§11**: opérations destructrices de repo/bucket = §5 gated (explicité). `frameworks` enrichis (nist_ai_rmf + atlas_techniques présents dans la source, préservés). 0 chiffre cash.
- **état**: keeper boosté §12 conforme (ligne 1 `---`, commentaire source, summary L1, metadata `frameworks` complet, Prompt Defense Baseline verbatim, 7 sections §12, 0 sdk, 0 secret).
- **re-audit**: repo source >6 mois, ou évolution de restic/Object Lock invalidant la doctrine Compliance.

## implementing-ransomware-backup-strategy
- **décision**: adapt
- **raison**: doctrine architecturale 3-2-1-1-0 + isolation des credentials de sauvegarde (le contrôle décisif souvent oublié) + tiers RPO/RTO + restore-test stack complet. Couvre le *comment* de la résilience de `data/` au-dessus du keeper restic (qui est l'implémentation d'un copy). Recadré : objectifs en temps RPO/RTO + quota, jamais $ (scénario bancaire « 500 serveurs / 7 ans » gardé comme illustration, montants neutralisés).
- **dedup**: léger chevauchement conceptuel avec `implementing-immutable-backup-with-restic` (le `+1`), MAIS niveau distinct : ce skill = architecture multi-copies + isolation identité + tiering ; restic = un seul copy immuable. Complémentaires, pas doublons.
- **chemin library**: `packages/skills/library/implementing-ransomware-backup-strategy/SKILL.md`
- **KILL examinés**: PAYG → aucun. Code sans sec-review → non (`library`). Secrets → non (credentials nommés comme à isoler). Offensif → non. Hors-phase → non.
- **§5/§11**: commandes destructrices d'infra backup (chattr +i, mkfs, immutability lock irréversible) = §5 gated, explicité. `frameworks` complet (nist_ai_rmf 5 items + atlas + mitre). 0 cash.
- **état**: keeper boosté §12 conforme (8 blocs : Prompt Defense Baseline verbatim + 7 §12 ; metadata `frameworks` préservés ; 0 sdk ; 0 secret).
- **re-audit**: repo source >6 mois, ou changement majeur des TTP ransomware ciblant les backups.

## implementing-ransomware-kill-switch-detection
- **décision**: adapt
- **raison**: **point de vigilance traité** — le titre « kill switch » + « exploits » du frontmatter source pourrait évoquer l'offensif, mais le contenu est STRICTEMENT défensif : vaccination par mutex (pré-créer un mutex connu → le sample s'auto-termine), monitoring DNS des domaines kill-switch, énumération de mutants en IR. Aucune fabrication/diffusion de malware. Reframé explicitement « vaccinate, don't arm » + analyse de samples vivants en sandbox isolée uniquement.
- **dedup**: non — détection comportementale spécifique (mutex/DNS) absente de nos assets ; nourrit `mas-sec-reviewer`.
- **chemin library**: `packages/skills/library/implementing-ransomware-kill-switch-detection/SKILL.md`
- **KILL examinés**: **Offensif/arme → NON** (vérif ligne par ligne : vaccination = immunisation défensive, pas weaponization ; pas de ciblage de masse ni d'évasion offensive). PAYG → aucun. Code sans sec-review → non (`library`, savoir ; l'analyse de sample vivant est explicitement sandbox-only). Secrets → non. Hors-phase → non.
- **§5/§11**: analyse dynamique = sandbox isolée obligatoire (Red Flag). 0 cash. `frameworks` préservés (nist_csf + mitre_attack).
- **état**: keeper boosté §12 conforme (Prompt Defense Baseline verbatim + 7 §12 ; reframing défensif explicite dans Overview/Principles/Red Flags ; 0 sdk ; 0 secret).
- **re-audit**: repo source >6 mois ; ou si une révision future du body penchait vers l'offensif (alors re-KILL).

## performing-ransomware-tabletop-exercise
- **décision**: adapt
- **raison**: doctrine de tabletop (TTX) — exercice de préparation testant procédures/décisions/communication (déclaration d'incident, décision de paiement + check sanctions, notification, ordre de recovery), scénario multi-phase avec injects, scoring NIST CSF, AAR avec actions ownées. Pur process défensif. Recadré : impacts en temps/scope, jamais $ (« ransom 2M$ », « 3.5M$ » = variables de scénario neutralisées).
- **dedup**: non — aucun skill de préparation/exercice IR dans nos assets ; complète la posture readiness.
- **chemin library**: `packages/skills/library/performing-ransomware-tabletop-exercise/SKILL.md`
- **KILL examinés**: PAYG → aucun. Code → aucun (skill 100 % discussion/process, zéro exécution). Secrets/déploiement → non. Offensif → non. Hors-phase → non.
- **§5/§11**: aucune action exécutable → §5 sans objet ; 0 chiffre cash. `frameworks` préservés.
- **état**: keeper boosté §12 conforme (Prompt Defense Baseline verbatim + 7 §12 ; 0 sdk ; 0 secret).
- **re-audit**: repo source >6 mois, ou évolution majeure des cadres réglementaires/TTP.

## recovering-from-ransomware-attack
- **décision**: adapt
- **raison**: runbook de recovery NIST/CISA — recovery seulement APRÈS containment+forensics, identité d'abord (krbtgt reset ×2 = défaite Golden Ticket), backup pré-compromis vérifié+scanné, restore par dépendances, chasse à la persistance par hôte, reconnexion réseau par phases. Doctrine défensive de restauration de `data/` (§8). Recadré : RPO/RTO en temps, jamais $ (« 500K$/jour » neutralisé).
- **dedup**: non — runbook IR-recovery absent de nos assets ; jumeau opérationnel du keeper backup-strategy (préparation) côté exécution-recovery.
- **chemin library**: `packages/skills/library/recovering-from-ransomware-attack/SKILL.md`
- **KILL examinés**: PAYG → aucun. Code sans sec-review → non (`library`). Secrets → non (mots de passe du body = placeholders d'illustration `NewKrbtgt2026!...`, pas de vrai secret). Offensif → non. Hors-phase → non.
- **§5/§11**: étapes destructrices (reset krbtgt, isolation hôte, restore écrasant) = §5 gated, explicité (Principle 6, Red Flags, Verification). 0 cash. `frameworks` préservés.
- **état**: keeper boosté §12 conforme (Prompt Defense Baseline verbatim + 7 §12 ; 0 sdk ; 0 secret réel).
- **re-audit**: repo source >6 mois, ou évolution des techniques de persistance/recovery AD.

---

## Bilan lot EH
- **keepers: 6 / 6** (tous `adapt`). 0 reject, 0 backlog, 0 watch.
- **chemins library**: `packages/skills/library/{implementing-honeypot-for-ransomware-detection, implementing-immutable-backup-with-restic, implementing-ransomware-backup-strategy, implementing-ransomware-kill-switch-detection, performing-ransomware-tabletop-exercise, recovering-from-ransomware-attack}/SKILL.md`
- **sanitize**: 6/6 SKILL.md clean (0 secret réel, 0 PII, 0 import `@anthropic-ai/sdk`). Script auxiliaire honeypot non porté.
- **transverse**: tout chiffre $ reframé en quota/temps RPO-RTO (§11) ; actions destructrices marquées §5 gated ; doctrine alignée sur la protection du dossier `data/` (§8) ; `frameworks` préservés sur les 6.
- **conformité exemplar**: ligne 1 `---`, frontmatter name/description/summary(L1)/metadata{origin/license/cluster/tier/status/frameworks}, commentaire `<!-- pattern from ... -->`, Prompt Defense Baseline verbatim, puis 7 sections §12 (Overview/When/Principles citant source/Process/Rationalizations/Red Flags/Verification) — identique au shard exemplar `skill-core-token-T1` + `agentic-engineering`.

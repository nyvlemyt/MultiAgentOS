# ECC Harvest — décisions cluster `cyber:incident-response` (lot DU)

Doer: lot DU (8 skills). Worktree `maos-ecc`. Méthode: intake-audit barre LARGE (T1, library).
Source cyber: `mukul975/Anthropic-Cybersecurity-Skills` (Apache-2.0). Cible: `packages/skills/library/<slug>/SKILL.md`.
Dedup contre `our-assets-index.md` + recoupe `mas-sec-reviewer` / CLAUDE.md §5 (gating cross-projet, actions
destructrices toujours gated) et §11 (discipline credentials/secrets, abonnement = jamais de chiffre cash).
Nature du lot: skills **100% DÉFENSIFS** (blue-team IR — containment, forensic disque, insider threat,
réponse + recovery ransomware, triage, validation de backups). Aucune capacité offensive/weaponization/évasion
dans les 8 sources → aucun KILL §5 déclenché.
Le frontmatter source porte `subdomain: incident-response` + `frameworks` NIST-CSF (RS.MA-01/02, RS.AN-03, RC.RP-01)
+ MITRE-ATTACK (T1486/T1490/T1070/T1078, extras par skill : T1021/T1005/T1048/T1489) : mappings préservés dans la metadata MAS.
Garde-fou défensif appliqué à chaque skill : lentille analyse/investigation/validation gardée ; toute action
exécutante (containment réel, isolation réseau, révocation de credentials, restore, rotation) est traitée comme
`risk: high` §5 — gate humain, sandbox du projet actif, jamais d'écriture hors-scope ni contre un système tiers
depuis MAOS. L'imaging forensic et le restore-test sont read-from-target / write-to-`data/` (§8).
Sanitize: 0 secret réel, 0 PII (noms/emails/cases = placeholders type `INC-2025-XXXX`, `jsmith@corp.example.com`),
0 `@anthropic-ai/sdk` dans les 8 sources (les `agent.py`/`agentwallet` ne sont PAS des imports SDK — scripts locaux
génériques). Recadrage transverse §11 : les montants de rançon/coût en `$` des sources sont reframés — la doctrine
de décision reste (sauvegardes vs paiement, OFAC), mais aucun chiffre cash MAOS ; tuning interne = quota d'abonnement.

Note dedup intra-lot (signalée par la tâche) : `triaging-security-incident` vs `triaging-security-incident-with-ir-playbook`.
Examinés : delta réel → **aucun fold**. Le générique = doctrine méthodologique (NIST SP 800-61r3 + SANS PICERL,
matrice d'impact criticité×menace, taxonomie de catégories, enrichissement TI). Le `-with-ir-playbook` = exécution
pilotée par bibliothèque de playbooks (lookup `trigger_conditions.yaml`, scoring de sévérité 0-16, sélection+lancement
de playbook par type, assignation on-call/escalation outillée). Méthodologie vs orchestration outillée → distincts.

---

## performing-cloud-incident-containment-procedures
- **décision**: adapt
- **raison**: containment **cloud-native** AWS/Azure/GCP — isolation de ressources compromises (IAM principal, EC2/VM, S3/storage, Lambda/function), révocation credentials+sessions (token-issue-time deny, refresh-token revoke), invariant cardinal **snapshot AVANT isolation**, deny-all in+out (les SG cloud autorisent l'egress par défaut), préservation logs en stockage write-protected (Object-Lock/immutable) + hash chain-of-custody. Nourrit `mas-sec-reviewer` + §5.
- **dedup**: non — angle cloud-native (controls plateforme, shared-responsibility, infra éphémère) absent de notre surface ; distinct du triage (classification) et du ransomware-response (chiffrement). Complète §5 sans recouvrir.
- **garde-fou défensif (§5)**: produire le plan de containment = bénin ; **exécuter** revoke/isolate/disable/`reserved-concurrency 0` = `risk: high` → gate humain, sandbox du projet actif uniquement, jamais contre un tenant tiers (énumérer un tenant non possédé = recon hors-scope, Red Flag). Snapshots+logs → `data/` (§8).
- **chemin library**: `packages/skills/library/performing-cloud-incident-containment-procedures/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` NIST-CSF/MITRE-ATTACK (+T1530/T1537/T1578/T1552) + d3fend préservés + Prompt Defense Baseline ; 7 sections §12 défensives ; exemples aws/az/gcloud = templates, 0 secret réel, 0 sdk, 0 cash).

## performing-disk-forensics-investigation
- **décision**: adapt
- **raison**: forensic disque **legal-grade** — imaging write-blocké (E01/dcfldd, `source-hash == image-hash`), analyse FS (MFT/inode, deleted, file carving, NTFS ADS), reconstruction de timeline (Autopsy / Sleuth Kit `fls`+`mactime`), recovery+parsing d'artefacts (prefetch/PECmd, EvtxECmd, registre/RegRipper, browser/Hindsight, USBSTOR, `$MFT`/MFTECmd), rapport facts-vs-interprétation reproductible. Règle cardinale: jamais de media evidence sans write blocker, hash SHA-256 partout. Nourrit `mas-sec-reviewer` + §5.
- **dedup**: non — forensic disque persistant, distinct du containment (live), du triage (classification) et de l'insider-threat (qui *consomme* cette capacité). Angle imaging/chain-of-custody/carving propre.
- **garde-fou défensif (§5/§8)**: carving+parsing = read-only ; le **source tree externe est read-only** (image FROM target, jamais write TO) — artefacts (image/timeline/rapport) écrits dans `data/` (§8) ; toute écriture hors sandbox ou mutation de la source = `risk: high` → gate humain.
- **chemin library**: `packages/skills/library/performing-disk-forensics-investigation/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` NIST-CSF/MITRE-ATTACK (+T1005) préservé + Prompt Defense Baseline ; 7 sections §12 défensives ; exemples dcfldd/fls/mactime = templates, placeholders `INC-2025-XXXX`, 0 secret réel, 0 sdk, 0 cash).

## performing-insider-threat-investigation
- **décision**: adapt
- **raison**: investigation insider (employé/contractant à accès **autorisé**) — DFIR + UBA + coordination HR/légal. Lifecycle: valider l'allégation + **autorisation légale AVANT toute surveillance** → collecte covert (DLP/cloud/email/VPN/badge/print/USB ; UAM+endpoint forensic seulement si légalement approuvé) → baseline vs anomalie (anomaly score) → timeline → impact (data/régulatoire/contractuel) → préservation legal-admissible (chain of custody, hash, legal hold). Règles cardinales: jamais seul (sécu+légal+HR), jamais alerter le sujet avant préservation. Nourrit `mas-sec-reviewer` + §5.
- **dedup**: non — angle insider-spécifique (privacy employé, HR/legal gating, UBA baseline) absent ; *consomme* `performing-disk-forensics-investigation` mais ajoute la couche procédurale/comportementale propre. Distinct du containment et du triage.
- **garde-fou défensif (§5/§8)**: construire le dossier = bénin ; **exécuter** revoke/disable/termination contre l'accès du sujet = `risk: high` → gate humain, coordonné légal+HR, sandbox projet actif, jamais contre un système tiers. Dossier restreint stocké en `data/` access-controlled (§8), pas dans le source tree.
- **chemin library**: `packages/skills/library/performing-insider-threat-investigation/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` NIST-CSF/MITRE-ATTACK (+T1048) préservé + Prompt Defense Baseline ; 7 sections §12 défensives ; sujet/emails = placeholders (`jsmith@corp.example.com`, `[Name Redacted]`), 0 PII réelle, 0 secret, 0 sdk, 0 cash).

## performing-ransomware-response
- **décision**: adapt (recadrage §11 : montants de rançon `$` reframés)
- **raison**: IR ransomware structurée detection→hardening — identification variant (note/extension, ID-Ransomware, NoMoreRansom), containment rapide (déco segments, isolation DC sur déploiement GPO, block SMB/RDP/WinRM, garder un host chiffré allumé pour la mémoire), assessment scope+intégrité backups+exfil+OFAC, matrice de décision recovery, recovery clean (rebuild DC media propre, reset ALL passwords, restore priorisé, reimage), hardening (MFA, 3-2-1-1-0, segmentation, LAPS). Règles cardinales: ne PAS éteindre (clés en mémoire), ne PAS restaurer un backup dans la fenêtre de dwell-time. Nourrit `mas-sec-reviewer` + §5.
- **dedup**: non — ransomware-spécifique (encryption/double-extortion/decision-matrix). Distinct du containment cloud (générique), du recovery-testing (`testing-ransomware-recovery-procedures` = test à froid) et du backup-validation (sous-étape). Voir note: lui *exécute* la réponse à chaud.
- **garde-fou défensif (§5/§11)**: containment+recovery = `risk: high` → gate humain, sandbox projet actif ; la branche **paiement de rançon = `risk: blocking`** (§5 paiement sortant) → toujours pausé, jamais automatisé, JAMAIS codé dans MAOS. Recadrage §11: la doctrine de décision (sauvegardes vs decryptor vs paiement, OFAC) est gardée, mais 0 chiffre cash MAOS (montants source `$2.5M` etc. reframés en doctrine, pas en valeur).
- **chemin library**: `packages/skills/library/performing-ransomware-response/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` NIST-CSF/MITRE-ATTACK (+T1489) préservé + Prompt Defense Baseline ; 7 sections §12 défensives ; placeholders `INC-2025-XXXX`, 0 secret, 0 sdk, 0 cash — montants rançon reframés §11).

## testing-ransomware-recovery-procedures
- **décision**: adapt
- **raison**: validation **à froid** des plans de recovery ransomware — scope tiered RTO/RPO (Tier1 <1h/<15min … Tier4 <72h/<24h), environnement isolé sans route vers prod, restore + mesure full-timeline (Actual RTO=T4-T0, Actual RPO=T0-backup_timestamp), validation intégrité post-restore (file counts, DB consistency, SHA-256), re-hardening sécurité (rotation creds, MFA, EDR, patches), rapport gap MEETS/FAILS. Règles cardinales: inclure le WRT (restore-complete ≠ recovery-complete), jamais sur le réseau prod, recovery sequencing (DB avant app), backups immutables obligatoires. Nourrit `mas-sec-reviewer` + §5/RC.RP.
- **dedup**: non — c'est le **drill proactif/à froid** ; distinct de `performing-ransomware-response` (réponse à chaud) et de `validating-backup-integrity-for-recovery` (lui valide le backup unitaire ; ici on valide le *processus* de restore + RTO/RPO). Delta = mesure de processus, pas vérif de fichier.
- **garde-fou défensif (§5/§8)**: drill **planifié low-risk** quand isolé hors-prod ; toute exécution réelle de restore reste in-sandbox, artefacts du test → `data/` (§8). Le risque (Red Flag) = une route vers prod ou un test sur prod → traité comme isolation §5 à respecter.
- **chemin library**: `packages/skills/library/testing-ransomware-recovery-procedures/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` NIST-CSF/MITRE-ATTACK (+T1489) préservé + Prompt Defense Baseline ; 7 sections §12 défensives ; exemples restic/pg_isready = templates, 0 secret réel, 0 sdk, 0 cash).

## triaging-security-incident
- **décision**: adapt
- **raison**: triage **méthodologique** d'un incident — doctrine vendor-neutral NIST SP 800-61r3 + SANS PICERL : collecte de contexte (source, dwell-time, assets, fidélité, evidence) → classification par catégorie standard → sévérité P1-P4 via matrice d'impact f(criticité×menace×sensibilité données×lateral-movement) + SLA → enrichissement (TI/IOC, CMDB, identité, corrélation historique) → triage record structuré + routing tier → containment hold P1/P2. Focus = classification/priorisation, pas l'investigation profonde. Nourrit `mas-sec-reviewer` + §5.
- **dedup intra-lot RÉSOLUE → aucun fold**: distinct de `triaging-security-incident-with-ir-playbook`. Ici = **doctrine méthodologique** (matrice d'impact conceptuelle, taxonomie NIST, enrichissement TI). Là-bas = **orchestration outillée** (lookup `trigger_conditions.yaml`, scoring sévérité 0-16, sélection+lancement de playbook, paging on-call/PagerDuty). Méthodologie vs mécanique outillée = delta process réel.
- **garde-fou défensif (§4/§5)**: triage = **read+propose** (manual-safe §4) ; les actions de containment recommandées (isolate/disable/block) = `risk: high` → gate humain, sandbox projet actif, jamais auto-exécutées par le triage.
- **chemin library**: `packages/skills/library/triaging-security-incident/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` NIST-CSF/MITRE-ATTACK + d3fend préservés + Prompt Defense Baseline ; 7 sections §12 défensives ; placeholders `INC-2025-XXXX`/`jsmith@corp.example.com`, 0 secret, 0 sdk, 0 cash).

## triaging-security-incident-with-ir-playbook
- **décision**: adapt
- **raison**: triage **orchestré par bibliothèque de playbooks** — acknowledge alerte (SIEM/TheHive, anti-double-triage) → enrichissement IOC outillé (VirusTotal/AbuseIPDB + CMDB) → classification par match `trigger_conditions.yaml` + technique MITRE → scoring sévérité déterministe 0-16 (criticité+sensibilité+scope+threat-status → P1-P4) → sélection+lancement du playbook + création de case → assignation équipe via on-call (paging par sévérité) → doc + handoff. Nourrit `mas-sec-reviewer` + §5.
- **dedup intra-lot RÉSOLUE → aucun fold**: distinct de `triaging-security-incident` (cf. note). Ici = **mécanique outillée** (lookup playbook, score 0-16 reproductible, lancement de playbook, paging PagerDuty). Là-bas = **doctrine méthodologique** (matrice conceptuelle, taxonomie NIST). Delta process réel → gardés distincts.
- **garde-fou défensif (§5/§11)**: les appels d'enrichissement réseau (VT/AbuseIPDB) obéissent à §5 `allowed_hosts` ; les tokens API (`$VT_API_KEY` etc. = noms d'env illustratifs) vivent en config env, **jamais committés** (§11) ; les étapes de containment du playbook = `risk: high` → gate humain, sandbox projet actif ; case state → `data/` (§8).
- **chemin library**: `packages/skills/library/triaging-security-incident-with-ir-playbook/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` NIST-CSF/MITRE-ATTACK préservé + Prompt Defense Baseline ; 7 sections §12 défensives ; tokens = placeholders `$VT_API_KEY`/`$THEHIVE_API_KEY` (noms d'env, pas de valeur réelle), 0 secret réel, 0 sdk, 0 cash).

## validating-backup-integrity-for-recovery
- **décision**: adapt
- **raison**: validation **post-backup** de la recouvrabilité — baseline manifest SHA-256 → vérif intégrité archive (restic `check --read-data`, borg `--verify-data`, `gzip -t`, S3 checksum) → restore-test isolé + diff baseline/restored → complétude (file counts, size, DB objects) → **scan d'artefacts ransomware** dans le backup (extensions chiffrées, ransom-notes, entropie >7.9/8.0) → automation+scheduling (nightly verify, weekly full restore). Règles cardinales: jamais de restore non testé, intégrité *data* ≠ archive, vérifier la chaîne incrémentale, SHA-256 pas MD5, backups immutables. Nourrit `mas-sec-reviewer` + §5/RC.RP-03.
- **dedup intra-lot → aucun fold**: distinct de `testing-ransomware-recovery-procedures`. Ici = **vérif fichier/unitaire du backup** (manifest, hash, scan ransomware, chaîne incrémentale). Là-bas = **mesure du processus de restore + RTO/RPO**. C'est la précondition fichier que ransomware-response et recovery-testing consomment. Delta = grain de validation (artefact vs processus).
- **garde-fou défensif (§5/§8)**: validation = non-destructive ; restore-test **isolé hors-prod** (§5), artefacts → `data/` (§8). Aucune écriture sur la source ; le scan ransomware = read-only.
- **chemin library**: `packages/skills/library/validating-backup-integrity-for-recovery/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` NIST-CSF/MITRE-ATTACK (+T1489) préservé + Prompt Defense Baseline ; 7 sections §12 défensives ; `agent.py`/`/opt/backup-validator/agent.py` = scripts locaux génériques (PAS un import SDK), 0 secret réel, 0 sdk, 0 cash).

---

### Récap
- **8/8 keepers (tous `adapt`). 0 reject. 0 fold. 0 rename.** Lot 100% défensif (blue-team IR).
- **Note dedup intra-lot RÉSOLUE → aucun fold.** Les deux triages gardés distincts: `triaging-security-incident`
  = doctrine méthodologique (NIST SP 800-61r3 + SANS PICERL, matrice d'impact conceptuelle, taxonomie, enrichissement TI) ;
  `triaging-security-incident-with-ir-playbook` = orchestration outillée (lookup `trigger_conditions.yaml`, score
  sévérité 0-16, sélection+lancement de playbook, paging on-call/PagerDuty). Méthodologie vs mécanique outillée = delta réel.
  Trio recovery/backup également distinct par grain: `performing-ransomware-response` (réponse à chaud) vs
  `testing-ransomware-recovery-procedures` (drill à froid, mesure RTO/RPO) vs `validating-backup-integrity-for-recovery`
  (vérif fichier/unitaire du backup, précondition des deux autres).
- **Garde-fou défensif appliqué partout**: lentille analyse/investigation/validation gardée ; toute action exécutante
  (containment réel, isolation réseau, revoke de credentials, restore, rotation, revoke/disable/termination d'accès) =
  `risk: high` §5 → gate humain, sandbox du projet actif, jamais contre un système/tenant tiers. Le **paiement de rançon**
  (`performing-ransomware-response`) = `risk: blocking` §5 — jamais automatisé, jamais codé dans MAOS.
- **Recadrage §11 transverse**: les montants de rançon/coût `$` des sources (surtout ransomware-response) sont reframés —
  la doctrine de décision (backups vs decryptor vs paiement, OFAC) est gardée, mais 0 chiffre cash MAOS ; tuning interne
  = quota d'abonnement. Triage-with-playbook recadré: tokens API en env, jamais committés (§11) ; appels d'enrichissement
  réseau via §5 `allowed_hosts`.
- **§8 (source tree read-only)**: forensic/insider/restore-test imagent/lisent FROM la cible et écrivent leurs artefacts
  (image, timeline, dossier de cas, manifest, rapport) dans `data/`, jamais vers le source tree externe.
- **Frameworks préservés (metadata MAS imbriquée)**: NIST-CSF [RS.MA-01/02, RS.AN-03, RC.RP-01] + MITRE-ATTACK base
  [T1486/T1490/T1070/T1078] sur les 8 ; extras: +T1021/T1530/T1537/T1578/T1552 (cloud-containment), +T1005 (disk-forensics),
  +T1048 (insider), +T1489 (ransomware-response/recovery-testing/backup-validation) ; d3fend préservé sur
  cloud-containment + triage générique.
- **Garde-fous techniques**: 0 `@anthropic-ai/sdk` (les `agent.py`/`agentwallet` ne sont pas des imports SDK), 0 secret réel,
  0 PII réelle (cases/emails/serials/ARN = placeholders `INC-2025-XXXX`, `jsmith@corp.example.com`, `[Name Redacted]`),
  0 chiffre cash dans les 8 outputs.

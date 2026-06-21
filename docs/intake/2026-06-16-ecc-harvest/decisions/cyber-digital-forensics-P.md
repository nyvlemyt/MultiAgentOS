# ECC Harvest — décisions cluster `cyber:digital-forensics` (LOT P)

Doer : lot disque / système de fichiers / récupération / timeline (9 slugs source). Worktree `maos-ecc`, branche `phase/ecc-harvest`.
Source : `mukul975/Anthropic-Cybersecurity-Skills` (Apache-2.0), clone read-only dans `/tmp/cybersec-inspect/skills/<slug>/SKILL.md`.
Cible : `packages/skills/library/<slug>/SKILL.md`. Tier **T2** (bibliothèque, vertical forensic), `status: library`, cluster `cyber:digital-forensics`.

## Garde-fou forensic (rappel)
DFIR/forensics = défensif/investigatif → **KEEP** sauf doublon (→ fold). Cadrage transverse appliqué à chaque garde :
investigation autorisée, chaîne de custody, **read-only sur l'image/évidence**, données récupérées (fichiers supprimés, PII, communications) **jamais divulguées ni exfiltrées** (§5). Aucun CORE anti-forensic / destruction-de-preuve trouvé → 0 reject, conforme à l'attendu.
Recadrage §11 : aucun coût en $/€ ; effort en unités de quota d'abonnement. Aucune mention paiement.
Sanitize : 9/9 sources clean (pas de secrets/PII réelle/internal, pas de `@anthropic-ai/sdk`).
Exemplar §12 respecté : ligne 1 `---`, frontmatter (name/description Use+Do NOT/summary L1/metadata avec frameworks NIST 800-86 + MITRE ATT&CK préservés), commentaire `pattern from`, bloc `## Prompt Defense Baseline` recopié VERBATIM, puis 7 sections (Overview / When to Use / Principles citant la source / Process / Rationalizations / Red Flags / Verification Criteria).

---

## acquiring-disk-image-with-dd-and-dcfldd
- **décision** : keep (adapt léger)
- **raison** : acquisition forensic bit-à-bit (dd/dcfldd/dc3dd/ddrescue) avec write-blocking et vérification de hash avant/après — phase « collection » NIST 800-86, brique fondatrice de tout le lot. Défensif par construction (préserver l'évidence). Recadré : la source est read-only ; toute commande destructive (`rm`, format, écriture hors sandbox projet) est §5-gated et human-approved.
- **dedup** : distinct de `analyzing-disk-image-with-autopsy` (acquisition vs analyse), confirmé par la consigne. Pas de doublon.
- **chemin library** : `packages/skills/library/acquiring-disk-image-with-dd-and-dcfldd/SKILL.md`
- **état** : écrit conforme. KILL testé : aucun (pas anti-forensic, pas paiement, pas SDK). Re-audit : si NIST 800-86 révisé ou si la chaîne d'acquisition devient un agent exécutant (alors gating §5 renforcé).

## analyzing-disk-image-with-autopsy
- **décision** : keep (adapt léger)
- **raison** : analyse structurée d'une image déjà acquise (Autopsy + Sleuth Kit) — récupération de fichiers supprimés, modules d'ingestion, recherche par mots-clés, EXIF, timeline. Phase examination/analysis NIST 800-86. Read-only sur l'évidence ; PII récupérée (CB/SSN/keywords) cantonnée au dossier d'enquête.
- **dedup** : complémentaire de l'acquisition (dd/dcfldd) et de la timeline (Plaso) ; pas de chevauchement de technique.
- **chemin library** : `packages/skills/library/analyzing-disk-image-with-autopsy/SKILL.md`
- **état** : écrit conforme. KILL testé : aucun. Re-audit : si Autopsy/TSK change de modèle ou si la divulgation PII devient un risque produit.

## analyzing-mft-for-deleted-file-recovery
- **décision** : keep (distinct, cross-référencé)
- **raison** : récupération NTFS au niveau **enregistrement MFT** — $MFT (InUse=False), $UsnJrnl:$J (reason codes), $LogFile (transactions), slack MFT, corrélation $Recycle.Bin + Volume Shadow Copies, détection timestomping $SI-vs-$FN. Profondeur record/log que l'artefacts-skill n'atteint pas.
- **dedup** : chevauchement réel avec `analyzing-slack-space-and-file-system-artifacts` (parsing MFT/USN, timestomping communs). Tranché : **garder les deux**, pas fold. Ce skill = plongée record-level (header MFT 0x18 used_size, $LogFile DeallocateFileRecordSegment, $I/$R, VSS) ; l'autre = balayage volume-wide (slack carving + ADS). Chaque SKILL.md cite explicitement l'autre comme complément, pour éviter la redondance perçue. Justification du non-fold : techniques primaires distinctes (récupération d'enregistrement vs balayage de résidus volume) ; folder masquerait soit la profondeur log/VSS, soit l'ADS/slack-carving.
- **chemin library** : `packages/skills/library/analyzing-mft-for-deleted-file-recovery/SKILL.md`
- **état** : écrit conforme, cross-link posé. KILL testé : aucun. Re-audit : si une consolidation NTFS-forensics unique est décidée plus tard (alors fold des deux en un seul skill « ntfs-filesystem-forensics »).

## analyzing-slack-space-and-file-system-artifacts
- **décision** : keep (distinct, cross-référencé)
- **raison** : balayage NTFS **volume-wide** — extraction/recherche du slack (file/RAM), parsing MFT + USN, détection des Alternate Data Streams (Zone.Identifier inclus = provenance internet). Superset de surface, technique ADS + slack carving absente de l'autre skill.
- **dedup** : voir entrée MFT ci-dessus — chevauchement partiel assumé, **garder les deux**, cross-link réciproque dans les SKILL.md. Ce skill apporte l'ADS et le carving de slack (foremost/bulk_extractor sur slack.raw) que la version record-level n'a pas.
- **chemin library** : `packages/skills/library/analyzing-slack-space-and-file-system-artifacts/SKILL.md`
- **état** : écrit conforme, cross-link posé. KILL testé : aucun (la consigne « planter/cacher des données dans slack/ADS » est explicitement interdite dans Do NOT + Red Flags). Re-audit : idem MFT (fold conjoint éventuel).

## performing-file-carving-with-foremost
- **décision** : keep (distinct de PhotoRec)
- **raison** : carving par signature **header/footer** (Foremost, Scalpel) depuis image/espace non-alloué quand les métadonnées sont absentes. Extraction blkls de l'unallocated, puis validation/hash/catalogage. Forensic défensif.
- **dedup** : vs `recovering-deleted-files-with-photorec` — la consigne tranche : outils/moteurs distincts (foremost = header/footer vs photorec = moteur 300+ formats). Contenu non dupliqué (Foremost insiste signatures header/footer + Scalpel + custom.conf ; PhotoRec insiste Free/Whole + fileopt + recup_dir + NSRL). **Garder les deux**, chacun cite l'autre comme complément non-recouvrant.
- **chemin library** : `packages/skills/library/performing-file-carving-with-foremost/SKILL.md`
- **état** : écrit conforme. KILL testé : aucun. Re-audit : non sauf abandon upstream de Foremost.

## recovering-deleted-files-with-photorec
- **décision** : keep (distinct de Foremost)
- **raison** : récupération par carving de signatures, moteur 300+ formats, ignore totalement le système de fichiers (média corrompu/formaté/écrasé). Tri/validation/hash/filtrage NSRL. Note : la source porte aussi des champs `nist_ai_rmf` + `atlas_techniques` au frontmatter d'origine (artefact de tagging upstream) ; non pertinents ici, le skill reste du forensic disque pur — frameworks préservés au format demandé = NIST 800-86 + MITRE ATT&CK.
- **dedup** : voir Foremost — **garder les deux**, cross-link réciproque.
- **chemin library** : `packages/skills/library/recovering-deleted-files-with-photorec/SKILL.md`
- **état** : écrit conforme. KILL testé : aucun. Re-audit : non sauf abandon upstream de TestDisk/PhotoRec.

## performing-sqlite-database-forensics
- **décision** : keep (adapt — garde-fou PII renforcé)
- **raison** : forensic SQLite (freelist, WAL/journal, unallocated in-page, décodage timestamps Chrome/WebKit/Unix/Mac/Mozilla). Sources d'évidence = historique navigateur, messageries (WhatsApp/Signal/iMessage), mobile → contenu massivement personnel. Principe #1 ajouté : **travailler sur copies + sidecars `-wal`/`-journal`, read-only** (ouvrir la DB live peut déclencher un checkpoint et détruire les preuves WAL ; VACUUM = destruction de preuve, interdit).
- **dedup** : aucun — registre applicatif distinct du système de fichiers ; complémentaire de la timeline Plaso (qui agrège, lui plonge dans la DB).
- **chemin library** : `packages/skills/library/performing-sqlite-database-forensics/SKILL.md`
- **état** : écrit conforme. KILL testé : aucun anti-forensic ; risque PII traité par cadrage strict (case-scoped, no disclosure §5). Re-audit : si manipulation de communications personnelles devient une catégorie risquée déclarée dans `config/permissions.json`.

## performing-timeline-reconstruction-with-plaso
- **décision** : keep (adapt léger)
- **raison** : super-timeline (log2timeline/psort → .plaso → Timesketch) corrélant 100+ artefacts (winevtx, prefetch, mft, usnjrnl, lnk, registre, navigateurs). Phase analysis NIST 800-86. Recadré : scoper via `--parsers`/`--filter-file` (économie quota), pivoter sur timestamps connus, corroborer ≥2 sources, PII d'activité utilisateur case-scoped.
- **dedup** : agrège la sortie des skills par-artefact (MFT/SQLite/carving) en une chronologie — pas substitut, complément. Aucun doublon de technique.
- **chemin library** : `packages/skills/library/performing-timeline-reconstruction-with-plaso/SKILL.md`
- **état** : écrit conforme. KILL testé : aucun. Re-audit : non sauf changement majeur Plaso/Timesketch.

## performing-steganography-detection
- **décision** : keep (adapt — cadrage detection-only)
- **raison** : **stéganalyse = détection** (contrepartie défensive de la stéganographie), pour exfiltration/C2/insider-threat. Trailing-data après end marker, archives embarquées, binwalk/zsteg/stegoveritas, LSB + chi-square, tentatives steghide/stegseek. Cadrage dual-use traité de front : Do NOT + Red Flags interdisent explicitement l'**embedding** (hors scope), bornent le password-cracking à l'évidence légalement détenue, et cantonnent le contenu extrait (PII/covert) au dossier.
- **dedup** : aucun — registre média/covert-channel distinct du reste du lot.
- **chemin library** : `packages/skills/library/performing-steganography-detection/SKILL.md`
- **état** : écrit conforme. KILL testé : le seul candidat plausible (dual-use → contenu offensif) écarté car CORE = détection investigative ; embedding explicitement banni. Re-audit : si un usage offensif (embedding) était un jour réclamé, ce serait un nouveau skill à auditer séparément, pas une extension de celui-ci.

---

## Bilan lot P
- **9/9 KEEP**, 0 reject, 0 fold. Conforme au garde-fou forensic (aucun CORE anti-forensic).
- 2 paires de chevauchement traitées par **cross-link** plutôt que fold (MFT↔slack-artifacts ; foremost↔photorec), justification non-fold documentée + condition de fold futur enregistrée.
- Aucune édition `ledger.tsv`, aucun git add/commit/push (réservé à l'orchestrateur). Artefacts produits : 9 dossiers `packages/skills/library/<slug>/` + ce shard.

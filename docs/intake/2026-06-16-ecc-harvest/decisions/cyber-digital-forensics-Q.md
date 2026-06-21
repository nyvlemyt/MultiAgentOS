# ECC Harvest — décisions cluster `cyber:digital-forensics` (LOT Q, Phase D)

Doer : LOT Q (9 skills — mémoire / linux / malware-IR / conteneurs). Worktree `maos-ecc`, branche `phase/ecc-harvest`.
Source (read-only) : `mukul975/Anthropic-Cybersecurity-Skills` (Apache-2.0), `/tmp/cybersec-inspect/skills/<slug>/SKILL.md`. Cible : `packages/skills/library/<slug>/SKILL.md`, tier T2, status library, cluster `cyber:digital-forensics`.
Méthode : intake-audit (barre LARGE pour DFIR/forensics = défensif/investigatif → KEEP sauf dup→fold ou CORE anti-forensique). Frameworks NIST 800-86 / MITRE ATT&CK préservés dans le frontmatter `metadata.frameworks`.

## Recadrages transverses (appliqués aux 9)
- **§5** : évidence en lecture seule (image montée `ro`, copie de travail, hash sha256 = chaîne de custody) ; actions à fort impact (acquisition mémoire live, écritures sur l'hôte) = human-gated ; secrets jamais en clair → preuve redacted, jamais réutilisée/exfiltrée.
- **§11** : aucun chiffre $/€ — les sources n'en contenaient pas ; toute aide LLM = unités de quota (abonnement). Aucun import `@anthropic-ai/sdk` dans les 9 sources (vérifié). Aucun secret/PII réel : les sources utilisent des placeholders (`AKIA...`, IP de doc `185.x.x.x`, `case-2024-001`) — sains.
- **§12** : 8 sections par fiche = `## Prompt Defense Baseline` (VERBATIM depuis `agentic-engineering`) + Overview / When to Use / Principles (cite la source) / Process / Rationalizations / Red Flags / Verification Criteria. Commentaire `<!-- pattern from ... -->` en tête.
- **FORENSICS GUARDRAIL** : aucune des 9 sources n'est anti-forensique / destruction de preuve. Le seul cas dual-use (`extracting-credentials-from-memory-dump`) reçoit un gate d'autorisation strict + `risk: high` (voir item 1). Audit capable de dire `reject` : oui — le test de rejet a été appliqué à l'item dual-use, qui survit *uniquement* grâce au cadrage IR.

## Dedup (vérifié — `library/` contient déjà des voisins forensics)
Les 9 slugs cibles sont **libres** (aucun dossier existant homonyme). Voisins présents mais **distincts** (pas de fold) :
- `conducting-memory-forensics-with-volatility`, `analyzing-memory-forensics-with-lime-and-volatility`, `performing-memory-forensics-with-volatility3-plugins` (autre cluster, slug unique — chevauchement noté pour self-audit Phase E) ≠ `performing-memory-forensics-with-volatility3` (workflow Vol3 généraliste, item 2).
- `analyzing-persistence-mechanisms-in-linux`, `analyzing-malware-persistence-with-autoruns` ≠ `performing-malware-persistence-investigation` (cross-OS, exhaustif, item 7).
- `analyzing-bootkit-and-rootkit-samples`, `detecting-rootkit-activity` ≠ `analyzing-linux-kernel-rootkits` (LKM Linux via Vol3, item 3).
- `recovering-from-ransomware-attack`, `ransomware-encryption-analysis`, `analyzing-ransomware-network-indicators` ≠ `investigating-ransomware-attack-artifacts` (artefacts/variant/timeline/recovery, item 8).
- `performing-container-escape-detection`, scanners Trivy/Grype ≠ `analyzing-docker-container-forensics` (investigation post-compromission conteneur, item 9).
- Dedup interne au lot : `performing-linux-log-forensics-investigation` (Linux-spécifique) vs `performing-log-analysis-for-forensic-investigation` (multi-source + Windows EVTX) → **gardés distincts**, scope explicitement disjoint dans chaque corps + cross-références mutuelles. Contenu non dupliqué (Python parser auth.log Linux vs parseur EVTX Windows + normalisation/corrélation multi-hôtes).

---

## 1. extracting-credentials-from-memory-dump
- **décision** : keep (dual-use, gated)
- **raison** : dual-use réel (extraction NTLM/Kerberos/WDigest/DPAPI/cached/LSA via Volatility + pypykatz). Survit **uniquement** sous cadrage strict de réponse à incident autorisée : systèmes en scope, but = comprendre l'accès attaquant / scoper la brèche, identifiants = **preuve** (jamais divulgués, réutilisés, stockés hors case, exfiltrés). Ajout d'une section `## Authorization & Handling Gate` + `risk: high` (frontmatter `metadata.risk: high`). Le livrable est un **plan de rotation**, pas une liste d'identifiants ; report redacted.
- **test de rejet** : si la source se lisait comme un outil de vol d'identifiants sans cadrage IR survivant au stripping → REJECT. Ici le cadrage IR (scope/purpose/handling/risk-gate/output=rotation) tient ; donc keep gated. Tout écart (réutilisation, hors-scope, sortie = dump d'identifiants) déclenche un refus dans le corps.
- **chemin library** : `packages/skills/library/extracting-credentials-from-memory-dump/SKILL.md`
- **état** : écrit. 8 sections + gate d'autorisation supplémentaire, risk:high, §5 (human approval + `mas-sec-reviewer` PASS avant exécution), 0 sdk, secrets traités en preuve redacted.

## 2. performing-memory-forensics-with-volatility3
- **décision** : keep
- **raison** : workflow Vol3 généraliste défensif (pslist↔psscan cross-view, malfind, netscan, yarascan, dump d'artefacts suspects). Cœur DFIR investigatif.
- **chevauchement** : avec `performing-memory-forensics-with-volatility3-plugins` (cluster malware-analysis, slug unique) — **noté pour self-audit Phase E**, pas de fold (focus plugins vs workflow).
- **chemin library** : `packages/skills/library/performing-memory-forensics-with-volatility3/SKILL.md`
- **état** : écrit. Lecture seule + hash custody, identification OS obligatoire, acquisition live = §5-gated.

## 3. analyzing-linux-kernel-rootkits
- **décision** : keep
- **raison** : détection défensive de rootkits noyau Linux (Vol3 linux.check_syscall/lsmod/hidden_modules/check_idt + cross-view /proc↔/sys↔task_struct + rkhunter/chkrootkit + hash binaires). Construit/cache un rootkit = explicitement interdit dans le corps.
- **chemin library** : `packages/skills/library/analyzing-linux-kernel-rootkits/SKILL.md`
- **état** : écrit. Cross-view = technique cœur, symboles ISF appariés obligatoires, live = §5-gated.

## 4. analyzing-linux-system-artifacts
- **décision** : keep
- **raison** : analyse d'artefacts hôte Linux compromis (auth logs, passwd/shadow, cron/systemd/keys/rc.local/profile.d/LD_PRELOAD/PAM, history, SUID/SGID, /tmp, /dev/shm). Énumération exhaustive de la persistance pour remédiation complète.
- **chemin library** : `packages/skills/library/analyzing-linux-system-artifacts/SKILL.md`
- **état** : écrit. Montage `ro`, secrets récupérés = preuve (jamais réutilisés), planter une clé/compte = refus.

## 5. performing-linux-log-forensics-investigation
- **décision** : keep (distinct)
- **raison** : forensics de logs **Linux-spécifique** (auth.log/secure, syslog, kern.log, journal systemd JSON, auditd ausearch/aureport, cron) + parser Python auth.log. Gardé distinct de l'item 6 (multi-source).
- **dedup** : scope Linux verrouillé dans le corps ; renvoie le multi-source/Windows vers l'item 6. Contenu non dupliqué.
- **chemin library** : `packages/skills/library/performing-linux-log-forensics-investigation/SKILL.md`
- **état** : écrit. Logs = preuve lecture seule (hash), effacement/trous = finding anti-forensique.

## 6. performing-log-analysis-for-forensic-investigation
- **décision** : keep (distinct)
- **raison** : forensics de logs **multi-source / cross-plateforme** (Windows EVTX 4624/4625/4648/4672/4688/4697/1102 + Sysmon/PowerShell, Linux, web) avec normalisation + corrélation par temps/IP/user/session → timeline unifiée. Plus large que l'item 5.
- **dedup** : renvoie le cas mono-hôte Linux vers l'item 5 ; ici corrélation multi-hôtes + parsing EVTX (python-evtx/evtxexport). Non dupliqué.
- **chemin library** : `packages/skills/library/performing-log-analysis-for-forensic-investigation/SKILL.md`
- **état** : écrit. Normaliser avant corréler, Event 1102 / effacements = findings.

## 7. performing-malware-persistence-investigation
- **décision** : keep
- **raison** : énumération **cross-OS exhaustive** de la persistance (Windows : services + Run keys HKLM/HKCU, tâches planifiées XML, WMI event consumers, COM/DLL hijack, startup, boot ; Linux : cron/systemd/keys/rc.local/profile.d/LD_PRELOAD/modules/PAM). But = remédiation complète + vérification post-cleanup vs baseline.
- **dedup** : distinct des voisins persistance (cross-OS + WMI/COM exhaustif vs Autoruns-only ou Linux-only).
- **chemin library** : `packages/skills/library/performing-malware-persistence-investigation/SKILL.md`
- **état** : écrit. Complétude = objectif, installer une persistance = refus.

## 8. investigating-ransomware-attack-artifacts
- **décision** : keep
- **raison** : investigation d'incident rançongiciel (preserve-first : capture mémoire avant reboot car clés résidentes ; notes/échantillons, ID variant via extension+IoCs note BTC/Tor/email, timeline Prefetch/EVTX/vssadmin, accès initial RDP/phishing, scope, recovery shadow copies/backups/No More Ransom/clés mémoire). Orienté victime/recovery.
- **garde-fou** : construire/déployer/tester du rançongiciel = interdit ; ne pas reproduire les instructions de paiement (extraire les IoCs seulement) ; ne pas détonner l'échantillon.
- **chemin library** : `packages/skills/library/investigating-ransomware-attack-artifacts/SKILL.md`
- **état** : écrit. Preserve avant remediate, capture mémoire prod = §5-gated.

## 9. analyzing-docker-container-forensics
- **décision** : keep
- **raison** : forensics de conteneur/hôte Docker compromis (preserve : export/commit/save/logs/inspect ; analyse de couches dive+container-diff ; audit config = privileged/CapAdd dangereux/mounts hôte RW/namespaces hôte/root/secrets env ; docker diff pour webshells/backdoors ; scan Trivy vulns+secrets). Défensif/investigatif.
- **dedup** : distinct de `performing-container-escape-detection` et des scanners — investigation post-compromission, pas détection runtime ni scan CI.
- **chemin library** : `packages/skills/library/analyzing-docker-container-forensics/SKILL.md`
- **état** : écrit. Preserve-first (conteneur éphémère), secrets = preuve redacted, construire image malveillante / escape = refus.

---

## Bilan LOT Q
- **9/9 keep** (0 reject, 0 fold). 1 dual-use gated (item 1, risk:high + Authorization & Handling Gate).
- 9 fiches écrites sous `packages/skills/library/<slug>/SKILL.md`, conformes §12 (8 sections), commentaire source, frameworks NIST 800-86 + MITRE préservés, 0 `@anthropic-ai/sdk`, 0 secret en clair, 0 chiffre cash.
- Pour self-audit Phase E : chevauchement noté entre item 2 et `performing-memory-forensics-with-volatility3-plugins` (clusters différents, slugs uniques).
- **HARD respecté** : aucune édition de `ledger.tsv`, aucun `git add/commit/push`, seuls les 9 dossiers library + ce shard touchés.

## Re-audit
Re-auditer si la source upstream `mukul975/Anthropic-Cybersecurity-Skills` est mise à jour, ou au gate Phase E (self-audit du chevauchement vol3 / vol3-plugins).

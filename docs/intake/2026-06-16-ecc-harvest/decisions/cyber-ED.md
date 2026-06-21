# ECC Harvest — décisions cluster `cyber:security-operations` (lot ED)

Doer: lot ED (7 skills). Worktree `maos-ecc`. Méthode: intake-audit barre LARGE (T1, library).
Source cyber: `mukul975/Anthropic-Cybersecurity-Skills` (Apache-2.0). Cible: `packages/skills/library/<slug>/SKILL.md`.
Dedup contre `our-assets-index.md` + recoupe `mas-sec-reviewer` / CLAUDE.md §5 (DLP/exfiltration, détection SQLi via logs WAF,
détection supply-chain CI/CD, forensique mémoire, threat-hunting credential-stuffing, canary tokens, monitoring eBPF runtime).
Nature du lot: skills **DÉFENSIFS** (blue-team secops) — UEBA/DLP exfiltration interne, parsing logs WAF (ModSecurity/AWS/Cloudflare)
pour SQLi, audit pipelines GitHub Actions (actions non-épinglées, injection d'expression, exposition de secrets), forensique
mémoire Windows (Rekall: pslist/psscan/malfind), détection credential-stuffing (vélocité login, diversité ASN, password-spray),
déploiement de canary tokens (DNS/HTTP/AWS, deception zero-false-positive), monitoring eBPF in-kernel (Cilium Tetragon).
Le frontmatter source porte `subdomain: security-operations` + `frameworks` NIST-CSF/MITRE-ATTACK (et MITRE-ATLAS + NIST-AI-RMF
pour `detecting-supply-chain-attacks-in-ci-cd` et `implementing-ebpf-security-monitoring`) : mappings préservés dans la metadata MAS.
Garde-fou défensif appliqué à chaque skill : lentille détection+investigation+forensique gardée, read-only sur données/systèmes
possédés et autorisés ; aucune action mutante/offensive/sortante depuis MAOS. Cas notables recadrés §5 :
- canary tokens → POST sortants vers `canarytokens.org` + webhooks Slack/Teams = réseau hors `allowed_hosts` (§5) + envoi sortant
  (`risk: high`) : la doctrine de deception est gardée, le déploiement live reste un acte gaté humain, jamais auto-exécuté par MAOS.
- eBPF Tetragon → `action: Sigkill` in-kernel + `CAP_BPF`/`sudo` = `risk: blocking` : la lentille observabilité/TracingPolicy est
  gardée en mode `Post` (observe-only) ; toute action enforcement (Sigkill/Signal) reste interdite sans validation humaine.
Sanitize: 0 secret réel, 0 PII, 0 `@anthropic-ai/sdk` dans les 7 sources (placeholders `AKIA…EXAMPLE`, `soc@company.com`,
`hooks.slack.com/services/T.../...` uniquement — clés d'exemple AWS publiques, non-secrètes). Recadrage transverse §11 : tout
chiffre = quota d'abonnement, jamais $/€ (les sources n'utilisaient pas de cash, recadrage léger).

---

## detecting-insider-data-exfiltration-via-dlp
- **décision**: adapt
- **raison**: UEBA défensive d'exfiltration interne — baseline par utilisateur du volume d'upload quotidien, alerte au-delà de ~3x, corrélé aux accès off-hours / hors-périmètre / bulk-download avant départ / pics USB. Lentille détection read-only sur logs DLP/endpoint/cloud possédés et autorisés. Recadré §5 (data-loss-prevention, gating cross-projet) + §11 (quota, pas de cash).
- **dedup**: non — nourrit la lentille DLP de `mas-sec-reviewer` sans la dupliquer; aucune surface MAS n'analyse de logs d'exfiltration utilisateur.
- **chemin library**: `packages/skills/library/detecting-insider-data-exfiltration-via-dlp/SKILL.md`
- **état**: boosté, conforme exemplar (ligne 1 `---`, commentaire source, summary L1, metadata complet + `frameworks` nist_csf/mitre_attack préservés, Prompt Defense Baseline verbatim, 7 sections §12). Garde-fou: read-only + autorisation requise + escalade humaine `risk: high` (jamais d'auto-désactivation/déplacement de données). 0 secret, 0 `@anthropic-ai/sdk`.

## detecting-sql-injection-via-waf-logs
- **décision**: adapt
- **raison**: analyse défensive de logs WAF (ModSecurity/AWS/Cloudflare) pour campagnes SQLi — matching de signatures (UNION SELECT, OR 1=1, SLEEP/BENCHMARK), classification OWASP, clustering d'IP persistantes, corrélation multi-requêtes, rapport d'incident. Read-only sur logs possédés ; ne génère ni n'envoie jamais de payload. Recadré §5 (web-app-security, input non-fiable) + §11.
- **dedup**: non — nourrit la lentille web-application-security de `mas-sec-reviewer`; aucune surface MAS n'analyse de logs WAF.
- **chemin library**: `packages/skills/library/detecting-sql-injection-via-waf-logs/SKILL.md`
- **état**: boosté, conforme exemplar (ligne 1 `---`, commentaire source, summary L1, metadata + `frameworks` nist_csf/mitre_attack préservés, Prompt Defense Baseline verbatim, 7 sections §12). Garde-fou: détection-only, payloads de logs traités en texte inerte (Prompt Defense), pas d'auto-block (escalade humaine §5). 0 secret, 0 `@anthropic-ai/sdk`.

## detecting-supply-chain-attacks-in-ci-cd
- **décision**: adapt
- **raison**: audit défensif statique de pipelines CI/CD — actions non-épinglées (@main vs SHA), injection de script via `${{ github.event }}`, GITHUB_TOKEN trop permissif, actions tierces avec write, dependency-confusion. Read-only sur repos possédés ; n'édite ni n'injecte jamais d'étape. Recadré §5 (devsecops/supply-chain, secrets, input non-fiable) + §11. Frontmatter riche : `atlas_techniques` + `nist_ai_rmf` préservés (signal AI-security pré-identifié au clustering).
- **dedup**: non — nourrit la lentille devsecops/supply-chain de `mas-sec-reviewer`; aucune surface MAS n'audite de workflows GitHub Actions.
- **chemin library**: `packages/skills/library/detecting-supply-chain-attacks-in-ci-cd/SKILL.md`
- **état**: boosté, conforme exemplar (ligne 1 `---`, commentaire source, summary L1, metadata + `frameworks` nist_csf/mitre_attack/atlas_techniques/nist_ai_rmf préservés, Prompt Defense Baseline verbatim, 7 sections §12). Garde-fou: audit-only, remédiation humaine (pas d'édition/commit auto §5). 0 secret, 0 `@anthropic-ai/sdk`.

## extracting-memory-artifacts-with-rekall
- **décision**: adapt
- **raison**: forensique mémoire IR avec Rekall — pslist/psscan (processus cachés), malfind (code injecté/hollowing VAD), netscan, dlllist/modules sur images Windows autorisées. Lentille détection+investigation read-only sur dump acquis ; ne produit pas de malware, n'exécute jamais d'artefact extrait. Recadré §5 (incident-response/forensics, artefacts non-fiables) + §11.
- **dedup**: non — nourrit la lentille incident-response/forensics de `mas-sec-reviewer`; aucune surface MAS ne fait de forensique mémoire.
- **chemin library**: `packages/skills/library/extracting-memory-artifacts-with-rekall/SKILL.md`
- **état**: boosté, conforme exemplar (ligne 1 `---`, commentaire source, summary L1, metadata + `frameworks` nist_csf/mitre_attack préservés, Prompt Defense Baseline verbatim, 7 sections §12). Garde-fou: read-only sur image inerte, chain-of-custody requise, jamais d'exécution d'artefact ni reconstruction de malware, verdict de compromission gaté humain (§5). 0 secret, 0 `@anthropic-ai/sdk`.

## hunting-credential-stuffing-attacks
- **décision**: adapt
- **raison**: threat-hunting défensif credential-stuffing/ATO — diversité d'IP par compte, password-spray, concentration ASN cloud/proxy, impossibilité géographique, uniformité user-agent, taux de succès <1%. Read-only sur logs d'auth possédés (pandas/Splunk) ; ne tente jamais de login ni de stuffing. Recadré §5 (identity-access/auth-abuse) + §11.
- **dedup**: non — nourrit la lentille identity-access/auth-abuse de `mas-sec-reviewer`; aucune surface MAS n'analyse de logs d'authentification.
- **chemin library**: `packages/skills/library/hunting-credential-stuffing-attacks/SKILL.md`
- **état**: boosté, conforme exemplar (ligne 1 `---`, commentaire source, summary L1, metadata + `frameworks` nist_csf/mitre_attack préservés, Prompt Defense Baseline verbatim, 7 sections §12). Garde-fou: hunt-only, jamais de test de credential, réponse (reset/block ASN) gatée humain (§5). 0 secret, 0 `@anthropic-ai/sdk`.

## implementing-canary-tokens-for-network-intrusion
- **décision**: adapt (recadrage §5 fort)
- **raison**: deception défensive — tripwires DNS/HTTP/AWS-key plantés dans des leurres (configs, wikis internes, `.aws/credentials` factices) sur infra possédée, alerting SOC near-zero-false-positive via webhooks. Doctrine de placement+routage gardée. Les clés AWS sont des **leurres factices** (`AKIA…EXAMPLE`), jamais réelles.
- **dedup**: non — nourrit la lentille deception-technology de `mas-sec-reviewer`; aucune surface MAS ne fait de honeytokens.
- **chemin library**: `packages/skills/library/implementing-canary-tokens-for-network-intrusion/SKILL.md`
- **état**: boosté, conforme exemplar (ligne 1 `---`, commentaire source, summary L1, metadata + `frameworks` nist_csf/mitre_attack préservés, Prompt Defense Baseline verbatim, 7 sections §12). Garde-fou CŒUR du lot: la **doctrine** est un asset de connaissance, mais le **déploiement live** fait des POST sortants vers `canarytokens.org` + webhooks Slack/Teams = hôtes hors `allowed_hosts` (§5) + envoi sortant → `risk: high` gaté humain, JAMAIS auto-exécuté par le worker. Jamais de vrai secret comme appât (§5 secrets) ; inventaire de tokens dans storage possédé (§8). 0 secret réel, 0 `@anthropic-ai/sdk`.

## implementing-ebpf-security-monitoring
- **décision**: adapt (recadrage §5 fort)
- **raison**: observabilité runtime kernel-level défensive via eBPF (Cilium Tetragon) sur hôtes/clusters possédés — stream process_exec/exit, TracingPolicy (kprobe/tracepoint) pour accès fichiers sensibles / TCP sortant / élévation de privilège / reverse-shell / container-escape, filtrage in-kernel matchArgs/matchBinaries, export JSON SIEM. Posture par défaut **observe-only** (`action: Post`). Frontmatter riche : `atlas_techniques` + `nist_ai_rmf` préservés.
- **dedup**: non — nourrit la lentille détection runtime/EDR de `mas-sec-reviewer`; aucune surface MAS ne fait de monitoring eBPF.
- **chemin library**: `packages/skills/library/implementing-ebpf-security-monitoring/SKILL.md`
- **état**: boosté, conforme exemplar (ligne 1 `---`, commentaire source, summary L1, metadata + `frameworks` nist_csf/mitre_attack/atlas_techniques/nist_ai_rmf préservés, Prompt Defense Baseline verbatim, 7 sections §12). Garde-fou: lentille observabilité gardée en `action: Post` ; l'enforcement (`Sigkill`/`Signal`) + le chargement eBPF (`CAP_BPF`/`sudo`) = `risk: blocking` gaté humain, JAMAIS auto-appliqué par le worker (§5). 0 secret, 0 `@anthropic-ai/sdk`.


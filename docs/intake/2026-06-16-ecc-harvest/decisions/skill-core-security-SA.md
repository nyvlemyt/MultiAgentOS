# ECC Harvest — décisions cluster `skill:core-security` (lot SA)

Doer: lot SA (5 skills). Worktree `maos-ecc`. Méthode: intake-audit barre LARGE (T1, library).
Source ECC: `affaan-m/ecc` (MIT). Cible: `packages/skills/library/<slug>/SKILL.md`.
Dedup contre `our-assets-index.md` + recoupe `mas-sec-reviewer` / CLAUDE.md §5.
Nature du lot: skills SÉCURITÉ (T1) qui nourrissent `mas-sec-reviewer` et la doctrine §5
sur leur domaine spécifique (chaîne, framework, repo-ops, santé). Sanitize: 0 secret réel
dans les 5 sources (1 faux positif regex sur gateguard: "10.0/10" = score A/B, pas une IP privée).

---

## defi-amm-security
- **décision**: adapt
- **raison**: checklist + patterns vulnérable→sûr pour AMM/vault Solidity (reentrancy/CEI, donation/inflation, oracle TWAP, slippage+deadline, SafeERC20, mulDiv, Ownable2Step, pause). Bras on-chain de la gate sécu.
- **dedup**: non — `mas-sec-reviewer` est une gate générique §5; aucun skill de sécurité on-chain dans notre surface. Angle distinct (modes d'échec EVM que la gate ignore).
- **chemin library**: `packages/skills/library/defi-amm-security/SKILL.md`
- **état**: neuf (source ECC substantielle non-stub; frontmatter MAS T1/library + Prompt Defense Baseline; 7 sections §12 réécrites/enrichies vers MAS; exemples sans clé/seed/credential).

## django-security
- **décision**: adapt
- **raison**: hardening Django/DRF complet (settings prod, auth/Argon2, RBAC+object perms, anti-SQLi ORM, anti-XSS escape-avant-mark_safe, CSRF, upload, throttling, CSP/HSTS, secrets env, logging). Bras framework-web de la gate sécu.
- **dedup**: non — distinct de `mas-sec-reviewer` (décision per-task) et de `defi-amm-security` (on-chain). Spécificités Django introuvables ailleurs chez nous.
- **chemin library**: `packages/skills/library/django-security/SKILL.md`
- **état**: neuf (source ECC riche non-stub; frontmatter MAS T1/library + Prompt Defense Baseline; 7 sections §12 enrichies; secrets d'exemple = placeholders uniquement).

## gateguard
- **décision**: adapt (maintainer-safe rewrite)
- **raison**: discipline fact-forcing avant 1ère édition/écriture/cmd destructive (grep importers, schéma+date-format, instruction verbatim, rollback) au lieu d'auto-éval inutile. Preuve A/B +2.25/10.
- **dedup**: non — complète §5/`mas-sec-reviewer` (gate dure) et `mas-reviewer` (post-edit). Angle distinct = investigation pré-action, pas autorisation.
- **machinery strippée (§ intake 4.bis/8)**: hook `PreToolUse` JS upstream + `pip install gateguard-ai` + `npx` retirés. On garde la LENTILLE (la discipline appliquée par l'agent), pas le hook tiers ni l'install non-pinnée.
- **chemin library**: `packages/skills/library/gateguard/SKILL.md`
- **état**: neuf (réécrit maintainer-safe; frontmatter MAS T1/library + Prompt Defense Baseline; 7 sections §12; aucune exécution externe/non-pinnée).

## github-ops
- **décision**: adapt (guidance-only, gates §5 documentés)
- **raison**: ops GitHub via gh CLI (triage issues, merge-readiness PR, debug CI, releases, alertes Dependabot/secret-scanning). §5: merge/release/push/label/comment/close/dismiss = actions sortantes mutantes → TOUJOURS gate humaine, même autopilot. Lecture seule (list/view/checks/logs) = autonome.
- **dedup**: non — `Git Workflow Master` (fiche agent) couvre git local; aucun skill d'ops GitHub/gh dans notre surface. Angle distinct.
- **machinery (§5)**: AUCUNE action risquée codée. Le skill PROPOSE la commande + affiche la gate; l'opérateur clique. Tableau de gating explicite intégré.
- **chemin library**: `packages/skills/library/github-ops/SKILL.md`
- **état**: neuf (recadré guidance+gates; frontmatter MAS T1/library + Prompt Defense Baseline; 7 sections §12; 0 token/credential en ligne de commande).

## hipaa-compliance
- **décision**: adapt (dé-stubé / rendu auto-portant)
- **raison**: entrypoint HIPAA — gates de décision (PHI? covered entity/BA? BAA requis? minimum-necessary? auditabilité?) + guardrails PHI (jamais PHI dans logs/analytics/prompts/URLs/screenshots; accès authentifié scopé+audité; vendor/LLM bloqué-par-défaut sans BAA; IDs opaques).
- **dedup**: non — aucune couverture santé/PHI dans notre surface; complète `mas-sec-reviewer` pour risk:high/blocking santé.
- **anti-stub (§ intake)**: la source était un thin router vers des skills frères absents (`healthcare-phi-compliance`, `healthcare-reviewer`) hors lot. Réécrit AUTO-PORTANT: guardrails PHI inlinés pour gater sans dépendance externe. N'est plus un stub.
- **chemin library**: `packages/skills/library/hipaa-compliance/SKILL.md`
- **état**: neuf (dé-stubé + enrichi; frontmatter MAS T1/library + Prompt Defense Baseline; 7 sections §12; aucun PHI/identifiant réel dans les exemples).

---

### Récap
- 5/5 keepers (tous `adapt`). 0 reject.
- Adaptations notables: `gateguard` réécrit maintainer-safe (hook/pip strippés → discipline seule);
  `github-ops` recadré guidance-only avec tableau de gates §5 (aucune action risquée codée);
  `hipaa-compliance` dé-stubé en skill auto-portant (guardrails PHI inlinés).
- Garde-fous: 0 `@anthropic-ai/sdk`, 0 secret/PAYG/token/clé/PHI réel dans les 5 outputs.

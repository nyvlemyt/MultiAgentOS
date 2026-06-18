# ECC Harvest — décisions cluster `skill:core-eval` (lot K)

Doer: lot K (6 skills). Worktree `maos-ecc`. Méthode: intake-audit barre LARGE (T1, library).
Source ECC: `affaan-m/ecc` (MIT). Cible keepers: `packages/skills/library/<slug>/SKILL.md`.
Dedup contre `our-assets-index.md` (24 skills `.claude/skills/` + 56 agents + 7 fiches Tier B).
Garde-fous vérifiés sur les 3 keepers: 0 `@anthropic-ai/sdk`, 0 secret/PAYG (grep ci-dessous).

---

## canary-watch
- **décision**: adapt (keeper)
- **raison**: vérification post-deploy/smoke d'une URL en cours d'exécution sur 8 signaux (HTTP, console, réseau/5xx, perf LCP/CLS/INP, contenu clé, SLA API, assets statiques, SSE) contre baseline. Renforce la règle vérif=5-checks (§7) au-delà du `pnpm --filter @mas/web smoke`. Lecture seule, ne déploie/mute rien.
- **dedup**: non — `webapp-testing` (Playwright) pilote l'UI; `mas-reviewer` revoit un diff; aucun vérificateur post-deploy de surface en exécution chez nous.
- **maintainer-safe**: alertes webhook Slack/Discord = envoi réseau sortant (risk:high §5) → mises OFF par défaut, réécrites en candidat d'approbation humaine, jamais auto-send.
- **chemin library**: `packages/skills/library/canary-watch/SKILL.md`
- **état**: neuf — source ECC substantielle (non-stub). Frontmatter MAS T1/library/cluster core-eval + Prompt Defense Baseline (pilote un agent de vérification). 7 sections §12 réécrites/enrichies vers MAS, non recopiées.

## cisco-ios-patterns
- **décision**: reject
- **raison**: revue de config réseau Cisco IOS/IOS-XE — hors domaine MAS (cockpit multi-agent dev local-first, pas d'ops réseau). Aucune surface MAS ne consomme ce contenu. Qualité correcte mais le rejet est sur le FIT, pas sur un stub.
- **dedup**: n/a (hors périmètre).
- **re-audit**: si MAS introduit un domaine net-ops (aucun au roadmap) → ré-auditer.

## click-path-audit
- **décision**: adapt (keeper)
- **raison**: audit de flux comportemental UI — trace chaque touchpoint dans l'ordre, cartographie les side-effects de store (Zustand/Redux/context), détecte sequential-undo / async-race / stale-closure / missing-transition / dead-path / useEffect-interference. Cible directe: cockpit Next.js de MAS. Tourne APRÈS systematic-debugging, AVANT verification-before-completion; chaque bug → test de régression (§7 TDD).
- **dedup**: non — `mas-reviewer` = niveau diff; `systematic-debugging` ne couvre pas la classe "bouton mort par reset de state non-possédé".
- **chemin library**: `packages/skills/library/click-path-audit/SKILL.md`
- **état**: neuf — source ECC riche (non-stub). Frontmatter MAS T1/library/core-eval + Prompt Defense Baseline. Corps §12 réécrit/amélioré (format side-effect-map + finding conservés, prose MAS), non recopié.

## codehealth-mcp
- **décision**: reject (maintainer-safe impossible)
- **raison**: la valeur entière du skill EST le serveur MCP tiers `@codescene/codehealth-mcp` (CodeScene) + un credential externe `CS_ACCESS_TOKEN`. Dépendance non-épinglée à un service tiers + token externe. Per consigne note: maintainer-safe = retirer la dépendance non-épinglée → il ne reste alors aucune instruction actionnable (coquille). On ne distille pas un token/credential externe dans la library (§11 esprit: une clé/credential est un smell, pas une feature). Le principe (gate de santé structurelle pré/post-edit) est déjà couvert côté MAS par `mas-reviewer` + Sonar (5e check §7).
- **dedup**: principe redondant avec Sonar/`mas-reviewer`; l'implémentation est entièrement vendor-MCP.
- **re-audit**: si un gate de code-health *sans* MCP/credential tiers devient souhaitable → audit séparé d'un skill maison.

## coding-standards
- **décision**: adapt (keeper)
- **raison**: plancher de conventions cross-project (naming, immutabilité, KISS/DRY/YAGNI, error-handling, type-safety, REST/envelope, code-smells). Plancher réutilisable sous CLAUDE.md §7 + gate Sonar/lint; défère explicitement les patterns framework aux skills plus étroits; ne gate rien lui-même.
- **dedup**: non — CLAUDE.md §7 est de la doctrine repo-spécifique inline; aucun skill de conventions réutilisable dans notre surface. `mas-reviewer` gate mais ne définit pas le plancher.
- **maintainer-safe**: exemples génériques (z, supabase, NextResponse) conservés comme illustrations TS/React/API neutres; aucune dépendance épinglée ni secret introduit.
- **chemin library**: `packages/skills/library/coding-standards/SKILL.md`
- **état**: neuf — source ECC longue/substantielle (non-stub). Frontmatter MAS T1/library/core-eval + Prompt Defense Baseline. Corps §12 condensé vers la structure lifecycle + enrichi (Principles/Process/Rationalizations/RedFlags/VerificationCriteria), non recopié verbatim.

## connections-optimizer
- **décision**: reject
- **raison**: réorganisation de réseau social X/LinkedIn + génération de drafts d'outreach (X DM, LinkedIn, Apple Mail). Doublement disqualifiant: (1) hors domaine MAS (cockpit dev, pas CRM social); (2) surface d'actions risquées — outreach/DM/email = envoi réseau sortant + automation Apple Mail, catégorie risk:high|blocking (§5), et dépendances tierces (x-api, lead-intelligence, brand-voice) non présentes. Rejet sur fit + surface risquée, pas sur un stub.
- **dedup**: n/a (hors périmètre).
- **re-audit**: aucun trigger prévu — MAS n'a pas de roadmap social/CRM.

---

### Récap

| slug | décision | chemin |
|------|----------|--------|
| canary-watch | adapt (keeper) | `packages/skills/library/canary-watch/SKILL.md` |
| cisco-ios-patterns | reject | — (hors domaine net-ops) |
| click-path-audit | adapt (keeper) | `packages/skills/library/click-path-audit/SKILL.md` |
| codehealth-mcp | reject | — (vendor-MCP + credential; maintainer-safe vide) |
| coding-standards | adapt (keeper) | `packages/skills/library/coding-standards/SKILL.md` |
| connections-optimizer | reject | — (hors domaine + actions risquées §5) |

- 3 keepers / 3 rejets.
- Keepers tous neufs (audités + boostés depuis `/tmp/ecc-inspect`, sources non-stub), 7 sections §12 + Prompt Defense Baseline + frontmatter T1/library/cluster `skill:core-eval` + commentaire source.
- Rejets motivés FIT/risque/dépendance-tierce — aucun n'est un stub.
- Garde-fous: 0 `@anthropic-ai/sdk`, 0 secret/PAYG dans les 3 outputs.

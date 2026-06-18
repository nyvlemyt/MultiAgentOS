# ECC Harvest — décisions cluster `skill:core-skills-mgmt` (lot S2)

Doer: lot S2 (4 skills). Worktree `maos-ecc`. Méthode: intake-audit barre LARGE (T1, library).
Source ECC: `affaan-m/ecc` (MIT). Cible: `packages/skills/library/<slug>/SKILL.md`.
Dedup contre `our-assets-index.md` (24 skills `.claude/skills/` + 56 agents + 7 fiches Tier B).

Note de cluster: ces 4 skills gèrent **notre arsenal de skills** (découverte avant authoring,
audit qualité, distillation principes→règles, mesure de conformité runtime). Ils mappent sur les
fonctions scout/stocktake/comply évoquées autour de `mas-skill-router` mais en sont distincts:
`mas-skill-router` **sélectionne** un skill possédé pour une tâche live; ce cluster **entretient**
la bibliothèque (build-time / maintenance). Aucun chevauchement fonctionnel.

---

## skill-scout
- **décision**: adapt
- **raison**: search-before-build pour skills — scanne la surface possédée (library + `mas-*`) puis
  sources externes vétées avant d'autoriser la création d'un nouveau skill; aligné RES-054 §1
  ("vérifier que ça n'existe pas déjà") + §5 (découverte ≠ install).
- **dedup**: non — `skill-creator` écrit le skill, `intake-audit` adjuge l'entrée d'un item externe,
  `mas-skill-router` route au runtime. Aucun skill de recherche-avant-authoring chez nous.
- **chemin library**: `packages/skills/library/skill-scout/SKILL.md`
- **état**: neuf (source ECC non-stub; frontmatter MAS T1/library + Prompt Defense Baseline —
  pilote des sous-agents de recherche; 7 sections §12 réécrites/ré-ancrées MAS, surface externe
  `~/.claude` → `packages/skills/library` + `mas-*`; non recopié).

## skill-stocktake
- **décision**: adapt
- **raison**: audit santé périodique de la bibliothèque (Keep/Improve/Update/Retire/Merge) avec
  raisons auto-portantes; Quick Scan incrémental + Full; aligné §13 (self-audit aux phase gates) +
  §5 (Retire/Merge non destructifs sans confirmation).
- **dedup**: non — `skill-scout` cherche avant authoring, `mas-skill-router` route au runtime; aucun
  skill d'audit qualité de surface chez nous.
- **chemin library**: `packages/skills/library/skill-stocktake/SKILL.md`
- **état**: neuf (source ECC substantielle; chemins `~/.claude/skills` → `packages/skills/library` +
  `mas-*`; verdicts rendus advisory/§5; frontmatter MAS + Prompt Defense Baseline — orchestre des
  sous-agents d'éval; 7 sections §12 enrichies, non recopié).

## rules-distill
- **décision**: adapt
- **raison**: cross-read de la bibliothèque pour promouvoir des principes récurrents (2+ skills) vers
  les règles (CLAUDE.md / docs/knowledge), verdicts Append/Revise/New/Already-Covered/Too-Specific;
  collection déterministe + jugement LLM; aligné §12 (les règles = surface doctrine) + §5 (jamais
  d'écriture auto de règle).
- **dedup**: non — distinct de `skill-stocktake` (juge chaque skill isolément) et de `intake-audit`
  (entrée d'un item); aucun skill de distillation principes→règles chez nous.
- **chemin library**: `packages/skills/library/rules-distill/SKILL.md`
- **état**: neuf (source ECC non-stub; cibles règles ECC `rules/common/*` → `CLAUDE.md`/`docs/knowledge`;
  garde anti-abstraction conservée; frontmatter MAS + Prompt Defense Baseline — pilote des sous-agents
  d'analyse; 7 sections §12 ré-ancrées MAS, non recopié).

## skill-comply
- **décision**: adapt
- **raison**: mesure de conformité runtime — un skill est-il **suivi** même quand le prompt ne le
  pousse pas (prompt independence)? spec auto + scénarios 3 niveaux + trace + classification LLM +
  ordering déterministe; lens conservée, machinerie Python tierce **écartée** (§11: moteur Claude Code
  abonnement, 0 PAYG); cibles risquées → `mas-sec-reviewer` d'abord (§5).
- **dedup**: non — complément comportemental de `skill-stocktake` (audit statique); ne route ni
  n'écrit; aucun skill de mesure de conformité chez nous.
- **chemin library**: `packages/skills/library/skill-comply/SKILL.md`
- **état**: neuf (source ECC substantielle — 13 fichiers Python/prompts/fixtures, **non distillés**:
  runner `claude -p` + `--gen-model` réimplémentés conceptuellement contre `packages/core/src/llm.ts`,
  zéro dépendance/clé importée; frontmatter MAS + Prompt Defense Baseline — exécute des agents;
  7 sections §12 réécrites MAS, non recopié).

---

### Récap
- 4/4 keepers (tous `adapt`). 0 reject (aucun stub; tous substantiels; aucun dedup vs `mas-skill-router`).
- 4 neufs (audités + boostés depuis `/tmp/ecc-inspect`, RO). Tous: frontmatter MAS T1/library +
  Prompt Defense Baseline (les 4 pilotent des sous-agents) + 7 sections §12.
- Sanitize (étape 4.bis): scan regex secrets/PAYG sur les 4 arbres sources (y.c. scripts Python/sh) → 0 match.
- Garde-fous outputs: 0 `@anthropic-ai/sdk`, 0 secret, 0 PAYG dans les 4 SKILL.md library.
- `skill-comply`: machinerie tierce (Python runner, modèles via clé) écartée maintainer-safe; seule la
  lens (mesure de prompt-independence) adoptée contre le moteur abonnement (§11).

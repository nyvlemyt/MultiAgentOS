# Intake Audit — Convention de dossier d'agents portable (`.agent`/`.agents` + `AGENTS.md`) (2026-06-29)

> **Candidat** : adopter une convention de dossier de config d'agents **agnostique de l'outil**
> (un `.agents/` vendor-neutral et/ou `AGENTS.md` comme spec portable) pour que skills/agents/
> commands tournent sur **tous** les agents de code (Cursor, Codex, Gemini, Windsurf…), pas
> seulement Claude Code via `.claude/`.
> **Source** : tip signalé par l'utilisateur depuis la vidéo *« J'ai transformé Obsidian en OS IA
> (Wiki Karpathy 2.0) »* — Valentin Fontana (@valentin_unmute), `youtu.be/q2VY2HWo0dI`.
> **Question tranchée par cet audit** : faut-il renommer `.claude/` → `.agent/` ? **Non** — voir Décision.

## Guardrails (étape 0)

- **Local-first** ✓ — pure convention de répertoires, aucun service.
- **Subscription-only (§11)** ✓ — aucune clé API, aucun PAYG.
- **Pas de framework sans ADR** ✓ — c'est une *convention*, pas une dépendance. Mais elle touche le **layout §3** → mérite un ADR (décision d'architecture).
- **§5 — pas d'op destructive silencieuse** ⚠ **POINT DUR** : Claude Code ne découvre skills/agents/commands/hooks **que** depuis `.claude/` (issue amont `anthropics/claude-code#33395` « Native .agents/ folder support » = pas encore livré). Un **renommage** `.claude/` → `.agent/` casserait silencieusement la découverte des skills/agents/commands **et** le câblage des hooks (`.claude/hooks/`). C'est de facto une op destructive sur l'outillage vivant → interdite telle quelle.
- **Réversibilité (mémoire `completeness-over-yagni`)** : un **miroir additif** est trivialement réversible ; un **renommage** est enraciné/destructif. La règle « bolt-on réversible seulement avec un socket propre » s'applique directement.

## Identité

- **Quoi exactement** : une *convention* émergente. Deux briques : (1) un dossier `.agents/` vendor-neutral hébergeant des items génériques ; (2) `AGENTS.md` à la racine comme contexte projet tool-agnostique (build commands, standards, archi), par opposition à `CLAUDE.md` (instructions Claude-Code-spécifiques : hooks, permissions).
- **Source** : vidéo FR (titre confirmé via oEmbed YouTube). **Transcript NON récupérable** (page YT = SPA JS ; captions signées) → le tip précis vient du signalement utilisateur + corroboration tierce (docs Claude Code, `anthropics/claude-code#33395`, mouvement `AGENTS.md`), **pas** de l'audio de la vidéo. Les spécificités de build de l'auteur restent non sourcées.
- **Récence / obsolescence** : convention très récente, en mouvement → **medium**. Si Claude Code livre le support natif `.agents/` (#33395 ouvert), un miroir maison devient redondant → condition de ré-audit.
- **Résumé** :
  - Idée : un seul arsenal (skills/agents/commands) lisible par n'importe quel outil de code, pas verrouillé sur un vendeur.
  - `AGENTS.md` = spec portable ; `CLAUDE.md` = surcouche Claude-Code.
  - **Caveat dur** : aujourd'hui Claude Code ne lit que `.claude/` ; `.agents/` n'est pas auto-chargé.

## Fit (relié fichier/phase)

- **Surface touchée** : `CLAUDE.md §3` (layout repo) + `AGENTS.md §1` — qui **hardcodent** `.claude/{agents,skills,commands}`. C'est une vraie décision d'archi, pas un détail.
- **État actuel vérifié** : MAOS utilise `.claude/` exclusivement (`.claude/agents/`, `.claude/skills/` ~30 dirs, `.claude/commands/`, `.claude/hooks/`) + `CLAUDE.md` **et** `AGENTS.md` déjà à la racine → **partiellement aligné** (la moitié `AGENTS.md` du split existe déjà). **Aucun** `.agents/` (vérifié : absent).
- **Doublon ?** Net-new (dedup confirmé). Adjacents seulement : VibeFlow « Comment rendre tes projets IA portables » (PDF brut non distillé, backlog Phase 5, `vibeflow/INDEX.md:104`) ; ADR 0008 clauses 9-10 (portabilité **data-not-code** : config packs versionnés par projet enfant — *autre* portabilité). La convention `.claude→.agent` / `AGENTS.md-comme-standard` n'est captée nulle part.
- **Convergence arsenal** : aligne avec l'ambition « arsenal » de l'ECC-harvest (`packages/agents/library/`, `packages/skills/library/`) et le router cross-tool (`RouterLLMClient`, ADR 0002/0009).

## Coûts (les trois)

- **Install** : la *décision* (no-rename + stance additive) = clause ADR cheap (~0 token runtime). Un vrai **générateur de miroir `.agents/`** depuis `.claude/` = petit build (Phase 5+).
- **Maintenance** : un miroir doit rester synchro avec `.claude/` → risque de dérive ; `AGENTS.md` est déjà maintenu. Si #33395 livre le natif → miroir obsolète.
- **Retrait** : additif = **réversible trivialement** (supprimer `.agents/`). Renommage = **enraciné/destructif** (casse découverte + hooks). C'est précisément pourquoi le renommage est `reject`.

## Sanitize (étape 4.bis)

**N/A** — adoption *pattern-only* depuis une convention publique. Aucun repo/code étranger ingéré. Le transcript n'a même pas pu être lu. Pas de contenu à scanner.

## Scores (0–5)

| Axe | Score | Note |
|---|---|---|
| project_fit | 4 | Touche directement le layout §3 + l'ambition arsenal cross-tool |
| token_efficiency | 5 | Pure convention ; coût runtime ~0 |
| safety | 3 | La variante *renommage* casse l'outillage vivant — à neutraliser explicitement |
| implementation_effort | 4 | Décision = cheap ; générateur de miroir = un petit build différé |
| evidence_maturity | 2 | Convention jeune, non livrée nativement par Claude Code (#33395 ouvert) ; tip non sourcé du transcript |
| user_value | 4 | Pull réel (portabilité de l'arsenal) ; demandé par l'utilisateur |
| phase_compatibility | 3 | Stance/ADR cheap maintenant ; générateur = Phase 5 |

## KILL criteria (veto)

- **Renommage `.claude/` → `.agent/`** → **reject** : op destructive silencieuse sur l'outillage (§5) — casse skills/agents/commands/hooks tant que Claude Code ne lit que `.claude/`.
- **Build lourd hors phase** (générateur de miroir) → `backlog_next` Phase 5, jamais une porte de derrière.
- **PAYG / clé API** → aucun. Passe §11.
- **Framework** → aucun introduit.

## Décision : `adapt_now` (acter la stance additive, no-rename) + `backlog_next` (le générateur de miroir, Phase 5)

**Justification (≤4 lignes)** : la convention est net-new et touche une décision d'archi réelle (`CLAUDE.md §3`), mais le **renommage est destructif** tant que Claude Code n'auto-charge que `.claude/` (#33395). On **garde `.claude/` comme source vivante**, on traite la portabilité via `AGENTS.md` (déjà présent) + un **miroir additif optionnel** généré plus tard. Bolt-on réversible avec socket propre = exactement la règle `completeness-over-yagni`. Le renommage est explicitement **rejeté**.

## Appropriation (la version MAOS)

- **NE PAS** renommer `.claude/`. `.claude/` reste la **source vivante** (skills/agents/commands/hooks).
- **Portabilité = additive** : `AGENTS.md` (déjà racine) porte le contexte tool-agnostique ; un futur générateur `pnpm arsenal:export-agents` produirait un `.agents/` miroir (read-only, dérivé, gitignored ou non) pour Cursor/Codex/Gemini — **dérivé de `.claude/`, jamais l'inverse**.
- **Moins cher** : pas de runtime ; le générateur réutilise l'index arsenal déjà construit (`packages/skills/library/index.json`).
- **Adapter l'item, pas le projet** : on prend le *principe* (un arsenal, plusieurs façades), on rejette la *mécanique* (rename).

## Plan d'intégration (si go)

- **Maintenant (`adapt_now`, doc-only, low-risk, sur go)** :
  1. Court ADR `docs/decisions/00XX-agent-config-portability.md` : décision = **no-rename**, `.claude/` = source vivante, portabilité via `AGENTS.md` + miroir `.agents/` additif différé ; condition de revue = livraison `anthropics/claude-code#33395`.
  2. Cross-link ce dossier + note `vibeflow/INDEX.md:104` (le PDF « projets IA portables » devient distillable vers cet ADR).
  - **DoD binaire** : ADR existe, référence ce dossier, dit explicitement « pas de renommage » ; aucun fichier `.claude/` déplacé ; aucun code ; aucune dépendance.
- **Backlog (`backlog_next`, Phase 5)** : générateur de miroir `.agents/` — **seulement si** #33395 n'a pas livré le natif d'ici là.

**Ce qu'il ne faut PAS faire** : ne pas renommer `.claude/` ; ne pas déplacer les hooks ; ne pas faire de `.agents/` la source (toujours un dérivé) ; ne pas builder le générateur hors Phase 5.

## Ré-audit

Ré-auditer à la **livraison de `anthropics/claude-code#33395`** (support natif `.agents/` → le miroir maison devient inutile), ou si l'utilisateur veut prototyper l'export plus tôt.

## Sources

- [Vidéo — « J'ai transformé Obsidian en OS IA (Wiki Karpathy 2.0) », Valentin Fontana](https://youtu.be/q2VY2HWo0dI) *(titre confirmé via oEmbed ; transcript non récupéré)*
- [anthropics/claude-code#33395 — Native `.agents/` folder support](https://github.com/anthropics/claude-code/issues/33395) *(corroboration tierce ; `.agents/` pas encore auto-chargé)*
- Convention `AGENTS.md` (agentsmd / multi-outils) — mouvement public de spec portable

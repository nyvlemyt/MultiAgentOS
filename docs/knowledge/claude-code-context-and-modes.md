# Claude Code — Architecture du contexte & 6 modes de permission

**Distillé** : 2026-06-03 (pré-vol build-time, cf. `docs/workflows/knowledge-bootstrap.md`).
**Sources** : `docs/ressources/L'Architecture Complete du Contexte dans Claude Code.pdf` + `docs/ressources/Audit des 6 modes Claude Code...pdf` (récupère RES-030, qui était en 404 dans `vibeflow/INDEX.md`).
**Obsolescence** : medium — modes valides ≥ Claude Code v2.1.83 ; le mode `auto` (classifier) date de mars 2026. Re-vérifier à `code.claude.com/docs/en/permission-modes`.

---

## 1. Les 3 couches de contexte (modèle de chargement)

Principe : « le code s'exécute, le contexte décide ». La qualité de sortie dépend de ce que Claude sait **avant** la première ligne.

| Couche | Fichiers | Chargé quand |
|--------|----------|--------------|
| **Constitution** | `CLAUDE.md` + `.claude/rules/*.md` | À chaque session, automatiquement (rules ciblées : à la demande, voir §2) |
| **Décisions** | ADR (`docs/decisions/`) | Quand Claude touche les fichiers concernés |
| **Mémoire** | `.claude/memory/` + `MEMORY.md` (index) | `MEMORY.md` à chaque session, le reste à la demande |

MAS a déjà les 3 (CLAUDE.md, `docs/decisions/`, mémoire auto). Ce qui manque = la couche **rules ciblées** (§2).

## 2. `.claude/rules/` avec frontmatter `paths:` — économie de tokens (gain build-time)

Les rules sont des fichiers de domaine (`code-style.md`, `security.md`, `testing.md`...) qui **complètent** CLAUDE.md. Avec un frontmatter `paths:`, une rule ne se charge **que** quand Claude travaille sur les fichiers matchés :

```markdown
---
paths:
  - "packages/*/src/**/*.ts"
---
<règles qui ne chargent que pour le code TS de packages>
```

**Pourquoi ça compte pour MAS** : notre `CLAUDE.md` est monolithique (~12 sections chargées en entier à chaque session). Sections lourdes et conditionnelles (§5 risky actions détaillées, §6 token discipline, §11 billing, §12 knowledge rules) = candidates à extraire vers `.claude/rules/*.md` ciblées par `paths:`. Le tronc CLAUDE.md reste < 200 lignes (reco officielle), le détail charge à la demande. → **Candidat refactor build-time** (touche CLAUDE.md, ne pas faire en silencieux — proposer).

## 3. Les 6 modes de permission

| Mode | Passe sans confirmation | Bloque (toujours / demande) |
|------|--------------------------|------------------------------|
| `default` | Lectures seules (Read, Grep, Glob, LS) | Toute modif fichier + tout Bash qui écrit → demande à chaque fois |
| `plan` | Lectures + présente un plan à valider | Aucun edit/écriture/commande tant que le plan n'est pas validé |
| `acceptEdits` | Lectures + edits + filesystem basique dans le working dir (mkdir, touch, rm, mv, cp, sed) | Hors working dir, install packages, réseau, git push, protected paths |
| `dontAsk` | Uniquement ce qui matche les règles `allow` ; le reste **auto-refusé** | Toute action hors allow list — l'agent ne peut pas demander, il est bloqué |
| `auto` *(mars 2026)* | Classifier **Sonnet 4.6** évalue chaque action en temps réel, laisse passer le sûr | Destruction (`rm -rf *`, `reset --hard`), exfiltration (curl + données), écriture protected paths, bypass de review |
| `bypassPermissions` | **Tout**. Zéro protection | Rien. Prompt injection possible sur tout input externe. Responsabilité 100 % user |

### Protected paths (jamais touchés en auto, même `acceptEdits`/`auto`)
`.git/` · `.vscode/` `.idea/` `.husky/` · `.claude/` (sauf `.claude/commands/`, `.claude/agents/`, `.claude/skills/` qui restent editables) · `.gitconfig` `.bashrc` `.zshrc` · `.mcp.json` `.claude.json`

## 4. Mapping MAS (build-time + runtime)

| Élément Claude Code | Surface MAS | Action |
|---------------------|-------------|--------|
| 6 modes (gradient lecture→autonomie) | Autonomy levels `CLAUDE.md §4` (manual/assisted/autonomous/autopilot) | Aligner : `manual`≈`default/plan`, `assisted`≈`acceptEdits`, `autonomous`≈`auto`, `autopilot`≈`dontAsk`+allowlist. **Candidat note dans §4.** |
| Mode `auto` = classifier Sonnet 4.6 runtime | `mas-sec-reviewer` + risky gates `§5` | Le classifier natif **complète** (ne remplace pas) nos gates déterministes. À noter dans la stratégie sécu — confirme que la détection destruction/exfiltration/bypass est une couche éprouvée. |
| Protected paths | `§5` (paths protégés) + `config/permissions.json` | Reprendre la liste comme défaut de `deny` ; cohérent avec « write hors projet actif = gated ». |
| `deny`/`allow` dans `settings.json` | `config/permissions.json` (extension point) | Notre allowlist = équivalent `dontAsk`+`allow`. |
| `.claude/rules/` + `paths:` | `CLAUDE.md` refactor | §2 ci-dessus — candidat. |

### Prompt maître réutilisable (audit mode + génération `settings.json`)
Le PDF fournit un prompt d'audit en 5 questions (type projet / tolérance risque / environnement / volume sessions / données confidentielles) → recommande `defaultMode` + 3-5 règles `deny` + merge `settings.json`. Réutilisable tel quel pour configurer un **projet enfant** enregistré dans MAS (feature runtime : onboarding projet → audit mode auto). À backloguer côté Phase 6 (autonomy + risk gates).

## 5. Note d'intégration

Cette distillation est **build-time** (savoir pour mieux construire MAS). Les éléments runtime (audit mode par projet enfant, classifier as a layer) sont des inputs Phase 6 — voir `docs/workflows/knowledge-bootstrap.md` §2.

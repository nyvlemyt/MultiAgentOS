# Checker Verdict — ECC Harvest, Phase C vague 2 (cluster `skill:core-agent`)

**Date:** 2026-06-18
**Worktree:** `/Users/melvyn/Documents/02_PROJETS/maos-ecc` (branch `phase/ecc-harvest`)
**Scope:** 33 audités → 23 keepers (nouveaux fichiers library) + 10 rejets
**Verdict :** **NEEDS_WORK**

---

## Résumé

La vague 2 est substantielle et globalement saine : les 23 keepers existent, les 10 rejets n'ont aucun dossier, le ledger est parfaitement cohérent (38 integrated + 13 rejected = 51, 0 pending, chaque integrated a un dossier, chaque rejected n'en a pas), les shards D-I couvrent les 33 slugs, la sweep §11/secrets est propre (aucun import/export `@anthropic-ai/sdk`, aucune clé `sk-ant`/`ANTHROPIC_API_KEY=`/`AKIA` — `security-scan` a correctement transformé l'`ANTHROPIC_API_KEY` source en *smell* de prose), et `lint-no-sdk-payg.sh` sort 0. Les 4 fichiers lus en profondeur (`orch-pipeline`, `security-scan`, `recursive-decision-ledger`, `healthcare-eval-harness`) sont riches, non-stubs, et appliquent l'adaptation maintainer-safe (PAYG/`--opus`/npx externe/GAN binaire strippés, gates §4/§5 câblés). **Mais** un défaut bloquant le `PASS` : **9 des 23 fichiers placent le commentaire de citation AVANT le frontmatter YAML (ligne 1)**, ce qui casse le parseur de frontmatter (`packages/skills/src/scanner.ts:40`, regex ancrée `/^---\r?\n/`). Sur ces 9 fichiers, `name`/`summary`/`metadata` ne sont **pas indexables** par le skill-router — le L1 summary, raison d'être de l'injection §6/§12, devient invisible. 3 de ces 9 ont en plus une citation non-conforme (`<!-- source: ... -->` au lieu de `<!-- pattern from affaan-m/ecc -->` requis), et `workspace-surface-audit` titre `## Audit Process` au lieu de `## Process`.

---

## Tableau des contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| 23 keepers présents (SKILL.md) | PASS | Les 23 dossiers + SKILL.md existent |
| 10 rejets sans dossier | PASS | Aucun des 10 n'existe sous `library/` |
| §12 — 7 sections + summary + metadata | PASS (20) / FAIL (1) | `workspace-surface-audit` : `## Audit Process` au lieu de `## Process`. Les 22 autres ont les 7 sections |
| §12 — commentaire `pattern from affaan-m/ecc` | **FAIL (9)** | 6 ont `pattern from` mais **mal placé (ligne 1, avant frontmatter)** ; 3 utilisent `<!-- source: ... -->` (forme non conforme) |
| **Frontmatter parseable** (`scanner.ts` regex) | **FAIL (9)** | Commentaire ligne 1 → `parseFrontmatter` retourne `{}` → name/summary/metadata perdus. Smoke test Node confirmé |
| Pas de stub (échantillon de 4) | PASS | `orch-pipeline`, `security-scan`, `recursive-decision-ledger`, `healthcare-eval-harness` : riches, boostés, maintainer-safe |
| §11 — `@anthropic-ai/sdk` imports | PASS | 2 hits = prose négative uniquement (lint-guard mention + critère de vérif), 0 import/export réel |
| Secrets (`sk-ant`/`ANTHROPIC_API_KEY=`/`AKIA`/`SC_API_KEY=`) | PASS | Aucune assignation. `security-scan` : `ANTHROPIC_API_KEY` source converti en smell-prose, pas une vraie clé |
| Ledger cohérent (38 int + 13 rej, 0 pending) | PASS | 51 lignes core-agent ; chaque integrated→dossier, chaque rejected→pas de dossier |
| Shards D-I existent + couvrent 33 slugs | PASS | D,E,F,G,H,I présents ; les 33 slugs (keepers + rejets) référencés |
| `lint-no-sdk-payg.sh` exit 0 | PASS | `PASS: no forbidden provider SDK imports` |

---

## Corrections exactes requises (avant PASS)

### 1. BLOQUANT — commentaire avant frontmatter (9 fichiers)
Le commentaire de citation doit être placé **APRÈS** le `---` de fermeture du frontmatter (comme `orch-pipeline`, `security-scan`, `recursive-decision-ledger`, `safety-guard`). Ligne 1 du fichier DOIT être `---`.

Fichiers à corriger (déplacer la ligne 1 sous le frontmatter) :
- `gan-style-harness`
- `hexagonal-architecture`
- `inherit-legacy-style`
- `healthcare-cdss-patterns`
- `healthcare-emr-patterns`
- `healthcare-eval-harness`
- `team-agent-orchestration`
- `team-builder`
- `workspace-surface-audit`

Preuve : `node -e` avec la regex exacte de `scanner.ts:40` → ces 9 retournent `(FRONTMATTER NOT PARSED)`, contre `PARSED` pour `orch-pipeline`/`security-scan`.

### 2. Citation non conforme (3 fichiers, sous-ensemble du #1)
Remplacer `<!-- source: affaan-m/ecc skills/<slug>/SKILL.md (MIT), maintainer-safe rewrite ... -->` par la forme canonique requise par le brief et CLAUDE.md §9.bis :
`<!-- pattern from affaan-m/ecc skills/<slug>/SKILL.md (...) -->`
- `team-agent-orchestration`
- `team-builder`
- `workspace-surface-audit`

### 3. Header Process (1 fichier)
`workspace-surface-audit` : renommer `## Audit Process` → `## Process` (ou `## Process — Audit`), pour respecter le contrôle §12 mécanique. La section elle-même (ligne 65) est correcte et substantielle, c'est uniquement le titre.

---

## Note

Aucune fuite de secret, aucun import SDK interdit, ledger et rejets impeccables, et la qualité de fond (boost riche + maintainer-safe) est au rendez-vous sur l'échantillon. Les corrections sont purement mécaniques (placement de commentaire + 1 renommage de titre) mais le défaut frontmatter est fonctionnellement bloquant : il rend 9 skills sur 23 inexploitables par le router. Une fois les 3 corrections appliquées et re-vérifiées (ligne 1 == `---` sur les 23, `pattern from` sur les 23, `## Process` présent sur les 23), ce lot passera en **PASS**.

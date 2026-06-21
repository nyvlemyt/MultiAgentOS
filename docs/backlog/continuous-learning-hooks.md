# Backlog — Pont d'apprentissage continu (hooks de cycle de vie mémoire)

**Quand** : Phase 4 / 4.5 (mémoire) — c'est le **pont §13 ⇄ P4**. **Valeur** : structurante (anti-oubli : le savoir d'exécution remonte dans le second cerveau au lieu de se perdre à chaque compaction/fin de session). **Statut** : distillation captée, hooks à spécifier avant de coder. **Source** : `docs/knowledge/continuous-learning-and-memory-lifecycle.md` (distillé 2026-06-21, ECC, MIT) + CLAUDE.md §13 (learning bootstrap) + §8 (Memory Keeper seul rédacteur).

## L'idée distillée

Un cycle d'apprentissage continu en 4 temps, branché sur les **events de hooks Claude Code** (cf. `claude-code-context-and-modes.md §6` — 9 events) :

1. **SessionStart** → injecter un **pack mémoire borné** (≤ plafond §12 : ≤5 items globaux/mission) — pas de dump.
2. **PreCompact + SessionEnd** → **flush** des apprentissages de la session en `MemoryProposal` (avant que la compaction/fermeture ne les efface).
3. **Observer background** → score les propositions (signal-density test, §12).
4. **Promote** → l'item franchit le seuil → mémoire (`data/memory/` via Memory Keeper) **puis**, si c'est un savoir réutilisable et stable, skill froid via `promoteSkill` (le seam de la bibliothèque-arsenal existe déjà, cf. ADR 0005 + `packages/skills/src/scanner.ts`).

## Pourquoi pas maintenant / ce qu'il faut trancher d'abord

- **Phase** : c'est P4 (mémoire reliée), pas la campagne harvest. Carte, pas code (CLAUDE.md §13 phase discipline).
- **Garde-fous à respecter** : Memory Keeper **seul** à écrire dans `data/memory/` (§8) → les hooks **proposent** (`MemoryProposal`), ils n'écrivent pas. Plafond ≤5 items globaux/call (§12). Local-first + subscription-only (§11) : l'observer background ne doit pas consommer de quota PAYG ; scoring **déterministe** d'abord (signal-density), pas un 2ᵉ LLM.
- **Question ouverte** : où vivent les hooks MAOS ? Claude Code expose `SessionStart/PreCompact/SessionEnd/Stop/SubagentStop` (settings.json) — mais MAOS a son **propre** worker/dispatcher. Décider : hooks Claude Code (settings.json, niveau harness) **vs** events internes du worker (cycle de mission). Probablement **les deux** : harness pour les sessions de build de MAOS, worker pour les missions runtime des projets enfants.

## Lien avec le pont de persistance existant

Ce cycle est le **versant runtime** du pont de persistance déjà acté pour la Phase 4 (seed depuis `docs/knowledge/` + `vibeflow/INDEX.md`, cf. [`second-brain-cross-project.md`](second-brain-cross-project.md) §Pont de persistance). Le seed remplit le store au build ; **ce cycle l'alimente en continu à l'exécution**. Les deux convergent vers `data/memory/_global/` sans le dériver. La spirale d'enrichissement est décrite dans [`../workflows/knowledge-bootstrap.md`](../workflows/knowledge-bootstrap.md) §5.bis.

## Candidats MCP mémoire (à intake-auditer en P4, ne pas adopter ici)

Pour le store/recall sous-jacent (cf. `mcp-connector-policy-and-catalog.md`) : **longhand** (capture *verbatim* lossless de `~/.claude/projects/*.jsonl` avant rotation — exactement le « flush avant effacement » de l'étape 2), **squish** (local-first, SQLite, recall 1-20 ms, pas de 2ᵉ LLM — colle au scoring déterministe), **omega-memory** (KG + multi-agent). Tous local-first/opt-in ; intake-audit chacun avant adoption.

## Action

1. **Pré-vol P4** : intake-audit longhand / squish / omega-memory + le connecteur Obsidian (mcp-obsidian) → choisir le store.
2. **Spécifier les hooks** (cet item) : mapper chaque étape sur un event concret (harness settings.json et/ou worker), définir le format `MemoryProposal`, le scoring déterministe, le seuil de promotion.
3. **Candidat ADR** : « Cycle d'apprentissage continu (hooks → proposal → promote) » — trancher harness-hooks vs worker-events, et le seuil mémoire→skill. À écrire avant de coder.
4. **DoD du pont** : réutiliser le test d'acceptation de [`second-brain-cross-project.md`](second-brain-cross-project.md) (idempotence, traçabilité, récupérabilité, anti-régression, cap respecté).

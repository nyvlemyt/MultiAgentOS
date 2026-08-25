# Backlog — contrat de tâche enrichi : `nature` + `escalateWhen` (C5 + C13 fusionnées)

**Statut** : À FAIRE — lot 2, Phase 9, **après** `contrat-rapport-mission.md`.
**Source** : `docs/audits/otakugo/A2-patterns-cockpit.md` (P7 et P17 — deux cartes à l'origine).
**Décision d'intake** : `adapt_now` · T1, **fusion assumée** — `docs/intake/2026-08-14-cartes-a2-otakugo.md` §2 et §3.

## Pourquoi une seule carte

A2 proposait deux cartes. La lecture du code montre qu'elles ajoutent chacune **un champ au même
type** (`PlannerTask`), passent par le **même skill planner**, la **même résolution dispatch** et le
**même fichier de tests**. Les garder séparées, c'est payer deux fois la même migration de contrat
et risquer deux formes divergentes du même objet.

## Les deux problèmes, un seul endroit

**1 — L'agent ne sait pas quand te demander.** `escalate_when` existe au niveau des **fiches
d'agents** (`packages/agents/fiches/*.md:35-41`) — « ce type d'agent escalade dans ces cas-là ».
Mais les conditions **propres à une mission** (« si deux variantes sont indiscernables, ne tranche
pas ») n'ont aucun véhicule. L'exécutant brode ou bloque au hasard.

**2 — Le choix du modèle ignore l'effort de tête.** Trois étages choisissent un modèle et aucun
n'encode la charge cognitive :
- `.claude/skills/mas-skill-router/SKILL.md:27-29` route **par risque seul** (high→opus,
  medium→sonnet, low→haiku) ;
- `config/model-routing.json` route par domaine → fournisseur ;
- et le dispatch réel retombe sur le défaut projet : `packages/agents/src/dispatch.ts:597` et `:774`
  → `proj?.defaultModel ?? 'claude-haiku-4-5'`.

Résultat : un **arbitrage** ou une **synthèse multi-sources** classé `risk: low` part sur haiku.
Or trancher entre deux options n'a rien à voir avec renommer une variable, même quand les deux sont
sans danger. Le cockpit OtakuGO route par **nature** sur ses 34 fiches, avec le garde-fou inverse :
jamais le gros modèle pour du mécanique low-risk.

## Ce que MAOS a déjà (vérifié 2026-08-14)

- `packages/core/src/llm.ts:112-121` — `PlannerTask` = `agentHint · skillsHint · dependsOn ·
  budgetTokens · risk`. Ni `nature`, ni `escalateWhen`.
- `packages/db/src/schema.ts:372` — `agentOverrides.model` fournit déjà une couche d'override
  par projet, à respecter dans la résolution.
- `tasks.status` porte déjà `needs_validation` et `blocked` ; `validations` porte déjà la question
  posée à l'humain. Rien à créer de ce côté.

## Le travail

1. **Deux champs sur `PlannerTask`** :
   - `nature: 'arbitrage-synthese' | 'implementation' | 'mecanique'` — union littérale, pas d'`enum` (§7) ;
   - `escalateWhen: string[]` — conditions **observables et testables** exigées, pas des intentions floues.
   Émis par `mas-mission-planner` ; le skill documente les deux dans son schéma de sortie.
2. **Résolution du modèle** dans `mas-skill-router` + dispatch :
   `max(modèle-par-risque, modèle-par-nature)`, **puis** override projet.
   Garde-fou conservé : jamais le gros modèle pour une tâche `mecanique` low-risk.
3. **Injection dans le prompt de l'exécutant** par le worker : les `escalateWhen` de la tâche font
   partie du brief, pas d'une doctrine générale.
4. **Comportement au déclenchement** : condition matée → tâche `needs_validation` + une entrée
   `validations` portant **une** question précise. Les tâches indépendantes continuent.
5. **Résidu F8 d'A2** : graver la discipline sous-agents du cockpit dans les fiches Tier A
   exécutantes — profondeur 1 (le fan-out en un tour reste couvert par
   `superpowers:dispatching-parallel-agents`).

## Critère de sortie (binaire)

- [ ] `nature=arbitrage-synthese` + `risk:low` → modèle **>** haiku (test unitaire).
- [ ] `nature=mecanique` + `risk:low` → reste haiku (test unitaire).
- [ ] `risk:high` → reste opus **quelle que soit** la nature (test unitaire).
- [ ] Une mission plannée porte ≥ 1 `escalateWhen` ; la simulation d'un match bascule la tâche en
      `needs_validation` avec la question posée, **et les tâches indépendantes continuent** (test).
- [ ] 5 checks verts (`pnpm -r test` · lint · build · smoke · Sonar exit 0).

# Intake Audit — Template universel (manuel, en attendant le skill)

**Quoi.** Procédure réutilisable pour décider d'intégrer **n'importe quel ajout** à MultiAgentOS : ressource, skill, agent, MCP, idée, pattern mémoire, principe, doc, inspiration UI. Généralise [`phase3-resource-audit-master-prompt.md`](phase3-resource-audit-master-prompt.md) (qui était figé sur le lot Notion / Phase 3).

**Statut.** Version manuelle. La version automatisée = **skill `intake-audit`**, à construire fin Phase 4 / pendant Phase 4.5 — voir [`../backlog/intake-audit-skill.md`](../backlog/intake-audit-skill.md).

**Quand le lancer.** À chaque fois qu'on envisage d'ajouter quelque chose au projet — pendant la construction *ou* plus tard en prod. Un item = un passage = un dossier.

**Règle d'or.** Le but n'est **pas** d'intégrer. Le but est de **décider**. Un audit qui ne sait pas dire `reject` est cassé (voir §KILL).

---

## Sortie attendue : 1 dossier d'intake par item

Fichier : `docs/intake/<YYYY-MM-DD>-<slug>.md`. Une fois la version Phase 4.5 câblée, ce dossier alimente l'**Ideas Inbox** + le **Decision Log** et se convertit en mission. En attendant, c'est un markdown manuel. Squelette en bas de ce fichier.

---

## Étape 0 — Garde-fous projet (hard constraints à ne jamais violer)

Avant toute analyse, rappeler les contraintes (sinon l'audit dérive vers "installons tout") :

- Local-first, single-user, cockpit de missions — **pas** un chat UI.
- Projets externes référencés par chemin absolu — jamais copiés/clonés dans ce repo.
- **Subscription only.** PAYG Anthropic API interdit (CLAUDE.md §11). Toute clé API requise → drapeau rouge automatique.
- LLM uniquement via `packages/core/src/llm.ts`. Pas de client SDK dispersé.
- Tier A orchestre, Tier B exécute, dispatcher = seul passage. Tier B n'appelle jamais Tier A.
- Memory Keeper = seul à écrire dans `data/memory/`.
- Skills : progressive disclosure (L1 summary → L2 body → L3 references). Max 7 tools/agent.
- Actions risquées (destructif, secrets, paiement, envoi externe, force push, write cross-project, network non listé) = validation humaine (CLAUDE.md §5).
- Pas de framework/service majeur sans ADR (`docs/decisions/`).
- Discipline de phase : ne pas faire entrer du scope d'une phase future par la porte de derrière.

Un item qui viole une de ces contraintes est `reject` **ou** `adapt_now` (version locale réduite). Jamais `implement_now` tel quel.

---

## Étape 1 — Identité

- **Quoi exactement** : skill / agent / MCP / prompt / pattern mémoire / inspiration UI / research / repo / doc / principe / idée.
- **Source + lien**.
- **Date / signal de récence**. Absente → le dire.
- **Obsolescence** : low / medium / high. (Ex : tout ce qui dépend du billing pré-15-juin-2026 = à risque.)
- **Résumé en 3-6 bullets** : qu'est-ce que ça fait, concrètement.

## Étape 2 — Fit projet

- En quoi ça rend MultiAgentOS **plus** : pratique / autonome / précis / rapide / beau / sûr / mémoriel / extensible / moins cher en tokens. Être concret, relier à un fichier ou une phase.
- Quelle surface ça touche : agent fiche / skill / registry / dispatcher / memory / context manager / permissions / UI / docs / ADR / tests.
- Doublon ? Déjà couvert par un fichier existant (`docs/knowledge/`, un skill `mas-*`, un agent) ? Si oui → `reject` (duplicate) ou `adapt_now` (fusion).

## Étape 3 — Coûts (les trois, pas juste l'install)

- **Coût d'install / mise en place** : effort + tokens estimés.
- **Coût de maintenance** : qui le garde à jour, à quelle fréquence, dérive possible.
- **Coût de retrait** : si on se trompe, c'est réversible facilement ? Un skill isolé = oui. Un framework qui s'enracine = non. **La réversibilité est un critère de décision, pas un détail.**

## Étape 4 — Scoring (0–5 chacun)

`project_fit` · `token_efficiency` · `safety` · `implementation_effort` · `evidence_maturity` · `user_value` · `phase_compatibility`

(Reprendre les axes du master-prompt — comparables d'un audit à l'autre.)

## Étape 5 — KILL criteria (le veto, indépendant du score)

Un seul suffit pour forcer `reject` ou `adapt_now`, même avec un bon score :

- Requiert une clé API payante / un mode PAYG → **reject** (§11).
- Peut exécuter du code et n'a pas passé l'audit sécu → bloqué jusqu'à audit (cf. `skill-install-policy.md`).
- Touche email / finance / paiement / envoi externe / deploy / secrets / force push → Security Reviewer obligatoire avant tout.
- Embarque un framework lourd / beaucoup de dépendances → extraire le **principe**, backloguer l'implémentation (cf. `frameworks-to-mine.md`).
- Hors phase courante → `backlog_next` avec phase cible.
- Preuve / maturité faible → `watch`, pas `implement_now`.

## Étape 6 — Décision (enum unique)

`implement_now` · `adapt_now` · `backlog_next` · `watch` · `reject`

+ justification 2-4 lignes reliée à une contrainte ou un fichier.

## Étape 7 — Appropriation & amélioration (si retenu)

Ne pas copier tel quel. Pour `implement_now` / `adapt_now` :

- **Comment se l'approprier** : quelle est la version *MultiAgentOS* de cette chose.
- **Comment l'améliorer / la rendre moins chère sans perdre en perf** : summary L1 plutôt que body complet ? mock LLM ? cache ? scoring déterministe sans LLM ?
- **Adapter l'item OU adapter le projet** : trancher lequel bouge.

## Étape 8 — Plan d'intégration (si retenu)

- Phase cible.
- Fichiers probables touchés.
- Agents Tier A impliqués / Tier B appelés / skills requises.
- Budget tokens estimé.
- Tests / vérifications (DoD binaire).
- Validation humaine requise ? (oui pour tout risk high/blocking.)
- **Ce qu'il ne faut PAS faire.**
- La **mise en place réutilise le mission lifecycle existant** (planner → dispatcher → reviewer → sec-reviewer). L'audit décide ; il ne réimplémente pas l'exécution.

## Étape 9 — Ré-audit

- **Date de péremption / ré-évaluation** : les assets pourrissent. Donner une date ou une condition de re-check (ex : "ré-auditer après bascule billing 15 juin", "re-check si le repo source > 6 mois sans commit").

---

## Squelette de dossier d'intake (copier dans `docs/intake/<date>-<slug>.md`)

```markdown
# Intake — <nom> (<date>)

- **Type** : <skill|agent|mcp|prompt|memory|ui|research|repo|doc|principe|idée>
- **Source** : <lien>
- **Récence / obsolescence** : <date> / <low|medium|high>
- **Résumé** : <3-6 bullets>

## Fit
<surface touchée, doublon ?, en quoi ça améliore le projet>

## Coûts
- Install : <effort + tokens>
- Maintenance : <fréquence, dérive>
- Retrait : <réversible ? oui/non + pourquoi>

## Score
project_fit _ / token_efficiency _ / safety _ / implementation_effort _ / evidence_maturity _ / user_value _ / phase_compatibility _

## KILL check
<aucun veto | veto déclenché : lequel>

## Décision
**<implement_now|adapt_now|backlog_next|watch|reject>** — <justif 2-4 lignes + fichier/contrainte>

## Appropriation (si retenu)
<version MAS, amélioration, moins cher, adapter item vs projet>

## Plan (si retenu)
- Phase : <>
- Fichiers : <>
- Agents/skills : <>
- Tokens : <>
- Tests / DoD : <>
- Validation humaine : <oui/non>
- Ne PAS faire : <>

## Ré-audit
<date ou condition>
```

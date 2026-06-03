# Knowledge Bootstrap — apprendre avant de construire (doctrine de build)

**Quoi.** Comment MultiAgentOS résout son paradoxe de bootstrap : l'outil censé créer des projets parfaits doit lui-même être créé avec le meilleur savoir possible — pas en apprenant à la fin.

**Pourquoi ce fichier.** Demande utilisateur (2026-06-03) : « je veux que tu sois op, le meilleur possible dès maintenant ; ce qui plus tard servira dans le projet multiAgent doit servir à le créer ; même ce qui a été fait depuis le début n'est pas forcément optimal — or c'est la base qui doit créer des projets parfaits. »

**Statut.** Doctrine de build (méta : comment on construit). Distincte de `docs/knowledge/project-doctrine.md` (doctrine runtime : comment l'app se comporte).

---

## 1. Le paradoxe

> Si on n'intègre le savoir (les ressources d'apprentissage) qu'à la fin — après avoir construit la mémoire en Phase 4 — alors tout ce qu'on a construit avant (Phases 0–3) est fait sans ce savoir, donc sous-optimal. La base du projet serait bancale.

## 2. La résolution : 2 consommateurs du savoir, 2 timings, 2 mécanismes

Le savoir n'a pas un seul client. Il en a deux. Les confondre crée le paradoxe ; les séparer le dissout.

| | Client | Quand | Mécanisme / support |
|---|--------|-------|---------------------|
| **Build-time** | **Claude** qui construit MultiAgentOS | **maintenant**, en continu, avant chaque phase | `docs/knowledge/` + `CLAUDE.md §12` + skills `mas-*` |
| **Runtime** | **MultiAgentOS** (l'app) qui fait tourner des missions | Phase 4+ | le « second cerveau » mémoire (code app) |

**Conséquence clé** : « traiter les ressources à la fin » ne concerne que le **runtime** (construire la feature). Ça n'oblige **pas** Claude à apprendre tard. La distillation du savoir dans `docs/knowledge/` est du markdown — aucune dépendance de phase, faisable maintenant.

→ **On découple.** Le savoir build-time se distille en avance ; le second cerveau runtime réutilise la même source plus tard.

## 3. La règle : apprentissage juste-à-temps **par phase** (pas tout d'un coup)

Distiller 40+ ressources d'un bloc = cher (budget ~20€, cf. `user_token-budget`) et inutile (pas tout pertinent à la phase courante). Mauvais réglage.

> **Pré-vol par phase.** Avant de construire la phase N :
> 1. Intake-audit ciblé des ressources pertinentes pour N (méthode : [`intake-audit-template.md`](intake-audit-template.md)).
> 2. Distiller le retenu dans `docs/knowledge/` (et CLAUDE.md / skills si règle).
> 3. **Ensuite** construire la phase N.

Les ressources de `docs/ressources/` sont un **input par phase**, pas un bloc de fin. Et ce pré-vol applique l'intake-audit **à nous-mêmes** : le projet se bootstrap avec sa propre méthode (récursion saine).

### Mapping indicatif ressource → phase (à raffiner au pré-vol de chaque phase)

| Thème ressources `docs/ressources/` | Phase qui en a besoin |
|--------------------------------------|------------------------|
| Hooks Claude Code (8 hooks, 3 hooks) | Phase 6 (risky gates) — mais hooks build-time utiles dès maintenant |
| Mémoire (5 registres, consolidation, registre learning, sommaire) | Phase 4 + second cerveau |
| Gouvernance / agent-auditeur / 4 piliers / modes audit | Phase 3.5 (Quality Controller) + self-audit |
| Skill ou Agent (test binaire), Orchestrator-Workers | Phase 3 / 5 |
| Architecture du contexte, portabilité projet | transversal build-time |
| Modes Claude Code, features natives vs skills | build-time (maintenant) |
| DURCIR (capitaliser les règles) | self-audit (§5) |

## 4. « Ce qui servira dans le projet doit servir à le créer »

Principe directeur : tout artefact pensé pour le runtime (pattern mémoire, méthode d'audit, scoring, registre de décisions) est **d'abord utilisé en build-time sur MultiAgentOS lui-même**, puis promu en feature runtime quand sa phase arrive. On ne théorise pas une capacité runtime sans l'avoir éprouvée sur soi.

Exemples déjà en place :
- `intake-audit-template.md` (méthode) → s'applique à nos propres ajouts maintenant, devient skill runtime en Phase 4.5.
- Decision Log (Phase 4.5) → on tient déjà nos décisions dans `docs/decisions/` (ADRs) et `docs/backlog/`.
- Memory Keeper / 5 registres → la mémoire auto de Claude sur ce repo en est le banc d'essai.

## 5. Self-audit / durcissement (l'inward, pas que les ajouts)

L'intake-audit regarde les **nouveaux** ajouts. Il faut aussi ré-auditer **l'existant** — car « ce qui a été fait depuis le début n'est pas forcément optimal ».

> **Cadence de durcissement.** À chaque pré-vol de phase (et au minimum à chaque gate de phase) : ré-auditer les artefacts de base déjà construits (`CLAUDE.md`, `AGENTS.md`, fiches Tier A, skills `mas-*`, ADRs) contre le meilleur savoir courant. Corriger ou backloguer la dette.

Source à distiller pour formaliser ça : `docs/ressources/DURCIR gouverner ses règles capitalisées dans la durée.pdf` + `Le Registre Learning Records...` + `Le rituel de consolidation memoire...`.

## 5.bis La spirale d'enrichissement & le pont de persistance (anti-oubli)

Le bootstrap n'est pas linéaire, c'est une **spirale** : chaque passe nourrit la suivante, et chaque tour fait monter l'ensemble d'un cran.

```
Passe 0 : Ressources ──distille──▶ docs/knowledge/ (savoir build-time)
Passe 1 : on construit les MODULES avec ce savoir (skills, agents, skill intake-audit)
Passe 2 : le skill intake-audit ──ré-audite──▶ savoir + modules existants (durcissement, §5)
Passe 3 : on construit la MÉMOIRE (Phase 4) ⮕ SEMÉE depuis docs/knowledge/  (LE PONT)
Passe 4+: missions ──produisent──▶ mémoire ──Memory Keeper──▶ promue ──enrichit──▶ modules ──▶ retour Passe 1
```

**Garantie « rien d'appris n'est oublié »** = 3 couches durables + 1 pont explicite :

| Couche | Rôle | Garantie |
|--------|------|----------|
| `vibeflow/INDEX.md` | Catalogue : chaque ressource + statut | Rien hors radar ; non distillé = marqué |
| `docs/knowledge/` | Savoir distillé (build-time) | Durable, versionné git |
| Mémoire Phase 4 (second cerveau) | Savoir runtime cross-projet | Durable en base |
| **🌉 Pont** | Phase 4 **sème** sa mémoire **depuis** `docs/knowledge/` | Sans lui, build-time et runtime divergent |

**Exigence ferme (sinon le savoir se perd)** : la construction de la mémoire (Phase 4) doit prendre `docs/knowledge/` (+ `vibeflow/INDEX.md`) comme **corpus de seed**. Le savoir distillé maintenant remonte alors automatiquement dans le second cerveau runtime. Le Memory Keeper (seul écrivain) entretient ensuite la boucle. → exigence portée par [`../backlog/second-brain-cross-project.md`](../backlog/second-brain-cross-project.md).

## 6. Ce qui change concrètement (proposition — requiert green light)

Cette doctrine implique un **resequencing du ROADMAP** : ajouter un **pré-vol d'apprentissage par phase** en tête de chaque phase, au lieu d'un bloc « ressources » en fin de parcours. Changement de discipline de phase → **validation utilisateur explicite requise** avant d'éditer `ROADMAP.md` (cf. `feedback_phase-gates`).

Voir aussi : [`../backlog/second-brain-cross-project.md`](../backlog/second-brain-cross-project.md) (le second cerveau runtime cross-projet) et [`../backlog/intake-audit-skill.md`](../backlog/intake-audit-skill.md).

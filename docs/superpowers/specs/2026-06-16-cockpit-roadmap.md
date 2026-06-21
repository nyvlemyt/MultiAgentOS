# Cockpit interconnecté — roadmap consolidée

Date: 2026-06-16 · Statut: plan · **MAJ 2026-06-18 (re-séquencé par le commandant)**

## ⟳ Ordre maître 2026-06-18 (AUTORITÉ — supersede §4/§5 ci-dessous)

Suite à la Revue de Commandant (`docs/learning/2026-06-18/commander-review.md`). La séquence
ci-dessous fait foi ; les §4/§5 d'origine restent comme contexte de faisabilité.

| # | Phase | Contenu | Dépend |
|---|-------|---------|--------|
| **P1** | **Compétences** (ECC + cybersec) — *priorité absolue* | Harvest → install → apprendre → **tester pour de vrai**. `docs/intake/2026-06-16-ecc-harvest/` (PLAN+KICKOFF prêts). Attended, budget levé. | — |
| **P2** | **Maquette d'app** (Figma-like via **MCP**) | Audit design **+ disposition pages/éléments** ; trouver le MCP maquette ; concevoir le plus beau design intégrant tous nos composants/idées. | P1 (idées de skills/agents à exposer) |
| **P3** | **Mise en place** | Modifier pages + ajouter composants selon P2. Inclut **espace chat type app Claude** (page dédiée, sélecteur modèle/agent, réf *mammouth.ia*) = **Spec B élargie**. | P2 |
| **P4** | **Mémoire reliée** | Finaliser le second cerveau : MCPs, connecteur **Obsidian** (chercher le meilleur), **qmd** (github.com/tobi/qmD), registre de liens. | P1 |
| **P5** | **Axes restants** | manager projet · export rapports · stats agent cross-mission · **vrai LLM** (capstone) — écrits en phases. | continu |

**Anti-oubli :** tout item dit en revue → mémoire projet + `docs/knowledge/` (jamais jeté).
**Itératif assumé :** les phases ouvertes (#30, #31) peuvent être poussées/mergées en sachant
qu'on y reviendra via la boucle de revue (`docs/workflows/commander-feedback-loop.md`).

---


Réconcilie : la nouvelle vision (mission = dashboard + chat + rapport final, tout relié) ·
le backlog de session (manager projet, export fichiers, vrai LLM) · Spec A (Agent Control
Panel) · Spec B (Rich Composer) · la campagne ECC harvest.

## 1. Modèle de données cible (le "tout est relié")

Faisable **sur le schéma actuel** (relations + agrégation + UI ; pas de refonte DB lourde).

- **Projet** = manager + agents (instances) + missions + rapports + mémoire/index + dashboard suivi.
- **Mission** (= une phase) = chat dédié + plusieurs agents + plusieurs rapports (1/tâche) +
  un **index d'avancement** (étapes faites, où) + un **rapport final** consommé par le projet.
- **Agent** = travaille dans plusieurs missions → plusieurs rapports → stats (coût total,
  évolution, succès) + liens croisés.

Tables : on a déjà `conversations` (multi-thread), `reports` (task/mission/project, auteur),
`missions`/`tasks`/`events`/`memory`. Ajouts mineurs :
- `conversations.scope` += **`mission`** (projectId+missionId) → chat par mission. (text, pas de migration lourde.)
- `reports` kind **`mission`** = rapport final agrégé (déjà supporté).
- Spec A : table **`agent_overrides`** (édition agent par projet) — déjà spécifiée.
- "Index d'avancement" = vue dérivée (tasks + leurs rapports + statut) → pas de table, une requête.

## 2. Axes d'amélioration (le gros cockpit)

1. **Mission-dashboard** : la page mission devient un cockpit de suivi — chat mission (gère
   les tâches, pioche agents/skills intégrés ou à intégrer), index des étapes, rapports par
   tâche, agents impliqués, **rapport final** (what/why/how/tests + index) → lisible par le projet.
2. **Manager projet intégré** à la page projet : agrège les rapports finaux de mission en un
   **rapport d'état projet** (stocké/affiché), met à jour index/mémoire.
3. **Agent Control Panel (Spec A)** : éditer agent (modèle, autonomie, budget, **skills**),
   instance-projet (DB override) vs fiche de base (fichier disque, gated). = le "créer/éditer
   agents + skills" + permet au chat mission de **piocher/intégrer** des agents/skills.
4. **Rich Composer (Spec B)** : composer `/`commands + `@`fichiers + modèle/effort + estim
   tokens — upgrade le composer partagé → profite à TOUS les chats (manager, mission, agent).
5. **Stats agent cross-mission** : agrégation reports/events par agent (coût, évolution).
6. **Export fichiers rapports** (.md/.html dans le projet) pour partage collaborateurs.
7. **Vrai LLM** (capstone) : tout devient réel (chats, rapports, exécution).

## 3. Faisabilité

Élevée pour 1–6 (UI + relations + agrégation, données mockées OK). 7 = gros (SDK + exécution
+ budget). L'"index pour que l'IA sache ce qui est fait sans tout relire" = exactement le
rapport machine (vue IA) + l'index d'avancement de mission → on l'a amorcé.

## 4. Ordre recommandé + parallélisation

**Track 1 — Cockpit UI (série, composants partagés) :**
1. Merge #29 (FR + rapports) ← en cours.
2. **Mission-dashboard + chat mission + rapport final** (le top de ta demande).
3. **Manager projet** sur la page projet + rapport d'état projet (agrège les finaux).
4. **Rich Composer (Spec B)** — upgrade le composer partagé (après que le chat mission existe).
5. **Export fichiers** rapports.

**Track 2 — Agent Control Panel (Spec A) — PARALLÉLISABLE** (pages agents, table
`agent_overrides` ; chevauchement mince = `ConversationPanel`). À faire **avant/avec** la
feature "piocher des agents/skills" du chat mission (qui en dépend).

**Track 3 — ECC harvest — PARALLÉLISABLE et orthogonal** (contenu : `packages/skills/library`,
`docs/rules`, fiches Tier B ; aucune collision avec l'UI). MAIS : multi-sessions, **consomme
du quota réel** (budget lean ~20 € intentionnellement levé pour cette campagne), **attended**.
Modules : `mas-mission-planner` · `dispatching-parallel-agents` · `intake-audit` · `skill-creator`
· `mas-reviewer`/`mas-sec-reviewer`. Lançable via `KICKOFF-PROMPT.md` dans une session dédiée.

**Track 4 — Vrai LLM (capstone)** — après que l'UI cockpit est complète ; gros, budget-gated, dernier.

### Dépendances clés
- Mission-chat "intègre des agents/skills" → dépend de **Spec A** (overrides + skill allowlist)
  et idéalement de la **library ECC** (plus de skills à piocher). Donc Spec A avant cette sous-feature.
- Rich Composer touche le composer partagé → **après** le chat mission (sinon conflits).
- ECC = contenu, peut tourner en fond dès qu'une session attended + budget est dispo.

## 5. Reco concrète d'enchaînement
1. Merge #29.
2. **Track 1.2 (mission-dashboard + chat + rapport final)** ← prochain build principal.
3. En **parallèle** : **Track 2 (Agent Control Panel)** dans une branche séparée (peu de collision).
4. Puis Track 1.3 (manager projet) → 1.4 (rich composer) → 1.5 (export).
5. **ECC harvest** = session(s) dédiée(s) attended quand tu veux dépenser du quota (orthogonal, lançable en parallèle via KICKOFF).
6. **Vrai LLM** en capstone.

## 6. Modules mobilisés
`mas-mission-planner` (décompo DAG), `superpowers:writing-plans` (plans par feature),
`dispatching-parallel-agents` (ECC + tracks parallèles), `intake-audit` (ECC), `skill-creator`
(boost skills), `frontend-design`/`ui-ux-pro-max` (UI cockpit), `mas-reviewer`/`mas-sec-reviewer`
(gates), §7 5-checks + Sonar à chaque PR.

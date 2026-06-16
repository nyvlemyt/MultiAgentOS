# Mission Dashboard — Design (contract for the Doer)

Date: 2026-06-16 · Statut: spec (contrat de build) · Phase 0 mock (pas de live LLM)

## Problème

`/missions/[id]` est une page statique (DAG + diff placeholder + trace). L'utilisateur veut
en faire un **cockpit de mission** : on y gère la mission, on y parle aux agents, on suit
chaque étape, et on produit un **rapport final** que le projet/manager peut lire.

## But (ce round = UI + seams ; contenu réel quand le LLM sera branché)

`/missions/[id]` devient un dashboard avec, en plus de l'en-tête existant (FSM, actions,
deadline, budget) :

1. **Chat de mission** — conversation dédiée à la mission (gère les tâches, pioche des
   agents/skills). Réutilise `ConversationPanel`. Nouveau scope conversation **`mission`**
   (projectId + missionId). Réponses scriptées (action `sendMissionMessage`, même seam que
   manager/agent). Multi-thread comme le reste (réutilise `listConversations`/`createConversation`).
2. **Index d'avancement** — pour chaque tâche : titre · agent · statut · lien vers son rapport
   (s'il existe). C'est l'"index pour que l'IA sache ce qui est fait, où, sans tout relire".
   Logique pure `missionProgress(tasks, reports)` → testable (TDD).
3. **Rapports par tâche** — déjà en place (liste → page rapport dédiée). Garder.
4. **Agents impliqués** — déduits des `tasks.agentId` ; chaque agent → lien vers sa conv projet
   (`/projects/[slug]/agents/[agentId]`).
5. **Rapport final de mission** — bouton "Générer le rapport final" → server action qui crée un
   `reports` `kind='mission'` agrégeant les rapports de tâche (what/why/how/tests + index des
   étapes). Affiché + lien page rapport. **SEAM** : le *format/contenu* du rapport final sera
   retravaillé plus tard (skills/connaissances + intégration ECC) — ce round produit une
   version mock structurée + l'endroit où le LLM/agrégateur réel se branchera. Ne pas
   sur-investir le contenu ; investir la structure + le stockage + l'affichage + le lien.

## Données (ajouts mineurs, pas de refonte)

- `conversations.scope` accepte **`mission`** (champ text ; ajouter la valeur à l'enum applicatif,
  pas de migration lourde). Helpers `conversations.ts` déjà génériques (scope + projectId + agentId
  → ajouter missionId au where ; OU réutiliser projectId + stocker missionId dans agentId? NON :
  ajouter une colonne `missionId` à conversations via migration si besoin — préférer une migration
  propre `0010` ajoutant `conversations.mission_id` nullable + index).
- `reports` `kind='mission'` déjà supporté ; le rapport final s'y range (missionId set, agentId =
  null ou 'manager-mission').
- `missionProgress()` = pur (tasks + reports → {done, total, steps:[{task, status, reportId?}]}).

## Vérification
CLAUDE.md §7 : `pnpm -r test · lint · build · smoke · Sonar exit 0 + gate OK`. TDD sur
`missionProgress` et la migration (chain guard). Smoke : `/missions/mission_seed_001` rend
le dashboard (garder l'`heading` attendu). i18n FR (langue primaire). PR EN DRAFT.

## Hors scope (round suivant / autres phases)
- Format final du rapport (enrichi par ECC + skills) — seam seulement ici.
- "Piocher/intégrer des agents/skills" depuis le chat → dépend de **Spec A** (Agent Control Panel).
- Rich composer (`/`, `@`, modèle) → **Spec B**.
- Vrai LLM.

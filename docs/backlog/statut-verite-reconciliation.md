# Backlog — statut vérité + contrat d'alertes (C1 + C12)

**Statut** : LIVRÉ (2026-08-17, branche `phase9/statut-verite-alertes`, 14 commits) — noyau lot 1, Phase 9.
**Source** : `docs/audits/otakugo/A2-patterns-cockpit.md` (P1, P15).
**Décision d'intake** : `implement_now` · T1 — `docs/intake/2026-08-14-cartes-a2-otakugo.md` §3.
**Précurseur** : `docs/backlog/mission-dashboard-branch-closed.md` (le besoin y était déjà tracé).

## Le problème

`missions.status` (`packages/db/src/schema.ts:79-91`) est écrit par la machine à états et **jamais
confronté à la réalité**. Un worker qui meurt en plein `executing` laisse une mission marquée « en
cours » à vie. Un merge fait à la main dans le projet externe reste invisible. Le cockpit affiche
alors un état qui ment, et toute décision prise dessus est prise sur une fausse information.

Le cockpit OtakuGO a résolu ça sur 34 missions : le statut stocké n'est qu'un **déclaré**, la vérité
est **recalculée depuis les faits**, et l'écart s'affiche comme un badge « désynchronisé » avec sa raison.

## Ce que MAOS a déjà (vérifié 2026-08-14)

- `apps/web/lib/health.ts:23` — `computeProjectHealth` applique **exactement la doctrine visée** :
  calcul au moment de la lecture, aucune table, déterministe, `now: Date` injecté, zéro LLM.
- `events` est indexée `(missionId, createdAt)` (`schema.ts:200`) → **l'âge du dernier event est déjà
  un signal de vie interrogeable**. Aucun émetteur de heartbeat n'est nécessaire pour la v1.
- Surfaces d'état existantes, chacune rendue à sa façon : `health.ts`, `autopilot.ts` (`BudgetPause`),
  `components/BudgetPauseBanner.tsx`. Aucun type `Alert` partagé.

## Le travail

1. **Type `Alert`** (`apps/web/lib/`) : `{quoi, pourquoi, action, route, sévérité}`, tous non vides,
   validé Zod. Règle dure : **aucun fait ⇒ aucune alerte** (une donnée absente ne fabrique pas une
   alerte d'absence — `null ≠ zéro`).
2. **Migrer les 3 surfaces existantes** sur ce type (budget pause, validations pending, budget).
3. **`reconcileMissionStatus(facts, now)`** — fonction pure posée à côté de `computeProjectHealth`,
   mêmes règles. Faits v1, **tous lisibles en base aujourd'hui** : âge du dernier `events` de la
   mission · tâches `blocked` de la mission · validations `pending` · budget mission dépassé
   (`spentTokens ≥ budgetTokens`, et seulement si un plafond est déclaré).
   Sortie : `{declared, computed, desynced, reason}`.
4. **Badge « désynchronisé » + raison** dans l'UI missions, rendu via le type `Alert` (premier client neuf).
5. **Tests unitaires** de la machine à états, I/O stubée.

**Ce qu'on ne fait pas** : pas de heartbeat worker dédié (raffinement v2) ; pas de colonne de statut
calculé — le stocker recréerait exactement le mensonge qu'on corrige.

## Corrections de la carte (2026-08-14, avant plan d'implémentation)

Deux faits promis par la carte n'étaient **pas** disponibles au moment de la livrer. Corrigés ici
plutôt que découverts en cours de route.

### a) Le verdict de rapport dépend de C3, pas encore livrée

`reports` n'a **pas** de colonne `verdict` aujourd'hui (`schema.ts:344-360` = `humanMd/ai/diff`).
Cette colonne est le livrable n°2 de `docs/backlog/contrat-rapport-mission.md` (C3), séquencée
**après** C1+C12 (`docs/intake/2026-08-14-cartes-a2-otakugo.md` §4 : « C1+C12 → C3 → C10 → C9 → C4 »).
Le fait est donc retiré des faits v1. Deux conséquences, tenues :

- **Substitution honnête** : la famille « la mission ne va pas » est portée en v1 par les **tâches
  `blocked`** (`tasks.status = 'blocked'`, déjà en base) — c'est le même signal dans l'ordre strict
  de P1 (« tâche BLOCKED → BLOQUÉE »), sans dépendre de C3.
- **Couture typée, pas trou** : `MissionFacts.reportVerdict: 'PASS' | 'NEEDS_WORK' | 'BLOCK' | null`
  existe dès la v1 avec `null = fait absent`. La règle pure est écrite et testée maintenant ; seul le
  **collecteur** renvoie `null` en dur tant que la colonne n'existe pas. C3 branchera le collecteur
  sans rouvrir le contrat de la fonction. Un fait absent ne fabrique aucune alerte — c'est
  exactement la règle `null ≠ zéro`, appliquée à nous-mêmes.

### b) Le « ≤ 60 s » n'était pas tenable sans heartbeat

Les events sont émis aux **transitions de tâche** (`task_start`, `task_done` —
`packages/agents/src/dispatch.ts:384,690`), pas à chaque tick worker. Un appel LLM long laisse donc
légitimement la mission silencieuse plusieurs minutes : un seuil à 60 s produirait un « désynchronisé »
**faux** sur un worker vivant — précisément la fausse alerte que C12 existe pour interdire.

- Seuil v1 : `STALE_AFTER_MS = 10 min` (surchargeable par `MAS_MISSION_STALE_MS`).
- Le « ≤ 60 s » devient une promesse de **propagation** (le badge apparaît au rendu suivant une fois
  la vérité basculée), testée avec `now` injecté — pas une promesse de détection en 60 s.
- La détection en 60 s wall-clock reste possible **en v2 avec le heartbeat**, déjà repoussé.

## Critère de sortie (binaire)

- [x] Test unitaire : `declared = 'executing'` + dernier event vieux de 11 min ⇒ `desynced = true`
      avec sa raison (`now` injecté, aucune I/O). — `lib/mission-truth.test.ts` (16 tests).
- [x] Test e2e : une mission semée `executing` avec un event vieux de 2 h affiche le badge
      désynchronisé **et sa raison** sur `/missions` et `/missions/<id>`, sans édition manuelle de la DB.
      — `tests/desync.spec.ts` (3 specs) + fixture `mission_seed_stale` dans `packages/db/src/seed.ts`.
- [x] Le validateur refuse une alerte à champ vide (test). — `lib/alerts.test.ts`, `makeAlert` jette
      `alerte invalide (contrat C12)` sur champ vide, route sans `/`, sévérité hors contrat.
- [x] Le test `null ≠ zéro` passe sur chaque famille d'alertes (y compris `budgetUsedPct = null`
      quand aucun plafond n'est déclaré). — 4 familles + `computeProjectHealth`, qui exclut désormais
      les missions sans plafond des deux sommes (sinon le % dépassait 100).
- [x] Portique binaire : `bash scripts/lint-alert-render.sh` sort 0 — aucun rendu d'alerte hors du
      composant contractuel, vérifié par `pnpm lint`. Le portique refuse de **lier un nom**
      (PascalCase contenant `Alert`/`Banner`) et non d'appeler une fonction : `function`,
      `const`/`let`/`var`, `class`, `export default <Nom>` et les listes de re-export sont couverts,
      signature multi-lignes comprise — la majuscule initiale sépare un rendu (`AlertBanner`) d'un
      constructeur de fait (`budgetPauseAlert`), ce qui tient le zéro faux positif. Le contre-exemple
      était une fixture jetable créée à la main (`printf` dans un `.tsx` temporaire, plan §portique) :
      il est désormais **commité et rejoué par la CI** — `apps/web/alert-render-guard.test.ts`,
      20 tests, un contre-exemple par forme + les non-régressions (`RiskBadge`, icônes lucide,
      import/JSX, constructeurs camelCase même re-exportés).
- [ ] 5 checks verts (`pnpm -r test` · lint · build · smoke · Sonar exit 0). — 4/5 verts en local
      (909 tests unitaires · lint exit 0 · build OK · smoke 35/35). Sonar reste à valider sur la PR.

**Plan d'implémentation** : `docs/superpowers/plans/2026-08-14-statut-verite-contrat-alertes.md`.

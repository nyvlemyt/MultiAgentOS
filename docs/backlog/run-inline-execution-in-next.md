# Backlog — inline mission execution inside the Next.js runtime (finding B)

**Quoi.** Le bouton **Run** d'une mission appelle `POST /api/missions/[id]/run`, dont le driver **exécute les tâches inline DANS le runtime Next.js** (route handler), au lieu de déléguer au process séparé `apps/worker`. Or l'exécution de tâche (Agent SDK + skill-router) est **fragile sous le bundling webpack RSC de Next**. Découvert pendant le debug du test e2e `lifecycle.spec` (gate §5), cycle 2026-06-07.

**Statut.** Backlog / Phase 5. Un contournement minimal a été livré pour débloquer l'e2e §5 (voir §Workaround) ; la **cause architecturale reste** et doit être traitée en Phase 5. Aucune régression du gate §5 lui-même (la logique de validation risk=high est correcte et testée).

---

## 1. Symptôme

Test e2e `apps/web/tests/lifecycle.spec.ts` : après *Plan* puis *Run* sur `mission_seed_001`, le modal « pending validation » (gate §5 risk=high) **n'apparaissait jamais** → test rouge. `Plan` réussissait (tâches générées) ; c'est l'exécution post-Run qui mourait.

## 2. Root cause (prouvée par evidence runtime, pas supposée)

Stack capturé sur serveur Next instrumenté :
```
TypeError: The "path" argument must be of type string or an instance of URL. Received an instance of URL
    at fileURLToPath (node:internal/url)
    at getSkillRouter (webpack-internal:///(rsc)/.../packages/agents/src/dispatch.ts:31)
    at executeNextTask (dispatch.ts:336)
```

- `dispatch.ts` `getSkillRouter()` faisait `fileURLToPath(new URL('.', import.meta.url))` pour localiser la racine repo et scanner les skills orchestrateur (ajout Phase 3, commit `17ed7f1`).
- **Sous webpack RSC de Next**, `import.meta.url` n'est pas une URL `file:` → `new URL('.', …)` produit une URL étrangère (`webpack-internal:`) que le `fileURLToPath` natif de Node **rejette**.
- Ce throw survient sur la **1ère tâche non-risquée (t1)**, **avant** d'atteindre le gate §5 (t5) → aucune validation créée → pas de modal.
- **Isolation décisive** : le MÊME `executeNextTask`, lancé **hors Next** (tsx natif) avec `MAS_MOCK_LLM=1`, déroule t1→t4 `task_done` puis **t5 `paused_for_validation`** sans erreur. Donc bug **spécifique au runtime Next**, pas à la logique agents.

### Cause secondaire (même chemin)
Même sans le bug de path, l'exécution non-risquée appelait le **vrai `claudeCodeLLM`** (Agent SDK) avec `cwd = projects.path`. Le projet seed `otakugo` a un **`path` VIDE** (DB réelle ET smoke). Le vrai SDK ne peut pas tourner ainsi (cwd vide, pas de `claude login` en headless). Donc en usage réel, Run sur la mission seed **500 aussi**.

## 3. Workaround livré (cycle 2026-06-07) — débloque l'e2e, ne résout pas l'archi

1. `packages/agents/src/dispatch.ts` `getSkillRouter()` : **try/catch** → sous bundler (échec `fileURLToPath`), dégrade vers `new SkillRouter([])` (injection de skills = best-effort, pas une exigence de correction). L'exécution native (`apps/worker`, tsx) résout le path et garde l'injection complète.
2. `packages/agents/src/dispatch.ts` `selectLLM()` : nouveau toggle **`MAS_MOCK_LLM=1`** → `mockLLM()` au lieu du vrai SDK (exécution déterministe, zéro coût, zéro `claude login`). Les deux branches passent par les factories `@mas/core` (respecte §11 : pas de client SDK brut hors core). Le seam `vi.mock('@mas/core')` des unit tests reste intact.
3. `apps/web/playwright.config.ts` : `MAS_MOCK_LLM: '1'` dans `webServer.env` du harness smoke.

Résultat : `lifecycle.spec` vert (Plan→Run→modal §5→Approve→archived + kanban), filet e2e complet 19/19.

## 4. Vraie correction (Phase 5)

- **Déplacer l'exécution de mission vers `apps/worker`** (process Node natif, où `import.meta.url` + Agent SDK fonctionnent — prouvé par le repro tsx), conformément à **CLAUDE.md §2** (« Orchestrator worker = separate Node process »). `/run` devrait **enqueue/dispatcher** vers le worker, pas exécuter inline dans Next. La route inline était une commodité Phase 1 (« drive inline even when the worker isn't running »).
- Si un chemin inline est conservé : résoudre la racine repo **sans `import.meta.url`** (anchor robuste au bundler), et **gater le vrai SDK** derrière le worker.
- **Donnée seed** : le projet `otakugo` doit porter un **`path` absolu réel** (ou le chemin d'exécution doit refuser proprement un projet sans path — cf. heuristique « palier maturité » RES-061, gouvernance.md : pas d'exécution autonome sous palier 2).
- Retirer / encadrer `MAS_MOCK_LLM` quand l'exécution réelle passe par le worker (rester un toggle test/dev, jamais un moyen de contourner la facturation §11 — le mock renvoie du texte factice, inutile en prod).

## 5. Ce qu'il ne faut PAS faire

- Ne pas « réparer » le path en bricolant `import.meta.url` dans le bundle Next sans déplacer l'exécution vers le worker — ce serait soigner le symptôme.
- Ne pas câbler `selectLLM` dans `@mas/core` tant que le seam `vi.mock` des unit tests n'est pas migré (sinon le mock interne contourne le mock des tests). Le selector reste dans `dispatch.ts`.

## 6. Écart de typage d'event : `task_done` vs `llm_call` (révélé par la review PR #1)

Le compteur `/tokens` (fenêtre 5h + cache ratio) filtre désormais `events.type = 'llm_call'` — le type **canonique** documenté (`schema.ts:143`, `TOKEN_STRATEGY.md §8/L82`, `seed.ts`). Or `dispatch.ts` `logEvent` émet les données de tokens/cache sous le type **`task_done`**, jamais `llm_call`. Conséquence : en **runtime réel**, le compteur lira **0** (les données de seed/smoke utilisent bien `llm_call`, donc l'UI et les tests sont corrects ; seul le runtime live diverge).

**À faire (Phase 5, avec le déplacement vers `apps/worker`)** : faire émettre par le chemin d'exécution un event `llm_call` par appel LLM (portant `tokensIn/Out`, `cacheRead/Creation`, `quotaUnits`), OU réconcilier le type canonique. **Ne pas** élargir le filtre du compteur à `task_done` en douce — ça compterait des tâches sans appel LLM. Décision de typage à acter (proche de la réconciliation registres §RES-029).

---

**Référence** : `docs/learning/` (debug session 2026-06-07, gate Phase 3→3.5), `packages/agents/src/dispatch.ts` (`getSkillRouter`, `selectLLM`), `apps/web/app/api/missions/[id]/run/route.ts`, `apps/web/playwright.config.ts`, CLAUDE.md §2 (worker séparé) + §11 (billing), `docs/knowledge/vibeflow/gouvernance.md §RES-061` (palier maturité).

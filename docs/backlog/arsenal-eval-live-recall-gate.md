# Backlog — Gate de recall sémantique réel pour l'arsenal (0d/4d)

**Quand** : suite de 0d (avant une grosse évolution de l'arsenal, ex. 0e ingestion PDF). **Valeur** : moyenne-haute — c'est le filet anti-régression que l'ADR promet. **Statut** : gap d'audit U5 (F2). **Source** : `docs/learning/2026-06-25-night/U5-self-audit-0d.md` F2 · ADR 0007 §Décision-6 · `.github/workflows/ci.yml` (job `arsenal-eval`) · `packages/memory/src/eval.ts:69` · `golden-queries.json`.

## Identity (quoi)

ADR 0007 §Décision-6 : « une régression de recall devient un **échec CI**, pas une dégradation muette ». En l'état, le job CI `arsenal-eval` est **épinglé `MAS_RETRIEVAL_BACKEND=fts`** (runner Node 20 ne peut pas héberger QMD : Node ≥22 + 4,4 Go de modèles). Toutes les lignes-or arsenal sont `qmdOnly:true` → **auto-skip** sur FTS. Donc le CI prouve que `arsenal:build` + `mem:eval` tournent sans crasher (gold set non corrompu, harness sain), mais **pas** que le recall sémantique tient. Le vrai recall n'est gaté que par un run **local manuel** `MAS_RETRIEVAL_BACKEND=qmd pnpm mem:eval` — discipline opérateur, pas garantie machine.

## Why it matters

C'est honnête (le choix est commenté bruyamment dans `ci.yml`, jamais un skip silencieux), mais une régression de recall réelle passerait le CI vert tant que personne ne lance le run local. La garantie ADR est donc partielle.

## Cost (install / maintenance / removal)

- **Install** : moyen. Deux pistes : (a) un **runner CI capable de QMD** (Node ≥22 + cache des modèles) déclenché sur les globs arsenal ; ou (b) un **job planifié (nightly/cron)** sur une machine QMD qui rejoue le gold set en backend `qmd` et alerte sur régression. (b) est moins cher et n'allonge pas le hot-path PR.
- **Maintenance** : moyen — entretien du cache de modèles / du runner.
- **Removal** : facile (retirer le job planifié).

## Recommendation : **defer** (mais pas oublier)

Hors périmètre 0d (l'ADR §Périmètre repousse l'ingestion massive à 0e). À traiter **avant 0e** : dès que l'arsenal grossit, un recall non gardé en machine devient un vrai risque. Préférer la piste (b) nightly-QMD.

## Liens
- ADR 0003 amendement §3-4 (FTS fallback non silencieux, index rebuildable).
- `docs/backlog/arsenal-mcp-runtime-activation.md` (autre gap 0d).

**Re-audit** : ouverture de la vague 0e.

# Phase 9 · 0b — Prompt d'ouverture à froid (à coller en premier dans la session de build)

> **But.** Démarrer une **session fraîche** sur le chantier 0b sans perte de contexte. Tout le travail de réflexion est déjà figé sur `phase/9b-pipeline` (intake + `plan.md` + `build-prompt.md`). Ce fichier est l'**amorce** : colle le bloc §« Prompt à coller » ci-dessous dans la nouvelle session. Elle joue alors le rôle d'**orchestrateur** (§③ de `build-prompt.md`) : elle dispatche le Doer ①, s'auto-vérifie, dispatche le Checker ②, boucle jusqu'au PASS, ouvre la PR DRAFT, et s'arrête au critère de sortie 0b.

## État de reprise (vérifié 2026-06-24)

- **0a est mergée dans `main`** (`ce04cf9` = #36 ; `96b98a4` = #35). Rien à refaire côté 0a.
- **La branche du chantier existe déjà en local : `phase/9b-pipeline`** (arbre propre, **non poussée** sur l'origine — `main` est protégé, la PR DRAFT viendra la pousser). Elle porte déjà, au-dessus de `main` : le repère ROADMAP « 0a ✅ » (`d94ee56`), le pré-vol 0b (`7c79fbb`) et ce prompt d'ouverture. **Ne PAS la recréer depuis `main`** → un simple `git checkout phase/9b-pipeline`.
- **0b n'est PAS construit.** Le code (`llm.ts`, `dispatch.ts`, `review-gate.ts`, fiches, ~8 tests) n'a pas été touché. Seul le plan existe.
- Pré-requis présents : fiches `reviewer` / `sec-reviewer` / `quality-controller`, `scripts/sonar-pr-issues.sh`, `docs/knowledge/sonar-recurring-rules.md`.

---

## Prompt à coller (session fraîche, abonnement, sous-agents activés)

> Reprends **MultiAgentOS**, **Phase 9 · Étape 0b — vrai pipeline doer/checker**. Tu es l'**orchestrateur** de cette session ; le travail de conception est déjà fait et commité — tu l'exécutes, tu ne le re-débats pas.
>
> **Contexte de reprise** : 0a est mergée dans `main` (`ce04cf9`). La branche `phase/9b-pipeline` **existe déjà en local** (tip `7c79fbb`, non poussée). **`git checkout phase/9b-pipeline`** — ne la recrée pas depuis `main`. Confirme `git status` propre et que `git log --oneline main..HEAD` montre le pré-vol 0b (pack + ce `LAUNCH.md`) au-dessus du repère 0a (`d94ee56`). 0b n'est pas encore codé.
>
> **Lis dans l'ordre, avant tout dispatch** : `CLAUDE.md` (§5 actions risquées, §7 « fait = 5 checks + Sonar exit 0 », §8 write-lock mémoire, §11 abonnement-only / jamais `@anthropic-ai/sdk`, §12/§13 savoir & pré-vol) ; `docs/learning/2026-06-24-0b-preflight/plan.md` (**la spec complète, section par section — la source de vérité**) ; `docs/learning/2026-06-24-0b-preflight/build-prompt.md` (les prompts **① Doer**, **② Checker**, **③ orchestrateur** déjà remplis) ; `docs/intake/2026-06-24-0b-real-pipeline.md` (décision `adapt_now`) ; `docs/learning/AUTONOMOUS-PIPELINE.md` (la méthode doer/checker) ; `docs/knowledge/sonar-recurring-rules.md` (avant d'écrire du code).
>
> **Exécute la boucle §③ de `build-prompt.md`** :
> 1. Dispatche le **Doer ①** (sous-agent `general-purpose`, **TDD red→green**) en lui collant le bloc « ① Doer » de `build-prompt.md`. Il reste sur `phase/9b-pipeline`, commite chaque étape, **ne pousse pas**, n'ouvre pas de PR.
> 2. **Auto-vérifie** : relance `pnpm -r test` + `pnpm lint` ; `grep -rn "@anthropic-ai/sdk" packages apps --include=*.ts | grep -v api-fallback` (doit être vide) ; vérifie qu'aucune écriture `data/memory/` n'a été ajoutée et que la boucle d'éval est **bornée** (`maxReviewIterations`, pas de `while(true)`). Corrige / re-dispatche si ça cloche.
> 3. Dispatche le **Checker ②** (sous-agent **lecture seule**) avec le bloc « ② Checker ». Lis son verdict commité (`docs/learning/2026-06-24-0b/checker-verdict.md`).
> 4. **Boucle d'amélioration** jusqu'à **Checker PASS** sans finding actionnable ouvert.
> 5. **Pousse** `phase/9b-pipeline`, ouvre une **PR DRAFT** (c'est l'utilisateur qui merge), puis **poll Sonar** → `scripts/sonar-pr-issues.sh <pr>` **exit 0** (0 issue / 0 hotspot) **et** gate OK ; corrige chaque item (lis `sonar-recurring-rules.md`).
>
> **Garde-fous (jamais enfreindre)** : §11 abonnement-only, aucun import `@anthropic-ai/sdk`, ne touche pas `packages/core/src/providers/` ; §8 aucune écriture `data/memory/` ; §5 la garde de risque (`pauseForRiskGate`) et le chemin bloquant `intake-gate` restent intacts, la boucle **propose** des diffs sans jamais les appliquer ni court-circuiter une garde humaine ; n'exporte jamais `MAS_MOCK_LLM` globalement ; boucle **bornée** uniquement (`maxReviewIterations` défaut 2 + budget tâche). `intake-gate.ts` est **hors périmètre** — ne pas le toucher.
>
> **Critère de sortie 0b (DoD binaire)** : une tâche s'exécute **producteur → vrai critique → sur NEEDS_WORK, boucle de correction bornée** ; **plus aucun critique mock dans le chemin de revue doer/checker** des missions (exceptions documentées : `intake-gate` + le fallback déterministe quand le verdict LLM est illisible) ; les tâches dépendantes **reçoivent le `last_message` amont**. « Fait » = les 5 checks verts + Sonar exit 0, + `build-report.md` et `checker-verdict.md` écrits sous `docs/learning/2026-06-24-0b/`.
>
> **Arrête-toi au critère de sortie 0b et demande mon GO explicite avant 0c.** Budget : `standard`, pause + rapport à 80 %. À la fin, rends : fichiers changés, nombre de commits, pass/fail + chiffres des 5 checks, le n° de PR, et tout report déféré.

---

### Rappels pour l'orchestrateur (pièges connus, déjà résolus dans `plan.md`)

- **La couture déterministe** (`plan.md §2.3`) est le point dur : champ `reviewKind?` sur `LLMRequest`, `mockLLM()` qui synthétise un `## Verdict` depuis les sentinelles (`[qc-block]`/`[sec-block]`/`[needs-work]`/sinon PASS), et les deux `claudeCodeLLM` `vi.mock`'d (dans `dispatch.test.ts` + `dispatch-delegate.test.ts`) mis à jour pareil. Le vrai `claudeCodeLLM` ignore `reviewKind` — c'est l'instruction `## Verdict` de la fiche qui pilote. `parseVerdict` fail-safe = `NEEDS_WORK` (jamais de PASS silencieux).
- **Reality Checker = déterministe** (pas de LLM) : `diffApplies && (testsCited || diffCoversRequest)`.
- **Tests à garder verts** sans régression : `quality-controller-wiring`, `risk-classify-wiring`, `intake-gate`.
- **Sec plan-time** (`plan.md §2.8`) : peut rester `mockSecReviewer` avec note inline si le threading LLM dans `planMission` est trop invasif — à documenter dans le build-report.

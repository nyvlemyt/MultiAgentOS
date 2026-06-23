# Phase 9 — Prompt de lancement (handoff construction)

> **But de ce fichier.** Le PLAN a été créé en session Opus 4.8 avec contexte complet (2026-06-22). Ce document est le **handoff** : colle la section « Relay prompt » ci-dessous dans ta session de construction la mieux configurée (Claude Code, abonnement, sous-agents activés). Il contient tout le contexte, les décisions validées, les coutures de code exactes (issues de 4 audits), les garde-fous et le rituel de vérification.

---

## 1. Contexte (ce qu'on a décidé avec l'utilisateur)

- **Un seul projet : MultiAgentOS** (≡ « MAOS », même chose). On l'utilise **pour se construire et s'améliorer lui-même**.
- **Stratégie C → destination B** :
  - (A) outiller le build-time avec notre propre arsenal (877 skills froids, 32 agents froids, 15 docs `docs/knowledge/`) ;
  - (B) dogfooding : MultiAgentOS lance des missions sur son propre dépôt. Prérequis de B = finir la couche live (= la vision produit).
- **Priorité absolue : Étape 0 (les 3 sous-étapes) puis Étape 1.** L'ex-Étape 2 (surfaces) est fondue dans Étape 3.
- **Fondations d'abord** : 4 audits (2026-06-22) montrent une *conception* excellente mais un *runtime non activé*. On active avant de bâtir l'app.

## 2. Décisions validées (ne pas re-débattre)

1. **Mémoire = 4 étages sur une base Markdown** (`data/memory/`, 5 registres, Memory Keeper seul scripteur) :
   - **Toi (humain)** → **Obsidian** (vault Markdown + vue graphe via wikilinks `[[...]]`) + ajout manuel de notes.
   - **L'agent (recherche)** → **QMD maintenant** (sémantique + rerank, local, pas de clé API), **FTS5 en fallback**, derrière l'interface `MemoryRetriever`. Recherche **unifiée** : savoir + mémoire + **arsenal** (skills/agents/règles/commandes). Frontière : QMD cherche, Markdown stocke, Skill Router décide. Détail + 8 principes : `docs/learning/2026-06-22/PHASE9-0a-UNIFIED-RETRIEVAL.md`.
   - **Le code (séparé)** → **Graphify/codegraph** pour le Context Manager, **plus tard** (Phase 5, ADR `0007-context-indexing` + audit sécu). **Hors fondation mémoire.**
2. **Pipeline d'exécution = vrai doer/checker** (pas un prompt unique) : critiques réelles + boucle évaluateur-optimiseur bornée.
3. **Roster Tier A renforcé** : + un agent **évaluateur** (promu de la bibliothèque froide), **planner et orchestrateur séparés**.
4. **Billing** : abonnement Claude Code via Agent SDK **uniquement** ; `@anthropic-ai/sdk` (PAYG) interdit (garde CI `scripts/lint-no-sdk-payg.sh`).

## 3. Coutures exactes (vérifiées par les audits — points d'entrée du code)

**0a Mémoire**

- `packages/memory/src/seed.ts` — `seedGlobalKnowledge(store, knowledgeDir)` existe, **jamais appelé**. → script `mem:seed` + invocation bootstrap.
- `packages/memory/src/retriever.ts` — `FtsRetriever` (ré-indexe en RAM à chaque requête) ; `indexPath` supporté mais non passé ; `QmdRetriever` nommé, non implémenté. `corpusHash()` mort.
- `packages/memory/src/registers.ts` — écrit `## BDR-001 — Titre`, **zéro `[[wikilink]]`** → graphe Obsidian sans arêtes.
- `apps/web/app/(cockpit)/memory/` (+ routes `api/memory/*`) — triage de candidats uniquement, **pas d'écriture manuelle**.
- `packages/db/src/schema.ts` — table `memory_items` orpheline (le store vivant = Markdown). Trancher.
- **Retrieval unifié (0a renforcée)** : QMD **maintenant** (`QmdRetriever` derrière `MemoryRetriever`, FTS5 fallback). 3 collections : `mas-knowledge` (`docs/knowledge/`, `docs/workflows/`), `mas-memory` (`data/memory/`), **`mas-arsenal`** (`packages/skills/library/`, `packages/agents/library/`, `.claude/agents/`, `docs/rules/`, `.claude/commands/` — résumé L1 + frontmatter). Recherche mémoire **projet** par pertinence (`scope:'project'` dans `buildMemoryContext`). Exposer en **MCP** + harnais d'éval. Amender **ADR 0003**. (cf. `docs/learning/2026-06-22/PHASE9-0a-UNIFIED-RETRIEVAL.md`, `docs/intake/2026-06-08-qmd.md`.)

**0b Pipeline**

- `packages/core/src/llm.ts` — `mockReviewer` (toujours PASS), `mockCodeReviewer` (toujours PASS), `mockSecReviewer` (BLOCK si `risk==='blocking'`), `mockQualityController` (BLOCK sur sentinelle `[qc-block]`), `mockRealityChecker` (clé sur `evidence`). → remplacer par délégation réelle aux fiches.
- `packages/agents/src/dispatch.ts` — `runReviewPhase` (~327-390) ; `runDelegatedTask` (~513-563, ajouter la boucle éval) ; `evidence:false` codé en dur (~501) ; `runRawTask` (~565-592) ; chaînage via `dependsOnJson`/`selectRunnableTasks` (~318-325).
- `packages/agents/src/delegate.ts` — `delegateWithDiff()` = un seul `llm.call` ; `packages/agents/src/review-gate.ts` — `reviewProducedDiff()` (`validateDiffApplies` réel = à garder).
- Prompt de revue : `docs/knowledge/prompting-anthropic.md:104-110`. Patterns : `docs/knowledge/anthropic-ecosystem.md:164-170`.

**0c Roster**

- `packages/agents/library/agent-evaluator.md` (+ `gan-planner/gan-generator/gan-evaluator`, `loop-operator`) — à promouvoir en Tier A.
- `packages/agents/fiches/` — ajouter fiches `evaluator` + `orchestrator` (schéma `AGENTS.md §2`, toutes clés remplies, `escalate_when` obligatoire).
- `AGENTS.md` §3 (« 6 » → 7, ajouter `quality-controller`) + §7.
- Câblage Tier B déjà réel : `packages/agents/src/dispatch.ts` (`TIER_B_DELEGATION_MAP`, `domainScopeFor`, `selectLibrarySkills`) + `library.ts`.

**Étape 1 Live**

- Réel : `packages/core/src/llm.real.ts` (Agent SDK) ; `apps/web/app/api/missions/[id]/run/route.ts` (`runMission`/`executeNextTask`).
- Scripté à remplacer : `apps/web/lib/{manager,agent,mission}-script.ts`, `apps/web/app/(cockpit)/conversation-actions.ts`. Garder `conversations`/`messages` + `ConversationPanel`.

## 4. Garde-fous (CLAUDE.md)

- §5 actions risquées toujours gated (rm, reset --hard, écriture hors projet, secrets, hôtes non allow-listés).
- §11 abonnement-only, jamais `@anthropic-ai/sdk`.
- §12/§13 consulter `docs/knowledge/` avant tout artefact mémoire/agent/skill ; ≤5 items mémoire injectés.
- §8 toute la mémoire passe par le Memory Keeper (write-lock).

## 5. Méthode & « fait »

- Branche `phase/9-foundation-activation` (ou par sous-étape `phase/9a-memory`, `phase/9b-pipeline`, `phase/9c-roster`). PR **DRAFT** (l'utilisateur merge).
- **Doer/checker en sous-agents** (`docs/learning/AUTONOMOUS-PIPELINE.md`) : un Doer code en TDD, un Checker frais rejoue tout.
- **« Fait » = 5 checks verts** : `pnpm -r test` · `pnpm lint` · `pnpm build` · `pnpm --filter @mas/web smoke` · `scripts/sonar-pr-issues.sh <pr>` **exit 0** + gate OK. Lire `docs/knowledge/sonar-recurring-rules.md` avant d'écrire le code.
- Commencer par **Étape 0a**, s'arrêter au critère de sortie, demander le GO avant 0b.

## 6. Relay prompt (à coller dans la session de construction)

> Reprends MultiAgentOS, **Phase 9 · Exploitation & Auto-construction**. Lis dans l'ordre : `CLAUDE.md` (surtout §5/§11/§12/§13), `ROADMAP.md` (la section Phase 9), `docs/learning/2026-06-22/PHASE9-KICKOFF.md` (ce fichier, coutures + décisions), et les 4 docs `docs/knowledge/` : `memory-patterns.md`, `agent-patterns.md`, `prompting-anthropic.md`, `production-patterns.md`.
>
> Objectif de session : **Étape 0a renforcée — retrieval unifié** uniquement (la mémoire de base est faite, PR #35). Installe **QMD maintenant** derrière `MemoryRetriever` (FTS5 en fallback) ; crée 3 collections `mas-knowledge` / `mas-memory` / **`mas-arsenal`** (skills+agents froids + `.claude/agents/` + `docs/rules/` + `.claude/commands/`, indexés résumé L1 + frontmatter) ; branche la recherche mémoire **projet** par pertinence (`scope:'project'` dans `buildMemoryContext`) ; expose la recherche en **MCP** ; ajoute un **harnais d'éval retrieval** en CI ; amende **ADR 0003**. Frontière : QMD cherche, Markdown stocke, Skill Router décide (interroge QMD pour ses candidats).
>
> Contraintes : abonnement-only (jamais `@anthropic-ai/sdk`), Memory Keeper seul scripteur, consulter `docs/knowledge/` avant de toucher la mémoire (§12). Travaille en doer/checker (sous-agents), branche `phase/9a2-qmd-arsenal`, PR DRAFT. « Fait » = les 5 checks verts + Sonar exit 0. Critère de sortie 0a renforcée : requête **sémantique** (« éviter d'oublier entre sessions ») → bon doc savoir ; requête **arsenal** (« skill audit PR », « agent revue sécu ») → bon skill/agent froid ; mémoire **projet** par pertinence ; **fallback FTS** si QMD coupé ; recherche **interrogeable en MCP** ; harnais d'éval vert.
>
> **Arrête-toi au critère de sortie 0a et demande mon GO explicite avant 0b.** Budget :  standard, pause + rapport à 80 %.

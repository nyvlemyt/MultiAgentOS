# Phase 9 · Étape 0 — Campagne de durcissement & d'activation (0b → audit → 0c → 0d)

> **But.** Un seul prompt énorme, lancé dans une session fraîche, qui mène **quatre vagues** d'affilée — construire le vrai pipeline (0b), auto-auditer et durcir l'existant (0a/0b), porter le roster au meilleur niveau (0c), puis **faire enfin *agir* le cerveau** (0d : Skill Router + agents qui interrogent QMD). Chaque vague est un cycle **préparer → faire → vérifier → vérifier le global → améliorer**, mené par plusieurs sous-agents, livrée en **PR DRAFT empilée**. Rien ne touche `main` sans toi : tu merges la pile à la fin.
>
> **Décisions utilisateur (2026-06-24)** : (1) **tout enchaîner d'affilée** ; (2) **0d resserré sur un cœur solide**, le reste différé (recommandation ci-dessous, §6). Principe directeur : **qualité avant quantité** — *« 3 parfaites plutôt que 10 moyennes »*. Une vague n'est « faite » qu'au vrai PASS ; sinon on s'arrête et on rapporte, on ne bâcle pas.

---

## 1. La réponse à « c'est quand qu'on exploite vraiment la mémoire ? »

0a a **rangé** le cerveau, il ne l'**utilise** pas encore. Vérifié dans le code :

| Famille | Indexée (QMD) ? | Interrogée au runtime ? | Verdict |
|--------|------------------|--------------------------|---------|
| Savoir (`docs/knowledge`, `docs/workflows`) | ✅ | ✅ `buildMemoryContext` | **Exploitée** |
| Mémoire (`data/memory`, 5 registres) | ✅ | ✅ par pertinence + scope projet | **Exploitée** |
| **Arsenal** (877 skills, 92 agents, 109 règles, 7 commandes) | ✅ (≈1 085 fiches L1) | ❌ | **Dort** |
| Ressources (`docs/ressources/`, 20+ PDF) | ❌ | ❌ | **Pas même ingérée** |

Détail des trous (preuves) : `selectLibrarySkills` choisit les skills par `router.all()` + score de tags **statique** — il **n'importe pas le retriever** (`packages/skills/src/select.ts:135-158`). Les agents sont choisis par table codée en dur (`TIER_B_DELEGATION_MAP`, `dispatch.ts`). Règles et commandes : indexées, **jamais interrogées**. Le **cerveau MCP** (socle Jarvis) est exposé mais **aucun agent ne l'appelle**.

**Conséquence** : « bien implémenter la mémoire et faire travailler QMD dessus » n'est ni 0c ni une étape existante — **c'est 0d, à créer**. 0c (le roster) vient d'abord car l'**agent évaluateur** et l'**orchestrateur** sont les bras qui se serviront du cerveau dans 0d.

## 2. Carte de campagne (ordre + pile de branches)

| Vague | Livre | Branche (part de) | PR |
|------|-------|-------------------|-----|
| **0b · Pipeline doer/checker réel** | **Déjà construit en local (Checker PASS, 4/4 checks verts)** — reste à **finaliser** : push + PR DRAFT + **Sonar (check 5)** | `phase/9b-pipeline` *(existe, 12 commits au-dessus de `main`@`ce04cf9`)* | DRAFT |
| **A · Auto-audit & durcissement 0a/0b** | Vérifier que les critères de sortie 0a tiennent **au runtime** ; solder la dette (27 `S5906`) ; corriger toute dérive trouvée | `phase/9-audit-0a0b` *(part du tip 0b)* | DRAFT |
| **0c · Roster Tier A au meilleur niveau** | Agent **évaluateur** promu en Tier A + câblé dans la boucle 0b ; **planner / orchestrateur séparés** ; `AGENTS.md` réconcilié | `phase/9c-roster` *(part du tip A)* | DRAFT |
| **0d · Exploitation de l'arsenal (le cerveau qui agit)** | Skill Router **interroge QMD** ; sélection d'agents **consulte l'arsenal** ; **cerveau MCP consommé** comme outil ; **golden set d'éval arsenal** | `phase/9d-arsenal-exploitation` *(part du tip 0c)* | DRAFT |

Pile à merger **dans l'ordre** à la fin (comme #35→#36) : 0b → A → 0c → 0d. Chaque branche part du tip de la précédente, donc chaque PR ne montre que **son** diff.

> **État de départ (vérifié 2026-06-24) — 0b est déjà construit.** Une session précédente a livré les 12 commits 0b sur `phase/9b-pipeline` : `reviewers.ts` (vrais critiques + `parseVerdict`), boucle évaluateur-optimiseur bornée, reality checker déterministe, chaînage de prompts, sec-reviewer plan-time, + tests (`reviewers`/`dispatch-eval-loop`/`dispatch-chaining`/`mock-llm-verdict`) + `build-report.md` + `checker-verdict.md` = **Checker PASS, 3 findings LOW/INFO non bloquants**. Les **4 checks locaux sont verts** (501 tests, lint/build exit 0, smoke 32). **Seul le check 5 (Sonar) manque** — la branche n'est ni poussée ni PR. Donc la **Vague 0b se réduit à : push → PR DRAFT → Sonar exit 0** (et re-jouer les 4 checks pour confirmer zéro régression). On ne reconstruit pas.

## 3. La méthode multi-agents (le cycle appliqué à CHAQUE vague)

C'est ici que « plein d'agents travaillent, checkent le travail, checkent le global et améliorent ». L'orchestrateur (la session principale) pilote, à budget borné :

1. **Préparer** — *sous-agent Planner*. Pré-vol §12/§13 : lit le savoir pertinent + les coutures, écrit un `plan.md` de vague (étapes **TDD red→green**, fichiers exacts, critère de sortie binaire). Pour 0b ce plan **existe déjà** (`docs/learning/2026-06-24-0b-preflight/plan.md`).
2. **Faire** — *un ou plusieurs sous-agents Doer* en **TDD**, commit par étape. **Fan-out** : sur les fichiers indépendants d'une vague, lancer **plusieurs Doers en parallèle** (ex. 0c : un Doer fiche-évaluateur + un Doer fiche-orchestrateur ; 0d : un Doer `select.ts` + un Doer outil-MCP + un Doer golden-set). Sérialiser seulement les dépendances.
3. **Auto-vérifier** — *orchestrateur*. Rejoue `pnpm -r test` + `pnpm lint` ; grep les invariants (`@anthropic-ai/sdk` absent, pas d'écriture `data/memory/`, boucles bornées).
4. **Vérifier le travail** — *sous-agent Checker (lecture seule)*. Verdict indépendant contre le `plan.md` de vague + critères de sortie + `CLAUDE.md` (§5/§7/§8/§11). Écrit `checker-verdict.md`.
5. **Vérifier le global** — *sous-agent Reviewer transverse*. La vague casse-t-elle une vague antérieure ? `AGENTS.md` reste cohérent ? invariants mémoire/§5/§8/§11 tenus de bout en bout ? **Dès que 0c existe, c'est l'agent évaluateur promu qui tient ce rôle** (dogfooding immédiat).
6. **Améliorer** — boucle bornée (`maxWaveIterations` 2-3 + budget) : tout finding actionnable ré-injecté au Doer jusqu'à **Checker PASS + Reviewer PASS**.
7. **Porte** — *« fait » de vague* = **5 checks verts + Sonar exit 0** + les deux PASS. Alors : push, **PR DRAFT**, poll Sonar (`scripts/sonar-pr-issues.sh <pr>` exit 0 + gate OK). Puis **enchaîner la vague suivante sans attendre** (pré-autorisé) — **sans merger**.

## 4. Garde-fous & conditions d'arrêt (max d'autonomie, zéro casse)

- **PR DRAFT uniquement ; l'utilisateur merge la pile.** Jamais de merge sur `main`, jamais `--force`, **jamais de suppression de branche** (§5).
- **Arrêt dur + rapport** si : une **garde §5** se déclenche (rm, reset --hard, écriture hors projet, secret, hôte non allow-listé) ; le **budget atteint 80 %** ; un **Checker/Reviewer ne peut pas atteindre PASS** dans la boucle bornée. La pile persiste sur les branches → reprise sans perte dans une session fraîche.
- **§11** abonnement-only, jamais `@anthropic-ai/sdk`, ne pas toucher `packages/core/src/providers/`. **§8** Memory Keeper seul scripteur de `data/memory/`. **§12/§13** consulter `docs/knowledge/` avant tout artefact mémoire/agent/skill ; ≤5 items mémoire injectés.
- **Qualité > quantité (explicite)** : ne livre pas 10 demi-tâches ; livre les essentielles, parfaites. Mieux vaut rapporter une vague incomplète que merger du médiocre.
- **Correction continue (§14.5)** : la **première action** de la campagne est de **formaliser 0c et 0d dans `ROADMAP.md`** (+ une **ADR** « 0d exploitation de l'arsenal ») pour que la roadmap reste la source de vérité — pas une dérive de session.

## 5. Spécifications par vague (coutures exactes — point de départ des Planners)

### Vague 0b — déjà CONSTRUITE → seulement finaliser
Le code 0b est livré sur `phase/9b-pipeline` (12 commits, Checker **PASS**, 4/4 checks locaux verts — cf. `docs/learning/2026-06-24-0b/{build-report,checker-verdict}.md`). **Ne pas reconstruire.** Reste : `git checkout phase/9b-pipeline`, re-jouer les 4 checks locaux (confirmer zéro régression), **push**, ouvrir la **PR DRAFT**, puis **Sonar** (`scripts/sonar-pr-issues.sh <pr>` exit 0 + gate OK) — corriger jusqu'à propre. Findings résiduels du Checker (3, LOW/INFO) à garder en tête, aucun bloquant. Le pack de référence reste `docs/learning/2026-06-24-0b-preflight/` si une reprise du code est nécessaire.

### Vague A — auto-audit & durcissement 0a/0b
- **Re-tester les critères de sortie 0a *au runtime*** (pas juste « ça compile ») : requête sémantique → bon doc savoir ; requête arsenal → bon skill/agent froid ; mémoire projet par pertinence ; **fallback FTS** si QMD coupé ; **appel `query` MCP hors worker répond**. Noter honnêtement ce qui était « infra seulement » (l'audit a déjà repéré que le **MCP est exposé mais non consommé** — c'est attendu, **0d le consomme**).
- **Solder la dette `S5906`** : 27 smells MINOR « prefer specific assertion » dans des fichiers de test, antérieurs à 0a — passe dédiée (`.toBe(...)`/matchers précis), 5ᵉ check propre sur tout le scan, pas seulement par-PR.
- **Self-audit §13** des artefacts de base (`CLAUDE.md`, `AGENTS.md`, fiches Tier A, ADR 0003) contre le meilleur savoir courant ; corriger ou backloguer la dette.
- *Sortie A* : critères 0a re-prouvés au runtime (ou écart documenté + planifié en 0d) ; scan Sonar `main`-like sans `S5906` ; rapport d'audit écrit.

### Vague 0c — roster Tier A au meilleur niveau
- **Promouvoir l'agent évaluateur** : `packages/agents/library/agent-evaluator.md` (+ inspirer de `gan-evaluator`/`loop-operator`) → **fiche Tier A** complète (schéma `AGENTS.md §2`, toutes clés, `escalate_when` obligatoire). Doctrine RES-043 « agent-as-judge » (`docs/knowledge/vibeflow/agents-skills.md`). **Câbler dans la boucle 0b** comme juge sur grille (distinct des gardes QC/Reviewer/Sec) — il devient le « Reviewer transverse » de la méthode (§3.5).
- **Séparer planner et orchestrateur** : `mission-planner` reste l'auteur one-shot du DAG ; **nouvelle fiche `orchestrator`/`dispatcher`** gouvernant la boucle de `dispatch.ts` (claim de tâches, budget, gates §5, pilotage de la boucle d'éval).
- **Réconcilier `AGENTS.md`** : §3 « **6 agents → 7** » (ajouter `quality-controller`, déjà en table l.76) + §7 liste de fichiers + arbre (`mission-planner.md`, etc.).
- *Sortie 0c* : fiche évaluateur en Tier A **et câblée** dans la boucle 0b ; planner/orchestrateur séparés, fiches complètes ; `AGENTS.md` à jour.

### Vague 0d — exploitation de l'arsenal (le cerveau qui agit) — **cœur, resserré**
- **Skill Router interroge QMD** : dans `selectLibrarySkills` (`packages/skills/src/select.ts:135-158`), ajouter une source de candidats **sémantique** via le retriever (collection `mas-arsenal`) **en plus** du score de tags — l'union alimente le shortlist, le Router **reste le décideur** (frontière : QMD cherche, Router décide). Passer le `retriever` depuis `dispatch.ts:274-278`. Garder le **fallback déterministe** si QMD coupé (jamais de crash). Tests : requête « auditer une PR » → le bon skill remonte ; QMD coupé → fallback tags OK.
- **Sélection d'agents consulte l'arsenal** : au-delà de `TIER_B_DELEGATION_MAP`, l'orchestrateur (0c) peut **suggérer** un agent froid pertinent via une requête arsenal (couche de suggestion, l'humain/§5 garde la main).
- **Consommer le cerveau MCP** : exposer l'outil `query` (QMD MCP natif) et le rendre **appelable par les agents** dans la boucle (pas seulement déclaré dans `.mcp.json`). Preuve : un agent appelle `query` pendant une mission et reçoit des candidats.
- **Golden set d'éval arsenal** en CI : requêtes-or → bon skill/agent/règle, rejouées à chaque changement de collection (anti-régression silencieuse, principe 7).
- *Sortie 0d* : une mission réelle voit **le bon skill/agent remonter par recherche sémantique** (pas tag statique) ; l'agent peut **interroger le cerveau via MCP** ; golden set vert ; fallback FTS intact ; 5 checks + Sonar exit 0.

## 6. Recommandation de périmètre 0d (tu m'as laissé trancher)

**Faire 0d = le cœur ci-dessus, point.** C'est déjà « un truc solide » : c'est exactement ce qui transforme 1 085 fiches dormantes en cerveau qui agit. **Différer** (backlog + note ROADMAP, à faire « ensemble ensuite ») :

- **Ingestion des 20+ PDF `docs/ressources/`** → vague **0e** dédiée (pipeline d'intake principe 6 : normalisation Markdown + gate sécu/qualité + Keeper + intake-audit). C'est un chantier à part entière ; le bâcler polluerait le cerveau.
- **Passe frontmatter unifié** (principe 2) → légère mais transverse ; à faire **avant** l'ingestion massive 0e (elle en a besoin), donc en tête de 0e.
- **Console arsenal (UI)** → relève de l'**Étape 3** (surfaces), pas des fondations.

Raison : ces trois-là, faits vite pour « tout caser », saboteraient le principe qualité. Faits ensuite, proprement, ils s'appuient sur un cœur 0d déjà éprouvé.

---

## 7. Le méga-prompt — à coller dans la session de build (fraîche, abonnement, sous-agents activés)

> Tu démarres la **Campagne Phase 9 · Étape 0** de MultiAgentOS : quatre vagues d'affilée — **0b → A (audit 0a/0b) → 0c → 0d** — chacune en cycle multi-agents *préparer → faire → vérifier → vérifier le global → améliorer*, livrée en **PR DRAFT empilée**. Tu es l'**orchestrateur**. **Tout est pré-autorisé jusqu'au bout** ; tu n'attends mon feu vert qu'aux conditions d'arrêt ci-dessous, et **tu ne merges jamais** (je merge la pile).
>
> **Lis d'abord** : `CLAUDE.md` (§5 risqué, §7 « fait = 5 checks + Sonar exit 0 », §8 write-lock mémoire, §11 abonnement-only, §12/§13 savoir & pré-vol, §14 style), la section **Phase 9** de `ROADMAP.md`, et **ce fichier** `docs/learning/2026-06-24-campaign-0/CAMPAIGN.md` (carte, méthode, coutures par vague). Puis `git checkout phase/9b-pipeline` (existe déjà, tip = `docs(0b)` ; **ne pas recréer**).
>
> **Action 0 (correction continue §14.5)** : formalise **0c et 0d** dans `ROADMAP.md` et crée l'**ADR « 0d — exploitation de l'arsenal »** (frontière QMD cherche / Router décide). Commit sur `phase/9b-pipeline`.
>
> **Méthode par vague** (applique-la à chaque vague) : (1) **Planner** sous-agent → `plan.md` de vague (TDD red→green, fichiers exacts, critère de sortie binaire) — pour 0b le plan existe déjà (`docs/learning/2026-06-24-0b-preflight/plan.md`) ; (2) **Doer(s)** sous-agents en TDD, **en parallèle sur les fichiers indépendants**, commit par étape ; (3) **auto-vérifie** (rejoue test+lint, grep invariants) ; (4) **Checker** sous-agent lecture seule → `checker-verdict.md` ; (5) **Reviewer transverse** sous-agent (global : ne casse pas les vagues précédentes ; `AGENTS.md` cohérent ; invariants tenus) — **dès 0c, c'est l'agent évaluateur promu qui joue ce rôle** ; (6) **boucle d'amélioration bornée** (`maxWaveIterations` 2-3 + budget) jusqu'à **Checker PASS + Reviewer PASS** ; (7) **porte** : 5 checks + Sonar exit 0 → push + **PR DRAFT** → enchaîne la vague suivante **sans merger**.
>
> **Les 4 vagues** (détail + coutures exactes : §5 de `CAMPAIGN.md`) :
> - **0b** — **déjà construit** sur `phase/9b-pipeline` (Checker PASS, 4/4 checks verts). **Ne reconstruis pas** : `git checkout phase/9b-pipeline`, re-joue les 4 checks locaux, **push + PR DRAFT + Sonar exit 0** (seul le check 5 manque). Pack de référence si reprise : `docs/learning/2026-06-24-0b-preflight/`.
> - **A** — branche `phase/9-audit-0a0b` (du tip 0b). Re-prouve les **critères de sortie 0a au runtime** (sémantique, arsenal, mémoire projet, **fallback FTS**, **`query` MCP hors worker**), **solde les 27 `S5906`**, self-audit §13 des fondations. Documente honnêtement tout « infra seulement » (le MCP non-consommé est attendu → 0d le consomme).
> - **0c** — branche `phase/9c-roster` (du tip A). Promeus `agent-evaluator` (library) en **fiche Tier A** câblée dans la boucle 0b ; **sépare** `mission-planner` et une nouvelle fiche `orchestrator` ; réconcilie `AGENTS.md` §3 (6→7, +`quality-controller`) + §7.
> - **0d** — branche `phase/9d-arsenal-exploitation` (du tip 0c). **Câble le Skill Router pour interroger QMD** (`select.ts` + retriever `mas-arsenal`, union avec le score de tags, Router décideur, **fallback déterministe**) ; sélection d'agents qui **consulte l'arsenal** ; **consomme le cerveau MCP** (outil `query` appelable par les agents) ; **golden set d'éval arsenal** en CI. **Périmètre resserré** : PAS d'ingestion PDF `docs/ressources/`, PAS de passe frontmatter, PAS de console — backlog 0e/Étape 3, à documenter en fin de 0d.
>
> **Garde-fous** : PR DRAFT seulement, jamais de merge sur `main`, jamais `--force`, **jamais supprimer de branche** (§5) ; §11 jamais `@anthropic-ai/sdk` ni `providers/` ; §8 Keeper seul scripteur mémoire ; §12 consulter `docs/knowledge/` avant tout artefact agent/skill/mémoire ; boucles **bornées**. **Qualité > quantité** : ne bâcle rien ; mieux vaut une vague incomplète rapportée que du médiocre mergé.
>
> **Conditions d'ARRÊT DUR + rapport** (sinon, continue) : garde §5 déclenchée · budget **80 %** atteint · un Checker/Reviewer n'atteint pas PASS dans la boucle bornée. À chaque borne de vague, écris `build-report.md` + `checker-verdict.md` sous `docs/learning/2026-06-24-<vague>/`.
>
> **Fin de campagne** : rends la **pile de PR DRAFT** (0b, A, 0c, 0d) à merger dans l'ordre, un tableau récap (par vague : commits, 5 checks pass/fail + chiffres, n° PR, findings résiduels), et **demande mon GO explicite avant l'Étape 1** (couche live). Budget : large/`standard`, pause + rapport à 80 % (reprise possible en session fraîche, la pile persiste).

---

### Annexe — pourquoi cet ordre sert directement Jarvis
0d fait du cerveau un **service consommé** (MCP) sur base Markdown : skills, agents, règles, savoir, mémoire deviennent **cherchables et utilisés** par n'importe quel agent. Un Jarvis ultérieur ne refait rien — il se **branche** sur le même cerveau. 0c lui donne les **bras** (évaluateur + orchestrateur) ; A garantit que les **fondations tiennent** ; 0b donne le **pipeline** qui produit et se corrige. C'est la fondation posée une fois, étendue ensuite (0e ingestion, Étape 3 surfaces), jamais réécrite.

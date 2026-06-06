# Build-report — cycle `2026-06-06-vibeflow-memoire-reaudit` (DOER)

**Rôle** : Doer (DISTILLATION). **Date** : 2026-06-06. **Working tree** : modifié, **NON commité**. **1er passage** (pas de verify-report préalable).

## Périmètre

Ré-auditer + compléter la distillation **MÉMOIRE** (memoire.md, memory-patterns.md, project-doctrine.md §5) contre les PDFs réels. Pré-vol Phase 4 + durcissement du **pont de persistance §5.bis**. Net-new RES-060 (Registre Learning Records). Bonus RES-061 (3 Paradigmes) si budget < 80 %.

> **⚠️ Budget** : cycle lourd en PDFs-images (RES-060 12 p + RES-041 15 p + RES-007 2 p lus ce tour, après plusieurs cycles dans la session). Décision budget-consciente : **lecture intégrale de RES-060 + RES-041 uniquement** ; RES-007 glance ; RES-003 tranché sur glance antérieur ; **RES-044/034/045/029/056 NON re-vérifiés ce cycle** (distillés sous ère MCP) ; **bonus RES-061 NON distillé**. Items reportés explicitement flaggés (pas de faux « vérifié »).

## Table RES ↔ PDF (mémoire)

| RES | PDF | Lu ce cycle | Statut après |
|-----|-----|-------------|--------------|
| 029 | La vraie mémoire 5 registres + Obsidian | non (déjà local) | distilled memoire.md (non re-vérifié ce cycle) |
| 056 | Le sommaire que l'IA lit avant | non | distilled memoire.md (non re-vérifié) |
| 044 | Rituel close-out 3 champs | non | distilled memoire.md (**non re-vérifié — voir scan**) |
| 034 | Rituel consolidation 4 actions | non | distilled memoire.md (non re-vérifié) |
| 045 | Cadre mental par où commencer | non | distilled memoire.md (non re-vérifié) |
| **041** | Mémoire 3 niveaux + mapping outil | **oui (15 p)** | **distilled memory-patterns.md §RES-041 ✅ complété** |
| **007** | La Mémoire Projet pour ton IA | glance (2 p) | **superseded confirmé** (couvert 029+041) |
| **003** | L'Architecture Complète du Contexte | glance antérieur | **watch confirmé** (Phase 4/5) |
| **060** | Le Registre Learning Records | **oui (12 p)** | **distilled memoire.md ✅** (n° local) |
| 061 | Les 3 Paradigmes de la Gouvernance IA | non | backlog_next:Phase3.5 (n° local, **non distillé — budget**) |
| 014 | Prompt context agentic | — (orphelin) | reste orphelin |

## Table décisions

| RES | Décision | Justification |
|-----|----------|---------------|
| 060 | **adapt_now** | net-new, spec détaillée de `learnings.md` ; distillé memoire.md ; stats marketing neutralisées |
| 041 | **adapt_now** | partiel → complété (cadre 3 niveaux = backbone du pont §5.bis) |
| 007 | **reject (superseded)** | intro générique « pourquoi mémoire » + compat outils ; zéro contenu unique vs 029+041 (glance) |
| 003 | **watch** | overlaps 013/057/030 ; distill au pré-vol Phase 4/5 si design context-pack ; pas de net-new confirmé |
| 061 | **backlog_next:Phase3.5** | budget — non distillé ce cycle |

## SCAN ANTI-STAT-INVENTÉE

| Chiffre | PDF | Présent / sourcé ? | Verdict |
|---------|-----|--------------------|---------|
| « **95 %** des builders IA n'ont pas » | RES-060 | **TITRE seulement**, absent du corps, **non sourcé** | 🔴 headline marketing — **NON propagé** comme stat (flaggé dans memoire.md) |
| « LRN écrit 3 j après perd **50 %** de précision » | RES-060 | affirmation du corps, **non sourcée** | 🟠 non propagé comme stat (flaggé) |
| « **7 champs** » | RES-060 | annoncé « 7 » mais **8 listés** (Titre/Date/Sprint/Contexte/Découverte/Evidence/Impact/Application) | 🟡 incohérence du PDF signalée |
| archivage « **50 entrées** » | RES-060 | présent (« dépasse 50 → archive ») | ✅ factuel |
| « **90 % moins de tokens, 91 % plus rapide** » (Mem0) | RES-041 | présent **ET sourcé** : le PDF cite **arxiv 2504.19413** + benchmarks publics (dans son propre exemple EVAL) | ✅ sourcé — cité **avec** la source |
| « P95 **300 ms**, **20K+** stars » (Graphiti) | RES-041 | présent | ✅ factuel |
| friction « **n°9 / n°10** » (sub-agents MCP / 200+ entrées) | RES-044 | **NON re-vérifié ce cycle (budget)** | ⏳ **à vérifier prochaine passe** (risque type « 40 % Gartner ») |
| seuils 034 (promouvoir 3, index>50, 30 min/mois) | RES-034 | non re-vérifié | ⏳ à vérifier |
| 3 couches / diagnostic (045) | RES-045 | non re-vérifié | ⏳ à vérifier |

**Conclusion scan** : sur le **distillé ce cycle (060, 041)** → 1 piège neutralisé (« 95 % »), 1 stat correctement sourcée (« 90/91 % » arxiv). Sur l'**existant (044/034/045/029/056)** → re-vérification **différée (budget)**, flaggée comme dette, priorité « friction n°9/n°10 ».

## Fichiers touchés

- `docs/knowledge/vibeflow/memoire.md` — **+RES-060** (LRN détaillé, stats neutralisées) ; **+section Pont §5.bis** (réconciliation 3 modèles de registres) ; synthèse + note cycle.
- `docs/knowledge/memory-patterns.md` — **+RES-041** (cadre 3 niveaux stockage/rappel/décision ; N3=jugement ; mapping Mem0/Graphiti/OpenMemory ; Mem0 cloud rejeté §11 ; écart nommage ADR/BDR/EDR).
- `docs/knowledge/vibeflow/INDEX.md` — 041 distilled · 007 superseded confirmé · 003 watch confirmé · 060/061 numérotés (locaux) · catégories Gouv→14 / Mém→10 · Statut/radar/total.
- `docs/learning/2026-06-06-vibeflow-memoire-reaudit/build-report.md` — ce fichier.

**Non distillé de contenu** : project-doctrine.md (lu, sert de canonique — non modifié). Aucune édition `CLAUDE.md`. **Aucun code / schéma `data/memory/` / config / .env** (= BUILD Phase 4). §11 respecté.

## RES-041 complété (preuve)

Avant : memory-patterns.md avait les *outils* (Mem0/mem0/Graphiti, 4-niveaux agentmemory) mais **pas** le cadre conceptuel RES-041. Ajouté : **3 niveaux Stockage/Rappel/Décision** + insight « niveau 3 = jugement non-pluginnable » + les 3 registres N3 (ADR/LRN/EVAL) + rituel 3 questions + mapping outil N1-2 chiffré sourcé.

## RES-007 / 003 tranchés (preuve)

- **RES-007** (glance p.1-2) : « L'IA n'a pas de mémoire native… GPS sans historique » + section compat outils (Codex/Gemini/Cursor/Cline/Windsurf). = intro pédagogique. **Aucune structure unique** au-delà de 029 (5 registres) + 041 (3 niveaux). → **superseded confirmé**.
- **RES-003** (glance p.1 antérieur) : « fichiers, prompts, arborescence, prêt à copier » ; « le contexte décide ». Overlaps 013 (3 types fichiers) + 057 (base saine) + 030 (modes). Net-new possible = arborescence complète, mais non confirmé sans lecture profonde. → **watch tenu** ; distill au pré-vol Phase 4/5 **si** le design context-pack le justifie.

## Net-new RES-060 distillé (+ 061 bonus)

- **RES-060** → memoire.md : template LRN 8 champs, 4 déclencheurs, archivage 50 (jamais supprimer), règle CLAUDE.md « lire avant chaque décision », application Memory Keeper. Stats marketing (95 %, 50 %) **explicitement neutralisées**.
- **RES-061** → **NON distillé (budget)**. Reste backlog_next:Phase3.5, PDF prêt.

## ALIGNEMENT PONT DE PERSISTANCE §5.bis

3 modèles de registres réconciliés (section dédiée dans memoire.md) :

| Source | Modèle | Statut MAS |
|--------|--------|-----------|
| RES-013 (starter kit) | EDR / LEARNINGS / BLOCKERS / ITERATION_LOG / CONTEXT + MEMORY.md | variante |
| **RES-029 / project-doctrine.md §5** | **decisions / learnings / blockers / journal / evals** | **✅ canonique MAS** |
| RES-041 (niveau 3) | decisions (ADR) / learnings (LRN) / evals (EVAL) | sous-ensemble « jugement » |

- **MAS standardise sur RES-029** (superset). Mapping des variantes explicité (EDR≈decisions, ITERATION_LOG≈journal, CONTEXT≈SUMMARY).
- **Niveaux RES-041 → couches MAS** : N1-2 (stockage/rappel) = **QMD/FTS5** ; N3 (jugement) = les 5 registres écrits par le Memory Keeper. **Jamais déléguer N3 à un plugin.**
- **Pont concret** : Phase 4 seed `docs/knowledge/` → `data/memory/_global/` via Memory Keeper. Les LRN build-time = premières entrées du second cerveau.

## Contradictions signalées (pas intégrées en silence)

1. **Mem0 par défaut = embeddings OpenAI = PAYG → interdit §11.** MAS prend **QMD (100 % local)** pour N1-2 ; **Mem0 cloud rejeté**. (memory-patterns.md §RES-041 + §mem0.)
2. **Divergence de nommage du registre de décisions** : `ADR-XXX` (RES-041) vs `EDR` (RES-013) vs **`BDR-XXX` (project-doctrine MAS, retenu)**. Même artefact. MAS garde **BDR** — choix assumé, à tenir Phase 4.
3. **RES-013 (gouvernance.md) décrit encore le modèle EDR/CONTEXT/ITERATION_LOG** sans pointer le canonique RES-029. → **candidat self-audit** (harmonisation backlog).

## Questions ouvertes → RÉSOLUES (2026-06-06, réponses utilisateur)

Les 4 questions sont **tranchées**. Dette capturée dans `docs/backlog/self-audit-memoire-reaudit-debt.md` (créée par l'utilisateur) + pointée dans `docs/backlog/README.md`.

| Q | Réponse | Suite |
|---|---------|-------|
| 1. Scan stats différé — sous-cycle dédié ? | **NON** (trop cher : Doer+Checker pour ~5 chiffres = anti budget ~20 €) | **Foldé** dans un cycle combiné « distill RES-061 + verify stats mémoire » au pré-vol Phase 3.5/4. Priorité 1 = friction « n°9/n°10 » RES-044. Carte §1. |
| 2. Harmoniser RES-013 ↔ 029 ? | **OUI**, carte créée | Carte §2. **Pas de correction inline** ce cycle (touche gouvernance.md = autre catégorie + self-audit, hors scope mémoire). Cible pré-vol Phase 4. Nommage **BDR** retenu, à propager. |
| 3. RES-061 quand ? | Pré-vol **Phase 3.5**, combiné au stat-sweep Q1 (1 cycle, pas 2) | Déjà `backlog_next:Phase3.5` INDEX. |
| 4. RES-003 distill vs watch ? | **Garder watch** | Trancher au pré-vol Phase 4 (design context-pack, lecture profonde). Déjà `watch` INDEX. |

**Aucune question bloquante restante.** Dette tracée, rien ne se perd (3 couches : carte backlog + INDEX `backlog_next` + ce build-report).

## Commit proposé (NE PAS exécuter avant verdict Checker + arbitrage orchestrateur)

```bash
git add docs/knowledge/vibeflow/memoire.md \
        docs/knowledge/memory-patterns.md \
        docs/knowledge/vibeflow/INDEX.md \
        docs/learning/2026-06-06-vibeflow-memoire-reaudit/
git commit -m "docs(knowledge): distill memory reaudit (RES-060 LRN, RES-041 3 niveaux, pont §5.bis)"
```

Exclure `pnpm-lock.yaml` + carry-over des cycles précédents non commités. L'orchestrateur découpe.

**STOP** — aucune phase de build, aucun code, aucun schéma `data/memory/`. Working tree laissé modifié pour audit du Checker.

# VibeFlow — Mémoire & Contexte (patterns extraits)

Patterns issus des ressources Notion @le_gouverneur_ia, catégorie Mémoire. Source intégrale fetchée 2026-06-03. **Critique pour Phase 4.**

Doctrine racine : VibeFlow Philosophy, Principe P1 "Capitaliser : le projet n'oublie jamais" (github.com/picmakpro/vibeflow-lab). Référence scientifique : "after-action review" (US Army) → David Garvin HBR "Building a Learning Organization" (1993).

---

## RES-045 — Le déplacement de la valeur (modèle mental)

**Principe** : l'IA ne fait pas disparaître la valeur, elle la déplace. 3 couches :

| Couche | État avec IA | Pour MAS |
|--------|-------------|----------|
| **Exécution** (produire, coder, rédiger) | abondante → valeur ~0 | ce que les Tier B font |
| **Jugement** (quoi produire, est-ce bon) | rare, encore plus | ce que Tier A + l'humain font |
| **Ce qui s'accumule** (erreurs évitées, décisions, doctrine) | l'avantage incopiable | `data/memory/` — le cœur |

**Diagnostic "par où commencer"** (3 questions) :
1. Tu refais des erreurs déjà faites ? → commence par **learnings** (apprentissages)
2. Tu reviens sur une décision sans te souvenir pourquoi ? → commence par **decisions**
3. Tu as changé d'outil et tout reconstruit ? → commence par **doctrine** (principes séparés de l'implémentation)
4. Si paumé → **decisions** (le moins fait, le plus coûteux à reconstruire : on garde le résultat "on a choisi React", jamais le pourquoi ni l'alternative écartée).

**Application MAS** :
- **Quand tu fais tourner plusieurs agents en parallèle (= MAS), les 3 registres deviennent le centre de pilotage.** Multiplier l'exécution sans capitaliser = volume énorme + zéro mémoire.
- "Les agents lisent la doctrine avant d'agir" → CLAUDE.md = doctrine. Context Manager charge `SUMMARY.md` + doctrine au début de mission.
- **Pattern doctrine = principe stable EN HAUT + implémentation jetable EN BAS.** Quand on change d'outil/modèle, on jette l'implémentation, les principes restent. À appliquer dans CLAUDE.md (les règles §4-12 sont des principes ; les paths/commandes sont de l'implémentation).

---

## RES-044 — Rituel close-out de session : 3 champs, 5 min

**Principe** : capturer ≠ capitaliser. Un humain (ou agent validé) décide ce qui mérite de survivre. 3 champs, format strict, 5 min/session.

| Champ | Question déclenchante | Format | Test de validité |
|-------|----------------------|--------|------------------|
| **DECISIONS** | "Qu'ai-je tranché qui engage la suite ?" | 5 lignes : Date / Contexte / Choix / **Alternative refusée** / Conséquence | Si pas de réponse → tu as exécuté, pas décidé |
| **APPRENTISSAGES** | "Qu'est-ce qui changera ma façon de faire ?" | 3 lignes : Date / Apprentissage / Application | Si ça ne change rien → observation, pas apprentissage |
| **FRICTIONS** | "Qu'est-ce qui va revenir me mordre ?" | 3 lignes : Date / Friction / Workaround | Seuil 30 min. En dessous = bruit |

**Ligne la plus importante : "Alternative refusée"** — c'est elle qui contient le jugement. Une décision sans alternative écartée = un réflexe.

**Routine relecture hebdo (15 min/dimanche)** : décisions → matérialisées ? apprentissages → appliqués ? frictions → résolues/vivantes ? Au bout de 4 semaines, les patterns émergent.

**Application MAS Phase 4** :
- **C'est le workflow exact du Memory Keeper close-out.** Mais MAS l'automatise : à la fin de chaque mission, Memory Keeper scanne les events, propose des entrées BDR/LRN/BLK formatées, l'humain valide (autonomie `manual/assisted`) ou auto-accepte (autonomie `autonomous/autopilot`).
- Format BDR = les 5 lignes (Contexte/Choix/Alternative refusée/Conséquence). **Ajouter "Alternative refusée" au schéma decisions.md** — manquant dans le format actuel.
- Seuil 30 min pour BLK → critère déterministe pour le risk classifier de proposer un blocker.

**Friction n°9 du créateur (à noter)** : "les sub-agents Claude Code n'ont pas accès aux MCP tools du parent" → confirme notre contrainte depth=1 + le parent doit passer les URLs/résultats aux sous-agents (last_message pattern).

**Friction n°10** : "registres deviennent illisibles après 3 mois (200+ entrées)" → besoin d'un `MEMORY.md` index en tête (titre + 1 ligne) + ritualiser la lecture de l'index, pas des fichiers complets. → **C'est exactement le rôle de `SUMMARY.md`** (RES-056) dans MAS.

---

## RES-034 — Rituel de consolidation mémoire : 4 actions, 30 min/mois

**Principe** : capture sans consolidation = bruit. Plus tu accumules, moins l'agent s'en sert (3 entrées disent la même chose, un apprentissage parle d'un outil abandonné, un pattern récurrent jamais promu en règle). Une fois/mois, 30 min, faire respirer la mémoire.

**Les 4 actions** :

| Action | Déclencheur | Règle |
|--------|-------------|-------|
| **FUSIONNER** | Entrées qui répètent le même principe | 3 entrées identiques → 1 fusionnée + originaux dans `/archive/` |
| **ARCHIVER** | Outil/sprint/décision obsolète | **Jamais supprimer, toujours archiver** (coût stockage nul, coût perte énorme) |
| **PROMOUVOIR** | Pattern dans 3+ entrées | 3 occurrences = règle → monte dans CLAUDE.md. Pas 2 (coïncidence), pas 5 (trop tard) |
| **RÉORGANISER** | Index > 50 lignes | Grouper par thème + garder index chronologique brut en fallback |

**Template `consolidation-log.md`** : trace mensuelle (date, fusionnés, archivés, promus, réorganisé, durée). "La mémoire de ta mémoire."

**Application MAS Phase 4/5** :
- **Action PROMOUVOIR = le pipeline LRN → CLAUDE.md rule.** Quand un learning apparaît 3× → Memory Keeper propose une promotion en règle (via MemoryProposal type `rule_promotion`). Seuil 3 = déterministe.
- **Action ARCHIVER** → `data/memory/<projectId>/archive/YYYY-MM/`. Jamais de DELETE sur la mémoire (aligné CLAUDE.md §5 : rm gaté).
- **Action FUSIONNER + RÉORGANISER** → job mensuel du Memory Keeper (rituel automatisable, autonomie autopilot car non-risqué).
- Le `consolidation-log.md` = un 6e registre optionnel (méta-mémoire). À considérer Phase 5.
- **Anti-pattern "promouvoir trop tôt"** → garde-fou : ne jamais promouvoir un pattern à <3 occurrences. Évite de polluer CLAUDE.md avec des règles contradictoires.

---

## RES-029 — Mémoire agent : 5 registres (déjà local)

Contenu intégral dans `docs/claude doc/vrai-memoire-agent-claude.md`. Résumé : 5 registres `decisions.md` (BDR), `learnings.md` (LRN), `blockers.md` (BLK), `journal.md`, `evals.md` (EVAL) + rituel close-out + Obsidian comme amplificateur (graph view sur les wikilinks `[[BDR-001]]`).

**Application MAS** : la spec exacte de `data/memory/<projectId>/`. Voir `docs/knowledge/memory-patterns.md` §vrai-memoire.

---

## RES-056 — Le sommaire que ton IA lit avant (déjà local)

Contenu intégral dans `docs/claude doc/sommaire-que-l-IA-lit-avant-de-fouiller-sa-mémoire.md`. Résumé : un fichier sommaire/index que l'agent lit AVANT de fouiller la mémoire complète. Règle de lecture + prompt qui le maintient à jour.

**Application MAS** : c'est `data/memory/<projectId>/SUMMARY.md`, chargé par Context Manager au début de chaque mission. ≤500 tokens. Évite de recharger tous les registres.

---

## RES-060 — Le Registre Learning Records (LRN détaillé) [n° local, ex-net-new]

**Principe** : un Learning Record (LRN) capture UNE chose apprise (bug résolu, décision arbitrée, outil qui n'a pas tenu, règle de bon sens qui a échoué). Fichier `LEARNINGS.md` consulté par l'IA **avant chaque décision**. Capture en temps réel, pas en rétrospective.

> ⚠️ **Discipline anti-stat (piège vérifié)** : le titre « le fichier que **95 %** des builders IA n'ont pas » est un **chiffre de headline NON sourcé** (absent du corps du PDF). De même « un LRN écrit 3 jours après l'événement perd **50 %** de sa précision » = affirmation du PDF, **non sourcée**. → ne JAMAIS les répercuter comme statistiques dans la doctrine MAS.

**Template LRN** (le PDF annonce « 7 champs » mais en liste **8** — incohérence du PDF signalée) : `LRN-XXX` (ID) · Titre court · Date (YYYY-MM-DD) · Sprint/Phase · Contexte · **Découverte** (le fait brut, sans interprétation) · **Evidence** (comment on le sait : logs/données/screenshots) · **Impact** (ce qui change concrètement) · **Application** (comment le réutiliser). Pièges : titre trop long → index illisible ; confondre Découverte (fait) et opinion ; « c'est important » ≠ Impact.

**4 déclencheurs de capture** : (1) bug résolu, (2) décision arbitrée, (3) choix entre 2 options, (4) règle de bon sens qui échoue → écrire le LRN **tout de suite**.

**Archivage à 50 entrées** : `LEARNINGS.md` > 50 → archiver les plus anciens dans `archives/learnings-<trimestre>.md`, garder les 50 récents. **Règle absolue : compresser, jamais supprimer.** (Aligné RES-034 ARCHIVER.)

**Règle CLAUDE.md (4 points)** : lire `LEARNINGS.md` au début de session · citer les LRN pertinents avant de proposer une solution · proposer un LRN à chaque découverte/erreur/décision · ne jamais proposer une solution qui contredit un LRN sans justification explicite.

**Application MAS Phase 4** :
- **RES-060 = la spec détaillée du registre `learnings.md` (LRN-XXX)** de `project-doctrine.md §5` + RES-029. Le Memory Keeper écrit les LRN au format 8 champs.
- **4 déclencheurs = critères déterministes** pour qu'un `MemoryProposal` type `learning` soit émis en fin de mission.
- **Seuil 50 + jamais-supprimer** = aligné RES-034 + CLAUDE.md §5 (pas de DELETE mémoire) → `data/memory/<projectId>/archive/`.
- **« Lire avant chaque décision »** = Context Manager injecte SUMMARY/LRN pertinents (RES-056) ; « ne jamais contredire un LRN sans justification » = garde-fou Quality Controller.

---

## Pont de persistance §5.bis — réconciliation des modèles de registres (alignement explicite)

Le `knowledge-bootstrap.md §5.bis` exige que la mémoire Phase 4 **sème** depuis `docs/knowledge/`. Pré-requis : un modèle de registres **cohérent**. Or les sources vibeflow en présentent **trois** — réconciliés ici (aucun choix fait en silence) :

| Source | Modèle de registres | Statut MAS |
|--------|---------------------|-----------|
| RES-013 (starter kit, gouvernance.md) | EDR · LEARNINGS · BLOCKERS · ITERATION_LOG · CONTEXT + MEMORY.md (index) | variante « starter » |
| **RES-029 / project-doctrine.md §5** | **decisions · learnings · blockers · journal · evals** (BDR/LRN/BLK/EVAL) | **✅ canonique MAS** |
| RES-041 (3 niveaux, niveau 3) | decisions (**ADR-XXX**) · learnings (LRN) · evals (EVAL) | sous-ensemble du niveau « jugement » |

**Décision d'alignement** :
1. **MAS standardise sur le modèle RES-029** (`data/memory/<projectId>/` = decisions/learnings/blockers/journal/evals). C'est le superset.
2. **Mapping des variantes** : RES-013 `EDR`≈`decisions`, `ITERATION_LOG`≈`journal`, `CONTEXT`≈`SUMMARY.md` (RES-056) ; RES-041 `ADR-XXX` = même registre que `decisions` MAS.
3. ⚠️ **Écart de nommage signalé** : décision = `BDR-XXX` (project-doctrine MAS) vs `ADR-XXX` (RES-041) vs `EDR` (RES-013). **MAS garde `BDR-XXX`** — choix assumé, à tenir dans tout le code Phase 4. Les 3 désignent le même artefact.
4. **Niveaux RES-041 → couches MAS** : niveau 1-2 (stockage/rappel) = **QMD/FTS5** (retrieval, `memory-patterns.md`) ; **niveau 3 (jugement) = les 5 registres** écrits par le Memory Keeper. MAS ne délègue jamais le niveau 3 à un plugin.
5. **Le pont concret** : Phase 4 seed = `docs/knowledge/` (build-time) → `data/memory/_global/` (runtime) via Memory Keeper. Les LRN build-time (ce cycle = un learning sur la méthode) sont les premières entrées du second cerveau.

→ Reste un **candidat self-audit** : RES-013 (gouvernance.md) décrit encore le modèle EDR/CONTEXT/ITERATION_LOG sans pointer vers le canonique RES-029. À harmoniser (backlog).

---

## Séquence d'apprentissage recommandée (parcours @le_gouverneur_ia)

1. **RES-045** : cadre mental + par où commencer (diagnostic)
2. **RES-044** : discipline quotidienne (rituel close-out 5 min)
3. **RES-029** : structure complète (5 registres + Obsidian)
4. **RES-034** : maintenance (consolidation mensuelle, mois 2-3)

→ MAS implémente les 4 niveaux dans le Memory Keeper : capture (RES-029), close-out (RES-044), priorisation par valeur (RES-045), consolidation (RES-034).

---

## Synthèse — Mapping Phase 4

| Pattern | Composant MAS | Détail |
|---------|---------------|--------|
| Déplacement valeur (045) | architecture mémoire | doctrine=principe stable + implémentation jetable |
| Close-out 3 champs (044) | Memory Keeper post-mission | +"Alternative refusée" au schéma BDR |
| Consolidation 4 actions (034) | Memory Keeper job mensuel | FUSIONNER/ARCHIVER/PROMOUVOIR(seuil 3)/RÉORGANISER |
| 5 registres (029) | `data/memory/<projectId>/` | decisions/learnings/blockers/journal/evals |
| Sommaire (056) | `SUMMARY.md` | chargé par Context Manager, ≤500 tokens |
| LRN détaillé (060) | `learnings.md` spec | 8 champs · 4 déclencheurs · archivage 50 · règle « lire avant décision » |
| 3 niveaux + mapping outil (041) | QMD (N1-2) + 5 registres (N3) | voir `memory-patterns.md §RES-041` ; Mem0 cloud rejeté §11 |

**Distillation cycle `2026-06-06-vibeflow-memoire-reaudit`** : RES-060 (LRN détaillé) ✅ distillé ici ; RES-041 (3 niveaux) ✅ complété dans `memory-patterns.md` ; RES-007 superseded confirmé (couvert 029+041) ; RES-003 reste `watch` (Phase 4/5). Pont §5.bis réconcilié (modèle RES-029 canonique). ⚠️ scan stats des sections **045/044/034/029/056 non re-vérifié ce cycle (budget)** — distillées sous ère MCP, à re-vérifier prochaine passe (priorité : « friction n°9/n°10 » de RES-044). Bonus RES-061 non distillé (budget). Détail : `docs/learning/2026-06-06-vibeflow-memoire-reaudit/build-report.md`.

**✅ Stat-sweep cycle `2026-06-07-vibeflow-paradigmes-statsweep`** : les sections distillées sous ère-MCP **re-confrontées au PDF** — **0 statistique fabriquée présentée comme sourcée** (pas de profil « 40 % Gartner » dormant). Vérifs verbatim :
- **RES-044** : « friction n°9 » (sub-agents Claude Code sans accès aux MCP tools du parent, « 1 heure à debugger ») = PDF **Exemple 9** p8 ✅ ; « friction n°10 » (registres illisibles « après 3 mois, 200+ entrées ») = **Exemple 10** p8-9 ✅. *Nuance de label* : le PDF numérote « Exemple 9/10 » (les exemples 8-9-10 sont tous dans la section Frictions) — appeler « friction n°9/n°10 » est exact (ce sont les frictions n°9 et n°10 du décompte global), pas une invention.
- **RES-034** : « promouvoir 3 » (p8 « 3 occurrences = règle. Pas 2, pas 5 ») ✅ · « index > 50 lignes » (p9) ✅ · « 30 min/mois » (p5) ✅ · FUSIONNER 3→1 (p6) ✅ · ARCHIVER jamais-supprimer (p7) ✅.
- **RES-045** : 3 couches Exécution/Jugement/Ce-qui-s'accumule (p4-5) ✅ · diagnostic 3 questions + « si paumé → #2 decisions » (p6-7) ✅.
- **RES-029** (recoup) : « 95 % » est un **headline du PDF** (p1, « l'ordre faux chez 95 % ») **non répercuté** dans memoire.md → pas de propagation. « 5 registres » ✅.
- **RES-056** (recoup) : le « ≤500 tokens » de SUMMARY.md (§RES-056 ci-dessus) **n'est pas dans le PDF** (le PDF parle de « 150 lignes » comme seuil de réorganisation, « 800 lignes » comme symptôme) — c'est un **choix de budget MAS**, présenté comme tel, donc pas une stat-sourcée fabriquée. Observation mineure, pas une correction.

→ Dette §1 de `docs/backlog/self-audit-memoire-reaudit-debt.md` **apurée**. Détail : `docs/learning/2026-06-07-vibeflow-paradigmes-statsweep/build-report.md`.

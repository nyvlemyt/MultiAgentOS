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

**Ressource 404 à récupérer** : RES-041 "Mémoire 3 niveaux + mapping outil (Mem0/Graphiti/ADR/LRN)" — déjà partiellement couverte par `docs/knowledge/memory-patterns.md`. Voir INDEX.md.

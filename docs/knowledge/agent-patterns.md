# Patterns d'Architecture Multi-Agents

## Pattern : Manager d'Agent (Quality Controller)

**Concept utilisateur :** un agent qui s'assure que ce qui est fait est bien fait — règles respectées, architecture cohérente, conventions de dev.

**Rôle :** distinct du Reviewer (qui vérifie le code). Le Manager vérifie :
- Les sorties d'agents respectent les règles du projet (CLAUDE.md, eslint, conventions)
- L'architecture ne dérive pas (pas de nouveau framework sans ADR)
- Le token spend est justifié par la qualité produite
- Les agents n'ont pas "halluciné" une solution hors scope

**Provider recommandé :** Claude (raisonnement sur règles complexes) ou o1-mini (audit logique).

**Placement dans le pipeline :**
```
Mission Planner → [agents d'exécution] → Manager QC → Reviewer → SecReviewer → archive
```

## Pattern : Routing par Domaine (OpenHuman / agentmemory)

Source : tinyhumansai/openhuman, rohitg00/agentmemory

- Classifier la tâche avant de l'envoyer à un agent : `domain = search | code | review | plan | memory`
- Le router choisit le modèle optimal par domaine (voir Phase 3.5 dans ROADMAP)
- Fallback automatique si provider indisponible ou quota épuisé

## Pattern : Mémoire 4 Niveaux (agentmemory)

Source : rohitg00/agentmemory

| Niveau | Contenu | Durée de vie |
|--------|---------|-------------|
| Working memory | Outils appelés dans le turn courant | Turn |
| Episodic memory | Résumé de session | Session |
| Semantic memory | Faits, patterns extraits | Long terme |
| Procedural memory | Workflows, décisions | Long terme |

Capture automatique via hooks (SessionStart, PostToolUse, Stop) — pas de logging manuel.
Retrieval : BM25 + vector + knowledge graph fusionnés via Reciprocal Rank Fusion.

→ **Implication pour Phase 4 (Memory)** : notre Memory Keeper devrait implémenter ces 4 niveaux plutôt qu'un stockage plat.

## Pattern : Indexation Sémantique du Codebase (CodeGraph)

Source : colbymchenry/codegraph

- Construire un graphe SQLite des symboles du projet (fonctions, classes, imports, appels)
- L'agent interroge le graphe au lieu d'explorer le filesystem à chaque fois
- Résultats mesurés : -62% appels d'outils, -25% coût de tokens, fraîcheur maintenue par file-watcher

→ **Implication pour Context Manager** : au lieu d'un context pack statique (`data/context-packs/<id>.md`), construire un index CodeGraph par projet. Phase 5+ ou option du Context Manager.

## Pattern : Contrôle d'Escalade (academic-research-skills-codex)

- L'agent ne spawn pas de sous-agents automatiquement — escalade explicite uniquement
- Pour les tâches floues : Socratic questioning avant d'agir (demander clarification plutôt qu'inventer)
- Vérification croisée par un second modèle optionnelle (env var) — économise les tokens

## Pattern : Token Compression (OpenHuman / TokenJuice)

- Comprimer les outputs d'outils avant injection LLM : -80% tokens, sémantique préservée
- Pertinent pour notre Caveman mode éco — appliquer la compression aux tool outputs des agents

## Références

- https://github.com/colbymchenry/codegraph
- https://github.com/rohitg00/agentmemory
- https://github.com/tinyhumansai/openhuman
- https://github.com/Imbad0202/academic-research-skills-codex

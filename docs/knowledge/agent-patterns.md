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

## Pattern : Test Binaire Skill vs Agent (RES-035 @le_gouverneur_ia)

Source: `docs/claude doc/ressources.md` RES-035 + Anthropic "Building Effective Agents"

**Question unique** : "Est-ce que cette chose doit ARBITRER ?"
- **OUI** → AGENT (acteur autonome avec mandat, décisions dans son scope, escalade définie)
- **NON** → SKILL (savoir injectable, informe l'agent mais ne décide pas)

**3 critères obligatoires pour qu'un rôle soit un agent** (les 3 doivent être présents) :
1. **Mandat écrit** : mission documentée en 1-2 phrases
2. **Décisions seul dans son scope** : peut trancher sans demander à l'humain à chaque fois
3. **Escalade claire hors scope** : sait à qui passer la main quand hors périmètre

**Erreurs classiques** :
- Agent sans mandat → assistant flou qui dérive
- Skill qui prend des décisions → agent non gouverné (dangereux)
- Orchestrateur qui produit du livrable → plus rien n'orchestre

→ **Application MAS** : appliquer avant de créer chaque fiche Tier B. Un Tier B qui "décide" de l'architecture = Tier A mal rangé.

---

## Pattern : 3 Modes d'Audit Agent en Production (RES-037)

Source: `docs/claude doc/ressources.md` RES-037

| Mode | Comportement | Usage MAS |
|------|-------------|-----------|
| **STRICT** | Bloque l'action si non-conforme | missions `risk: high` ou `blocking` |
| **AUDIT** | Trace + rapport sans bloquer | missions standard pour monitoring |
| **SHADOW** | Observe silencieusement | missions eco, autopilot non-critique |

Quality Controller choisit son mode selon le `risk` enum de la mission.

---

## Pattern : Spec-Driven Decomposition (github/spec-kit)

Source: https://github.com/github/spec-kit — analysé audit Phase 3

Workflow: `specify → plan → tasks → implement → clarify → analyze`
- `/speckit.specify` : définit requirements et user stories
- `/speckit.plan` : stratégie d'implémentation
- `/speckit.tasks` : breakdown actionnable
- `.specify/memory/constitution.md` : principes persistants du projet (≈ notre CLAUDE.md)

→ **Application MAS** : Mission Planner suit implicitement ce workflow. Pour les missions complexes, le pattern "constitution → spec → tasks" structure la décomposition. Ne pas installer spec-kit (doublon superpowers), extraire le pattern.

---

## Pattern : depth=1 — Contrainte Architecturale SDK (ABSOLUE)

Source: `docs/knowledge/anthropic-ecosystem.md`

**Les subagents ne peuvent PAS spawner leurs propres subagents.** Confirmé dans la doc officielle SDK. Non contournable via l'API Managed Agents.

```
Mission Planner (worker principal)
  → Tier A (Tier A ne spawn pas d'autres Tier A comme subagents)
  → Tier B (depth=1 max depuis le worker principal)
  ✗ Tier B ne peut PAS spawner Tier C
```

Pour les missions nécessitant >16 agents : utiliser **Dynamic Workflows** (Claude Code feature, Phase 6+).

→ **Implication** : l'architecture Tier A/Tier B est la SEULE valide. Pas de Tier C. Jamais.

---

## Pattern : bobmatnyc/claude-mpm — Implémentation de Référence

Source: https://github.com/bobmatnyc/claude-mpm (129 stars) — `docs/knowledge/frameworks-comparison.md`

**L'implémentation open-source la plus proche de MultiAgentOS.**

Architecture :
- PM agent central + 47 agents spécialisés
- **Channel Hub** = message bus multi-sessions → pattern pour connecter le worker MAS aux sessions Claude Code des projets externes (`cwd = project.path`)
- **ETag-based agent caching** → 95% réduction bande passante → pattern pour `data/skill-cache/<id>/summary.md` (`known_pack_hash`)
- Deux modes : CLI (subprocess) et SDK (in-process) → MAS doit supporter les deux selon niveau autonomie

→ **À lire en Phase 5** avant d'implémenter le dispatcher complet.

---

## Pattern : last_message vs full_history sur Handoff Tier A → Tier B

Source: `docs/knowledge/frameworks-comparison.md` (LangGraph patterns)

Sur chaque handoff d'un orchestrateur vers un worker :
- `full_history` : contexte complet passé au worker → **COÛTEUX, à éviter**
- `last_message` : seulement le dernier message + context pack → **ÉCONOMIQUE, recommandé**

→ **MultiAgentOS doit utiliser `last_message`** pour les handoffs Tier A → Tier B, conformément à `TOKEN_STRATEGY.md`. Le context pack du projet compense l'absence d'historique.

---

## Pattern : Quota Consumption — Estimations Budget

Source: `docs/knowledge/frameworks-comparison.md`

| Type de session | Multiplicateur quota |
|----------------|---------------------|
| Chat normal Claude.ai | 1× |
| Agent simple | ~4× |
| Multi-agent research | ~15× |

→ **Application MAS** : une mission en mode `expert` avec 4 Tier B = ~16-60× une conversation normale. Impacte directement les seuils d'alerte dans `TOKEN_STRATEGY.md §8`. À prendre en compte pour les estimations de budget par mission.

---

## Pattern : msitarzewski/agency-agents — Source Tier B Phase 5

Source: https://github.com/msitarzewski/agency-agents — analysé audit Phase 3

144+ agents en Markdown natif Claude Code, 12 domaines. Format riche (personality traits, workflow processes, deliverables) mais verbeux. Nos fiches Tier B ont un schema plus économique.

→ **Utilisation** : Phase 5, extraire les sections "workflow process" et "deliverables" des agents agency-agents correspondant à nos rôles. Adapter au schema MAS (budget, escalate_when, tools≤7, output_format). Pas d'import direct.

---

## Références

- https://github.com/colbymchenry/codegraph
- https://github.com/rohitg00/agentmemory
- https://github.com/tinyhumansai/openhuman
- https://github.com/Imbad0202/academic-research-skills-codex
- https://github.com/bobmatnyc/claude-mpm
- https://github.com/msitarzewski/agency-agents
- https://github.com/github/spec-kit
- `docs/claude doc/ressources.md` RES-035, RES-037
- `docs/knowledge/anthropic-ecosystem.md`
- `docs/knowledge/frameworks-comparison.md`

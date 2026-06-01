# Comparaison Frameworks Multi-Agents

## Tableau de décision

| Framework | Stars | Compatibilité Claude | Billing | Priorité MultiAgentOS | Usage |
|-----------|-------|---------------------|---------|----------------------|-------|
| **Claude Agent SDK** | 7 100 | Native | Subscription ✓ | CRITIQUE | Moteur principal |
| **Claude Agent Teams** | N/A | Native | Subscription ✓ | HAUTE | Patterns blockedBy, heartbeat |
| **LangGraph** | 50k+ | API standard | Variable | HAUTE | Patterns checkpointing HITL |
| **wshobson/agents** | — | Native CC | Subscription ✓ | HAUTE | 16 orchestrators, 3-tier routing |
| **bobmatnyc/claude-mpm** | 129 | Native Claude | Subscription ✓ | HAUTE | Architecture la + proche MultiAgentOS |
| **OpenAI Agents SDK** | 19k | NON (PAYG) | PAYG ✗ | PATTERNS ONLY | Handoffs, guardrails patterns |
| **CrewAI** | 35k+ | API standard | Variable | MOYENNE | Rôles YAML, consensual process |
| **MetaGPT** | 57k+ | API standard | Variable | MOYENNE | AFlow pour décomposition missions |
| **mem0** | 57k+ | Multi-vendor | Variable | HAUTE | Mémoire cross-session |
| **A2A Protocol** | 22k | Multi-vendor | N/A | BASSE (Phase 6+) | Agent Cards cross-vendor |
| **Google ADK** | — | NON natif | Gemini | BASSE | Inspiration workflow runtime |
| **AutoGen/AG2** | 55k | API standard | Variable | BASSE | Pattern débat seulement |

---

## Claude Agent Teams (feature expérimentale Claude Code)

URL: feature intégrée à Claude Code v2.1.32+
Enable: `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS: "1"`

### 13 opérations TeammateTool
`spawnTeam`, `write`, `broadcast`, `requestJoin`, `approveShutdown`, `approvePlan`, `rejectPlan`...

### Trois patterns natifs
| Pattern | Description | Usage MultiAgentOS |
|---------|-------------|-------------------|
| **Leader** | Hub-and-spoke | Architecture principale Tier A → Tier B |
| **Swarm** | Shared task queue | Mode autopilot avec tâches indépendantes |
| **Pipeline** | `blockedBy` dependencies | Tasks avec dépendances strictes |

### Patterns directement transposables
- **`blockedBy` dependencies** → modèle exact pour `depends_on` dans la table `tasks` Drizzle
- **Heartbeat timeout (5 min)** → valeur de référence pour `job_timeout` du worker
- **`broadcast` + `approvePlan`** → pattern pour les validation gates §5

---

## LangGraph — Patterns HITL

URL: https://github.com/langchain-ai/langgraph — Stars: 50k+

### Pourquoi relevant malgré la non-compatibilité directe
Les patterns architecturaux de LangGraph sont transposables même sans utiliser LangGraph.

### Pattern checkpointing → table `tasks` Drizzle
```typescript
// Inspiré du LangGraph interrupt pattern
// Chaque task a un checkpoint state stocké en DB
interface Task {
  id: string;
  status: 'todo' | 'running' | 'needs_validation' | 'done' | 'blocked';
  checkpoint_id?: string;    // État sérialisé pour resume
  depends_on: string[];       // blockedBy pattern
  heartbeat_at?: Date;        // 5-min timeout pattern
}
```

### `full_history` vs `last_message` sur handoff
- `full_history` → contexte complet passé au worker (coûteux)
- `last_message` → seulement le dernier message (économique)
→ **MultiAgentOS doit utiliser `last_message`** pour les handoffs Tier A → Tier B pour respecter TOKEN_STRATEGY.md

---

## bobmatnyc/claude-mpm

URL: https://github.com/bobmatnyc/claude-mpm — Stars: 129

**L'implémentation open-source la plus proche de MultiAgentOS.**

### Architecture
- PM agent central + 47 agents spécialisés (Python, TS, Rust, Go, Java...)
- Channel Hub = message bus multi-sessions
- ~60 services event-driven
- Deux modes : CLI (subprocess) et SDK (in-process, expérimental)
- ETag-based agent caching (95% réduction bande passante)

### Patterns directement réutilisables
- **Channel Hub multi-sessions** → connecter le worker MultiAgentOS aux sessions Claude Code des projets externes (`cwd = project.path`)
- **ETag caching** → implémentation de `data/skill-cache/<id>/summary.md` (§6 TOKEN_STRATEGY)
- **CLI vs SDK mode** → MultiAgentOS doit supporter les deux selon le niveau d'autonomie

---

## Architecture Decision : depth=1 est une contrainte dure

La contrainte du Claude Agent SDK que les subagents ne peuvent pas spawner leurs propres subagents **est fondamentale** pour l'architecture de MultiAgentOS.

### Ce que ça implique
```
Mission Planner (Tier A)
  → Skill Router (Tier A)       ← 1er niveau
    → Pas de sous-agents ici     ← impossible
  → Context Manager (Tier A)    ← 1er niveau  
  → engineering-frontend (Tier B) ← 1er niveau

MAX DEPTH : 1 subagent depuis le coordinateur principal
```

### Comment contourner pour des hiérarchies complexes
1. **Workflow tool** (Claude Code Dynamic Workflows) pour >16 agents
2. **Séquencer les missions** plutôt que les imbriquer
3. **Attendre la feature Agent Teams stable** pour depth>1

---

## Patterns d'orchestration — Choix par cas d'usage

| Cas d'usage | Pattern recommandé | Latence | Coût |
|------------|-------------------|---------|------|
| Mission standard (4-6 tâches) | Orchestrator-Worker | 2-5s/task | Moyen |
| Tâches indépendantes (autopilot) | Fan-Out / Fan-In | Parallèle | Faible |
| Tâches avec dépendances | Pipeline séquentiel | Séquentiel | Faible |
| Décision risquée §5 | Débat (Judge pattern) | 2.5× standard | Élevé |
| Mission massive (>20 tâches) | Dynamic Workflow | Background | Variable |

---

## Contrôle des coûts — Formule de budget

```
monthly_tokens = sessions × turns × (input_tokens + output_tokens × 3..5)
```

Output tokens coûtent 3-5× les input tokens sur Sonnet-class.

### Seuils d'alerte recommandés
- 70% budget → badge discret dans topbar
- 90% budget → banner rouge + notification
- 100% budget → action `budget_exceeded` → pause + ask

### Hiérarchie de circuit breakers
1. Per-task: `maxTurns` dans `AgentDefinition`
2. Per-mission: `budgetTokens` dans table `missions`
3. Per-project: `monthlyBudgetCents` dans table `projects`
4. Global: `budgets` table + TOKEN_STRATEGY.md §8

---

## Ressources

- https://github.com/langchain-ai/langgraph
- https://github.com/bobmatnyc/claude-mpm
- https://github.com/wshobson/agents
- https://github.com/crewaiinc/crewai
- https://github.com/microsoft/autogen
- https://openai.github.io/openai-agents-python/
- https://github.com/google/adk-python
- https://github.com/FoundationAgents/MetaGPT
- https://github.com/a2aproject/A2A
- https://platform.claude.com/docs/en/managed-agents/multi-agent
- https://code.claude.com/docs/en/agent-sdk/subagents

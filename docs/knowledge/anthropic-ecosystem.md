# Écosystème Officiel Anthropic

## Repos GitHub officiels prioritaires

| Repo | Stars | Usage |
|------|-------|-------|
| `anthropics/claude-agent-sdk-typescript` | 7 100 | Moteur central du worker |
| `anthropics/skills` | 145 000 | Référence canonique du format SKILL.md |
| `obra/superpowers` | 215 000 | Framework de skills déjà intégré |
| `anthropics/claude-agent-sdk-demos` | — | Exemples officiels orchestration |
| `anthropics/prompt-eng-interactive-tutorial` | — | 9 chapitres Jupyter, officiel Claude |
| `VILA-Lab/Dive-into-Claude-Code` | 1 400 | Analyse interne Claude Code (512K lignes) |

---

## Claude Agent SDK — Contraintes critiques

Source: https://code.claude.com/docs/en/agent-sdk/overview

### AgentDefinition champs complets
```typescript
{
  description: string,       // trigger automatique via sémantique
  prompt: string,
  tools: string[],
  disallowedTools: string[],
  model: 'opus' | 'sonnet' | 'haiku' | string,
  skills: string[],
  memory: MemoryConfig,
  mcpServers: MCPServerConfig[],
  maxTurns: number,          // hard cap tokens indirectement
  background: boolean,       // true = autopilot async
  effort: 'low'|'medium'|'high'|'xhigh'|'max',
  permissionMode: PermissionMode,
}
```

### Contrainte ABSOLUE : depth = 1
**Les subagents ne peuvent PAS spawner leurs propres subagents.** Confirmé dans la doc officielle. Cette contrainte est architecturale et non contournable via l'API Managed Agents. Seul le Claude Code Agent SDK headless avec la feature "Agent Teams" (expérimentale) permet plus d'un niveau.

→ **Implication pour MultiAgentOS** : l'architecture Tier A (orchestrateurs) / Tier B (workers) est la seule architecture valide avec le SDK. Pas de Tier C.

### Session resume
```typescript
// Capturer le session_id depuis le premier résultat
const sessionId = result.session_id;
// Réutiliser sur les tours suivants
query({ prompt: "...", options: { resume: sessionId } })
```

### Billing depuis le 15 juin 2026
Usage Agent SDK sur plans subscription = crédit mensuel **séparé** des conversations Claude.ai.

---

## Hooks — 27 événements pour les risky action gates

Source: https://code.claude.com/docs/en/hooks

Les hooks sont **garantis** (déterministes). Les instructions CLAUDE.md sont **advisory**.

### Événements clés pour MultiAgentOS
| Hook | Usage MultiAgentOS |
|------|-------------------|
| `PreToolUse` | Gate avant toute action dangereuse (§5 CLAUDE.md) |
| `PostToolUse` | Audit log pour la table `events` |
| `PermissionRequest` | Intercepter les demandes de permission |
| `SessionStart` | Injecter le context pack projet |
| `Stop` | Résumer session → Memory Keeper |
| `SubagentStart/Stop` | Traçage des subagents dans `/trace` |

### Exit codes hooks
- `0` → allow
- `2` → block + message à Claude
- Autres → erreur non-bloquante

### Pattern audit log complet
```json
{
  "hooks": {
    "PostToolUse": [{
      "type": "command",
      "command": "echo '$HOOK_DATA' >> data/audit.jsonl"
    }]
  }
}
```

---

## Dynamic Workflows (research preview, Mai 2026)

Source: https://code.claude.com/docs/en/workflows

- **Objectif** : orchestration à grande échelle (16 agents concurrents, 1000 max/run)
- Claude écrit un script JavaScript → exécuté en background
- Résultats dans les variables du script, pas dans le context Claude
- Disponible dans `claude -p` et Agent SDK
- Trigger : mot-clé `workflow` dans le prompt ou `/effort ultracode`
- `/deep-research` = workflow bundlé pour recherche multi-sources

→ **Implication MultiAgentOS Phase 6+** : pour les missions autonomes complexes (audits codebase entier, migrations).

---

## SKILL.md — Spécification officielle

Source: https://agentskills.io/specification + https://github.com/anthropics/skills

### Structure canonique
```
.claude/skills/[skill-name]/
├── SKILL.md              # YAML frontmatter + body ≤500 lignes
├── references/           # docs supplémentaires (1 niveau max)
│   └── *.md
├── scripts/              # code déterministe exécutable
└── assets/               # templates statiques
```

### YAML frontmatter obligatoire
```yaml
---
name: skill-name-kebab-case   # ≤64 chars, lowercase+hyphens
description: |                # ≤1024 chars, third person
  [Ce skill fait X. Utiliser quand Y. Ne PAS utiliser pour Z.]
---
```

**Les negative triggers sont aussi importants que les triggers positifs** dans la description.

### Progressive disclosure — 3 niveaux
- **L1** (~100 tokens/skill) : metadata seule — chargée au démarrage du worker
- **L2** (<5000 tokens) : SKILL.md complet — chargé à l'activation
- **L3** : fichiers references/ on-demand

→ **Implication Phase 3** : `packages/skills/router.ts` doit implémenter ce lazy loading.

---

## Anthropic Academy (lancé mars 2026)

URL: https://anthropic.skilljar.com/

Cours prioritaires pour MultiAgentOS :
1. Introduction to Subagents
2. Introduction to Agent Skills
3. Building with the Claude API (84 leçons, 8h+)
4. Introduction to Model Context Protocol
5. MCP: Advanced Topics

---

## Building Effective Agents — 5 patterns officiels

Source: https://www.anthropic.com/research/building-effective-agents

| Pattern | Description | Usage MultiAgentOS |
|---------|-------------|-------------------|
| Prompt Chaining | Output → Input séquentiel | Pipeline de tâches dépendantes |
| Routing | Classifier → agent spécialisé | Dispatcher Tier A → Tier B |
| Parallelization | Sectioning + voting | Fan-out missions autopilot |
| Orchestrator-Workers | Hub + workers stateless | Architecture principale Tier A/B |
| Evaluator-Optimizer | Output → critique → retry | Quality Controller gate |

**Règle d'or Anthropic** : "Start with simple prompts, add complexity only when simpler solutions measurably fail."

**ACI (Agent-Computer Interface)** : concevoir les tools mérite autant d'attention que les prompts. Formats naturels (pas d'escape chars, pas de comptage de lignes). Poka-yoke pour prévenir erreurs.

---

## Context Engineering — Principes clés

Source: https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents

1. **"Smallest possible set of high-signal tokens"** — traiter le context comme ressource finie
2. **Context rot** : performances dégradées quand le context se remplit (n² token relationships)
3. **Compaction** : résumer en préservant décisions architecturales + issues non résolues
4. **NOTES.md pattern** : mémoire externe persistante pour continuité cross-context
5. **Sub-agent context** : agents spécialisés retournent 1000-2000 tokens compressés au coordinateur
6. **Just-in-time retrieval** : références légères plutôt que préchargement
7. **"Diminishing marginal returns"** des tokens supplémentaires

---

## Résumé : à implémenter par phase

| Phase | Action | Source |
|-------|--------|--------|
| Phase 3 | Lazy loading skills L1/L2/L3 | SKILL.md spec |
| Phase 3 | `effort` param dans claudeCodeLLM depuis Mode | SDK docs |
| Phase 3 | Hooks PreToolUse pour risky gates | Hooks docs |
| Phase 4 | Context packs avec Just-in-time retrieval | Context Engineering |
| Phase 4 | Session resume stocké dans `projects.sessionId` | SDK session docs |
| Phase 6+ | Dynamic Workflows pour missions lourdes | Workflows docs |

# Skills et Librairies de Référence

## Librairies de skills prioritaires

| Repo | Stars | Contenu |
|------|-------|---------|
| VoltAgent/awesome-agent-skills | — | 1400+ skills de 30+ orgs (Anthropic, Stripe, Vercel...) |
| addyosmani/agent-skills | — | 23 skills lifecycle complets (Define→Plan→Build→Verify→Review→Ship) |
| muratcankoylan/Agent-Skills-for-Context-Engineering | — | 15 skills modulaires context engineering |
| Piebald-AI/claude-code-system-prompts | — | Tous les system prompts de Claude Code v2.1 (~40 agent prompts) |
| repowise-dev/claude-code-prompts | — | 35+ templates organisés en 6 catégories |
| obra/superpowers | 215 000 | Framework skills déjà intégré dans MultiAgentOS |
| wshobson/agents | — | 83 plugins, 191 agents, 155 skills — marketplace cross-CLI |

---

## Format SKILL.md — Spec officielle

Source: https://agentskills.io/specification

```
.claude/skills/[skill-name]/
├── SKILL.md              # YAML frontmatter + body ≤500 lignes
├── references/           # docs supplémentaires (1 niveau max)
│   └── *.md
├── scripts/              # code déterministe exécutable
└── assets/               # templates statiques
```

### YAML frontmatter complet
```yaml
---
name: skill-name-kebab-case       # ≤64 chars, lowercase+hyphens
description: |                    # ≤1024 chars, third person
  Use this skill when [trigger positifs].
  Do NOT use for [triggers négatifs].
---
```

**Règle clé** : les negative triggers ("Do NOT use for X") sont aussi importants que les triggers positifs pour éviter les mauvaises activations dans le dispatcher.

---

## Progressive Disclosure — 3 niveaux

Inspiré de muratcankoylan/Agent-Skills-for-Context-Engineering et la spec officielle :

| Niveau | Contenu | Tokens | Quand charger |
|--------|---------|--------|---------------|
| L1 | `name` + `description` (metadata) | ~100/skill | Toujours — au démarrage worker |
| L2 | `SKILL.md` complet | <5000 | À l'activation de la skill |
| L3 | Fichiers `references/` + `scripts/` | Variable | On-demand sur besoin spécifique |

→ **Implication Phase 3** : `packages/skills/router.ts` charge L1 pour tous les skills au démarrage, hydrate L2/L3 seulement quand un skill est sélectionné pour une tâche.

---

## Patterns de Skills (addyosmani/agent-skills)

### Structure lifecycle skill
```
SKILL.md
├── YAML frontmatter (name, description avec triggers positifs ET négatifs)
├── Overview (1-2 paragraphes)
├── When to Use
├── Process (étapes numérotées)
├── Rationalizations Table (anti-excuses → contre-arguments)
├── Red Flags (signes que le skill est mal utilisé)
└── Verification Criteria (critères binaires pass/fail)
```

### Table des rationalisations (pattern unique)
La table des rationalisations force l'agent à ne pas se décharger :

| Excuse | Réalité |
|--------|---------|
| "C'est juste une petite tâche" | Les petites tâches deviennent complexes. Utiliser le skill. |
| "Je me souviens de ce skill" | Les skills évoluent. Lire la version actuelle. |
| "Ça ne compte pas comme une tâche" | Action = tâche. Vérifier avant de faire. |

---

## Patterns de Context Engineering (muratcankoylan)

### Signal-density test
Avant d'injecter du contexte : **si sa suppression ne changerait pas l'output, ne pas l'injecter.**
→ Applicable à `TOKEN_STRATEGY.md §6` et le mode éco.

### Observation masking
Remplacer les verbose tool outputs par des résumés compacts avant injection LLM.
```
file_read(path) → résumé 50 tokens plutôt que contenu brut 2000 tokens
```

### Routage explicite inter-skills
Chaque fichier SKILL.md peut référencer les autres skills :
```markdown
## Related Skills
- Use `security-review` after this skill for high-risk tasks
- Combine with `test-driven-development` for implementation tasks
```

---

## System Prompts de Production (Piebald-AI + repowise)

### Architecture des prompts Claude Code (Piebald-AI)
Source: https://github.com/Piebald-AI/claude-code-system-prompts

- **Fragments conditionnels** : pas un monolithe, mais des fragments réassemblés selon contexte
- **System reminders injectés dynamiquement** selon l'état de la session
- **Titres descriptifs + token counts** pour chaque fragment
- ~40 agent prompts, ~60 system prompts, ~130 tool descriptions, ~40 system reminders

### Pattern adversarial verification (repowise)
Source: https://github.com/repowise-dev/claude-code-prompts

```
Coordinator → Builder (implémente)
           → Verifier (évalue indépendamment avec verdict PASS/FAIL/PARTIAL)
           → Résultat intégré
```

→ Exactement le rôle du Quality Controller dans AGENTS.md.

### Pattern de safety tiering
```
Actions normales → auto-approve
Actions avec impact external → validation requise
Actions destructives → confirmation explicite + review
```

---

## Three-Tier Model Strategy (wshobson/agents)

Source: https://github.com/wshobson/agents

```typescript
const MODEL_ROUTING = {
  risk_high: 'claude-opus-4-8',     // architecture, sécurité, décisions critiques
  risk_medium: 'claude-sonnet-4-6', // backend, frontend, ML
  risk_low: 'claude-haiku-4-5',     // docs, indexing, résumés, déploiement
};
```

→ Implémentation dans `packages/core/src/llm.ts` Phase 3.5.

---

## Techniques de Prompting Avancées

### Self-Consistency (Google, 2022 → toujours SOTA 2026)
- CoT booste précision de 10-20%
- Self-consistency (multiples chemins + vote majoritaire) ajoute +12-18% vs CoT seul
- **Applicabilité** : décomposition de missions → générer 3 plans → voter sur le meilleur

### GEPA — Reflective Prompt Evolution (ICLR 2026 Oral)
Source: https://github.com/gepa-ai/gepa
- Pattern "observe → reflect → mutate → test" pour amélioration itérative des skills
- Outperforms GRPO de +6pp, MIPROv2 de +12pp, avec 35× moins de rollouts
- **Applicabilité Phase 5+** : auto-amélioration des skills à partir des traces d'exécution

### Anthropic Prompt Improver — 4 étapes
1. Identification des exemples existants
2. Draft initial avec sections XML
3. Chain-of-thought détaillé
4. Amélioration des exemples
→ Utiliser via Console pour développer les fiches agents

---

## Skills à créer pour MultiAgentOS

Basé sur l'audit des ressources. Ces skills n'existent pas encore dans `.claude/skills/` :

| Skill | Domain | Source d'inspiration |
|-------|--------|---------------------|
| `quality-controller` | code-review | repowise adversarial verification |
| `context-pack-builder` | memory | codex-agent-mem pattern |
| `skill-router-advanced` | planning | wshobson three-tier |
| `agent-budget-monitor` | planning | 12-Factor factor 3 |
| `plan-then-execute` | planning | Simon Willison |
| `multi-agent-coordinator` | planning | LangGraph HITL pattern |

---

## Ressources à explorer

- VoltAgent/awesome-agent-skills : https://github.com/VoltAgent/awesome-agent-skills
- addyosmani/agent-skills : https://github.com/addyosmani/agent-skills
- muratcankoylan context engineering : https://github.com/muratcankoylan/Agent-Skills-for-Context-Engineering
- Piebald system prompts : https://github.com/Piebald-AI/claude-code-system-prompts
- repowise prompts : https://github.com/repowise-dev/claude-code-prompts
- wshobson/agents : https://github.com/wshobson/agents

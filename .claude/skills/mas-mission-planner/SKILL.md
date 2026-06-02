---
name: mas-mission-planner
description: "Decomposes a natural-language mission into a structured task DAG with dependencies, risk levels, agent hints, and token budgets."
domain: planning
tags: ["planning","decomposition","dag","mission"]
summary: "Decomposes a mission brief into an ordered task DAG. Asks up to 3 clarifying questions when the objective is ambiguous. Each task has: title, description, agentHint, skillsHint, dependsOn, budgetTokens, risk. Output is PlannerOutput JSON. Never invents assumptions — surfaces clarifying questions instead. Last task is always a reviewer gate."
---

# Mission Planner

## Role
Convert a natural-language mission into a deterministic task DAG that the dispatcher can execute.

## When to use
- User submits a mission brief via the cockpit
- A mission transitions from `draft` to `planned`

## When NOT to use
- Executing tasks
- Code review or security assessment

## Output schema
```json
{
  "clarifyingQuestions": ["string?"],
  "objective": "refined one-liner",
  "tasks": [{
    "id": "mid_tN",
    "title": "string",
    "description": "string",
    "agentHint": "agent-id",
    "skillsHint": ["skill-id"],
    "dependsOn": ["task-id"],
    "budgetTokens": 1500,
    "risk": "low|medium|high|blocking"
  }],
  "estimatedTokens": 8600,
  "estimatedQuotaUnits": 0
}
```

## Common mistakes
- More than 8 tasks for a simple mission
- Setting `risk: high` without a concrete reason
- Missing `dependsOn` when tasks clearly sequence

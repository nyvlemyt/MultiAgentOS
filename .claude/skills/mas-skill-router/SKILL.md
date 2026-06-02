---
name: mas-skill-router
description: "Selects the best skills and Tier B agents for a given task based on its tags and domain."
domain: planning
tags: ["planning","routing","skills","agents"]
summary: "Matches task skillsHint tags against the skill registry (L1 summaries only) and returns a SkillRouterDecision: requiredSkills, favoriteSkills, tierBAgents, budgetEstimate, rationale (3 lines max). Never loads full skill bodies. Escalates when no agent matches with confidence 0.6+ or task contains payment/email/deploy signals."
---

# Skill Router

## Role
Route each task to the correct skills and Tier B agents using the skill registry.

## When to use
- During `planMission` for each task in the DAG

## When NOT to use
- Executing tasks
- Planning the mission DAG

## Output schema
```json
{
  "taskId": "mid_tN",
  "requiredSkills": ["skill-id"],
  "favoriteSkills": ["skill-id"],
  "tierBAgents": ["agent-id"],
  "budgetEstimate": { "tokens": 1500, "model": "claude-haiku-4-5" },
  "rationale": "string 3 lines max",
  "requires_validation": false
}
```

## Escalate when
- No agent matches with confidence 0.6+
- Task contains: "trading", "payment", "send email", "deploy", "rm -rf"

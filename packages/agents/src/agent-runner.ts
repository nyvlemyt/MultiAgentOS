import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import {
  mockMissionPlanner,
  mockSkillRouter,
  mockReviewer,
  mockSecReviewer,
  selectModel,
  applyCaveman,
  estimateMaxCallCostCents,
  type PlannerInput,
  type PlannerOutput,
  type SkillRouterDecision,
  type ReviewerVerdict,
  type Mode,
  type Risk,
} from '@mas/core';
import { getLLM } from './llm-registry.js';
import { checkBudget, recordUsage } from './budget.js';

const FICHES_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '../fiches');

function loadFicheBody(id: string): string {
  const raw = readFileSync(resolve(FICHES_DIR, `${id}.md`), 'utf-8');
  return matter(raw).content.trim();
}

function extractJson<T>(text: string): T {
  // Strip optional markdown code fences
  const stripped = text.replace(/^```(?:json)?\n?/m, '').replace(/\n?```\s*$/m, '').trim();
  return JSON.parse(stripped) as T;
}

async function callAgent<T>(opts: {
  agentId: string;
  ficheId: string;
  userPrompt: string;
  mode: Mode;
  cavemanRoute: Parameters<typeof applyCaveman>[2];
  missionId?: string;
  taskId?: string;
  fallback: () => T;
}): Promise<T> {
  const { agentId, ficheId, userPrompt, mode, cavemanRoute, missionId, taskId, fallback } = opts;
  const llm = getLLM();
  const ficheBody = loadFicheBody(ficheId);
  const system = applyCaveman(ficheBody, mode, cavemanRoute);
  const model = selectModel(mode);
  const maxTokens = 4096;

  await checkBudget({
    missionId,
    estimatedCostCents: estimateMaxCallCostCents(model, maxTokens),
  });

  let response;
  try {
    response = await llm.call({ system, user: userPrompt, model, mode, maxTokens });
  } catch (e) {
    console.error(`[agent-runner:${agentId}] LLM call failed, falling back to mock:`, e);
    return fallback();
  }

  await recordUsage({ response, missionId, taskId, agentId }).catch((e) =>
    console.error('[agent-runner] recordUsage failed (non-fatal):', e),
  );

  try {
    return extractJson<T>(response.text);
  } catch {
    console.error(
      `[agent-runner:${agentId}] JSON parse failed, falling back to mock. Raw: ${response.text.slice(0, 200)}`,
    );
    return fallback();
  }
}

export async function runMissionPlanner(input: PlannerInput & { mode: Mode }): Promise<PlannerOutput> {
  return callAgent<PlannerOutput>({
    agentId: 'mission-planner',
    ficheId: 'mission-planner',
    mode: input.mode,
    cavemanRoute: 'planner_to_router',
    missionId: input.missionId,
    fallback: () => mockMissionPlanner(input),
    userPrompt: `Return ONLY a valid JSON object matching the schema in your system prompt. No prose, no markdown fences.

Mission to plan:
- id: ${input.missionId}
- title: ${input.title}
- objective: ${input.objective}`,
  });
}

export async function runSkillRouter(opts: {
  taskId: string;
  skillsHint: string[];
  description: string;
  mode: Mode;
  missionId?: string;
}): Promise<SkillRouterDecision> {
  return callAgent<SkillRouterDecision>({
    agentId: 'skill-router',
    ficheId: 'skill-router',
    mode: opts.mode,
    cavemanRoute: 'router_to_tierb',
    missionId: opts.missionId,
    taskId: opts.taskId,
    fallback: () => mockSkillRouter(opts.taskId, opts.skillsHint),
    userPrompt: `Return ONLY valid JSON, no prose:
{
  "taskId": "${opts.taskId}",
  "requiredSkills": [],
  "favoriteSkills": [],
  "tierBAgents": [],
  "budgetEstimate": { "tokens": 0, "model": "claude-haiku-4-5-20251001" },
  "rationale": "...",
  "requires_validation": false
}

Task to route:
- id: ${opts.taskId}
- skillsHint: ${JSON.stringify(opts.skillsHint)}
- description: ${opts.description}`,
  });
}

export async function runReviewer(opts: {
  taskId: string;
  taskTitle: string;
  taskDescription: string;
  risk: Risk;
  mode: Mode;
  missionId?: string;
}): Promise<ReviewerVerdict> {
  return callAgent<ReviewerVerdict>({
    agentId: 'reviewer',
    ficheId: 'reviewer',
    mode: opts.mode,
    cavemanRoute: null,
    missionId: opts.missionId,
    taskId: opts.taskId,
    fallback: () => mockReviewer(opts.taskId, { risk: opts.risk }),
    userPrompt: `Return ONLY valid JSON:
{
  "taskId": "${opts.taskId}",
  "verdict": "PASS",
  "findings": [{ "severity": "info", "message": "..." }]
}
verdict must be one of: "PASS", "NEEDS_WORK", "BLOCK"
severity must be one of: "info", "warn", "block"

Review this completed task:
- id: ${opts.taskId}
- title: ${opts.taskTitle}
- description: ${opts.taskDescription}
- risk: ${opts.risk}`,
  });
}

export async function runSecReviewer(opts: {
  taskId: string;
  taskTitle: string;
  taskDescription: string;
  risk: Risk;
  mode: Mode;
  missionId?: string;
}): Promise<ReviewerVerdict> {
  return callAgent<ReviewerVerdict>({
    agentId: 'sec-reviewer',
    ficheId: 'sec-reviewer',
    mode: opts.mode,
    cavemanRoute: null,
    missionId: opts.missionId,
    taskId: opts.taskId,
    fallback: () => mockSecReviewer(opts.taskId, { risk: opts.risk }),
    userPrompt: `Return ONLY valid JSON:
{
  "taskId": "${opts.taskId}",
  "verdict": "PASS",
  "findings": [{ "severity": "info", "message": "..." }]
}
verdict must be one of: "PASS", "NEEDS_WORK", "BLOCK"
severity must be one of: "info", "warn", "block"

Security review this task. Verdict BLOCK if it requires: rm -rf, git push --force, eval, curl | sh, writes to .env files, or cross-project writes.
- id: ${opts.taskId}
- title: ${opts.taskTitle}
- description: ${opts.taskDescription}
- risk: ${opts.risk}`,
  });
}

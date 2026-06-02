import { randomUUID } from 'node:crypto';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { and, eq, inArray } from 'drizzle-orm';
import {
  getDb,
  missions,
  projects,
  tasks,
  events,
  validations,
  type Task,
  type Mission,
} from '@mas/db';
import type { ReviewerVerdict } from '@mas/core';
import {
  mockMissionPlanner,
  mockSkillRouter,
  mockReviewer,
  mockSecReviewer,
  claudeCodeLLM,
  type AutonomyLevel,
} from '@mas/core';
import { scanOrchestratorSkills, SkillRouter } from '@mas/skills';

export type Db = ReturnType<typeof getDb>;

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const _REPO_ROOT = resolve(__dirname, '../../..');

// L1 skill summaries loaded once at module load for prompt injection.
const _skillRouter = new SkillRouter(scanOrchestratorSkills(_REPO_ROOT));

function logEvent(db: Db, evt: {
  missionId?: string;
  taskId?: string;
  agentId?: string;
  type: string;
  payload?: unknown;
  tokensIn?: number;
  tokensOut?: number;
  cacheRead?: number;
  cacheCreation?: number;
  quotaUnits?: number;
  risk?: 'low' | 'medium' | 'high' | 'blocking';
}) {
  return db.insert(events).values({
    id: `evt_${randomUUID()}`,
    missionId: evt.missionId,
    taskId: evt.taskId,
    agentId: evt.agentId,
    type: evt.type,
    payloadJson: JSON.stringify(evt.payload ?? {}),
    tokensIn: evt.tokensIn ?? 0,
    tokensOut: evt.tokensOut ?? 0,
    cacheRead: evt.cacheRead ?? 0,
    cacheCreation: evt.cacheCreation ?? 0,
    quotaUnits: evt.quotaUnits ?? 0,
    risk: evt.risk ?? 'low',
    createdAt: new Date(),
  });
}

export async function planMission(missionId: string) {
  const db = getDb();
  const [m] = await db.select().from(missions).where(eq(missions.id, missionId));
  if (!m) throw new Error(`mission ${missionId} not found`);
  if (m.status !== 'draft') return m;

  const plan = mockMissionPlanner({ missionId: m.id, title: m.title, objective: m.objective });

  // Wipe and rewrite task list for an idempotent plan.
  await db.delete(tasks).where(eq(tasks.missionId, m.id));

  for (const t of plan.tasks) {
    const router = mockSkillRouter(t.id, t.skillsHint);
    await db.insert(tasks).values({
      id: t.id,
      missionId: m.id,
      title: t.title,
      description: t.description,
      status: 'todo',
      risk: t.risk,
      agentId: t.agentHint,
      skillsJson: JSON.stringify(router.favoriteSkills.concat(router.requiredSkills)),
      dependsOnJson: JSON.stringify(t.dependsOn),
      budgetTokens: t.budgetTokens,
      spentTokens: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await logEvent(db, {
      missionId: m.id,
      taskId: t.id,
      agentId: 'skill-router',
      type: 'skill_router_decision',
      payload: { rationale: router.rationale, skills: router.favoriteSkills, agents: router.tierBAgents },
    });
  }

  await db
    .update(missions)
    .set({
      status: 'planned',
      budgetTokens: plan.estimatedTokens,
      updatedAt: new Date(),
    })
    .where(eq(missions.id, m.id));

  await logEvent(db, {
    missionId: m.id,
    agentId: 'mission-planner',
    type: 'mission_planned',
    payload: { tasks: plan.tasks.length, estimatedTokens: plan.estimatedTokens },
  });

  return { ...m, status: 'planned' as const };
}

export async function runMission(missionId: string) {
  const db = getDb();
  const [m] = await db.select().from(missions).where(eq(missions.id, missionId));
  if (!m) throw new Error(`mission ${missionId} not found`);
  if (m.status !== 'planned') return m;
  await db.update(missions).set({ status: 'dispatched', updatedAt: new Date() }).where(eq(missions.id, m.id));
  await logEvent(db, { missionId: m.id, type: 'mission_dispatched' });
  return { ...m, status: 'dispatched' as const };
}

export async function archiveMission(missionId: string) {
  const db = getDb();
  const [m] = await db.select().from(missions).where(eq(missions.id, missionId));
  if (!m) throw new Error(`mission ${missionId} not found`);
  if (m.status !== 'validated') return m;
  await db.update(missions).set({ status: 'archived', updatedAt: new Date() }).where(eq(missions.id, m.id));
  await logEvent(db, { missionId: m.id, type: 'mission_archived' });
  return { ...m, status: 'archived' as const };
}

async function selectRunnableTasks(db: Db, missionId: string): Promise<Task[]> {
  const all = await db.select().from(tasks).where(eq(tasks.missionId, missionId));
  const doneIds = new Set(all.filter((t) => t.status === 'done').map((t) => t.id));
  return all
    .filter((t) => t.status === 'todo')
    .filter((t) => (JSON.parse(t.dependsOnJson) as string[]).every((d) => doneIds.has(d)))
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
}

export async function executeNextTask(missionId: string): Promise<
  | { kind: 'no_runnable' }
  | { kind: 'paused_for_validation'; taskId: string }
  | { kind: 'task_done'; taskId: string }
  | { kind: 'mission_complete' }
> {
  const db = getDb();
  const [m] = await db.select().from(missions).where(eq(missions.id, missionId));
  if (!m) throw new Error(`mission ${missionId} not found`);
  if (m.status !== 'dispatched' && m.status !== 'executing') return { kind: 'no_runnable' };

  const all = await db.select().from(tasks).where(eq(tasks.missionId, missionId));
  const anyPendingValidation = all.some((t) => t.status === 'needs_validation');
  if (anyPendingValidation) {
    return { kind: 'paused_for_validation', taskId: all.find((t) => t.status === 'needs_validation')!.id };
  }

  const allDone = all.every((t) => t.status === 'done');
  if (allDone) {
    // Atomic: only one executor enters the review phase
    const reviewClaimed = await db
      .update(missions)
      .set({ status: 'review', updatedAt: new Date() })
      .where(and(eq(missions.id, m.id), inArray(missions.status, ['executing', 'dispatched'])))
      .returning({ id: missions.id });
    if (reviewClaimed.length === 0) return { kind: 'mission_complete' };
    await logEvent(db, { missionId: m.id, type: 'mission_review_started' });

    // Run sec-reviewer on every high/blocking-risk task; run reviewer on the last task.
    const verdicts: ReviewerVerdict[] = [];
    for (const t of all) {
      if (t.risk === 'high' || t.risk === 'blocking') {
        const sec = mockSecReviewer(t.id, { risk: t.risk });
        await logEvent(db, { missionId: m.id, taskId: t.id, agentId: 'sec-reviewer', type: 'sec_review_verdict', payload: sec });
        verdicts.push(sec);
      }
    }
    const last = all.at(-1);
    if (last) {
      const rev = mockReviewer(last.id, { risk: last.risk });
      await logEvent(db, { missionId: m.id, taskId: last.id, agentId: 'reviewer', type: 'review_verdict', payload: rev });
      verdicts.push(rev);
    }

    const blocked = verdicts.some((v) => v.verdict === 'BLOCK');
    if (blocked) {
      await db.update(missions).set({ status: 'blocked', updatedAt: new Date() }).where(eq(missions.id, m.id));
      await logEvent(db, { missionId: m.id, type: 'mission_blocked', payload: { reason: 'review_block' } });
    } else {
      await db.update(missions).set({ status: 'validated', updatedAt: new Date() }).where(eq(missions.id, m.id));
      await logEvent(db, { missionId: m.id, type: 'mission_validated' });
    }
    return { kind: 'mission_complete' };
  }

  const runnable = await selectRunnableTasks(db, missionId);
  const next = runnable[0];
  if (!next) return { kind: 'no_runnable' };

  if (m.status === 'dispatched') {
    await db.update(missions).set({ status: 'executing', updatedAt: new Date() }).where(eq(missions.id, m.id));
    await logEvent(db, { missionId: m.id, type: 'mission_executing' });
  }

  // Atomic claim: only one executor can move this task from todo to running.
  const claimed = await db
    .update(tasks)
    .set({ status: 'running', updatedAt: new Date() })
    .where(and(eq(tasks.id, next.id), eq(tasks.status, 'todo')))
    .returning({ id: tasks.id });
  if (claimed.length === 0) return { kind: 'no_runnable' };
  await logEvent(db, {
    missionId: m.id,
    taskId: next.id,
    agentId: next.agentId ?? undefined,
    type: 'task_start',
    payload: { title: next.title },
    risk: next.risk,
  });

  if (next.risk === 'high' || next.risk === 'blocking') {
    await db
      .update(tasks)
      .set({ status: 'needs_validation', updatedAt: new Date() })
      .where(eq(tasks.id, next.id));
    await db.insert(validations).values({
      id: `val_${randomUUID()}`,
      taskId: next.id,
      requestedByAgent: next.agentId ?? 'dispatcher',
      actionSummary: `Run high-risk task: ${next.title}`,
      status: 'pending',
      payloadJson: JSON.stringify({ risk: next.risk }),
    });
    await logEvent(db, {
      missionId: m.id,
      taskId: next.id,
      type: 'validation_requested',
      risk: next.risk,
      payload: { reason: 'risk gate' },
    });
    return { kind: 'paused_for_validation', taskId: next.id };
  }

  // Look up project to build the real LLM client.
  const [proj] = await db
    .select({
      id: projects.id,
      path: projects.path,
      autonomy: projects.autonomy,
      sessionId: projects.sessionId,
      defaultModel: projects.defaultModel,
      defaultMode: projects.defaultMode,
    })
    .from(projects)
    .innerJoin(missions, eq(missions.projectId, projects.id))
    .where(eq(missions.id, missionId));

  const llm = claudeCodeLLM({
    cwd: proj?.path,
    autonomyLevel: (proj?.autonomy ?? 'assisted') as AutonomyLevel,
    sessionId: proj?.sessionId ?? undefined,
  });

  const taskSkillIds: string[] = JSON.parse(next.skillsJson ?? '[]');
  const skillContext = _skillRouter.buildPromptContext(taskSkillIds);

  const resp = await llm.call({
    system: [
      `You are executing a task inside project at path ${proj?.path ?? '.'}.`,
      skillContext,
    ].filter(Boolean).join('\n\n'),
    user: `Task: ${next.title}\n\n${next.description}`,
    model: proj?.defaultModel ?? 'claude-haiku-4-5',
    mode: (proj?.defaultMode ?? 'standard') as import('@mas/core').Mode,
  });

  // Persist new session_id back to project on first successful call.
  if (proj && resp.sessionId && !proj.sessionId) {
    await db
      .update(projects)
      .set({ sessionId: resp.sessionId })
      .where(eq(projects.id, proj.id));
  }

  const spend = resp.inputTokens + resp.outputTokens;
  await db
    .update(tasks)
    .set({
      status: 'done',
      spentTokens: spend,
      outputPath: `data/outputs/${next.id}.md`,
      updatedAt: new Date(),
    })
    .where(eq(tasks.id, next.id));
  await db
    .update(missions)
    .set({ spentTokens: (m.spentTokens ?? 0) + spend, updatedAt: new Date() })
    .where(eq(missions.id, m.id));
  await logEvent(db, {
    missionId: m.id,
    taskId: next.id,
    agentId: next.agentId ?? undefined,
    type: 'task_done',
    tokensIn: resp.inputTokens,
    tokensOut: resp.outputTokens,
    cacheRead: resp.cacheReadTokens,
    cacheCreation: resp.cacheCreationTokens,
    quotaUnits: resp.quotaUnits,
    risk: next.risk,
    payload: { title: next.title, sessionId: resp.sessionId },
  });

  return { kind: 'task_done', taskId: next.id };
}

export async function resumeAfterValidation(
  taskId: string,
  approved: boolean,
): Promise<{ acted: boolean; missionId: string }> {
  const db = getDb();
  const [t] = await db.select().from(tasks).where(eq(tasks.id, taskId));
  if (!t) throw new Error(`task ${taskId} not found`);

  // Idempotent: only act if a pending validation row exists for this task.
  const updated = await db
    .update(validations)
    .set({ status: approved ? 'approved' : 'rejected', decidedAt: new Date(), decidedByUser: 'me' })
    .where(and(eq(validations.taskId, taskId), eq(validations.status, 'pending')))
    .returning({ id: validations.id });

  if (updated.length === 0) {
    return { acted: false, missionId: t.missionId };
  }

  if (!approved) {
    await db.update(tasks).set({ status: 'blocked', updatedAt: new Date() }).where(eq(tasks.id, taskId));
    await db.update(missions).set({ status: 'blocked', updatedAt: new Date() }).where(eq(missions.id, t.missionId));
    await logEvent(db, { missionId: t.missionId, taskId: t.id, type: 'validation_rejected', risk: t.risk });
    return { acted: true, missionId: t.missionId };
  }

  // Approved: execute the task via real LLM and record actual token spend.
  const [proj] = await db
    .select({
      id: projects.id,
      path: projects.path,
      autonomy: projects.autonomy,
      sessionId: projects.sessionId,
      defaultModel: projects.defaultModel,
      defaultMode: projects.defaultMode,
    })
    .from(projects)
    .innerJoin(missions, eq(missions.projectId, projects.id))
    .where(eq(missions.id, t.missionId));

  const llm = claudeCodeLLM({
    cwd: proj?.path,
    autonomyLevel: (proj?.autonomy ?? 'assisted') as AutonomyLevel,
    sessionId: proj?.sessionId ?? undefined,
  });

  const taskSkillIds: string[] = JSON.parse(t.skillsJson ?? '[]');
  const skillContext = _skillRouter.buildPromptContext(taskSkillIds);

  const resp = await llm.call({
    system: [
      `You are executing a validated high-risk task inside project at path ${proj?.path ?? '.'}.`,
      skillContext,
    ].filter(Boolean).join('\n\n'),
    user: `Task: ${t.title}\n\n${t.description}`,
    model: proj?.defaultModel ?? 'claude-haiku-4-5',
    mode: (proj?.defaultMode ?? 'standard') as import('@mas/core').Mode,
  });

  if (proj && resp.sessionId && !proj.sessionId) {
    await db
      .update(projects)
      .set({ sessionId: resp.sessionId })
      .where(eq(projects.id, proj.id));
  }

  const spend = resp.inputTokens + resp.outputTokens;
  await db
    .update(tasks)
    .set({ status: 'done', spentTokens: spend, outputPath: `data/outputs/${t.id}.md`, updatedAt: new Date() })
    .where(eq(tasks.id, t.id));
  const [currentMission] = await db
    .select({ spentTokens: missions.spentTokens })
    .from(missions)
    .where(eq(missions.id, t.missionId));
  await db
    .update(missions)
    .set({ spentTokens: (currentMission?.spentTokens ?? 0) + spend, updatedAt: new Date() })
    .where(eq(missions.id, t.missionId));
  await logEvent(db, {
    missionId: t.missionId,
    taskId: t.id,
    agentId: t.agentId ?? undefined,
    type: 'validation_approved',
    tokensIn: resp.inputTokens,
    tokensOut: resp.outputTokens,
    cacheRead: resp.cacheReadTokens,
    cacheCreation: resp.cacheCreationTokens,
    quotaUnits: resp.quotaUnits,
    risk: t.risk,
  });
  return { acted: true, missionId: t.missionId };
}

export async function listDispatchableMissions(): Promise<Mission[]> {
  const db = getDb();
  return db
    .select()
    .from(missions)
    .where(inArray(missions.status, ['dispatched', 'executing']));
}

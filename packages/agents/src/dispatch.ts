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
import {
  mockMissionPlanner,
  mockSkillRouter,
  mockReviewer,
  mockSecReviewer,
  claudeCodeLLM,
  createRouterLLM,
  mockLLM,
  type AutonomyLevel,
  type ReviewerVerdict,
  type RouterEvent,
} from '@mas/core';
import { scanOrchestratorSkills, SkillRouter } from '@mas/skills';
import { MemoryStore, buildMemoryContext, runCloseOutRitual, type MemoryContext } from '@mas/memory';

export type Db = ReturnType<typeof getDb>;

// Lazy read-only memory store (no writerAgent — injection only reads, never writes;
// §8 keeps the Memory Keeper as the sole writer). Resolves data/memory at the repo
// root; degrades to an empty context under a bundler, like the skill router above.
let _memoryStore: MemoryStore | undefined;
function memoryContextFor(projectId: string | undefined, query: string): MemoryContext {
  const empty: MemoryContext = { text: '', projectEntryCount: 0, globalItems: [] };
  if (!projectId) return empty;
  try {
    const envRoot = process.env.MAS_MEMORY_ROOT;
    if (envRoot) return buildMemoryContext(new MemoryStore({ root: envRoot }), projectId, query);
    if (!_memoryStore) {
      const __dirname = fileURLToPath(new URL('.', import.meta.url));
      const repoRoot = resolve(__dirname, '../../..');
      _memoryStore = new MemoryStore({ root: resolve(repoRoot, 'data/memory') });
    }
    return buildMemoryContext(_memoryStore, projectId, query);
  } catch {
    return empty;
  }
}

// Lazy singleton — deferred so Next.js static analysis doesn't eval import.meta.url at bundle time.
let _skillRouterInstance: SkillRouter | undefined;
function getSkillRouter(): SkillRouter {
  if (!_skillRouterInstance) {
    try {
      const __dirname = fileURLToPath(new URL('.', import.meta.url));
      const repoRoot = resolve(__dirname, '../../..');
      _skillRouterInstance = new SkillRouter(scanOrchestratorSkills(repoRoot));
    } catch {
      // Under a bundler (Next webpack RSC) import.meta.url is not a file: URL,
      // so fileURLToPath rejects it (TypeError: ... Received an instance of URL).
      // Skill-summary injection is a best-effort prompt enhancement, not required
      // for correctness — degrade to an empty router rather than crash the run.
      // Native execution (apps/worker, tsx) resolves the path fine and gets full
      // injection. Moving the inline-Next run path to the worker is tracked in
      // docs/backlog/run-inline-execution-in-next.md.
      _skillRouterInstance = new SkillRouter([]);
    }
  }
  return _skillRouterInstance;
}

// LLM selection. MAS_MOCK_LLM=1 short-circuits the real Agent SDK with a
// deterministic, zero-cost mock (e2e smoke, offline dev, token budget). The §5
// risk gate fires BEFORE any LLM call (executeNextTask), so gate behavior is
// identical either way. Both branches go through @mas/core factories — no raw
// SDK client is instantiated here (CLAUDE.md §11). The real path also keeps the
// vi.mock('@mas/core') seam in dispatch.test.ts working unchanged.
function selectLLM(opts: {
  cwd?: string;
  autonomyLevel?: AutonomyLevel;
  sessionId?: string;
  onRouterEvent?: (evt: RouterEvent) => void;
}) {
  if (process.env.MAS_MOCK_LLM === '1') return mockLLM();
  const { onRouterEvent, ...claudeOpts } = opts;
  // Phase 3.5 (ADR 0002): the router takes over only when config/model-routing.json
  // enables at least one non-default source; otherwise current behavior unchanged.
  try {
    const __dirname = fileURLToPath(new URL('.', import.meta.url));
    const repoRoot = resolve(__dirname, '../../..');
    const router = createRouterLLM({
      configPath: process.env.MAS_ROUTING_CONFIG ?? resolve(repoRoot, 'config/model-routing.json'),
      envPath: process.env.MAS_ENV_LOCAL ?? resolve(repoRoot, '.env.local'),
      claudeOpts,
      onEvent: onRouterEvent,
    });
    if (router) return router;
  } catch {
    // Bundler path (import.meta.url not a file: URL) — same degradation as
    // getSkillRouter above: fall through to the plain Claude client.
  }
  return claudeCodeLLM(claudeOpts);
}

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

async function runReviewPhase(
  db: Db,
  m: Mission,
  all: Task[],
): Promise<{ kind: 'mission_complete' }> {
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
  // Deterministic "last task": sort by createdAt (mirrors selectRunnableTasks)
  // so the reviewer runs on the actual last-created task, not DB row order.
  const last = [...all].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()).at(-1);
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

  // ADR 0004 §1: mission end auto-fires the close-out ritual. Candidates only —
  // the §8 write-lock is untouched. Fired here (not in the worker loop) because
  // runReviewPhase is the single chokepoint both the worker and the web inline
  // path cross. Idempotent via AUTO_CAPTURE_EVENT, so a replayed tick is a no-op.
  try {
    await runCloseOutRitual(db, m.id);
  } catch (e) {
    // Capture is best-effort: a ritual failure must not fail the mission.
    await logEvent(db, { missionId: m.id, type: 'auto_capture_error', payload: { message: String(e) } });
  }
  return { kind: 'mission_complete' };
}

async function pauseForRiskGate(
  db: Db,
  m: Mission,
  next: Task,
): Promise<{ kind: 'paused_for_validation'; taskId: string }> {
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

async function executeTaskWithLLM(
  db: Db,
  m: Mission,
  next: Task,
  missionId: string,
): Promise<{ kind: 'task_done'; taskId: string }> {
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

  const llm = selectLLM({
    cwd: proj?.path,
    autonomyLevel: (proj?.autonomy ?? 'assisted') as AutonomyLevel,
    sessionId: proj?.sessionId ?? undefined,
    onRouterEvent: (evt) =>
      void logEvent(db, { missionId: m.id, taskId: next.id, type: 'provider_fallback', payload: evt }),
  });

  const taskSkillIds: string[] = JSON.parse(next.skillsJson ?? '[]');
  const skillContext = getSkillRouter().buildPromptContext(taskSkillIds);
  const memCtx = memoryContextFor(proj?.id, next.title);

  const resp = await llm.call({
    system: [
      `You are executing a task inside project at path ${proj?.path ?? '.'}.`,
      memCtx.text,
      skillContext,
    ].filter(Boolean).join('\n\n'),
    user: `Task: ${next.title}\n\n${next.description}`,
    model: proj?.defaultModel ?? 'claude-haiku-4-5',
    mode: (proj?.defaultMode ?? 'standard') as import('@mas/core').Mode,
    domain: getSkillRouter().domainFor(taskSkillIds),
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
    payload: {
      title: next.title,
      sessionId: resp.sessionId,
      provider: resp.provider,
      memoryContextChars: memCtx.text.length,
      memoryProjectEntries: memCtx.projectEntryCount,
      memoryGlobalItems: memCtx.globalItems.length,
    },
  });

  return { kind: 'task_done', taskId: next.id };
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

  if (all.every((t) => t.status === 'done')) {
    return runReviewPhase(db, m, all);
  }

  const runnable = await selectRunnableTasks(db, missionId);
  const next = runnable[0];
  if (!next) return { kind: 'no_runnable' };

  if (m.status === 'dispatched') {
    await db.update(missions).set({ status: 'executing', updatedAt: new Date() }).where(eq(missions.id, m.id));
    await logEvent(db, { missionId: m.id, type: 'mission_executing' });
  }

  // Atomic claim: only one executor can transition this task into the running state.
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

  // §5 risk gate — the decision stays in the main flow; the gated body
  // (mark needs_validation + open a validation row) lives in pauseForRiskGate.
  if (next.risk === 'high' || next.risk === 'blocking') {
    return pauseForRiskGate(db, m, next);
  }

  return executeTaskWithLLM(db, m, next, missionId);
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

  const llm = selectLLM({
    cwd: proj?.path,
    autonomyLevel: (proj?.autonomy ?? 'assisted') as AutonomyLevel,
    sessionId: proj?.sessionId ?? undefined,
    onRouterEvent: (evt) =>
      void logEvent(db, { missionId: t.missionId, taskId: t.id, type: 'provider_fallback', payload: evt }),
  });

  const taskSkillIds: string[] = JSON.parse(t.skillsJson ?? '[]');
  const skillContext = getSkillRouter().buildPromptContext(taskSkillIds);
  const memCtx = memoryContextFor(proj?.id, t.title);

  const resp = await llm.call({
    system: [
      `You are executing a validated high-risk task inside project at path ${proj?.path ?? '.'}.`,
      memCtx.text,
      skillContext,
    ].filter(Boolean).join('\n\n'),
    user: `Task: ${t.title}\n\n${t.description}`,
    model: proj?.defaultModel ?? 'claude-haiku-4-5',
    mode: (proj?.defaultMode ?? 'standard') as import('@mas/core').Mode,
    domain: getSkillRouter().domainFor(taskSkillIds),
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
    payload: { provider: resp.provider },
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

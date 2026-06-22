import { randomUUID } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { and, desc, eq, gte, inArray } from 'drizzle-orm';
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
  mockReviewer,
  mockSecReviewer,
  mockQualityController,
  classifyRisk,
  languageDirective,
  claudeCodeLLM,
  createRouterLLM,
  mockLLM,
  type AutonomyLevel,
  type LLMClient,
  type LLMResponse,
  type Mode,
  type ProjectLanguage,
  type ReviewerVerdict,
  type Risk,
  type RouterEvent,
} from '@mas/core';
import {
  scanOrchestratorSkills,
  loadLibraryIndex,
  mergeSkillMetas,
  selectLibrarySkills,
  SkillRouter,
} from '@mas/skills';
import { MemoryStore, buildMemoryContext, runCloseOutRitual, type MemoryContext } from '@mas/memory';
import { delegateWithDiff } from './delegate';
import { reviewProducedDiff, type ReviewGateResult } from './review-gate';
import { TIER_B_DELEGATION_MAP, domainScopeFor } from './library';

export type Db = ReturnType<typeof getDb>;

// All MultiAgentOS-produced task artifacts land here (CLAUDE.md §8: never
// data/memory/). Hoisted to one literal (S1192).
const OUTPUTS_DIR = 'data/outputs';

// Quota-window TTL — must match RouterLLMClient's default (5 h subscription
// window). Hoisted to one literal (S1192).
const WINDOW_TTL_MS = 5 * 60 * 60 * 1000;

function repoRootDir(): string {
  const here = fileURLToPath(new URL('.', import.meta.url));
  return resolve(here, '../../..');
}

// Risk ordering for "persist the stricter of classified vs planner risk" (§5).
const RISK_ORDER: Record<Risk, number> = { low: 0, medium: 1, high: 2, blocking: 3 };
function stricterRisk(a: Risk, b: Risk): Risk {
  return RISK_ORDER[a] >= RISK_ORDER[b] ? a : b;
}

// Lazy read-only memory store (no writerAgent — injection only reads, never writes;
// §8 keeps the Memory Keeper as the sole writer). Resolves data/memory at the repo
// root; degrades to an empty context under a bundler, like the skill router above.
let _memoryStore: MemoryStore | undefined;
function memoryContextFor(projectId: string | undefined, query: string): MemoryContext {
  const empty: MemoryContext = { text: '', projectEntryCount: 0, globalItems: [] };
  if (!projectId) return empty;
  try {
    const envRoot = process.env.MAS_MEMORY_ROOT;
    if (envRoot) {
      const envStore = new MemoryStore({ root: envRoot });
      return buildMemoryContext(envStore, projectId, query, { indexPath: envStore.indexPath() });
    }
    if (!_memoryStore) {
      const __dirname = fileURLToPath(new URL('.', import.meta.url));
      const repoRoot = resolve(__dirname, '../../..');
      _memoryStore = new MemoryStore({ root: resolve(repoRoot, 'data/memory') });
    }
    return buildMemoryContext(_memoryStore, projectId, query, { indexPath: _memoryStore.indexPath() });
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
      const merged = mergeSkillMetas(
        scanOrchestratorSkills(repoRoot),
        loadLibraryIndex(repoRoot),
      );
      _skillRouterInstance = new SkillRouter(merged);
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
  initialBlocked?: Record<string, number>;
  onBlock?: (sourceId: string, blockedAt: number) => void;
}) {
  if (process.env.MAS_MOCK_LLM === '1') return mockLLM();
  const { onRouterEvent, initialBlocked, onBlock, ...claudeOpts } = opts;
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
      initialBlocked,
      onBlock,
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

// Router fallback events fire inside a synchronous onRouterEvent callback, so
// the logEvent insert cannot be awaited. Swallow rejections explicitly rather
// than leaving a floating promise (telemetry must never fail a mission).
function logEventDetached(db: Db, evt: Parameters<typeof logEvent>[1]): void {
  logEvent(db, evt).then(undefined, () => undefined);
}

// Restore the router's quota-window block map from persisted `window_blocked`
// events (5b). Without this, selectLLM builds a fresh router per call/restart and
// retries a just-blocked source (one wasted 429). Newest-first so the first row
// seen per source wins (its latest blockedAt). Time-dependent → explicit `now`.
export async function loadBlockedWindows(
  db: Db,
  now: Date,
  ttlMs = WINDOW_TTL_MS,
): Promise<Record<string, number>> {
  const since = new Date(now.getTime() - ttlMs);
  const rows = await db
    .select({ payloadJson: events.payloadJson })
    .from(events)
    .where(and(eq(events.type, 'window_blocked'), gte(events.createdAt, since)))
    .orderBy(desc(events.createdAt));

  const blocked: Record<string, number> = {};
  for (const { payloadJson } of rows) {
    const { source, blockedAt } = JSON.parse(payloadJson) as { source: string; blockedAt: number };
    blocked[source] ??= blockedAt;
  }
  return blocked;
}

export async function planMission(missionId: string) {
  const db = getDb();
  const [m] = await db.select().from(missions).where(eq(missions.id, missionId));
  if (!m) throw new Error(`mission ${missionId} not found`);
  if (m.status !== 'draft') return m;

  const plan = mockMissionPlanner({ missionId: m.id, title: m.title, objective: m.objective });

  // Wipe and rewrite task list for an idempotent plan.
  await db.delete(tasks).where(eq(tasks.missionId, m.id));

  // Cache the cold-arsenal router once — don't rebuild the 877-entry index per task.
  const skillRouter = getSkillRouter();

  for (const t of plan.tasks) {
    // Real engine (Wave 2): scope by the task's agent, select over the cold
    // arsenal. llm omitted ⇒ deterministic degrade (zero quota spent).
    const scope = domainScopeFor(t.agentHint);
    const sel = await selectLibrarySkills({
      task: { id: t.id, title: t.title, description: t.description, skillsHint: t.skillsHint },
      scope,
      router: skillRouter,
    });

    // §5 risk classifier: persist the STRICTER of classified vs planner risk.
    // When the classifier is unsure (shell-ish but no concrete rule) we consult
    // the (mocked) Sec Reviewer and bump to blocking on BLOCK.
    const classified = classifyRisk({ title: t.title, description: t.description });
    let finalRisk = stricterRisk(classified.risk, t.risk);
    if (classified.needsLLMFallback) {
      const sec = mockSecReviewer(t.id, { risk: finalRisk });
      if (sec.verdict === 'BLOCK') finalRisk = 'blocking';
    }

    await db.insert(tasks).values({
      id: t.id,
      missionId: m.id,
      title: t.title,
      description: t.description,
      status: 'todo',
      risk: finalRisk,
      agentId: t.agentHint,
      skillsJson: JSON.stringify(sel.skillIds),
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
      payload: { rationale: sel.rationale, degraded: sel.degraded, skills: sel.skillIds },
    });
    await logEvent(db, {
      missionId: m.id,
      taskId: t.id,
      agentId: 'sec-reviewer',
      type: 'risk_classified',
      risk: finalRisk,
      payload: { rule: classified.rule, from: t.risk, to: finalRisk },
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

  // Deterministic "last task": sort by createdAt (mirrors selectRunnableTasks).
  const lastTask = [...all].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()).at(-1);

  // Quality Controller gate (AGENTS.md §4): runs BEFORE the reviewer. It checks
  // PROCESS/RULES (conventions, no-PAYG drift, architecture, output language),
  // not the CODE. A QC BLOCK blocks the mission and short-circuits the reviewer.
  const qc = mockQualityController(lastTask?.id ?? m.id, { taskTitles: all.map((t) => t.title) });
  await logEvent(db, { missionId: m.id, taskId: lastTask?.id, agentId: 'quality-controller', type: 'quality_control_verdict', payload: qc });

  // A QC BLOCK short-circuits the sec/reviewer stage; otherwise run sec-reviewer
  // on every high/blocking-risk task and the reviewer on the last task.
  const verdicts: ReviewerVerdict[] = [];
  let blockReason = 'quality_control_block';
  if (qc.verdict !== 'BLOCK') {
    for (const t of all) {
      if (t.risk === 'high' || t.risk === 'blocking') {
        const sec = mockSecReviewer(t.id, { risk: t.risk });
        await logEvent(db, { missionId: m.id, taskId: t.id, agentId: 'sec-reviewer', type: 'sec_review_verdict', payload: sec });
        verdicts.push(sec);
      }
    }
    if (lastTask) {
      const rev = mockReviewer(lastTask.id, { risk: lastTask.risk });
      await logEvent(db, { missionId: m.id, taskId: lastTask.id, agentId: 'reviewer', type: 'review_verdict', payload: rev });
      verdicts.push(rev);
    }
    blockReason = 'review_block';
  }

  const blocked = qc.verdict === 'BLOCK' || verdicts.some((v) => v.verdict === 'BLOCK');
  if (blocked) {
    await db.update(missions).set({ status: 'blocked', updatedAt: new Date() }).where(eq(missions.id, m.id));
    await logEvent(db, { missionId: m.id, type: 'mission_blocked', payload: { reason: blockReason } });
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

// Project row shape shared by the raw and delegated execution paths.
type ExecProject = {
  id: string;
  path: string | null;
  autonomy: string | null;
  sessionId: string | null;
  defaultModel: string | null;
  defaultMode: string | null;
  language: ProjectLanguage | null;
};

// Shared finalize step for a completed task (raw + delegated paths): persist the
// session id on first call, mark the task done + spend, bump mission spend, and
// log the single task_done event. extraPayload carries path-specific telemetry.
async function persistTaskDone(
  db: Db,
  m: Mission,
  next: Task,
  proj: ExecProject | undefined,
  resp: LLMResponse,
  outputPath: string,
  extraPayload: Record<string, unknown>,
): Promise<{ kind: 'task_done'; taskId: string }> {
  if (proj && resp.sessionId && !proj.sessionId) {
    await db.update(projects).set({ sessionId: resp.sessionId }).where(eq(projects.id, proj.id));
  }

  const spend = resp.inputTokens + resp.outputTokens;
  await db
    .update(tasks)
    .set({ status: 'done', spentTokens: spend, outputPath, updatedAt: new Date() })
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
    payload: { title: next.title, sessionId: resp.sessionId, provider: resp.provider, ...extraPayload },
  });

  return { kind: 'task_done', taskId: next.id };
}

interface DelegationContext {
  proj: ExecProject | undefined;
  llm: LLMClient;
  skillContext: string;
  memCtx: MemoryContext;
  delegation: (typeof TIER_B_DELEGATION_MAP)[string];
  agentId: string;
}

// Runs the §5 review gate on a produced diff: write it under data/outputs, check
// it applies + collect Code-Reviewer + Reality-Checker verdicts, log the result.
// evidence:false keeps the Reality Checker at NEEDS_WORK (advisory, never
// auto-approves an unsubstantiated diff — CLAUDE.md §11.bis r4).
async function gateProducedDiff(
  db: Db,
  m: Mission,
  next: Task,
  repoDir: string,
  diff: string,
  fiche: string,
): Promise<{ outputPath: string; review: ReviewGateResult }> {
  const patchPath = `${OUTPUTS_DIR}/${next.id}.patch`;
  const absDir = resolve(repoRootDir(), OUTPUTS_DIR);
  mkdirSync(absDir, { recursive: true });
  // git apply rejects a patch with no trailing newline ("corrupt patch"); the
  // extracted diff body is trimmed, so re-add one before writing/validating.
  const patch = diff.endsWith('\n') ? diff : `${diff}\n`;
  writeFileSync(resolve(repoRootDir(), patchPath), patch, 'utf-8');

  const review = await reviewProducedDiff({ taskId: next.id, diff: patch, repoDir, evidence: false });
  await logEvent(db, {
    missionId: m.id,
    taskId: next.id,
    agentId: next.agentId ?? undefined,
    type: 'tier_b_review',
    risk: next.risk,
    payload: { verdicts: review.verdicts, approved: review.approved, diffValid: review.diffValid, fiche },
  });
  return { outputPath: patchPath, review };
}

async function runDelegatedTask(
  db: Db,
  m: Mission,
  next: Task,
  ctx: DelegationContext,
  taskSkillIds: string[],
): Promise<{ kind: 'task_done'; taskId: string }> {
  const { proj, llm, skillContext, memCtx, delegation, agentId } = ctx;

  // Only the delegate call is fallback-eligible: a fiche-load failure (e.g. the
  // Next bundler where import.meta.url is not a file: URL — same degradation as
  // getSkillRouter/selectLLM) or a failed LLM call falls back to the raw path,
  // which then issues the single bill. Once delegateWithDiff returns, the call is
  // billed once; the gate + persist below run OUTSIDE the catch so a downstream
  // throw propagates and never re-bills via runRawTask.
  let outcome: Awaited<ReturnType<typeof delegateWithDiff>>;
  try {
    outcome = await delegateWithDiff({
      agentId,
      task: { title: next.title, description: next.description },
      llm,
      project: { defaultModel: proj?.defaultModel ?? undefined, defaultMode: (proj?.defaultMode ?? undefined) as Mode | undefined },
      skillContext,
      memoryText: memCtx.text,
      language: proj?.language ?? undefined,
    });
  } catch (e) {
    logEventDetached(db, {
      missionId: m.id,
      taskId: next.id,
      type: 'delegation_fallback',
      payload: { fiche: delegation.fiche, message: String(e) },
    });
    return runRawTask(db, m, next, { proj, llm, skillContext, memCtx }, taskSkillIds);
  }

  let outputPath = `${OUTPUTS_DIR}/${next.id}.md`;
  let review: ReviewGateResult | undefined;
  if (outcome.diff && proj?.path) {
    const gated = await gateProducedDiff(db, m, next, proj.path, outcome.diff, delegation.fiche);
    outputPath = gated.outputPath;
    review = gated.review;
  }

  return persistTaskDone(db, m, next, proj, outcome.response, outputPath, {
    delegated: true,
    tierBFiche: delegation.fiche,
    reviewApproved: review?.approved ?? null,
    diffValid: review?.diffValid ?? null,
  });
}

// Raw (non-Tier-B) execution: one LLM call, markdown artifact, no diff gate.
async function runRawTask(
  db: Db,
  m: Mission,
  next: Task,
  ctx: Omit<DelegationContext, 'delegation' | 'agentId'>,
  taskSkillIds: string[],
): Promise<{ kind: 'task_done'; taskId: string }> {
  const { proj, llm, skillContext, memCtx } = ctx;
  const resp = await llm.call({
    system: [
      languageDirective(proj?.language),
      `You are executing a task inside project at path ${proj?.path ?? '.'}.`,
      memCtx.text,
      skillContext,
    ].filter(Boolean).join('\n\n'),
    user: `Task: ${next.title}\n\n${next.description}`,
    model: proj?.defaultModel ?? 'claude-haiku-4-5',
    mode: (proj?.defaultMode ?? 'standard') as Mode,
    domain: getSkillRouter().domainFor(taskSkillIds),
  });

  return persistTaskDone(db, m, next, proj, resp, `${OUTPUTS_DIR}/${next.id}.md`, {
    memoryContextChars: memCtx.text.length,
    memoryProjectEntries: memCtx.projectEntryCount,
    memoryGlobalItems: memCtx.globalItems.length,
  });
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
      language: projects.language,
    })
    .from(projects)
    .innerJoin(missions, eq(missions.projectId, projects.id))
    .where(eq(missions.id, missionId));

  const initialBlocked = await loadBlockedWindows(db, new Date());
  const llm = selectLLM({
    cwd: proj?.path,
    autonomyLevel: (proj?.autonomy ?? 'assisted') as AutonomyLevel,
    sessionId: proj?.sessionId ?? undefined,
    onRouterEvent: (evt) =>
      logEventDetached(db, { missionId: m.id, taskId: next.id, type: 'provider_fallback', payload: evt }),
    initialBlocked,
    onBlock: (source, at) =>
      logEventDetached(db, {
        missionId: m.id,
        taskId: next.id,
        type: 'window_blocked',
        payload: { source, blockedAt: at },
      }),
  });

  const taskSkillIds: string[] = JSON.parse(next.skillsJson ?? '[]');
  const skillContext = getSkillRouter().buildPromptContext(taskSkillIds);
  const memCtx = memoryContextFor(proj?.id, next.title);
  const baseCtx = { proj, llm, skillContext, memCtx };

  // Tier B delegation branch: a task whose agentId maps to a fiche goes through
  // delegate() → diff → review gate before user validation (CLAUDE.md §5). The
  // fallback (and its single-bill guarantee) lives inside runDelegatedTask.
  const delegation = next.agentId ? TIER_B_DELEGATION_MAP[next.agentId] : undefined;
  if (delegation && next.agentId) {
    return runDelegatedTask(db, m, next, { ...baseCtx, delegation, agentId: next.agentId }, taskSkillIds);
  }

  return runRawTask(db, m, next, baseCtx, taskSkillIds);
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
      language: projects.language,
    })
    .from(projects)
    .innerJoin(missions, eq(missions.projectId, projects.id))
    .where(eq(missions.id, t.missionId));

  const initialBlocked = await loadBlockedWindows(db, new Date());
  const llm = selectLLM({
    cwd: proj?.path,
    autonomyLevel: (proj?.autonomy ?? 'assisted') as AutonomyLevel,
    sessionId: proj?.sessionId ?? undefined,
    onRouterEvent: (evt) =>
      logEventDetached(db, { missionId: t.missionId, taskId: t.id, type: 'provider_fallback', payload: evt }),
    initialBlocked,
    onBlock: (source, at) =>
      logEventDetached(db, {
        missionId: t.missionId,
        taskId: t.id,
        type: 'window_blocked',
        payload: { source, blockedAt: at },
      }),
  });

  const taskSkillIds: string[] = JSON.parse(t.skillsJson ?? '[]');
  const skillContext = getSkillRouter().buildPromptContext(taskSkillIds);
  const memCtx = memoryContextFor(proj?.id, t.title);

  const resp = await llm.call({
    system: [
      languageDirective(proj?.language),
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

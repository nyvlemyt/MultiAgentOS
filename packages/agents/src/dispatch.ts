import { randomUUID } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { and, eq, inArray } from 'drizzle-orm';
import {
  getDb,
  missions,
  projects,
  tasks,
  validations,
  type Task,
  type Mission,
} from '@mas/db';
import {
  mockMissionPlanner,
  classifyRisk,
  languageDirective,
  loadPermissions,
  EMPTY_PERMISSIONS,
  type AutonomyLevel,
  type LLMClient,
  type LLMResponse,
  type Mode,
  type PermissionsConfig,
  type Risk,
} from '@mas/core';
import { selectLibrarySkills } from '@mas/skills';
import { type MemoryContext } from '@mas/memory';
import { delegateWithDiff } from './delegate';
import { reviewProducedDiff, type ReviewGateResult } from './review-gate';
import { realSecReviewer } from './reviewers';
import { TIER_B_DELEGATION_MAP, domainScopeFor, loadAgentLibraryIndex, type AgentLibraryMeta } from './library';
import { scoreColdAgentSuggestion } from './cold-agent-suggest';
import { type Db, logEvent, logEventDetached, lastMessageFor, loadBlockedWindows } from './mission-events';
import {
  getSkillRouter,
  arsenalRetrieverFor,
  selectLLM,
  buildMissionLLM,
  memoryContextFor,
  type ExecProject,
} from './mission-llm';
import { runReviewPhase } from './review-phase';

// Re-exported for './dispatch' importers (router-persist.test.ts, package index).
export { loadBlockedWindows, type Db };

// All MultiAgentOS-produced task artifacts land here (CLAUDE.md §8: never
// data/memory/). Hoisted to one literal (S1192).
const OUTPUTS_DIR = 'data/outputs';

function repoRootDir(): string {
  const here = fileURLToPath(new URL('.', import.meta.url));
  return resolve(here, '../../..');
}

// Load the cold-agent L1 index, degrading to [] when the repo root can't be
// resolved (Next bundler: import.meta.url is not a file: URL ⇒ repoRootDir()
// throws) or the index is absent. Mirrors getSkillRouter()'s try/catch seam so a
// missing arsenal never crashes planning — at worst, no suggestion is emitted.
function loadAgentLibrarySafely(): AgentLibraryMeta[] {
  try {
    return loadAgentLibraryIndex(repoRootDir());
  } catch {
    return [];
  }
}

// Load the §5 permissions config — the documented single extension point for
// risky-action categories (CLAUDE.md §5). Path override via MAS_PERMISSIONS_PATH
// (tests/worker), else repo-root config/permissions.json. Degrades to
// EMPTY_PERMISSIONS on any read/parse failure (missing/malformed file, or the
// Next bundler where repoRootDir() throws) so a bad perms file never crashes
// planning — mirrors loadAgentLibrarySafely(). Without this, the perms-category
// escalation branch in classifyRisk would never be exercised in planMission.
function loadPermissionsSafely(): PermissionsConfig {
  try {
    const path = process.env.MAS_PERMISSIONS_PATH ?? resolve(repoRootDir(), 'config/permissions.json');
    return loadPermissions(path);
  } catch {
    return EMPTY_PERMISSIONS;
  }
}

// Risk ordering for "persist the stricter of classified vs planner risk" (§5).
const RISK_ORDER: Record<Risk, number> = { low: 0, medium: 1, high: 2, blocking: 3 };
function stricterRisk(a: Risk, b: Risk): Risk {
  return RISK_ORDER[a] >= RISK_ORDER[b] ? a : b;
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
  // ONE arsenal semantic retriever per mission (source b). QmdRetriever.query is a
  // blocking 30s execFileSync, so build it once here, never inside the task loop.
  const arsenalRetriever = arsenalRetrieverFor();
  // Cold-agent library (4b): load the L1 index ONCE per mission. The planner picks
  // agents; this only SUGGESTS a cold arsenal agent via a data-only event — §5: it
  // never mutates t.agentHint / tasks.agentId / TIER_B_DELEGATION_MAP / delegation.
  // Defensive: under the Next bundler import.meta.url is not a file: URL so
  // repoRootDir() throws — degrade to no library (no suggestions) rather than
  // crash planMission, mirroring getSkillRouter()/defaultFichesDir().
  const agentLibrary = loadAgentLibrarySafely();

  // §5 perms config, loaded ONCE per mission. Passed to classifyRisk so a
  // domain-agent-registered high/blocking category (sending messages, payments,
  // outbound sends) escalates a task that mentions its action — see §5 "single
  // extension point". Ships inert today (categories: []), live the moment a
  // category is declared.
  const perms = loadPermissionsSafely();

  // Plan-time sec fallback (plan §2.8): consulted only when the rule-based risk
  // classifier abstains (needsLLMFallback). Built once; under the deterministic
  // seam this is PASS unless a [sec-block]/risk=blocking sentinel is present, so
  // the rule-driven risk-classify-wiring test (`rm`) is unaffected. This is the
  // plan-time risk heuristic, NOT the doer/checker review gate.
  const [planProj] = await db
    .select({
      id: projects.id, path: projects.path, autonomy: projects.autonomy,
      sessionId: projects.sessionId, defaultModel: projects.defaultModel,
      defaultMode: projects.defaultMode, language: projects.language,
    })
    .from(projects)
    .where(eq(projects.id, m.projectId));
  const planLlm = await buildMissionLLM(db, m.id, undefined, planProj, new Date());

  for (const t of plan.tasks) {
    // Real engine (Wave 2): scope by the task's agent, select over the cold
    // arsenal. llm omitted ⇒ deterministic degrade (zero quota spent).
    const scope = domainScopeFor(t.agentHint);
    const sel = await selectLibrarySkills({
      task: { id: t.id, title: t.title, description: t.description, skillsHint: t.skillsHint },
      scope,
      router: skillRouter,
      retriever: arsenalRetriever,
    });

    // §5 risk classifier: persist the STRICTER of classified vs planner risk.
    // When the classifier is unsure (shell-ish but no concrete rule) we consult
    // the (mocked) Sec Reviewer and bump to blocking on BLOCK.
    const classified = classifyRisk({ title: t.title, description: t.description }, { perms });
    let finalRisk = stricterRisk(classified.risk, t.risk);
    if (classified.needsLLMFallback) {
      const sec = await realSecReviewer(planLlm, {
        taskId: t.id,
        risk: finalRisk,
        brief: { title: t.title, description: t.description },
      });
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

    // 4b cold-agent suggestion (§5: DATA ONLY). When a cold library agent
    // out-scores the planner hint by a margin, surface it as a single event.
    // No routing state above was touched — agentId persisted t.agentHint as-is.
    const suggestion = scoreColdAgentSuggestion(
      { title: t.title, description: t.description },
      t.agentHint,
      agentLibrary,
    );
    if (suggestion) {
      await logEvent(db, {
        missionId: m.id,
        taskId: t.id,
        // No agentId: this is mission/task-scoped suggestion DATA, not an action
        // attributed to a roster agent (and FKs events.agent_id → agents.id).
        type: 'cold_agent_suggested',
        payload: {
          taskId: t.id,
          suggestedAgentId: suggestion.suggestedAgentId,
          score: suggestion.score,
          reason: suggestion.reason,
        },
      });
    }
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

// Max chars of producer output persisted/injected for prompt chaining (plan §2.9)
// — bounds context growth (token discipline §6). Hoisted (S1192).
const LAST_MESSAGE_MAX = 2000;

// Prompt chaining (anthropic-ecosystem.md:166, plan §2.9): build the
// `### Upstream results:` block from each dependsOn task's persisted last_message.
// Empty string when the task has no dependencies or none produced output.
async function upstreamResults(db: Db, next: Task): Promise<string> {
  const depIds = JSON.parse(next.dependsOnJson) as string[];
  if (depIds.length === 0) return '';
  const deps = await db.select({ id: tasks.id, title: tasks.title }).from(tasks).where(inArray(tasks.id, depIds));
  const titleById = new Map<string, string>(deps.map((d) => [d.id, d.title]));
  const lines: string[] = [];
  for (const id of depIds) {
    const msg = await lastMessageFor(db, id);
    const title = titleById.get(id) ?? id;
    if (msg) lines.push(`${title}: ${msg}`);
  }
  return lines.length > 0 ? `### Upstream results:\n${lines.join('\n')}` : '';
}

async function selectRunnableTasks(db: Db, missionId: string): Promise<Task[]> {
  const all = await db.select().from(tasks).where(eq(tasks.missionId, missionId));
  const doneIds = new Set(all.filter((t) => t.status === 'done').map((t) => t.id));
  return all
    .filter((t) => t.status === 'todo')
    .filter((t) => (JSON.parse(t.dependsOnJson) as string[]).every((d) => doneIds.has(d)))
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
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
    // lastMessage = the producer's output, truncated (§6 token discipline). Read
    // back by downstream tasks (prompt chaining, plan §2.9) and the reviewer.
    payload: { title: next.title, sessionId: resp.sessionId, provider: resp.provider, lastMessage: resp.text.slice(0, LAST_MESSAGE_MAX), ...extraPayload },
  });

  return { kind: 'task_done', taskId: next.id };
}

interface DelegationContext {
  proj: ExecProject | undefined;
  llm: LLMClient;
  skillContext: string;
  memCtx: MemoryContext;
  /** Prompt-chaining block from upstream dependsOn tasks (plan §2.9). */
  upstream: string;
  delegation: (typeof TIER_B_DELEGATION_MAP)[string];
  agentId: string;
}

// Runs the §5 review gate on a produced diff: write it under data/outputs, check
// it applies + collect the real Code-Reviewer (LLM) + deterministic Reality-Checker
// verdicts, log the result. The Reality Checker derives evidence from the diff +
// producer output (plan §2.5) — never auto-approves an unsubstantiated diff
// (CLAUDE.md §11.bis r4).
interface GateArgs {
  db: Db;
  m: Mission;
  next: Task;
  repoDir: string;
  diff: string;
  fiche: string;
  llm: LLMClient;
  lastMessage: string;
}

async function gateProducedDiff(
  args: GateArgs,
): Promise<{ outputPath: string; review: ReviewGateResult }> {
  const { db, m, next, repoDir, diff, fiche, llm, lastMessage } = args;
  const patchPath = `${OUTPUTS_DIR}/${next.id}.patch`;
  const absDir = resolve(repoRootDir(), OUTPUTS_DIR);
  mkdirSync(absDir, { recursive: true });
  // git apply rejects a patch with no trailing newline ("corrupt patch"); the
  // extracted diff body is trimmed, so re-add one before writing/validating.
  const patch = diff.endsWith('\n') ? diff : `${diff}\n`;
  writeFileSync(resolve(repoRootDir(), patchPath), patch, 'utf-8');

  const review = await reviewProducedDiff({
    taskId: next.id,
    diff: patch,
    repoDir,
    llm,
    taskBrief: { title: next.title, description: next.description },
    lastMessage,
    taskRisk: next.risk,
  });
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

// Evaluator-Optimizer (anthropic-ecosystem.md:170): a produced diff that the gate
// does not approve gets ONE bounded re-attempt cycle. Bounded by both the
// iteration cap AND the task budget (production-patterns.md:101 circuit breaker) —
// an unbounded "loop until satisfied" is a KILL criterion (plan §1). Default 2.
const MAX_REVIEW_ITERATIONS = 2;

// Findings the next producer attempt must address, as a prompt block. Hoisted
// literal (S1192).
const FINDINGS_HEADER = '### Reviewer findings to address:';
function findingsBlock(review: ReviewGateResult): string {
  const lines = review.verdicts
    .flatMap((v) => v.findings)
    .filter((f) => f.severity !== 'info')
    .map((f) => `- [${f.severity}] ${f.message}`);
  return lines.length > 0 ? `${FINDINGS_HEADER}\n${lines.join('\n')}` : FINDINGS_HEADER;
}

async function runDelegatedTask(
  db: Db,
  m: Mission,
  next: Task,
  ctx: DelegationContext,
  taskSkillIds: string[],
): Promise<{ kind: 'task_done'; taskId: string }> {
  const { proj, llm, skillContext, memCtx, upstream, delegation, agentId } = ctx;
  // Prompt chaining: the delegated path carries upstream output in skillContext
  // (the producer/critic system prompt), since the user prompt is the task brief.
  const chainedSkillContext = [skillContext, upstream].filter(Boolean).join('\n\n');
  const baseInput = {
    agentId,
    task: { title: next.title, description: next.description },
    llm,
    project: { defaultModel: proj?.defaultModel ?? undefined, defaultMode: (proj?.defaultMode ?? undefined) as Mode | undefined },
    memoryText: memCtx.text,
    language: proj?.language ?? undefined,
  };

  // Only the producer call is fallback-eligible: a fiche-load failure (e.g. the
  // Next bundler where import.meta.url is not a file: URL — same degradation as
  // getSkillRouter/selectLLM) or a failed LLM call falls back to the raw path,
  // which then issues the single bill. Once delegateWithDiff returns, the call is
  // billed; the gate + (bounded) loop + persist below run OUTSIDE the catch so a
  // downstream throw propagates and never re-bills via runRawTask.
  let outcome: Awaited<ReturnType<typeof delegateWithDiff>>;
  try {
    outcome = await delegateWithDiff({ ...baseInput, skillContext: chainedSkillContext });
  } catch (e) {
    logEventDetached(db, {
      missionId: m.id,
      taskId: next.id,
      type: 'delegation_fallback',
      payload: { fiche: delegation.fiche, message: String(e) },
    });
    return runRawTask(db, m, next, { proj, llm, skillContext, memCtx, upstream }, taskSkillIds);
  }

  let outputPath = `${OUTPUTS_DIR}/${next.id}.md`;
  let review: ReviewGateResult | undefined;
  let spentTokens = outcome.response.inputTokens + outcome.response.outputTokens;

  if (outcome.diff && proj?.path) {
    const gated = await gateProducedDiff({ db, m, next, repoDir: proj.path, diff: outcome.diff, fiche: delegation.fiche, llm, lastMessage: outcome.response.text });
    outputPath = gated.outputPath;
    review = gated.review;

    // Bounded correction loop: re-invoke the producer with the prior findings
    // injected, re-gate, until approved OR the cap OR the budget is reached.
    for (let iteration = 1; iteration <= MAX_REVIEW_ITERATIONS && review && !review.approved; iteration++) {
      // Project the next retry's cost as ≈ the last iteration's spend and bail
      // BEFORE incurring it: delegateWithDiff bills the moment it returns, so the
      // bounded loop must stop here or it could overrun next.budgetTokens.
      const lastSpend = outcome.response.inputTokens + outcome.response.outputTokens;
      if (spentTokens + lastSpend > (next.budgetTokens ?? Number.MAX_SAFE_INTEGER)) break;

      const retrySkillContext = [chainedSkillContext, findingsBlock(review)].filter(Boolean).join('\n\n');
      outcome = await delegateWithDiff({ ...baseInput, skillContext: retrySkillContext });
      spentTokens += outcome.response.inputTokens + outcome.response.outputTokens;

      if (!outcome.diff) {
        // Optimizer regression: an earlier iteration produced a diff, this retry
        // produced none. Keep the prior (unapproved) gate and stop — re-gating
        // nothing would falsely "approve" by absence. Surfaced for the daily report.
        await logEvent(db, {
          missionId: m.id,
          taskId: next.id,
          agentId: next.agentId ?? undefined,
          type: 'producer_regressed_no_diff',
          risk: next.risk,
          payload: { iteration },
        });
        break;
      }
      const reGated = await gateProducedDiff({ db, m, next, repoDir: proj.path, diff: outcome.diff, fiche: delegation.fiche, llm, lastMessage: outcome.response.text });
      outputPath = reGated.outputPath;
      review = reGated.review;
      await logEvent(db, {
        missionId: m.id,
        taskId: next.id,
        agentId: next.agentId ?? undefined,
        type: 'review_iteration',
        risk: next.risk,
        payload: { iteration, approved: review.approved, verdicts: review.verdicts },
      });
    }
  }

  // Single bill: charge the SUM of producer iterations (each bounded). Mirrors the
  // response shape so persistTaskDone records the real spend, not just the last call.
  const billedResponse: LLMResponse = {
    ...outcome.response,
    inputTokens: spentTokens,
    outputTokens: 0,
  };

  return persistTaskDone(db, m, next, proj, billedResponse, outputPath, {
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
  const { proj, llm, skillContext, memCtx, upstream } = ctx;
  const resp = await llm.call({
    system: [
      languageDirective(proj?.language),
      `You are executing a task inside project at path ${proj?.path ?? '.'}.`,
      memCtx.text,
      skillContext,
    ].filter(Boolean).join('\n\n'),
    user: [`Task: ${next.title}\n\n${next.description}`, upstream].filter(Boolean).join('\n\n'),
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

  const llm = await buildMissionLLM(db, m.id, next.id, proj, new Date());

  const taskSkillIds: string[] = JSON.parse(next.skillsJson ?? '[]');
  const skillContext = getSkillRouter().buildPromptContext(taskSkillIds);
  const memCtx = memoryContextFor(proj?.id, next.title);
  const upstream = await upstreamResults(db, next);
  const baseCtx = { proj, llm, skillContext, memCtx, upstream };

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

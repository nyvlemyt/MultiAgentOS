import { and, eq, inArray } from 'drizzle-orm';
import { missions, projects, type Task, type Mission } from '@mas/db';
import { type LLMClient, type ReviewerVerdict } from '@mas/core';
import { runCloseOutRitual } from '@mas/memory';
import { type Db, logEvent, lastMessageFor } from './mission-events';
import { buildMissionLLM } from './mission-llm';
import { realReviewer, realSecReviewer, realQualityController, realAgentEvaluator } from './reviewers';

// Critic sequence (AGENTS.md §4): QC gate → sec loop on high/blocking tasks →
// reviewer on the last task → advisory Agent-Evaluator. Returns the QC verdict
// plus the blocking verdicts[] (sec + reviewer). The Agent-Evaluator is ADVISORY
// (logged `agent_evaluation`, never pushed to verdicts[], best-effort try/catch).
async function runCriticGates(
  db: Db, m: Mission, all: Task[], llm: LLMClient, lastTask: Task | undefined,
): Promise<{ qc: ReviewerVerdict; verdicts: ReviewerVerdict[] }> {
  // Quality Controller gate (AGENTS.md §4): runs BEFORE the reviewer. It checks
  // PROCESS/RULES (conventions, no-PAYG drift, architecture, output language),
  // not the CODE. A QC BLOCK blocks the mission and short-circuits the reviewer.
  const qc = await realQualityController(llm, { taskId: lastTask?.id ?? m.id, taskTitles: all.map((t) => t.title) });
  await logEvent(db, { missionId: m.id, taskId: lastTask?.id, agentId: 'quality-controller', type: 'quality_control_verdict', payload: qc });

  // A QC BLOCK short-circuits the sec/reviewer stage; otherwise run sec-reviewer
  // on every high/blocking-risk task and the reviewer on the last task.
  const verdicts: ReviewerVerdict[] = [];
  if (qc.verdict === 'BLOCK') return { qc, verdicts };

  for (const t of all) {
    if (t.risk === 'high' || t.risk === 'blocking') {
      const sec = await realSecReviewer(llm, { taskId: t.id, risk: t.risk, brief: { title: t.title, description: t.description } });
      await logEvent(db, { missionId: m.id, taskId: t.id, agentId: 'sec-reviewer', type: 'sec_review_verdict', payload: sec });
      verdicts.push(sec);
    }
  }
  if (lastTask) {
    const lastMessage = await lastMessageFor(db, lastTask.id);
    const rev = await realReviewer(llm, {
      taskId: lastTask.id,
      brief: { title: lastTask.title, description: lastTask.description },
      lastMessage,
    });
    await logEvent(db, { missionId: m.id, taskId: lastTask.id, agentId: 'reviewer', type: 'review_verdict', payload: rev });
    verdicts.push(rev);

    // Agent Evaluator (Phase 9 · 0c, RES-043 agent-as-judge): the transverse
    // rubric judge — runs AFTER the gates and is ADVISORY (logged, never blocks).
    // It scores the deliverable (deliver/fix/redo) so the autopilot/daily report
    // surfaces output quality without changing the §5 gate semantics. Best-effort
    // (like the close-out ritual below): an advisory score must never stall a
    // mission at `review` — e.g. a stale DB missing the agent-evaluator row.
    try {
      const evaluation = await realAgentEvaluator(llm, {
        taskId: lastTask.id,
        brief: { title: lastTask.title, description: lastTask.description },
        lastMessage,
      });
      await logEvent(db, { missionId: m.id, taskId: lastTask.id, agentId: 'agent-evaluator', type: 'agent_evaluation', payload: evaluation });
    } catch (e) {
      await logEvent(db, { missionId: m.id, taskId: lastTask.id, type: 'agent_evaluation_error', payload: { message: String(e) } });
    }
  }
  return { qc, verdicts };
}

export async function runReviewPhase(db: Db, m: Mission, all: Task[]): Promise<{ kind: 'mission_complete' }> {
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

  // Real critics need an LLMClient via the executor's seam (MAS_MOCK_LLM / vi.mock):
  // deterministic verdicts, CI never hits a live model. The §5 risk gate already
  // fired during execution; this phase only judges the finished artifacts.
  const [proj] = await db
    .select({
      id: projects.id, path: projects.path, autonomy: projects.autonomy,
      sessionId: projects.sessionId, defaultModel: projects.defaultModel,
      defaultMode: projects.defaultMode, language: projects.language,
    })
    .from(projects)
    .innerJoin(missions, eq(missions.projectId, projects.id))
    .where(eq(missions.id, m.id));
  const llm = await buildMissionLLM(db, m.id, lastTask?.id, proj, new Date());

  const { qc, verdicts } = await runCriticGates(db, m, all, llm, lastTask);

  const blocked = qc.verdict === 'BLOCK' || verdicts.some((v) => v.verdict === 'BLOCK');
  if (blocked) {
    const reason = qc.verdict === 'BLOCK' ? 'quality_control_block' : 'review_block';
    await db.update(missions).set({ status: 'blocked', updatedAt: new Date() }).where(eq(missions.id, m.id));
    await logEvent(db, { missionId: m.id, type: 'mission_blocked', payload: { reason } });
  } else {
    await db.update(missions).set({ status: 'validated', updatedAt: new Date() }).where(eq(missions.id, m.id));
    await logEvent(db, { missionId: m.id, type: 'mission_validated' });
  }

  // ADR 0004 §1: mission end auto-fires the close-out ritual (candidates only; §8
  // write-lock untouched). Fired here — the single chokepoint the worker and the web
  // inline path both cross. Idempotent via AUTO_CAPTURE_EVENT, so a replayed tick no-ops.
  // Best-effort: a ritual failure must not fail the mission.
  try {
    await runCloseOutRitual(db, m.id);
  } catch (e) {
    await logEvent(db, { missionId: m.id, type: 'auto_capture_error', payload: { message: String(e) } });
  }
  return { kind: 'mission_complete' };
}

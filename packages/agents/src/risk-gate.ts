import { randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { missions, tasks, validations, type Mission, type Task } from '@mas/db';
import { type BlockedPathError, type Risk } from '@mas/core';
import { type Db, logEvent } from './mission-events';

export interface RiskGatePause {
  kind: 'paused_for_validation';
  taskId: string;
}

interface PauseOptions {
  actionSummary?: string;
  reason?: string;
  payload?: Record<string, unknown>;
}

// §5 gate body (moved out of dispatch.ts): park the task in needs_validation and
// open the pending validation row a human must decide. WHEN to gate stays with the
// caller — executeNextTask for plan-time risk, runDelegatedTask for a produced
// diff that escapes the project.
export async function pauseForRiskGate(
  db: Db,
  m: Mission,
  next: Task,
  opts: PauseOptions = {},
): Promise<RiskGatePause> {
  await db
    .update(tasks)
    .set({ status: 'needs_validation', updatedAt: new Date() })
    .where(eq(tasks.id, next.id));
  await db.insert(validations).values({
    id: `val_${randomUUID()}`,
    taskId: next.id,
    requestedByAgent: next.agentId ?? 'dispatcher',
    actionSummary: opts.actionSummary ?? `Run high-risk task: ${next.title}`,
    status: 'pending',
    payloadJson: JSON.stringify(opts.payload ?? { risk: next.risk }),
  });
  await logEvent(db, {
    missionId: m.id,
    taskId: next.id,
    type: 'validation_requested',
    risk: next.risk,
    payload: { reason: opts.reason ?? 'risk gate' },
  });
  return { kind: 'paused_for_validation', taskId: next.id };
}

// A produced diff targets a path outside project.path — CLAUDE.md §5 "cross-project
// leakage", always gated. Escalate to blocking (the sec-reviewer contract for a path
// escape), record the producer spend already billed (§6: the call happened, the
// ledger must say so), and pause. No retry: re-asking an agent that just tried to
// escape spends quota on the wrong side of the gate — the human decides.
export async function pauseForPathEscape(
  db: Db,
  m: Mission,
  next: Task,
  err: BlockedPathError,
  outputPath: string,
  spentTokens: number,
): Promise<RiskGatePause> {
  const to: Risk = 'blocking';
  await db
    .update(tasks)
    .set({ risk: to, outputPath, spentTokens, updatedAt: new Date() })
    .where(eq(tasks.id, next.id));
  await db
    .update(missions)
    .set({ spentTokens: (m.spentTokens ?? 0) + spentTokens, updatedAt: new Date() })
    .where(eq(missions.id, m.id));
  await logEvent(db, {
    missionId: m.id,
    taskId: next.id,
    type: 'risk_classified',
    risk: to,
    tokensIn: spentTokens,
    payload: { rule: 'path-escape', from: next.risk, to, target: err.target, reason: err.message, outputPath },
  });
  return pauseForRiskGate(db, m, { ...next, risk: to }, {
    actionSummary: `Diff writes outside the project: ${err.target}`,
    reason: 'path escape',
    payload: { risk: to, target: err.target, outputPath },
  });
}

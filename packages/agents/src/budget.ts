import { randomUUID } from 'node:crypto';
import { and, eq, sql } from 'drizzle-orm';
import { getDb, budgets, events } from '@mas/db';
import type { LLMResponse } from '@mas/core';
import type { Db } from './dispatch.js';

export class BudgetExceededError extends Error {
  constructor(
    public readonly scope: string,
    public readonly period: string,
  ) {
    super(`Budget cap would be exceeded: ${scope} ${period}`);
    this.name = 'BudgetExceededError';
  }
}

/**
 * Pre-emptive budget guard. Throws before a call if spending estimatedCostCents
 * would push any budget row over its cap.
 */
export async function checkBudget(opts: {
  db?: Db;
  missionId?: string;
  estimatedCostCents?: number;
}): Promise<void> {
  const db = opts.db ?? getDb();
  const estimated = opts.estimatedCostCents ?? 0;

  // Check global caps (day + month)
  const globalRows = await db.select().from(budgets).where(eq(budgets.scope, 'global'));
  for (const row of globalRows) {
    if (row.moneyCapCents > 0 && (row.moneySpentCents >= row.moneyCapCents || row.moneySpentCents + estimated > row.moneyCapCents)) {
      throw new BudgetExceededError(row.scope, row.period);
    }
  }

  // Check mission token cap
  if (opts.missionId) {
    const [mRow] = await db
      .select()
      .from(budgets)
      .where(and(eq(budgets.scope, 'mission'), eq(budgets.scopeId, opts.missionId)));
    if (mRow && mRow.tokensSpent >= mRow.tokensCap) {
      throw new BudgetExceededError('mission', opts.missionId);
    }
  }
}

/** Write llm_call event + update all relevant budget rows. */
export async function recordUsage(opts: {
  db?: Db;
  response: LLMResponse;
  missionId?: string;
  taskId?: string;
  agentId?: string;
}): Promise<void> {
  const db = opts.db ?? getDb();
  const { response: res, missionId, taskId, agentId } = opts;
  const spent = res.inputTokens + res.outputTokens;

  // Insert the event without FK-constrained foreign keys to avoid failures
  // when recordUsage is called outside a full mission context (e.g. standalone LLM calls).
  // Budget rows are updated separately below using the missionId.
  await db.insert(events).values({
    id: `evt_${randomUUID()}`,
    missionId: null,
    taskId: null,
    agentId: null,
    type: 'llm_call',
    payloadJson: JSON.stringify({ model: res.model, missionId: missionId ?? null, taskId: taskId ?? null, agentId: agentId ?? null }),
    tokensIn: res.inputTokens,
    tokensOut: res.outputTokens,
    cacheRead: res.cacheReadTokens,
    cacheCreation: res.cacheCreationTokens,
    costCents: res.costCents,
    risk: 'low',
    createdAt: new Date(),
  });

  // Update all global budget rows atomically
  await db
    .update(budgets)
    .set({
      tokensSpent: sql`tokens_spent + ${spent}`,
      moneySpentCents: sql`money_spent_cents + ${res.costCents}`,
    })
    .where(eq(budgets.scope, 'global'));

  // Update mission budget if present
  if (missionId) {
    await db
      .update(budgets)
      .set({ tokensSpent: sql`tokens_spent + ${spent}` })
      .where(and(eq(budgets.scope, 'mission'), eq(budgets.scopeId, missionId)));
  }
}

/** Idempotent: creates mission budget row if it doesn't exist. */
export async function ensureMissionBudgetRow(opts: {
  db?: Db;
  missionId: string;
  budgetTokens: number;
}): Promise<void> {
  const db = opts.db ?? getDb();
  await db
    .insert(budgets)
    .values({
      id: `budget_mission_${opts.missionId}`,
      scope: 'mission',
      scopeId: opts.missionId,
      period: 'mission',
      tokensCap: opts.budgetTokens,
      tokensSpent: 0,
      moneyCapCents: 0,
      moneySpentCents: 0,
    })
    .onConflictDoNothing();
}

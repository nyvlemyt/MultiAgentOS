import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CLEAN_TEST_DIFF, useDispatchHarness, seedTierBMission } from './testing';

// A valid diff that edits file.txt but never covers the navbar brief → the
// Reality Checker returns NEEDS_WORK, so the gate is never approved and the
// evaluator-optimizer loop runs.
const NON_COVERING_DIFF = ['```diff', CLEAN_TEST_DIFF.trimEnd(), '```'].join('\n');

// Stateful producer: a real diff on the first call, then a diff-less reply on
// every retry — exercising the !outcome.diff regression break (diff-gate.ts).
const state = vi.hoisted(() => ({ producerCalls: 0 }));

vi.mock('@mas/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@mas/core')>();
  const { mockTierBCore } = await import('./testing');
  return mockTierBCore(actual, () => {
    state.producerCalls += 1;
    return state.producerCalls === 1
      ? `Here is the change:\n${NON_COVERING_DIFF}`
      : 'I could not safely produce a diff this round.';
  });
});

import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { eq, and } from 'drizzle-orm';
import { getDb, tasks, events } from '@mas/db';
import { executeNextTask, runMission } from './dispatch';

const MIGRATIONS_FOLDER = resolve(dirname(fileURLToPath(import.meta.url)), '../../db/migrations');
const PROJECT_ID = 'loop-break-proj';
const DELEGATION_AGENT = 'design-ui-designer';

const h = useDispatchHarness(MIGRATIONS_FOLDER, 'mas-loop-break-');
beforeEach(() => {
  state.producerCalls = 0;
});

const seed = (missionId: string, taskBudget: number) =>
  seedTierBMission({
    missionId, projectId: PROJECT_ID, name: 'LoopBreak', slug: 'loop-break', repoDir: h.repoDir,
    agentIds: [DELEGATION_AGENT, 'reviewer'], missionTitle: 'Loop mission', objective: 'Polish UI', missionBudget: 50000,
    task: { title: 'Polish the navbar', description: 'Improve spacing.', budgetTokens: taskBudget },
  });

describe('runDelegatedTask — loop break paths', () => {
  it('logs producer_regressed_no_diff and stops when a retry emits no diff', async () => {
    const MID = 'mid_no_diff';
    const taskId = await seed(MID, 50000); // budget high enough to reach the retry
    await runMission(MID);

    const r = await executeNextTask(MID);
    expect(r.kind).toBe('task_done');

    const db = getDb();
    const regressed = await db
      .select()
      .from(events)
      .where(and(eq(events.missionId, MID), eq(events.type, 'producer_regressed_no_diff')));
    expect(regressed).toHaveLength(1);
    expect(JSON.parse(regressed[0]!.payloadJson)).toMatchObject({ iteration: 1 });

    // The regression breaks BEFORE re-gating, so no review_iteration is recorded.
    const iterations = await db
      .select()
      .from(events)
      .where(and(eq(events.missionId, MID), eq(events.type, 'review_iteration')));
    expect(iterations).toHaveLength(0);

    const [t] = await db.select().from(tasks).where(eq(tasks.id, taskId));
    expect(t?.status).toBe('done'); // prior (unapproved) gate is kept; §5 owns the call
  });

  it('breaks the loop on the task budget projection before re-invoking the producer', async () => {
    const MID = 'mid_budget';
    // 500 < spent(300) + projected next spend(300): budget break trips on iter 1.
    const taskId = await seed(MID, 500);
    await runMission(MID);

    const r = await executeNextTask(MID);
    expect(r.kind).toBe('task_done');

    // Budget break fires before the retry → producer called exactly once, no
    // regression event, no second gate.
    expect(state.producerCalls).toBe(1);

    const db = getDb();
    const regressed = await db
      .select()
      .from(events)
      .where(and(eq(events.missionId, MID), eq(events.type, 'producer_regressed_no_diff')));
    expect(regressed).toHaveLength(0);
    const iterations = await db
      .select()
      .from(events)
      .where(and(eq(events.missionId, MID), eq(events.type, 'review_iteration')));
    expect(iterations).toHaveLength(0);

    const [t] = await db.select().from(tasks).where(eq(tasks.id, taskId));
    expect(t?.status).toBe('done');
  });
});

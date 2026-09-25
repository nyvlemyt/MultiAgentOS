import { describe, it, expect, vi } from 'vitest';
import { CLEAN_TEST_DIFF, useDispatchHarness, seedTierBMission } from './testing';

// A valid diff that edits file.txt — but the task brief is about the navbar, so
// it never covers the request and cites no tests → Reality Checker NEEDS_WORK →
// the gate is never approved, forcing the evaluator-optimizer loop to its bound.
const NON_COVERING_DIFF = ['```diff', CLEAN_TEST_DIFF.trimEnd(), '```'].join('\n');

vi.mock('@mas/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@mas/core')>();
  const { mockTierBCore } = await import('./testing');
  return mockTierBCore(actual, () => `Here is the change:\n${NON_COVERING_DIFF}`);
});

import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { eq, and } from 'drizzle-orm';
import { getDb, tasks, events } from '@mas/db';
import { executeNextTask, runMission } from './dispatch';

const MIGRATIONS_FOLDER = resolve(dirname(fileURLToPath(import.meta.url)), '../../db/migrations');
const PROJECT_ID = 'loop-proj';
const DELEGATION_AGENT = 'design-ui-designer';

const h = useDispatchHarness(MIGRATIONS_FOLDER, { repoPrefix: 'mas-loop-' });

const seed = (missionId: string) =>
  seedTierBMission({
    missionId, projectId: PROJECT_ID, name: 'Loop', slug: 'loop', repoDir: h.repoDir,
    agentIds: [DELEGATION_AGENT, 'reviewer'], missionTitle: 'Loop mission', objective: 'Polish UI', missionBudget: 50000,
    task: { title: 'Polish the navbar', description: 'Improve spacing.', budgetTokens: 50000 },
  });

describe('runDelegatedTask — evaluator-optimizer loop', () => {
  it('re-invokes the producer on NEEDS_WORK, bounded at 2 iterations', async () => {
    const MID = 'mid_loop';
    const taskId = await seed(MID);
    await runMission(MID);

    const r = await executeNextTask(MID);
    expect(r.kind).toBe('task_done');

    const db = getDb();
    const iterations = await db
      .select()
      .from(events)
      .where(and(eq(events.missionId, MID), eq(events.type, 'review_iteration')));
    // Bounded: never more than maxReviewIterations (default 2).
    expect(iterations.length).toBeGreaterThanOrEqual(1);
    expect(iterations.length).toBeLessThanOrEqual(2);
    // The unapproved diff is recorded as such — the task still completes; the
    // §5 human gate / mission review owns the final call.
    const [t] = await db.select().from(tasks).where(eq(tasks.id, taskId));
    expect(t?.status).toBe('done');
    const review = await db
      .select()
      .from(events)
      .where(and(eq(events.taskId, taskId), eq(events.type, 'tier_b_review')));
    const lastReview = JSON.parse(review.at(-1)!.payloadJson) as { approved: boolean };
    expect(lastReview.approved).toBe(false);
  });
});

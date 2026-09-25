import { describe, it, expect, vi } from 'vitest';
import { CLEAN_TEST_DIFF, useDispatchHarness, seedTierBMission } from './testing';

const DELEGATED_DIFF = ['```diff', CLEAN_TEST_DIFF.trimEnd(), '```'].join('\n');

// Shared Tier-B mock (testing.ts): critics get a parseable verdict, the producer
// returns the diff above. Dynamic import — the factory is hoisted.
vi.mock('@mas/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@mas/core')>();
  const { mockTierBCore } = await import('./testing');
  return mockTierBCore(actual, () => `Here is the change:\n${DELEGATED_DIFF}`);
});

import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { eq, and } from 'drizzle-orm';
import { getDb, tasks, events } from '@mas/db';
import { executeNextTask, runMission } from './dispatch';

const MIGRATIONS_FOLDER = resolve(dirname(fileURLToPath(import.meta.url)), '../../db/migrations');
const PROJECT_ID = 'deleg-proj';
const DELEGATION_AGENT = 'design-ui-designer';
const AGENT_IDS = [DELEGATION_AGENT, 'reviewer', 'quality-controller', 'sec-reviewer'];

const h = useDispatchHarness(MIGRATIONS_FOLDER, { repoPrefix: 'mas-deleg-' });

// Description names file.txt (the file the CLEAN_TEST_DIFF edits) so the diff
// covers the request → Reality Checker has evidence → gate approves on the
// first pass and the evaluator-optimizer loop does not fire (single review).
const seedDelegableMission = (missionId: string) =>
  seedTierBMission({
    missionId, projectId: PROJECT_ID, name: 'Deleg Project', slug: 'deleg', repoDir: h.repoDir,
    agentIds: AGENT_IDS, missionTitle: 'Delegable mission', objective: 'Polish UI', missionBudget: 20000,
    task: { title: 'Edit file.txt', description: 'Change hello to goodbye in file.txt.', budgetTokens: 5000 },
  });

describe('dispatch — Tier B delegation', () => {
  it('routes a low-risk delegable task through the review gate with both verdicts', async () => {
    const MID = 'mid_deleg';
    const taskId = await seedDelegableMission(MID);
    await runMission(MID);

    const r = await executeNextTask(MID);
    expect(r.kind).toBe('task_done');

    const db = getDb();
    const reviewEvents = await db
      .select()
      .from(events)
      .where(and(eq(events.missionId, MID), eq(events.type, 'tier_b_review')));
    expect(reviewEvents).toHaveLength(1);

    // safe: toHaveLength(1) above guarantees reviewEvents[0] exists
    const payload = JSON.parse(reviewEvents[0]!.payloadJson) as {
      verdicts: { findings: { message: string }[] }[];
      diffValid: boolean;
      fiche: string;
    };
    // Both reviewers ran: a code-review verdict and a reality-check verdict.
    const messages = payload.verdicts.flatMap((v) => v.findings.map((f) => f.message));
    expect(messages.some((msg) => msg.includes('code-review'))).toBe(true);
    expect(messages.some((msg) => msg.includes('reality-check'))).toBe(true);
    expect(payload.verdicts).toHaveLength(2);
    expect(payload.diffValid).toBe(true);
    expect(payload.fiche).toBe(DELEGATION_AGENT);

    const [t] = await db.select().from(tasks).where(eq(tasks.id, taskId));
    expect(t?.outputPath?.endsWith('.patch')).toBe(true);
    expect(t?.status).toBe('done');
  });
});

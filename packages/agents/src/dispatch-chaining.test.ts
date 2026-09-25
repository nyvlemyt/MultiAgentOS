import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useDispatchHarness } from './testing';

// Capture every producer LLM request so we can assert t2's prompt carries t1's
// output (prompt chaining, plan §2.9). t1 returns a distinctive marker.
const T1_MARKER = 'UPSTREAM-OUTPUT-MARKER-7f3a';
const calls: { system: string; user: string }[] = [];

// Shared Tier-B mock (testing.ts): critics get a parseable verdict; the producer
// callback records each request (critics never reach it) and answers the first
// one with the marker. Dynamic import — the factory is hoisted.
vi.mock('@mas/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@mas/core')>();
  const { mockTierBCore } = await import('./testing');
  return mockTierBCore(actual, (req) => {
    calls.push({ system: req.system, user: req.user });
    return calls.length === 1 ? `Result: ${T1_MARKER}` : 'Result: t2 done';
  });
});

import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getDb, projects, agents, missions, tasks } from '@mas/db';
import { executeNextTask, runMission } from './dispatch';

const MIGRATIONS_FOLDER = resolve(dirname(fileURLToPath(import.meta.url)), '../../db/migrations');
const PROJECT_ID = 'chain-proj';

useDispatchHarness(MIGRATIONS_FOLDER);
beforeEach(() => {
  calls.length = 0;
});

async function seedChain(missionId: string) {
  const db = getDb();
  await db.insert(projects).values({
    id: PROJECT_ID, name: 'Chain', slug: 'chain', path: join(tmpdir(), 'chain'), type: 'other',
    createdAt: new Date(), lastActiveAt: new Date(),
  });
  // Non-delegated agent → raw path → upstream block lands in the user prompt.
  await db.insert(agents).values({
    id: 'mission-planner', tier: 'A', fichePath: 'f/x.md', name: 'mp', model: 'claude-haiku-4-5',
    enabled: true, totalRuns: 0, totalTokens: 0, successRate: 1,
  });
  await db.insert(missions).values({
    id: missionId, projectId: PROJECT_ID, title: 'Chain mission', objective: 'chain',
    status: 'planned', risk: 'low', budgetTokens: 50000, spentTokens: 0,
    createdAt: new Date(), updatedAt: new Date(),
  });
  const base = { missionId, status: 'todo' as const, risk: 'low' as const, agentId: 'mission-planner', skillsJson: '[]', budgetTokens: 5000, spentTokens: 0 };
  await db.insert(tasks).values({
    ...base, id: `${missionId}_t1`, title: 'Research', description: 'gather facts', dependsOnJson: '[]',
    createdAt: new Date(2026, 0, 1, 0, 0, 0), updatedAt: new Date(),
  });
  await db.insert(tasks).values({
    ...base, id: `${missionId}_t2`, title: 'Synthesize', description: 'use the research', dependsOnJson: JSON.stringify([`${missionId}_t1`]),
    createdAt: new Date(2026, 0, 1, 0, 0, 1), updatedAt: new Date(),
  });
}

describe('prompt chaining (executeTaskWithLLM)', () => {
  it("injects an upstream task's last_message into the dependent task's prompt", async () => {
    const MID = 'mid_chain';
    await seedChain(MID);
    await runMission(MID);

    const r1 = await executeNextTask(MID); // t1
    expect(r1.kind).toBe('task_done');
    const r2 = await executeNextTask(MID); // t2 depends on t1
    expect(r2.kind).toBe('task_done');

    // First producer call (t1) carries no upstream context; second (t2) does.
    expect(calls).toHaveLength(2);
    expect(calls[0].user).not.toContain(T1_MARKER);
    expect(calls[1].user).toContain(T1_MARKER);
    expect(calls[1].user).toContain('Research'); // upstream task title labelled
  });
});

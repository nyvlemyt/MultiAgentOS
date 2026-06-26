import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { CLEAN_TEST_DIFF, makeTempGitRepo } from './testing';

// A valid diff that edits file.txt but never covers the navbar brief → the
// Reality Checker returns NEEDS_WORK, so the gate is never approved and the
// evaluator-optimizer loop runs.
const NON_COVERING_DIFF = ['```diff', CLEAN_TEST_DIFF.trimEnd(), '```'].join('\n');

// Stateful producer: a real diff on the first call, then a diff-less reply on
// every retry — exercising the !outcome.diff regression break (dispatch.ts:493).
const state = vi.hoisted(() => ({ producerCalls: 0 }));

vi.mock('@mas/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@mas/core')>();
  const base = {
    inputTokens: 220,
    outputTokens: 80,
    cacheReadTokens: 60,
    cacheCreationTokens: 20,
    quotaUnits: 0,
    model: 'claude-haiku-4-5',
    sessionId: 'test-session-id',
  };
  return {
    ...actual,
    claudeCodeLLM: vi.fn(() => ({
      call: vi.fn(async (req: import('@mas/core').LLMRequest) => {
        if (req.reviewKind) {
          return { text: actual.mockVerdictText(req.reviewKind, req.user), ...base };
        }
        state.producerCalls += 1;
        const text =
          state.producerCalls === 1
            ? `Here is the change:\n${NON_COVERING_DIFF}`
            : 'I could not safely produce a diff this round.';
        return { text, ...base };
      }),
    })),
  };
});

import { unlinkSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { eq, and } from 'drizzle-orm';
import { getDb, closeDb, projects, agents, missions, tasks, events } from '@mas/db';
import { executeNextTask, runMission } from './dispatch';

const MIGRATIONS_FOLDER = resolve(dirname(fileURLToPath(import.meta.url)), '../../db/migrations');
const PROJECT_ID = 'loop-break-proj';
const DELEGATION_AGENT = 'design-ui-designer';

let dbPath: string;
let repoDir: string;

beforeEach(async () => {
  state.producerCalls = 0;
  delete process.env.MAS_MOCK_LLM;
  process.env.MAS_ROUTING_CONFIG = '/nonexistent/model-routing.json';
  const dir = join(tmpdir(), 'mas-test');
  mkdirSync(dir, { recursive: true });
  dbPath = join(dir, `${randomUUID()}.db`);
  process.env.MAS_DB_PATH = dbPath;
  migrate(getDb(), { migrationsFolder: MIGRATIONS_FOLDER });
  repoDir = await makeTempGitRepo('mas-loop-break-');
});

afterEach(() => {
  closeDb();
  try {
    unlinkSync(dbPath);
  } catch {
    /* ignore */
  }
  delete process.env.MAS_DB_PATH;
  delete process.env.MAS_ROUTING_CONFIG;
});

async function seed(missionId: string, taskBudget: number): Promise<string> {
  const db = getDb();
  await db.insert(projects).values({
    id: PROJECT_ID, name: 'LoopBreak', slug: 'loop-break', path: repoDir, type: 'other',
    createdAt: new Date(), lastActiveAt: new Date(),
  });
  for (const id of [DELEGATION_AGENT, 'reviewer']) {
    await db.insert(agents).values({
      id, tier: 'A', fichePath: `f/${id}.md`, name: id, model: 'claude-haiku-4-5',
      enabled: true, totalRuns: 0, totalTokens: 0, successRate: 1,
    });
  }
  await db.insert(missions).values({
    id: missionId, projectId: PROJECT_ID, title: 'Loop mission', objective: 'Polish UI',
    status: 'planned', risk: 'low', budgetTokens: 50000, spentTokens: 0,
    createdAt: new Date(), updatedAt: new Date(),
  });
  const taskId = `${missionId}_t1`;
  await db.insert(tasks).values({
    id: taskId, missionId, title: 'Polish the navbar', description: 'Improve spacing.',
    status: 'todo', risk: 'low', agentId: DELEGATION_AGENT,
    skillsJson: '[]', dependsOnJson: '[]', budgetTokens: taskBudget, spentTokens: 0,
    createdAt: new Date(), updatedAt: new Date(),
  });
  return taskId;
}

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
    expect(regressed.length).toBe(1);
    expect(JSON.parse(regressed[0]!.payloadJson)).toMatchObject({ iteration: 1 });

    // The regression breaks BEFORE re-gating, so no review_iteration is recorded.
    const iterations = await db
      .select()
      .from(events)
      .where(and(eq(events.missionId, MID), eq(events.type, 'review_iteration')));
    expect(iterations.length).toBe(0);

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
    expect(regressed.length).toBe(0);
    const iterations = await db
      .select()
      .from(events)
      .where(and(eq(events.missionId, MID), eq(events.type, 'review_iteration')));
    expect(iterations.length).toBe(0);

    const [t] = await db.select().from(tasks).where(eq(tasks.id, taskId));
    expect(t?.status).toBe('done');
  });
});

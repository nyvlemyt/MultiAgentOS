import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { CLEAN_TEST_DIFF, makeTempGitRepo } from './testing';

// A valid diff that edits file.txt — but the task brief is about the navbar, so
// it never covers the request and cites no tests → Reality Checker NEEDS_WORK →
// the gate is never approved, forcing the evaluator-optimizer loop to its bound.
const NON_COVERING_DIFF = ['```diff', CLEAN_TEST_DIFF.trimEnd(), '```'].join('\n');

vi.mock('@mas/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@mas/core')>();
  return {
    ...actual,
    claudeCodeLLM: vi.fn(() => ({
      call: vi.fn(async (req: import('@mas/core').LLMRequest) => ({
        text: req.reviewKind
          ? actual.mockVerdictText(req.reviewKind, req.user)
          : `Here is the change:\n${NON_COVERING_DIFF}`,
        inputTokens: 220,
        outputTokens: 80,
        cacheReadTokens: 60,
        cacheCreationTokens: 20,
        quotaUnits: 0,
        model: 'claude-haiku-4-5',
        sessionId: 'test-session-id',
      })),
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
const PROJECT_ID = 'loop-proj';
const DELEGATION_AGENT = 'design-ui-designer';

let dbPath: string;
let repoDir: string;

beforeEach(async () => {
  delete process.env.MAS_MOCK_LLM;
  process.env.MAS_ROUTING_CONFIG = '/nonexistent/model-routing.json';
  const dir = join(tmpdir(), 'mas-test');
  mkdirSync(dir, { recursive: true });
  dbPath = join(dir, `${randomUUID()}.db`);
  process.env.MAS_DB_PATH = dbPath;
  migrate(getDb(), { migrationsFolder: MIGRATIONS_FOLDER });
  repoDir = await makeTempGitRepo('mas-loop-');
});

afterEach(() => {
  closeDb();
  try { unlinkSync(dbPath); } catch { /* ignore */ }
  delete process.env.MAS_DB_PATH;
  delete process.env.MAS_ROUTING_CONFIG;
});

async function seed(missionId: string): Promise<string> {
  const db = getDb();
  await db.insert(projects).values({
    id: PROJECT_ID, name: 'Loop', slug: 'loop', path: repoDir, type: 'other',
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
    skillsJson: '[]', dependsOnJson: '[]', budgetTokens: 50000, spentTokens: 0,
    createdAt: new Date(), updatedAt: new Date(),
  });
  return taskId;
}

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

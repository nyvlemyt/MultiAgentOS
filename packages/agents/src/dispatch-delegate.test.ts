import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { CLEAN_TEST_DIFF, makeTempGitRepo } from './testing';

const DELEGATED_DIFF = ['```diff', CLEAN_TEST_DIFF.trimEnd(), '```'].join('\n');

vi.mock('@mas/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@mas/core')>();
  return {
    ...actual,
    // A critic call (reviewKind set) gets a deterministic, parseable verdict so
    // CI stays live-model-free; any other call returns the producer diff text.
    claudeCodeLLM: vi.fn(() => ({
      call: vi.fn(async (req: import('@mas/core').LLMRequest) => ({
        text: req.reviewKind
          ? actual.mockVerdictText(req.reviewKind, req.user)
          : `Here is the change:\n${DELEGATED_DIFF}`,
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

const __dirname = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_FOLDER = resolve(__dirname, '../../db/migrations');

const PROJECT_ID = 'deleg-proj';
const DELEGATION_AGENT = 'design-ui-designer';
const AGENT_IDS = [DELEGATION_AGENT, 'reviewer', 'quality-controller', 'sec-reviewer'];

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
  repoDir = await makeTempGitRepo('mas-deleg-');
});

afterEach(() => {
  closeDb();
  try { unlinkSync(dbPath); } catch { /* ignore */ }
  delete process.env.MAS_DB_PATH;
  delete process.env.MAS_ROUTING_CONFIG;
});

async function seedDelegableMission(missionId: string): Promise<string> {
  const db = getDb();
  await db.insert(projects).values({
    id: PROJECT_ID, name: 'Deleg Project', slug: 'deleg', path: repoDir, type: 'other',
    createdAt: new Date(), lastActiveAt: new Date(),
  });
  for (const id of AGENT_IDS) {
    await db.insert(agents).values({
      id, tier: 'A', fichePath: `f/${id}.md`, name: id, model: 'claude-haiku-4-5',
      enabled: true, totalRuns: 0, totalTokens: 0, successRate: 1,
    });
  }
  await db.insert(missions).values({
    id: missionId, projectId: PROJECT_ID, title: 'Delegable mission',
    objective: 'Polish UI', status: 'planned', risk: 'low',
    budgetTokens: 20000, spentTokens: 0, createdAt: new Date(), updatedAt: new Date(),
  });
  const taskId = `${missionId}_t1`;
  await db.insert(tasks).values({
    id: taskId, missionId, title: 'Polish the navbar', description: 'Improve spacing.',
    status: 'todo', risk: 'low', agentId: DELEGATION_AGENT,
    skillsJson: '[]', dependsOnJson: '[]', budgetTokens: 5000, spentTokens: 0,
    createdAt: new Date(), updatedAt: new Date(),
  });
  return taskId;
}

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

    const payload = JSON.parse(reviewEvents[0].payloadJson) as {
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

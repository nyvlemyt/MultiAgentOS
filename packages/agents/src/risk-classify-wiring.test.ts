import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Drive the deterministic mock LLM; the gate fires before any LLM call anyway.
// Override only the planner so a task carries a §5 always-gate pattern.
vi.mock('@mas/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@mas/core')>();
  return {
    ...actual,
    mockMissionPlanner: vi.fn((input: { missionId: string; title: string; objective: string }) => ({
      clarifyingQuestions: [],
      objective: input.objective,
      tasks: [
        {
          id: `${input.missionId}_t1`,
          title: 'Clean the build directory',
          description: 'run rm -rf build to reclaim space',
          agentHint: 'engineering-frontend-developer',
          skillsHint: [],
          dependsOn: [],
          budgetTokens: 500,
          risk: 'low' as const,
        },
      ],
      estimatedTokens: 500,
      estimatedQuotaUnits: 1,
    })),
  };
});

import { unlinkSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { eq, and } from 'drizzle-orm';
import { getDb, closeDb, tasks, events } from '@mas/db';
import { planMission, runMission, executeNextTask } from './dispatch';
import { seedAgentsRoster, seedProject, seedMission } from './testing';

const MIGRATIONS_FOLDER = resolve(dirname(fileURLToPath(import.meta.url)), '../../db/migrations');

let dbPath: string;
beforeEach(async () => {
  process.env.MAS_MOCK_LLM = '1';
  const dir = join(tmpdir(), 'mas-risk-wiring');
  mkdirSync(dir, { recursive: true });
  dbPath = join(dir, `${randomUUID()}.db`);
  process.env.MAS_DB_PATH = dbPath;
  migrate(getDb(), { migrationsFolder: MIGRATIONS_FOLDER });
  await seedProject('test-proj');
  await seedAgentsRoster();
  await seedMission('mid_rm', 'test-proj');
});
afterEach(() => {
  closeDb();
  try { unlinkSync(dbPath); } catch { /* ignore */ }
  delete process.env.MAS_DB_PATH;
  delete process.env.MAS_MOCK_LLM;
});

describe('planMission — risk classifier wiring', () => {
  it('escalates an rm -rf task to blocking and persists it', async () => {
    await planMission('mid_rm');
    const db = getDb();
    const [t] = await db.select().from(tasks).where(eq(tasks.id, 'mid_rm_t1'));
    expect(t?.risk).toBe('blocking');
  });

  it('logs a risk_classified event with the from/to transition', async () => {
    await planMission('mid_rm');
    const db = getDb();
    const evs = await db
      .select()
      .from(events)
      .where(and(eq(events.missionId, 'mid_rm'), eq(events.type, 'risk_classified')));
    expect(evs).toHaveLength(1);
    const payload = JSON.parse(evs[0]!.payloadJson) as { rule: string; from: string; to: string };
    expect(payload.from).toBe('low');
    expect(payload.to).toBe('blocking');
    expect(payload.rule).toBe('rm');
  });

  it('pauses at the §5 gate when executed', async () => {
    await planMission('mid_rm');
    await runMission('mid_rm');
    const res = await executeNextTask('mid_rm');
    expect(res.kind).toBe('paused_for_validation');
  });
});

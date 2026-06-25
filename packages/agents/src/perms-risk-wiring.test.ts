import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Drive the deterministic mock LLM; the §5 gate fires before any LLM call.
// Override the planner so the lone task carries NO §5 always-gate pattern but
// DOES contain a config/permissions.json category's `action` keyword ("send
// message"). The only thing that can escalate it is the perms-category branch
// of classifyRisk (risk-classifier.ts:68-73) — exactly the wiring under test.
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
          title: 'Notify the customer',
          description: 'Send message to the customer about their order status',
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

import { unlinkSync, mkdirSync, writeFileSync } from 'node:fs';
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

// A high-risk outbound-message category whose `action` keyword appears in the
// task above — the §5 "single extension point" a domain agent would register.
const PERMS_WITH_CATEGORY = {
  version: 1,
  categories: [
    { category: 'outbound-message', action: 'send message', risk: 'high', allow_list: [] },
  ],
  allowed_hosts: [],
};

let dbPath: string;
let permsPath: string;
beforeEach(async () => {
  process.env.MAS_MOCK_LLM = '1';
  const dir = join(tmpdir(), 'mas-perms-wiring');
  mkdirSync(dir, { recursive: true });
  dbPath = join(dir, `${randomUUID()}.db`);
  permsPath = join(dir, `${randomUUID()}.permissions.json`);
  writeFileSync(permsPath, JSON.stringify(PERMS_WITH_CATEGORY), 'utf-8');
  process.env.MAS_DB_PATH = dbPath;
  process.env.MAS_PERMISSIONS_PATH = permsPath;
  migrate(getDb(), { migrationsFolder: MIGRATIONS_FOLDER });
  await seedProject('test-proj');
  await seedAgentsRoster();
  await seedMission('mid_perms', 'test-proj');
});
afterEach(() => {
  closeDb();
  try { unlinkSync(dbPath); } catch { /* ignore */ }
  try { unlinkSync(permsPath); } catch { /* ignore */ }
  delete process.env.MAS_DB_PATH;
  delete process.env.MAS_PERMISSIONS_PATH;
  delete process.env.MAS_MOCK_LLM;
});

describe('planMission — permission-category risk wiring', () => {
  it('escalates a task to the declared high risk and persists it', async () => {
    await planMission('mid_perms');
    const db = getDb();
    const [t] = await db.select().from(tasks).where(eq(tasks.id, 'mid_perms_t1'));
    expect(t?.risk).toBe('high');
  });

  it('logs a risk_classified event citing the perms category', async () => {
    await planMission('mid_perms');
    const db = getDb();
    const evs = await db
      .select()
      .from(events)
      .where(and(eq(events.missionId, 'mid_perms'), eq(events.type, 'risk_classified')));
    expect(evs).toHaveLength(1);
    const payload = JSON.parse(evs[0]!.payloadJson) as { rule: string; from: string; to: string };
    expect(payload.from).toBe('low');
    expect(payload.to).toBe('high');
    expect(payload.rule).toBe('perms:outbound-message');
  });

  it('pauses at the §5 gate when executed', async () => {
    await planMission('mid_perms');
    await runMission('mid_perms');
    const res = await executeNextTask('mid_perms');
    expect(res.kind).toBe('paused_for_validation');
  });
});

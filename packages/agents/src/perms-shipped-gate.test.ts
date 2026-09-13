import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// End-to-end proof that the §5 portico fires from the SHIPPED
// config/permissions.json — deliberately NO MAS_PERMISSIONS_PATH override, unlike
// perms-risk-wiring.test.ts which proves the same wiring against a fixture. That
// suite would keep passing with `"categories": []` on disk; this one would not.
//
// The planner is overridden so the lone task carries NO §5 always-gate pattern
// (no rm/sudo/eval/.env…) and declares risk `low`. The only thing that can
// escalate it is a category read from the real config file.
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
          title: input.title,
          description: input.objective,
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
import { getDb, closeDb, tasks, events, validations, projects } from '@mas/db';
import { planMission, runMission, executeNextTask } from './dispatch';
import { seedAgentsRoster, seedProject, seedMission } from './testing';

const MIGRATIONS_FOLDER = resolve(dirname(fileURLToPath(import.meta.url)), '../../db/migrations');

const PROJECT_ID = 'test-proj';
const PAUSED = 'paused_for_validation';

/** Mission briefs whose task text is the §5 category trigger under test (S1192). */
const OUTBOUND_MESSAGE = {
  id: 'mid_ship_high',
  title: 'Notify the customer',
  objective: 'Send an email to the customer about their order status',
} as const;
const OUTBOUND_MESSAGE_FR = {
  id: 'mid_ship_fr',
  title: 'Prevenir le client',
  objective: 'Envoyer un message au client pour confirmer sa commande',
} as const;
const PAYMENT = {
  id: 'mid_ship_block',
  title: 'Settle the invoice',
  objective: 'Process the payment for invoice 42',
} as const;
const BENIGN = {
  id: 'mid_ship_benign',
  title: 'Draft UX wireframe',
  objective: 'Produce a low-fi wireframe for the empty-state',
} as const;

interface Brief { readonly id: string; readonly title: string; readonly objective: string }

let dbPath: string;
beforeEach(async () => {
  process.env.MAS_MOCK_LLM = '1';
  const dir = join(tmpdir(), 'mas-perms-shipped');
  mkdirSync(dir, { recursive: true });
  dbPath = join(dir, `${randomUUID()}.db`);
  process.env.MAS_DB_PATH = dbPath;
  migrate(getDb(), { migrationsFolder: MIGRATIONS_FOLDER });
  await seedProject(PROJECT_ID);
  await seedAgentsRoster();
});
afterEach(() => {
  closeDb();
  try { unlinkSync(dbPath); } catch { /* ignore */ }
  delete process.env.MAS_DB_PATH;
  delete process.env.MAS_MOCK_LLM;
});

/** Plan + dispatch a one-task mission built from the brief, then try to run it. */
async function planAndExecute(brief: Brief) {
  await seedMission(brief.id, PROJECT_ID, { title: brief.title, objective: brief.objective });
  await planMission(brief.id);
  await runMission(brief.id);
  const res = await executeNextTask(brief.id);
  const db = getDb();
  const [task] = await db.select().from(tasks).where(eq(tasks.id, `${brief.id}_t1`));
  return { res, task };
}

async function eventsOfType(missionId: string, type: string) {
  const db = getDb();
  return db.select().from(events).where(and(eq(events.missionId, missionId), eq(events.type, type)));
}

describe('§5 gate — a high category pauses for human validation', () => {
  it('escalates an outbound-message task to high and parks it in needs_validation', async () => {
    const { res, task } = await planAndExecute(OUTBOUND_MESSAGE);
    expect(task?.risk).toBe('high');
    expect(res.kind).toBe(PAUSED);
    expect(task?.status).toBe('needs_validation');
  });

  it('opens a pending validation row a human must act on', async () => {
    await planAndExecute(OUTBOUND_MESSAGE);
    const db = getDb();
    const rows = await db
      .select()
      .from(validations)
      .where(eq(validations.taskId, `${OUTBOUND_MESSAGE.id}_t1`));
    expect(rows).toHaveLength(1);
    expect(rows[0]?.status).toBe('pending');
  });

  it('cites the shipped category in the risk_classified event', async () => {
    await planAndExecute(OUTBOUND_MESSAGE);
    const evs = await eventsOfType(OUTBOUND_MESSAGE.id, 'risk_classified');
    const payload = JSON.parse(evs[0]!.payloadJson) as { rule: string; from: string; to: string };
    expect(payload.from).toBe('low');
    expect(payload.to).toBe('high');
    expect(payload.rule).toBe('perms:outbound-message');
  });

  it('catches the French phrasing too (projects can be language "fr")', async () => {
    const { task } = await planAndExecute(OUTBOUND_MESSAGE_FR);
    expect(task?.risk).toBe('high');
  });
});

describe('§5 gate — a blocking category always blocks', () => {
  it('escalates a payment task to blocking and parks it', async () => {
    const { res, task } = await planAndExecute(PAYMENT);
    expect(task?.risk).toBe('blocking');
    expect(res.kind).toBe(PAUSED);
    expect(task?.status).toBe('needs_validation');
  });

  it('blocks even under autopilot autonomy (§5: gated regardless of level)', async () => {
    const db = getDb();
    await db.update(projects).set({ autonomy: 'autopilot' }).where(eq(projects.id, PROJECT_ID));

    const { res, task } = await planAndExecute(PAYMENT);
    expect(task?.risk).toBe('blocking');
    expect(res.kind).toBe(PAUSED);
  });

  it('never runs the task — no task_done event is emitted', async () => {
    await planAndExecute(PAYMENT);
    expect(await eventsOfType(PAYMENT.id, 'task_done')).toEqual([]);
  });
});

describe('§5 gate — benign work is untouched', () => {
  it('leaves an ordinary task low and does not pause it', async () => {
    const { res, task } = await planAndExecute(BENIGN);
    expect(task?.risk).toBe('low');
    expect(res.kind).not.toBe(PAUSED);
  });
});

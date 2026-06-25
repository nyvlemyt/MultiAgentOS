import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

vi.mock('@mas/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@mas/core')>();
  return {
    ...actual,
    // A critic call (reviewKind set) gets a deterministic, parseable verdict so
    // CI stays live-model-free; the producer call returns the executed-task text.
    claudeCodeLLM: vi.fn(() => ({
      call: vi.fn(async (req: import('@mas/core').LLMRequest) => ({
        text: req.reviewKind
          ? actual.mockVerdictText(req.reviewKind, req.user)
          : '[test-mock] task executed',
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
import {
  getDb,
  closeDb,
  projects,
  agents,
  missions,
  tasks,
  events,
} from '@mas/db';
import {
  planMission,
  runMission,
  executeNextTask,
  resumeAfterValidation,
} from './dispatch';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_FOLDER = resolve(__dirname, '../../db/migrations');

const PROJECT_ID = 'test-proj';
const AGENT_IDS = [
  'mission-planner',
  'skill-router',
  'design-ux-architect',
  'engineering-frontend-developer',
  'quality-controller',
  'sec-reviewer',
  'reviewer',
];

async function seedMinimal(missionId: string) {
  const db = getDb();
  await db.insert(projects).values({
    id: PROJECT_ID,
    name: 'Test Project',
    slug: 'test',
    path: join(tmpdir(), 'mas-test-project'),
    type: 'other',
    createdAt: new Date(),
    lastActiveAt: new Date(),
  });
  for (const id of AGENT_IDS) {
    await db.insert(agents).values({
      id,
      tier: 'A',
      fichePath: `fiches/${id}.md`,
      name: id,
      model: 'claude-haiku-4-5',
      enabled: true,
      totalRuns: 0,
      totalTokens: 0,
      successRate: 1,
    });
  }
  await db.insert(missions).values({
    id: missionId,
    projectId: PROJECT_ID,
    title: 'Test mission',
    objective: 'Test objective',
    status: 'draft',
    risk: 'low',
    budgetTokens: 20000,
    spentTokens: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

let dbPath: string;

beforeEach(async () => {
  // This suite drives the claudeCodeLLM branch via vi.mock('@mas/core'); a
  // globally exported MAS_MOCK_LLM=1 would flip selectLLM to mockLLM and skew
  // the token-accounting fixtures (260 vs 300).
  delete process.env.MAS_MOCK_LLM;
  // Pin the router off: a developer's local .env.local (e.g. GEMINI_API_KEY)
  // must not flip selectLLM to the router branch and skew these fixtures.
  process.env.MAS_ROUTING_CONFIG = '/nonexistent/model-routing.json';
  const dir = join(tmpdir(), 'mas-test');
  mkdirSync(dir, { recursive: true });
  dbPath = join(dir, `${randomUUID()}.db`);
  process.env.MAS_DB_PATH = dbPath;
  const db = getDb();
  migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });
});

afterEach(() => {
  closeDb();
  try { unlinkSync(dbPath); } catch { /* ignore */ }
  delete process.env.MAS_DB_PATH;
  delete process.env.MAS_ROUTING_CONFIG;
});

// Drives a mission through all low/medium tasks up to (but not including) the
// first high-risk task. Returns the mission id used.
async function driveToHighRiskGate(missionId: string) {
  await planMission(missionId);
  await runMission(missionId);
  // Execute t1..t4 (low/medium risk), stop when we hit the high-risk task.
  for (let i = 0; i < 10; i++) {
    const r = await executeNextTask(missionId);
    if (r.kind === 'paused_for_validation') return r.taskId;
    if (r.kind === 'mission_complete' || r.kind === 'no_runnable') break;
  }
  return null;
}

describe('dispatch — review/security gate', () => {
  it('sec-reviewer BLOCK on blocking-risk task sets mission to blocked, not validated', async () => {
    const MID = 'mid_block_test';
    await seedMinimal(MID);
    await planMission(MID);

    // Force t5 (sec gate) to blocking risk so mockSecReviewer returns BLOCK.
    const db = getDb();
    await db
      .update(tasks)
      .set({ risk: 'blocking' })
      .where(eq(tasks.id, `${MID}_t5`));

    await runMission(MID);

    // Drive t1..t4 to done.
    for (let i = 0; i < 4; i++) {
      const r = await executeNextTask(MID);
      expect(r.kind).toBe('task_done');
    }

    // t5 (blocking) → needs validation.
    const r5 = await executeNextTask(MID);
    expect(r5.kind).toBe('paused_for_validation');

    // Approve t5 → done, then continue to t6.
    const { acted } = await resumeAfterValidation(`${MID}_t5`, true);
    expect(acted).toBe(true);
    // Drive t6 to done, then review.
    for (let i = 0; i < 5; i++) {
      const r = await executeNextTask(MID);
      if (r.kind === 'mission_complete') break;
    }

    const [m] = await db.select().from(missions).where(eq(missions.id, MID));
    expect(m?.status).toBe('blocked');
    expect(m?.status).not.toBe('validated');
  });

  it('mission with no BLOCK verdicts reaches validated', async () => {
    const MID = 'mid_pass_test';
    await seedMinimal(MID);
    const pausedTaskId = await driveToHighRiskGate(MID);
    expect(pausedTaskId).toBeTruthy();
    await resumeAfterValidation(pausedTaskId!, true);
    for (let i = 0; i < 10; i++) {
      const r = await executeNextTask(MID);
      if (r.kind === 'mission_complete') break;
    }
    const db = getDb();
    const [m] = await db.select().from(missions).where(eq(missions.id, MID));
    expect(m?.status).toBe('validated');
  });
});

describe('dispatch — validation idempotency', () => {
  it('replaying approve on already-decided validation is a no-op', async () => {
    const MID = 'mid_idempotent';
    await seedMinimal(MID);
    const pausedTaskId = await driveToHighRiskGate(MID);
    expect(pausedTaskId).toBeTruthy();

    // First approve.
    const r1 = await resumeAfterValidation(pausedTaskId!, true);
    expect(r1.acted).toBe(true);

    // Second approve on same task — should be idempotent.
    const r2 = await resumeAfterValidation(pausedTaskId!, true);
    expect(r2.acted).toBe(false);

    // Task is done exactly once — spentTokens not doubled.
    const db = getDb();
    const [t] = await db.select().from(tasks).where(eq(tasks.id, pausedTaskId!));
    expect(t?.status).toBe('done');
    expect(t?.spentTokens).toBe(300); // single 220+80 spend
  });

  it('replaying reject after approve is a no-op', async () => {
    const MID = 'mid_idempotent_reject';
    await seedMinimal(MID);
    const pausedTaskId = await driveToHighRiskGate(MID);
    expect(pausedTaskId).toBeTruthy();

    const r1 = await resumeAfterValidation(pausedTaskId!, true);
    expect(r1.acted).toBe(true);

    // Attempt to reject after already approved — must not flip task back.
    const r2 = await resumeAfterValidation(pausedTaskId!, false);
    expect(r2.acted).toBe(false);

    const db = getDb();
    const [t] = await db.select().from(tasks).where(eq(tasks.id, pausedTaskId!));
    expect(t?.status).toBe('done'); // still done, not blocked
  });

  it('rejecting a pending §5 validation blocks the task + mission and logs it', async () => {
    const MID = 'mid_reject_block';
    await seedMinimal(MID);
    const pausedTaskId = await driveToHighRiskGate(MID);
    expect(pausedTaskId).toBeTruthy();

    // Reject as the FIRST decision — the §5 human-gate BLOCK path.
    const r = await resumeAfterValidation(pausedTaskId!, false);
    expect(r.acted).toBe(true);

    const db = getDb();
    const [t] = await db.select().from(tasks).where(eq(tasks.id, pausedTaskId!));
    expect(t?.status).toBe('blocked');
    const [m] = await db.select().from(missions).where(eq(missions.id, MID));
    expect(m?.status).toBe('blocked');

    // The rejection is auditable.
    const rejected = await db
      .select()
      .from(events)
      .where(and(eq(events.missionId, MID), eq(events.type, 'validation_rejected')));
    expect(rejected).toHaveLength(1);
    expect(rejected[0]?.taskId).toBe(pausedTaskId);
  });
});

describe('dispatch — budget accounting', () => {
  it('approving high-risk task increments mission.spentTokens', async () => {
    const MID = 'mid_budget';
    await seedMinimal(MID);
    const pausedTaskId = await driveToHighRiskGate(MID);
    expect(pausedTaskId).toBeTruthy();

    const db = getDb();
    const [before] = await db.select().from(missions).where(eq(missions.id, MID));
    const spentBefore = before!.spentTokens;

    await resumeAfterValidation(pausedTaskId!, true);

    const [after] = await db.select().from(missions).where(eq(missions.id, MID));
    expect(after!.spentTokens).toBe(spentBefore + 300); // 220 in + 80 out
  });
});

describe('dispatch — duplicate execution prevention', () => {
  it('concurrent executeNextTask claims cannot double-run the same task', async () => {
    const MID = 'mid_concurrent';
    await seedMinimal(MID);
    await planMission(MID);
    await runMission(MID);

    // Two concurrent calls compete for the first task.
    const [r1, r2] = await Promise.all([
      executeNextTask(MID),
      executeNextTask(MID),
    ]);

    // Exactly one should claim t1 as task_done; the other no_runnable.
    const kinds = [r1.kind, r2.kind].sort((a, b) => a.localeCompare(b));
    expect(kinds).toSatisfy((ks: string[]) =>
      (ks[0] === 'no_runnable' && ks[1] === 'task_done') ||
      // Both may be task_done if they raced on different tasks — but there is
      // only one runnable task at start so at most one should be task_done.
      (ks[0] === 'no_runnable' && ks[1] === 'no_runnable'), // degenerate: both lost race
    );

    // Regardless: the first task must appear done exactly once in events.
    const db = getDb();
    const taskDoneEvents = await db
      .select()
      .from(events)
      .where(and(eq(events.missionId, MID), eq(events.type, 'task_done')));
    expect(taskDoneEvents.length).toBeLessThanOrEqual(1);
  });

  it('single executeNextTask produces exactly one task_done event per task', async () => {
    const MID = 'mid_single';
    await seedMinimal(MID);
    await planMission(MID);
    await runMission(MID);

    const r = await executeNextTask(MID);
    expect(r.kind).toBe('task_done');

    const db = getDb();
    const doneEvents = await db
      .select()
      .from(events)
      .where(and(eq(events.missionId, MID), eq(events.type, 'task_done')));
    expect(doneEvents).toHaveLength(1);
  });
});

describe('dispatch — smoke DB isolation', () => {
  it('MAS_DB_PATH env is respected — data written to the configured path', async () => {
    const MID = 'mid_db_iso';
    await seedMinimal(MID);
    const db = getDb();
    const rows = await db.select().from(missions).where(eq(missions.id, MID));
    expect(rows).toHaveLength(1);
    // The DB file must be the temp path set in beforeEach, not the default data/mas.db.
    expect(dbPath).toContain(tmpdir());
    expect(dbPath).not.toContain('data/mas.db');
  });
});

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { unlinkSync, mkdtempSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { eq } from 'drizzle-orm';
import { getDb, closeDb, projects, agents, missions, memoryCandidates } from '@mas/db';
import { planMission, runMission, executeNextTask, resumeAfterValidation } from './dispatch';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_FOLDER = resolve(__dirname, '../../db/migrations');

let dbPath: string;
let memRoot: string;

beforeEach(() => {
  process.env.MAS_MOCK_LLM = '1';
  memRoot = mkdtempSync(join(tmpdir(), 'mas-cap-'));
  rmSync(memRoot, { recursive: true, force: true }); // existence = a register write happened
  process.env.MAS_MEMORY_ROOT = memRoot;
  dbPath = join(tmpdir(), `mas-${randomUUID()}.db`);
  const db = getDb(dbPath);
  migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });
});
afterEach(() => {
  closeDb();
  unlinkSync(dbPath);
  rmSync(memRoot, { recursive: true, force: true });
  delete process.env.MAS_MEMORY_ROOT;
  delete process.env.MAS_MOCK_LLM;
});

async function seedProjectAndMission(missionId: string) {
  const db = getDb();
  await db.insert(projects).values({
    id: 'proj', name: 'P', slug: 'p', path: join(tmpdir(), 'p'), type: 'other',
    createdAt: new Date(), lastActiveAt: new Date(),
  });
  for (const id of ['mission-planner', 'skill-router', 'design-ux-architect', 'engineering-frontend-developer', 'sec-reviewer', 'reviewer']) {
    await db.insert(agents).values({
      id, tier: 'A', fichePath: `f/${id}.md`, name: id, model: 'claude-haiku-4-5',
      enabled: true, totalRuns: 0, totalTokens: 0, successRate: 1,
    });
  }
  await db.insert(missions).values({
    id: missionId, projectId: 'proj', title: 'Build settings page',
    objective: 'Add a settings page', status: 'draft', risk: 'low',
    budgetTokens: 20000, spentTokens: 0, createdAt: new Date(), updatedAt: new Date(),
  });
}

async function driveToCompletion(missionId: string) {
  await planMission(missionId);
  await runMission(missionId);
  for (let i = 0; i < 20; i++) {
    const r = await executeNextTask(missionId);
    if (r.kind === 'paused_for_validation') {
      await resumeAfterValidation(r.taskId, true);
      continue;
    }
    if (r.kind === 'mission_complete' || r.kind === 'no_runnable') return r.kind;
  }
  return 'stuck';
}

describe('auto-capture wiring (mission-complete fires the close-out ritual)', () => {
  it('a completed mission yields pending candidates with no manual step and no register write', async () => {
    await seedProjectAndMission('m1');
    const outcome = await driveToCompletion('m1');
    expect(outcome).toBe('mission_complete');

    const db = getDb();
    const [m] = await db.select().from(missions).where(eq(missions.id, 'm1'));
    expect(m!.status).toBe('validated');

    const cands = await db.select().from(memoryCandidates);
    expect(cands.length).toBeGreaterThan(0);
    expect(cands.every((c) => c.status === 'pending')).toBe(true);
    // No direct register write: the memory root was never created.
    expect(existsSync(memRoot)).toBe(false);
  });
});

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { eq } from 'drizzle-orm';
import { getDb, missions, memoryCandidates } from '@mas/db';
import { planMission, runMission, executeNextTask, resumeAfterValidation } from './dispatch';
import { useTestDb, seedAgentsRoster, seedProject, seedMission } from './testing';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_FOLDER = resolve(__dirname, '../../db/migrations');

let memRoot: string;

useTestDb(MIGRATIONS_FOLDER);
beforeEach(() => {
  process.env.MAS_MOCK_LLM = '1';
  memRoot = mkdtempSync(join(tmpdir(), 'mas-cap-'));
  rmSync(memRoot, { recursive: true, force: true }); // existence = a register write happened
  process.env.MAS_MEMORY_ROOT = memRoot;
});
afterEach(() => {
  rmSync(memRoot, { recursive: true, force: true });
  delete process.env.MAS_MEMORY_ROOT;
  delete process.env.MAS_MOCK_LLM;
});

async function seedProjectAndMission(missionId: string) {
  await seedProject('proj');
  await seedAgentsRoster();
  await seedMission(missionId, 'proj');
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

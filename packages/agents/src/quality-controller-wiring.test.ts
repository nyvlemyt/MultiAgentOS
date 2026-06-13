import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { eq, sql } from 'drizzle-orm';
import { getDb, missions, tasks, events } from '@mas/db';
import { planMission, runMission, executeNextTask, resumeAfterValidation } from './dispatch';
import { useTestDb, seedAgentsRoster, seedProject, seedMission } from './testing';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_FOLDER = resolve(__dirname, '../../db/migrations');

useTestDb(MIGRATIONS_FOLDER);
beforeEach(() => {
  process.env.MAS_MOCK_LLM = '1';
});
afterEach(() => {
  delete process.env.MAS_MOCK_LLM;
});

async function seed(missionId: string) {
  await seedProject('qc_proj');
  await seedAgentsRoster();
  await seedMission(missionId, 'qc_proj');
}

async function driveToComplete(missionId: string) {
  await runMission(missionId);
  for (let i = 0; i < 20; i++) {
    const r = await executeNextTask(missionId);
    if (r.kind === 'paused_for_validation') {
      await resumeAfterValidation(r.taskId, true);
      continue;
    }
    if (r.kind === 'mission_complete' || r.kind === 'no_runnable') break;
  }
}

async function eventTypesInOrder(missionId: string): Promise<string[]> {
  const rows = await getDb()
    .select({ type: events.type })
    .from(events)
    .where(eq(events.missionId, missionId))
    .orderBy(sql`rowid`);
  return rows.map((r) => r.type);
}

describe('Quality Controller wiring (runReviewPhase)', () => {
  it('runs the quality_control_verdict BEFORE the review_verdict (PASS path)', async () => {
    const MID = 'qc_pass';
    await seed(MID);
    await planMission(MID);
    await driveToComplete(MID);

    const order = await eventTypesInOrder(MID);
    const qcIdx = order.indexOf('quality_control_verdict');
    const revIdx = order.indexOf('review_verdict');
    expect(qcIdx).toBeGreaterThanOrEqual(0);
    expect(revIdx).toBeGreaterThanOrEqual(0);
    expect(qcIdx).toBeLessThan(revIdx);

    const [m] = await getDb().select().from(missions).where(eq(missions.id, MID));
    expect(m?.status).toBe('validated');
  });

  it('a QC BLOCK blocks the mission and skips the reviewer', async () => {
    const MID = 'qc_block';
    await seed(MID);
    await planMission(MID);
    // Seed a process violation: flag a task title with the QC sentinel.
    await getDb().update(tasks).set({ title: '[qc-block] non-conventional commit' }).where(eq(tasks.id, `${MID}_t1`));
    await driveToComplete(MID);

    const order = await eventTypesInOrder(MID);
    expect(order).toContain('quality_control_verdict');
    expect(order).not.toContain('review_verdict');

    const qc = await getDb()
      .select({ payloadJson: events.payloadJson })
      .from(events)
      .where(eq(events.type, 'quality_control_verdict'));
    expect(JSON.parse(qc[0]!.payloadJson).verdict).toBe('BLOCK');

    const [m] = await getDb().select().from(missions).where(eq(missions.id, MID));
    expect(m?.status).toBe('blocked');
  });
});

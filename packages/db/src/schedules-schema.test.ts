import { describe, it, expect } from 'vitest';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { eq } from 'drizzle-orm';
import { getDb } from './client';
import { projects, schedules } from './schema';
import { setupTempDb } from './testing';

setupTempDb();

async function seedProject(id: string): Promise<void> {
  await getDb().insert(projects).values({
    id, name: id, slug: id, path: join(tmpdir(), id), type: 'other',
  });
}

describe('Phase 6 migration 0007 — schedules table', () => {
  it('applies migrations and round-trips a schedule with defaults', async () => {
    await seedProject('p_sched');
    const db = getDb();
    await db.insert(schedules).values({
      id: 's1', projectId: 'p_sched', windowStart: '02:00', windowEnd: '06:00',
    });
    const [row] = await db.select().from(schedules).where(eq(schedules.id, 's1'));
    expect(row?.kind).toBe('autopilot');
    expect(row?.maxRisk).toBe('low');
    expect(row?.enabled).toBe(true);
    expect(row?.daysJson).toBe('[0,1,2,3,4,5,6]');
    expect(row?.windowStart).toBe('02:00');
    expect(row?.lastRunAt).toBeNull();
  });

  it('round-trips explicit days + maxRisk medium', async () => {
    await seedProject('p_sched2');
    const db = getDb();
    await db.insert(schedules).values({
      id: 's2', projectId: 'p_sched2', windowStart: '22:00', windowEnd: '02:00',
      daysJson: '[1,2,3,4,5]', maxRisk: 'medium', enabled: false,
    });
    const [row] = await db.select().from(schedules).where(eq(schedules.id, 's2'));
    expect(JSON.parse(row!.daysJson)).toEqual([1, 2, 3, 4, 5]);
    expect(row?.maxRisk).toBe('medium');
    expect(row?.enabled).toBe(false);
  });
});

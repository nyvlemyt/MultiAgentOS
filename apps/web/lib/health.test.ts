import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { getDb, closeDb, projects, missions, tasks, validations, ideas } from '@mas/db';
import { computeProjectHealth } from './health';

const MIGRATIONS = resolve(dirname(fileURLToPath(import.meta.url)), '../../../packages/db/migrations');

let dbPath: string;
beforeEach(async () => {
  dbPath = join(tmpdir(), `mas-h-${randomUUID()}.db`);
  process.env.MAS_DB_PATH = dbPath;
  migrate(getDb(), { migrationsFolder: MIGRATIONS });
  await getDb().insert(projects).values({
    id: 'p1', name: 'P1', slug: 'p1', path: join(tmpdir(), 'p1'), type: 'other', createdAt: new Date(), lastActiveAt: new Date(),
  });
});
afterEach(() => {
  closeDb();
  try { unlinkSync(dbPath); } catch { /* ignore */ }
  delete process.env.MAS_DB_PATH;
});

describe('computeProjectHealth — server-computed aggregation, no LLM', () => {
  it('aggregates missions, ideas, deadlines and validations correctly', async () => {
    const db = getDb();
    const future = new Date('2030-01-01T00:00:00Z');
    const nearer = new Date('2029-01-01T00:00:00Z');
    await db.insert(missions).values([
      { id: 'm1', projectId: 'p1', title: 'a', objective: 'o', status: 'archived', budgetTokens: 1000, spentTokens: 500, deadline: future, createdAt: new Date('2026-01-01'), updatedAt: new Date('2026-06-10') },
      { id: 'm2', projectId: 'p1', title: 'b', objective: 'o', status: 'blocked', budgetTokens: 1000, spentTokens: 0, deadline: nearer, createdAt: new Date('2026-01-01'), updatedAt: new Date('2026-06-12') },
      { id: 'm3', projectId: 'p1', title: 'c', objective: 'o', status: 'draft', budgetTokens: 2000, spentTokens: 500, createdAt: new Date('2026-01-01'), updatedAt: new Date('2026-06-01') },
    ]);
    await db.insert(tasks).values({ id: 't1', missionId: 'm2', title: 't', status: 'needs_validation', createdAt: new Date(), updatedAt: new Date() });
    await db.insert(validations).values({ id: 'v1', taskId: 't1', requestedByAgent: 'sec', actionSummary: 'x', status: 'pending' });
    await db.insert(ideas).values([
      { id: 'i1', title: 'open', scope: 'project', projectId: 'p1', status: 'inbox', createdAt: new Date(), updatedAt: new Date() },
      { id: 'i2', title: 'done', scope: 'project', projectId: 'p1', status: 'converted', createdAt: new Date(), updatedAt: new Date() },
    ]);

    const h = await computeProjectHealth(db, 'p1');
    expect(h.missionsTotal).toBe(3);
    expect(h.missionsDone).toBe(1);
    expect(h.missionsBlocked).toBe(1);
    expect(h.openIdeas).toBe(1);
    expect(h.pendingValidations).toBe(1);
    expect(h.nextDeadline?.getTime()).toBe(nearer.getTime()); // earliest future deadline
    expect(h.lastActivity?.getTime()).toBe(new Date('2026-06-12').getTime());
    // budgetUsedPct = sum(spent)/sum(budget) = 1000/4000 = 25
    expect(h.budgetUsedPct).toBe(25);
  });

  it('empty project yields zeroed health', async () => {
    const h = await computeProjectHealth(getDb(), 'p1');
    expect(h).toMatchObject({ missionsTotal: 0, missionsDone: 0, missionsBlocked: 0, openIdeas: 0, pendingValidations: 0, budgetUsedPct: 0 });
    expect(h.nextDeadline).toBeNull();
    expect(h.lastActivity).toBeNull();
  });
});

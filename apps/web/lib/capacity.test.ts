import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { getDb, closeDb, budgets, events, projects, missions } from '@mas/db';
import { getRemainingCapacity } from './tokens';

const MIGRATIONS = resolve(dirname(fileURLToPath(import.meta.url)), '../../../packages/db/migrations');

let dbPath: string;
beforeEach(async () => {
  dbPath = join(tmpdir(), `mas-cap-${randomUUID()}.db`);
  process.env.MAS_DB_PATH = dbPath;
  migrate(getDb(), { migrationsFolder: MIGRATIONS });
  await getDb().insert(projects).values({ id: 'p1', name: 'P', slug: 'p', path: join(tmpdir(), 'p'), type: 'other', createdAt: new Date(), lastActiveAt: new Date() });
  await getDb().insert(missions).values([
    { id: 'mA', projectId: 'p1', title: 'A', objective: 'o', createdAt: new Date(), updatedAt: new Date() },
    { id: 'mB', projectId: 'p1', title: 'B', objective: 'o', createdAt: new Date(), updatedAt: new Date() },
  ]);
});
afterEach(() => {
  closeDb();
  try { unlinkSync(dbPath); } catch { /* ignore */ }
  delete process.env.MAS_DB_PATH;
});

async function evt(missionId: string, cents: number, daysAgo: number) {
  await getDb().insert(events).values({
    id: `evt_${randomUUID()}`, missionId, type: 'llm_call', payloadJson: '{}',
    tokensIn: 0, tokensOut: 0, cacheRead: 0, cacheCreation: 0, quotaUnits: cents, risk: 'low',
    createdAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
  });
}

describe('getRemainingCapacity — rolling 30-day average', () => {
  it('estimates ~N missions from cap, spend and avg mission cost', async () => {
    await getDb().insert(budgets).values({ id: 'b', scope: 'global', scopeId: null, period: 'month', tokensCap: 1, tokensSpent: 0, moneyCapCents: 1500, moneySpentCents: 240 });
    await evt('mA', 100, 2); // mission A cost = 100c
    await evt('mB', 120, 5); await evt('mB', 80, 6); // mission B cost = 200c → avg = 150c
    await evt('mA', 9999, 40); // outside 30-day window — ignored
    const cap = await getRemainingCapacity(getDb());
    expect(cap.label).toBe('~8 missions'); // floor((1500-240)/150) = 8
  });

  it('no spend history ⇒ "—"', async () => {
    await getDb().insert(budgets).values({ id: 'b', scope: 'global', scopeId: null, period: 'month', tokensCap: 1, tokensSpent: 0, moneyCapCents: 1500, moneySpentCents: 0 });
    const cap = await getRemainingCapacity(getDb());
    expect(cap.label).toBe('—');
  });
});

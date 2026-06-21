import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { getDb, closeDb, events, budgets, projects, missions, tasks } from '@mas/db';
import { getTokenSnapshot } from './tokens';

const MIGRATIONS = resolve(dirname(fileURLToPath(import.meta.url)), '../../../packages/db/migrations');

let dbPath: string;
beforeEach(() => {
  dbPath = join(tmpdir(), `mas-tokens-${randomUUID()}.db`);
  process.env.MAS_DB_PATH = dbPath;
  migrate(getDb(), { migrationsFolder: MIGRATIONS });
});
afterEach(() => {
  closeDb();
  try { unlinkSync(dbPath); } catch { /* ignore */ }
  delete process.env.MAS_DB_PATH;
});

async function seedEvent(type: string, provider: string | undefined, tokensIn: number, tokensOut: number) {
  await getDb().insert(events).values({
    id: `evt_${randomUUID()}`,
    type,
    payloadJson: JSON.stringify(provider ? { provider } : {}),
    tokensIn,
    tokensOut,
    cacheRead: 0,
    cacheCreation: 0,
    quotaUnits: 0,
    risk: 'low',
    createdAt: new Date(),
  });
}

describe('getTokenSnapshot — per-provider breakdown (Phase 3.5 step 6)', () => {
  it('groups today LLM-call spend by provider, unattributed defaults to claude', async () => {
    await seedEvent('llm_call', 'gemini-free', 100, 50);
    await seedEvent('task_done', 'gemini-free', 200, 100);
    await seedEvent('task_done', 'claude:pro20', 300, 10);
    await seedEvent('validation_approved', undefined, 40, 20);
    await seedEvent('tick', 'gemini-free', 999, 999); // not an LLM-call type — excluded

    const snap = await getTokenSnapshot();
    const byId = Object.fromEntries(snap.byProvider.map((r) => [r.provider, r]));
    expect(byId['gemini-free']).toMatchObject({ calls: 2, tokensIn: 300, tokensOut: 150 });
    expect(byId['claude:pro20']).toMatchObject({ calls: 1, tokensIn: 300, tokensOut: 10 });
    expect(byId['claude']).toMatchObject({ calls: 1, tokensIn: 40, tokensOut: 20 });
  });

  it('empty events ⇒ empty breakdown', async () => {
    const snap = await getTokenSnapshot();
    expect(snap.byProvider).toEqual([]);
  });
});

describe('getTokenSnapshot — concurrency-aware day meter', () => {
  it('counts logged spend AND in-flight reserved against the cap', async () => {
    const db = getDb();
    await db.insert(budgets).values({
      id: 'b_day', scope: 'global', period: 'day', tokensCap: 1000, tokensSpent: 0,
    });
    await seedEvent('task_done', 'claude', 200, 100); // 300 logged
    await db.insert(projects).values({
      id: 'p', name: 'p', slug: 'p', path: join(tmpdir(), 'mas-tok-p'), type: 'other',
      autonomy: 'autonomous', createdAt: new Date(), lastActiveAt: new Date(),
    });
    await db.insert(missions).values({
      id: 'm', projectId: 'p', title: 'm', objective: 'o', status: 'executing',
      risk: 'low', budgetTokens: 20000, spentTokens: 0, createdAt: new Date(), updatedAt: new Date(),
    });
    await db.insert(tasks).values({
      id: 't', missionId: 'm', title: 't', description: 'd', status: 'running',
      risk: 'low', budgetTokens: 250, spentTokens: 0, createdAt: new Date(), updatedAt: new Date(),
    });

    const snap = await getTokenSnapshot();
    expect(snap.day.tokensSpent).toBe(300);
    expect(snap.day.reserved).toBe(250);
    expect(snap.day.remaining).toBe(450); // 1000 − 300 − 250
  });
});

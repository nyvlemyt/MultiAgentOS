import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { getDb, closeDb, projects, missions, tasks, validations, events } from '@mas/db';
import { missionReconciliations } from './mission-facts';

const MIGRATIONS = resolve(dirname(fileURLToPath(import.meta.url)), '../../../packages/db/migrations');
const NOW = new Date('2026-08-14T12:00:00Z');
const minutesAgo = (m: number) => new Date(NOW.getTime() - m * 60_000);

let dbPath: string;
beforeEach(async () => {
  dbPath = join(tmpdir(), `mas-mf-${randomUUID()}.db`);
  process.env.MAS_DB_PATH = dbPath;
  migrate(getDb(), { migrationsFolder: MIGRATIONS });
  await getDb().insert(projects).values({
    id: 'p1', name: 'P1', slug: 'p1', path: join(tmpdir(), 'p1'), type: 'other', createdAt: NOW, lastActiveAt: NOW,
  });
});
afterEach(() => {
  closeDb();
  try { unlinkSync(dbPath); } catch { /* ignore */ }
  delete process.env.MAS_DB_PATH;
});

describe('missionReconciliations — faits lus en base', () => {
  it('mission executing dont le dernier event a 2 h ⇒ désynchronisée avec sa raison', async () => {
    const db = getDb();
    await db.insert(missions).values({
      id: 'm1', projectId: 'p1', title: 'a', objective: 'o', status: 'executing',
      budgetTokens: 20000, spentTokens: 500, createdAt: minutesAgo(300), updatedAt: minutesAgo(120),
    });
    await db.insert(tasks).values({
      id: 't1', missionId: 'm1', title: 't', status: 'running', createdAt: minutesAgo(300), updatedAt: minutesAgo(120),
    });
    await db.insert(events).values({
      id: 'e1', missionId: 'm1', taskId: 't1', type: 'task_start', createdAt: minutesAgo(120),
    });

    const map = await missionReconciliations(db, ['m1'], NOW);
    const r = map.get('m1');
    expect(r?.computed).toBe('stalled');
    expect(r?.desynced).toBe(true);
    expect(r?.reason).toContain('120 min');
  });

  it('mission sans event ni tâche ⇒ unknown, aucune alerte', async () => {
    const db = getDb();
    await db.insert(missions).values({
      id: 'm2', projectId: 'p1', title: 'b', objective: 'o', status: 'executing',
      budgetTokens: 0, spentTokens: 0, createdAt: NOW, updatedAt: NOW,
    });
    const r = (await missionReconciliations(db, ['m2'], NOW)).get('m2');
    expect(r?.computed).toBe('unknown');
    expect(r?.desynced).toBe(false);
  });

  it('compte les tâches bloquées et les validations pending de la BONNE mission', async () => {
    const db = getDb();
    await db.insert(missions).values([
      { id: 'm3', projectId: 'p1', title: 'c', objective: 'o', status: 'executing', budgetTokens: 100, spentTokens: 10, createdAt: NOW, updatedAt: NOW },
      { id: 'm4', projectId: 'p1', title: 'd', objective: 'o', status: 'executing', budgetTokens: 100, spentTokens: 10, createdAt: NOW, updatedAt: NOW },
    ]);
    await db.insert(tasks).values([
      { id: 't3', missionId: 'm3', title: 'x', status: 'blocked', createdAt: NOW, updatedAt: NOW },
      { id: 't4', missionId: 'm4', title: 'y', status: 'needs_validation', createdAt: NOW, updatedAt: NOW },
    ]);
    await db.insert(validations).values({ id: 'v4', taskId: 't4', requestedByAgent: 'sec', actionSummary: 'x', status: 'pending' });
    await db.insert(events).values([
      { id: 'e3', missionId: 'm3', type: 'task_start', createdAt: minutesAgo(1) },
      { id: 'e4', missionId: 'm4', type: 'task_start', createdAt: minutesAgo(1) },
    ]);

    const map = await missionReconciliations(db, ['m3', 'm4'], NOW);
    expect(map.get('m3')?.computed).toBe('blocked');
    expect(map.get('m4')?.computed).toBe('awaiting_human');
  });

  it('budget mission dépassé ⇒ halted_budget ; plafond à 0 ⇒ fait absent', async () => {
    const db = getDb();
    await db.insert(missions).values([
      { id: 'm5', projectId: 'p1', title: 'e', objective: 'o', status: 'executing', budgetTokens: 1000, spentTokens: 1000, createdAt: NOW, updatedAt: NOW },
      { id: 'm6', projectId: 'p1', title: 'f', objective: 'o', status: 'executing', budgetTokens: 0, spentTokens: 5000, createdAt: NOW, updatedAt: NOW },
    ]);
    await db.insert(events).values([
      { id: 'e5', missionId: 'm5', type: 'task_start', createdAt: minutesAgo(1) },
      { id: 'e6', missionId: 'm6', type: 'task_start', createdAt: minutesAgo(1) },
    ]);
    const map = await missionReconciliations(db, ['m5', 'm6'], NOW);
    expect(map.get('m5')?.computed).toBe('halted_budget');
    expect(map.get('m6')?.computed).toBe('active'); // pas de plafond ⇒ pas de dépassement inventé
  });

  it('liste d’ids vide ⇒ map vide, aucune requête inutile', async () => {
    const map = await missionReconciliations(getDb(), [], NOW);
    expect(map.size).toBe(0);
  });
});

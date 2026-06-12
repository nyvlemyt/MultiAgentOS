import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { getDb, closeDb, memoryCandidates, tasks, missions, projects, validations } from '@mas/db';
import { runCloseOutRitual } from './auto-capture';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_FOLDER = resolve(__dirname, '../../db/migrations');

let dbPath: string;
beforeEach(() => {
  dbPath = join(tmpdir(), `mas-${randomUUID()}.db`);
  const db = getDb(dbPath);
  migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });
});
afterEach(() => {
  closeDb();
  unlinkSync(dbPath);
});

async function seedMission(status: 'validated' | 'blocked') {
  const db = getDb();
  await db.insert(projects).values({
    id: 'proj', name: 'P', slug: 'p', path: join(tmpdir(), 'p'), type: 'other',
    createdAt: new Date(), lastActiveAt: new Date(),
  });
  await db.insert(missions).values({
    id: 'm1', projectId: 'proj', title: 'Polish feed', objective: 'o', status, risk: 'low',
    budgetTokens: 1000, spentTokens: 260, createdAt: new Date(), updatedAt: new Date(),
  });
  await db.insert(tasks).values([
    {
      id: 't1', missionId: 'm1', title: 'audit feed', description: 'd', status: 'done', risk: 'low',
      dependsOnJson: '[]', skillsJson: '[]', budgetTokens: 100, spentTokens: 130,
      createdAt: new Date(Date.now() - 1000), updatedAt: new Date(),
    },
    {
      id: 't2', missionId: 'm1', title: 'apply diff', description: 'd', status: 'done', risk: 'high',
      dependsOnJson: '[]', skillsJson: '[]', budgetTokens: 100, spentTokens: 130,
      createdAt: new Date(), updatedAt: new Date(),
    },
  ]);
  await db.insert(validations).values({
    id: 'val1', taskId: 't2', requestedByAgent: 'dispatcher',
    actionSummary: 'Run high-risk task: apply diff', status: 'approved',
    decidedAt: new Date(), decidedByUser: 'me', payloadJson: '{}',
  });
}

describe('runCloseOutRitual (mission-complete → memory_candidates)', () => {
  it('creates pending candidates for a validated mission with zero manual steps', async () => {
    const db = getDb();
    await seedMission('validated');
    const res = await runCloseOutRitual(db, 'm1');
    expect(res.skipped).toBe(false);
    expect(res.candidateIds.length).toBeGreaterThanOrEqual(2); // mission summary + decision
    const rows = await db.select().from(memoryCandidates);
    expect(rows.length).toBe(res.candidateIds.length);
    expect(rows.every((r) => r.status === 'pending')).toBe(true);
    const bodies = rows.map((r) => r.body).join('\n');
    expect(bodies).toContain('Polish feed');
    expect(bodies).toContain('apply diff'); // approved high-risk decision captured
  });

  it('never writes a register directly — candidates only', async () => {
    const db = getDb();
    await seedMission('validated');
    process.env.MAS_MEMORY_ROOT = join(tmpdir(), `mas-noreg-${randomUUID()}`);
    try {
      await runCloseOutRitual(db, 'm1');
      const { existsSync } = await import('node:fs');
      expect(existsSync(process.env.MAS_MEMORY_ROOT)).toBe(false);
    } finally {
      delete process.env.MAS_MEMORY_ROOT;
    }
  });

  it('is idempotent — replaying the ritual adds no duplicate candidates', async () => {
    const db = getDb();
    await seedMission('validated');
    const first = await runCloseOutRitual(db, 'm1');
    const replay = await runCloseOutRitual(db, 'm1');
    expect(replay.skipped).toBe(true);
    expect(replay.candidateIds).toHaveLength(0);
    const rows = await db.select().from(memoryCandidates);
    expect(rows).toHaveLength(first.candidateIds.length);
  });

  it('captures a blocker candidate when the mission ends blocked', async () => {
    const db = getDb();
    await seedMission('blocked');
    const res = await runCloseOutRitual(db, 'm1');
    const rows = await db.select().from(memoryCandidates);
    expect(res.skipped).toBe(false);
    expect(rows.map((r) => r.body).join('\n').toLowerCase()).toContain('blocked');
  });
});

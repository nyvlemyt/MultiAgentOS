import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { getDb, closeDb, projects, agents, missions } from '@mas/db';
import { ensureConversation, createConversation, listConversations, getConversation, listMessages, appendExchange } from './conversations';

const MIGRATIONS = resolve(dirname(fileURLToPath(import.meta.url)), '../../../packages/db/migrations');

let dbPath: string;
beforeEach(async () => {
  dbPath = join(tmpdir(), `mas-conv-${randomUUID()}.db`);
  process.env.MAS_DB_PATH = dbPath;
  migrate(getDb(), { migrationsFolder: MIGRATIONS });
  await getDb().insert(projects).values({
    id: 'p1', name: 'P', slug: 'p', path: join(tmpdir(), 'p'), type: 'other', createdAt: new Date(), lastActiveAt: new Date(),
  });
  await getDb().insert(agents).values({ id: 'mission-planner', tier: 'A', fichePath: 'x', name: 'Mission Planner' });
  await getDb().insert(missions).values({
    id: 'm1', projectId: 'p1', title: 'M', objective: 'o', createdAt: new Date(), updatedAt: new Date(),
  });
  await getDb().insert(missions).values({
    id: 'm2', projectId: 'p1', title: 'M2', objective: 'o', createdAt: new Date(), updatedAt: new Date(),
  });
});
afterEach(() => {
  closeDb();
  try { unlinkSync(dbPath); } catch { /* ignore */ }
});

describe('conversations (multi-thread)', () => {
  it('ensureConversation returns the existing latest, does not duplicate', async () => {
    const a = await ensureConversation(getDb(), 'manager');
    const b = await ensureConversation(getDb(), 'manager');
    expect(a.id).toBe(b.id);
    expect((await listConversations(getDb(), 'manager')).length).toBe(1);
  });

  it('supports several manager threads, newest first', async () => {
    await createConversation(getDb(), 'manager', null, null, new Date(1000));
    const second = await createConversation(getDb(), 'manager', null, null, new Date(2000));
    const threads = await listConversations(getDb(), 'manager');
    expect(threads.length).toBe(2);
    expect(threads[0]!.id).toBe(second.id);
  });

  it('scopes agent threads per (project, agent)', async () => {
    const conv = await createConversation(getDb(), 'agent', 'p1', 'mission-planner');
    expect((await listConversations(getDb(), 'agent', 'p1', 'mission-planner'))[0]!.id).toBe(conv.id);
    expect((await listConversations(getDb(), 'agent', 'p1', 'other')).length).toBe(0);
  });

  it('scopes mission threads per (project, mission)', async () => {
    const conv = await createConversation(getDb(), 'mission', 'p1', null, new Date(), 'm1');
    expect((await listConversations(getDb(), 'mission', 'p1', null, 'm1'))[0]!.id).toBe(conv.id);
    expect((await listConversations(getDb(), 'mission', 'p1', null, 'm2')).length).toBe(0);
  });

  it('ensureConversation seeds a mission thread then returns the same one', async () => {
    const a = await ensureConversation(getDb(), 'mission', 'p1', null, new Date(), 'm1');
    const b = await ensureConversation(getDb(), 'mission', 'p1', null, new Date(), 'm1');
    expect(a.id).toBe(b.id);
    expect(a.missionId).toBe('m1');
  });

  it('persists an exchange and titles the thread from the first message', async () => {
    const conv = await createConversation(getDb(), 'manager');
    await appendExchange(getDb(), conv.id, 'refais la home', 'je routerais ça…');
    const msgs = await listMessages(getDb(), conv.id);
    expect(msgs.map((m) => m.role)).toEqual(['user', 'agent']);
    expect((await getConversation(getDb(), conv.id))!.title).toBe('refais la home');
  });
});

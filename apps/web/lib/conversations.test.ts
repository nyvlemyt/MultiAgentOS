import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { getDb, closeDb, projects, agents } from '@mas/db';
import { getOrCreateManagerConversation, getOrCreateAgentConversation, listMessages, appendExchange } from './conversations';

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
});
afterEach(() => {
  closeDb();
  try { unlinkSync(dbPath); } catch { /* ignore */ }
});

describe('conversations', () => {
  it('manager conversation is a singleton (get-or-create)', async () => {
    const a = await getOrCreateManagerConversation(getDb());
    const b = await getOrCreateManagerConversation(getDb());
    expect(a.id).toBe(b.id);
    expect(a.scope).toBe('manager');
  });

  it('agent conversation is unique per (project, agent)', async () => {
    const a = await getOrCreateAgentConversation(getDb(), 'p1', 'mission-planner');
    const b = await getOrCreateAgentConversation(getDb(), 'p1', 'mission-planner');
    expect(a.id).toBe(b.id);
    expect(a.projectId).toBe('p1');
    expect(a.agentId).toBe('mission-planner');
  });

  it('persists an exchange in order and survives a reopen', async () => {
    const conv = await getOrCreateManagerConversation(getDb());
    await appendExchange(getDb(), conv.id, 'refais la home', 'je routerais ça…');
    const msgs = await listMessages(getDb(), conv.id);
    expect(msgs.map((m) => m.role)).toEqual(['user', 'agent']);
    expect(msgs[0]!.text).toBe('refais la home');
    expect(msgs[1]!.text).toBe('je routerais ça…');
  });
});

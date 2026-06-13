import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { eq } from 'drizzle-orm';
import { getDb, closeDb, ideas, missions, projects } from '@mas/db';
import { createIdea, moveIdea, convertIdeaToMission, updateIdeaScores } from './ideas';

const MIGRATIONS = resolve(dirname(fileURLToPath(import.meta.url)), '../../../packages/db/migrations');

let dbPath: string;
beforeEach(async () => {
  dbPath = join(tmpdir(), `mas-ideas-${randomUUID()}.db`);
  process.env.MAS_DB_PATH = dbPath;
  migrate(getDb(), { migrationsFolder: MIGRATIONS });
  await getDb().insert(projects).values({
    id: 'p1', name: 'P', slug: 'p', path: join(tmpdir(), 'p'), type: 'other',
    createdAt: new Date(), lastActiveAt: new Date(),
  });
});
afterEach(() => {
  closeDb();
  try { unlinkSync(dbPath); } catch { /* ignore */ }
  delete process.env.MAS_DB_PATH;
});

describe('createIdea', () => {
  it('inserts an idea and computes its priorityScore deterministically', async () => {
    const idea = await createIdea(getDb(), {
      title: 'Dark mode', scope: 'project', projectId: 'p1',
      impact: 80, urgency: 60, effortEst: 20, riskScore: 10,
    });
    expect(idea.status).toBe('inbox');
    expect(idea.priorityScore).toBe(76);
  });
});

describe('moveIdea', () => {
  it('moves an idea between kanban statuses', async () => {
    const idea = await createIdea(getDb(), { title: 'x', scope: 'global' });
    const moved = await moveIdea(getDb(), idea.id, 'prioritized');
    expect(moved!.status).toBe('prioritized');
  });

  it('rejects an invalid status', async () => {
    const idea = await createIdea(getDb(), { title: 'x', scope: 'global' });
    await expect(moveIdea(getDb(), idea.id, 'bogus' as never)).rejects.toThrow();
  });
});

describe('updateIdeaScores', () => {
  it('recomputes priorityScore from new sliders', async () => {
    const idea = await createIdea(getDb(), { title: 'x', scope: 'global', impact: 0, urgency: 0 });
    const updated = await updateIdeaScores(getDb(), idea.id, { impact: 100, urgency: 100, effortEst: 0, riskScore: 0 });
    expect(updated!.priorityScore).toBe(100);
  });
});

describe('convertIdeaToMission — idempotent (mirrors Phase 1)', () => {
  it('creates a draft mission, links it, marks the idea converted', async () => {
    const idea = await createIdea(getDb(), { title: 'Ship feed v2', scope: 'project', projectId: 'p1' });
    const { mission, created } = await convertIdeaToMission(getDb(), idea.id);
    expect(created).toBe(true);
    expect(mission.status).toBe('draft');
    expect(mission.projectId).toBe('p1');

    const [row] = await getDb().select().from(ideas).where(eq(ideas.id, idea.id));
    expect(row!.status).toBe('converted');
    expect(row!.ideaIdLink).toBe(mission.id);
  });

  it('does not double-create on a second call (returns the same mission)', async () => {
    const idea = await createIdea(getDb(), { title: 'Once', scope: 'project', projectId: 'p1' });
    const first = await convertIdeaToMission(getDb(), idea.id);
    const second = await convertIdeaToMission(getDb(), idea.id);
    expect(second.created).toBe(false);
    expect(second.mission.id).toBe(first.mission.id);

    const all = await getDb().select().from(missions);
    expect(all.length).toBe(1);
  });

  it('refuses to convert an idea with no projectId (missions require a project)', async () => {
    const idea = await createIdea(getDb(), { title: 'Global idea', scope: 'global' });
    await expect(convertIdeaToMission(getDb(), idea.id)).rejects.toThrow();
  });
});

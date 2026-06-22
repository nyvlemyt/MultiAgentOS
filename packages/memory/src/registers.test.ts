import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { eq } from 'drizzle-orm';
import { getDb, closeDb, memoryCandidates, tasks, missions, projects } from '@mas/db';
import {
  MemoryStore,
  MemoryWriteForbiddenError,
  MEMORY_KEEPER_AGENT,
  promoteCandidate,
} from './registers';
import { FtsRetriever } from './retriever';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_FOLDER = resolve(__dirname, '../../db/migrations');

let root: string;
function keeperStore() {
  return new MemoryStore({ root, writerAgent: MEMORY_KEEPER_AGENT });
}

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'mas-mem-'));
});
afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

describe('MemoryStore registers', () => {
  it('appends a decision as BDR-001 and round-trips', () => {
    const s = keeperStore();
    const e = s.append('proj', 'decisions', { title: 'Use FTS5', body: 'Chose FTS5 over QMD.' });
    expect(e.id).toBe('BDR-001');
    const back = s.read('proj', 'decisions');
    expect(back).toHaveLength(1);
    expect(back[0]!.title).toBe('Use FTS5');
    expect(back[0]!.body).toContain('Chose FTS5 over QMD.');
  });

  it('auto-increments ids per register', () => {
    const s = keeperStore();
    s.append('proj', 'decisions', { title: 'A', body: 'a' });
    const e2 = s.append('proj', 'decisions', { title: 'B', body: 'b' });
    expect(e2.id).toBe('BDR-002');
  });

  it('uses the right prefix per register kind', () => {
    const s = keeperStore();
    expect(s.append('proj', 'learnings', { title: 'L', body: 'x' }).id).toBe('LRN-001');
    expect(s.append('proj', 'blockers', { title: 'B', body: 'x' }).id).toBe('BLK-001');
    expect(s.append('proj', 'evals', { title: 'E', body: 'x' }).id).toBe('EVAL-001');
  });

  it('preserves source provenance', () => {
    const s = keeperStore();
    s.append('_global', 'learnings', { title: 'KB', body: 'fact', source: 'docs/knowledge/x.md' });
    expect(s.read('_global', 'learnings')[0]!.source).toBe('docs/knowledge/x.md');
  });

  it('REJECTS writes from any agent other than the Memory Keeper', () => {
    const intruder = new MemoryStore({ root, writerAgent: 'mission-planner' });
    expect(() => intruder.append('proj', 'decisions', { title: 'x', body: 'y' })).toThrow(
      MemoryWriteForbiddenError,
    );
    // and a store with no writer identity is also locked
    expect(() => new MemoryStore({ root }).append('proj', 'decisions', { title: 'x', body: 'y' })).toThrow(
      MemoryWriteForbiddenError,
    );
  });

  it('rejects projectIds that could escape the memory root (path traversal)', () => {
    const s = keeperStore();
    for (const bad of ['../evil', 'a/b', String.raw`a\b`, '..', '']) {
      expect(() => s.append(bad, 'decisions', { title: 'x', body: 'y' })).toThrow(/invalid projectId/);
      expect(() => s.read(bad, 'decisions')).toThrow(/invalid projectId/);
    }
  });

  it('feeds the retriever via allDocs across projects + global', () => {
    const s = keeperStore();
    s.append('otakugo', 'decisions', { title: 'Capture = ritual', body: 'Mem0 cloud rejected §11.' });
    s.append('_global', 'learnings', { title: 'KB', body: 'Three levels of memory.' });
    const r = new FtsRetriever();
    r.index(s.allDocs());
    expect(r.query('Mem0 cloud')[0]!.scope).toBe('project');
    expect(r.query('levels of memory')[0]!.scope).toBe('global');
  });

  it('corpusHash changes when content changes (index is rebuildable)', () => {
    const s = keeperStore();
    const h0 = s.corpusHash();
    s.append('proj', 'decisions', { title: 'X', body: 'y' });
    expect(s.corpusHash()).not.toBe(h0);
  });

  it('corpusHash also folds seeded _global/knowledge (so a persistent index re-builds after a seed)', () => {
    const s = keeperStore();
    const h0 = s.corpusHash();
    s.writeKnowledge('docs/knowledge/x.md', 'a build-time fact about BDR registers');
    expect(s.corpusHash()).not.toBe(h0);
  });

  it('indexPath() points at index.db under the store root', () => {
    expect(keeperStore().indexPath()).toBe(join(root, 'index.db'));
  });
});

async function seedCandidate(id: string) {
  const db = getDb();
  await db.insert(projects).values({
    id: 'proj', name: 'P', slug: 'p', path: join(tmpdir(), 'p'), type: 'other',
    createdAt: new Date(), lastActiveAt: new Date(),
  });
  await db.insert(missions).values({
    id: 'm1', projectId: 'proj', title: 't', objective: 'o', status: 'draft', risk: 'low',
    budgetTokens: 1000, spentTokens: 0, createdAt: new Date(), updatedAt: new Date(),
  });
  await db.insert(tasks).values({
    id: 'task1', missionId: 'm1', title: 't', description: 'd', status: 'done', risk: 'low',
    dependsOnJson: '[]', skillsJson: '[]', budgetTokens: 100, spentTokens: 0,
    createdAt: new Date(), updatedAt: new Date(),
  });
  await db.insert(memoryCandidates).values({
    id, sourceTaskId: 'task1', type: 'project',
    body: 'Decided to ship FTS5 for the MVP retriever.', status: 'pending', createdAt: new Date(),
  });
}

describe('promoteCandidate (memory_candidates → register)', () => {
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

  it('promotes a pending candidate into a register and marks it accepted', async () => {
    const db = getDb();
    await seedCandidate('c1');
    const entry = await promoteCandidate(db, 'c1', { projectId: 'proj', kind: 'decisions' }, keeperStore());
    expect(entry.id).toBe('BDR-001');
    expect(entry.body).toContain('FTS5');
    const [row] = await db.select().from(memoryCandidates).where(eq(memoryCandidates.id, 'c1'));
    expect(row!.status).toBe('accepted');
    expect(keeperStore().read('proj', 'decisions')).toHaveLength(1);
  });

  it('is idempotent — a non-pending candidate is not re-promoted', async () => {
    const db = getDb();
    await seedCandidate('c2');
    await promoteCandidate(db, 'c2', { projectId: 'proj', kind: 'decisions' }, keeperStore());
    await expect(
      promoteCandidate(db, 'c2', { projectId: 'proj', kind: 'decisions' }, keeperStore()),
    ).rejects.toThrow();
    expect(keeperStore().read('proj', 'decisions')).toHaveLength(1);
  });
});

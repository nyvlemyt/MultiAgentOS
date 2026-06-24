import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { unlinkSync, mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { getDb, closeDb, ficheRevisions } from '@mas/db';
import {
  readFiche,
  writeFiche,
  listFicheRevisions,
  restoreFiche,
  pruneFicheRevisions,
  revisionsNeedCleanup,
  ficheSaveSummary,
} from './agent-fiche';

const MIGRATIONS = resolve(dirname(fileURLToPath(import.meta.url)), '../../../packages/db/migrations');
const AGENT = 'engineering-frontend-developer';
const DAY = 24 * 60 * 60 * 1000;

let dbPath: string;
let root: string;
beforeEach(() => {
  dbPath = join(tmpdir(), `mas-fiche-${randomUUID()}.db`);
  process.env.MAS_DB_PATH = dbPath;
  migrate(getDb(), { migrationsFolder: MIGRATIONS });
  root = mkdtempSync(join(tmpdir(), 'fiche-root-'));
});
afterEach(() => {
  closeDb();
  try { unlinkSync(dbPath); } catch { /* ignore */ }
  try { rmSync(root, { recursive: true, force: true }); } catch { /* ignore */ }
  delete process.env.MAS_DB_PATH;
});

describe('readFiche', () => {
  it('returns found:false when no fiche exists on disk', async () => {
    const res = await readFiche(AGENT, { roots: [root] });
    expect(res.found).toBe(false);
    expect(res.content).toBe('');
  });

  it('reads the fiche content when present', async () => {
    writeFileSync(join(root, `${AGENT}.md`), 'hello fiche');
    const res = await readFiche(AGENT, { roots: [root] });
    expect(res.found).toBe(true);
    expect(res.content).toBe('hello fiche');
  });
});

describe('writeFiche', () => {
  it('snapshots the prior content into revisions, then writes the new content', async () => {
    writeFileSync(join(root, `${AGENT}.md`), 'v1');
    await writeFiche(getDb(), AGENT, 'v2', 'frontmatter tweak', { roots: [root] });
    expect(readFileSync(join(root, `${AGENT}.md`), 'utf-8')).toBe('v2');
    const revs = await listFicheRevisions(getDb(), AGENT);
    expect(revs).toHaveLength(1);
    expect(revs[0]!.content).toBe('v1');
    expect(revs[0]!.summary).toBe('frontmatter tweak');
  });

  it('does not snapshot when there is no prior file', async () => {
    await writeFiche(getDb(), AGENT, 'first', 'create', { roots: [root] });
    expect(readFileSync(join(root, `${AGENT}.md`), 'utf-8')).toBe('first');
    expect(await listFicheRevisions(getDb(), AGENT)).toHaveLength(0);
  });
});

describe('restoreFiche', () => {
  it('rewrites the file from the chosen revision and round-trips', async () => {
    writeFileSync(join(root, `${AGENT}.md`), 'v1');
    await writeFiche(getDb(), AGENT, 'v2', 's1', { roots: [root] });
    const [rev] = await listFicheRevisions(getDb(), AGENT); // snapshot of v1
    await restoreFiche(getDb(), AGENT, rev!.id, { roots: [root] });
    expect(readFileSync(join(root, `${AGENT}.md`), 'utf-8')).toBe('v1');
    // restoring snapshots the pre-restore content (v2) so the restore itself is undoable
    expect((await listFicheRevisions(getDb(), AGENT)).some((r) => r.content === 'v2')).toBe(true);
  });
});

async function seedRevisions(ages: number[], now: number): Promise<void> {
  for (const ageDays of ages) {
    await getDb().insert(ficheRevisions).values({
      id: `rev_${randomUUID()}`,
      agentId: AGENT,
      content: `c${ageDays}`,
      summary: 's',
      savedAt: new Date(now - ageDays * DAY),
    });
  }
}

describe('pruneFicheRevisions', () => {
  it('keeps the newest 10 and drops anything older than 30 days', async () => {
    const now = Date.now();
    // 12 fresh (1..12 days) + 2 stale (40, 50 days)
    await seedRevisions([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 40, 50], now);
    const deleted = await pruneFicheRevisions(getDb(), AGENT, new Date(now));
    const remaining = await listFicheRevisions(getDb(), AGENT);
    expect(remaining).toHaveLength(10);
    expect(remaining.every((r) => now - r.savedAt.getTime() <= 30 * DAY)).toBe(true);
    expect(deleted).toBe(4);
  });
});

describe('ficheSaveSummary', () => {
  it('reports a positive line delta', () => {
    expect(ficheSaveSummary('a\nb', 'a\nb\nc\nd')).toBe('fiche éditée (+2 lignes)');
  });
  it('reports a negative line delta', () => {
    expect(ficheSaveSummary('a\nb\nc', 'a')).toBe('fiche éditée (-2 lignes)');
  });
  it('reports same-length edits without a delta number', () => {
    expect(ficheSaveSummary('a\nb', 'x\ny')).toBe('fiche éditée (contenu modifié)');
  });
});

describe('revisionsNeedCleanup', () => {
  const now = Date.now();
  const fresh = (n: number) => Array.from({ length: n }, () => ({ savedAt: new Date(now - DAY) }));

  it('is false for ≤10 fresh revisions', () => {
    expect(revisionsNeedCleanup(fresh(10), new Date(now))).toBe(false);
  });

  it('is true when there are more than 10 revisions', () => {
    expect(revisionsNeedCleanup(fresh(11), new Date(now))).toBe(true);
  });

  it('is true when any revision is older than 30 days', () => {
    expect(revisionsNeedCleanup([{ savedAt: new Date(now - 31 * DAY) }], new Date(now))).toBe(true);
  });

  it('is false at exactly the 30-day boundary', () => {
    expect(revisionsNeedCleanup([{ savedAt: new Date(now - 30 * DAY) }], new Date(now))).toBe(false);
  });
});

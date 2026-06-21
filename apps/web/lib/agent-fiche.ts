import { randomUUID } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { and, desc, eq, inArray } from 'drizzle-orm';
import { getDb, ficheRevisions, type FicheRevision } from '@mas/db';

// Agent Control Panel — base-agent fiche read/write with a DB-backed revision
// trail. Writes are confined to the real fiche roots (CLAUDE.md §5: no file write
// outside .claude/agents / packages/agents). Tests pass an explicit `roots`.

type Db = ReturnType<typeof getDb>;

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const DEFAULT_ROOTS = [
  join(REPO_ROOT, '.claude', 'agents'), // Tier B
  join(REPO_ROOT, 'packages', 'agents', 'fiches'), // Tier A
];

const KEEP_MAX = 10;
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

export interface FicheIO {
  roots?: string[];
}

export interface FicheReadResult {
  found: boolean;
  content: string;
  path: string;
}

function resolveRoots(opts?: FicheIO): string[] {
  return opts?.roots ?? DEFAULT_ROOTS;
}

function locateFiche(agentId: string, roots: string[]): { path: string; found: boolean } {
  for (const r of roots) {
    const p = join(r, `${agentId}.md`);
    if (existsSync(p)) return { path: p, found: true };
  }
  // Not found anywhere → target the first root for a would-be write.
  return { path: join(roots[0]!, `${agentId}.md`), found: false };
}

export async function readFiche(agentId: string, opts?: FicheIO): Promise<FicheReadResult> {
  const { path, found } = locateFiche(agentId, resolveRoots(opts));
  return { found, path, content: found ? readFileSync(path, 'utf-8') : '' };
}

export async function listFicheRevisions(db: Db, agentId: string): Promise<FicheRevision[]> {
  return db
    .select()
    .from(ficheRevisions)
    .where(eq(ficheRevisions.agentId, agentId))
    .orderBy(desc(ficheRevisions.savedAt));
}

export async function writeFiche(
  db: Db,
  agentId: string,
  content: string,
  summary: string,
  opts?: FicheIO,
): Promise<void> {
  const { path, found } = locateFiche(agentId, resolveRoots(opts));
  if (found) {
    const prior = readFileSync(path, 'utf-8');
    await db.insert(ficheRevisions).values({
      id: `rev_${randomUUID()}`,
      agentId,
      content: prior,
      summary,
      savedAt: new Date(),
    });
  }
  writeFileSync(path, content);
  await pruneFicheRevisions(db, agentId, new Date());
}

export async function restoreFiche(
  db: Db,
  agentId: string,
  revisionId: string,
  opts?: FicheIO,
): Promise<void> {
  const [rev] = await db
    .select()
    .from(ficheRevisions)
    .where(and(eq(ficheRevisions.id, revisionId), eq(ficheRevisions.agentId, agentId)));
  if (!rev) return;
  await writeFiche(db, agentId, rev.content, `restauration : ${rev.summary}`, opts);
}

// Keep the newest 10 AND drop anything older than 30 days (whichever prunes more):
// a revision survives only if it is among the 10 newest AND within 30 days.
export async function pruneFicheRevisions(db: Db, agentId: string, now: Date): Promise<number> {
  const rows = await listFicheRevisions(db, agentId); // newest first
  const cutoff = new Date(now.getTime() - MAX_AGE_MS);
  const survivors = new Set(rows.filter((r, i) => i < KEEP_MAX && r.savedAt >= cutoff).map((r) => r.id));
  const toDelete = rows.filter((r) => !survivors.has(r.id)).map((r) => r.id);
  if (toDelete.length === 0) return 0;
  await db
    .delete(ficheRevisions)
    .where(and(eq(ficheRevisions.agentId, agentId), inArray(ficheRevisions.id, toDelete)));
  return toDelete.length;
}

// Short human label computed at save time so the history list reads at a glance
// without diffing stored snapshots.
export function ficheSaveSummary(prev: string, next: string): string {
  const delta = next.split('\n').length - prev.split('\n').length;
  if (delta === 0) return 'fiche éditée (contenu modifié)';
  return `fiche éditée (${delta > 0 ? '+' : ''}${delta} lignes)`;
}

export function revisionsNeedCleanup(rows: ReadonlyArray<{ savedAt: Date }>, now: Date): boolean {
  if (rows.length > KEEP_MAX) return true;
  const cutoff = now.getTime() - MAX_AGE_MS;
  return rows.some((r) => r.savedAt.getTime() < cutoff);
}

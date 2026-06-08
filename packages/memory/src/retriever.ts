import { createRequire } from 'node:module';
import type BetterSqlite3 from 'better-sqlite3';

const require_ = createRequire(import.meta.url);
type DatabaseCtor = new (filename: string, options?: BetterSqlite3.Options) => BetterSqlite3.Database;
const Database: DatabaseCtor = require_('better-sqlite3');

export type MemoryScope = 'global' | 'project';

export interface MemoryDoc {
  id: string;
  scope: MemoryScope;
  source: string;
  title: string;
  body: string;
}

export interface MemoryHit extends MemoryDoc {
  /** Higher = more relevant (negated BM25). */
  score: number;
}

export interface MemoryQueryOpts {
  limit?: number;
  scope?: MemoryScope | 'all';
}

/**
 * MemoryRetriever — N2 recall layer (ADR 0003). FtsRetriever is the Phase-4 MVP
 * implementation; QmdRetriever swaps in behind this interface later (Phase 4.x).
 */
export interface MemoryRetriever {
  query(q: string, opts?: MemoryQueryOpts): MemoryHit[];
}

/**
 * Turn a free-text query into a safe FTS5 MATCH expression. Each word becomes a
 * double-quoted string literal (so punctuation can never break MATCH syntax) and
 * the tokens are OR-joined for recall; BM25 ranks multi-term hits higher.
 */
export function toMatchExpr(q: string): string {
  const tokens = q
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter((t) => t.length > 0);
  return tokens.map((t) => `"${t}"`).join(' OR ');
}

export class FtsRetriever implements MemoryRetriever {
  private readonly db: BetterSqlite3.Database;

  constructor(opts: { indexPath?: string } = {}) {
    this.db = new Database(opts.indexPath ?? ':memory:');
    this.db.pragma('journal_mode = WAL');
    this.db.exec(
      `CREATE VIRTUAL TABLE IF NOT EXISTS mem_fts USING fts5(
        id UNINDEXED, scope UNINDEXED, source UNINDEXED, title, body
      );`,
    );
  }

  /** Replace the entire indexed corpus (index is derived & rebuildable, ADR 0003). */
  index(docs: MemoryDoc[]): void {
    const insert = this.db.prepare(
      'INSERT INTO mem_fts (id, scope, source, title, body) VALUES (?, ?, ?, ?, ?)',
    );
    const tx = this.db.transaction((rows: MemoryDoc[]) => {
      this.db.exec('DELETE FROM mem_fts');
      for (const d of rows) insert.run(d.id, d.scope, d.source, d.title, d.body);
    });
    tx(docs);
  }

  query(q: string, opts: MemoryQueryOpts = {}): MemoryHit[] {
    const expr = toMatchExpr(q);
    if (!expr) return [];
    const limit = opts.limit ?? 5;
    const scope = opts.scope ?? 'all';

    const scopeClause = scope === 'all' ? '' : 'AND scope = @scope';
    const rows = this.db
      .prepare(
        `SELECT id, scope, source, title, body, bm25(mem_fts) AS rank
         FROM mem_fts
         WHERE mem_fts MATCH @expr ${scopeClause}
         ORDER BY rank ASC
         LIMIT @limit`,
      )
      .all({ expr, scope, limit }) as Array<MemoryDoc & { rank: number }>;

    return rows.map(({ rank, ...d }) => ({ ...d, score: -rank }));
  }

  close(): void {
    this.db.close();
  }
}

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
    // Sidecar table so a persistent index (indexPath) remembers which corpus it
    // was built from — ensureIndexed rebuilds only when this differs (ADR 0003:
    // index is derived & rebuildable from a SHA-256 hash of the .md source).
    this.db.exec('CREATE TABLE IF NOT EXISTS mem_meta (key TEXT PRIMARY KEY, value TEXT);');
  }

  /** The corpus hash this index was last built from, or null when never indexed. */
  indexedHash(): string | null {
    const row = this.db
      .prepare('SELECT value FROM mem_meta WHERE key = ?')
      .get('corpus_hash') as { value: string } | undefined;
    return row?.value ?? null;
  }

  /**
   * Replace the entire indexed corpus (index is derived & rebuildable, ADR 0003).
   * Pass `hash` to stamp the corpus hash inside the same transaction so a reopened
   * persistent index can tell whether it is current (ensureIndexed).
   */
  index(docs: MemoryDoc[], hash?: string): void {
    const insert = this.db.prepare(
      'INSERT INTO mem_fts (id, scope, source, title, body) VALUES (?, ?, ?, ?, ?)',
    );
    const upsertHash = this.db.prepare(
      'INSERT INTO mem_meta (key, value) VALUES (?, ?) ' +
        'ON CONFLICT(key) DO UPDATE SET value = excluded.value',
    );
    const tx = this.db.transaction((rows: MemoryDoc[]) => {
      this.db.exec('DELETE FROM mem_fts');
      for (const d of rows) insert.run(d.id, d.scope, d.source, d.title, d.body);
      if (hash !== undefined) upsertHash.run('corpus_hash', hash);
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

/**
 * Structural view of a corpus the retriever can index from. Declared here (not
 * imported from `registers`) so retriever.ts has no dependency on registers.ts —
 * MemoryStore satisfies it nominally, keeping the import graph acyclic.
 */
export interface IndexableCorpus {
  corpusHash(): string;
  allDocs(): MemoryDoc[];
}

/**
 * Bring a (possibly persistent) retriever in sync with a corpus, re-indexing only
 * when the stored hash differs from the corpus's current hash. Returns true when
 * it rebuilt the index, false when the index was already current.
 */
export function ensureIndexed(r: FtsRetriever, corpus: IndexableCorpus): boolean {
  const want = corpus.corpusHash();
  if (r.indexedHash() === want) return false;
  r.index(corpus.allDocs(), want);
  return true;
}

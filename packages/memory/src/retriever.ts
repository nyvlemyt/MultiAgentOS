import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { delimiter, isAbsolute, join } from 'node:path';
import { createRequire } from 'node:module';
import type BetterSqlite3 from 'better-sqlite3';

const require_ = createRequire(import.meta.url);
type DatabaseCtor = new (filename: string, options?: BetterSqlite3.Options) => BetterSqlite3.Database;
const Database: DatabaseCtor = require_('better-sqlite3');

/**
 * Resolve a command to an ABSOLUTE path by scanning PATH ourselves, so the later
 * `execFileSync` does not search PATH at spawn time (typescript:S4036 — a bare
 * command name relies on PATH, which may hold writable dirs). Returns the input
 * unchanged when already absolute or not found (caller's exec then surfaces the
 * real ENOENT). Pure lookup; never spawns.
 */
function resolveExecutable(cmd: string): string {
  if (isAbsolute(cmd)) return cmd;
  for (const dir of (process.env['PATH'] ?? '').split(delimiter)) {
    if (!dir) continue;
    const candidate = join(dir, cmd);
    if (existsSync(candidate)) return candidate;
  }
  return cmd;
}

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
  /**
   * Restrict project-scoped hits to one project (id prefix `<projectId>/`). Honoured
   * by both backends so buildMemoryContext can pull THIS project's memory by relevance
   * without leaking other projects' entries.
   */
  projectId?: string;
  /**
   * Restrict this query to specific QMD collections (e.g. `['mas-knowledge']` to test
   * semantic KNOWLEDGE recall without arsenal noise). QMD-only — the FTS fallback has
   * no collections and ignores it. Overrides the retriever's constructor allowlist.
   */
  collections?: string[];
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

/** Escape SQL LIKE wildcards in a literal prefix (used with `ESCAPE '\'`). */
function escapeLike(s: string): string {
  return s.replace(/[\\%_]/g, (c) => `\\${c}`);
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
    // toDocs() ids are `<projectId>/<entryId>` — a prefix LIKE keeps the filter to
    // one project. The `/` separator is added literally so it can't be a wildcard.
    const projectClause = opts.projectId ? String.raw`AND id LIKE @projectLike ESCAPE '\'` : '';
    const params: Record<string, unknown> = { expr, scope, limit };
    if (opts.projectId) params['projectLike'] = `${escapeLike(opts.projectId)}/%`;

    const rows = this.db
      .prepare(
        `SELECT id, scope, source, title, body, bm25(mem_fts) AS rank
         FROM mem_fts
         WHERE mem_fts MATCH @expr ${scopeClause} ${projectClause}
         ORDER BY rank ASC
         LIMIT @limit`,
      )
      .all(params) as Array<MemoryDoc & { rank: number }>;

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

// ----------------------------------------------------------------------------
// QMD retriever (Phase 9 · 0a renforcée, ADR 0003 amendment).
// QMD (github.com/tobi/qmd) is an external local CLI/MCP doing BM25 + vector +
// rerank over a project-local `.qmd/` index. It only READS the Markdown truth —
// the index is derived & rebuildable (principle 1). We shell out synchronously
// (execFileSync) so the MemoryRetriever interface stays sync: the swap is
// transparent to every caller (ADR 0003 reversibility). buildMemoryContext is
// only called from the worker dispatch path (not a web request), so a ~4 s
// model-warm `qmd query` is acceptable for mission-level on-demand retrieval.
// ----------------------------------------------------------------------------

/** A raw row of `qmd <mode> --json`. */
interface QmdRawHit {
  docid: string;
  score: number;
  file: string;
  line: number;
  title: string;
  snippet: string;
}

export type QmdMode = 'query' | 'search' | 'vsearch';

export interface QmdRetrieverOpts {
  /** Repo root containing the project-local `.qmd/` index. */
  cwd: string;
  /** qmd binary (default 'qmd'); override for tests/stubs. */
  bin?: string;
  /** 'query' = hybrid+rerank (default), 'search' = BM25 (no models), 'vsearch' = vectors. */
  mode?: QmdMode;
  /** Only keep hits from these qmd collection names (default: all). */
  collections?: string[];
  /** Hard timeout per query; on timeout the call throws → UnifiedRetriever falls back. */
  timeoutMs?: number;
}

export const QMD_KNOWLEDGE = 'mas-knowledge';
export const QMD_WORKFLOWS = 'mas-workflows';
export const QMD_MEMORY = 'mas-memory';
export const QMD_ARSENAL = 'mas-arsenal';

/**
 * Default collections for the MISSION-MEMORY context path (dispatch). Memory +
 * the two knowledge-family collections — QMD indexes one path per collection, so
 * docs/knowledge and docs/workflows are two collections, both queried as "what the
 * system knows" (PHASE9-0a §3). mas-arsenal is deliberately EXCLUDED here: it is
 * the Skill Router's candidate corpus, not mission-memory context.
 */
export const QMD_MEMORY_COLLECTIONS = [QMD_MEMORY, QMD_KNOWLEDGE, QMD_WORKFLOWS];

/** Repo-relative folder each collection indexes — used to rebuild hit provenance. */
const COLLECTION_ROOT: Record<string, string> = {
  [QMD_KNOWLEDGE]: 'docs/knowledge',
  [QMD_WORKFLOWS]: 'docs/workflows',
  [QMD_MEMORY]: 'data/memory',
  [QMD_ARSENAL]: 'data/arsenal-index',
};

/** Map one `qmd://<collection>/<rest>` hit to a MemoryDoc scope/source/project. */
function mapQmdHit(raw: QmdRawHit): (MemoryHit & { collection: string; projectId?: string }) | null {
  const m = /^qmd:\/\/([^/]+)\/(.+)$/.exec(raw.file);
  if (!m) return null;
  const collection = m[1]!;
  const rest = m[2]!;
  let scope: MemoryScope = 'global';
  let projectId: string | undefined;
  // mas-memory ids are `<projectId|_global>/<register>` — derive scope from seg0.
  if (collection === QMD_MEMORY && rest.split('/')[0] !== '_global') {
    scope = 'project';
    projectId = rest.split('/')[0];
  }
  const root = COLLECTION_ROOT[collection];
  const source = root ? `${root}/${rest}` : rest;
  return {
    id: `${collection}/${rest}`,
    scope,
    source,
    title: raw.title,
    body: raw.snippet,
    score: raw.score,
    collection,
    projectId,
  };
}

/** Extract the JSON array from qmd stdout (defensive against any banner lines). */
function parseQmdJson(stdout: string): QmdRawHit[] {
  const start = stdout.indexOf('[');
  const end = stdout.lastIndexOf(']');
  if (start === -1 || end === -1 || end < start) return [];
  const parsed: unknown = JSON.parse(stdout.slice(start, end + 1));
  return Array.isArray(parsed) ? (parsed as QmdRawHit[]) : [];
}

export class QmdRetriever implements MemoryRetriever {
  private readonly bin: string;
  private readonly mode: QmdMode;
  private readonly timeoutMs: number;

  constructor(private readonly opts: QmdRetrieverOpts) {
    this.bin = resolveExecutable(opts.bin ?? 'qmd');
    this.mode = opts.mode ?? 'query';
    this.timeoutMs = opts.timeoutMs ?? 30_000;
  }

  /** True when the qmd binary runs and a `.qmd` index exists in cwd. */
  static available(cwd: string, bin = 'qmd'): boolean {
    if (!existsSync(join(cwd, '.qmd'))) return false;
    try {
      execFileSync(resolveExecutable(bin), ['status'], { cwd, stdio: 'ignore', timeout: 10_000 });
      return true;
    } catch {
      return false;
    }
  }

  query(q: string, opts: MemoryQueryOpts = {}): MemoryHit[] {
    if (!q.trim()) return [];
    const limit = opts.limit ?? 5;
    // qmd ranks then we post-filter by scope/project/collection, so over-fetch.
    const fetch = Math.max(limit * 4, 20);
    // Per-query collections (opts) override the constructor allowlist. Passed to qmd
    // as `-c <name>` so the engine narrows BEFORE rerank, and re-checked below.
    const allow = opts.collections ?? this.opts.collections;
    const stdout = execFileSync(this.bin, qmdQueryArgs(this.mode, q, fetch, allow), {
      cwd: this.opts.cwd,
      encoding: 'utf8',
      timeout: this.timeoutMs,
      maxBuffer: 16 * 1024 * 1024,
    });
    return collectQmdHits(parseQmdJson(stdout), {
      allow,
      scope: opts.scope ?? 'all',
      projectId: opts.projectId,
      limit,
    });
  }
}

/** CLI argv for one qmd query: `<mode> <q> --json -n <fetch> [-c <collection>]…`. */
function qmdQueryArgs(mode: QmdMode, q: string, fetch: number, allow?: string[]): string[] {
  const args = [mode, q, '--json', '-n', String(fetch)];
  if (allow) for (const c of allow) args.push('-c', c);
  return args;
}

interface QmdHitFilter {
  allow?: string[];
  scope: MemoryScope | 'all';
  projectId?: string;
  limit: number;
}

/** Map → post-filter (collection/scope/project) → cap qmd raw hits to MemoryHits. */
function collectQmdHits(raws: QmdRawHit[], f: QmdHitFilter): MemoryHit[] {
  const hits: MemoryHit[] = [];
  for (const raw of raws) {
    const mapped = mapQmdHit(raw);
    if (!mapped) continue;
    if (f.allow && !f.allow.includes(mapped.collection)) continue;
    if (f.scope !== 'all' && mapped.scope !== f.scope) continue;
    if (f.projectId && mapped.projectId !== f.projectId) continue;
    hits.push({
      id: mapped.id,
      scope: mapped.scope,
      source: mapped.source,
      title: mapped.title,
      body: mapped.body,
      score: mapped.score,
    });
    if (hits.length >= f.limit) break;
  }
  return hits;
}

/**
 * QMD primary, FTS fallback. A QMD *error* (binary missing, timeout, bad JSON)
 * falls through to FTS for that query; an empty QMD result is a valid answer and
 * does NOT trigger fallback. This is the "FTS fallback if QMD is cut" guarantee
 * (Phase 9 · 0a exit criterion) — retrieval never breaks when QMD is unavailable.
 */
export class UnifiedRetriever implements MemoryRetriever {
  constructor(
    private readonly primary: MemoryRetriever,
    private readonly fallback: MemoryRetriever,
    private readonly onFallback?: (err: unknown) => void,
  ) {}

  query(q: string, opts?: MemoryQueryOpts): MemoryHit[] {
    try {
      return this.primary.query(q, opts);
    } catch (err) {
      this.onFallback?.(err);
      return this.fallback.query(q, opts);
    }
  }
}

export type RetrievalBackend = 'qmd' | 'fts' | 'auto';

export interface CreateRetrieverOpts {
  /** Repo root for QMD (.qmd index). */
  cwd: string;
  /** Corpus to build the FTS index/fallback from. */
  corpus: IndexableCorpus;
  /** 'auto' (default) = QMD when available else FTS. Env MAS_RETRIEVAL_BACKEND overrides. */
  backend?: RetrievalBackend;
  /** Persistent FTS index path (ADR 0003); omit for in-memory. */
  indexPath?: string;
  /** Restrict QMD hits to these collections (memory search: mas-memory + mas-knowledge). */
  collections?: string[];
  qmdMode?: QmdMode;
  bin?: string;
  onFallback?: (err: unknown) => void;
}

/** Build (and index) an FtsRetriever from a corpus. */
function buildFts(corpus: IndexableCorpus, indexPath?: string): FtsRetriever {
  const fts = indexPath ? new FtsRetriever({ indexPath }) : new FtsRetriever();
  if (indexPath) ensureIndexed(fts, corpus);
  else fts.index(corpus.allDocs());
  return fts;
}

/**
 * Pick the retrieval backend (ADR 0003 amendment): QMD behind the MemoryRetriever
 * seam with an FTS fallback. `MAS_RETRIEVAL_BACKEND=fts` forces FTS (used in CI,
 * where the ~4.4 GB QMD models are absent).
 */
export function createRetriever(opts: CreateRetrieverOpts): MemoryRetriever {
  const envBackend = process.env['MAS_RETRIEVAL_BACKEND'] as RetrievalBackend | undefined;
  const backend = envBackend ?? opts.backend ?? 'auto';
  const fts = buildFts(opts.corpus, opts.indexPath);
  if (backend === 'fts') return fts;
  if (QmdRetriever.available(opts.cwd, opts.bin)) {
    const qmd = new QmdRetriever({
      cwd: opts.cwd,
      bin: opts.bin,
      mode: opts.qmdMode,
      collections: opts.collections ?? QMD_MEMORY_COLLECTIONS,
    });
    return new UnifiedRetriever(qmd, fts, opts.onFallback);
  }
  if (backend === 'qmd') {
    // Explicitly asked for QMD but it is unavailable — degrade to FTS, never crash.
    opts.onFallback?.(new Error('QMD requested but unavailable; using FTS'));
  }
  return fts;
}

export interface RetrievalDoctorResult {
  /** Will runtime retrieval use QMD (semantic)? False → FTS keyword fallback. */
  qmdActive: boolean;
  /** `.qmd` index directory present in cwd. */
  indexFound: boolean;
  /** `qmd` binary resolves and runs. */
  binFound: boolean;
  /** MAS_RETRIEVAL_BACKEND=fts forces FTS regardless of QMD presence. */
  forcedFts: boolean;
  /** Human-facing one-liner — logged at boot and by `pnpm mem:doctor`. */
  message: string;
}

/**
 * Diagnose the retrieval backend so the worker boot (and `pnpm mem:doctor`) can
 * warn EXPLICITLY when QMD is absent instead of degrading silently to FTS — a
 * fresh clone / re-fetch elsewhere must be told it needs `pnpm qmd:setup`
 * (Phase 9 · 0a renforcée exit criterion; CLAUDE.md "jamais de dégradation
 * silencieuse"). Pure diagnostic: never throws, never mutates.
 */
export function retrievalDoctor(cwd: string, bin = 'qmd'): RetrievalDoctorResult {
  const forcedFts = process.env['MAS_RETRIEVAL_BACKEND'] === 'fts';
  const indexFound = existsSync(join(cwd, '.qmd'));
  let binFound = false;
  try {
    execFileSync(resolveExecutable(bin), ['--version'], { cwd, stdio: 'ignore', timeout: 10_000 });
    binFound = true;
  } catch {
    binFound = false;
  }
  const qmdActive = !forcedFts && QmdRetriever.available(cwd, bin);
  let message: string;
  if (forcedFts) {
    message = 'Recherche en FTS (mots-clés) — forcée par MAS_RETRIEVAL_BACKEND=fts.';
  } else if (qmdActive) {
    message = 'QMD détecté → recherche sémantique active (BM25 + vecteurs + rerank).';
  } else if (binFound && !indexFound) {
    message =
      'QMD installé mais index absent → recherche en FTS (mots-clés). ' +
      'Lance pnpm qmd:setup pour construire l’index sémantique (~4,4 Go, Node ≥22).';
  } else {
    message =
      'QMD non détecté → recherche en FTS (mots-clés). ' +
      'Lance pnpm qmd:setup pour le sémantique (~4,4 Go, Node ≥22).';
  }
  return { qmdActive, indexFound, binFound, forcedFts, message };
}

import { createHash } from 'node:crypto';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from 'node:fs';
import { join } from 'node:path';
import { eq } from 'drizzle-orm';
import { memoryCandidates, type getDb } from '@mas/db';
import type { MemoryDoc, MemoryScope } from './retriever';

type Db = ReturnType<typeof getDb>;

/** CLAUDE.md §8: the Memory Keeper is the SOLE writer to data/memory/. */
export const MEMORY_KEEPER_AGENT = 'memory-keeper';
export const GLOBAL_PROJECT = '_global';

export class MemoryWriteForbiddenError extends Error {
  constructor(writer: string | undefined) {
    super(
      `Memory write denied: only '${MEMORY_KEEPER_AGENT}' may write data/memory/ (CLAUDE.md §8). ` +
        `Got writer='${writer ?? '(none)'}'.`,
    );
    this.name = 'MemoryWriteForbiddenError';
  }
}

export type RegisterKind = 'decisions' | 'learnings' | 'blockers' | 'journal' | 'evals';

const PREFIX: Record<Exclude<RegisterKind, 'journal'>, string> = {
  decisions: 'BDR',
  learnings: 'LRN',
  blockers: 'BLK',
  evals: 'EVAL',
};

export interface RegisterEntry {
  id: string;
  title: string;
  body: string;
  date?: string;
  source?: string;
}

export interface NewEntry {
  title: string;
  body: string;
  source?: string;
  date?: string;
  /** Related register ids to fold into a trailing `Related:` wikilink footer. */
  links?: string[];
}

/**
 * Wrap bare register ids (BDR/LRN/BLK/EVAL-NNN) in Obsidian `[[…]]` wikilinks so
 * data/memory/ opens as a graph vault. The lookbehind/lookahead skip ids already
 * inside `[[…]]`, making this idempotent (no double-wrapping). The `\d{3,}`
 * quantifier is disjoint from its neighbours — no super-linear backtracking (S5852).
 */
export function linkifyIds(text: string): string {
  return text.replace(/(?<!\[\[)(BDR|LRN|BLK|EVAL)-\d{3,}(?!\]\])/g, '[[$&]]');
}


/**
 * Prefix a provenance comment, AFTER the YAML frontmatter block when one is present —
 * a leading comment would make the frontmatter invisible to any `---`-first parser.
 * Shared by the mission mirror (writeKnowledge) and the études mirror (seed).
 */
export function withProvenance(source: string, body: string): string {
  const provenance = `<!-- source: ${source} -->`;
  if (body.startsWith('---\n') || body.startsWith('---\r\n')) {
    const close = body.indexOf('\n---', 3);
    if (close !== -1) {
      const lineEnd = body.indexOf('\n', close + 1);
      const cut = lineEnd === -1 ? body.length : lineEnd + 1;
      return `${body.slice(0, cut)}${provenance}\n${body.slice(cut)}`;
    }
  }
  return `${provenance}\n${body}`;
}

export interface MemoryStoreOpts {
  /** Root of the memory store, e.g. data/memory. */
  root: string;
  /** Identity of the writer. Must equal MEMORY_KEEPER_AGENT to mutate. */
  writerAgent?: string;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function serialize(entries: RegisterEntry[]): string {
  return entries
    .map((e) => {
      const meta: string[] = [];
      if (e.date) meta.push(`- date: ${e.date}`);
      if (e.source) meta.push(`- source: ${e.source}`);
      const head = e.title ? `## ${e.id} — ${e.title}` : `## ${e.id}`;
      // linkifyIds is idempotent, so already-linked bodies survive a re-serialize.
      return `${head}\n${meta.join('\n')}${meta.length ? '\n' : ''}\n${linkifyIds(e.body.trim())}\n`;
    })
    .join('\n');
}

/**
 * A register entry header, and ONLY that: `## <id>` where the id is a register id
 * (BDR/LRN/BLK/EVAL-NNN) or a journal date. Splitting on any `^## ` — as this parser
 * used to — shreds an entry whose BODY carries its own markdown headings into phantom
 * entries with garbage ids ('Contents', '2.1 Variable cible'): the retriever then
 * indexes them as documents and nextId() counts them, so LRN-044 was minted LRN-082.
 * That surfaced the day the first ingested course documents landed in a register.
 * The quantifiers below are separated by literals — no super-linear backtracking (S5852).
 */
const ENTRY_HEADER = /^## ((?:BDR|LRN|BLK|EVAL)-\d{3,}|\d{4}-\d{2}-\d{2})(?: — (.*))?$/;

/** Split an entry's raw lines into its `- key: value` meta head and its body. */
function readEntry(id: string, title: string, lines: string[]): RegisterEntry {
  const entry: RegisterEntry = { id, title, body: '' };
  let i = 0;
  for (; i < lines.length; i++) {
    // (\S.*)? keeps the value start disjoint from \s* — no overlapping
    // quantifiers, no super-linear backtracking (S5852).
    const m = /^- (\w+):\s*(\S.*)?$/.exec(lines[i]!);
    if (!m) break;
    if (m[1] === 'date') entry.date = (m[2] ?? '').trim();
    if (m[1] === 'source') entry.source = (m[2] ?? '').trim();
  }
  entry.body = lines.slice(i).join('\n').trim();
  return entry;
}

function parse(content: string): RegisterEntry[] {
  const entries: RegisterEntry[] = [];
  let head: { id: string; title: string } | null = null;
  let lines: string[] = [];
  for (const line of content.split('\n')) {
    const m = ENTRY_HEADER.exec(line);
    if (!m) {
      if (head) lines.push(line);
      continue;
    }
    if (head) entries.push(readEntry(head.id, head.title, lines));
    head = { id: m[1]!, title: (m[2] ?? '').trim() };
    lines = [];
  }
  if (head) entries.push(readEntry(head.id, head.title, lines));
  return entries;
}

export class MemoryStore {
  constructor(private readonly opts: MemoryStoreOpts) {}

  private assertWriter(): void {
    if (this.opts.writerAgent !== MEMORY_KEEPER_AGENT) {
      throw new MemoryWriteForbiddenError(this.opts.writerAgent);
    }
  }

  private file(projectId: string, kind: RegisterKind): string {
    // projectId may come from UI forms; a separator or '..' would let the
    // path escape this.opts.root (path traversal).
    if (
      !projectId ||
      projectId.includes('/') ||
      projectId.includes('\\') ||
      projectId.includes('..')
    ) {
      throw new Error(`invalid projectId for memory store: ${projectId}`);
    }
    return join(this.opts.root, projectId, `${kind}.md`);
  }

  read(projectId: string, kind: RegisterKind): RegisterEntry[] {
    const f = this.file(projectId, kind);
    if (!existsSync(f)) return [];
    return parse(readFileSync(f, 'utf8'));
  }

  /** Raw on-disk Markdown of a register (linkified) — '' when the file is absent. */
  raw(projectId: string, kind: RegisterKind): string {
    const f = this.file(projectId, kind);
    return existsSync(f) ? readFileSync(f, 'utf8') : '';
  }

  private nextId(projectId: string, kind: RegisterKind): string {
    if (kind === 'journal') return today();
    const prefix = PREFIX[kind];
    const n = this.read(projectId, kind).length + 1;
    return `${prefix}-${String(n).padStart(3, '0')}`;
  }

  append(projectId: string, kind: RegisterKind, entry: NewEntry): RegisterEntry {
    this.assertWriter();
    const existing = this.read(projectId, kind);
    const links = (entry.links ?? []).filter((l) => l.trim().length > 0);
    const body = links.length > 0 ? `${entry.body.trim()}\n\nRelated: ${links.join(', ')}` : entry.body;
    const created: RegisterEntry = {
      id: this.nextId(projectId, kind),
      title: entry.title,
      body,
      date: entry.date ?? today(),
      source: entry.source,
    };
    const all = [...existing, created];
    const f = this.file(projectId, kind);
    mkdirSync(join(this.opts.root, projectId), { recursive: true });
    writeFileSync(f, serialize(all), 'utf8');
    return created;
  }

  private knowledgeDir(): string {
    return join(this.opts.root, GLOBAL_PROJECT, 'knowledge');
  }

  private knowledgeFile(source: string): string {
    const flat = source.replace(/[/\\]/g, '__');
    return join(this.knowledgeDir(), flat.endsWith('.md') ? flat : `${flat}.md`);
  }

  hasKnowledge(source: string): boolean {
    return existsSync(this.knowledgeFile(source));
  }

  /**
   * Persist one knowledge file under _global/knowledge/ with source provenance.
   * The provenance comment lands AFTER a YAML frontmatter block when one is
   * present — a leading comment would make the frontmatter invisible to any
   * `---`-first parser (gray-matter), which is exactly the bug this fixes.
   */
  writeKnowledge(source: string, body: string): void {
    this.assertWriter();
    mkdirSync(this.knowledgeDir(), { recursive: true });
    writeFileSync(this.knowledgeFile(source), withProvenance(source, body), 'utf8');
  }

  /** Seeded knowledge as retriever docs (one per file, scope=global). */
  knowledgeDocs(): MemoryDoc[] {
    const dir = this.knowledgeDir();
    if (!existsSync(dir)) return [];
    return readdirSync(dir)
      .filter((f) => f.endsWith('.md'))
      .map((f) => {
        const raw = readFileSync(join(dir, f), 'utf8');
        let source = f;
        let body = raw;
        const lead = /^<!-- source: (.+?) -->\n?/.exec(raw);
        if (lead) {
          source = lead[1]!;
          body = raw.slice(lead[0].length);
        } else if (raw.startsWith('---')) {
          // provenance sits after the frontmatter block (new format)
          const close = raw.indexOf('\n---', 3);
          if (close !== -1) {
            const lineEnd = raw.indexOf('\n', close + 1);
            const after = lineEnd === -1 ? raw.length : lineEnd + 1;
            const m = /^<!-- source: (.+?) -->\n?/.exec(raw.slice(after));
            if (m) {
              source = m[1]!;
              body = raw.slice(0, after) + raw.slice(after + m[0].length);
            }
          }
        }
        return {
          id: `knowledge/${source}`,
          scope: 'global' as MemoryScope,
          source,
          title: source.split(/[/\\]/).pop() ?? source,
          body,
        };
      });
  }

  /** All register entries of one project as retriever docs. */
  toDocs(projectId: string): MemoryDoc[] {
    const scope: MemoryScope = projectId === GLOBAL_PROJECT ? 'global' : 'project';
    const kinds: RegisterKind[] = ['decisions', 'learnings', 'blockers', 'journal', 'evals'];
    const docs: MemoryDoc[] = [];
    for (const kind of kinds) {
      for (const e of this.read(projectId, kind)) {
        docs.push({
          id: `${projectId}/${e.id}`,
          scope,
          source: e.source ?? this.file(projectId, kind),
          title: e.title,
          body: e.body,
        });
      }
    }
    return docs;
  }

  private projectIds(): string[] {
    if (!existsSync(this.opts.root)) return [];
    return readdirSync(this.opts.root, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);
  }

  /** Every entry across all projects + _global registers + seeded knowledge. */
  allDocs(): MemoryDoc[] {
    return [...this.projectIds().flatMap((p) => this.toDocs(p)), ...this.knowledgeDocs()];
  }

  /** Absolute path of the derived, persistent search index (ADR 0003). */
  indexPath(): string {
    return join(this.opts.root, 'index.db');
  }

  /** SHA-256 over all register files + seeded knowledge — the index is derived & rebuilt when this changes (ADR 0003). */
  corpusHash(): string {
    const h = createHash('sha256');
    const kinds: RegisterKind[] = ['decisions', 'learnings', 'blockers', 'journal', 'evals'];
    for (const p of this.projectIds().sort((a, b) => a.localeCompare(b))) {
      for (const kind of kinds) {
        const f = this.file(p, kind);
        if (existsSync(f)) h.update(`${p}/${kind}\n${readFileSync(f, 'utf8')}`);
      }
    }
    // Fold seeded knowledge too — otherwise the hash wouldn't change after a seed
    // and a persistent index would silently go stale (Phase 9 · 0a finding).
    const kdir = this.knowledgeDir();
    if (existsSync(kdir)) {
      for (const f of readdirSync(kdir)
        .filter((n) => n.endsWith('.md'))
        .sort((a, b) => a.localeCompare(b))) {
        h.update(`knowledge/${f}\n${readFileSync(join(kdir, f), 'utf8')}`);
      }
    }
    return h.digest('hex');
  }
}

/** Derive a one-line title from a candidate body. */
function deriveTitle(body: string): string {
  const first = body.split('\n')[0]!.trim();
  return first.length > 80 ? `${first.slice(0, 77)}...` : first;
}

/**
 * Promote a pending memory_candidates row into a register entry. Memory Keeper-owned:
 * the passed store must carry the Keeper identity or the write is rejected.
 */
export async function promoteCandidate(
  db: Db,
  candidateId: string,
  target: { projectId: string; kind: RegisterKind; title?: string },
  store: MemoryStore,
): Promise<RegisterEntry> {
  const [cand] = await db
    .select()
    .from(memoryCandidates)
    .where(eq(memoryCandidates.id, candidateId));
  if (!cand) throw new Error(`memory candidate ${candidateId} not found`);
  if (cand.status !== 'pending') {
    throw new Error(`candidate ${candidateId} is '${cand.status}', not pending — not re-promoted`);
  }

  const entry = store.append(target.projectId, target.kind, {
    title: target.title ?? deriveTitle(cand.body),
    body: cand.body,
    source: `candidate:${candidateId}`,
  });

  await db
    .update(memoryCandidates)
    .set({ status: 'accepted' })
    .where(eq(memoryCandidates.id, candidateId));

  return entry;
}

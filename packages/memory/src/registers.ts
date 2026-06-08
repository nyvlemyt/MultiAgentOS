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
      return `${head}\n${meta.join('\n')}${meta.length ? '\n' : ''}\n${e.body.trim()}\n`;
    })
    .join('\n');
}

function parse(content: string): RegisterEntry[] {
  const chunks = content.split(/^## /m).filter((c) => c.trim().length > 0);
  return chunks.map((chunk) => {
    const lines = chunk.split('\n');
    const header = lines.shift() ?? '';
    const [id, ...titleParts] = header.split(' — ');
    const title = titleParts.join(' — ').trim();
    const entry: RegisterEntry = { id: id!.trim(), title, body: '' };
    let i = 0;
    for (; i < lines.length; i++) {
      const m = /^- (\w+):\s*(.*)$/.exec(lines[i]!);
      if (!m) break;
      if (m[1] === 'date') entry.date = m[2]!.trim();
      if (m[1] === 'source') entry.source = m[2]!.trim();
    }
    entry.body = lines.slice(i).join('\n').trim();
    return entry;
  });
}

export class MemoryStore {
  constructor(private readonly opts: MemoryStoreOpts) {}

  private assertWriter(): void {
    if (this.opts.writerAgent !== MEMORY_KEEPER_AGENT) {
      throw new MemoryWriteForbiddenError(this.opts.writerAgent);
    }
  }

  private file(projectId: string, kind: RegisterKind): string {
    return join(this.opts.root, projectId, `${kind}.md`);
  }

  read(projectId: string, kind: RegisterKind): RegisterEntry[] {
    const f = this.file(projectId, kind);
    if (!existsSync(f)) return [];
    return parse(readFileSync(f, 'utf8'));
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
    const created: RegisterEntry = {
      id: this.nextId(projectId, kind),
      title: entry.title,
      body: entry.body,
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
    return join(this.knowledgeDir(), `${source.replace(/[/\\]/g, '__')}.md`);
  }

  hasKnowledge(source: string): boolean {
    return existsSync(this.knowledgeFile(source));
  }

  /** Persist one knowledge file under _global/knowledge/ with source provenance. */
  writeKnowledge(source: string, body: string): void {
    this.assertWriter();
    mkdirSync(this.knowledgeDir(), { recursive: true });
    writeFileSync(this.knowledgeFile(source), `<!-- source: ${source} -->\n${body}`, 'utf8');
  }

  /** Seeded knowledge as retriever docs (one per file, scope=global). */
  knowledgeDocs(): MemoryDoc[] {
    const dir = this.knowledgeDir();
    if (!existsSync(dir)) return [];
    return readdirSync(dir)
      .filter((f) => f.endsWith('.md'))
      .map((f) => {
        const raw = readFileSync(join(dir, f), 'utf8');
        const m = /^<!-- source: (.+?) -->\n?/.exec(raw);
        const source = m ? m[1]! : f;
        const body = m ? raw.slice(m[0].length) : raw;
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

  /** SHA-256 over all register files — the index is derived & rebuilt when this changes (ADR 0003). */
  corpusHash(): string {
    const h = createHash('sha256');
    const kinds: RegisterKind[] = ['decisions', 'learnings', 'blockers', 'journal', 'evals'];
    for (const p of this.projectIds().sort()) {
      for (const kind of kinds) {
        const f = this.file(p, kind);
        if (existsSync(f)) h.update(`${p}/${kind}\n${readFileSync(f, 'utf8')}`);
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

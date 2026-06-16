import Link from 'next/link';
import { getDb, memoryCandidates } from '@mas/db';
import { and, eq } from 'drizzle-orm';
import type { MemoryDoc, RegisterKind } from '@mas/memory';
import { readStore } from '@/lib/memory';

const KINDS: RegisterKind[] = ['decisions', 'learnings', 'blockers', 'journal', 'evals'];
const SOURCE_KINDS = ['mission', 'note', 'skill', 'pattern', 'repo', 'course'] as const;
type SourceFilter = (typeof SOURCE_KINDS)[number];

export const dynamic = 'force-dynamic';

export default async function MemoryCenter({
  searchParams,
}: Readonly<{ searchParams: Promise<{ source?: string }> }>) {
  const { source } = await searchParams;
  const sourceFilter = SOURCE_KINDS.includes(source as SourceFilter)
    ? (source as SourceFilter)
    : undefined;

  const db = getDb();
  const pending = await db
    .select()
    .from(memoryCandidates)
    .where(
      sourceFilter
        ? and(eq(memoryCandidates.status, 'pending'), eq(memoryCandidates.sourceKind, sourceFilter))
        : eq(memoryCandidates.status, 'pending'),
    )
    .orderBy(memoryCandidates.createdAt);

  let docs: MemoryDoc[] = [];
  try {
    docs = readStore().allDocs();
  } catch {
    docs = [];
  }
  const global = docs.filter((d) => d.scope === 'global');
  const project = docs.filter((d) => d.scope === 'project');

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>Centre de mémoire</h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Seul le Memory Keeper écrit ici. « Accepter » promeut un candidat en entrée de registre.</p>
      </header>

      <section className="surface p-4">
        <header className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Boîte de candidats</h2>
          <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{pending.length} pending</span>
        </header>
        <nav aria-label="Filtre par source" className="mb-3 flex flex-wrap items-center gap-1 text-[10px]">
          <Link
            href="/memory"
            className="mono rounded-sm px-1.5 py-0.5"
            style={{
              background: sourceFilter ? 'var(--bg-hover)' : 'var(--accent)',
              color: sourceFilter ? 'var(--text-secondary)' : '#fff',
            }}
          >
            all sources
          </Link>
          {SOURCE_KINDS.map((s) => (
            <Link
              key={s}
              href={`/memory?source=${s}`}
              className="mono rounded-sm px-1.5 py-0.5"
              style={{
                background: sourceFilter === s ? 'var(--accent)' : 'var(--bg-hover)',
                color: sourceFilter === s ? '#fff' : 'var(--text-secondary)',
              }}
            >
              {s}
            </Link>
          ))}
        </nav>
        {pending.length === 0 ? (
          <p className="px-1 py-4 text-xs" style={{ color: 'var(--text-muted)' }}>
            Aucun candidat en attente. Sessions emit them via the close-out ritual (<code className="mono">captureCandidates</code>).
          </p>
        ) : (
          <ul className="space-y-2">
            {pending.map((c) => (
              <li key={c.id} className="surface flex flex-col gap-2 px-3 py-2 text-xs">
                <div>
                  <span className="mono mr-2 rounded-sm px-1.5 py-0.5 text-[10px]" style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}>{c.type}</span>
                  {c.sourceKind && (
                    <span className="mono mr-2 rounded-sm px-1.5 py-0.5 text-[10px]" style={{ background: 'var(--bg-hover)', color: 'var(--accent)' }}>{c.sourceKind}</span>
                  )}
                  <span style={{ color: 'var(--text-primary)' }}>{c.body}</span>
                </div>
                <div className="flex flex-wrap items-center gap-1">
                  <form method="POST" action="/api/memory/promote" className="flex items-center gap-1">
                    <input type="hidden" name="id" value={c.id} />
                    <input name="projectId" defaultValue="_global" placeholder="projectId" className="mono w-28 rounded px-1.5 py-0.5 text-[10px]" style={{ background: 'var(--bg-hover)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }} />
                    <select name="kind" defaultValue="learnings" className="mono rounded px-1.5 py-0.5 text-[10px]" style={{ background: 'var(--bg-hover)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}>
                      {KINDS.map((k) => <option key={k} value={k}>{k}</option>)}
                    </select>
                    <button type="submit" className="rounded-md px-2 py-0.5 text-[10px] text-white" style={{ background: 'var(--success)' }}>Accept</button>
                  </form>
                  <form method="POST" action="/api/memory/reject">
                    <input type="hidden" name="id" value={c.id} />
                    <button type="submit" className="rounded-md px-2 py-0.5 text-[10px]" style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}>Reject</button>
                  </form>
                </div>
                <details>
                  <summary className="cursor-pointer text-[10px]" style={{ color: 'var(--text-muted)' }}>Edit body</summary>
                  <form method="POST" action="/api/memory/edit" className="mt-1 flex flex-col gap-1">
                    <input type="hidden" name="id" value={c.id} />
                    <textarea name="body" defaultValue={c.body} rows={3} className="mono w-full rounded px-2 py-1 text-[11px]" style={{ background: 'var(--bg-hover)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }} />
                    <button type="submit" className="self-start rounded-md px-2 py-0.5 text-[10px]" style={{ background: 'var(--accent)', color: '#fff' }}>Save</button>
                  </form>
                </details>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Column title="Global memory" items={global} />
        <Column title="Project memory" items={project} />
      </section>
    </div>
  );
}

function Column({ title, items }: Readonly<{ title: string; items: MemoryDoc[] }>) {
  return (
    <article className="surface p-4">
      <header className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold">{title}</h2>
        <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{items.length}</span>
      </header>
      {items.length === 0 ? (
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Empty.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((i) => (
            <li key={i.id} className="surface px-3 py-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="mono rounded-sm px-1.5 py-0.5 text-[10px]" style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}>{i.id}</span>
                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{i.title}</span>
              </div>
              <p className="mt-1 line-clamp-3" style={{ color: 'var(--text-muted)' }}>{i.body}</p>
              {i.source && <p className="mono mt-1 text-[10px]" style={{ color: 'var(--text-muted)' }}>source: {i.source}</p>}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

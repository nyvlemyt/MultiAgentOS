import { memoryGlobal, memoryProject, memoryCandidates } from '@/lib/fixtures';

export default function MemoryCenter() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>Memory Center</h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Only the Memory Keeper writes here. Phase 4 enables editing.</p>
      </header>

      <section className="surface p-4">
        <header className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Candidate inbox</h2>
          <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{memoryCandidates.length} pending</span>
        </header>
        <ul className="space-y-2">
          {memoryCandidates.map((c) => (
            <li key={c.id} className="surface flex items-center justify-between gap-3 px-3 py-2 text-xs">
              <div>
                <span className="mono mr-2 rounded-sm px-1.5 py-0.5 text-[10px]" style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}>{c.type}</span>
                <span style={{ color: 'var(--text-primary)' }}>{c.title}</span>
                <span className="ml-2" style={{ color: 'var(--text-muted)' }}>· {c.body}</span>
              </div>
              <div className="flex gap-1">
                <button className="rounded-md px-2 py-0.5 text-[10px] text-white" style={{ background: 'var(--success)' }}>Accept</button>
                <button className="rounded-md px-2 py-0.5 text-[10px]" style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}>Reject</button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Column title="Global memory" items={memoryGlobal} />
        <Column title="Project memory · OtakuGO_UP" items={memoryProject} />
      </section>
    </div>
  );
}

function Column({ title, items }: Readonly<{ title: string; items: { id: string; type: string; title: string; body: string }[] }>) {
  return (
    <article className="surface p-4">
      <h2 className="mb-3 text-sm font-semibold">{title}</h2>
      <ul className="space-y-2">
        {items.map((i) => (
          <li key={i.id} className="surface px-3 py-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="mono rounded-sm px-1.5 py-0.5 text-[10px]" style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}>{i.type}</span>
              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{i.title}</span>
            </div>
            <p className="mt-1" style={{ color: 'var(--text-muted)' }}>{i.body}</p>
          </li>
        ))}
      </ul>
    </article>
  );
}

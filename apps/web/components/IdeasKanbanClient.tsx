'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export type IdeaStatus = 'inbox' | 'to_clarify' | 'prioritized' | 'converted' | 'archived';

export interface BoardIdea {
  id: string;
  title: string;
  status: IdeaStatus;
  scope: 'global' | 'project';
  priorityScore: number;
  ideaIdLink: string | null;
}

const COLUMNS: { key: IdeaStatus; title: string }[] = [
  { key: 'inbox', title: 'Inbox' },
  { key: 'to_clarify', title: 'To clarify' },
  { key: 'prioritized', title: 'Prioritized' },
  { key: 'converted', title: 'Converted' },
  { key: 'archived', title: 'Archived' },
];

export function IdeasKanbanClient({ ideas }: Readonly<{ ideas: BoardIdea[] }>) {
  const router = useRouter();
  const [hoverCol, setHoverCol] = useState<IdeaStatus | null>(null);
  const [title, setTitle] = useState('');
  const [busy, setBusy] = useState(false);

  async function createIdea() {
    if (!title.trim()) return;
    setBusy(true);
    const res = await fetch('/api/ideas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: title.trim() }),
    });
    setBusy(false);
    if (res.ok) {
      setTitle('');
      router.refresh();
    }
  }

  async function moveIdea(id: string, to: IdeaStatus) {
    const res = await fetch(`/api/ideas/${id}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: to }),
    });
    if (res.ok) router.refresh();
  }

  async function convert(id: string) {
    const res = await fetch(`/api/ideas/${id}/convert`, { method: 'POST' });
    if (res.ok) router.refresh();
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <input
          aria-label="New idea title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') createIdea(); }}
          placeholder="Capture an idea…"
          className="flex-1 rounded-md border px-3 py-2 text-sm"
          style={{ borderColor: 'var(--border-default)', background: 'var(--bg-base)', color: 'var(--text-primary)' }}
        />
        <button
          type="button"
          onClick={createIdea}
          disabled={busy}
          className="rounded-md px-3 py-2 text-xs font-medium text-white"
          style={{ background: 'var(--accent)' }}
        >
          Add idea
        </button>
      </div>

      <div className="flex flex-1 gap-3 overflow-x-auto pb-4">
        {COLUMNS.map((col) => {
          const cards = ideas.filter((i) => i.status === col.key);
          return (
            <section
              key={col.key}
              className="flex h-full min-w-[220px] flex-col gap-2"
              onDragOver={(e) => { e.preventDefault(); setHoverCol(col.key); }}
              onDragLeave={() => setHoverCol(null)}
              onDrop={(e) => {
                e.preventDefault();
                setHoverCol(null);
                const id = e.dataTransfer.getData('text/idea-id');
                if (id) moveIdea(id, col.key);
              }}
            >
              <header className="flex items-center justify-between px-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>{col.title}</span>
                <span className="mono tabular-nums text-[10px]" style={{ color: 'var(--text-muted)' }}>{cards.length}</span>
              </header>
              <div
                className="flex flex-1 flex-col gap-2 rounded-lg p-1.5"
                style={{
                  background: 'var(--bg-base)',
                  border: '1px dashed var(--border-subtle)',
                  outline: hoverCol === col.key ? '2px solid var(--accent)' : 'none',
                }}
              >
                {cards.map((i) => (
                  <article
                    key={i.id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/idea-id', i.id);
                      e.dataTransfer.effectAllowed = 'move';
                    }}
                    data-testid="idea-card"
                    data-idea-id={i.id}
                    className="surface flex flex-col gap-2 px-3 py-3"
                    style={{ cursor: 'grab' }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-medium leading-tight" style={{ color: 'var(--text-primary)' }}>{i.title}</span>
                      <span className="mono tabular-nums text-[10px]" style={{ color: 'var(--text-muted)' }}>{i.priorityScore}</span>
                    </div>
                    {i.status !== 'converted' ? (
                      <button
                        type="button"
                        onClick={() => convert(i.id)}
                        className="rounded-md border px-2 py-1 text-[10px] font-medium"
                        style={{ borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}
                      >
                        Convert to mission
                      </button>
                    ) : (
                      i.ideaIdLink && (
                        <a href={`/missions/${i.ideaIdLink}`} className="text-[10px]" style={{ color: 'var(--accent)' }}>
                          → mission
                        </a>
                      )
                    )}
                  </article>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

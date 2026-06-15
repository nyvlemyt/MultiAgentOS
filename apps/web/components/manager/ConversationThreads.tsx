'use client';
import Link from 'next/link';
import { Plus, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/cn';

export type ThreadItem = { id: string; title: string };

// Claude-Code-style thread switcher: list past conversations + start a new one.
export function ConversationThreads({
  threads,
  activeId,
  basePath,
  onNew,
}: Readonly<{ threads: ThreadItem[]; activeId: string; basePath: string; onNew: () => void }>) {
  return (
    <div className="surface flex max-h-[60vh] w-52 shrink-0 flex-col overflow-hidden">
      <form action={onNew} className="p-2">
        <button type="submit" className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold" style={{ background: 'linear-gradient(135deg,var(--accent),var(--accent-dim))', color: '#04141a' }}>
          <Plus size={13} /> Nouvelle conversation
        </button>
      </form>
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        <div className="mono px-1 pb-1 text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>conversations</div>
        {threads.length === 0 ? (
          <p className="px-1 text-[11px]" style={{ color: 'var(--text-muted)' }}>aucune encore</p>
        ) : (
          <ul className="flex flex-col gap-0.5">
            {threads.map((t) => {
              const active = t.id === activeId;
              return (
                <li key={t.id}>
                  <Link
                    href={`${basePath}?c=${t.id}`}
                    className={cn(
                      'flex items-center gap-2 rounded-md px-2 py-1.5 text-[11px] transition-colors',
                      active ? 'bg-[color:var(--accent-soft)] text-[color:var(--accent)]' : 'text-[color:var(--text-secondary)] hover:bg-[color:var(--bg-hover)]',
                    )}
                  >
                    <MessageSquare size={12} className="shrink-0" />
                    <span className="truncate">{t.title || 'Nouvelle conversation'}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

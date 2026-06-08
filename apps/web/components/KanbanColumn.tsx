import type { ReactNode } from 'react';

export function KanbanColumn({ title, count, children }: Readonly<{ title: string; count: number; children: ReactNode }>) {
  return (
    <section className="flex h-full min-w-[240px] flex-col gap-2">
      <header className="flex items-center justify-between px-1">
        <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>{title}</span>
        <span className="mono tabular-nums text-[10px]" style={{ color: 'var(--text-muted)' }}>{count}</span>
      </header>
      <div className="flex flex-1 flex-col gap-2 rounded-lg p-1.5" style={{ background: 'var(--bg-base)', border: '1px dashed var(--border-subtle)' }}>
        {children}
      </div>
    </section>
  );
}

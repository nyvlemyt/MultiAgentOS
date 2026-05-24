'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { RiskBadge } from './RiskBadge';
import { BudgetBar } from './BudgetBar';

export type BoardStatus =
  | 'draft'
  | 'clarified'
  | 'planned'
  | 'dispatched'
  | 'executing'
  | 'review'
  | 'validated'
  | 'archived';

export interface BoardMission {
  id: string;
  title: string;
  status: BoardStatus;
  risk: 'low' | 'medium' | 'high' | 'blocking';
  budgetSpent: number;
  budgetCap: number;
}

const COLUMNS: { key: string; title: string; statuses: BoardStatus[]; dragTo?: BoardStatus }[] = [
  { key: 'inbox', title: 'Inbox', statuses: ['draft'], dragTo: 'draft' },
  { key: 'clarify', title: 'To clarify', statuses: ['clarified'], dragTo: 'clarified' },
  { key: 'planned', title: 'Planned', statuses: ['planned'], dragTo: 'planned' },
  { key: 'in-progress', title: 'In progress', statuses: ['dispatched', 'executing'] },
  { key: 'review', title: 'Review', statuses: ['review'] },
  { key: 'ready', title: 'Ready to validate', statuses: ['validated'] },
  { key: 'done', title: 'Done', statuses: ['archived'] },
];

export function MissionsBoardClient({ missions }: { missions: BoardMission[] }) {
  const router = useRouter();
  const [hoverCol, setHoverCol] = useState<string | null>(null);

  async function moveMission(id: string, to: BoardStatus) {
    const res = await fetch(`/api/missions/${id}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: to }),
    });
    if (res.ok) router.refresh();
  }

  return (
    <div className="flex flex-1 gap-3 overflow-x-auto pb-4">
      {COLUMNS.map((col) => {
        const cards = missions.filter((m) => col.statuses.includes(m.status));
        const droppable = col.dragTo != null;
        return (
          <section
            key={col.key}
            className="flex h-full min-w-[240px] flex-col gap-2"
            onDragOver={(e) => {
              if (!droppable) return;
              e.preventDefault();
              setHoverCol(col.key);
            }}
            onDragLeave={() => setHoverCol(null)}
            onDrop={(e) => {
              if (!droppable || !col.dragTo) return;
              e.preventDefault();
              setHoverCol(null);
              const id = e.dataTransfer.getData('text/mission-id');
              if (id) moveMission(id, col.dragTo);
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
              {cards.map((m) => (
                <Link
                  key={m.id}
                  href={`/missions/${m.id}`}
                  draggable={droppable}
                  onDragStart={(e) => {
                    if (!droppable) return;
                    e.dataTransfer.setData('text/mission-id', m.id);
                    e.dataTransfer.effectAllowed = 'move';
                  }}
                  data-testid="mission-card"
                  data-mission-id={m.id}
                  className="surface flex flex-col gap-2 px-3 py-3 transition-colors hover:bg-[color:var(--bg-hover)]"
                  style={{ cursor: droppable ? 'grab' : 'pointer' }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-medium leading-tight" style={{ color: 'var(--text-primary)' }}>{m.title}</span>
                    <RiskBadge risk={m.risk} />
                  </div>
                  <BudgetBar spent={m.budgetSpent} cap={m.budgetCap} />
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

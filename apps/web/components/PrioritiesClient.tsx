'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';

export interface PriorityMission {
  id: string;
  title: string;
  priorityScore: number;
  budgetTokens: number;
  deadline: string | null;
}

function PriorityRow({ m }: Readonly<{ m: PriorityMission }>) {
  const router = useRouter();
  const [score, setScore] = useState(m.priorityScore);

  async function persist(value: number) {
    await fetch(`/api/missions/${m.id}/priority`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priorityScore: value }),
    });
    router.refresh();
  }

  return (
    <li className="surface flex items-center gap-4 px-4 py-3" data-testid="priority-row" data-mission-id={m.id}>
      <span className="mono w-8 tabular-nums text-sm font-semibold" style={{ color: 'var(--accent)' }} data-testid="priority-score">{score}</span>
      <Link href={`/missions/${m.id}`} className="min-w-0 flex-1 truncate text-sm" style={{ color: 'var(--text-primary)' }}>{m.title}</Link>
      {m.deadline && <span className="mono text-[10px]" style={{ color: 'var(--text-muted)' }}>{m.deadline}</span>}
      <span className="mono text-[10px]" style={{ color: 'var(--text-muted)' }}>{m.budgetTokens} tok</span>
      <input
        type="range"
        min={0}
        max={100}
        value={score}
        aria-label={`Priority for ${m.title}`}
        onChange={(e) => setScore(Number(e.target.value))}
        onMouseUp={(e) => persist(Number((e.target as HTMLInputElement).value))}
        onTouchEnd={(e) => persist(Number((e.target as HTMLInputElement).value))}
        className="w-40"
      />
    </li>
  );
}

export function PrioritiesClient({ missions }: Readonly<{ missions: PriorityMission[] }>) {
  if (missions.length === 0) {
    return <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No missions to prioritize.</p>;
  }
  return (
    <ul className="flex flex-col gap-2">
      {missions.map((m) => <PriorityRow key={m.id} m={m} />)}
    </ul>
  );
}

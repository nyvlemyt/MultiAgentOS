'use client';
import { useState } from 'react';
import { cn } from '@/lib/cn';

type Mode = 'eco' | 'standard' | 'expert';
const order: Mode[] = ['eco', 'standard', 'expert'];

export function ModePill({ defaultMode = 'eco' }: Readonly<{ defaultMode?: Mode }>) {
  const [mode, setMode] = useState<Mode>(defaultMode);
  return (
    <div className="inline-flex items-center gap-0.5 rounded-md p-0.5 text-[11px] font-medium" style={{ background: 'var(--bg-hover)' }}>
      {order.map((m) => (
        <button
          key={m}
          type="button"
          onClick={() => setMode(m)}
          className={cn('rounded px-2 py-0.5 capitalize transition-colors', mode === m ? 'bg-[color:var(--accent)] text-white' : 'text-[color:var(--text-secondary)]')}
        >
          {m}
        </button>
      ))}
    </div>
  );
}

export function AutonomyPill({ value }: Readonly<{ value: 'manual' | 'assisted' | 'autonomous' | 'autopilot' }>) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium capitalize" style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--accent)' }} />
      {value}
    </span>
  );
}

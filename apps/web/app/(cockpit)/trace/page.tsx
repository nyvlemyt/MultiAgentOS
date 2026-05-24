'use client';
import { useEffect, useState } from 'react';
import { Timeline, type TimelineRow } from '@/components/Timeline';
import { trace as seed } from '@/lib/fixtures';

export default function TracePage() {
  const [rows, setRows] = useState<TimelineRow[]>(seed);

  useEffect(() => {
    const ev = new EventSource('/api/stream');
    ev.addEventListener('tick', (e) => {
      try {
        const payload = JSON.parse((e as MessageEvent).data) as { id: string; type: string; at: string };
        const row: TimelineRow = {
          id: payload.id,
          ts: payload.at.slice(11, 19),
          agent: 'worker',
          action: 'tick',
          tokens: 0,
          risk: 'low',
        };
        setRows((rs) => [row, ...rs].slice(0, 60));
      } catch {}
    });
    ev.onerror = () => ev.close();
    return () => ev.close();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>Trace</h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Append-only event log · live SSE from worker · {rows.length} events visible</p>
      </header>
      <Timeline rows={rows} />
    </div>
  );
}

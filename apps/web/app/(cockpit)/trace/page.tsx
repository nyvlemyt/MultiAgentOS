'use client';
import { useEffect, useState } from 'react';
import { Timeline, type TimelineRow } from '@/components/Timeline';

export default function TracePage() {
  const [rows, setRows] = useState<TimelineRow[]>([]);

  useEffect(() => {
    const ev = new EventSource('/api/stream');

    ev.addEventListener('event', (e) => {
      try {
        const p = JSON.parse((e as MessageEvent).data) as {
          id: string;
          missionId?: string | null;
          taskId?: string | null;
          agentId?: string | null;
          type: string;
          tokens: number;
          risk: 'low' | 'medium' | 'high' | 'blocking';
          at: string;
        };
        const row: TimelineRow = {
          id: p.id,
          ts: p.at.slice(11, 19),
          agent: p.agentId ?? 'system',
          action: p.type,
          tokens: p.tokens,
          risk: p.risk,
        };
        setRows((rs) => [row, ...rs].slice(0, 100));
      } catch {}
    });

    ev.onerror = () => ev.close();
    return () => ev.close();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>Trace</h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Append-only event log · live SSE from the DB · {rows.length} events visible</p>
      </header>
      {rows.length === 0 ? (
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Subscribed. Waiting for events…</p>
      ) : (
        <Timeline rows={rows} />
      )}
    </div>
  );
}

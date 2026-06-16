'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export interface DecisionView {
  id: string;
  title: string;
  body: string;
  source: string;
  createdAt: string;
}

/**
 * Decision Log widget. Lists recent decisions and (when `canLog`) lets the user
 * log one manually. MVP is manual-only — no memory writer (§8 intact).
 */
export function DecisionLog({
  decisions,
  projectId,
  missionId,
  canLog = true,
  compact = false,
}: Readonly<{ decisions: DecisionView[]; projectId?: string; missionId?: string; canLog?: boolean; compact?: boolean }>) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [busy, setBusy] = useState(false);

  async function log() {
    if (!title.trim()) return;
    setBusy(true);
    const res = await fetch('/api/decisions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: title.trim(), projectId, sourceMissionId: missionId }),
    });
    setBusy(false);
    if (res.ok) { setTitle(''); router.refresh(); }
  }

  return (
    <div className="flex flex-col gap-2">
      {decisions.length === 0 ? (
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Aucune décision enregistrée.</p>
      ) : (
        <ul className="space-y-1.5" data-testid="decision-list">
          {decisions.map((d) => (
            <li key={d.id} className="text-xs" data-testid="decision-item">
              <span style={{ color: 'var(--text-primary)' }}>{d.title}</span>
              {!compact && <span className="ml-1 mono text-[10px]" style={{ color: 'var(--text-muted)' }}>· {d.source}</span>}
            </li>
          ))}
        </ul>
      )}
      {canLog && (
        <div className="mt-1 flex gap-1.5">
          <input
            aria-label="Log a decision"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') log(); }}
            placeholder="Note une décision…"
            className="flex-1 rounded-md border px-2 py-1 text-[11px]"
            style={{ borderColor: 'var(--border-default)', background: 'var(--bg-base)', color: 'var(--text-primary)' }}
          />
          <button
            type="button"
            onClick={log}
            disabled={busy}
            className="rounded-md px-2 py-1 text-[10px] font-medium text-white"
            style={{ background: 'var(--accent)' }}
          >
            Log
          </button>
        </div>
      )}
    </div>
  );
}

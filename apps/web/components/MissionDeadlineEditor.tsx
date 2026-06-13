'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

/** Deadline (date) + milestone (free-form) editor for a mission. */
export function MissionDeadlineEditor({
  id,
  deadline,
  milestone,
}: Readonly<{ id: string; deadline: string | null; milestone: string | null }>) {
  const router = useRouter();
  const [dl, setDl] = useState(deadline ?? '');
  const [ms, setMs] = useState(milestone ?? '');
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    const res = await fetch(`/api/missions/${id}/meta`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deadline: dl || null, milestone: ms || null }),
    });
    setBusy(false);
    if (res.ok) router.refresh();
  }

  return (
    <div className="flex flex-wrap items-end gap-2">
      <label className="flex flex-col gap-1 text-[11px]" style={{ color: 'var(--text-muted)' }}>
        Deadline
        <input
          type="date"
          aria-label="Mission deadline"
          value={dl}
          onChange={(e) => setDl(e.target.value)}
          className="rounded-md border px-2 py-1 text-xs"
          style={{ borderColor: 'var(--border-default)', background: 'var(--bg-base)', color: 'var(--text-primary)' }}
        />
      </label>
      <label className="flex flex-col gap-1 text-[11px]" style={{ color: 'var(--text-muted)' }}>
        Milestone
        <input
          type="text"
          aria-label="Mission milestone"
          value={ms}
          onChange={(e) => setMs(e.target.value)}
          placeholder="e.g. v1 launch"
          className="rounded-md border px-2 py-1 text-xs"
          style={{ borderColor: 'var(--border-default)', background: 'var(--bg-base)', color: 'var(--text-primary)' }}
        />
      </label>
      <button
        type="button"
        onClick={save}
        disabled={busy}
        className="rounded-md px-3 py-1.5 text-xs font-medium text-white"
        style={{ background: 'var(--accent)' }}
      >
        Save
      </button>
    </div>
  );
}

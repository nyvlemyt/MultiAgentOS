'use client';
import { useState, useTransition } from 'react';
import { toggleAgentSkill } from '@/app/(cockpit)/agent-config-actions';
import type { SkillToggle } from '@/lib/agent-config-rules';

export function SkillsTab({
  editable,
  agentId,
  projectId,
  skills,
}: Readonly<{ editable: boolean; agentId: string; projectId?: string; skills: SkillToggle[] }>) {
  const [rows, setRows] = useState(skills);
  const [pending, start] = useTransition();

  function toggle(id: string, on: boolean) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, enabled: on } : r)));
    start(async () => {
      await toggleAgentSkill(agentId, projectId!, id, on);
    });
  }

  if (!editable) {
    const enabled = rows.filter((r) => r.enabled);
    return (
      <div className="flex flex-col gap-2 text-xs">
        <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Skills routés vers cet agent (lecture seule — édite sur la page projet).</p>
        {enabled.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>Aucun skill activé par défaut.</p>
        ) : (
          <div className="flex flex-wrap gap-1">
            {enabled.map((s) => (
              <span key={s.id} className="mono rounded-sm px-1.5 py-0.5 text-[10px]" style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}>{s.id}</span>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-1.5">
      {rows.map((s) => (
        <li key={s.id}>
          <label className="flex cursor-pointer items-center justify-between gap-2 rounded-md px-2 py-1.5 text-xs" style={{ background: 'var(--bg-hover)' }}>
            <span className="mono truncate" style={{ color: 'var(--text-secondary)' }}>{s.id}</span>
            <input
              type="checkbox"
              checked={s.enabled}
              disabled={pending}
              onChange={(e) => toggle(s.id, e.target.checked)}
              className="h-3.5 w-3.5 shrink-0 accent-[color:var(--accent)]"
            />
          </label>
        </li>
      ))}
    </ul>
  );
}

'use client';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';

type Status =
  | 'draft'
  | 'clarified'
  | 'planned'
  | 'dispatched'
  | 'executing'
  | 'review'
  | 'validated'
  | 'archived'
  | 'blocked';

export function MissionActions({ id, status }: Readonly<{ id: string; status: Status }>) {
  const [pending, start] = useTransition();
  const router = useRouter();

  async function call(path: string) {
    start(async () => {
      await fetch(path, { method: 'POST' });
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Btn
        disabled={pending || status !== 'draft'}
        onClick={() => call(`/api/missions/${id}/plan`)}
        label={status === 'draft' ? 'Plan mission' : 'Planned ✓'}
      />
      <Btn
        disabled={pending || status !== 'planned'}
        onClick={() => call(`/api/missions/${id}/run`)}
        label={status === 'dispatched' || status === 'executing' ? 'Running…' : 'Run mission'}
        primary
      />
      <Btn
        disabled={pending || status !== 'validated'}
        onClick={() => call(`/api/missions/${id}/archive`)}
        label={status === 'archived' ? 'Archived ✓' : 'Archive'}
      />
      <span className="ml-auto rounded-md px-2 py-0.5 text-[10px] uppercase tracking-wider" style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }} data-testid="mission-status">
        {status}
      </span>
    </div>
  );
}

function Btn({ label, onClick, disabled, primary }: Readonly<{ label: string; onClick: () => void; disabled?: boolean; primary?: boolean }>) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-md px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-40"
      style={{
        background: primary ? 'var(--accent)' : 'var(--bg-hover)',
        color: primary ? '#fff' : 'var(--text-primary)',
        border: primary ? 'none' : '1px solid var(--border-default)',
      }}
    >
      {label}
    </button>
  );
}

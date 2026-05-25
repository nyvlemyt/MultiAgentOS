'use client';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { RiskBadge } from './RiskBadge';

export interface PendingValidation {
  id: string;
  taskId: string;
  taskTitle: string;
  risk: 'low' | 'medium' | 'high' | 'blocking';
  actionSummary: string;
}

export function ValidationModal({ pending }: { pending: PendingValidation[] }) {
  const [busy, start] = useTransition();
  const router = useRouter();

  if (pending.length === 0) return null;

  async function decide(id: string, approve: boolean) {
    start(async () => {
      await fetch(`/api/validations/${id}/decide`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approve }),
      });
      router.refresh();
    });
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Pending validations"
      className="fixed inset-0 z-50 flex items-end justify-end p-6"
      style={{ pointerEvents: 'none' }}
    >
      <div className="surface-elevated max-w-md w-full p-4 shadow-2xl" style={{ pointerEvents: 'auto' }}>
        <header className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Pending validation{pending.length > 1 ? `s (${pending.length})` : ''}
          </h2>
        </header>
        <ul className="space-y-3">
          {pending.map((v) => (
            <li key={v.id} className="surface flex flex-col gap-2 p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{v.taskTitle}</div>
                  <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{v.actionSummary}</div>
                </div>
                <RiskBadge risk={v.risk} />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => decide(v.id, false)}
                  className="rounded-md px-3 py-1 text-xs"
                  style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}
                >
                  Reject
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => decide(v.id, true)}
                  className="rounded-md px-3 py-1 text-xs font-medium text-white"
                  style={{ background: 'var(--success)' }}
                >
                  Approve
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

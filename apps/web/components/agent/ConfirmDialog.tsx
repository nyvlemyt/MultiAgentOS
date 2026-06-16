'use client';
import { AlertTriangle } from 'lucide-react';

// Reusable confirm gate for §5-habit actions (autonomy/budget raise, fiche save,
// restore). Rendered only when `open`; the caller owns the open/busy state.
export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  busy,
  onConfirm,
  onCancel,
}: Readonly<{
  open: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}>) {
  if (!open) return null;
  return (
    <dialog open aria-label={title} className="fixed inset-0 z-50 m-0 flex h-full w-full max-w-none items-center justify-center border-0 bg-black/40 p-6">
      <div className="surface-elevated w-full max-w-sm p-4 shadow-2xl">
        <header className="mb-2 flex items-center gap-2">
          <AlertTriangle size={15} style={{ color: 'var(--warning, #d9a441)' }} />
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</h2>
        </header>
        <p className="mb-4 text-xs" style={{ color: 'var(--text-secondary)' }}>{body}</p>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={onCancel}
            className="rounded-md px-3 py-1.5 text-xs disabled:opacity-40"
            style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}
          >
            Annuler
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onConfirm}
            className="rounded-md px-3 py-1.5 text-xs font-semibold disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg,var(--accent),var(--accent-dim))', color: '#04141a' }}
          >
            {busy ? '…' : confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}

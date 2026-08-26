import Link from 'next/link';
import { Info, OctagonAlert, TriangleAlert } from 'lucide-react';
import type { Alert, AlertSeverity } from '@/lib/alerts';

// C12 — LE composant d'alerte du cockpit. Aucun autre fichier n'a le droit de
// rendre une alerte : le portique scripts/lint-alert-render.sh le vérifie dans
// `pnpm lint`. Une alerte `null` ne rend RIEN (aucun fait ⇒ aucune alerte).

const TONE: Record<AlertSeverity, { color: string; Icon: typeof Info }> = {
  info: { color: 'var(--accent)', Icon: Info },
  warning: { color: 'var(--warning)', Icon: TriangleAlert },
  danger: { color: 'var(--danger)', Icon: OctagonAlert },
};

export function AlertBanner({ alert, testId }: Readonly<{ alert: Alert | null; testId?: string }>) {
  if (alert === null) return null;
  const { color, Icon } = TONE[alert.severity];
  return (
    <output
      data-testid={testId ?? 'alert-banner'}
      data-severity={alert.severity}
      className="surface flex items-start gap-3 p-3.5"
      style={{ borderColor: color, background: 'var(--bg-hover)' }}
    >
      <Icon size={18} className="mt-0.5 shrink-0" style={{ color }} />
      <div className="min-w-0">
        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{alert.what}</p>
        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{alert.why}</p>
        <Link href={alert.route} className="text-xs font-medium underline-offset-2 hover:underline" style={{ color }}>
          {alert.action}
        </Link>
      </div>
    </output>
  );
}

export function AlertBadge({ alert, testId }: Readonly<{ alert: Alert | null; testId?: string }>) {
  if (alert === null) return null;
  const { color } = TONE[alert.severity];
  return (
    <span
      data-testid={testId ?? 'alert-badge'}
      data-severity={alert.severity}
      title={`${alert.why} ${alert.action}`}
      className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium"
      style={{ background: 'var(--bg-hover)', color }}
    >
      <span aria-hidden="true">●</span>
      <span>{alert.what}</span>
    </span>
  );
}

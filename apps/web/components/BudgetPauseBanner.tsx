import { OctagonAlert } from 'lucide-react';
import type { BudgetPause } from '@/lib/autopilot';

const WINDOW_LABEL: Record<BudgetPause['window'], string> = {
  day: 'journalier',
  week: 'hebdomadaire',
  month: 'mensuel',
};

/**
 * Visible "dispatch paused" indicator (CLAUDE.md §6 pause+ask). Surface only —
 * no acknowledge/resume action; the user raises the cap to continue.
 */
export function BudgetPauseBanner({ pause }: Readonly<{ pause: BudgetPause | null }>) {
  if (!pause) return null;
  const label = WINDOW_LABEL[pause.window];
  return (
    <section
      data-testid="budget-pause-banner"
      className="surface flex items-start gap-3 p-3.5"
      style={{ borderColor: 'var(--danger)', background: 'var(--bg-hover)' }}
    >
      <OctagonAlert size={18} className="mt-0.5 shrink-0" style={{ color: 'var(--danger)' }} />
      <div className="min-w-0">
        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          Dispatch en pause — quota {label} atteint.
        </p>
        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          Relève le plafond pour reprendre.
        </p>
      </div>
    </section>
  );
}

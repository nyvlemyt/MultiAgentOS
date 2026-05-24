import { ScopeBreadcrumb } from './ScopeBreadcrumb';
import { ModePill, AutonomyPill } from './ModePill';
import { ThemeToggle } from './ThemeToggle';
import { BudgetBar } from './BudgetBar';

export function Topbar() {
  return (
    <header
      className="sticky top-0 z-10 flex h-14 items-center justify-between gap-3 border-b px-5"
      style={{ background: 'var(--bg-base)', borderColor: 'var(--border-subtle)' }}
    >
      <div className="flex items-center gap-3">
        <ScopeBreadcrumb />
        <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>·</span>
        <span className="rounded-md px-2 py-0.5 text-[11px] font-medium" style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}>
          OtakuGO_UP
        </span>
      </div>
      <div className="flex items-center gap-3">
        <AutonomyPill value="manual" />
        <ModePill defaultMode="eco" />
        <BudgetBar spent={35} cap={300} label="today · €0.35/3" />
        <ThemeToggle />
      </div>
    </header>
  );
}

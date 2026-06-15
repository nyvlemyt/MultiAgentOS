import { ScopeBreadcrumb } from './ScopeBreadcrumb';
import { ModePill, AutonomyPill } from './ModePill';
import { LanguagePill } from './LanguagePill';
import { ThemeToggle } from './ThemeToggle';
import { BudgetBar } from './BudgetBar';
import { type Language } from '@/lib/i18n';

export function Topbar({
  projectId,
  projectName = 'OtakuGO_UP',
  language = 'fr',
}: Readonly<{ projectId?: string; projectName?: string; language?: Language }>) {
  return (
    <header
      className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b px-5"
      style={{ background: 'var(--bg-base)', borderColor: 'var(--border-subtle)' }}
    >
      <div className="flex min-w-0 items-center gap-3">
        <ScopeBreadcrumb />
        <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>·</span>
        <span
          className="truncate rounded-md border px-2 py-0.5 text-[11px] font-medium"
          style={{ background: 'var(--bg-hover)', borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}
        >
          {projectName}
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <AutonomyPill value="manual" />
        <ModePill defaultMode="eco" />
        <span className="mx-1 h-5 w-px" style={{ background: 'var(--border-default)' }} />
        <LanguagePill projectId={projectId} value={language} />
        <BudgetBar spent={35} cap={300} label="today · €0.35/3" />
        <ThemeToggle />
      </div>
    </header>
  );
}

import { cn } from '@/lib/cn';

function toneFor(pct: number): string {
  if (pct >= 90) return 'bg-red-500';
  if (pct >= 70) return 'bg-amber-500';
  return 'bg-[color:var(--accent)]';
}

export function BudgetBar({
  spent,
  cap,
  label,
  className,
}: Readonly<{
  spent: number;
  cap: number;
  label?: string;
  className?: string;
}>) {
  const pct = Math.min(100, Math.round((spent / Math.max(1, cap)) * 100));
  const tone = toneFor(pct);
  return (
    <div className={cn('flex flex-col gap-1 min-w-32', className)}>
      {label && (
        <div className="flex justify-between text-[11px]" style={{ color: 'var(--text-muted)' }}>
          <span>{label}</span>
          <span className="mono">{pct}%</span>
        </div>
      )}
      <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ background: 'var(--bg-hover)' }}>
        <div className={cn('h-full rounded-full transition-all', tone)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

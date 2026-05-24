import { cn } from '@/lib/cn';

export function BudgetBar({
  spent,
  cap,
  label,
  className,
}: {
  spent: number;
  cap: number;
  label?: string;
  className?: string;
}) {
  const pct = Math.min(100, Math.round((spent / Math.max(1, cap)) * 100));
  const tone = pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-[color:var(--accent)]';
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

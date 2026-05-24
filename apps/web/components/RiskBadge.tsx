import { cn } from '@/lib/cn';

type Risk = 'low' | 'medium' | 'high' | 'blocking';
const styles: Record<Risk, string> = {
  low: 'bg-[color:var(--accent-soft)] text-[color:var(--accent)]',
  medium: 'bg-amber-500/15 text-amber-400',
  high: 'bg-red-500/15 text-red-400',
  blocking: 'bg-red-500/25 text-red-300 border border-red-400/40',
};

export function RiskBadge({ risk, className }: { risk: Risk; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider',
        styles[risk],
        className,
      )}
    >
      {risk}
    </span>
  );
}

import { Sparkline } from '@/components/Sparkline';
import { BudgetBar } from '@/components/BudgetBar';
import { ModePill } from '@/components/ModePill';
import { dailyTokens, monthlySpend } from '@/lib/fixtures';
import { getTokenSnapshot, getRemainingCapacity } from '@/lib/tokens';

// Reads the DB directly (server component) — no HTTP self-fetch, which would be
// port/origin-fragile and silently fall back to zeros (see PR review).
export const dynamic = 'force-dynamic';

function fmtTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

export default async function TokenManager() {
  const data = await getTokenSnapshot();
  const capacity = await getRemainingCapacity();

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>Quota & Cache</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Subscription window usage, cache health, mode controls.</p>
        </div>
        <ModePill defaultMode="eco" />
      </header>
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card
          title="5h window"
          value={`${data.window5h.messagesUsed} msg`}
          hint="≥40% margin required"
        />
        <Card
          title="Tokens today"
          value={fmtTokens(data.day.tokensSpent)}
          hint={`cap ${fmtTokens(data.day.tokensCap)}`}
        >
          <BudgetBar spent={data.day.tokensSpent} cap={data.day.tokensCap} />
        </Card>
        <Card
          title="Tokens this week"
          value={fmtTokens(data.week.tokensSpent)}
          hint={`cap ${fmtTokens(data.week.tokensCap)}`}
        >
          <BudgetBar spent={data.week.tokensSpent} cap={data.week.tokensCap} />
        </Card>
        <Card
          title="Cache hit ratio"
          value={`${data.cacheHitRatio}%`}
          hint="≥30% Phase 2 target"
        />
        <Card
          title="Remaining capacity"
          value={capacity.label}
          hint="this month · rolling 30-day avg"
        />
      </section>
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <article className="surface p-4">
          <h2 className="mb-3 text-sm font-semibold">Daily tokens (k) — historical</h2>
          <Sparkline data={dailyTokens} width={500} height={140} />
        </article>
        <article className="surface p-4">
          <h2 className="mb-3 text-sm font-semibold">Weekly quota usage — historical</h2>
          <Sparkline data={monthlySpend} width={500} height={140} stroke="var(--success)" />
        </article>
      </section>
      <section className="surface p-4">
        <h2 className="mb-3 text-sm font-semibold">Spend by provider — today</h2>
        {data.byProvider.length === 0 ? (
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No LLM calls recorded today.</p>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left" style={{ color: 'var(--text-muted)' }}>
                <th className="py-1 font-medium">Source</th>
                <th className="py-1 text-right font-medium">Calls</th>
                <th className="py-1 text-right font-medium">Tokens in</th>
                <th className="py-1 text-right font-medium">Tokens out</th>
              </tr>
            </thead>
            <tbody>
              {data.byProvider.map((row) => (
                <tr key={row.provider} className="border-t" style={{ borderColor: 'var(--border)' }}>
                  <td className="py-1 mono">{row.provider}</td>
                  <td className="py-1 text-right tabular-nums">{row.calls}</td>
                  <td className="py-1 text-right tabular-nums">{fmtTokens(row.tokensIn)}</td>
                  <td className="py-1 text-right tabular-nums">{fmtTokens(row.tokensOut)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
      <section className="surface p-4">
        <h2 className="mb-3 text-sm font-semibold">Mode policy</h2>
        <ul className="space-y-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
          <li><span className="mono">eco</span> · haiku-4-5 everywhere · Caveman ON (internal only) · summaries only</li>
          <li><span className="mono">standard</span> · haiku → sonnet on retry · Caveman OFF · on-demand hydration</li>
          <li><span className="mono">expert</span> · sonnet base · opus on review · full hydration · no auto-cap bypass</li>
        </ul>
      </section>
    </div>
  );
}

function Card({ title, value, hint, children }: Readonly<{ title: string; value: string; hint?: string; children?: React.ReactNode }>) {
  return (
    <article className="surface flex flex-col gap-2 p-4">
      <header className="flex items-baseline justify-between">
        <h3 className="text-sm font-semibold">{title}</h3>
        {hint && <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{hint}</span>}
      </header>
      <div className="mono text-2xl font-semibold tabular-nums" style={{ color: 'var(--text-primary)' }}>{value}</div>
      {children}
    </article>
  );
}

import { Sparkline } from '@/components/Sparkline';
import { BudgetBar } from '@/components/BudgetBar';
import { ModePill } from '@/components/ModePill';
import { dailyTokens, monthlySpend } from '@/lib/fixtures';

interface TokenData {
  window5h: { messagesUsed: number };
  day: { tokensSpent: number; tokensCap: number };
  week: { tokensSpent: number; tokensCap: number };
  cacheHitRatio: number;
}

async function getTokenData(): Promise<TokenData> {
  try {
    const base = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
    const res = await fetch(`${base}/api/tokens`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`/api/tokens returned ${res.status}`);
    return res.json() as Promise<TokenData>;
  } catch {
    // Fallback to zero-state values when API is unavailable (SSG build time)
    return {
      window5h: { messagesUsed: 0 },
      day: { tokensSpent: 0, tokensCap: 1_000_000 },
      week: { tokensSpent: 0, tokensCap: 5_000_000 },
      cacheHitRatio: 0,
    };
  }
}

function fmtTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

export default async function TokenManager() {
  const data = await getTokenData();

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

function Card({ title, value, hint, children }: { title: string; value: string; hint?: string; children?: React.ReactNode }) {
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

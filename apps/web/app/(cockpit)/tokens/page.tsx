import { Sparkline } from '@/components/Sparkline';
import { BudgetBar } from '@/components/BudgetBar';
import { ModePill } from '@/components/ModePill';
import { dailyTokens, monthlySpend } from '@/lib/fixtures';

interface TokenData {
  today: { spentCents: number; capCents: number; tokensSpent: number; tokensCap: number };
  month: { spentCents: number; capCents: number; tokensSpent: number; tokensCap: number };
  cacheHitRatio: number;
}

async function getTokenData(): Promise<TokenData> {
  try {
    const base = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
    const res = await fetch(`${base}/api/tokens`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`/api/tokens returned ${res.status}`);
    return res.json() as Promise<TokenData>;
  } catch {
    // Fallback to seed-data values when API is unavailable (SSG build time)
    return {
      today: { spentCents: 35, capCents: 300, tokensSpent: 42_000, tokensCap: 1_000_000 },
      month: { spentCents: 240, capCents: 1500, tokensSpent: 320_000, tokensCap: 5_000_000 },
      cacheHitRatio: 0,
    };
  }
}

function fmtEur(cents: number) {
  return `€${(cents / 100).toFixed(2)}`;
}

export default async function TokenManager() {
  const data = await getTokenData();

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>Tokens & Budget</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Live spend, cache health, mode controls.</p>
        </div>
        <ModePill defaultMode="eco" />
      </header>
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card
          title="Today"
          value={fmtEur(data.today.spentCents)}
          hint={`cap ${fmtEur(data.today.capCents)}`}
        >
          <BudgetBar spent={data.today.spentCents} cap={data.today.capCents} />
        </Card>
        <Card
          title="This month"
          value={fmtEur(data.month.spentCents)}
          hint={`cap ${fmtEur(data.month.capCents)}`}
        >
          <BudgetBar spent={data.month.spentCents} cap={data.month.capCents} />
        </Card>
        <Card
          title="Tokens today"
          value={`${(data.today.tokensSpent / 1000).toFixed(1)}k`}
          hint={`cap ${(data.today.tokensCap / 1_000_000).toFixed(0)}M`}
        />
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
          <h2 className="mb-3 text-sm font-semibold">Monthly spend (€) — historical</h2>
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

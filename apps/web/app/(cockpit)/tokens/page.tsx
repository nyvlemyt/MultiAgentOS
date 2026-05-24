import { Sparkline } from '@/components/Sparkline';
import { BudgetBar } from '@/components/BudgetBar';
import { ModePill } from '@/components/ModePill';
import { dailyTokens, monthlySpend } from '@/lib/fixtures';

export default function TokenManager() {
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
        <Card title="Today" value="€0.35" hint="cap €3.00"><BudgetBar spent={35} cap={300} /></Card>
        <Card title="This week" value="€1.84" hint="cap €15.00"><BudgetBar spent={184} cap={1500} /></Card>
        <Card title="This month" value="€2.40" hint="cap €15.00"><BudgetBar spent={240} cap={1500} /></Card>
        <Card title="Cache hit ratio" value="62%" hint="≥60% target" />
      </section>
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <article className="surface p-4">
          <h2 className="mb-3 text-sm font-semibold">Daily tokens (k)</h2>
          <Sparkline data={dailyTokens} width={500} height={140} />
        </article>
        <article className="surface p-4">
          <h2 className="mb-3 text-sm font-semibold">Monthly spend (€)</h2>
          <Sparkline data={monthlySpend} width={500} height={140} stroke="var(--success)" />
        </article>
      </section>
      <section className="surface p-4">
        <h2 className="mb-3 text-sm font-semibold">Mode policy</h2>
        <ul className="space-y-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
          <li><span className="mono">eco</span> · haiku-4-5 everywhere · Caveman ON internally · summaries only</li>
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

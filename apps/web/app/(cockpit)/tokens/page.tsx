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
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Usage de la fenêtre d'abonnement, santé du cache, contrôle des modes.</p>
        </div>
        <ModePill defaultMode="eco" />
      </header>
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card
          title="Fenêtre 5 h"
          value={`${data.window5h.messagesUsed} msg`}
          hint="marge ≥40% requise"
        />
        <Card
          title="Tokens aujourd'hui"
          value={fmtTokens(data.day.tokensSpent)}
          hint={`reste ~${fmtTokens(data.day.remaining)} · réservé ${fmtTokens(data.day.reserved)} · plafond ${fmtTokens(data.day.tokensCap)}`}
        >
          <BudgetBar spent={data.day.tokensSpent + data.day.reserved} cap={data.day.tokensCap} />
        </Card>
        <Card
          title="Tokens cette semaine"
          value={fmtTokens(data.week.tokensSpent)}
          hint={`reste ~${fmtTokens(data.week.remaining)} · réservé ${fmtTokens(data.week.reserved)} · plafond ${fmtTokens(data.week.tokensCap)}`}
        >
          <BudgetBar spent={data.week.tokensSpent + data.week.reserved} cap={data.week.tokensCap} />
        </Card>
        <Card
          title="Tokens ce mois (Agent-SDK)"
          value={fmtTokens(data.month.tokensSpent)}
          hint={
            data.month.tokensCap > 0
              ? `reste ~${fmtTokens(data.month.remaining)} · réservé ${fmtTokens(data.month.reserved)} · plafond ${fmtTokens(data.month.tokensCap)}`
              : 'plafond non déclaré (illimité)'
          }
        >
          <BudgetBar spent={data.month.tokensSpent + data.month.reserved} cap={data.month.tokensCap} />
        </Card>
        <Card
          title="Taux de cache"
          value={`${data.cacheHitRatio}%`}
          hint="cible ≥30%"
        />
        <Card
          title="Capacité restante"
          value={capacity.label}
          hint="ce mois · moyenne glissante 30 j"
        />
      </section>
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <article className="surface p-4">
          <h2 className="mb-3 text-sm font-semibold">Tokens par jour (k) — historique</h2>
          <Sparkline data={dailyTokens} width={500} height={140} />
        </article>
        <article className="surface p-4">
          <h2 className="mb-3 text-sm font-semibold">Quota hebdomadaire — historique</h2>
          <Sparkline data={monthlySpend} width={500} height={140} stroke="var(--success)" />
        </article>
      </section>
      <section className="surface p-4">
        <h2 className="mb-3 text-sm font-semibold">Dépense par fournisseur — aujourd'hui</h2>
        {data.byProvider.length === 0 ? (
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Aucun appel LLM enregistré aujourd'hui.</p>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left" style={{ color: 'var(--text-muted)' }}>
                <th className="py-1 font-medium">Source</th>
                <th className="py-1 font-medium">Abonnement</th>
                <th className="py-1 text-right font-medium">Appels</th>
                <th className="py-1 text-right font-medium">Tokens entrée</th>
                <th className="py-1 text-right font-medium">Tokens sortie</th>
              </tr>
            </thead>
            <tbody>
              {data.byProvider.map((row) => (
                <tr key={row.provider} className="border-t" style={{ borderColor: 'var(--border)' }}>
                  <td className="py-1 mono">{row.provider}</td>
                  <td className="py-1 mono" style={{ color: 'var(--text-muted)' }}>{row.plan ?? '—'}</td>
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
        <h2 className="mb-3 text-sm font-semibold">Politique des modes</h2>
        <ul className="space-y-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
          <li><span className="mono">eco</span> · haiku partout · Caveman ON (interne) · résumés seulement</li>
          <li><span className="mono">standard</span> · haiku → sonnet au retry · Caveman OFF · hydratation à la demande</li>
          <li><span className="mono">expert</span> · sonnet base · opus en revue · hydratation complète · pas de contournement du plafond</li>
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

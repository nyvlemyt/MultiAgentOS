import { getDb, budgets, events } from '@mas/db';
import { and, eq, gte, sum, count, inArray } from 'drizzle-orm';

export interface ProviderSpendRow {
  provider: string;
  calls: number;
  tokensIn: number;
  tokensOut: number;
}

export interface TokenSnapshot {
  window5h: { messagesUsed: number };
  day: { tokensSpent: number; tokensCap: number };
  week: { tokensSpent: number; tokensCap: number };
  cacheHitRatio: number;
  /** Today's LLM-call spend grouped by source (Phase 3.5 router breakdown). */
  byProvider: ProviderSpendRow[];
}

/** Event types that represent one real LLM call carrying token counts. */
const LLM_CALL_TYPES = ['llm_call', 'task_done', 'validation_approved'];

function startOfDay(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function fiveHoursAgo(): Date {
  return new Date(Date.now() - 5 * 60 * 60 * 1000);
}

/**
 * Quota/cache snapshot read straight from the DB. Server components call this
 * directly (no HTTP self-fetch); the /api/tokens route wraps it for clients.
 * Window + cache aggregates count only `llm_call` events (TOKEN_STRATEGY §8).
 */
export async function getTokenSnapshot(): Promise<TokenSnapshot> {
  const db = getDb();

  // Budget rows — quota expressed in tokens (subscription billing, no € caps).
  const budgetRows = await db.select().from(budgets).where(eq(budgets.scope, 'global'));
  const dayRow = budgetRows.find((r) => r.period === 'day');
  const weekRow = budgetRows.find((r) => r.period === 'week');

  // 5-hour rolling window: COUNT llm_call events (§8 cap uses COUNT, not SUM).
  const windowStart = fiveHoursAgo();
  const windowAgg = await db
    .select({ messagesUsed: count() })
    .from(events)
    .where(and(gte(events.createdAt, windowStart), eq(events.type, 'llm_call')));
  const messagesUsedInWindow = windowAgg[0]?.messagesUsed ?? 0;

  // Cache hit ratio from today's llm_call events.
  const since = startOfDay();
  const cacheAgg = await db
    .select({
      totalCacheRead: sum(events.cacheRead),
      totalCacheCreation: sum(events.cacheCreation),
    })
    .from(events)
    .where(and(gte(events.createdAt, since), eq(events.type, 'llm_call')));

  const cacheRead = Number(cacheAgg[0]?.totalCacheRead ?? 0);
  const cacheCreation = Number(cacheAgg[0]?.totalCacheCreation ?? 0);
  const cacheTotal = cacheRead + cacheCreation;
  const cacheHitRatio = cacheTotal > 0 ? Math.round((cacheRead / cacheTotal) * 100) : 0;

  // Per-provider breakdown: provider rides the event payload (router sources);
  // events without one predate the router or ran the plain Claude path.
  const callRows = await db
    .select({ payloadJson: events.payloadJson, tokensIn: events.tokensIn, tokensOut: events.tokensOut })
    .from(events)
    .where(and(gte(events.createdAt, since), inArray(events.type, LLM_CALL_TYPES)));
  const byProviderMap = new Map<string, ProviderSpendRow>();
  for (const row of callRows) {
    let provider = 'claude';
    try {
      const parsed = JSON.parse(row.payloadJson ?? '{}') as { provider?: string };
      if (parsed.provider) provider = parsed.provider;
    } catch { /* unattributed */ }
    const agg = byProviderMap.get(provider) ?? { provider, calls: 0, tokensIn: 0, tokensOut: 0 };
    agg.calls += 1;
    agg.tokensIn += row.tokensIn ?? 0;
    agg.tokensOut += row.tokensOut ?? 0;
    byProviderMap.set(provider, agg);
  }
  const byProvider = [...byProviderMap.values()].sort(
    (a, b) => b.tokensIn + b.tokensOut - (a.tokensIn + a.tokensOut),
  );

  return {
    window5h: { messagesUsed: messagesUsedInWindow },
    day: { tokensSpent: dayRow?.tokensSpent ?? 0, tokensCap: dayRow?.tokensCap ?? 1_000_000 },
    week: { tokensSpent: weekRow?.tokensSpent ?? 0, tokensCap: weekRow?.tokensCap ?? 5_000_000 },
    cacheHitRatio,
    byProvider,
  };
}

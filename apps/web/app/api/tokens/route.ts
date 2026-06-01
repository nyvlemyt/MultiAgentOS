import { NextResponse } from 'next/server';
import { getDb, budgets, events } from '@mas/db';
import { eq, gte, sum, count } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

function startOfDay(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function fiveHoursAgo(): Date {
  return new Date(Date.now() - 5 * 60 * 60 * 1000);
}

export async function GET() {
  try {
    const db = getDb();

    // Budget rows — quota expressed in tokens (subscription billing, no € caps)
    const budgetRows = await db.select().from(budgets).where(eq(budgets.scope, 'global'));
    const dayRow = budgetRows.find((r) => r.period === 'day');
    const weekRow = budgetRows.find((r) => r.period === 'week');

    // 5-hour rolling window: COUNT llm_call events (§8 cap uses COUNT, not SUM(quota_units))
    const windowStart = fiveHoursAgo();
    const windowAgg = await db
      .select({ messagesUsed: count() })
      .from(events)
      .where(gte(events.createdAt, windowStart));
    const messagesUsedInWindow = windowAgg[0]?.messagesUsed ?? 0;

    // Cache hit ratio from today's llm_call events
    const since = startOfDay();
    const cacheAgg = await db
      .select({
        totalCacheRead: sum(events.cacheRead),
        totalCacheCreation: sum(events.cacheCreation),
      })
      .from(events)
      .where(gte(events.createdAt, since));

    const cacheRead = Number(cacheAgg[0]?.totalCacheRead ?? 0);
    const cacheCreation = Number(cacheAgg[0]?.totalCacheCreation ?? 0);
    const cacheTotal = cacheRead + cacheCreation;
    const cacheHitRatio = cacheTotal > 0 ? Math.round((cacheRead / cacheTotal) * 100) : 0;

    return NextResponse.json({
      window5h: {
        messagesUsed: messagesUsedInWindow,
        // Margin cap: ≥40% free required (Phase 2 target — TOKEN_STRATEGY.md §11).
        // Actual window size is subscription-tier dependent; tracked by messagesUsed growth.
      },
      day: {
        tokensSpent: dayRow?.tokensSpent ?? 0,
        tokensCap: dayRow?.tokensCap ?? 1_000_000,
      },
      week: {
        tokensSpent: weekRow?.tokensSpent ?? 0,
        tokensCap: weekRow?.tokensCap ?? 5_000_000,
      },
      cacheHitRatio,
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

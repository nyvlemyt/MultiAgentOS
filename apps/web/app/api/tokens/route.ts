import { NextResponse } from 'next/server';
import { getDb, budgets, events } from '@mas/db';
import { eq, gte, sum } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

function startOfDay(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export async function GET() {
  try {
    const db = getDb();

    // Budget rows
    const budgetRows = await db.select().from(budgets).where(eq(budgets.scope, 'global'));
    const dayRow = budgetRows.find((r) => r.period === 'day');
    const monthRow = budgetRows.find((r) => r.period === 'month');

    // Cache hit ratio from all llm_call events in the last 24 h
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
      today: {
        spentCents: dayRow?.moneySpentCents ?? 0,
        capCents: dayRow?.moneyCapCents ?? 300,
        tokensSpent: dayRow?.tokensSpent ?? 0,
        tokensCap: dayRow?.tokensCap ?? 1_000_000,
      },
      month: {
        spentCents: monthRow?.moneySpentCents ?? 0,
        capCents: monthRow?.moneyCapCents ?? 1500,
        tokensSpent: monthRow?.tokensSpent ?? 0,
        tokensCap: monthRow?.tokensCap ?? 5_000_000,
      },
      cacheHitRatio,
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

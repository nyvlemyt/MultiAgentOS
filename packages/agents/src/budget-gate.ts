import { and, eq, gte, inArray, sum } from 'drizzle-orm';
import { getDb, budgets, events } from '@mas/db';

/** One spend/cap pair for a single budget window. */
export interface BudgetWindow {
  readonly spent: number;
  readonly cap: number;
}

/** Outcome of the pre-dispatch budget check (CLAUDE.md §6, §11). */
export interface BudgetStatus {
  readonly blocked: boolean;
  readonly window: 'day' | 'week' | null;
  readonly day: BudgetWindow;
  readonly week: BudgetWindow;
}

// Event types that carry real token counts for one LLM call. Mirrors
// apps/web/lib/tokens.ts so the gate and the meter measure the same spend.
const LLM_CALL_TYPES = ['llm_call', 'task_done', 'validation_approved'];

// A window is exhausted once spend reaches its cap. cap <= 0 means "no cap set"
// (subscription billing leaves a window uncapped) → never blocks.
function windowExhausted(w: BudgetWindow): boolean {
  return w.cap > 0 && w.spent >= w.cap;
}

/**
 * Pure decision: block dispatch when ANY window is exhausted. Day is reported
 * first so the operator sees the tightest, most actionable window. No DB, no
 * clock — fully unit-testable.
 */
export function evaluateBudget(day: BudgetWindow, week: BudgetWindow): BudgetStatus {
  const dayHit = windowExhausted(day);
  const weekHit = windowExhausted(week);
  const window = dayHit ? 'day' : weekHit ? 'week' : null;
  return { blocked: dayHit || weekHit, window, day, week };
}

function startOfDay(now: Date): Date {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function sevenDaysAgo(now: Date): Date {
  return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
}

async function spentSince(db: ReturnType<typeof getDb>, since: Date): Promise<number> {
  const rows = await db
    .select({ tokensIn: sum(events.tokensIn), tokensOut: sum(events.tokensOut) })
    .from(events)
    .where(and(gte(events.createdAt, since), inArray(events.type, LLM_CALL_TYPES)));
  return Number(rows[0]?.tokensIn ?? 0) + Number(rows[0]?.tokensOut ?? 0);
}

async function capFor(db: ReturnType<typeof getDb>, period: 'day' | 'week'): Promise<number> {
  const row = (
    await db
      .select({ cap: budgets.tokensCap })
      .from(budgets)
      .where(and(eq(budgets.scope, 'global'), eq(budgets.period, period)))
  )[0];
  return row?.cap ?? 0;
}

/**
 * DB-backed budget check run before every dispatch tick. Caps come from the
 * global `budgets` rows; spend is computed live from the `events` log (the
 * `budgets.tokensSpent` column is seed-only and not maintained at runtime), so
 * the gate is self-correcting across day/week rollovers. `now` is injected for
 * deterministic tests.
 */
export async function checkDispatchBudget(
  db = getDb(),
  now = new Date(),
): Promise<BudgetStatus> {
  const [dayCap, weekCap, daySpent, weekSpent] = await Promise.all([
    capFor(db, 'day'),
    capFor(db, 'week'),
    spentSince(db, startOfDay(now)),
    spentSince(db, sevenDaysAgo(now)),
  ]);
  return evaluateBudget({ spent: daySpent, cap: dayCap }, { spent: weekSpent, cap: weekCap });
}

import { and, eq, gte, inArray, sum } from 'drizzle-orm';
import { getDb, budgets, events, tasks } from '@mas/db';

/**
 * One budget window's accounting. `spent` = tokens already logged to the events
 * log; `reserved` = tokens claimed by in-flight (`running`) tasks but not yet
 * logged. The estimate is the sum — this is what makes the gate correct when
 * several agents run concurrently across sessions against one shared quota.
 */
export interface BudgetWindowInput {
  readonly spent: number;
  readonly reserved: number;
  readonly cap: number;
}

export interface BudgetWindow extends BudgetWindowInput {
  /** spent + reserved. */
  readonly estimate: number;
  /** cap − estimate, clamped ≥ 0; null when the window is uncapped. */
  readonly remaining: number | null;
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

function resolveWindow(input: BudgetWindowInput): BudgetWindow {
  const estimate = input.spent + input.reserved;
  const remaining = input.cap > 0 ? Math.max(0, input.cap - estimate) : null;
  return { ...input, estimate, remaining };
}

// A window is exhausted once the estimate reaches its cap. cap <= 0 means "no
// cap set" (subscription leaves a window uncapped) → never blocks.
function exhausted(w: BudgetWindow): boolean {
  return w.cap > 0 && w.estimate >= w.cap;
}

/**
 * Pure decision: block dispatch when ANY window's estimate (logged + in-flight
 * reserved) is exhausted. Day is reported first so the operator sees the
 * tightest window. No DB, no clock — fully unit-testable.
 */
export function evaluateBudget(day: BudgetWindowInput, week: BudgetWindowInput): BudgetStatus {
  const d = resolveWindow(day);
  const w = resolveWindow(week);
  const window = exhausted(d) ? 'day' : exhausted(w) ? 'week' : null;
  return { blocked: window !== null, window, day: d, week: w };
}

type DbHandle = ReturnType<typeof getDb>;

function startOfDay(now: Date): Date {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function sevenDaysAgo(now: Date): Date {
  return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
}

async function spentSince(db: DbHandle, since: Date): Promise<number> {
  const rows = await db
    .select({ tokensIn: sum(events.tokensIn), tokensOut: sum(events.tokensOut) })
    .from(events)
    .where(and(gte(events.createdAt, since), inArray(events.type, LLM_CALL_TYPES)));
  return Number(rows[0]?.tokensIn ?? 0) + Number(rows[0]?.tokensOut ?? 0);
}

/**
 * Tokens claimed by tasks currently `running` across ALL missions/sessions.
 * These are budgeted but not yet logged as spend, so a naive logged-only read
 * would let N concurrent agents each pass the gate and blow the cap together.
 * Reading the shared tasks table makes the reservation global by construction.
 */
async function reservedInFlight(db: DbHandle): Promise<number> {
  const rows = await db
    .select({ reserved: sum(tasks.budgetTokens) })
    .from(tasks)
    .where(eq(tasks.status, 'running'));
  return Number(rows[0]?.reserved ?? 0);
}

async function capFor(db: DbHandle, period: 'day' | 'week'): Promise<number> {
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
 * `budgets.tokensSpent` column is seed-only, not maintained at runtime) PLUS
 * the in-flight reservation of running tasks, so the gate stays correct under
 * concurrent multi-agent / multi-session dispatch and self-corrects across
 * day/week rollovers. `now` is injected for deterministic tests.
 */
export async function checkDispatchBudget(
  db = getDb(),
  now = new Date(),
): Promise<BudgetStatus> {
  const [dayCap, weekCap, daySpent, weekSpent, reserved] = await Promise.all([
    capFor(db, 'day'),
    capFor(db, 'week'),
    spentSince(db, startOfDay(now)),
    spentSince(db, sevenDaysAgo(now)),
    reservedInFlight(db),
  ]);
  return evaluateBudget(
    { spent: daySpent, reserved, cap: dayCap },
    { spent: weekSpent, reserved, cap: weekCap },
  );
}

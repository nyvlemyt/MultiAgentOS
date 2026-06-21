import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { and, eq, gte, inArray, sum } from 'drizzle-orm';
import { getDb, budgets, events, tasks } from '@mas/db';
import { loadRoutingConfig, resolveProviderPlans } from '@mas/core';

const CLAUDE_POOL = 'claude';

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

export type BudgetWindowName = 'day' | 'week' | 'month';

/** Outcome of the pre-dispatch budget check (CLAUDE.md §6, §11). */
export interface BudgetStatus {
  readonly blocked: boolean;
  readonly window: BudgetWindowName | null;
  readonly day: BudgetWindow;
  readonly week: BudgetWindow;
  readonly month: BudgetWindow;
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
 * reserved) is exhausted. Precedence day → week → month: the tightest window is
 * reported first (day) so the operator sees the nearest cap. The month window
 * carries the monthly Agent-SDK quota (CLAUDE.md §11). No DB, no clock — fully
 * unit-testable.
 */
/** An uncapped, idle window — the default when no month budget applies. */
const UNLIMITED_WINDOW: BudgetWindowInput = { spent: 0, reserved: 0, cap: 0 };

export function evaluateBudget(
  day: BudgetWindowInput,
  week: BudgetWindowInput,
  month: BudgetWindowInput = UNLIMITED_WINDOW,
): BudgetStatus {
  const d = resolveWindow(day);
  const w = resolveWindow(week);
  const m = resolveWindow(month);
  let window: BudgetWindowName | null = null;
  if (exhausted(d)) window = 'day';
  else if (exhausted(w)) window = 'week';
  else if (exhausted(m)) window = 'month';
  return { blocked: window !== null, window, day: d, week: w, month: m };
}

type DbHandle = ReturnType<typeof getDb>;

function startOfDay(now: Date): Date {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function sevenDaysAgo(now: Date): Date {
  return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
}

function startOfMonth(now: Date): Date {
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

function findRepoRoot(): string {
  let dir = process.cwd();
  for (let i = 0; i < 10; i++) {
    if (existsSync(resolve(dir, 'pnpm-workspace.yaml'))) return dir;
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return process.cwd();
}

/**
 * The plan is the source of truth for the monthly Agent-SDK quota (CLAUDE.md
 * §11): if config/model-routing.json declares `claude_plan.monthlyTokenQuota`,
 * it overrides the month `budgets` row. Undeclared ⇒ 0 ⇒ caller falls back to
 * the budgets row (which itself treats 0 as unlimited).
 */
function planMonthlyQuota(): number {
  const path = process.env.MAS_ROUTING_CONFIG ?? resolve(findRepoRoot(), 'config/model-routing.json');
  const quota = resolveProviderPlans(loadRoutingConfig(path)).get(CLAUDE_POOL)?.monthlyTokenQuota;
  return quota ?? 0;
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

async function capFor(db: DbHandle, period: BudgetWindowName): Promise<number> {
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
  const [dayCap, weekCap, monthRowCap, daySpent, weekSpent, monthSpent, reserved] =
    await Promise.all([
      capFor(db, 'day'),
      capFor(db, 'week'),
      capFor(db, 'month'),
      spentSince(db, startOfDay(now)),
      spentSince(db, sevenDaysAgo(now)),
      spentSince(db, startOfMonth(now)),
      reservedInFlight(db),
    ]);
  // Plan quota overrides the budgets row when declared (plan = source of truth).
  const planQuota = planMonthlyQuota();
  const monthCap = planQuota > 0 ? planQuota : monthRowCap;
  return evaluateBudget(
    { spent: daySpent, reserved, cap: dayCap },
    { spent: weekSpent, reserved, cap: weekCap },
    { spent: monthSpent, reserved, cap: monthCap },
  );
}

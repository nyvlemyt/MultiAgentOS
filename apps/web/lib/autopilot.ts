import { and, desc, eq, gte } from 'drizzle-orm';
import { getDb, validations, tasks, missions, events } from '@mas/db';

// Phase 6 autopilot read helpers. Server-side DB reads (mirror lib/health.ts).
// DETERMINISTIC, no LLM, no writes.

type Db = ReturnType<typeof getDb>;

export interface PendingValidation {
  validationId: string;
  taskId: string;
  taskTitle: string;
  missionId: string;
  actionSummary: string;
  risk: 'low' | 'medium' | 'high' | 'blocking';
}

export async function listPendingValidations(db: Db): Promise<PendingValidation[]> {
  const rows = await db
    .select({
      validationId: validations.id,
      taskId: tasks.id,
      taskTitle: tasks.title,
      missionId: tasks.missionId,
      actionSummary: validations.actionSummary,
      risk: tasks.risk,
    })
    .from(validations)
    .innerJoin(tasks, eq(validations.taskId, tasks.id))
    .innerJoin(missions, eq(tasks.missionId, missions.id))
    .where(eq(validations.status, 'pending'));
  return rows;
}

export interface DailyReportView {
  since: string;
  until: string;
  missionsAdvanced: number;
  missionsBlocked: number;
  tasksDone: number;
  validationsPending: number;
  quotaUnits: number;
}

export type BudgetWindow = 'day' | 'week' | 'month';

export interface BudgetPause {
  window: BudgetWindow;
  at: Date;
  remaining?: number;
}

interface BudgetExceededPayload {
  window?: BudgetWindow;
  day?: { remaining?: number };
  week?: { remaining?: number };
  month?: { remaining?: number };
}

function startOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/**
 * Most recent `budget_exceeded` event logged today, surfaced so the cockpit can
 * show that dispatch is paused (CLAUDE.md §6 pause+ask). Read-only, no LLM, no
 * auto-resume: the user must raise the cap to continue.
 */
export async function getBudgetPause(db: Db): Promise<BudgetPause | null> {
  const [row] = await db
    .select({ payloadJson: events.payloadJson, createdAt: events.createdAt })
    .from(events)
    .where(and(eq(events.type, 'budget_exceeded'), gte(events.createdAt, startOfToday())))
    .orderBy(desc(events.createdAt))
    .limit(1);
  if (!row) return null;

  let window: BudgetWindow = 'day';
  let remaining: number | undefined;
  try {
    const p = JSON.parse(row.payloadJson) as BudgetExceededPayload;
    if (p.window) window = p.window;
    remaining = p[window]?.remaining;
  } catch { /* malformed payload → default day window */ }

  return { window, at: row.createdAt, remaining };
}

export async function latestDailyReport(db: Db): Promise<DailyReportView | null> {
  const [row] = await db
    .select({ payloadJson: events.payloadJson })
    .from(events)
    .where(eq(events.type, 'daily_report'))
    .orderBy(desc(events.createdAt))
    .limit(1);
  if (!row) return null;
  return JSON.parse(row.payloadJson) as DailyReportView;
}

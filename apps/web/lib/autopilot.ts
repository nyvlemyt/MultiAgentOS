import { and, desc, eq, gte, inArray, sql } from 'drizzle-orm';
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
  /**
   * Depuis quand cette validation attend. `null` = fait ABSENT, jamais « depuis
   * 0 min » : la table `validations` n'a pas de colonne de création (seulement
   * `decidedAt`), donc l'âge se lit sur l'event `validation_requested` émis par
   * `pauseForRiskGate` (dispatch.ts:345). Une validation ouverte avant cet event
   * — ou par un autre chemin — reste sans âge, et la famille 2 n'en invente pas.
   */
  requestedAt: Date | null;
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
  if (rows.length === 0) return [];

  // Une requête groupée pour N validations (patron de mission-facts.ts:39-43).
  // max() : si une tâche a été re-gatée, la demande la plus récente est celle
  // que la ligne `pending` courante attend. Colonne epoch() = SECONDES.
  const taskIds = rows.map((r) => r.taskId);
  const requestEvents = await db
    .select({ taskId: events.taskId, lastEpoch: sql<number | null>`max(${events.createdAt})` })
    .from(events)
    .where(and(inArray(events.taskId, taskIds), eq(events.type, 'validation_requested')))
    .groupBy(events.taskId);

  const requestedAt = new Map<string, Date>();
  for (const e of requestEvents) {
    if (e.taskId !== null && e.lastEpoch !== null) requestedAt.set(e.taskId, new Date(e.lastEpoch * 1000));
  }
  return rows.map((r) => ({ ...r, requestedAt: requestedAt.get(r.taskId) ?? null }));
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

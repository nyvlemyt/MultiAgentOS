import { desc, eq } from 'drizzle-orm';
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

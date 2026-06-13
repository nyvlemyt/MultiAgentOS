import { and, eq, inArray } from 'drizzle-orm';
import { getDb, missions, tasks, validations, ideas } from '@mas/db';

// Phase 4.5-receptacle Project Health. Server-computed at read time (no table).
// Pure aggregation over existing rows — DETERMINISTIC, no LLM.

type Db = ReturnType<typeof getDb>;

export interface ProjectHealth {
  missionsTotal: number;
  missionsDone: number;
  missionsBlocked: number;
  lastActivity: Date | null;
  budgetUsedPct: number;
  nextDeadline: Date | null;
  openIdeas: number;
  pendingValidations: number;
}

const DONE_STATUSES = new Set(['validated', 'archived']);
const OPEN_IDEA_STATUSES = new Set(['inbox', 'to_clarify', 'prioritized']);

export async function computeProjectHealth(db: Db, projectId: string, now: Date = new Date()): Promise<ProjectHealth> {
  const ms = await db.select().from(missions).where(eq(missions.projectId, projectId));

  let budgetSum = 0;
  let spentSum = 0;
  let lastActivity: Date | null = null;
  let nextDeadline: Date | null = null;
  let done = 0;
  let blocked = 0;
  for (const m of ms) {
    budgetSum += m.budgetTokens;
    spentSum += m.spentTokens;
    if (DONE_STATUSES.has(m.status)) done += 1;
    if (m.status === 'blocked') blocked += 1;
    if (!lastActivity || m.updatedAt > lastActivity) lastActivity = m.updatedAt;
    if (m.deadline && m.deadline.getTime() >= now.getTime()) {
      if (!nextDeadline || m.deadline < nextDeadline) nextDeadline = m.deadline;
    }
  }

  const projectIdeas = await db.select().from(ideas).where(eq(ideas.projectId, projectId));
  const openIdeas = projectIdeas.filter((i) => OPEN_IDEA_STATUSES.has(i.status)).length;

  const missionIds = ms.map((m) => m.id);
  let pendingValidations = 0;
  if (missionIds.length > 0) {
    const pending = await db
      .select({ vid: validations.id })
      .from(validations)
      .innerJoin(tasks, eq(validations.taskId, tasks.id))
      .where(and(inArray(tasks.missionId, missionIds), eq(validations.status, 'pending')));
    pendingValidations = pending.length;
  }

  return {
    missionsTotal: ms.length,
    missionsDone: done,
    missionsBlocked: blocked,
    lastActivity,
    budgetUsedPct: budgetSum > 0 ? Math.round((spentSum / budgetSum) * 100) : 0,
    nextDeadline,
    openIdeas,
    pendingValidations,
  };
}

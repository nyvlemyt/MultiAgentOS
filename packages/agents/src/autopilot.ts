import { and, eq, inArray } from 'drizzle-orm';
import { getDb, missions, projects, schedules, tasks, type Mission, type Schedule, type Task } from '@mas/db';
import type { Risk } from '@mas/core';
import { executeNextTask } from './dispatch';

export type Db = ReturnType<typeof getDb>;

const RISK_ORDER: Record<Risk, number> = { low: 0, medium: 1, high: 2, blocking: 3 };

function parseHHMM(value: string): number {
  const [h, m] = value.split(':').map((n) => Number.parseInt(n, 10));
  return h * 60 + m;
}

/**
 * Is `now` inside the schedule's daily window on an allowed weekday? Handles a
 * window that wraps past midnight (windowStart > windowEnd). Pure — the caller
 * supplies `now` so window logic is deterministic in tests.
 */
export function isWithinWindow(schedule: Schedule, now: Date): boolean {
  const days = JSON.parse(schedule.daysJson) as number[];
  const start = parseHHMM(schedule.windowStart);
  const end = parseHHMM(schedule.windowEnd);
  const minutes = now.getHours() * 60 + now.getMinutes();
  const day = now.getDay();

  if (start <= end) {
    return days.includes(day) && minutes >= start && minutes <= end;
  }
  // Wrap-past-midnight: in-window if after start (today, this day) OR before end
  // (early morning — the window opened on the previous day).
  const prevDay = (day + 6) % 7;
  const afterStart = minutes >= start && days.includes(day);
  const beforeEnd = minutes <= end && days.includes(prevDay);
  return afterStart || beforeEnd;
}

/**
 * Dispatchable/executing missions whose project is in `autopilot` autonomy and
 * has an enabled schedule active at `now`.
 */
export async function selectAutopilotMissions(db: Db, now: Date): Promise<Mission[]> {
  const autopilotProjects = await db
    .select({ id: projects.id })
    .from(projects)
    .where(eq(projects.autonomy, 'autopilot'));
  if (autopilotProjects.length === 0) return [];

  const activeProjectIds: string[] = [];
  for (const p of autopilotProjects) {
    const scheds = await db
      .select()
      .from(schedules)
      .where(and(eq(schedules.projectId, p.id), eq(schedules.enabled, true)));
    if (scheds.some((s) => isWithinWindow(s, now))) activeProjectIds.push(p.id);
  }
  if (activeProjectIds.length === 0) return [];

  return db
    .select()
    .from(missions)
    .where(and(inArray(missions.projectId, activeProjectIds), inArray(missions.status, ['dispatched', 'executing'])));
}

async function maxRiskFor(db: Db, projectId: string): Promise<Risk> {
  const scheds = await db
    .select()
    .from(schedules)
    .where(and(eq(schedules.projectId, projectId), eq(schedules.enabled, true)));
  // Most permissive enabled schedule wins (still capped at 'medium' by the table).
  return scheds.reduce<Risk>((acc, s) => (RISK_ORDER[s.maxRisk] > RISK_ORDER[acc] ? s.maxRisk : acc), 'low');
}

function dependenciesMet(task: Task, doneIds: ReadonlySet<string>): boolean {
  return (JSON.parse(task.dependsOnJson) as string[]).every((d) => doneIds.has(d));
}

/**
 * Advance autopilot missions, but ONLY tasks whose risk ≤ the schedule's maxRisk
 * breaker. Anything higher is recorded in `skippedHighRisk` and left untouched —
 * the §5 gate is never bypassed (we don't even claim the task as running).
 */
export async function runAutopilotTick(
  db: Db,
  now: Date,
): Promise<{ ran: string[]; skippedHighRisk: string[] }> {
  const selected = await selectAutopilotMissions(db, now);
  const ran: string[] = [];
  const skippedHighRisk: string[] = [];

  for (const m of selected) {
    const all = await db.select().from(tasks).where(eq(tasks.missionId, m.id));
    const doneIds = new Set(all.filter((t) => t.status === 'done').map((t) => t.id));
    const runnable = all
      .filter((t) => t.status === 'todo' && dependenciesMet(t, doneIds))
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    const next = runnable[0];
    if (!next) continue;

    const cap = await maxRiskFor(db, m.projectId);
    if (RISK_ORDER[next.risk] > RISK_ORDER[cap]) {
      // Above the breaker — leave it for the human gate, never auto-run.
      skippedHighRisk.push(m.id);
      continue;
    }

    const res = await executeNextTask(m.id);
    if (res.kind === 'task_done' || res.kind === 'mission_complete') {
      ran.push(m.id);
    } else if (res.kind === 'paused_for_validation') {
      // executeNextTask still enforces the §5 gate; record it as skipped.
      skippedHighRisk.push(m.id);
    }
  }

  return { ran, skippedHighRisk };
}

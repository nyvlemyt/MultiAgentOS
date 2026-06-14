import { randomUUID } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { and, gte, lt, eq } from 'drizzle-orm';
import { getDb, events, validations } from '@mas/db';

type Db = ReturnType<typeof getDb>;

export interface DailyReport {
  readonly since: Date;
  readonly until: Date;
  readonly missionsAdvanced: number;
  readonly missionsBlocked: number;
  readonly tasksDone: number;
  readonly validationsPending: number;
  // Quota proxy only — NEVER a € figure (CLAUDE.md §11).
  readonly quotaUnits: number;
}

// Status-change events that count as a mission "advancing".
const ADVANCE_TYPES = ['mission_executing', 'mission_dispatched', 'mission_validated', 'mission_review_started'];

export async function buildDailyReport(db: Db, window: { since: Date; until: Date }): Promise<DailyReport> {
  const inWindow = and(gte(events.createdAt, window.since), lt(events.createdAt, window.until));
  const rows = await db.select().from(events).where(inWindow);

  let missionsAdvanced = 0;
  let missionsBlocked = 0;
  let tasksDone = 0;
  let quotaUnits = 0;
  for (const e of rows) {
    if (ADVANCE_TYPES.includes(e.type)) missionsAdvanced += 1;
    if (e.type === 'mission_blocked') missionsBlocked += 1;
    if (e.type === 'task_done') tasksDone += 1;
    quotaUnits += e.quotaUnits;
  }

  const pending = await db.select({ id: validations.id }).from(validations).where(eq(validations.status, 'pending'));

  return {
    since: window.since,
    until: window.until,
    missionsAdvanced,
    missionsBlocked,
    tasksDone,
    validationsPending: pending.length,
    quotaUnits,
  };
}

function repoRoot(): string {
  const here = fileURLToPath(new URL('.', import.meta.url));
  return resolve(here, '../../..');
}

function toMarkdown(report: DailyReport): string {
  const date = report.until.toISOString().slice(0, 10);
  return [
    `# Autopilot daily report — ${date}`,
    '',
    `Window: ${report.since.toISOString()} → ${report.until.toISOString()}`,
    '',
    `- Missions advanced: ${report.missionsAdvanced}`,
    `- Missions blocked: ${report.missionsBlocked}`,
    `- Tasks done: ${report.tasksDone}`,
    `- Validations pending: ${report.validationsPending}`,
    `- quotaUnits spent: ${report.quotaUnits}`,
    '',
  ].join('\n');
}

/**
 * Log a `daily_report` event (so /trace renders it) and persist markdown to
 * data/reports/<date>.md. NEVER writes to data/memory/ (§8 Memory Keeper lock).
 */
export async function emitDailyReport(db: Db, report: DailyReport): Promise<void> {
  await db.insert(events).values({
    id: `evt_${randomUUID()}`,
    type: 'daily_report',
    payloadJson: JSON.stringify(report),
    tokensIn: 0, tokensOut: 0, cacheRead: 0, cacheCreation: 0,
    quotaUnits: report.quotaUnits,
    risk: 'low',
    createdAt: report.until,
  });

  const date = report.until.toISOString().slice(0, 10);
  const dir = resolve(repoRoot(), 'data/reports');
  mkdirSync(dir, { recursive: true });
  writeFileSync(resolve(dir, `${date}.md`), toMarkdown(report), 'utf-8');
}

/** True if a daily_report event already exists for the given local date. */
export async function hasDailyReportFor(db: Db, date: string): Promise<boolean> {
  const rows = await db.select().from(events).where(eq(events.type, 'daily_report'));
  return rows.some((e) => e.createdAt.toISOString().slice(0, 10) === date);
}

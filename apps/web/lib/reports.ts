import { randomUUID } from 'node:crypto';
import { and, desc, eq } from 'drizzle-orm';
import { getDb, reports, type Report } from '@mas/db';

type Db = ReturnType<typeof getDb>;

export interface CreateReportInput {
  projectId: string;
  missionId?: string | null;
  taskId?: string | null;
  agentId?: string | null;
  kind?: 'task' | 'mission' | 'project';
  title: string;
  humanMd?: string;
  ai?: string;
  diff?: string;
  createdAt?: Date;
}

export async function createReport(db: Db, input: CreateReportInput): Promise<Report> {
  const [row] = await db
    .insert(reports)
    .values({
      id: `rep_${randomUUID()}`,
      projectId: input.projectId,
      missionId: input.missionId ?? null,
      taskId: input.taskId ?? null,
      agentId: input.agentId ?? null,
      kind: input.kind ?? 'task',
      title: input.title,
      humanMd: input.humanMd ?? '',
      ai: input.ai ?? '{}',
      diff: input.diff ?? '',
      createdAt: input.createdAt ?? new Date(),
    })
    .returning();
  return row!;
}

export async function listProjectReports(db: Db, projectId: string): Promise<Report[]> {
  return db.select().from(reports).where(eq(reports.projectId, projectId)).orderBy(desc(reports.createdAt));
}

export async function listMissionReports(db: Db, missionId: string): Promise<Report[]> {
  return db.select().from(reports).where(eq(reports.missionId, missionId)).orderBy(desc(reports.createdAt));
}

export async function getReport(db: Db, projectId: string, id: string): Promise<Report | undefined> {
  const [row] = await db.select().from(reports).where(and(eq(reports.id, id), eq(reports.projectId, projectId))).limit(1);
  return row;
}

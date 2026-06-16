'use server';
import { redirect } from 'next/navigation';
import { asc, eq } from 'drizzle-orm';
import { getDb, missions as missionsTable, tasks as tasksTable, projects as projectsTable } from '@mas/db';
import { createReport, listMissionReports } from '@/lib/reports';
import { missionProgress } from '@/lib/mission-progress';
import { buildFinalReport } from '@/lib/mission-report';

// Generate the final mission report: aggregate the per-task reports into a single
// kind='mission' report (agentId null = produced by the orchestrator, not an agent),
// then open its dedicated page.
//
// SEAM: the *content* is a deterministic mock (buildFinalReport). When the real
// LLM/aggregator lands it replaces buildFinalReport only — storage + routing here stay.
export async function generateMissionReport(missionId: string): Promise<void> {
  const db = getDb();
  const [mission] = await db.select().from(missionsTable).where(eq(missionsTable.id, missionId));
  if (!mission) return;
  const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, mission.projectId));

  const ts = await db.select().from(tasksTable).where(eq(tasksTable.missionId, missionId)).orderBy(asc(tasksTable.createdAt));
  const reports = await listMissionReports(db, missionId);
  const progress = missionProgress(
    ts.map((t) => ({ id: t.id, title: t.title, agentId: t.agentId, status: t.status })),
    reports.map((r) => ({ id: r.id, taskId: r.taskId, kind: r.kind })),
  );

  const content = buildFinalReport(mission.title, progress);
  const report = await createReport(db, {
    projectId: mission.projectId,
    missionId,
    agentId: null,
    kind: 'mission',
    title: content.title,
    humanMd: content.humanMd,
    ai: content.ai,
  });

  redirect(`/projects/${project?.slug ?? ''}/reports/${report.id}`);
}

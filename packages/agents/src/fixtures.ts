import { getDb, projects, missions, tasks } from '@mas/db';

/**
 * Test fixture (no vitest import, so it is index-exportable and reusable from
 * the worker package): seed a project + a dispatched mission carrying one
 * runnable low-risk task `<missionId>_t1` ready to execute. Single source of
 * truth for the dispatch-tick suites in both @mas/agents and apps/worker — keeps
 * the seed out of duplicated test boilerplate (Sonar new-code duplication).
 */
export async function seedDispatchableMission(missionId: string, projectId: string): Promise<void> {
  const db = getDb();
  await db
    .insert(projects)
    .values({
      id: projectId,
      name: projectId,
      slug: projectId,
      path: `/tmp/${projectId}`,
      type: 'other',
      autonomy: 'autonomous',
      createdAt: new Date(),
      lastActiveAt: new Date(),
    })
    .onConflictDoNothing();
  await db.insert(missions).values({
    id: missionId,
    projectId,
    title: 'M',
    objective: 'o',
    status: 'dispatched',
    risk: 'low',
    budgetTokens: 20000,
    spentTokens: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  await db.insert(tasks).values({
    id: `${missionId}_t1`,
    missionId,
    title: 'T',
    description: 'do it',
    status: 'todo',
    risk: 'low',
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

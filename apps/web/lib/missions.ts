import { and, desc, eq, type SQL } from 'drizzle-orm';
import { getDb, missions, type Mission } from '@mas/db';

// Phase 4.5-receptacle mission prioritization. DETERMINISTIC — no LLM.

type Db = ReturnType<typeof getDb>;

const clamp = (n: number, lo = 0, hi = 100) => Math.min(hi, Math.max(lo, Math.round(n)));

/** Directly set a mission's 0–100 priority score (user override slider). */
export async function setMissionPriority(db: Db, id: string, score: number): Promise<Mission | undefined> {
  const [row] = await db
    .update(missions)
    .set({ priorityScore: clamp(score), updatedAt: new Date() })
    .where(eq(missions.id, id))
    .returning();
  return row;
}

export interface TopMissionsFilter {
  projectId?: string;
  limit?: number;
}

export async function topMissionsByPriority(db: Db, filter: TopMissionsFilter): Promise<Mission[]> {
  const where: SQL[] = [];
  if (filter.projectId) where.push(eq(missions.projectId, filter.projectId));
  const base = db.select().from(missions).orderBy(desc(missions.priorityScore));
  const rows = where.length > 0 ? await base.where(and(...where)) : await base;
  return filter.limit ? rows.slice(0, filter.limit) : rows;
}

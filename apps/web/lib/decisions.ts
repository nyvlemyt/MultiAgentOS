import { randomUUID } from 'node:crypto';
import { and, desc, eq, type SQL } from 'drizzle-orm';
import { getDb, decisions, type Decision } from '@mas/db';

// Phase 4.5-receptacle Decision Log. MVP = user-logged manually. No memory
// writer is added (§8 intact); the Keeper-proposed-decision path is deferred.

type Db = ReturnType<typeof getDb>;

export interface CreateDecisionInput {
  scope: 'global' | 'project';
  projectId?: string | null;
  source?: 'user' | 'mission' | 'validation' | 'agent';
  sourceMissionId?: string | null;
  sourceTaskId?: string | null;
  title: string;
  body?: string;
  createdAt?: Date;
}

export async function createDecision(db: Db, input: CreateDecisionInput): Promise<Decision> {
  const [row] = await db
    .insert(decisions)
    .values({
      id: `dec_${randomUUID()}`,
      scope: input.scope,
      projectId: input.projectId ?? null,
      source: input.source ?? 'user',
      sourceMissionId: input.sourceMissionId ?? null,
      sourceTaskId: input.sourceTaskId ?? null,
      title: input.title,
      body: input.body ?? '',
      createdAt: input.createdAt ?? new Date(),
    })
    .returning();
  return row!;
}

export interface ListDecisionsFilter {
  scope?: 'global' | 'project';
  projectId?: string;
  missionId?: string;
  limit?: number;
}

export async function listDecisions(db: Db, filter: ListDecisionsFilter = {}): Promise<Decision[]> {
  const where: SQL[] = [];
  if (filter.scope) where.push(eq(decisions.scope, filter.scope));
  if (filter.projectId) where.push(eq(decisions.projectId, filter.projectId));
  if (filter.missionId) where.push(eq(decisions.sourceMissionId, filter.missionId));
  const base = db.select().from(decisions).orderBy(desc(decisions.createdAt));
  const rows = where.length > 0 ? await base.where(and(...where)) : await base;
  return filter.limit ? rows.slice(0, filter.limit) : rows;
}

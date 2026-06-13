import { randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { getDb, ideas, missions, type Idea } from '@mas/db';
import { priorityScore } from './prioritize';

// Phase 4.5-receptacle ideas domain. DETERMINISTIC — no LLM anywhere.

type Db = ReturnType<typeof getDb>;

export const IDEA_STATUSES = ['inbox', 'to_clarify', 'prioritized', 'converted', 'archived'] as const;
export type IdeaStatus = (typeof IDEA_STATUSES)[number];

export interface CreateIdeaInput {
  title: string;
  body?: string;
  scope?: 'global' | 'project';
  projectId?: string | null;
  impact?: number;
  urgency?: number;
  effortEst?: number;
  riskScore?: number;
  costEstTokens?: number;
  sourceDossier?: string | null;
}

export async function createIdea(db: Db, input: CreateIdeaInput): Promise<Idea> {
  const impact = input.impact ?? 50;
  const urgency = input.urgency ?? 50;
  const effortEst = input.effortEst ?? 50;
  const riskScore = input.riskScore ?? 0;
  const now = new Date();
  const [row] = await db
    .insert(ideas)
    .values({
      id: `idea_${randomUUID()}`,
      title: input.title,
      body: input.body ?? '',
      scope: input.scope ?? 'global',
      projectId: input.projectId ?? null,
      status: 'inbox',
      priorityScore: priorityScore({ impact, urgency, effortEst, riskScore }),
      impact,
      urgency,
      effortEst,
      riskScore,
      costEstTokens: input.costEstTokens ?? 0,
      sourceDossier: input.sourceDossier ?? null,
      ideaIdLink: null,
      createdAt: now,
      updatedAt: now,
    })
    .returning();
  return row!;
}

export async function moveIdea(db: Db, id: string, status: IdeaStatus): Promise<Idea | undefined> {
  if (!IDEA_STATUSES.includes(status)) throw new Error(`invalid idea status: ${status}`);
  const [row] = await db
    .update(ideas)
    .set({ status, updatedAt: new Date() })
    .where(eq(ideas.id, id))
    .returning();
  return row;
}

export interface ScoreSliders {
  impact: number;
  urgency: number;
  effortEst: number;
  riskScore: number;
}

export async function updateIdeaScores(db: Db, id: string, s: ScoreSliders): Promise<Idea | undefined> {
  const [row] = await db
    .update(ideas)
    .set({
      impact: s.impact,
      urgency: s.urgency,
      effortEst: s.effortEst,
      riskScore: s.riskScore,
      priorityScore: priorityScore(s),
      updatedAt: new Date(),
    })
    .where(eq(ideas.id, id))
    .returning();
  return row;
}

export interface ConvertResult {
  mission: typeof missions.$inferSelect;
  created: boolean;
}

/**
 * Convert an idea into a draft mission. Idempotent (mirrors Phase 1): a second
 * call on an already-converted idea returns the linked mission without creating
 * a duplicate. Missions require a project, so a project-less idea is refused.
 */
export async function convertIdeaToMission(db: Db, id: string): Promise<ConvertResult> {
  const [idea] = await db.select().from(ideas).where(eq(ideas.id, id));
  if (!idea) throw new Error(`idea not found: ${id}`);

  if (idea.status === 'converted' && idea.ideaIdLink) {
    const [existing] = await db.select().from(missions).where(eq(missions.id, idea.ideaIdLink));
    if (existing) return { mission: existing, created: false };
  }

  if (!idea.projectId) throw new Error('cannot convert: idea has no projectId (missions require a project)');

  const now = new Date();
  const missionId = `mission_${randomUUID()}`;
  const [mission] = await db
    .insert(missions)
    .values({
      id: missionId,
      projectId: idea.projectId,
      title: idea.title,
      objective: idea.body || idea.title,
      status: 'draft',
      priorityScore: idea.priorityScore,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  await db.update(ideas).set({ status: 'converted', ideaIdLink: missionId, updatedAt: now }).where(eq(ideas.id, id));
  return { mission: mission!, created: true };
}

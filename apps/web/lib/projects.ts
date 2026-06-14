import { eq } from 'drizzle-orm';
import { getDb, projects, type Project } from '@mas/db';

// Phase 3.5b project-settings domain. DETERMINISTIC — no LLM anywhere.

type Db = ReturnType<typeof getDb>;

export const PROJECT_LANGUAGES = ['fr', 'en'] as const;
export type ProjectLanguage = (typeof PROJECT_LANGUAGES)[number];

export function isProjectLanguage(v: unknown): v is ProjectLanguage {
  return v === 'fr' || v === 'en';
}

export async function setProjectLanguage(
  db: Db,
  id: string,
  language: ProjectLanguage,
): Promise<Project | null> {
  const [row] = await db
    .update(projects)
    .set({ language, lastActiveAt: new Date() })
    .where(eq(projects.id, id))
    .returning();
  return row ?? null;
}

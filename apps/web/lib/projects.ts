import { randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { getDb, projects, projectLinks, memoryCandidates, type Project } from '@mas/db';
import { getTemplate, type Autonomy, type ProjectMode, type ProjectType, type MemoryRegister } from './templates';

// Phase 3.5b project-settings + Phase 7 create domain. DETERMINISTIC — no LLM.

type Db = ReturnType<typeof getDb>;

export const PROJECT_LANGUAGES = ['fr', 'en'] as const;
export type ProjectLanguage = (typeof PROJECT_LANGUAGES)[number];

export function isProjectLanguage(v: unknown): v is ProjectLanguage {
  return v === 'fr' || v === 'en';
}

// Map a doctrine memory register to a memory_candidates.type. Seed memory lands
// as PENDING candidates only — the Memory Keeper is the sole writer to
// data/memory/ (CLAUDE.md §8); the wizard NEVER writes the store directly.
const REGISTER_TO_TYPE: Record<MemoryRegister, 'user' | 'feedback' | 'project' | 'reference'> = {
  decisions: 'project',
  learnings: 'feedback',
  blockers: 'project',
  journal: 'reference',
  evals: 'feedback',
};

export function slugify(name: string): string {
  return name
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .join('-');
}

async function uniqueSlug(db: Db, base: string): Promise<string> {
  const root = base.length > 0 ? base : 'project';
  const existing = await db.select({ slug: projects.slug }).from(projects);
  const taken = new Set(existing.map((r) => r.slug));
  if (!taken.has(root)) return root;
  let n = 2;
  while (taken.has(`${root}-${n}`)) n += 1;
  return `${root}-${n}`;
}

export interface CreateProjectInput {
  name: string;
  path: string;
  type: ProjectType;
  templateId?: string;
  autonomy?: Autonomy;
  mode?: ProjectMode;
  stack?: string[];
}

export async function createProject(db: Db, input: CreateProjectInput): Promise<Project> {
  const tpl = input.templateId ? getTemplate(input.templateId) : undefined;
  const slug = await uniqueSlug(db, slugify(input.name));
  const id = `proj_${randomUUID()}`;
  const now = new Date();
  const stack = input.stack ?? (tpl ? [...tpl.stack] : []);

  const [project] = await db
    .insert(projects)
    .values({
      id,
      name: input.name,
      slug,
      path: input.path,
      type: tpl?.type ?? input.type,
      stackJson: JSON.stringify(stack),
      autonomy: input.autonomy ?? tpl?.autonomyFloor ?? 'manual',
      defaultMode: input.mode ?? tpl?.defaultMode ?? 'eco',
      defaultModel: tpl?.defaultModel ?? 'claude-haiku-4-5',
      createdAt: now,
      lastActiveAt: now,
    })
    .returning();

  if (tpl) {
    const links = [
      ...tpl.skillPolicy.map((refId) => ({ projectId: id, kind: 'skill' as const, refId })),
      ...tpl.tierARoster.map((refId) => ({ projectId: id, kind: 'agent' as const, refId })),
    ];
    if (links.length > 0) await db.insert(projectLinks).values(links);

    if (tpl.seedMemory.length > 0) {
      await db.insert(memoryCandidates).values(
        tpl.seedMemory.map((seed) => ({
          id: `cand_${randomUUID()}`,
          sourceTaskId: null,
          type: REGISTER_TO_TYPE[seed.register],
          body: seed.body,
          status: 'pending' as const,
          sourceKind: 'note' as const,
          createdAt: now,
        })),
      );
    }
  }

  return project!;
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

'use server';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { getDb, projects as projectsTable } from '@mas/db';
import { MODE_MODEL, isMode } from '@/lib/modes';

type Autonomy = 'manual' | 'assisted' | 'autonomous' | 'autopilot';
const AUTONOMY = new Set<Autonomy>(['manual', 'assisted', 'autonomous', 'autopilot']);

// Mode drives the model tier (single control). No standalone model picker.
export async function updateProjectSettings(
  projectId: string,
  slug: string,
  settings: { autonomy: string; defaultMode: string },
): Promise<void> {
  if (!AUTONOMY.has(settings.autonomy as Autonomy)) return;
  if (!isMode(settings.defaultMode)) return;
  await getDb()
    .update(projectsTable)
    .set({ autonomy: settings.autonomy as Autonomy, defaultMode: settings.defaultMode, defaultModel: MODE_MODEL[settings.defaultMode] })
    .where(eq(projectsTable.id, projectId));
  revalidatePath(`/projects/${slug}`);
}

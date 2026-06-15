'use server';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { getDb, projects as projectsTable } from '@mas/db';

type Autonomy = 'manual' | 'assisted' | 'autonomous' | 'autopilot';
type Mode = 'eco' | 'standard' | 'expert';

const AUTONOMY = new Set<Autonomy>(['manual', 'assisted', 'autonomous', 'autopilot']);
const MODE = new Set<Mode>(['eco', 'standard', 'expert']);
const MODELS = new Set(['claude-haiku-4-5', 'claude-sonnet-4-6', 'claude-opus-4-8']);

export async function updateProjectSettings(
  projectId: string,
  slug: string,
  settings: { autonomy: string; defaultMode: string; defaultModel: string },
): Promise<void> {
  if (!AUTONOMY.has(settings.autonomy as Autonomy)) return;
  if (!MODE.has(settings.defaultMode as Mode)) return;
  if (!MODELS.has(settings.defaultModel)) return;
  await getDb()
    .update(projectsTable)
    .set({
      autonomy: settings.autonomy as Autonomy,
      defaultMode: settings.defaultMode as Mode,
      defaultModel: settings.defaultModel,
    })
    .where(eq(projectsTable.id, projectId));
  revalidatePath(`/projects/${slug}`);
}

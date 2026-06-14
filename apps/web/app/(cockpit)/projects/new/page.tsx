import { desc } from 'drizzle-orm';
import { getDb, projects } from '@mas/db';
import { NewProjectWizard } from '@/components/NewProjectWizard';
import { type Language } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

export default async function NewProjectPage() {
  const [current] = await getDb()
    .select({ language: projects.language })
    .from(projects)
    .orderBy(desc(projects.lastActiveAt))
    .limit(1);
  const lang = (current?.language ?? 'fr') as Language;
  return <NewProjectWizard language={lang} />;
}

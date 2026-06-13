import { desc } from 'drizzle-orm';
import { getDb, projects } from '@mas/db';
import { Sidebar } from '@/components/Sidebar';
import { Topbar } from '@/components/Topbar';
import { type Language } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

export default async function CockpitLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [current] = await getDb()
    .select({ id: projects.id, name: projects.name, language: projects.language })
    .from(projects)
    .orderBy(desc(projects.lastActiveAt))
    .limit(1);
  const lang = (current?.language ?? 'fr') as Language;

  return (
    <div className="flex min-h-screen">
      <Sidebar lang={lang} />
      <div className="flex flex-1 flex-col">
        <Topbar projectId={current?.id} projectName={current?.name} language={lang} />
        <main className="flex-1 overflow-x-hidden px-6 py-6">{children}</main>
      </div>
    </div>
  );
}

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { getDb, projects as projectsTable } from '@mas/db';
import { getReport } from '@/lib/reports';
import { ReportViewer } from '@/components/ReportViewer';
import { AgentAvatar } from '@/components/AgentAvatar';
import { allAgents } from '@/lib/fixtures';

export const dynamic = 'force-dynamic';

const KIND_LABEL: Record<string, string> = { task: 'Rapport de tâche', mission: 'Rapport de mission', project: 'Rapport projet' };

export default async function ReportPage({ params }: Readonly<{ params: Promise<{ slug: string; id: string }> }>) {
  const { slug, id } = await params;
  const db = getDb();
  const [project] = await db.select().from(projectsTable).where(eq(projectsTable.slug, slug));
  if (!project) notFound();
  const report = await getReport(db, project.id, id);
  if (!report) notFound();

  const author = report.agentId ? allAgents.find((a) => a.id === report.agentId) : undefined;
  const authorName = author?.name ?? (report.kind === 'project' ? 'Manager projet' : 'Système');

  return (
    <div className="flex flex-col gap-5">
      <header className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
        <Link href={`/projects/${slug}`} className="hover:underline" style={{ color: 'var(--accent)' }}>{project.name}</Link>
        <span>/</span>
        <span>Rapports</span>
        {report.missionId && (
          <>
            <span>/</span>
            <Link href={`/missions/${report.missionId}`} className="hover:underline" style={{ color: 'var(--accent)' }}>{report.missionId}</Link>
          </>
        )}
      </header>

      <div className="surface flex items-center gap-3 p-5">
        <AgentAvatar role={report.agentId ?? 'manager'} alt={authorName} status="done" size={44} />
        <div className="flex-1">
          <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>{report.title}</h1>
          <p className="mono text-[11px]" style={{ color: 'var(--text-muted)' }}>
            {KIND_LABEL[report.kind]} · par <span style={{ color: 'var(--accent)' }}>{authorName}</span> · {report.createdAt.toISOString().slice(0, 16).replace('T', ' ')}
          </p>
        </div>
      </div>

      <div className="surface p-5">
        <ReportViewer humanMd={report.humanMd} ai={report.ai} diff={report.diff} />
      </div>
    </div>
  );
}

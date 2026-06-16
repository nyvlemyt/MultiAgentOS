import { getDb, skills } from '@mas/db';

const DOMAIN_COLORS: Record<string, string> = {
  planning: 'var(--accent)',
  memory: '#7c3aed',
  'code-review': '#059669',
  security: '#dc2626',
  ux: '#d97706',
  research: '#0891b2',
  'code-execution': '#6366f1',
  writing: '#db2777',
  search: '#65a30d',
};

export default async function SkillsRegistry({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ domain?: string; q?: string }>;
}>) {
  const { domain, q } = await searchParams;
  const db = getDb();
  let rows = await db.select().from(skills).orderBy(skills.tier, skills.id);

  if (domain) rows = rows.filter((r) => r.domain === domain);
  if (q) {
    const lq = q.toLowerCase();
    rows = rows.filter(
      (r) => r.id.includes(lq) || (r.tagsJson ?? '').includes(lq),
    );
  }

  const allDomains = await db
    .selectDistinct({ domain: skills.domain })
    .from(skills)
    .orderBy(skills.domain);
  const domains = allDomains.map((r) => r.domain).filter(Boolean);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-semibold tracking-tight"
            style={{ color: 'var(--text-primary)' }}
          >
            Registre des compétences
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {rows.length} skill{rows.length === 1 ? '' : 's'} indexed
          </p>
        </div>
        <form method="GET" className="flex gap-2 flex-wrap">
          <input
            name="q"
            defaultValue={q}
            placeholder="Rechercher…"
            className="mono text-xs px-2 py-1 rounded"
            style={{
              background: 'var(--bg-hover)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-subtle)',
            }}
          />
          <select
            name="domain"
            defaultValue={domain ?? ''}
            className="mono text-xs px-2 py-1 rounded"
            style={{
              background: 'var(--bg-hover)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <option value="">Tous les domaines</option>
            {domains.map((d) => (
              <option key={d} value={d ?? ''}>
                {d}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="mono text-xs px-2 py-1 rounded"
            style={{ background: 'var(--accent)', color: '#fff' }}
          >
            Filtrer
          </button>
          {(domain || q) && (
            <a
              href="/skills"
              className="mono text-xs px-2 py-1 rounded"
              style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)' }}
            >
              Clear
            </a>
          )}
        </form>
      </header>

      <div className="surface overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead
            className="text-[10px] uppercase tracking-wider"
            style={{
              color: 'var(--text-muted)',
              background: 'var(--bg-hover)',
            }}
          >
            <tr>
              <th className="px-3 py-2">Skill</th>
              <th className="px-3 py-2">Domain</th>
              <th className="px-3 py-2">Tier</th>
              <th className="px-3 py-2">Tags</th>
              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => (
              <tr
                key={s.id}
                style={{ borderTop: '1px solid var(--border-subtle)' }}
              >
                <td
                  className="px-3 py-2 font-medium mono"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {s.id}
                </td>
                <td className="px-3 py-2">
                  {s.domain && (
                    <span
                      className="mono rounded-sm px-1.5 py-0.5 text-[10px] font-medium"
                      style={{
                        background: (DOMAIN_COLORS[s.domain] ?? '#888') + '20',
                        color: DOMAIN_COLORS[s.domain] ?? '#888',
                      }}
                    >
                      {s.domain}
                    </span>
                  )}
                </td>
                <td className="px-3 py-2">
                  <span
                    className="mono rounded-sm px-1.5 py-0.5 text-[10px]"
                    style={{
                      background: 'var(--bg-hover)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    {s.tier}
                  </span>
                </td>
                <td
                  className="px-3 py-2"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {(JSON.parse(s.tagsJson) as string[]).join(', ')}
                </td>
                <td className="px-3 py-2 text-right">
                  {s.tier === 'pinned' ? (
                    <span
                      className="mono text-[10px]"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      pinned
                    </span>
                  ) : (
                    <form method="POST" action="/api/skills/promote">
                      <input type="hidden" name="id" value={s.id} />
                      <button
                        type="submit"
                        className="mono text-[10px] px-2 py-0.5 rounded"
                        style={{
                          background: 'var(--bg-hover)',
                          color: 'var(--accent)',
                        }}
                      >
                        Épingler
                      </button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <p
            className="px-3 py-6 text-center text-sm"
            style={{ color: 'var(--text-muted)' }}
          >
            No skills found. Run{' '}
            <code className="mono">pnpm skills:reindex</code> to index
            orchestrator skills.
          </p>
        )}
      </div>
    </div>
  );
}

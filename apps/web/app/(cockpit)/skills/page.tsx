import { skillRows } from '@/lib/fixtures';

export default function SkillsRegistry() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>Skills Registry</h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{skillRows.length} skills indexed · auto-summaries arrive in Phase 3</p>
      </header>
      <div className="surface overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)', background: 'var(--bg-hover)' }}>
            <tr>
              <th className="px-3 py-2">Skill</th>
              <th className="px-3 py-2">Tier</th>
              <th className="px-3 py-2">Tags</th>
              <th className="px-3 py-2">Used by</th>
              <th className="px-3 py-2 text-right">Last used</th>
            </tr>
          </thead>
          <tbody>
            {skillRows.map((s, i) => (
              <tr key={s.id} className={i % 2 ? '' : ''} style={{ borderTop: '1px solid var(--border-subtle)' }}>
                <td className="px-3 py-2 font-medium" style={{ color: 'var(--text-primary)' }}>{s.id}</td>
                <td className="px-3 py-2">
                  <span className="mono rounded-sm px-1.5 py-0.5 text-[10px]" style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}>{s.tier}</span>
                </td>
                <td className="px-3 py-2" style={{ color: 'var(--text-secondary)' }}>{s.tags.join(', ')}</td>
                <td className="px-3 py-2" style={{ color: 'var(--text-secondary)' }}>{s.usedBy.join(', ') || '—'}</td>
                <td className="px-3 py-2 text-right mono" style={{ color: 'var(--text-muted)' }}>{s.lastUsed}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

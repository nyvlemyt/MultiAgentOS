import { tierAFixture, tierBFixture } from '@/lib/fixtures';
import { AgentCard } from '@/components/AgentCard';

export default function AgentsGrid() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>Agents</h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{tierAFixture.length} orchestrators · {tierBFixture.length} library agents shown</p>
      </header>
      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Tier A · orchestrators</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {tierAFixture.map((a) => <AgentCard key={a.id} a={a} />)}
        </div>
      </section>
      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Tier B · library (sample)</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {tierBFixture.map((a) => <AgentCard key={a.id} a={a} />)}
        </div>
      </section>
    </div>
  );
}

'use client';
import { useState } from 'react';
import { OrbitView } from '@/components/studio/OrbitView';
import { OrgChartView } from '@/components/studio/OrgChartView';
import { orbitNodes, orbitEdges } from '@/lib/fixtures';

type View = 'orbit' | 'org';

export default function Studio() {
  const [view, setView] = useState<View>('orbit');
  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>Agent Studio</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{orbitNodes.length} agents — orchestrators inside, library outside. Edges are live delegations.</p>
        </div>
        <div className="inline-flex items-center gap-0.5 rounded-md p-0.5 text-[11px] font-medium" style={{ background: 'var(--bg-hover)' }}>
          {(['orbit', 'org'] as View[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className="rounded px-2 py-0.5 capitalize"
              style={{
                background: view === v ? 'var(--accent)' : 'transparent',
                color: view === v ? '#fff' : 'var(--text-secondary)',
              }}
            >
              {v === 'orbit' ? 'Orbit' : 'Org chart'}
            </button>
          ))}
        </div>
      </header>
      <div className="flex justify-center">
        {view === 'orbit' ? (
          <OrbitView nodes={orbitNodes} edges={orbitEdges} size={520} />
        ) : (
          <div className="w-full max-w-3xl">
            <OrgChartView nodes={orbitNodes} />
          </div>
        )}
      </div>
    </div>
  );
}

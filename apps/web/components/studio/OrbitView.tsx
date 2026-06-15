import { AgentAvatar } from '../AgentAvatar';

export interface OrbitNode {
  id: string;
  name: string;
  avatarPath?: string | null;
  tier: 'A' | 'B';
  status: 'idle' | 'running' | 'blocked' | 'waiting' | 'done';
}

export interface OrbitEdge {
  from: string;
  to: string;
  active?: boolean;
}

export function OrbitView({ nodes, edges, size = 520 }: Readonly<{ nodes: OrbitNode[]; edges: OrbitEdge[]; size?: number }>) {
  const cx = size / 2;
  const cy = size / 2;
  const innerR = size * 0.22;
  const outerR = size * 0.4;

  const tierA = nodes.filter((n) => n.tier === 'A');
  const tierB = nodes.filter((n) => n.tier === 'B');

  function place(list: OrbitNode[], radius: number) {
    return list.map((n, i) => {
      const angle = (i / list.length) * Math.PI * 2 - Math.PI / 2;
      return { node: n, x: cx + Math.cos(angle) * radius, y: cy + Math.sin(angle) * radius };
    });
  }

  const placedA = place(tierA, innerR);
  const placedB = place(tierB, outerR);
  const positions = Object.fromEntries([...placedA, ...placedB].map((p) => [p.node.id, p]));

  return (
    <div className="surface relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute inset-0">
        <circle cx={cx} cy={cy} r={innerR} fill="none" stroke="var(--border-subtle)" strokeDasharray="2 4" />
        <circle cx={cx} cy={cy} r={outerR} fill="none" stroke="var(--border-subtle)" strokeDasharray="2 4" />
        {edges.map((e) => {
          const a = positions[e.from];
          const b = positions[e.to];
          if (!a || !b) return null;
          return (
            <line
              key={`${e.from}-${e.to}`}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke={e.active ? 'var(--accent)' : 'var(--border-default)'}
              strokeWidth={1.2}
              className={e.active ? 'orbit-edge' : ''}
            />
          );
        })}
        <circle cx={cx} cy={cy} r={6} fill="var(--accent)" />
      </svg>
      {[...placedA, ...placedB].map((p) => (
        <div
          key={p.node.id}
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: p.x, top: p.y }}
          title={p.node.name}
        >
          <AgentAvatar role={p.node.id} alt={p.node.name} status={p.node.status} size={p.node.tier === 'A' ? 40 : 32} />
        </div>
      ))}
    </div>
  );
}

export interface ActivityRow {
  id: string;
  ts: string;
  action: string;
}

export function ActivityTab({ activity }: Readonly<{ activity: ActivityRow[] }>) {
  if (activity.length === 0) {
    return <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Aucune activité encore.</p>;
  }
  return (
    <ul className="flex flex-col gap-2">
      {activity.map((r) => (
        <li key={r.id} className="flex items-center gap-2 text-[11px]">
          <span className="mono" style={{ color: 'var(--text-muted)' }}>{r.ts}</span>
          <span className="truncate" style={{ color: 'var(--text-secondary)' }}>{r.action}</span>
        </li>
      ))}
    </ul>
  );
}

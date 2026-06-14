export default function MissionsLoading() {
  return (
    <div role="status" aria-label="Loading missions" className="grid grid-cols-3 gap-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="surface h-40 animate-pulse rounded-md" style={{ background: 'var(--bg-hover)' }} />
      ))}
    </div>
  );
}

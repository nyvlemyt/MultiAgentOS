export default function MissionsLoading() {
  return (
    <output aria-label="Loading missions" className="grid grid-cols-3 gap-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="surface h-40 animate-pulse rounded-md" style={{ background: 'var(--bg-hover)' }} />
      ))}
    </output>
  );
}

export default function ProjectsLoading() {
  return (
    <output aria-label="Loading projects" className="flex flex-col gap-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="surface h-20 animate-pulse rounded-md" style={{ background: 'var(--bg-hover)' }} />
      ))}
    </output>
  );
}

'use client';

export default function ProjectsError({ reset }: Readonly<{ error: Error; reset: () => void }>) {
  return (
    <div role="alert" className="surface flex flex-col items-center gap-3 px-6 py-12 text-center">
      <p className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Could not load projects</p>
      <p className="max-w-sm text-sm" style={{ color: 'var(--text-secondary)' }}>Something went wrong reading the project list.</p>
      <button
        type="button"
        onClick={reset}
        className="rounded-md px-3 py-1.5 text-xs font-medium text-white"
        style={{ background: 'var(--accent)' }}
      >
        Retry
      </button>
    </div>
  );
}

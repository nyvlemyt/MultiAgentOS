'use client';

// Shared cockpit error-boundary body. Each route's error.tsx is a thin wrapper
// that supplies a page-specific title (keeps the boundaries uniform and avoids
// duplicated markup across routes — Sonar new-code duplication).
export function ErrorState({
  title,
  hint,
  reset,
}: Readonly<{ title: string; hint?: string; reset: () => void }>) {
  return (
    <div role="alert" className="surface flex flex-col items-center gap-3 px-6 py-12 text-center">
      <p className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</p>
      <p className="max-w-sm text-sm" style={{ color: 'var(--text-secondary)' }}>
        {hint ?? 'Something went wrong loading this view.'}
      </p>
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

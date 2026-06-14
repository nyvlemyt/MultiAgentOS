export interface EmptyStateCta {
  readonly label: string;
  readonly href: string;
}

export function EmptyState({
  title,
  hint,
  cta,
}: Readonly<{ title: string; hint?: string; cta?: EmptyStateCta }>) {
  return (
    <output
      className="surface flex flex-col items-center gap-3 px-6 py-12 text-center"
      style={{ borderColor: 'var(--border-subtle)' }}
    >
      <p className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</p>
      {hint && <p className="max-w-sm text-sm" style={{ color: 'var(--text-secondary)' }}>{hint}</p>}
      {cta && (
        <a
          href={cta.href}
          className="rounded-md px-3 py-1.5 text-xs font-medium text-white"
          style={{ background: 'var(--accent)' }}
        >
          {cta.label}
        </a>
      )}
    </output>
  );
}

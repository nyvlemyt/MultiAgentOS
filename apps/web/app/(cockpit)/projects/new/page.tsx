export default function NewProject() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>Register a project</h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>MultiAgentOS references projects by absolute path. Your code never moves.</p>
      </header>
      <form className="surface flex flex-col gap-4 p-6">
        <Field label="Name" hint="Display name shown in the cockpit.">
          <input type="text" placeholder="OtakuGO_UP" className="input" />
        </Field>
        <Field label="Slug" hint="URL identifier; auto-generated from the name.">
          <input type="text" placeholder="otakugo" className="input" />
        </Field>
        <Field label="Absolute path" hint="Where the project lives on disk.">
          <input type="text" placeholder="/Users/you/Projects/your-project" className="input mono" />
        </Field>
        <Field label="Type">
          <select className="input">
            <option>manga-app</option>
            <option>bot</option>
            <option>business-website</option>
            <option>automation</option>
            <option>other</option>
          </select>
        </Field>
        <Field label="Stack tags" hint="Comma-separated. Auto-detection comes in Phase 3.">
          <input type="text" placeholder="next, ts, tailwind, prisma" className="input" />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Default autonomy">
            <select className="input"><option>manual</option><option>assisted</option><option>autonomous</option><option>autopilot</option></select>
          </Field>
          <Field label="Default mode">
            <select className="input"><option>eco</option><option>standard</option><option>expert</option></select>
          </Field>
        </div>
        <Field label="Monthly budget (€)">
          <input type="number" defaultValue={5} className="input" />
        </Field>
        <div className="flex justify-end gap-2">
          <button type="button" className="rounded-md border px-3 py-1.5 text-xs" style={{ borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}>Cancel</button>
          <button type="button" className="rounded-md px-3 py-1.5 text-xs font-medium text-white" style={{ background: 'var(--accent)' }}>Dry-run index</button>
        </div>
      </form>
      <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
        Phase 0 disables the submit handler. Wiring lands in Phase 1.
      </p>
      <style>{`
        .input { width: 100%; background: var(--bg-base); border: 1px solid var(--border-default); border-radius: 0.5rem; padding: 0.5rem 0.625rem; font-size: 0.8125rem; color: var(--text-primary); }
        .input:focus { outline: 2px solid var(--accent-soft); border-color: var(--accent); }
      `}</style>
    </div>
  );
}

function Field({ label, hint, children }: Readonly<{ label: string; hint?: string; children: React.ReactNode }>) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{label}</span>
      {hint && <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{hint}</span>}
      {children}
    </label>
  );
}

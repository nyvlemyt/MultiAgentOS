import { NextResponse } from 'next/server';
import type { RegisterKind } from '@mas/memory';
import { keeperStore } from '@/lib/memory';

const KINDS = new Set<RegisterKind>(['decisions', 'learnings', 'blockers', 'journal', 'evals']);

function field(form: FormData, name: string): string {
  return ((form.get(name) as string) ?? '').trim();
}

// Hand-add a memory note. keeperStore() carries the Memory Keeper identity, so
// the §8 write-lock is enforced by append() — no other agent can reach this path.
export async function POST(req: Request) {
  const form = await req.formData();
  const kind = form.get('kind') as RegisterKind;
  const projectId = field(form, 'projectId') || '_global';
  const title = field(form, 'title');
  const body = field(form, 'body');
  const links = field(form, 'links')
    .split(/[\s,]+/)
    .filter((l) => l.length > 0);

  if (KINDS.has(kind) && title && body) {
    keeperStore().append(projectId, kind, { title, body, links });
  }
  return NextResponse.redirect(new URL('/memory', req.url), 303);
}

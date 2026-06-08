import { NextResponse } from 'next/server';
import { getDb } from '@mas/db';
import { promoteCandidate, type RegisterKind } from '@mas/memory';
import { keeperStore } from '@/lib/memory';

const KINDS: RegisterKind[] = ['decisions', 'learnings', 'blockers', 'journal', 'evals'];

// Accept a pending candidate → register entry. promoteCandidate enforces the
// Memory Keeper write-lock (CLAUDE.md §8) via keeperStore's writer identity.
export async function POST(req: Request) {
  const form = await req.formData();
  const id = form.get('id') as string;
  const kind = form.get('kind') as RegisterKind;
  const projectId = ((form.get('projectId') as string) ?? '').trim() || '_global';
  if (id && KINDS.includes(kind)) {
    await promoteCandidate(getDb(), id, { projectId, kind }, keeperStore());
  }
  return NextResponse.redirect(new URL('/memory', req.url), 303);
}

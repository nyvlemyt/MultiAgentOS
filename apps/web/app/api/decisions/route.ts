import { NextResponse } from 'next/server';
import { getDb } from '@mas/db';
import { createDecision, listDecisions } from '@/lib/decisions';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const scope = url.searchParams.get('scope') as 'global' | 'project' | null;
  const projectId = url.searchParams.get('projectId') ?? undefined;
  const missionId = url.searchParams.get('missionId') ?? undefined;
  const limitParam = url.searchParams.get('limit');
  const rows = await listDecisions(getDb(), {
    scope: scope ?? undefined,
    projectId,
    missionId,
    limit: limitParam ? Number(limitParam) : undefined,
  });
  return NextResponse.json({ ok: true, decisions: rows });
}

export async function POST(req: Request) {
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  if (typeof b.title !== 'string' || b.title.trim() === '') {
    return NextResponse.json({ ok: false, error: 'title required' }, { status: 400 });
  }
  const projectId = typeof b.projectId === 'string' && b.projectId ? b.projectId : null;
  const decision = await createDecision(getDb(), {
    scope: projectId ? 'project' : 'global',
    projectId,
    source: 'user',
    title: b.title.trim(),
    body: typeof b.body === 'string' ? b.body : undefined,
    sourceMissionId: typeof b.sourceMissionId === 'string' ? b.sourceMissionId : null,
  });
  return NextResponse.json({ ok: true, decision }, { status: 201 });
}

import { NextResponse } from 'next/server';
import { getDb, ideas } from '@mas/db';
import { desc } from 'drizzle-orm';
import { createIdea } from '@/lib/ideas';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const rows = await getDb().select().from(ideas).orderBy(desc(ideas.priorityScore));
  return NextResponse.json({ ok: true, ideas: rows });
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  if (typeof body.title !== 'string' || body.title.trim() === '') {
    return NextResponse.json({ ok: false, error: 'title required' }, { status: 400 });
  }
  const idea = await createIdea(getDb(), {
    title: body.title.trim(),
    body: typeof body.body === 'string' ? body.body : undefined,
    scope: body.scope === 'project' ? 'project' : 'global',
    projectId: typeof body.projectId === 'string' && body.projectId ? body.projectId : null,
    impact: typeof body.impact === 'number' ? body.impact : undefined,
    urgency: typeof body.urgency === 'number' ? body.urgency : undefined,
    effortEst: typeof body.effortEst === 'number' ? body.effortEst : undefined,
    riskScore: typeof body.riskScore === 'number' ? body.riskScore : undefined,
    costEstTokens: typeof body.costEstTokens === 'number' ? body.costEstTokens : undefined,
    sourceDossier: typeof body.sourceDossier === 'string' ? body.sourceDossier : null,
  });
  return NextResponse.json({ ok: true, idea }, { status: 201 });
}

import { NextResponse } from 'next/server';
import { getDb } from '@mas/db';
import { moveIdea, IDEA_STATUSES, type IdeaStatus } from '@/lib/ideas';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = (await req.json().catch(() => ({}))) as { status?: string };
  if (!body.status || !IDEA_STATUSES.includes(body.status as IdeaStatus)) {
    return NextResponse.json({ ok: false, error: 'invalid status' }, { status: 400 });
  }
  const idea = await moveIdea(getDb(), id, body.status as IdeaStatus);
  if (!idea) return NextResponse.json({ ok: false, error: 'not found' }, { status: 404 });
  return NextResponse.json({ ok: true, idea });
}

import { NextResponse } from 'next/server';
import { getDb } from '@mas/db';
import { setMissionPriority } from '@/lib/missions';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const b = (await req.json().catch(() => ({}))) as { priorityScore?: number };
  if (typeof b.priorityScore !== 'number') {
    return NextResponse.json({ ok: false, error: 'priorityScore required' }, { status: 400 });
  }
  const mission = await setMissionPriority(getDb(), id, b.priorityScore);
  if (!mission) return NextResponse.json({ ok: false, error: 'not found' }, { status: 404 });
  return NextResponse.json({ ok: true, priorityScore: mission.priorityScore });
}

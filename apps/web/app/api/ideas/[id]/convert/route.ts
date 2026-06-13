import { NextResponse } from 'next/server';
import { getDb } from '@mas/db';
import { convertIdeaToMission } from '@/lib/ideas';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { mission, created } = await convertIdeaToMission(getDb(), id);
    return NextResponse.json({ ok: true, missionId: mission.id, created });
  } catch (err) {
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 400 });
  }
}

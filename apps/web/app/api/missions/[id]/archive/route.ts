import { NextResponse } from 'next/server';
import { archiveMission } from '@mas/agents';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const m = await archiveMission(id);
    return NextResponse.json({ ok: true, mission: m });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}

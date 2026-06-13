import { NextResponse } from 'next/server';
import { getDb } from '@mas/db';
import { updateIdeaScores } from '@/lib/ideas';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const num = (v: unknown, d: number) => (typeof v === 'number' ? v : d);

// PATCH the 0–100 sliders; priorityScore is recomputed deterministically.
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const idea = await updateIdeaScores(getDb(), id, {
    impact: num(b.impact, 50),
    urgency: num(b.urgency, 50),
    effortEst: num(b.effortEst, 50),
    riskScore: num(b.riskScore, 0),
  });
  if (!idea) return NextResponse.json({ ok: false, error: 'not found' }, { status: 404 });
  return NextResponse.json({ ok: true, idea });
}

import { NextResponse } from 'next/server';
import { getDb, missions } from '@mas/db';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Set/clear a mission's deadline + milestone. Deterministic; no LLM.
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const b = (await req.json().catch(() => ({}))) as { deadline?: string | null; milestone?: string | null };
  const patch: { deadline?: Date | null; milestone?: string | null; updatedAt: Date } = { updatedAt: new Date() };
  if ('deadline' in b) {
    patch.deadline = b.deadline ? new Date(b.deadline) : null;
    if (patch.deadline && Number.isNaN(patch.deadline.getTime())) {
      return NextResponse.json({ ok: false, error: 'invalid deadline' }, { status: 400 });
    }
  }
  if ('milestone' in b) patch.milestone = b.milestone ? String(b.milestone) : null;

  const [updated] = await getDb().update(missions).set(patch).where(eq(missions.id, id)).returning();
  if (!updated) return NextResponse.json({ ok: false, error: 'not found' }, { status: 404 });
  return NextResponse.json({ ok: true, mission: updated });
}

import { NextResponse } from 'next/server';
import { getDb, missions } from '@mas/db';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Kanban drag-and-drop only allows moves between these early columns.
const ALLOWED = new Set(['draft', 'clarified', 'planned']);

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = (await req.json().catch(() => ({}))) as { status?: string };
  if (!body.status || !ALLOWED.has(body.status)) {
    return NextResponse.json({ ok: false, error: 'status not allowed via kanban drag' }, { status: 400 });
  }
  const db = getDb();
  const [updated] = await db
    .update(missions)
    .set({ status: body.status as 'draft' | 'clarified' | 'planned', updatedAt: new Date() })
    .where(eq(missions.id, id))
    .returning();
  return NextResponse.json({ ok: true, mission: updated });
}
